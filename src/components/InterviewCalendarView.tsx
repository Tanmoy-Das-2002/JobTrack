import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  UserCheck,
  Code2,
  FileSpreadsheet,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface InterviewCalendarViewProps {
  applications: any[];
  onViewApp: (app: any) => void;
}

export default function InterviewCalendarView({ applications, onViewApp }: InterviewCalendarViewProps) {
  const [filterType, setFilterType] = useState('ALL');

  // Flatten all interview rounds with application context
  const allInterviews: any[] = [];
  applications.forEach((app) => {
    if (app.interviews && Array.isArray(app.interviews)) {
      app.interviews.forEach((iv: any) => {
        allInterviews.push({
          ...iv,
          appId: app._id || app.id,
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          jobUrl: app.jobUrl,
          workMode: app.workMode,
          status: app.status,
        });
      });
    }
  });

  // Sort chronologically (upcoming / newest first)
  allInterviews.sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime());

  const filteredInterviews = allInterviews.filter((iv) => {
    if (filterType === 'ALL') return true;
    return iv.interviewType === filterType;
  });

  // Separate into Upcoming vs Completed
  const today = new Date().toISOString().split('T')[0];
  const upcomingInterviews = filteredInterviews.filter((iv) => iv.interviewDate >= today && iv.result === 'Pending');
  const pastInterviews = filteredInterviews.filter((iv) => iv.interviewDate < today || iv.result !== 'Pending');

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Interview Schedule & Calendar Agenda</h3>
            <p className="text-xs text-slate-400">
              Track {allInterviews.length} interview round{allInterviews.length === 1 ? '' : 's'} across your job applications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold">Filter Round:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-xl outline-none"
          >
            <option value="ALL">All Round Types</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Managerial">Managerial</option>
            <option value="Online Assessment">Online Assessment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Agenda Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming / Active Interviews */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Upcoming / Scheduled ({upcomingInterviews.length})</span>
            </h4>
            <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-300 text-[10px] font-semibold rounded-full border border-orange-500/30">
              Action Required
            </span>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-700/60 rounded-xl p-4">
              <Video className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No upcoming interviews currently scheduled.</p>
              <p className="text-[11px] text-slate-600 mt-1">Open an application from the dashboard to add an interview round.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((iv) => (
                <div
                  key={iv._id || iv.id}
                  className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-orange-500/50 transition space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{iv.companyName}</span>
                        {iv.jobUrl && (
                          <a href={iv.jobUrl} target="_blank" rel="noreferrer" className="text-indigo-400">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs">{iv.jobTitle}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg font-bold text-[11px]">
                      {iv.interviewType}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-300 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-700/40">
                    <span className="flex items-center gap-1 font-semibold text-amber-300">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(iv.interviewDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>• {iv.workMode}</span>
                  </div>

                  {iv.interviewNotes && (
                    <p className="text-slate-400 text-[11px] italic bg-slate-900/40 p-2 rounded-lg">
                      "{iv.interviewNotes}"
                    </p>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onViewApp(applications.find((a) => (a._id || a.id) === iv.appId))}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Round in Application</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed / Historic Interviews */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Past & Completed Rounds ({pastInterviews.length})</span>
            </h4>
          </div>

          {pastInterviews.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-700/60 rounded-xl p-4">
              <UserCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No past interview history recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {pastInterviews.map((iv) => (
                <div
                  key={iv._id || iv.id}
                  className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-200 text-sm">{iv.companyName}</div>
                      <div className="text-slate-400 text-xs">{iv.jobTitle}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        iv.result === 'Passed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : iv.result === 'Failed'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {iv.result}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                    <span>Type: {iv.interviewType}</span>
                    <span>• {new Date(iv.interviewDate).toLocaleDateString()}</span>
                  </div>

                  {iv.interviewNotes && (
                    <p className="text-slate-400 text-[11px] bg-slate-900/40 p-2 rounded-lg">
                      {iv.interviewNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
