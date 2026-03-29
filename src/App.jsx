import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Phone, 
  Upload, 
  Download, 
  LayoutDashboard, 
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Palette,
  X,
  Plus,
  Trash2,
  Sun,
  Moon,
  AlertTriangle,
  Lock
} from 'lucide-react';

// Pre-loaded data with color configurations and detailed events
const initialData = [
  {
    id: "1",
    company: "TechNova Solutions",
    role: "Frontend Developer",
    status: "Interviewing",
    methodOfContact: "Company Portal",
    dateOfContact: "2026-03-25",
    relatedContacts: "Sarah Jenkins (Recruiter)",
    color: "#3b82f6", // Blue
    textColor: "#ffffff",
    events: [
      { date: "2026-03-10", description: "Submitted application online" },
      { date: "2026-03-15", description: "Completed automated coding assessment" },
      { date: "2026-03-25", description: "First round technical interview" }
    ]
  },
  {
    id: "2",
    company: "Apex Dynamics",
    role: "Systems Engineer",
    status: "Offer Negotiation",
    methodOfContact: "LinkedIn Outreach",
    dateOfContact: "2026-03-28",
    relatedContacts: "Michael Chang (Hiring Manager)",
    color: "#8b5cf6", // Purple
    textColor: "#ffffff",
    events: [
      { date: "2026-02-28", description: "Recruiter reached out on LinkedIn" },
      { date: "2026-03-05", description: "Intro call with HR" },
      { date: "2026-03-18", description: "On-site panel interview" },
      { date: "2026-03-28", description: "Received initial offer, sent counter-offer" }
    ]
  },
  {
    id: "3",
    company: "Nexus Industries",
    role: "Project Manager",
    status: "Rejected",
    methodOfContact: "Referral",
    dateOfContact: "2026-03-20",
    relatedContacts: "David Kim (Referrer)",
    color: "#ef4444", // Red
    textColor: "#ffffff",
    events: [
      { date: "2026-03-01", description: "David submitted internal referral" },
      { date: "2026-03-12", description: "Phone screen with recruiter" },
      { date: "2026-03-20", description: "Received rejection email" }
    ]
  },
  {
    id: "4",
    company: "Quantum Startups",
    role: "Full Stack Engineer",
    status: "Applied",
    methodOfContact: "AngelList",
    dateOfContact: "2026-03-27",
    relatedContacts: "",
    color: "#f59e0b", // Amber
    textColor: "#000000",
    events: [
      { date: "2026-03-27", description: "Sent resume and custom cover letter" }
    ]
  }
];

const STATUS_OPTIONS = [
  "Applied",
  "Awaiting Prescreening",
  "Prescreening Complete",
  "Assessment Pending",
  "Assessment Completed",
  "Interviewing",
  "Offer Negotiation",
  "Offer Accepted",
  "Rejected",
  "Withdrawn"
];

// Helper to get days in month
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Initialize state from localStorage, or fallback to initialData
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('appTrackerData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local storage", e);
      }
    }
    return initialData;
  });

  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Save to localStorage whenever jobs data changes
  useEffect(() => {
    localStorage.setItem('appTrackerData', JSON.stringify(jobs));
  }, [jobs]);
  
  // Modal State
  const [editingJob, setEditingJob] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, isAlert: false, title: '', message: '', onConfirm: null });
  const fileInputRef = useRef(null);

  // Status handler from dashboard card (auto-logs an event)
  const handleStatusChange = (id, newStatus, e) => {
    e.stopPropagation(); // Prevent opening the modal when just changing status
    setJobs(jobs.map(job => {
      if (job.id === id) {
        const newEvent = {
          date: new Date().toISOString().split('T')[0],
          description: `Status updated to: ${newStatus}`
        };
        return { ...job, status: newStatus, events: [...job.events, newEvent] };
      }
      return job;
    }));
  };

  // Dialog Helper
  const showAlert = (title, message) => {
    setDialog({
      isOpen: true,
      isAlert: true,
      title,
      message,
      onConfirm: () => setDialog({ isOpen: false })
    });
  };

  // Import / Export JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(jobs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `job_hunt_data_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (Array.isArray(importedData)) {
            setJobs(importedData);
            showAlert("Success", "Data successfully loaded!");
          }
        } catch (error) {
          showAlert("Error", "Error parsing JSON file. Please ensure it is a valid format.");
        }
      };
      reader.readAsText(file);
    }
    event.target.value = null;
  };

  const handleClearAllData = () => {
    setDialog({
      isOpen: true,
      isAlert: false,
      title: "Delete All Data",
      message: "Are you sure you want to delete ALL job applications and timeline events? This action cannot be undone unless you have a backup JSON file saved.",
      onConfirm: () => {
        setJobs([]);
        setDialog({ isOpen: false });
      }
    });
  };

  // Badge logic
  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      case 'Awaiting Prescreening': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700/50';
      case 'Prescreening Complete': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/40 dark:text-lime-300 dark:border-lime-700/50';
      case 'Assessment Pending': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/50';
      case 'Assessment Completed': return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700/50';
      case 'Interviewing': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50';
      case 'Offer Negotiation': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/50';
      case 'Offer Accepted': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700/50';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/50';
      case 'Withdrawn': return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // --- CALENDAR LOGIC ---
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    let grid = [];
    // Pad empty days
    for (let i = 0; i < firstDay; i++) grid.push(null);
    // Add actual days
    for (let i = 1; i <= days; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = [];
      jobs.forEach(job => {
        job.events.forEach(event => {
          if (event.date === dateStr) {
            dayEvents.push({ ...event, company: job.company, color: job.color, textColor: job.textColor });
          }
        });
      });
      grid.push({ day: i, dateStr, events: dayEvents });
    }
    return grid;
  }, [currentDate, jobs]);


  // --- MODAL HANDLERS ---
  const handleOpenModal = (job) => {
    // Deep copy to prevent modifying state directly before saving
    setEditingJob(JSON.parse(JSON.stringify(job)));
  };

  const handleCloseModal = () => {
    setEditingJob(null);
  };

  const handleDeleteJob = () => {
    setDialog({
      isOpen: true,
      isAlert: false,
      title: "Delete Application",
      message: `Are you sure you want to delete the application for "${editingJob.company}"? All related timeline events will also be permanently removed.`,
      onConfirm: () => {
        setJobs(jobs.filter(j => j.id !== editingJob.id));
        setEditingJob(null);
        setDialog({ isOpen: false });
      }
    });
  };

  const handleSaveModal = () => {
    // Sort events by date before saving
    const sortedJob = {
      ...editingJob,
      events: [...editingJob.events].sort((a, b) => new Date(a.date) - new Date(b.date))
    };
    
    if (jobs.some(j => j.id === sortedJob.id)) {
      // Update existing
      setJobs(jobs.map(j => j.id === sortedJob.id ? sortedJob : j));
    } else {
      // Add new
      setJobs([...jobs, sortedJob]);
    }
    setEditingJob(null);
  };

  const handleAddNewJob = () => {
    const newJob = {
      id: Date.now().toString(),
      company: "New Company",
      role: "Job Title",
      status: "Applied",
      methodOfContact: "",
      dateOfContact: new Date().toISOString().split('T')[0],
      relatedContacts: "",
      color: "#0f172a", // Default Slate 900
      textColor: "#ffffff",
      events: [
        { date: new Date().toISOString().split('T')[0], description: "Application Submitted" }
      ]
    };
    setEditingJob(newJob);
  };

  const handleModalFieldChange = (field, value) => {
    setEditingJob({ ...editingJob, [field]: value });
  };

  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...editingJob.events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    setEditingJob({ ...editingJob, events: updatedEvents });
  };

  const handleAddEvent = () => {
    const newEvent = { date: new Date().toISOString().split('T')[0], description: "" };
    setEditingJob({ ...editingJob, events: [...editingJob.events, newEvent] });
  };

  const handleRemoveEvent = (index) => {
    const updatedEvents = [...editingJob.events];
    updatedEvents.splice(index, 1);
    setEditingJob({ ...editingJob, events: updatedEvents });
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 font-sans relative transition-colors duration-200">
        
        {/* GLOBAL CONFIRMATION / ALERT DIALOG */}
        {dialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${dialog.isAlert ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {dialog.isAlert ? <Building2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{dialog.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-8">{dialog.message}</p>
              
              <div className="flex justify-end gap-3">
                {!dialog.isAlert && (
                  <button 
                    onClick={() => setDialog({ isOpen: false })}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={dialog.onConfirm}
                  className={`px-5 py-2 text-sm font-semibold text-white rounded-md shadow-sm transition-colors ${dialog.isAlert ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {dialog.isAlert ? 'Okay' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-3 sm:py-0 gap-4 sm:gap-0">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Briefcase className="w-6 h-6" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Application Tracker Dashboard</h1>
                <div 
                  className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50 rounded-full text-xs font-medium cursor-help transition-colors"
                  title="All your data is saved securely on this device. Nothing is ever sent to the cloud or shared."
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private & Local</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-md transition-colors" 
                  aria-label="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJSON} />
                <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors">
                  <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Import</span>
                </button>
                <button onClick={handleExportJSON} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm transition-colors">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Save Data</span>
                </button>
                <button onClick={handleClearAllData} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-md shadow-sm transition-colors ml-1">
                  <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete Data</span>
                </button>
              </div>
            </div>
            
            {/* TABS */}
            <div className="flex space-x-8 mt-2 overflow-x-auto">
              <button onClick={() => setActiveTab('dashboard')} className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard View
              </button>
              <button onClick={() => setActiveTab('calendar')} className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'calendar' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'}`}>
                <CalendarDays className="w-4 h-4" /> Calendar View
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-md hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500 transition-all cursor-pointer overflow-hidden group"
                  onClick={() => handleOpenModal(job)}
                >
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex-grow relative">
                    
                    {/* Calendar Color Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                       <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm" style={{ backgroundColor: job.color }}></div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 pr-8">
                      <Building2 className="w-4 h-4" />
                      <span className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.company}</span>
                    </div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">{job.role}</h3>
                    
                    <div className="space-y-3 mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>Last Contact: <span className="font-medium text-slate-900 dark:text-slate-200">{job.dateOfContact}</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="truncate">{job.methodOfContact}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-500 italic">
                         <span className="text-xs">{job.events.length} timeline event(s) recorded</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Dropdown (Stops Propagation so modal doesn't open) */}
                  <div className="p-4 bg-white dark:bg-slate-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</span>
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value, e)}
                      className={`text-sm font-medium rounded-full px-3 py-1.5 border appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(job.status)}`}
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200">{opt}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              {/* Add New Job Card Placeholder */}
              <div 
                onClick={handleAddNewJob}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center p-8 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer min-h-[220px]"
              >
                <div className="text-center">
                  <div className="bg-white dark:bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-blue-600 dark:text-blue-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-slate-600 dark:text-slate-300">Add New Application</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click to create a new entry</p>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"><ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Today</button>
                  <button onClick={nextMonth} className="p-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"><ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 bg-slate-200 dark:bg-slate-700 gap-[1px]">
                {calendarDays.map((cell, idx) => (
                  <div key={idx} className={`bg-white dark:bg-slate-800 min-h-[120px] p-2 flex flex-col ${!cell && 'bg-slate-50 dark:bg-slate-900/30'}`}>
                    {cell ? (
                      <>
                        <span className={`text-sm font-semibold mb-1 ${cell.dateStr === new Date().toISOString().split('T')[0] ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400 dark:text-slate-500'}`}>
                          {cell.day}
                        </span>
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-[90px] no-scrollbar">
                          {cell.events.map((evt, eIdx) => (
                            <div 
                              key={eIdx} 
                              style={{ backgroundColor: evt.color, color: evt.textColor }}
                              className="text-[10px] p-1.5 rounded leading-tight shadow-sm"
                            >
                              <span className="font-bold block">{evt.company}</span>
                              <span>{evt.description}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : <div className="h-full w-full"></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* JOB DETAILS & EVENTS MODAL */}
        {editingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <div className="flex-grow pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"/> 
                    <input 
                      type="text"
                      value={editingJob.company}
                      onChange={(e) => handleModalFieldChange('company', e.target.value)}
                      className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 outline-none w-full"
                      placeholder="Company Name"
                    />
                  </div>
                  <input 
                    type="text"
                    value={editingJob.role}
                    onChange={(e) => handleModalFieldChange('role', e.target.value)}
                    className="text-sm text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 outline-none w-full ml-7"
                    placeholder="Job Role"
                  />
                </div>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto flex-grow bg-slate-50 dark:bg-slate-900/50">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Basic Info Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Job Info</h3>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Method of Contact</label>
                      <input 
                        type="text" 
                        value={editingJob.methodOfContact} 
                        onChange={(e) => handleModalFieldChange('methodOfContact', e.target.value)}
                        className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Related Contacts</label>
                      <input 
                        type="text" 
                        value={editingJob.relatedContacts} 
                        onChange={(e) => handleModalFieldChange('relatedContacts', e.target.value)}
                        className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Status</label>
                      <select
                        value={editingJob.status}
                        onChange={(e) => handleModalFieldChange('status', e.target.value)}
                        className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Calendar Configuration */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Calendar Appearance</h3>
                     <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                             <Palette className="w-4 h-4 text-slate-400"/> Event Background Color
                          </label>
                          <input 
                            type="color" 
                            value={editingJob.color} 
                            onChange={(e) => handleModalFieldChange('color', e.target.value)} 
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                             Event Text Color
                          </label>
                          <input 
                            type="color" 
                            value={editingJob.textColor} 
                            onChange={(e) => handleModalFieldChange('textColor', e.target.value)} 
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                           <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Preview:</p>
                           <div 
                              style={{ backgroundColor: editingJob.color, color: editingJob.textColor }}
                              className="text-xs p-2 rounded shadow-sm font-semibold text-center"
                            >
                              {editingJob.company}: Interview Stage
                            </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Events Editor */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timeline Events</h3>
                    <button 
                      onClick={handleAddEvent}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5"/> Add Event
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                    {editingJob.events.length === 0 ? (
                       <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm italic">No events recorded for this job yet.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {editingJob.events.map((evt, idx) => (
                          <div key={idx} className="p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <input 
                              type="date" 
                              value={evt.date}
                              onChange={(e) => handleEventChange(idx, 'date', e.target.value)}
                              className="text-sm p-1.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 outline-none min-w-[130px]"
                            />
                            <input 
                              type="text" 
                              value={evt.description}
                              onChange={(e) => handleEventChange(idx, 'description', e.target.value)}
                              placeholder="Event description..."
                              className="text-sm p-1.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 outline-none flex-grow w-full"
                            />
                            <button 
                              onClick={() => handleRemoveEvent(idx)}
                              className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shrink-0"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center gap-3">
                <button 
                  onClick={handleDeleteJob}
                  className="px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete App</span>
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveModal}
                    className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}