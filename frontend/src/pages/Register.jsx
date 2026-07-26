import React, { useState } from 'react';
import { User, Mail, Lock, Upload, Sliders, Briefcase, GraduationCap, Building, Sparkles, CheckCircle, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  // Standard inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Experience inputs
  const [experienceType, setExperienceType] = useState('Corporate');
  const [age, setAge] = useState(26);
  const [previousCompany, setPreviousCompany] = useState('');
  const [college, setCollege] = useState('');
  const [cgpa, setCgpa] = useState('');

  // Targeting Details
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [skillsKeywords, setSkillsKeywords] = useState('');
  const [matchScoreThreshold, setMatchScoreThreshold] = useState(75);

  const [extractedMessage, setExtractedMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, uploadPdf } = useAuth();
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeFileName(file.name);
      
      const formData = new FormData();
      formData.append('resume', file);
      
      try {
        setExtractedMessage('Extracting skills from resume...');
        const data = await uploadPdf(formData);
        
        if (data.skills_keywords) {
          setSkillsKeywords(data.skills_keywords);
          setExtractedMessage(`Auto-extracted key skills from ${file.name}`);
        } else {
          setExtractedMessage(`Uploaded ${file.name}`);
        }
      } catch (err) {
        console.error('Resume upload error:', err);
        setExtractedMessage('Failed to auto-extract skills, please enter manually.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill out the required standard account fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await register(
        fullName,
        email,
        password,
        skillsKeywords,
        matchScoreThreshold,
        experienceType,
        age,
        previousCompany,
        college,
        cgpa
      );
      navigate('/');
    } catch (err) {
      setError(err || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-700/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-2xl w-full space-y-8 bg-white/60 backdrop-blur-md border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-200/50 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-brand-950">
            Create Career Automation Profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure your background, experience parameters, and job targeting rules
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Standard Account Inputs */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <User className="h-4 w-4" /> 1. Account Standard Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Experience Inputs */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> 2. Experience & Background Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Experience Type
                </label>
                <select
                  value={experienceType}
                  onChange={(e) => setExperienceType(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none cursor-pointer transition-all"
                >
                  <option value="Student">Student (Entry Level / Fresh Grad)</option>
                  <option value="Corporate">Corporate (Experienced Professional)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Age</label>
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 22)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                />
              </div>

              {experienceType === 'Corporate' && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Previous Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={previousCompany}
                      onChange={(e) => setPreviousCompany(e.target.value)}
                      placeholder="Current or Most Recent Company"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">College / University</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="University Name"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CGPA / Grade</label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.5 / 10"
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Targeting Details */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <Sliders className="h-4 w-4" /> 3. Targeting & Skill Matching
            </h3>

            {/* File Upload Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Upload Resume (Auto-extracts skills)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-brand-500 bg-white rounded-xl p-4 text-center transition-all cursor-pointer relative group">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    {resumeFile ? resumeFile.name : 'Click to select or drag & drop Resume file'}
                  </span>
                  <span className="text-[11px] text-slate-500">PDF, DOCX up to 10MB</span>
                </div>
              </div>
              {extractedMessage && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  {extractedMessage}
                </div>
              )}
            </div>

            {/* OR Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-3 text-slate-500 font-bold tracking-widest">
                  OR
                </span>
              </div>
            </div>

            {/* Manual Fallback Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Skills Keywords (Comma Separated)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={skillsKeywords}
                    onChange={(e) => setSkillsKeywords(e.target.value)}
                    placeholder="e.g. React, TypeScript, Python, AWS"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1">
                  Manual fallback skills used by the ingestion engine if resume parsing misses keywords.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Match Score Threshold
                  </label>
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {matchScoreThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={matchScoreThreshold}
                  onChange={(e) => setMatchScoreThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  <span>10% (Broad)</span>
                  <span>50% (Moderate)</span>
                  <span>100% (Strict)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-700 hover:bg-brand-900 text-white text-sm font-bold rounded-lg shadow-md shadow-brand-700/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">Processing...</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Complete Registration & Launch Engine
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-200 text-center">
          <p className="text-sm font-medium text-slate-600">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-700 hover:text-brand-900 cursor-pointer underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
