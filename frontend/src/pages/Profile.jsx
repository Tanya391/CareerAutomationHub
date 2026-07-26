import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCompanies, addCompany } from '../services/companyApi';
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Sliders, 
  Building2, 
  PlusCircle, 
  CheckCircle, 
  Globe, 
  Shield, 
  CheckCircle2,
  FileText,
  LogOut,
  Upload
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUserData, logout, uploadPdf } = useAuth();
  const navigate = useNavigate();
  
  const [targetCompanies, setTargetCompanies] = useState([]);
  
  // Form State for Add Custom Target Company
  const [companyName, setCompanyName] = useState('');
  const [careersUrl, setCareersUrl] = useState('');
  const [portalType, setPortalType] = useState('Greenhouse');
  const [addCompanySuccess, setAddCompanySuccess] = useState('');

  // Editing User Details State
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsInput, setSkillsInput] = useState(user?.skills_keywords || '');
  const [thresholdInput, setThresholdInput] = useState(user?.min_match_score || 70);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  // Resume Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setTargetCompanies(data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleAddCompanySubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !careersUrl) return;

    try {
      await addCompany({
        name: companyName,
        careers_url: careersUrl,
        portal_type: portalType,
      });

      setAddCompanySuccess(`Target company "${companyName}" added successfully to scraper queue!`);
      setCompanyName('');
      setCareersUrl('');
      
      // Refresh companies list
      fetchCompanies();
      
      setTimeout(() => setAddCompanySuccess(''), 4000);
    } catch (err) {
      console.error('Failed to add company:', err);
    }
  };

  const handleSaveProfilePreferences = async (e) => {
    e.preventDefault();
    try {
      await updateUserData({
        skills_keywords: skillsInput,
        min_match_score: thresholdInput,
      });

      setIsEditingSkills(false);
      setProfileSuccessMessage('Preferences updated successfully!');
      setTimeout(() => setProfileSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    
    setIsUploading(true);
    setUploadMessage('');
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const data = await uploadPdf(formData);
      setUploadMessage(data.message || 'Resume parsed successfully!');
      if (data.skills_keywords) {
        setSkillsInput(data.skills_keywords);
      }
      setTimeout(() => setUploadMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setUploadMessage(err.toString());
    } finally {
      setIsUploading(false);
      setResumeFile(null);
    }
  };

  const userSkills = user?.skills_keywords ? user.skills_keywords.split(',').map(s => s.trim()) : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-brand-700" /> Account Profile & Company Targeting
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your account credentials, target skill preferences, and custom scraped portals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Account Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Details & Preferences */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-black text-lg uppercase">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold">
                  {user?.experience_type || 'Professional'} Profile
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all cursor-pointer"
                >
                  <LogOut className="h-3 w-3" /> Sign Out
                </button>
              </div>
            </div>

            {profileSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{profileSuccessMessage}</span>
              </div>
            )}

            {/* Profile Fields List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Full Name</span>
                <span className="text-slate-900 font-bold text-sm">{user?.name}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Email Address</span>
                <span className="text-slate-900 font-bold text-sm">{user?.email}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Experience Type & Age</span>
                <span className="text-slate-900 font-bold text-sm">
                  {user?.experience_type || 'N/A'} ({user?.age || 'N/A'} yrs)
                </span>
              </div>

              {user?.previous_company && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-1">Previous Company</span>
                  <span className="text-slate-900 font-bold text-sm">{user.previous_company}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">College & CGPA</span>
                <span className="text-slate-900 font-bold text-sm">
                  {user?.college || 'N/A'} • {user?.cgpa || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Active Resume Data</span>
                <span className="text-brand-700 font-bold text-sm flex items-center gap-1.5 truncate">
                  <FileText className="h-3.5 w-3.5" /> Context Extracted
                </span>
              </div>
            </div>

            {/* Resume Upload Form */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                <Upload className="h-4 w-4" /> Sync Resume Profile
              </h3>
              <form onSubmit={handleResumeUpload} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isUploading || !resumeFile}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isUploading || !resumeFile
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-brand-700 text-white hover:bg-brand-900 cursor-pointer'
                  }`}
                >
                  {isUploading ? 'Parsing...' : 'Upload & Parse PDF'}
                </button>
              </form>
              {uploadMessage && (
                <p className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  {uploadMessage}
                </p>
              )}
            </div>

            {/* Targeting Preferences Section */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" /> Targeting & Skill Matching Rules
                </h3>
                {!isEditingSkills && (
                  <button
                    onClick={() => setIsEditingSkills(true)}
                    className="text-xs text-brand-700 hover:underline cursor-pointer font-medium"
                  >
                    Edit Rules
                  </button>
                )}
              </div>

              {isEditingSkills ? (
                <form onSubmit={handleSaveProfilePreferences} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Skills Keywords (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label className="text-slate-700">Match Score Threshold</label>
                      <span className="text-brand-700 font-bold">{thresholdInput}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={thresholdInput}
                      onChange={(e) => setThresholdInput(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-700 hover:bg-brand-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingSkills(false)}
                      className="px-3 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Configured Target Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {userSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white text-brand-700 border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-700">
                    <span>Configured Match Score Threshold:</span>
                    <span className="font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                      ≥ {user?.min_match_score || 70}% Match
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Functional Form "Add Custom Target Company" & List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Functional Form Labeled EXACTLY "Add Custom Target Company" */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <Building2 className="h-5 w-5 text-brand-700" />
              <h2 className="text-base font-bold text-slate-900">
                Add Custom Target Company
              </h2>
            </div>

            {addCompanySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{addCompanySuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Coinbase, Notion, Figma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Careers Page URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={careersUrl}
                    onChange={(e) => setCareersUrl(e.target.value)}
                    placeholder="https://company.com/careers"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scraper ATS Architecture
                </label>
                <select
                  value={portalType}
                  onChange={(e) => setPortalType(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20 cursor-pointer"
                >
                  <option value="Greenhouse">Greenhouse ATS</option>
                  <option value="Workday">Workday Enterprise</option>
                  <option value="Lever">Lever ATS</option>
                  <option value="Custom Scraper">Custom HTML / REST Scraper</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Target Company</span>
              </button>
            </form>
          </div>

          {/* Currently Monitored Companies List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Monitored Target Companies</span>
              <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {targetCompanies.length} Active
              </span>
            </h3>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {targetCompanies.map((comp) => (
                <div
                  key={comp._id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{comp.name}</span>
                    <a
                      href={comp.careers_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                    >
                      <Globe className="h-3 w-3 shrink-0" /> {comp.careers_url}
                    </a>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-medium block mb-1">
                      {comp.portal_type || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {comp.status || 'Active'} 
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
