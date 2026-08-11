import React, { useState } from 'react';
import axios from 'axios';
import {
  Download,
  Upload,
  X,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Database,
  Loader2,
} from 'lucide-react';

interface DataBackupModalProps {
  applications: any[];
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function DataBackupModal({
  applications,
  onClose,
  onRefresh,
  showToast,
}: DataBackupModalProps) {
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // 1. Export JSON
  const exportJSON = () => {
    const jsonString = JSON.stringify(applications, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `jobtrack_applications_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    showToast('Exported applications to JSON successfully!');
  };

  // 2. Export CSV
  const exportCSV = () => {
    if (applications.length === 0) {
      showToast('No applications available to export', 'error');
      return;
    }

    const headers = ['Company Name', 'Job Title', 'Location', 'Job Type', 'Work Mode', 'Status', 'Salary', 'Job URL', 'Notes', 'Application Date'];
    const rows = applications.map((a) => [
      `"${(a.companyName || '').replace(/"/g, '""')}"`,
      `"${(a.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.jobType || '').replace(/"/g, '""')}"`,
      `"${(a.workMode || '').replace(/"/g, '""')}"`,
      `"${(a.status || '').replace(/"/g, '""')}"`,
      `"${(a.salary || '').replace(/"/g, '""')}"`,
      `"${(a.jobUrl || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${a.createdAt || a.applicationDate || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jobtrack_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Exported applications to CSV successfully!');
  };

  // 3. Import JSON File
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = JSON.parse(content);

        if (!Array.isArray(parsedData)) {
          throw new Error('Imported JSON must be an array of application records.');
        }

        let successCount = 0;
        for (const item of parsedData) {
          if (item.companyName && item.jobTitle) {
            await axios.post('/api/applications', {
              companyName: item.companyName,
              jobTitle: item.jobTitle,
              location: item.location || '',
              jobType: item.jobType || 'Full Time',
              workMode: item.workMode || 'On-site',
              status: item.status || 'Applied',
              salary: item.salary || '',
              jobUrl: item.jobUrl || '',
              notes: item.notes || '',
            });
            successCount++;
          }
        }

        showToast(`Successfully imported ${successCount} application records into MongoDB Atlas!`);
        onRefresh();
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse or import JSON file.');
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-indigo-400">
          <Database className="w-6 h-6" />
          <h3 className="text-lg font-bold text-white">Data Backup & Export/Import</h3>
        </div>

        {importError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-2">
          <label className="block text-slate-300 text-xs font-semibold">Export Saved Applications:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportJSON}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        <hr className="border-slate-700" />

        {/* Import Section */}
        <div className="space-y-2">
          <label className="block text-slate-300 text-xs font-semibold">Import Applications (JSON Format):</label>
          <label className="w-full py-3 bg-slate-900 hover:bg-slate-700 border border-dashed border-slate-600 hover:border-indigo-500 rounded-xl text-slate-300 text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition cursor-pointer">
            {importing ? (
              <div className="flex items-center space-x-2 text-indigo-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing records into MongoDB...</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-indigo-400" />
                <span>Click to Upload JSON File</span>
              </>
            )}
            <input type="file" accept=".json" onChange={handleFileImport} disabled={importing} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
