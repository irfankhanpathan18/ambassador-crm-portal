const bcrypt = require('bcryptjs');
const db = require('./db');

function seedDatabase() {
  console.log('Seeding NxtWave Ambassador CRM Database...');

  // Clear existing data cleanly
  db.prepare('DELETE FROM registrations').run();
  db.prepare('DELETE FROM ambassadors').run();
  db.prepare('DELETE FROM users').run();

  // Reset sqlite autoincrement sequences
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('users', 'ambassadors', 'registrations')").run();

  const passwordHash = bcrypt.hashSync('admin123', 10);
  const ambPasswordHash = bcrypt.hashSync('ambassador123', 10);

  // 1. Create Admin User
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'Admin User',
    'admin@nxtwave.in',
    passwordHash,
    'ADMIN',
    'ACTIVE',
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  );

  // 2. 20 Realistic Ambassadors
  const ambassadorRawData = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', college: 'ABC College of Engineering', referral_code: 'RAHUL123', targetCount: 82 },
    { name: 'Priya Patil', email: 'priya@example.com', college: 'XYZ Institute of Technology', referral_code: 'PRIYA456', targetCount: 71 },
    { name: 'Aman Khan', email: 'aman@example.com', college: 'PQR National Institute', referral_code: 'AMAN789', targetCount: 64 },
    { name: 'Irfan Pathan', email: 'irfan@example.com', college: 'Delhi Technological University', referral_code: 'IRFAN123', targetCount: 42 },
    { name: 'Sneha Reddy', email: 'sneha@example.com', college: 'Osmania University Hyderabad', referral_code: 'SNEHA202', targetCount: 38 },
    { name: 'Vikram Verma', email: 'vikram@example.com', college: 'BITS Pilani Rajasthan', referral_code: 'VIKRAM303', targetCount: 34 },
    { name: 'Ananya Roy', email: 'ananya@example.com', college: 'IIT Bombay Powai', referral_code: 'ANANYA404', targetCount: 29 },
    { name: 'Arjun Mehta', email: 'arjun@example.com', college: 'VIT Vellore Tamil Nadu', referral_code: 'ARJUN505', targetCount: 26 },
    { name: 'Kavya Nair', email: 'kavya@example.com', college: 'SRM Institute Chennai', referral_code: 'KAVYA606', targetCount: 23 },
    { name: 'Rohan Gupta', email: 'rohan@example.com', college: 'RV College of Engineering Bangalore', referral_code: 'ROHAN707', targetCount: 21 },
    { name: 'Pooja Joshi', email: 'pooja@example.com', college: 'Pune Institute of Computer Technology', referral_code: 'POOJA808', targetCount: 18 },
    { name: 'Siddharth Malhotra', email: 'siddharth@example.com', college: 'JNTU College of Engineering Hyderabad', referral_code: 'SIDD909', targetCount: 16 },
    { name: 'Neha Singh', email: 'neha@example.com', college: 'HBTU Kanpur Uttar Pradesh', referral_code: 'NEHA111', targetCount: 14 },
    { name: 'Aditya Rao', email: 'aditya@example.com', college: 'BMS College of Engineering Bangalore', referral_code: 'ADITYA222', targetCount: 12 },
    { name: 'Ritu Saxena', email: 'ritu@example.com', college: 'SRMCEM Lucknow', referral_code: 'RITU333', targetCount: 10 },
    { name: 'Devendra Kumar', email: 'devendra@example.com', college: 'MNIT Jaipur Rajasthan', referral_code: 'DEV444', targetCount: 9 },
    { name: 'Meera Pillai', email: 'meera@example.com', college: 'Model Engineering College Kochi', referral_code: 'MEERA555', targetCount: 7 },
    { name: 'Yash Patel', email: 'yash@example.com', college: 'Nirma University Ahmedabad', referral_code: 'YASH666', targetCount: 5 },
    { name: 'Tanvi Bhat', email: 'tanvi@example.com', college: 'PES University Bangalore', referral_code: 'TANVI777', targetCount: 4 },
    { name: 'Suresh Kumar', email: 'suresh@example.com', college: 'PSG College of Technology Coimbatore', referral_code: 'SURESH888', targetCount: 3 }
  ];

  const insertAmbassador = db.prepare(`
    INSERT INTO ambassadors (user_id, college, referral_code, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const createdAmbassadors = [];

  for (let i = 0; i < ambassadorRawData.length; i++) {
    const amb = ambassadorRawData[i];
    const ambCreatedAt = new Date(Date.now() - (75 - i * 2) * 24 * 60 * 60 * 1000).toISOString();

    // Status is active for all except 2 deactivated for realistic admin testing
    const status = i === 18 || i === 19 ? 'INACTIVE' : 'ACTIVE';

    const userRes = insertUser.run(
      amb.name,
      amb.email,
      ambPasswordHash,
      'AMBASSADOR',
      status,
      ambCreatedAt
    );

    const ambRes = insertAmbassador.run(
      userRes.lastInsertRowid,
      amb.college,
      amb.referral_code,
      ambCreatedAt
    );

    createdAmbassadors.push({
      id: ambRes.lastInsertRowid,
      userId: userRes.lastInsertRowid,
      name: amb.name,
      email: amb.email,
      college: amb.college,
      referral_code: amb.referral_code,
      targetCount: amb.targetCount
    });
  }

  // 3. Generate 528 Realistic Student Registrations
  const firstNames = [
    'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advait', 'Kabir', 'Anaya', 'Ishaan', 'Aanya',
    'Reyansh', 'Shaurya', 'Atharv', 'Ojas', 'Saanvi', 'Pranav', 'Aditi', 'Riya', 'Kavya', 'Tanya',
    'Dhruv', 'Siddharth', 'Tanvi', 'Aryan', 'Kiran', 'Nikhil', 'Gautam', 'Deepak', 'Bhavya', 'Manish',
    'Akash', 'Shruti', 'Varun', 'Tarun', 'Harsh', 'Mohit', 'Kunal', 'Dev', 'Sameer', 'Pankaj',
    'Yash', 'Rohan', 'Karthik', 'Sanjay', 'Suraj', 'Vikram', 'Nitin', 'Alok', 'Abhishek', 'Rajesh'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Rao', 'Nair', 'Singh', 'Kumar', 'Joshi',
    'Mehta', 'Khan', 'Roy', 'Pillai', 'Saxena', 'Bhat', 'Pathan', 'Chaudhary', 'Deshmukh', 'Kulkarni',
    'Agarwal', 'Bhasin', 'Chatterjee', 'Dutta', 'Ganguly', 'Iyer', 'Jha', 'Kapoor', 'Mathur', 'Pandey'
  ];

  const collegesList = [
    'IIT Bombay', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore', 'SRMCEM Lucknow',
    'Osmania University', 'JNTU Hyderabad', 'SRM Chennai', 'Delhi Technological University',
    'RV College of Engineering Bangalore', 'BMS College of Engineering', 'Pune Institute of Computer Technology',
    'MNIT Jaipur', 'Nirma University', 'PES University Bangalore', 'PSG College Coimbatore',
    'Anna University Chennai', 'Chitkara University Punjab', 'Manipal Institute of Technology', 'Kalinga Institute Bhubaneswar'
  ];

  const citiesList = [
    'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai',
    'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad', 'Coimbatore', 'Chandigarh',
    'Bhopal', 'Indore', 'Patna', 'Visakhapatnam', 'Kochi', 'Nagpur'
  ];

  const coursesList = [
    'B.Tech Computer Science & Engineering',
    'B.Tech Electronics & Communication',
    'B.Tech Information Technology',
    'BCA (Bachelor of Computer Applications)',
    'B.Sc Computer Science',
    'Data Science & AI',
    'B.Tech Mechanical Engineering',
    'MCA (Master of Computer Applications)'
  ];

  const yearsList = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const insertRegistration = db.prepare(`
    INSERT INTO registrations (registration_id, name, email, phone, college, city, course, year, ambassador_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let regCountCounter = 1;
  const usedEmails = new Set();
  const usedPhones = new Set();

  const now = Date.now();
  const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;

  for (const amb of createdAmbassadors) {
    for (let c = 0; c < amb.targetCount; c++) {
      let firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      let fullName = `${firstName} ${lastName}`;

      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${regCountCounter}@gmail.com`;
      while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${regCountCounter}_${Math.floor(Math.random() * 1000)}@gmail.com`;
      }
      usedEmails.add(email);

      let phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      while (usedPhones.has(phone)) {
        phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      }
      usedPhones.add(phone);

      const college = Math.random() > 0.4 ? amb.college : collegesList[Math.floor(Math.random() * collegesList.length)];
      const city = citiesList[Math.floor(Math.random() * citiesList.length)];
      const course = coursesList[Math.floor(Math.random() * coursesList.length)];
      const year = yearsList[Math.floor(Math.random() * yearsList.length)];

      const regIdFormatted = `NXT-${String(regCountCounter).padStart(6, '0')}`;

      // Distribute creation date across past 60 days with higher density in recent days
      const daysAgo = Math.pow(Math.random(), 1.5) * 60;
      const regCreatedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      insertRegistration.run(
        regIdFormatted,
        fullName,
        email,
        phone,
        college,
        city,
        course,
        year,
        amb.id,
        regCreatedAt,
        regCreatedAt
      );

      regCountCounter++;
    }
  }

  const totalRegs = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
  const totalAmbs = db.prepare('SELECT COUNT(*) as count FROM ambassadors').get().count;

  console.log(`Database seeded successfully! Total Ambassadors: ${totalAmbs}, Total Registrations: ${totalRegs}`);
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
