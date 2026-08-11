import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, GraduationCap, Building2, Calendar, AlertCircle, Briefcase } from 'lucide-react';

export default function Register({ switchToLogin }) {
  const { register, error, setError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: '',
    graduationYear: '2026',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields (*)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    await register(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
        
        {/* Brand Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-indigo-600/20 p-3 rounded-2xl mb-3 border border-indigo-500/30">
            <Briefcase className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Registration</h2>
          <p className="text-xs text-slate-400 mt-1">Join JobTrack to streamline your campus placement applications</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@university.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="IIT / NIT / Tech Uni"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Degree / Major</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="B.Tech CSE"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="2026"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs outline-none transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Registering Account...</span>
            ) : (
              <>
                <span>Create Student Account</span>
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-700/60 pt-4">
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <button
              onClick={switchToLogin}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
