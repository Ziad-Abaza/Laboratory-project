import { useState, useMemo } from 'react';
import {
  FlaskConical, Clock, CheckCircle2, AlertCircle,
  Search, FileText, Printer, Signature,
  Save, Beaker, User, Phone, Ticket, LogOut, Activity,
  X, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────

type RequestStatus = 'new' | 'in-progress' | 'completed';

interface LabRequest {
  id: string;
  ticketNumber: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  testType: string;
  testCode: string;
  requestedAt: string;
  status: RequestStatus;
  results?: Record<string, string>;
  notes?: string;
  signedOff?: boolean;
}

interface TestParameter {
  key: string;
  label: string;
  unit: string;
  normalRange: string;
  type: 'numeric' | 'text' | 'select';
  options?: string[];
}

interface TestDefinition {
  code: string;
  name: string;
  parameters: TestParameter[];
}

// ─── Test Definitions ────────────────────────────────────────────

const TEST_DEFINITIONS: TestDefinition[] = [
  {
    code: 'CBC',
    name: 'Complete Blood Count',
    parameters: [
      { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', normalRange: '12-17', type: 'numeric' },
      { key: 'wbc', label: 'WBC Count', unit: '×10³/µL', normalRange: '4.5-11.0', type: 'numeric' },
      { key: 'rbc', label: 'RBC Count', unit: '×10⁶/µL', normalRange: '4.5-5.5', type: 'numeric' },
      { key: 'platelets', label: 'Platelets', unit: '×10³/µL', normalRange: '150-450', type: 'numeric' },
      { key: 'hematocrit', label: 'Hematocrit', unit: '%', normalRange: '36-54', type: 'numeric' },
    ],
  },
  {
    code: 'GLU',
    name: 'Blood Glucose',
    parameters: [
      { key: 'fasting_glucose', label: 'Fasting Glucose', unit: 'mg/dL', normalRange: '70-100', type: 'numeric' },
      { key: 'random_glucose', label: 'Random Glucose', unit: 'mg/dL', normalRange: '70-140', type: 'numeric' },
    ],
  },
  {
    code: 'LIPID',
    name: 'Lipid Profile',
    parameters: [
      { key: 'total_cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', normalRange: '<200', type: 'numeric' },
      { key: 'hdl', label: 'HDL', unit: 'mg/dL', normalRange: '>40', type: 'numeric' },
      { key: 'ldl', label: 'LDL', unit: 'mg/dL', normalRange: '<100', type: 'numeric' },
      { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', normalRange: '<150', type: 'numeric' },
    ],
  },
  {
    code: 'CHEM',
    name: 'Blood Chemistry Panel',
    parameters: [
      { key: 'alt', label: 'ALT', unit: 'U/L', normalRange: '7-56', type: 'numeric' },
      { key: 'ast', label: 'AST', unit: 'U/L', normalRange: '10-40', type: 'numeric' },
      { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', normalRange: '0.6-1.2', type: 'numeric' },
      { key: 'bun', label: 'BUN', unit: 'mg/dL', normalRange: '7-20', type: 'numeric' },
      { key: 'albumin', label: 'Albumin', unit: 'g/dL', normalRange: '3.5-5.5', type: 'numeric' },
    ],
  },
  {
    code: 'UA',
    name: 'Urine Analysis',
    parameters: [
      { key: 'ph', label: 'pH Level', unit: '', normalRange: '4.5-8.0', type: 'numeric' },
      { key: 'specific_gravity', label: 'Specific Gravity', unit: '', normalRange: '1.005-1.030', type: 'numeric' },
      { key: 'protein', label: 'Protein', unit: '', normalRange: 'Negative', type: 'select', options: ['Negative', 'Trace', '1+', '2+', '3+', '4+'] },
      { key: 'glucose_urine', label: 'Glucose', unit: '', normalRange: 'Negative', type: 'select', options: ['Negative', 'Trace', '1+', '2+', '3+', '4+'] },
    ],
  },
  {
    code: 'TFT',
    name: 'Thyroid Function Test',
    parameters: [
      { key: 'tsh', label: 'TSH', unit: 'mIU/L', normalRange: '0.4-4.0', type: 'numeric' },
      { key: 't3', label: 'T3 (Total)', unit: 'ng/dL', normalRange: '80-200', type: 'numeric' },
      { key: 't4', label: 'T4 (Total)', unit: 'µg/dL', normalRange: '5.0-12.0', type: 'numeric' },
    ],
  },
];

// ─── Mock Data ───────────────────────────────────────────────────

const INITIAL_REQUESTS: LabRequest[] = [
  {
    id: '1', ticketNumber: 'L-091', patientName: 'Ahmed Hassan', age: 34, gender: 'Male',
    phone: '+20 123 456 7890', testType: 'Complete Blood Count', testCode: 'CBC',
    requestedAt: '09:15 AM', status: 'new',
  },
  {
    id: '2', ticketNumber: 'L-092', patientName: 'Mona Ali', age: 28, gender: 'Female',
    phone: '+20 111 222 3333', testType: 'Blood Glucose', testCode: 'GLU',
    requestedAt: '09:30 AM', status: 'new',
  },
  {
    id: '3', ticketNumber: 'L-093', patientName: 'Omar Khaled', age: 45, gender: 'Male',
    phone: '+20 100 555 6666', testType: 'Lipid Profile', testCode: 'LIPID',
    requestedAt: '09:45 AM', status: 'new',
  },
  {
    id: '4', ticketNumber: 'L-088', patientName: 'Fatma Ibrahim', age: 52, gender: 'Female',
    phone: '+20 122 777 8888', testType: 'Blood Chemistry Panel', testCode: 'CHEM',
    requestedAt: '10:00 AM', status: 'in-progress',
    results: { alt: '32', ast: '28', creatinine: '', bun: '', albumin: '' },
  },
  {
    id: '5', ticketNumber: 'L-085', patientName: 'Youssef Mohamed', age: 19, gender: 'Male',
    phone: '+20 105 999 0000', testType: 'Complete Blood Count', testCode: 'CBC',
    requestedAt: '08:45 AM', status: 'in-progress',
    results: { hemoglobin: '14.2', wbc: '7.5', rbc: '5.1', platelets: '250', hematocrit: '42' },
  },
  {
    id: '6', ticketNumber: 'L-078', patientName: 'Nour Ahmed', age: 67, gender: 'Female',
    phone: '+20 114 333 4444', testType: 'Thyroid Function Test', testCode: 'TFT',
    requestedAt: '08:00 AM', status: 'completed',
    results: { tsh: '2.1', t3: '120', t4: '8.5' },
    signedOff: true,
  },
  {
    id: '7', ticketNumber: 'L-079', patientName: 'Karim Mostafa', age: 41, gender: 'Male',
    phone: '+20 120 666 7777', testType: 'Urine Analysis', testCode: 'UA',
    requestedAt: '08:15 AM', status: 'completed',
    results: { ph: '6.0', specific_gravity: '1.015', protein: 'Negative', glucose_urine: 'Negative' },
    signedOff: true,
  },
  {
    id: '8', ticketNumber: 'L-094', patientName: 'Sara Mahmoud', age: 55, gender: 'Female',
    phone: '+20 109 888 7777', testType: 'Complete Blood Count', testCode: 'CBC',
    requestedAt: '10:15 AM', status: 'new',
  },
  {
    id: '9', ticketNumber: 'L-095', patientName: 'Tarek Adel', age: 38, gender: 'Male',
    phone: '+20 115 444 3333', testType: 'Blood Chemistry Panel', testCode: 'CHEM',
    requestedAt: '10:30 AM', status: 'new',
  },
];

// ─── Component ───────────────────────────────────────────────────

export default function LabTechnicianDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<LabRequest[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<RequestStatus>('new');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportRequest, setReportRequest] = useState<LabRequest | null>(null);

  const technicianName = user?.name || 'Tech. Mai Hassan';

  // ── Derived counts ──
  const totalCount = requests.length;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const inProgressCount = requests.filter((r) => r.status === 'in-progress').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  // ── Filtered & searched list ──
  const filteredRequests = useMemo(() => {
    let list = requests.filter((r) => r.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.ticketNumber.toLowerCase().includes(q) ||
          r.testType.toLowerCase().includes(q)
      );
    }
    // Sort: newest first for new/in-progress, oldest first for completed
    return list.sort((a, b) => {
      if (activeTab === 'completed') return a.requestedAt.localeCompare(b.requestedAt);
      return b.requestedAt.localeCompare(a.requestedAt);
    });
  }, [requests, activeTab, searchQuery]);

  const selectedRequest = requests.find((r) => r.id === selectedId) ?? null;

  // ── Test definition for selected request ──
  const testDef = TEST_DEFINITIONS.find((t) => t.code === selectedRequest?.testCode);

  // ── Local results draft ──
  const [draftResults, setDraftResults] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // When selection changes, sync draft
  const syncDraft = (req: LabRequest) => {
    setDraftResults({ ...(req.results ?? {}) });
    setDraftNotes(req.notes ?? '');
    setSaveMessage('');
  };

  const handleSelectRequest = (req: LabRequest) => {
    setSelectedId(req.id);
    syncDraft(req);

    // Auto-transition to in-progress when a "new" request is selected
    if (req.status === 'new') {
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'in-progress' as RequestStatus } : r))
      );
    }
  };

  const handleSaveResults = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, results: { ...draftResults }, notes: draftNotes, status: 'in-progress' as RequestStatus }
          : r
      )
    );
    setSaveMessage('Results saved as draft');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const handleMarkCompleted = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, results: { ...draftResults }, notes: draftNotes, status: 'completed' as RequestStatus }
          : r
      )
    );
    setSaveMessage('Marked as completed');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const handleViewReport = (req: LabRequest) => {
    setReportRequest(req);
    setShowReportModal(true);
  };

  const handleSignOff = () => {
    if (!reportRequest) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === reportRequest.id ? { ...r, signedOff: true } : r))
    );
    setReportRequest((prev) => (prev ? { ...prev, signedOff: true } : null));
    setSaveMessage('Report signed off');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Status badge helper ──
  const statusBadge = (status: RequestStatus) => {
    const map = {
      new: 'bg-amber-50 text-amber-700 border border-amber-200',
      'in-progress': 'bg-primary/10 text-primary border border-primary/20',
      completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    };
    const labelMap = { new: 'New', 'in-progress': 'In Progress', completed: 'Completed' };
    return <span className={`px-2 py-0.5 rounded text-[0.6875rem] font-medium ${map[status]}`}>{labelMap[status]}</span>;
  };

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full p-6 space-y-5">

        {/* ==================================================== */}
        {/* ZONE 1 — TOP BAR: Lab Status Overview                  */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between">
          {/* Technician Info */}
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <FlaskConical className="size-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[1.125rem] text-foreground font-medium">{technicianName}</p>
              <p className="text-[0.8125rem] text-muted-foreground">Laboratory Technician</p>
            </div>
          </div>

          {/* KPI Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card rounded-lg px-4 py-2.5 shadow-sm border border-border">
              <FlaskConical className="size-4 text-muted-foreground" />
              <span className="text-[0.8125rem] text-muted-foreground">Total</span>
              <span className="text-[1.125rem] text-foreground font-medium">{totalCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-4 py-2.5 shadow-sm border border-amber-200">
              <AlertCircle className="size-4 text-amber-600" />
              <span className="text-[0.8125rem] text-amber-700">New</span>
              <span className="text-[1.125rem] text-amber-700 font-medium">{newCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-4 py-2.5 shadow-sm border border-primary/20">
              <Clock className="size-4 text-primary" />
              <span className="text-[0.8125rem] text-primary">In Progress</span>
              <span className="text-[1.125rem] text-primary font-medium">{inProgressCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-4 py-2.5 shadow-sm border border-emerald-200">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span className="text-[0.8125rem] text-emerald-700">Completed</span>
              <span className="text-[1.125rem] text-emerald-700 font-medium">{completedCount}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* ==================================================== */}
        {/* ZONE 2 — MAIN WORK AREA (Two Columns)                  */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT PANEL — Queue & Test Requests ── */}
          <div className="lg:col-span-2 bg-card rounded-lg shadow-sm border border-border flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)', minHeight: '700px' }}>
            {/* Header + Search */}
            <div className="p-4 border-b border-border space-y-3">
              <h2 className="text-[1.125rem] text-foreground">Lab Requests Queue</h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, ticket, or test…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.875rem]"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
                {([
                  { key: 'new', label: 'New', count: newCount },
                  { key: 'in-progress', label: 'In Progress', count: inProgressCount },
                  { key: 'completed', label: 'Completed', count: completedCount },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSelectedId(null); }}
                    className={`flex-1 py-2 px-3 rounded-md transition-all duration-200 text-[0.8125rem] flex items-center justify-center gap-1.5 ${
                      activeTab === tab.key
                        ? 'bg-card shadow-sm text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[0.6875rem] px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-secondary/50 text-muted-foreground' : 'bg-secondary/30 text-muted-foreground/60'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Request List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <Beaker className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-[0.875rem] text-muted-foreground">No requests in this tab</p>
                </div>
              )}
              {filteredRequests.map((req) => {
                const isSelected = req.id === selectedId;
                return (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`w-full text-left rounded-lg p-3.5 transition-all duration-200 border ${
                      isSelected
                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[0.75rem] font-mono font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                            {req.ticketNumber}
                          </span>
                          {statusBadge(req.status)}
                        </div>
                        <p className={`text-[0.9375rem] truncate ${isSelected ? 'text-foreground font-medium' : 'text-foreground'}`}>
                          {req.patientName}
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                          {req.testType}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[0.6875rem] text-muted-foreground">{req.requestedAt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT PANEL — Test Processing & Results ── */}
          <div className="lg:col-span-3 bg-card rounded-lg shadow-sm border border-border flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)', minHeight: '700px' }}>
            {selectedRequest && testDef ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Processing Header */}
                <div className="p-5 border-b border-border">
                  <h2 className="text-[1.125rem] text-foreground mb-3">Test Processing</h2>

                  {/* Patient & Test Info */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Patient</p>
                      <p className="text-[1rem] text-foreground font-medium">{selectedRequest.patientName}</p>
                    </div>
                    <div>
                      <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Ticket</p>
                      <div className="flex items-center gap-1.5">
                        <Ticket className="size-3.5 text-primary" />
                        <p className="text-[1rem] text-primary font-medium">{selectedRequest.ticketNumber}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Age / Gender</p>
                      <p className="text-[0.9375rem] text-foreground flex items-center gap-1.5">
                        <User className="size-3.5" />
                        {selectedRequest.age} yrs · {selectedRequest.gender}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Phone</p>
                      <p className="text-[0.9375rem] text-foreground flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {selectedRequest.phone}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Test</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Beaker className="size-4 text-primary" />
                        <p className="text-[0.9375rem] text-foreground">{selectedRequest.testType}</p>
                        <span className="text-[0.6875rem] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                          {selectedRequest.testCode}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Requested At</p>
                      <p className="text-[0.9375rem] text-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {selectedRequest.requestedAt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Results Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[1.125rem] text-foreground font-semibold flex items-center gap-2">
                      <FileText className="size-5" />
                      Test Parameters
                    </h3>
                    <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                      {testDef.parameters.length} parameters
                    </div>
                  </div>

                  <div className="space-y-5">
                    {testDef.parameters.map((param) => {
                      const value = draftResults[param.key] ?? '';
                      return (
                        <div key={param.key} className="bg-secondary/20 rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <label className="block mb-3 text-[0.9375rem] text-foreground font-medium">
                                {param.label}
                              </label>
                              {param.type === 'select' && param.options ? (
                                <select
                                  value={value}
                                  onChange={(e) => setDraftResults((prev) => ({ ...prev, [param.key]: e.target.value }))}
                                  className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[1rem] text-foreground"
                                >
                                  <option value="">Select...</option>
                                  {param.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  inputMode={param.type === 'numeric' ? 'decimal' : 'text'}
                                  value={value}
                                  onChange={(e) => setDraftResults((prev) => ({ ...prev, [param.key]: e.target.value }))}
                                  placeholder="Enter value"
                                  className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[1rem]"
                                />
                              )}
                            </div>
                            <div className="flex-shrink-0 w-32 text-right">
                              <div className="bg-card rounded-lg p-3 border border-border/50">
                                <p className="text-[0.75rem] text-muted-foreground font-medium mb-1">
                                  {param.unit && `Unit: ${param.unit}`}
                                </p>
                                <p className="text-[0.75rem] text-emerald-600 font-medium">
                                  Ref: {param.normalRange}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes */}
                  <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
                    <label className="block mb-3 text-[0.9375rem] text-foreground font-medium">
                      Notes (optional)
                    </label>
                    <textarea
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      placeholder="Add any observations or comments about the test results..."
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.9375rem] resize-none"
                    />
                  </div>

                  {/* Save message */}
                  {saveMessage && (
                    <div className="text-center py-2">
                      <span className="text-[0.8125rem] text-primary bg-primary/5 px-3 py-1 rounded-full">
                        {saveMessage}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t border-border flex items-center gap-3">
                  <button
                    onClick={handleSaveResults}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
                  >
                    <Save className="size-4" />
                    Save Results
                  </button>
                  <button
                    onClick={handleMarkCompleted}
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-emerald-600/30 text-[0.9375rem]"
                  >
                    <CheckCircle2 className="size-4" />
                    Mark Completed
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state when nothing selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FlaskConical className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-[1rem] text-muted-foreground mb-1">No test selected</p>
                  <p className="text-[0.8125rem] text-muted-foreground/60">
                    Select a request from the queue to begin processing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* ZONE 3 — REPORT MODAL (Completed Requests)             */}
        {/* ==================================================== */}
        {showReportModal && reportRequest && (() => {
          const def = TEST_DEFINITIONS.find((t) => t.code === reportRequest.testCode);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setShowReportModal(false)}
            >
              <div
                className="bg-card rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <h3 className="text-[1.125rem] text-foreground">Lab Report</h3>
                  </div>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
                  >
                    <X className="size-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Report Body */}
                <div className="p-6 space-y-5">
                  {/* Patient Info Block */}
                  <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <div>
                        <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Patient</p>
                        <p className="text-[0.9375rem] text-foreground font-medium">{reportRequest.patientName}</p>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Ticket</p>
                        <p className="text-[0.9375rem] text-primary font-medium">{reportRequest.ticketNumber}</p>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Age / Gender</p>
                        <p className="text-[0.875rem] text-foreground">{reportRequest.age} yrs · {reportRequest.gender}</p>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Date</p>
                        <p className="text-[0.875rem] text-foreground">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Test Results Table */}
                  <div>
                    <h4 className="text-[0.9375rem] text-foreground font-medium mb-3 flex items-center gap-1.5">
                      <Beaker className="size-4" />
                      {reportRequest.testType}
                    </h4>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-[0.875rem]">
                        <thead>
                          <tr className="bg-secondary/30">
                            <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Parameter</th>
                            <th className="text-center py-2.5 px-4 text-muted-foreground font-medium">Result</th>
                            <th className="text-center py-2.5 px-4 text-muted-foreground font-medium">Unit</th>
                            <th className="text-center py-2.5 px-4 text-muted-foreground font-medium">Ref. Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {def?.parameters.map((param, i) => {
                            const val = reportRequest.results?.[param.key] ?? '—';
                            return (
                              <tr key={param.key} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border`}>
                                <td className="py-2.5 px-4 text-foreground">{param.label}</td>
                                <td className="py-2.5 px-4 text-center text-foreground font-medium">{val}</td>
                                <td className="py-2.5 px-4 text-center text-muted-foreground">{param.unit || '—'}</td>
                                <td className="py-2.5 px-4 text-center text-muted-foreground">{param.normalRange}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Notes */}
                  {reportRequest.notes && (
                    <div>
                      <h4 className="text-[0.9375rem] text-foreground font-medium mb-2">Notes</h4>
                      <p className="text-[0.875rem] text-muted-foreground bg-secondary/20 rounded-lg p-3">
                        {reportRequest.notes}
                      </p>
                    </div>
                  )}

                  {/* Sign-off Status */}
                  <div className="flex items-center gap-2">
                    {reportRequest.signedOff ? (
                      <>
                        <Signature className="size-4 text-emerald-600" />
                        <span className="text-[0.8125rem] text-emerald-700 font-medium">Report signed off</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-4 text-amber-600" />
                        <span className="text-[0.8125rem] text-amber-700 font-medium">Pending sign-off</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="p-4 border-t border-border flex items-center gap-3">
                  {!reportRequest.signedOff && (
                    <button
                      onClick={handleSignOff}
                      className="flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-600/30 text-[0.9375rem]"
                    >
                      <Signature className="size-4" />
                      Sign Off Report
                    </button>
                  )}
                  <button
                    onClick={handlePrintReport}
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-lg border-2 border-border bg-card text-foreground hover:border-primary hover:bg-secondary/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 text-[0.9375rem]"
                  >
                    <Printer className="size-4" />
                    Print Report
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="py-3 px-5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all duration-200 text-[0.875rem]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Completed requests — view report buttons (shown below right panel when a completed request is selected) */}
        {selectedRequest && selectedRequest.status === 'completed' && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => handleViewReport(selectedRequest)}
              className="flex items-center gap-2 py-3 px-5 rounded-lg bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-[0.9375rem]"
            >
              <FileText className="size-4" />
              View Report
              <ChevronDown className="size-4 rotate-[-90deg]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
