import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AnalyticsView from './components/AnalyticsView';
import InterviewCalendarView from './components/InterviewCalendarView';
import DataBackupModal from './components/DataBackupModal';
import axios from 'axios';
import {
  Briefcase,
  LogOut,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Building2,
  AlertCircle,
  X,
  Loader2,
  Search,
  Calendar,
  Filter,
  GraduationCap,
  Sparkles,
  ExternalLink,
  BarChart2,
  Table,
  Database,
  Download,
} from 'lucide-react';

// Status badge color maps
const statusColors: Record<string, string> = {
  Wishlist: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Applied: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Online Assessment': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Interview: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Offer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Withdrawn: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

function ApplicationsDashboard() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Navigation Tab
  const [activeNav, setActiveNav] = useState<'applications' | 'analytics' | 'calendar'>('applications');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company'>('newest');

  // Modal & Toast states
  const [showModal, setShowModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; companyName: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Interview state in modal
  const [newInterview, setNewInterview] = useState({
    interviewDate: new Date().toISOString().split('T')[0],
    interviewType: 'Technical',
    interviewNotes: '',
    result: 'Pending',
  });

  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    location: '',
    jobType: 'Full Time',
    workMode: 'On-site',
    status: 'Applied',
    salary: '',
    jobUrl: '',
    notes: '',
  });

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch applications & stats on component load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, statsRes] = await Promise.all([
        axios.get('/api/applications'),
        axios.get('/api/applications/stats').catch(() => ({ data: null })),
      ]);
      setApplications(appRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data from MongoDB Atlas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingApp(null);
    setFormError(null);
    setFormData({
      companyName: '',
      jobTitle: '',
      location: 'Bangalore',
      jobType: 'Full Time',
      workMode: 'Hybrid',
      status: 'Applied',
      salary: '',
      jobUrl: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (app: any) => {
    setEditingApp(app);
    setFormError(null);
    setFormData({
      companyName: app.companyName || '',
      jobTitle: app.jobTitle || '',
      location: app.location || '',
      jobType: app.jobType || 'Full Time',
      workMode: app.workMode || 'On-site',
      status: app.status || 'Applied',
      salary: app.salary || '',
      jobUrl: app.jobUrl || '',
      notes: app.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingApp) {
        await axios.put(`/api/applications/${editingApp._id || editingApp.id}`, formData);
        showToastMessage('Application updated successfully!');
      } else {
        await axios.post('/api/applications', formData);
        showToastMessage('Application added to MongoDB Atlas!');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDeleteApplication = async () => {
    if (!deleteTarget) return;
    try {
      const appId = deleteTarget.id;
      await axios.delete(`/api/applications/${appId}`);
      showToastMessage(`Deleted application for ${deleteTarget.companyName}`);
      if (viewingApp && (viewingApp._id === appId || viewingApp.id === appId)) {
        setViewingApp(null);
      }
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      showToastMessage(err.response?.data?.message || 'Failed to delete application', 'error');
      setDeleteTarget(null);
    }
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingApp) return;
    try {
      const appId = viewingApp._id || viewingApp.id;
      const res = await axios.post(`/api/applications/${appId}/interviews`, newInterview);
      setViewingApp(res.data);
      setNewInterview({
        interviewDate: new Date().toISOString().split('T')[0],
        interviewType: 'Technical',
        interviewNotes: '',
        result: 'Pending',
      });
      showToastMessage('Interview round added!');
      fetchData();
    } catch (err: any) {
      showToastMessage(err.response?.data?.message || 'Failed to add interview round', 'error');
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!viewingApp) return;
    try {
      const appId = viewingApp._id || viewingApp.id;
      const res = await axios.delete(`/api/applications/${appId}/interviews/${interviewId}`);
      setViewingApp(res.data);
      showToastMessage('Interview round removed!');
      fetchData();
    } catch (err: any) {
      showToastMessage(err.response?.data?.message || 'Failed to delete interview round', 'error');
    }
  };

  // Filter & Search Logic
  const filteredApplications = applications
    .filter((app) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        app.companyName.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query) ||
        (app.location && app.location.toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesMode = workModeFilter === 'ALL' || app.workMode === workModeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.applicationDate).getTime() - new Date(a.createdAt || a.applicationDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.applicationDate).getTime() - new Date(b.createdAt || b.applicationDate).getTime();
      }
      if (sortBy === 'company') {
        return a.companyName.localeCompare(b.companyName);
      }
      return 0;
    });

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold transition-all duration-300 border ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Student Profile & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 inline-flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> MongoDB Atlas Live Database Connected
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
            <span>Welcome, {user?.name || 'Student'}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            {user?.college && (
              <span className="flex items-center gap-1 text-indigo-300">
                <GraduationCap className="w-3.5 h-3.5" /> {user.college}
              </span>
            )}
            {user?.degree && <span>• {user.degree}</span>}
            {user?.graduationYear && <span>({user.graduationYear})</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowBackupModal(true)}
            className="px-3.5 py-2 bg-slate-700/80 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl border border-slate-600 transition flex items-center space-x-1.5 cursor-pointer"
            title="Backup, Export or Import Data"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export/Import</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
          
          <button
            onClick={logout}
            className="px-3 py-2 bg-slate-700/80 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl border border-slate-600 transition cursor-pointer flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Phase 4 Navigation Bar */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold">
        <button
          onClick={() => setActiveNav('applications')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer ${
            activeNav === 'applications'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Applications Table</span>
        </button>

        <button
          onClick={() => setActiveNav('analytics')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer ${
            activeNav === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analytics & Visuals</span>
        </button>

        <button
          onClick={() => setActiveNav('calendar')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer ${
            activeNav === 'calendar'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-orange-400" />
          <span>Interview Agenda</span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS TABLE */}
      {activeNav === 'applications' && (
        <div className="space-y-6">
          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-slate-400 text-xs">Total Applications</div>
              <div className="text-2xl font-bold text-white mt-1">{stats?.total ?? applications.length}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-blue-400 text-xs">Applied</div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats?.statusCounts?.Applied ?? applications.filter((a) => a.status === 'Applied').length}
              </div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-orange-400 text-xs">Interviews Scheduled</div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats?.totalInterviewsScheduled ?? applications.reduce((acc, a) => acc + (a.interviews?.length || 0), 0)}
              </div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-emerald-400 text-xs">Offers Received</div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats?.statusCounts?.Offer ?? applications.filter((a) => a.status === 'Offer').length}
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Bar */}
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, job title, location..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Online Assessment">Online Assessment</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              <select
                value={workModeFilter}
                onChange={(e) => setWorkModeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="ALL">All Modes</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company">Company (A-Z)</option>
              </select>

              {(searchQuery || statusFilter !== 'ALL' || workModeFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setWorkModeFilter('ALL');
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 text-[11px] font-medium cursor-pointer"
                >
                  Reset Filters
                </button>
              )}

              <span className="text-[11px] text-slate-400 ml-auto md:ml-1">
                Showing {filteredApplications.length} of {applications.length}
              </span>
            </div>
          </div>

          {/* Applications Data Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 space-x-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Loading applications from MongoDB Atlas...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-700/60 rounded-2xl p-6">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">
                {applications.length === 0 ? 'No Job Applications Found' : 'No Matching Applications'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {applications.length === 0
                  ? 'Click below to create your first application stored directly in MongoDB Atlas.'
                  : 'Try clearing your search or filters.'}
              </p>
              {applications.length === 0 && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Application</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/60">
                  <tr>
                    <th className="p-3.5">Company & Role</th>
                    <th className="p-3.5">Location & Mode</th>
                    <th className="p-3.5">Type & Salary</th>
                    <th className="p-3.5">Interviews</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 bg-slate-900/40">
                  {filteredApplications.map((app) => (
                    <tr key={app._id || app.id} className="hover:bg-slate-800/60 transition">
                      <td className="p-3.5 font-medium text-slate-100">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{app.companyName}</span>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">{app.jobTitle}</div>
                      </td>
                      <td className="p-3.5">
                        <div>{app.location || 'N/A'}</div>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/50">
                          {app.workMode}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div>{app.jobType}</div>
                        <div className="text-slate-400 text-[11px]">{app.salary || '—'}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-indigo-300 font-semibold">
                          {app.interviews?.length || 0} rounds
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                            statusColors[app.status] || 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setViewingApp(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition cursor-pointer"
                          title="View Details & Interviews"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(app)}
                          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition cursor-pointer"
                          title="Edit Application"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: app._id || app.id,
                              companyName: app.companyName,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALYTICS & CHARTS */}
      {activeNav === 'analytics' && <AnalyticsView applications={applications} stats={stats} />}

      {/* TAB 3: INTERVIEW CALENDAR */}
      {activeNav === 'calendar' && (
        <InterviewCalendarView
          applications={applications}
          onViewApp={(app) => setViewingApp(app)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Application?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete the job application for{' '}
              <strong className="text-white">{deleteTarget.companyName}</strong>? This action will permanently remove it from MongoDB Atlas.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteApplication}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {editingApp ? 'Edit Application' : 'Create New Job Application'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Google, Microsoft, TCS"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Title / Role *</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g. Software Engineer, SDE Intern"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bangalore, Remote"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Salary / Compensation</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="15 LPA / $80,000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part Time">Part Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Online Assessment">Online Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Link / URL</label>
                <input
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Recruiter contact, preparation topics..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer"
                >
                  {editingApp ? 'Save Changes' : 'Create Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details & Interview Rounds Modal */}
      {viewingApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColors[viewingApp.status]}`}>
                {viewingApp.status}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{viewingApp.companyName}</h3>
              <p className="text-sm text-slate-400">{viewingApp.jobTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <div><strong>Location:</strong> {viewingApp.location || 'N/A'}</div>
              <div><strong>Mode:</strong> {viewingApp.workMode}</div>
              <div><strong>Type:</strong> {viewingApp.jobType}</div>
              <div><strong>Salary:</strong> {viewingApp.salary || 'N/A'}</div>
            </div>

            {/* Interview Rounds List */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Interview Rounds ({viewingApp.interviews?.length || 0})</span>
              </h4>

              {viewingApp.interviews && viewingApp.interviews.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {viewingApp.interviews.map((iv: any) => (
                    <div
                      key={iv._id || iv.id}
                      className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span>{iv.interviewType}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            {new Date(iv.interviewDate).toLocaleDateString()}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              iv.result === 'Passed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : iv.result === 'Failed'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {iv.result}
                          </span>
                        </div>
                        {iv.interviewNotes && (
                          <p className="text-slate-400 mt-1 text-[11px]">{iv.interviewNotes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteInterview(iv._id || iv.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Remove round"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mb-3">No interview rounds scheduled yet.</p>
              )}

              {/* Add Interview Form */}
              <form onSubmit={handleAddInterview} className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40 text-xs space-y-2">
                <div className="font-semibold text-slate-300">Schedule / Log Interview Round</div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newInterview.interviewType}
                    onChange={(e) => setNewInterview({ ...newInterview, interviewType: e.target.value })}
                    className="bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Online Assessment">Online Assessment</option>
                    <option value="Other">Other</option>
                  </select>

                  <select
                    value={newInterview.result}
                    onChange={(e) => setNewInterview({ ...newInterview, result: e.target.value })}
                    className="bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <input
                  type="date"
                  value={newInterview.interviewDate}
                  onChange={(e) => setNewInterview({ ...newInterview, interviewDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg"
                />

                <input
                  type="text"
                  placeholder="Notes (e.g. Topics asked, interviewer name...)"
                  value={newInterview.interviewNotes}
                  onChange={(e) => setNewInterview({ ...newInterview, interviewNotes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg"
                />

                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs cursor-pointer"
                >
                  + Add Interview Round
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Data Backup / Export Modal */}
      {showBackupModal && (
        <DataBackupModal
          applications={applications}
          onClose={() => setShowBackupModal(false)}
          onRefresh={fetchData}
          showToast={showToastMessage}
        />
      )}

    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-6">
        
        {/* Navigation Bar & Header */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 md:px-6 md:py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/20">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">JobTrack</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold rounded-full border border-emerald-500/30">
                  Analytics & Interview Agenda
                </span>
              </div>
              <p className="text-xs text-slate-400">Student Placement & Application Tracker</p>
            </div>
          </div>
        </div>

        {/* Main Body */}
        {!user ? (
          <div className="py-4">
            {authMode === 'login' ? (
              <Login switchToRegister={() => setAuthMode('register')} />
            ) : (
              <Register switchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        ) : (
          <ProtectedRoute fallback={<Login switchToRegister={() => setAuthMode('register')} />}>
            <ApplicationsDashboard />
          </ProtectedRoute>
        )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
