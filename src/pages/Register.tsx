import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { Sparkles, CheckCircle2, AlertCircle, Building2, User, Mail, Phone, MapPin, BookOpen, Calendar, Tag, ArrowLeft, PlayCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRefCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    city: '',
    course: 'B.Tech Computer Science & Engineering',
    year: '1st Year',
    referral_code: initialRefCode
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ registration_id: string } | null>(null);

  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      setFormData(prev => ({ ...prev, referral_code: refFromUrl.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'referral_code' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic frontend validations
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }
    if (!formData.college.trim()) {
      setError('Please enter your college or university name.');
      return;
    }
    if (!formData.city.trim()) {
      setError('Please enter your city.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(getApiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccessData({ registration_id: data.registration_id });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      college: '',
      city: '',
      course: 'B.Tech Computer Science & Engineering',
      year: '1st Year',
      referral_code: initialRefCode
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 my-6">
        {/* Top Header Banner - Workshop Branding */}
        <div className="p-8 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-black text-xl text-white shadow-lg">
                N
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">NxtWave</span>
            </div>
            <Link to="/login" className="text-xs font-semibold text-cyan-200 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>CRM Login</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-400/30 px-3 py-1 rounded-full text-xs font-bold text-cyan-300 mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>FREE ONLINE WORKSHOP</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            “Build Your First AI Project in 60 Minutes”
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-3 leading-relaxed max-w-xl">
            Join this free online workshop and learn how to build your first AI project in just 60 minutes. No prior AI experience is required.
          </p>

          {formData.referral_code && (
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-300 backdrop-blur-xs">
              <span>Referral Code Applied: <strong>{formData.referral_code}</strong></span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8">
          {successData ? (
            /* Registration Success Screen */
            <div className="text-center py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Registration Successful! 🎉
              </h2>

              <p className="text-sm text-slate-600 mt-3 font-medium max-w-md mx-auto leading-relaxed">
                You have successfully registered for:
              </p>
              <p className="text-base font-extrabold text-blue-700 mt-1">
                “Build Your First AI Project in 60 Minutes”
              </p>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                We’ll share the workshop details with you soon.
              </p>

              <div className="my-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registration ID</p>
                <p className="text-2xl font-black text-blue-600 mt-1 tracking-wider font-mono">
                  {successData.registration_id}
                </p>
              </div>

              <button
                onClick={resetForm}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
              >
                Register Another Student
              </button>
            </div>
          ) : (
            /* Student Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* 2. Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* 4. City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Hyderabad"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* 5. College / University Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    College / University Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="e.g. ABC College of Engineering"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* 6. Branch / Course */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Branch / Course <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    >
                      <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                      <option value="B.Tech Electronics & Communication">B.Tech Electronics & Communication</option>
                      <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                      <option value="BCA (Bachelor of Computer Applications)">BCA (Bachelor of Computer Applications)</option>
                      <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                      <option value="MCA (Master of Computer Applications)">MCA (Master of Computer Applications)</option>
                    </select>
                  </div>
                </div>

                {/* 7. Current Year */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Current Year <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* 8. Referral Code (Optional / Auto-filled) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="referral_code"
                      value={formData.referral_code}
                      onChange={handleChange}
                      placeholder="e.g. RAHUL123 (Auto-filled if using referral link)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blue-700 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-blue-50/30"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <>
                    <span>Register Now</span>
                    <Sparkles className="w-5 h-5 text-cyan-200" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
