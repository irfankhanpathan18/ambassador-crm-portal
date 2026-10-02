const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const seedDatabase = require('./seed');
const { JWT_SECRET, verifyToken, requireAdmin, requireAmbassador } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auto-seed database if empty on startup
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  seedDatabase();
}

// ----------------------------------------------------
// PUBLIC AUTH ENDPOINTS
// ----------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'INACTIVE') {
    return res.status(403).json({ error: 'Account is deactivated. Please contact admin.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  let ambassadorDetails = null;
  if (user.role === 'AMBASSADOR') {
    ambassadorDetails = db.prepare('SELECT id, college, referral_code FROM ambassadors WHERE user_id = ?').get(user.id);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      ambassador: ambassadorDetails
    }
  });
});

// GET /api/auth/me
app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// ----------------------------------------------------
// PUBLIC STUDENT REGISTRATION ENDPOINT
// ----------------------------------------------------

// POST /api/registrations (Public registration)
app.post('/api/registrations', (req, res) => {
  const { name, email, phone, college, city, course, year, referral_code } = req.body;

  // Validation
  if (!name || !email || !phone || !college || !city || !course || !year || !referral_code) {
    return res.status(400).json({ error: 'All registration fields are required, including referral code' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone.trim();
  const code = referral_code.trim().toUpperCase();

  // 1. Check for Duplicate Registration (Email OR Phone)
  const existingEmail = db.prepare('SELECT id FROM registrations WHERE email = ?').get(trimmedEmail);
  const existingPhone = db.prepare('SELECT id FROM registrations WHERE phone = ?').get(trimmedPhone);

  if (existingEmail || existingPhone) {
    return res.status(400).json({ error: 'This email or phone number is already registered.' });
  }

  // 2. Validate Referral Code
  const ambassador = db.prepare(`
    SELECT a.id, a.user_id, u.status 
    FROM ambassadors a
    JOIN users u ON a.user_id = u.id
    WHERE UPPER(a.referral_code) = ?
  `).get(code);

  if (!ambassador) {
    return res.status(400).json({ error: 'Invalid referral code provided.' });
  }

  if (ambassador.status === 'INACTIVE') {
    return res.status(400).json({ error: 'This ambassador referral code is currently inactive.' });
  }

  // 3. Generate Next Registration ID (e.g., NXT-000529)
  const maxRow = db.prepare("SELECT MAX(id) as maxId FROM registrations").get();
  const nextNumber = (maxRow && maxRow.maxId ? maxRow.maxId : 0) + 1;
  const registrationId = `NXT-${String(nextNumber).padStart(6, '0')}`;

  const nowIso = new Date().toISOString();

  // 4. Insert Registration
  const insertStmt = db.prepare(`
    INSERT INTO registrations (registration_id, name, email, phone, college, city, course, year, ambassador_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    registrationId,
    name.trim(),
    trimmedEmail,
    trimmedPhone,
    college.trim(),
    city.trim(),
    course.trim(),
    year.trim(),
    ambassador.id,
    nowIso,
    nowIso
  );

  return res.status(201).json({
    message: 'Registration successful!',
    registration_id: registrationId
  });
});

// ----------------------------------------------------
// ADMIN ENDPOINTS
// ----------------------------------------------------

// GET /api/admin/dashboard
app.get('/api/admin/dashboard', verifyToken, requireAdmin, (req, res) => {
  const { trendPeriod } = req.query; // 'day', 'week', 'month'

  const totalRegistrations = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
  const totalAmbassadors = db.prepare('SELECT COUNT(*) as count FROM ambassadors').get().count;

  // Top Ambassadors (Operational Leaderboard based on registration count)
  const topAmbassadors = db.prepare(`
    SELECT 
      a.id,
      u.name,
      a.college,
      a.referral_code,
      COUNT(r.id) as total_registrations
    FROM ambassadors a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN registrations r ON a.id = r.ambassador_id
    GROUP BY a.id
    ORDER BY total_registrations DESC
    LIMIT 10
  `).all();

  // Registration Trend calculation
  let dateFormat = "%Y-%m-%d"; // default day
  if (trendPeriod === 'week') {
    dateFormat = "%Y-%W";
  } else if (trendPeriod === 'month') {
    dateFormat = "%Y-%m";
  }

  const trendData = db.prepare(`
    SELECT 
      strftime('${dateFormat}', created_at) as period,
      COUNT(id) as count
    FROM registrations
    GROUP BY period
    ORDER BY period ASC
    LIMIT 30
  `).all();

  res.json({
    totalRegistrations,
    totalAmbassadors,
    topAmbassadors,
    trend: trendData
  });
});

// GET /api/ambassadors (Admin View Ambassadors)
app.get('/api/ambassadors', verifyToken, requireAdmin, (req, res) => {
  const { search, status } = req.query;

  let query = `
    SELECT 
      a.id,
      a.user_id,
      u.name,
      u.email,
      u.status,
      a.college,
      a.referral_code,
      a.created_at,
      COUNT(r.id) as total_registrations
    FROM ambassadors a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN registrations r ON a.id = r.ambassador_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (u.name LIKE ? OR u.email LIKE ? OR a.college LIKE ? OR a.referral_code LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (status) {
    query += ` AND u.status = ?`;
    params.push(status);
  }

  query += ` GROUP BY a.id ORDER BY total_registrations DESC`;

  const ambassadors = db.prepare(query).all(...params);
  res.json({ ambassadors });
});

// POST /api/ambassadors (Admin Create Ambassador)
app.post('/api/ambassadors', verifyToken, requireAdmin, (req, res) => {
  const { name, email, college, referral_code, password } = req.body;

  if (!name || !email || !college) {
    return res.status(400).json({ error: 'Name, email and college are required' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Check if user email already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  // Generate unique referral code if not provided
  let code = referral_code ? referral_code.trim().toUpperCase() : '';
  if (!code) {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    code = `${cleanName}${Math.floor(100 + Math.random() * 900)}`;
  }

  const existingCode = db.prepare('SELECT id FROM ambassadors WHERE UPPER(referral_code) = ?').get(code);
  if (existingCode) {
    return res.status(400).json({ error: 'Referral code is already taken. Please choose another.' });
  }

  const pwd = password || 'ambassador123';
  const passwordHash = bcrypt.hashSync(pwd, 10);
  const nowIso = new Date().toISOString();

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, status, created_at)
    VALUES (?, ?, ?, 'AMBASSADOR', 'ACTIVE', ?)
  `);
  const userResult = insertUser.run(name.trim(), trimmedEmail, passwordHash, nowIso);

  const insertAmbassador = db.prepare(`
    INSERT INTO ambassadors (user_id, college, referral_code, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const ambResult = insertAmbassador.run(userResult.lastInsertRowid, college.trim(), code, nowIso);

  res.status(201).json({
    message: 'Ambassador created successfully',
    ambassador: {
      id: ambResult.lastInsertRowid,
      user_id: userResult.lastInsertRowid,
      name: name.trim(),
      email: trimmedEmail,
      college: college.trim(),
      referral_code: code,
      status: 'ACTIVE',
      total_registrations: 0,
      created_at: nowIso
    }
  });
});

// GET /api/ambassadors/:id (Admin View Single Ambassador)
app.get('/api/ambassadors/:id', verifyToken, requireAdmin, (req, res) => {
  const ambassador = db.prepare(`
    SELECT 
      a.id,
      a.user_id,
      u.name,
      u.email,
      u.status,
      a.college,
      a.referral_code,
      a.created_at,
      COUNT(r.id) as total_registrations
    FROM ambassadors a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN registrations r ON a.id = r.ambassador_id
    WHERE a.id = ?
    GROUP BY a.id
  `).get(req.params.id);

  if (!ambassador) {
    return res.status(404).json({ error: 'Ambassador not found' });
  }

  const recentRegistrations = db.prepare(`
    SELECT id, registration_id, name, email, college, city, course, year, created_at
    FROM registrations
    WHERE ambassador_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(req.params.id);

  res.json({ ambassador, recentRegistrations });
});

// PUT /api/ambassadors/:id (Admin Edit Ambassador)
app.put('/api/ambassadors/:id', verifyToken, requireAdmin, (req, res) => {
  const { name, email, college } = req.body;

  const ambassador = db.prepare('SELECT * FROM ambassadors WHERE id = ?').get(req.params.id);
  if (!ambassador) {
    return res.status(404).json({ error: 'Ambassador not found' });
  }

  if (name) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), ambassador.user_id);
  }
  if (email) {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(trimmedEmail, ambassador.user_id);
    if (existing) {
      return res.status(400).json({ error: 'Email already used by another user' });
    }
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(trimmedEmail, ambassador.user_id);
  }
  if (college) {
    db.prepare('UPDATE ambassadors SET college = ? WHERE id = ?').run(college.trim(), ambassador.id);
  }

  res.json({ message: 'Ambassador updated successfully' });
});

// PATCH /api/ambassadors/:id/status (Admin Activate/Deactivate Ambassador)
app.patch('/api/ambassadors/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ACTIVE or INACTIVE' });
  }

  const ambassador = db.prepare('SELECT user_id FROM ambassadors WHERE id = ?').get(req.params.id);
  if (!ambassador) {
    return res.status(404).json({ error: 'Ambassador not found' });
  }

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, ambassador.user_id);
  res.json({ message: `Ambassador status updated to ${status}` });
});

// GET /api/registrations (Admin View & Filter Registrations with Server-side Pagination)
app.get('/api/registrations', verifyToken, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const offset = (page - 1) * limit;

  const { search, ambassador_id, college, city, course, year, date_from, date_to, sort_by, order } = req.query;

  let baseQuery = `
    FROM registrations r
    JOIN ambassadors a ON r.ambassador_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    baseQuery += ` AND (r.registration_id LIKE ? OR r.name LIKE ? OR r.email LIKE ? OR r.phone LIKE ? OR r.college LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term, term);
  }

  if (ambassador_id) {
    baseQuery += ` AND r.ambassador_id = ?`;
    params.push(ambassador_id);
  }

  if (college) {
    baseQuery += ` AND r.college = ?`;
    params.push(college);
  }

  if (city) {
    baseQuery += ` AND r.city = ?`;
    params.push(city);
  }

  if (course) {
    baseQuery += ` AND r.course = ?`;
    params.push(course);
  }

  if (year) {
    baseQuery += ` AND r.year = ?`;
    params.push(year);
  }

  if (date_from) {
    baseQuery += ` AND r.created_at >= ?`;
    params.push(date_from);
  }

  if (date_to) {
    baseQuery += ` AND r.created_at <= ?`;
    params.push(date_to);
  }

  // Count total matching registrations
  const countRow = db.prepare(`SELECT COUNT(r.id) as total ${baseQuery}`).get(...params);
  const total = countRow ? countRow.total : 0;

  // Sorting
  let sortColumn = 'r.created_at';
  if (sort_by === 'name') sortColumn = 'r.name';
  if (sort_by === 'registration_id') sortColumn = 'r.registration_id';
  if (sort_by === 'college') sortColumn = 'r.college';

  const sortOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const selectQuery = `
    SELECT 
      r.id,
      r.registration_id,
      r.name,
      r.email,
      r.phone,
      r.college,
      r.city,
      r.course,
      r.year,
      r.created_at,
      u.name as ambassador_name,
      a.referral_code,
      a.id as ambassador_id
    ${baseQuery}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const data = db.prepare(selectQuery).all(...params, limit, offset);

  // Distinct values for filters dropdowns
  const distinctColleges = db.prepare('SELECT DISTINCT college FROM registrations ORDER BY college ASC').all().map(c => c.college);
  const distinctCities = db.prepare('SELECT DISTINCT city FROM registrations ORDER BY city ASC').all().map(c => c.city);
  const distinctCourses = db.prepare('SELECT DISTINCT course FROM registrations ORDER BY course ASC').all().map(c => c.course);
  const distinctYears = db.prepare('SELECT DISTINCT year FROM registrations ORDER BY year ASC').all().map(y => y.year);
  const filterAmbassadors = db.prepare('SELECT a.id, u.name, a.referral_code FROM ambassadors a JOIN users u ON a.user_id = u.id ORDER BY u.name ASC').all();

  res.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    filterOptions: {
      colleges: distinctColleges,
      cities: distinctCities,
      courses: distinctCourses,
      years: distinctYears,
      ambassadors: filterAmbassadors
    }
  });
});

// GET /api/registrations/export (Admin CSV Export)
app.get('/api/registrations/export', verifyToken, requireAdmin, (req, res) => {
  const { search, ambassador_id, college, city, course, year } = req.query;

  let query = `
    SELECT 
      r.registration_id,
      r.name,
      r.email,
      r.phone,
      r.college,
      r.city,
      r.course,
      r.year,
      u.name as ambassador_name,
      a.referral_code,
      r.created_at
    FROM registrations r
    JOIN ambassadors a ON r.ambassador_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (r.registration_id LIKE ? OR r.name LIKE ? OR r.email LIKE ? OR r.phone LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (ambassador_id) {
    query += ` AND r.ambassador_id = ?`;
    params.push(ambassador_id);
  }
  if (college) {
    query += ` AND r.college = ?`;
    params.push(college);
  }
  if (city) {
    query += ` AND r.city = ?`;
    params.push(city);
  }

  query += ` ORDER BY r.created_at DESC`;

  const rows = db.prepare(query).all(...params);

  // CSV Generation
  const headers = ['Registration ID', 'Name', 'Email', 'Phone', 'College', 'City', 'Course', 'Year', 'Ambassador', 'Referral Code', 'Registration Date'];
  
  function escapeCsv(str) {
    if (!str) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  }

  let csvContent = headers.join(',') + '\n';
  rows.forEach(r => {
    const line = [
      escapeCsv(r.registration_id),
      escapeCsv(r.name),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.college),
      escapeCsv(r.city),
      escapeCsv(r.course),
      escapeCsv(r.year),
      escapeCsv(r.ambassador_name),
      escapeCsv(r.referral_code),
      escapeCsv(new Date(r.created_at).toLocaleString())
    ].join(',');
    csvContent += line + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="nxtwave_registrations_${Date.now()}.csv"`);
  res.status(200).send(csvContent);
});

// GET /api/registrations/:id (Admin View Single Registration Details)
app.get('/api/registrations/:id', verifyToken, requireAdmin, (req, res) => {
  const reg = db.prepare(`
    SELECT 
      r.id,
      r.registration_id,
      r.name,
      r.email,
      r.phone,
      r.college,
      r.city,
      r.course,
      r.year,
      r.created_at,
      u.name as ambassador_name,
      u.email as ambassador_email,
      a.referral_code,
      a.college as ambassador_college,
      a.id as ambassador_id
    FROM registrations r
    JOIN ambassadors a ON r.ambassador_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE r.id = ? OR r.registration_id = ?
  `).get(req.params.id, req.params.id);

  if (!reg) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  res.json({ registration: reg });
});

// ----------------------------------------------------
// AMBASSADOR SPECIFIC ENDPOINTS
// ----------------------------------------------------

// GET /api/ambassadors/me/dashboard
app.get('/api/ambassadors/me/dashboard', verifyToken, requireAmbassador, (req, res) => {
  const ambId = req.user.ambassadorId;

  const countRow = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE ambassador_id = ?').get(ambId);
  const myRegistrationsCount = countRow ? countRow.count : 0;

  const recentRegistrations = db.prepare(`
    SELECT registration_id, name, college, created_at
    FROM registrations
    WHERE ambassador_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `).all(ambId);

  res.json({
    myRegistrationsCount,
    referralCode: req.user.referralCode,
    referralLink: `${req.protocol}://${req.get('host').replace(':5000', ':5173')}/register?ref=${req.user.referralCode}`,
    recentRegistrations
  });
});

// GET /api/ambassadors/me/registrations
app.get('/api/ambassadors/me/registrations', verifyToken, requireAmbassador, (req, res) => {
  const ambId = req.user.ambassadorId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search;

  let query = `FROM registrations WHERE ambassador_id = ?`;
  const params = [ambId];

  if (search) {
    query += ` AND (registration_id LIKE ? OR name LIKE ? OR email LIKE ? OR college LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  const total = db.prepare(`SELECT COUNT(*) as total ${query}`).get(...params).total;

  const registrations = db.prepare(`
    SELECT registration_id, name, email, phone, college, city, course, year, created_at
    ${query}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({
    registrations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// ----------------------------------------------------
// SHARED ENDPOINTS (ADMIN & AMBASSADOR)
// ----------------------------------------------------

// GET /api/leaderboard
app.get('/api/leaderboard', verifyToken, (req, res) => {
  const period = req.query.period || 'all'; // 'all', 'month', 'week'

  let dateFilter = '';
  if (period === 'month') {
    dateFilter = "AND r.created_at >= date('now', 'start of month')";
  } else if (period === 'week') {
    dateFilter = "AND r.created_at >= date('now', '-7 days')";
  }

  const sql = `
    SELECT 
      a.id,
      u.name as ambassador_name,
      a.college,
      a.referral_code,
      COUNT(r.id) as total_registrations
    FROM ambassadors a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN registrations r ON a.id = r.ambassador_id ${dateFilter}
    WHERE u.status = 'ACTIVE'
    GROUP BY a.id
    ORDER BY total_registrations DESC, u.name ASC
  `;

  const leaderboard = db.prepare(sql).all().map((item, idx) => ({
    rank: idx + 1,
    ...item
  }));

  res.json({ period, leaderboard });
});

// GET /api/reports (Admin Analytics & Charts)
app.get('/api/reports', verifyToken, requireAdmin, (req, res) => {
  const totalRegistrations = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
  const totalAmbassadors = db.prepare('SELECT COUNT(*) as count FROM ambassadors').get().count;

  const avgRegistrationsPerAmbassador = totalAmbassadors > 0 
    ? parseFloat((totalRegistrations / totalAmbassadors).toFixed(1)) 
    : 0;

  // Calculate registration growth (this month vs last month)
  const thisMonthCount = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE created_at >= date('now', 'start of month')").get().count;
  const lastMonthCount = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE created_at >= date('now', 'start of month', '-1 month') AND created_at < date('now', 'start of month')").get().count;

  let growthRate = 0;
  if (lastMonthCount > 0) {
    growthRate = parseFloat((((thisMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1));
  } else if (thisMonthCount > 0) {
    growthRate = 100;
  }

  // 1. Registrations over time
  const registrationsOverTime = db.prepare(`
    SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(id) as count
    FROM registrations
    GROUP BY date
    ORDER BY date ASC
    LIMIT 30
  `).all();

  // 2. Registrations by ambassador
  const registrationsByAmbassador = db.prepare(`
    SELECT u.name as ambassador_name, COUNT(r.id) as count
    FROM ambassadors a
    JOIN users u ON a.user_id = u.id
    JOIN registrations r ON a.id = r.ambassador_id
    GROUP BY a.id
    ORDER BY count DESC
    LIMIT 10
  `).all();

  // 3. Registrations by college
  const registrationsByCollege = db.prepare(`
    SELECT college, COUNT(id) as count
    FROM registrations
    GROUP BY college
    ORDER BY count DESC
    LIMIT 10
  `).all();

  res.json({
    metrics: {
      totalRegistrations,
      totalAmbassadors,
      avgRegistrationsPerAmbassador,
      growthRate,
      thisMonthCount
    },
    charts: {
      overTime: registrationsOverTime,
      byAmbassador: registrationsByAmbassador,
      byCollege: registrationsByCollege
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
