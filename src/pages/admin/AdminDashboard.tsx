import { useState, useMemo } from 'react';
import {
  BarChart3, Users, Clock, TrendingUp, TrendingDown,
  Plus, Edit2, Trash2, X, Save, DollarSign,
  Building2, Stethoscope, FlaskConical, Search,
  ChevronDown, ArrowUpRight, ArrowDownRight, Activity,
  Microscope, Settings, Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────

type TimeScope = 'today' | 'weekly' | 'monthly' | 'yearly';
type GroupBy = 'doctor' | 'clinic' | 'laboratory';
type ManagementTab = 'clinics' | 'doctors';

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  servicePrice: number;
  patientCount: number;
  revenue: number;
  doctorIds: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinicId: string;
  paymentModel: 'fixed' | 'percentage';
  paymentValue: number; // salary amount or percentage
  patientCount: number;
  revenue: number;
}

interface FinancialRow {
  name: string;
  cases: number;
  revenue: number;
}

// ─── Mock Data ───────────────────────────────────────────────────

const CLINICS: Clinic[] = [
  { id: 'c1', name: 'General Medicine', specialty: 'Primary Care', servicePrice: 150, patientCount: 342, revenue: 51_300, doctorIds: ['d1', 'd2'] },
  { id: 'c2', name: 'Cardiology', specialty: 'Heart & Vascular', servicePrice: 300, patientCount: 186, revenue: 55_800, doctorIds: ['d3'] },
  { id: 'c3', name: 'Pediatrics', specialty: 'Child Care', servicePrice: 200, patientCount: 254, revenue: 50_800, doctorIds: ['d4', 'd5'] },
  { id: 'c4', name: 'Orthopedics', specialty: 'Bone & Joint', servicePrice: 250, patientCount: 128, revenue: 32_000, doctorIds: ['d6'] },
  { id: 'c5', name: 'Dermatology', specialty: 'Skin Care', servicePrice: 180, patientCount: 198, revenue: 35_640, doctorIds: [] },
  { id: 'c6', name: 'Laboratory', specialty: 'Diagnostic Tests', servicePrice: 80, patientCount: 139, revenue: 11_120, doctorIds: [] },
];

const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Williams', specialty: 'Family Medicine', clinicId: 'c1', paymentModel: 'percentage', paymentValue: 60, patientCount: 198, revenue: 29_700 },
  { id: 'd2', name: 'Dr. Ahmed Hassan', specialty: 'Internal Medicine', clinicId: 'c1', paymentModel: 'fixed', paymentValue: 8000, patientCount: 144, revenue: 21_600 },
  { id: 'd3', name: 'Dr. Mona Ali', specialty: 'Cardiologist', clinicId: 'c2', paymentModel: 'percentage', paymentValue: 65, patientCount: 186, revenue: 36_270 },
  { id: 'd4', name: 'Dr. Omar Khaled', specialty: 'Pediatrician', clinicId: 'c3', paymentModel: 'percentage', paymentValue: 55, patientCount: 162, revenue: 17_820 },
  { id: 'd5', name: 'Dr. Fatma Ibrahim', specialty: 'Pediatrician', clinicId: 'c3', paymentModel: 'fixed', paymentValue: 7500, patientCount: 92, revenue: 18_400 },
  { id: 'd6', name: 'Dr. Youssef Mohamed', specialty: 'Orthopedic Surgeon', clinicId: 'c4', paymentModel: 'percentage', paymentValue: 70, patientCount: 128, revenue: 22_400 },
];

// Data scaled by time scope
const SCOPE_MULTIPLIERS: Record<TimeScope, number> = {
  today: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

const LAB_REVENUE_BY_SCOPE: Record<TimeScope, number> = {
  today: 11_120,
  weekly: 77_840,
  monthly: 333_600,
  yearly: 4_058_800,
};

// ─── Helpers ─────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` :
  v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` :
  `$${v.toLocaleString()}`;

const formatNumber = (v: number) =>
  v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : v.toLocaleString();

// ─── Component ───────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Global state
  const [timeScope, setTimeScope] = useState<TimeScope>('today');
  const [managementTab, setManagementTab] = useState<ManagementTab>('clinics');
  const [groupBy, setGroupBy] = useState<GroupBy>('clinic');
  const [searchClinic, setSearchClinic] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');

  // Modal state
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'clinic' | 'doctor'; id: string; name: string } | null>(null);

  // Form state — clinic
  const [clinicForm, setClinicForm] = useState({ name: '', specialty: '', servicePrice: '' });
  // Form state — doctor
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: '', clinicId: '', paymentModel: 'percentage' as 'fixed' | 'percentage', paymentValue: '' });

  // Local data (mutable for demo)
  const [clinics, setClinics] = useState<Clinic[]>(CLINICS);
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);

  const multiplier = SCOPE_MULTIPLIERS[timeScope];
  const adminName = user?.name || 'Administrator';

  const quickActions = [
    {
      title: 'Reception Dashboard',
      description: 'Patient registration and queue',
      icon: Users,
      path: '/reception',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Laboratory Reception',
      description: 'Lab tests and reports',
      icon: FlaskConical,
      path: '/laboratory-reception',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Lab Technician',
      description: 'Process tests and manage results',
      icon: Microscope,
      path: '/technician',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Doctor Dashboard',
      description: 'Patient appointments and queue',
      icon: Stethoscope,
      path: '/doctor',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      path: '/settings',
      color: 'from-gray-500 to-gray-600',
    },
  ];

  // ── Scaled KPIs ──
  const totalPatients = Math.round(1_247 * multiplier);
  const totalRevenue = Math.round(236_660 * multiplier);
  const avgWaitingTime = timeScope === 'today' ? 18 : Math.round(16 + Math.random() * 6);
  const turnoverRate = timeScope === 'today' ? 94 : Math.round(90 + Math.random() * 8);

  // ── Most Busy Clinic ──
  const busiestClinic = useMemo(() =>
    clinics.reduce((a, b) => a.patientCount > b.patientCount ? a : b),
    [clinics]
  );

  // ── Financial Data ──
  const financialData: FinancialRow[] = useMemo(() => {
    if (groupBy === 'clinic') {
      return clinics.map((c) => ({ name: c.name, cases: Math.round(c.patientCount * multiplier), revenue: Math.round(c.revenue * multiplier) }));
    }
    if (groupBy === 'doctor') {
      return doctors.map((d) => ({ name: d.name, cases: Math.round(d.patientCount * multiplier), revenue: Math.round(d.revenue * multiplier) }));
    }
    // laboratory
    return [{ name: 'Laboratory', cases: Math.round(139 * multiplier), revenue: LAB_REVENUE_BY_SCOPE[timeScope] }];
  }, [groupBy, timeScope, clinics, doctors, multiplier]);

  const totalFinancialRevenue = financialData.reduce((s, r) => s + r.revenue, 0);
  const totalCases = financialData.reduce((s, r) => s + r.cases, 0);

  // Filtered lists
  const filteredClinics = clinics.filter(
    (c) => c.name.toLowerCase().includes(searchClinic.toLowerCase()) ||
           c.specialty.toLowerCase().includes(searchClinic.toLowerCase())
  );
  const filteredDoctors = doctors.filter(
    (d) => d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
           d.specialty.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  const sortedDoctors = useMemo(() =>
    [...filteredDoctors].sort((a, b) => b.revenue - a.revenue),
    [filteredDoctors]
  );

  // ── Clinic Modal Handlers ──
  const openClinicAdd = () => {
    setEditingClinic(null);
    setClinicForm({ name: '', specialty: '', servicePrice: '' });
    setShowClinicModal(true);
  };
  const openClinicEdit = (c: Clinic) => {
    setEditingClinic(c);
    setClinicForm({ name: c.name, specialty: c.specialty, servicePrice: String(c.servicePrice) });
    setShowClinicModal(true);
  };
  const saveClinic = () => {
    const price = parseFloat(clinicForm.servicePrice) || 0;
    if (!clinicForm.name.trim()) return;
    if (editingClinic) {
      setClinics((prev) => prev.map((c) => c.id === editingClinic.id ? { ...c, name: clinicForm.name, specialty: clinicForm.specialty, servicePrice: price } : c));
    } else {
      const newClinic: Clinic = {
        id: `c${Date.now()}`,
        name: clinicForm.name,
        specialty: clinicForm.specialty,
        servicePrice: price,
        patientCount: 0,
        revenue: 0,
        doctorIds: [],
      };
      setClinics((prev) => [...prev, newClinic]);
    }
    setShowClinicModal(false);
  };

  // ── Doctor Modal Handlers ──
  const openDoctorAdd = () => {
    setEditingDoctor(null);
    setDoctorForm({ name: '', specialty: '', clinicId: doctors[0]?.clinicId ?? '', paymentModel: 'percentage', paymentValue: '' });
    setShowDoctorModal(true);
  };
  const openDoctorEdit = (d: Doctor) => {
    setEditingDoctor(d);
    setDoctorForm({ name: d.name, specialty: d.specialty, clinicId: d.clinicId, paymentModel: d.paymentModel, paymentValue: String(d.paymentValue) });
    setShowDoctorModal(true);
  };
  const saveDoctor = () => {
    const val = parseFloat(doctorForm.paymentValue) || 0;
    if (!doctorForm.name.trim() || !doctorForm.clinicId) return;
    if (editingDoctor) {
      setDoctors((prev) => prev.map((d) => d.id === editingDoctor.id ? { ...d, name: doctorForm.name, specialty: doctorForm.specialty, clinicId: doctorForm.clinicId, paymentModel: doctorForm.paymentModel, paymentValue: val } : d));
    } else {
      const newDoctor: Doctor = {
        id: `d${Date.now()}`,
        name: doctorForm.name,
        specialty: doctorForm.specialty,
        clinicId: doctorForm.clinicId,
        paymentModel: doctorForm.paymentModel,
        paymentValue: val,
        patientCount: 0,
        revenue: 0,
      };
      setDoctors((prev) => [...prev, newDoctor]);
    }
    setShowDoctorModal(false);
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) return;
    if (showDeleteConfirm.type === 'clinic') {
      setClinics((prev) => prev.filter((c) => c.id !== showDeleteConfirm.id));
    } else {
      setDoctors((prev) => prev.filter((d) => d.id !== showDeleteConfirm.id));
    }
    setShowDeleteConfirm(null);
  };

  const getClinicName = (id: string) => clinics.find((c) => c.id === id)?.name ?? 'Unassigned';
  const maxBarRevenue = Math.max(...financialData.map((r) => r.revenue), 1);

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full p-6 space-y-5">

        {/* ==================================================== */}
        {/* HEADER                                                 */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.75rem] text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-[0.9375rem] mt-1">
              System overview, management &amp; financial reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <p className="text-foreground font-medium">{adminName}</p>
            </div>
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="size-5 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* ZONE 1 — TOP CONTROL BAR: Time Filter                  */}
        {/* ==================================================== */}
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <span className="text-[0.875rem] text-foreground font-medium">Time Scope</span>
            </div>
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
              {([
                { key: 'today', label: 'Today' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'yearly', label: 'Yearly' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTimeScope(opt.key)}
                  className={`py-2 px-4 rounded-md transition-all duration-200 text-[0.8125rem] ${
                    timeScope === opt.key
                      ? 'bg-card shadow-sm text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* ZONE 2 — KPI SUMMARY STRIP                             */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.8125rem] text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-[2rem] leading-none text-foreground">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50">
                <DollarSign className="size-5 text-emerald-600" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.8125rem] text-muted-foreground mb-1">Total Patients</p>
                <p className="text-[2rem] leading-none text-foreground">{formatNumber(totalPatients)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.8125rem] text-muted-foreground mb-1">Avg. Waiting Time</p>
                <p className="text-[2rem] leading-none text-foreground">{avgWaitingTime} min</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50">
                <Clock className="size-5 text-amber-600" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.8125rem] text-muted-foreground mb-1">Turnover Rate</p>
                <p className="text-[2rem] leading-none text-foreground">{turnoverRate}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10">
                <TrendingUp className="size-5 text-primary" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* QUICK ACCESS — Dashboard Shortcuts                     */}
        {/* ==================================================== */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-[1.125rem] text-foreground">Quick Access</h2>
            <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Jump to any dashboard</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-5">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => action.path !== '#' && navigate(action.path)}
                disabled={action.path === '#'}
                className="group relative overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="size-4 text-white" strokeWidth={2} />
                    </div>
                    <Eye className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <h3 className="text-[0.8125rem] text-foreground font-medium leading-tight">{action.title}</h3>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1 leading-snug">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ==================================================== */}
        {/* ZONE 3 — PERFORMANCE INSIGHTS                          */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* A. Clinics Performance */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-[1.125rem] text-foreground">Clinics Performance</h2>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Building2 className="size-3 text-emerald-600" />
                <span className="text-[0.6875rem] text-emerald-700 font-medium">
                  Most Busy: {busiestClinic.name}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[...clinics].sort((a, b) => b.patientCount - a.patientCount).map((c, i) => {
                const pct = Math.round((c.patientCount / clinics.reduce((s, x) => s + x.patientCount, 0)) * 100);
                return (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.6875rem] text-muted-foreground w-4 text-right">{i + 1}</span>
                        <span className="text-[0.875rem] text-foreground font-medium">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[0.8125rem] text-muted-foreground">{formatNumber(c.patientCount)} pts</span>
                        <span className="text-[0.8125rem] text-foreground font-medium w-16 text-right">{formatCurrency(c.revenue * multiplier)}</span>
                      </div>
                    </div>
                    <div className="ml-6 h-2 rounded-full bg-secondary/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.id === busiestClinic.id ? 'bg-primary' : 'bg-primary/40'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Doctors Performance */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="text-[1.125rem] text-foreground">Doctors Performance</h2>
              <p className="text-[0.75rem] text-muted-foreground mt-0.5">Sorted by revenue (top performers first)</p>
            </div>
            <div className="p-4 space-y-3">
              {sortedDoctors.map((d, i) => {
                const isTop = i === 0;
                return (
                  <div
                    key={d.id}
                    className={`rounded-lg p-3.5 border transition-colors duration-200 ${
                      isTop ? 'bg-emerald-50/50 border-emerald-200' : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`size-7 rounded-full flex items-center justify-center text-[0.6875rem] font-bold ${
                          isTop ? 'bg-emerald-600 text-white' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-[0.875rem] text-foreground font-medium">{d.name}</p>
                          <p className="text-[0.6875rem] text-muted-foreground">{getClinicName(d.clinicId)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.875rem] text-foreground font-medium">{formatNumber(d.patientCount * multiplier)} pts</p>
                        <p className="text-[0.8125rem] text-primary">{formatCurrency(d.revenue * multiplier)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* C. Waiting Time Insight */}
        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-50">
                <Clock className="size-5 text-amber-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[0.8125rem] text-muted-foreground">Average Waiting Time</p>
                <p className="text-[1.75rem] text-foreground font-medium">{avgWaitingTime} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[0.8125rem] font-medium flex items-center gap-1 ${
                avgWaitingTime > 20 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {avgWaitingTime > 20 ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
                {avgWaitingTime > 20 ? 'Above target' : 'Within target'}
              </span>
              <span className="text-[0.6875rem] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">Target: ≤20 min</span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* ZONE 4 — MANAGEMENT SECTION (Clinics & Doctors)        */}
        {/* ==================================================== */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          {/* Tab Bar */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
              <button
                onClick={() => setManagementTab('clinics')}
                className={`py-2 px-5 rounded-md transition-all duration-200 text-[0.875rem] flex items-center gap-1.5 ${
                  managementTab === 'clinics'
                    ? 'bg-card shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="size-4" />
                Clinics
              </button>
              <button
                onClick={() => setManagementTab('doctors')}
                className={`py-2 px-5 rounded-md transition-all duration-200 text-[0.875rem] flex items-center gap-1.5 ${
                  managementTab === 'doctors'
                    ? 'bg-card shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Stethoscope className="size-4" />
                Doctors
              </button>
            </div>

            <button
              onClick={managementTab === 'clinics' ? openClinicAdd : openDoctorAdd}
              className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all duration-200 text-[0.8125rem]"
            >
              <Plus className="size-3.5" />
              Add {managementTab === 'clinics' ? 'Clinic' : 'Doctor'}
            </button>
          </div>

          {/* ── Clinics Management Table ── */}
          {managementTab === 'clinics' && (
            <div className="p-5">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchClinic}
                  onChange={(e) => setSearchClinic(e.target.value)}
                  placeholder="Search clinics…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.875rem]"
                />
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-[0.875rem]">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Clinic</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Specialty</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Service Price</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Patients</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Revenue</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClinics.map((c, i) => (
                      <tr key={c.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors`}>
                        <td className="py-3 px-4 text-foreground font-medium">{c.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{c.specialty}</td>
                        <td className="py-3 px-4 text-center text-foreground">${c.servicePrice}</td>
                        <td className="py-3 px-4 text-center text-foreground">{formatNumber(c.patientCount)}</td>
                        <td className="py-3 px-4 text-center text-primary font-medium">{formatCurrency(c.revenue * multiplier)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openClinicEdit(c)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Edit">
                              <Edit2 className="size-3.5" />
                            </button>
                            <button onClick={() => setShowDeleteConfirm({ type: 'clinic', id: c.id, name: c.name })} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Doctors Management Table ── */}
          {managementTab === 'doctors' && (
            <div className="p-5">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                  placeholder="Search doctors…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.875rem]"
                />
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-[0.875rem]">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Doctor</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Specialty</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Clinic</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Payment</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Patients</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Revenue</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((d, i) => (
                      <tr key={d.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors`}>
                        <td className="py-3 px-4 text-foreground font-medium">{d.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{d.specialty}</td>
                        <td className="py-3 px-4 text-foreground">{getClinicName(d.clinicId)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[0.6875rem] font-medium ${
                            d.paymentModel === 'fixed'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {d.paymentModel === 'fixed' ? `$${d.paymentValue.toLocaleString()}/mo` : `${d.paymentValue}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-foreground">{formatNumber(d.patientCount * multiplier)}</td>
                        <td className="py-3 px-4 text-center text-primary font-medium">{formatCurrency(d.revenue * multiplier)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openDoctorEdit(d)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Edit">
                              <Edit2 className="size-3.5" />
                            </button>
                            <button onClick={() => setShowDeleteConfirm({ type: 'doctor', id: d.id, name: d.name })} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* ZONE 5 — FINANCIAL REPORTS                             */}
        {/* ==================================================== */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="size-5 text-primary" />
                <h2 className="text-[1.125rem] text-foreground">Financial Reports</h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Group By */}
                <div className="flex items-center gap-2">
                  <span className="text-[0.8125rem] text-muted-foreground">Group by</span>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                    className="px-3 py-2 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.8125rem] text-foreground pr-8"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="clinic">Clinic</option>
                    <option value="laboratory">Laboratory</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-secondary/20 rounded-lg p-4">
                <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                <p className="text-[1.5rem] text-foreground font-medium">{formatCurrency(totalFinancialRevenue)}</p>
              </div>
              <div className="bg-secondary/20 rounded-lg p-4">
                <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Total Cases</p>
                <p className="text-[1.5rem] text-foreground font-medium">{formatNumber(totalCases)}</p>
              </div>
              <div className="bg-secondary/20 rounded-lg p-4">
                <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">Avg. per {groupBy === 'doctor' ? 'Doctor' : groupBy === 'clinic' ? 'Clinic' : 'Lab'}</p>
                <p className="text-[1.5rem] text-foreground font-medium">
                  {formatCurrency(financialData.length ? Math.round(totalFinancialRevenue / financialData.length) : 0)}
                </p>
              </div>
            </div>

            {/* Lightweight Bar Chart */}
            <div>
              <h3 className="text-[0.9375rem] text-foreground font-medium mb-3">Revenue Breakdown</h3>
              <div className="space-y-2.5">
                {financialData.map((row) => {
                  const pct = Math.round((row.revenue / maxBarRevenue) * 100);
                  const avgCost = row.cases ? Math.round(row.revenue / row.cases) : 0;
                  return (
                    <div key={row.name} className="flex items-center gap-3">
                      <span className="text-[0.8125rem] text-foreground w-44 truncate text-right pr-2">{row.name}</span>
                      <div className="flex-1 h-6 rounded-md bg-secondary/30 overflow-hidden">
                        <div
                          className="h-full rounded-md bg-gradient-to-r from-primary/70 to-primary transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        >
                          {pct > 15 && (
                            <span className="text-[0.6875rem] text-white font-medium">{formatCurrency(row.revenue)}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[0.75rem] text-muted-foreground w-16 text-right">{row.cases} cases</span>
                      <span className="text-[0.75rem] text-muted-foreground w-16 text-right">{avgCost > 0 ? `$${avgCost}` : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table View */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-[0.875rem]">
                <thead>
                  <tr className="bg-secondary/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{groupBy === 'doctor' ? 'Doctor' : groupBy === 'clinic' ? 'Clinic' : 'Entity'}</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Cases</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Revenue</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.map((row, i) => {
                    const share = totalFinancialRevenue ? Math.round((row.revenue / totalFinancialRevenue) * 100) : 0;
                    return (
                      <tr key={row.name} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors`}>
                        <td className="py-3 px-4 text-foreground font-medium">{row.name}</td>
                        <td className="py-3 px-4 text-center text-foreground">{formatNumber(row.cases)}</td>
                        <td className="py-3 px-4 text-center text-primary font-medium">{formatCurrency(row.revenue)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[0.6875rem] font-medium ${
                            share >= 30 ? 'bg-emerald-50 text-emerald-700' : share >= 15 ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {share}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODALS                                                  */}
      {/* ==================================================== */}

      {/* ── Clinic Modal ── */}
      {showClinicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowClinicModal(false)}>
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-[1.125rem] text-foreground">
                {editingClinic ? 'Edit Clinic' : 'Add New Clinic'}
              </h3>
              <button onClick={() => setShowClinicModal(false)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Clinic Name</label>
                <input
                  type="text"
                  value={clinicForm.name}
                  onChange={(e) => setClinicForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., General Medicine"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Specialty</label>
                <input
                  type="text"
                  value={clinicForm.specialty}
                  onChange={(e) => setClinicForm((p) => ({ ...p, specialty: e.target.value }))}
                  placeholder="e.g., Primary Care"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Service Price ($)</label>
                <input
                  type="number"
                  value={clinicForm.servicePrice}
                  onChange={(e) => setClinicForm((p) => ({ ...p, servicePrice: e.target.value }))}
                  placeholder="e.g., 150"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => setShowClinicModal(false)} className="py-2.5 px-5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all text-[0.875rem]">
                Cancel
              </button>
              <button onClick={saveClinic} className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all text-[0.875rem]">
                <Save className="size-3.5" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Doctor Modal ── */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDoctorModal(false)}>
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-[1.125rem] text-foreground">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h3>
              <button onClick={() => setShowDoctorModal(false)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Doctor Name</label>
                <input
                  type="text"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Dr. Sarah Williams"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Specialty</label>
                <input
                  type="text"
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, specialty: e.target.value }))}
                  placeholder="e.g., Cardiologist"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Assign Clinic</label>
                <select
                  value={doctorForm.clinicId}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, clinicId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                >
                  <option value="">Select clinic…</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Payment Model</label>
                  <select
                    value={doctorForm.paymentModel}
                    onChange={(e) => setDoctorForm((p) => ({ ...p, paymentModel: e.target.value as 'fixed' | 'percentage' }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                  >
                    <option value="percentage">% of Revenue</option>
                    <option value="fixed">Fixed Salary</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">
                    {doctorForm.paymentModel === 'fixed' ? 'Monthly Salary ($)' : 'Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    value={doctorForm.paymentValue}
                    onChange={(e) => setDoctorForm((p) => ({ ...p, paymentValue: e.target.value }))}
                    placeholder={doctorForm.paymentModel === 'fixed' ? '8000' : '60'}
                    className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => setShowDoctorModal(false)} className="py-2.5 px-5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all text-[0.875rem]">
                Cancel
              </button>
              <button onClick={saveDoctor} className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all text-[0.875rem]">
                <Save className="size-3.5" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-sm border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center space-y-3">
              <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <h3 className="text-[1.125rem] text-foreground">Delete {showDeleteConfirm.type === 'clinic' ? 'Clinic' : 'Doctor'}?</h3>
              <p className="text-[0.875rem] text-muted-foreground">
                Are you sure you want to delete <strong className="text-foreground">{showDeleteConfirm.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 border-t border-border">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 px-4 rounded-lg border-2 border-border bg-card text-foreground hover:bg-secondary/30 transition-all text-[0.875rem]">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 px-4 rounded-lg bg-destructive text-white hover:bg-red-600 transition-all text-[0.875rem]">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
