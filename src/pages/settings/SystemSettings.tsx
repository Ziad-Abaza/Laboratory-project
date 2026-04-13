import { useState, useMemo } from 'react';
import {
  Monitor, Bell, Settings, Volume2, Users, Shield,
  Search, Plus, Edit2, Trash2, X, Save, Check,
  ArrowLeft, Tv, Play, Eye,
  Clock, Hash, Timer, AlertCircle, CheckCircle2, ChevronRight,
  Activity, User, LogOut, FlaskConical
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────

type SettingsSection =
  | 'queue-display'
  | 'notifications'
  | 'queue-system'
  | 'sound'
  | 'user-patient'
  | 'roles';

type UserRole = 'admin' | 'reception' | 'doctor' | 'technician';
type UserManagementTab = 'users' | 'patients';

interface SysUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinic?: string;
  status: 'active' | 'inactive';
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  visits: number;
  lastVisit: string;
}

interface NotificationConfig {
  id: string;
  label: string;
  icon: 'alert-circle' | 'check-circle' | 'activity';
  enabled: boolean;
  inApp: boolean;
  sound: boolean;
  visual: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────

const CLINICS = ['General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Laboratory'];

const INITIAL_USERS: SysUser[] = [
  { id: 'u1', name: 'Administrator', email: 'admin@clinic.com', role: 'admin', status: 'active' },
  { id: 'u2', name: 'Reception Staff', email: 'reception@clinic.com', role: 'reception', clinic: 'General Medicine', status: 'active' },
  { id: 'u3', name: 'Dr. Sarah Williams', email: 'sarah@clinic.com', role: 'doctor', clinic: 'General Medicine', status: 'active' },
  { id: 'u4', name: 'Dr. Mona Ali', email: 'mona@clinic.com', role: 'doctor', clinic: 'Cardiology', status: 'active' },
  { id: 'u5', name: 'Tech. Mai Hassan', email: 'mai@clinic.com', role: 'technician', clinic: 'Laboratory', status: 'active' },
  { id: 'u6', name: 'Dr. Omar Khaled', email: 'omar@clinic.com', role: 'doctor', clinic: 'Pediatrics', status: 'inactive' },
];

const INITIAL_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Ahmed Hassan', phone: '+20 123 456 7890', age: 34, gender: 'Male', visits: 5, lastVisit: '2024-01-15' },
  { id: 'p2', name: 'Mona Ali', phone: '+20 111 222 3333', age: 28, gender: 'Female', visits: 3, lastVisit: '2024-01-14' },
  { id: 'p3', name: 'Omar Khaled', phone: '+20 100 555 6666', age: 45, gender: 'Male', visits: 12, lastVisit: '2024-01-13' },
  { id: 'p4', name: 'Fatma Ibrahim', phone: '+20 122 777 8888', age: 52, gender: 'Female', visits: 8, lastVisit: '2024-01-12' },
  { id: 'p5', name: 'Youssef Mohamed', phone: '+20 105 999 0000', age: 19, gender: 'Male', visits: 2, lastVisit: '2024-01-11' },
];

const INITIAL_NOTIFICATIONS: NotificationConfig[] = [
  { id: 'n1', label: 'New Patient Arrival', icon: 'activity', enabled: true, inApp: true, sound: true, visual: true },
  { id: 'n2', label: 'Lab Test Completed', icon: 'check-circle', enabled: true, inApp: true, sound: false, visual: true },
  { id: 'n3', label: 'Patient Transfer', icon: 'alert-circle', enabled: false, inApp: true, sound: false, visual: false },
  { id: 'n4', label: 'Queue Overflow Alert', icon: 'alert-circle', enabled: true, inApp: true, sound: true, visual: true },
  { id: 'n5', label: 'Doctor Status Changed', icon: 'activity', enabled: false, inApp: false, sound: false, visual: true },
];

const PERMISSIONS: { feature: string; permissions: Record<UserRole, boolean> }[] = [
  { feature: 'Patient Registration', permissions: { admin: true, reception: true, doctor: true, technician: false } },
  { feature: 'Queue Management', permissions: { admin: true, reception: true, doctor: true, technician: false } },
  { feature: 'Lab Requests', permissions: { admin: true, reception: true, doctor: false, technician: true } },
  { feature: 'Lab Results Entry', permissions: { admin: true, reception: false, doctor: false, technician: true } },
  { feature: 'Doctor Dashboard', permissions: { admin: true, reception: false, doctor: true, technician: false } },
  { feature: 'Financial Reports', permissions: { admin: true, reception: false, doctor: false, technician: false } },
  { feature: 'Clinic Management', permissions: { admin: true, reception: false, doctor: false, technician: false } },
  { feature: 'User Management', permissions: { admin: true, reception: false, doctor: false, technician: false } },
  { feature: 'Roles & Permissions', permissions: { admin: true, reception: false, doctor: false, technician: false } },
  { feature: 'System Settings', permissions: { admin: true, reception: false, doctor: false, technician: false } },
];

const ROLES: { key: UserRole; label: string; color: string; gradient: string }[] = [
  { key: 'admin', label: 'Admin', color: 'bg-destructive/10 text-destructive', gradient: 'from-red-500 to-red-600' },
  { key: 'reception', label: 'Reception', color: 'bg-primary/10 text-primary', gradient: 'from-blue-500 to-blue-600' },
  { key: 'doctor', label: 'Doctor', color: 'bg-emerald-50 text-emerald-700', gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'technician', label: 'Technician', color: 'bg-amber-50 text-amber-700', gradient: 'from-amber-500 to-amber-600' },
];

// ─── Reusable Toggle Component ──────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-5' : ''
      }`} />
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────

export default function SystemSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SettingsSection>('queue-display');
  const [saveMessage, setSaveMessage] = useState('');

  // ── Queue Display State ──
  const [queueDisplayEnabled, setQueueDisplayEnabled] = useState(true);
  const [selectedClinics, setSelectedClinics] = useState<string[]>(['General Medicine', 'Cardiology', 'Pediatrics']);
  const [displayMode, setDisplayMode] = useState<'single' | 'multi'>('multi');
  const [showCurrentPatient, setShowCurrentPatient] = useState(true);
  const [showNextPatient, setShowNextPatient] = useState(true);
  const [showClinicName, setShowClinicName] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [voiceAnnouncements, setVoiceAnnouncements] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [voiceStyle, setVoiceStyle] = useState<'male' | 'female'>('female');

  // ── Notifications State ──
  const [notifications, setNotifications] = useState<NotificationConfig[]>(INITIAL_NOTIFICATIONS);

  // ── Queue & System State ──
  const [autoCallNext, setAutoCallNext] = useState(false);
  const [manualControl, setManualControl] = useState(true);
  const [allowSkip, setAllowSkip] = useState(true);
  const [allowRecall, setAllowRecall] = useState(true);
  const [ticketFormat, setTicketFormat] = useState('A-101');
  const [resetDaily, setResetDaily] = useState(true);
  const [queueLimit, setQueueLimit] = useState(50);
  const [consultationTime, setConsultationTime] = useState(15);
  const [callDelay, setCallDelay] = useState(30);

  // ── Sound State ──
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [volume, setVolume] = useState(75);
  const [voiceSpeed, setVoiceSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [soundLanguage, setSoundLanguage] = useState('en');

  // ── User & Patient State ──
  const [userTab, setUserTab] = useState<UserManagementTab>('users');
  const [users, setUsers] = useState<SysUser[]>(INITIAL_USERS);
  const [patients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [searchUser, setSearchUser] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SysUser | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'reception' as UserRole, clinic: '' });

  // ── Permissions State ──
  const [permissions, setPermissions] = useState<Record<string, Record<UserRole, boolean>>>(
    PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.feature]: { ...p.permissions } }), {})
  );
  const [showPermissionsConfirm, setShowPermissionsConfirm] = useState(false);

  // ── Helpers ──
  const handleSave = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const toggleClinicSelection = (clinic: string) => {
    setSelectedClinics((prev) =>
      prev.includes(clinic) ? prev.filter((c) => c !== clinic) : [...prev, clinic]
    );
  };

  const toggleNotification = (id: string, field: 'enabled' | 'inApp' | 'sound' | 'visual') => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, [field]: !n[field] } : n)
    );
  };

  const togglePermission = (feature: string, role: UserRole) => {
    setPermissions((prev) => ({
      ...prev,
      [feature]: { ...prev[feature], [role]: !prev[feature][role] },
    }));
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(searchPatient.toLowerCase()) || p.phone.includes(searchPatient)
  );

  const saveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim()) return;
    if (editingUser) {
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...userForm } : u));
    } else {
      setUsers((prev) => [...prev, { id: `u${Date.now()}`, ...userForm, status: 'active' }]);
    }
    setShowUserModal(false);
    handleSave('User saved successfully');
  };

  // ── Sidebar Navigation Config ──
  const navItems: { key: SettingsSection; label: string; icon: React.ElementType; description: string }[] = [
    { key: 'queue-display', label: 'Queue Display', icon: Tv, description: 'TV screen configuration' },
    { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & delivery channels' },
    { key: 'queue-system', label: 'Queue & System', icon: Settings, description: 'Workflow & ticket settings' },
    { key: 'sound', label: 'Sound & Voice', icon: Volume2, description: 'TTS & audio configuration' },
    { key: 'user-patient', label: 'Users & Patients', icon: Users, description: 'Manage accounts & records' },
    { key: 'roles', label: 'Roles & Permissions', icon: Shield, description: 'Access control matrix' },
  ];

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full flex">

        {/* ════════════════════════════════════════════════════════ */}
        {/* LEFT SIDEBAR                                             */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="w-72 bg-card border-r border-border flex-shrink-0 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-border">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 text-[0.8125rem] mb-4 group"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                <Settings className="size-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[1rem] text-foreground font-medium">System Settings</p>
                <p className="text-[0.75rem] text-muted-foreground">Configuration & management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-primary/20' : 'bg-secondary/50 group-hover:bg-secondary/80'
                  }`}>
                    <item.icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[0.875rem] font-medium ${isActive ? 'text-primary' : ''}`}>
                      {item.label}
                    </p>
                    <p className="text-[0.6875rem] text-muted-foreground/70 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="mt-2">
                      <ChevronRight className="size-3 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="size-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.8125rem] text-foreground font-medium truncate">{user?.name}</p>
                  <p className="text-[0.6875rem] text-muted-foreground">Administrator</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
                title="Logout"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* RIGHT CONTENT AREA                                       */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 space-y-6">

            {/* ── SECTION: QUEUE DISPLAY ── */}
            {activeSection === 'queue-display' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[1.75rem] text-foreground">Queue Display Configuration</h1>
                  <p className="text-muted-foreground text-[0.9375rem] mt-1">
                    Configure how the TV screen displays the live patient queue
                  </p>
                </div>

                {/* Display Settings */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Monitor className="size-5 text-primary" />
                    Display Settings
                  </h2>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.9375rem] text-foreground">Enable Queue Screen</p>
                        <p className="text-[0.8125rem] text-muted-foreground">Turn the live queue display on or off</p>
                      </div>
                      <Toggle checked={queueDisplayEnabled} onChange={() => setQueueDisplayEnabled(!queueDisplayEnabled)} />
                    </div>

                    <div>
                      <p className="text-[0.9375rem] text-foreground mb-3">Select Clinics to Display</p>
                      <div className="flex flex-wrap gap-2">
                        {CLINICS.map((clinic) => (
                          <button
                            key={clinic}
                            onClick={() => toggleClinicSelection(clinic)}
                            className={`px-4 py-2 rounded-lg text-[0.875rem] border-2 transition-all duration-200 ${
                              selectedClinics.includes(clinic)
                                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                            }`}
                          >
                            {clinic}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[0.9375rem] text-foreground mb-2">Display Mode</p>
                      <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg w-fit">
                        {([
                          { key: 'single', label: 'Single Clinic' },
                          { key: 'multi', label: 'Multi-Clinic Grid' },
                        ] as const).map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setDisplayMode(opt.key)}
                            className={`py-2.5 px-5 rounded-md transition-all duration-200 text-[0.875rem] ${
                              displayMode === opt.key
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
                </div>

                {/* Screen Content */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Tv className="size-5 text-primary" />
                    Screen Content
                  </h2>

                  <div className="space-y-4">
                    {[
                      { label: 'Show Current Patient Number', desc: 'Display the ticket being served', value: showCurrentPatient, setter: setShowCurrentPatient },
                      { label: 'Show Next Patient Number', desc: 'Preview the upcoming ticket', value: showNextPatient, setter: setShowNextPatient },
                      { label: 'Show Clinic Name', desc: 'Display clinic name on screen', value: showClinicName, setter: setShowClinicName },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-[0.9375rem] text-foreground">{item.label}</p>
                          <p className="text-[0.8125rem] text-muted-foreground">{item.desc}</p>
                        </div>
                        <Toggle checked={item.value} onChange={() => item.setter(!item.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Options */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Eye className="size-5 text-primary" />
                    Visual Options
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <p className="text-[0.9375rem] text-foreground mb-2">Font Size</p>
                      <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg w-fit">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`py-2.5 px-5 rounded-md transition-all duration-200 text-[0.875rem] capitalize ${
                              fontSize === size
                                ? 'bg-card shadow-sm text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {[
                      { label: 'High Contrast Mode', desc: 'Enhanced contrast for large screens', value: highContrast, setter: setHighContrast },
                      { label: 'Fullscreen Mode', desc: 'Remove browser UI elements', value: fullscreenMode, setter: setFullscreenMode },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-[0.9375rem] text-foreground">{item.label}</p>
                          <p className="text-[0.8125rem] text-muted-foreground">{item.desc}</p>
                        </div>
                        <Toggle checked={item.value} onChange={() => item.setter(!item.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voice Announcements */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Volume2 className="size-5 text-primary" />
                    Voice Announcements
                  </h2>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.9375rem] text-foreground">Enable Voice Announcements</p>
                        <p className="text-[0.8125rem] text-muted-foreground">Announce patient numbers via speakers</p>
                      </div>
                      <Toggle checked={voiceAnnouncements} onChange={() => setVoiceAnnouncements(!voiceAnnouncements)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-[0.875rem] text-foreground">Language</label>
                        <select
                          value={voiceLanguage}
                          onChange={(e) => setVoiceLanguage(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                        >
                          <option value="en">English</option>
                          <option value="ar">Arabic</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 text-[0.875rem] text-foreground">Voice Style</label>
                        <select
                          value={voiceStyle}
                          onChange={(e) => setVoiceStyle(e.target.value as 'male' | 'female')}
                          className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className="text-[1.125rem] text-foreground font-medium mb-4 flex items-center gap-2">
                    <Eye className="size-5 text-primary" />
                    Live Preview — TV Screen
                  </h3>
                  <div className={`rounded-xl p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white ${
                    highContrast ? 'border-4 border-white' : 'border border-white/10'
                  } ${fullscreenMode ? 'aspect-video' : ''}`}>
                    <div className="text-center space-y-5">
                      <p className={`font-bold ${
                        fontSize === 'small' ? 'text-xl' : fontSize === 'medium' ? 'text-2xl' : 'text-3xl'
                      }`}>
                        {selectedClinics[0] || 'Select a clinic'}
                      </p>
                      {showCurrentPatient && (
                        <div>
                          <p className={`text-slate-400 ${fontSize === 'small' ? 'text-sm' : 'text-base'}`}>Now Serving</p>
                          <p className={`font-bold text-cyan-400 ${
                            fontSize === 'small' ? 'text-4xl' : fontSize === 'medium' ? 'text-5xl' : 'text-6xl'
                          }`}>
                            A-142
                          </p>
                        </div>
                      )}
                      {showNextPatient && (
                        <div className="pt-4 border-t border-white/10">
                          <p className={`text-slate-400 ${fontSize === 'small' ? 'text-sm' : 'text-base'}`}>Next</p>
                          <p className={`font-medium ${
                            fontSize === 'small' ? 'text-xl' : fontSize === 'medium' ? 'text-2xl' : 'text-3xl'
                          }`}>
                            A-143
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={() => handleSave('Queue display settings saved')}
                  className="flex items-center gap-2 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
                >
                  <Save className="size-4" />
                  Save Display Settings
                </button>
              </div>
            )}

            {/* ── SECTION: NOTIFICATIONS ── */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[1.75rem] text-foreground">Notifications Configuration</h1>
                  <p className="text-muted-foreground text-[0.9375rem] mt-1">
                    Manage notification types and delivery channels
                  </p>
                </div>

                <div className="space-y-3">
                  {notifications.map((notif) => {
                    const iconMap: Record<string, React.ElementType> = {
                      'activity': Activity,
                      'check-circle': CheckCircle2,
                      'alert-circle': AlertCircle,
                    };
                    const Icon = iconMap[notif.icon] || Activity;
                    return (
                      <div key={notif.id} className="bg-card rounded-lg p-5 shadow-sm border border-border hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg transition-colors duration-200 ${
                              notif.enabled ? 'bg-primary/10' : 'bg-muted/50'
                            }`}>
                              <Icon className={`size-5 ${notif.enabled ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            </div>
                            <div>
                              <p className="text-[0.9375rem] text-foreground font-medium">{notif.label}</p>
                              <p className="text-[0.75rem] text-muted-foreground">
                                {notif.enabled ? 'Active' : 'Disabled'}
                              </p>
                            </div>
                          </div>
                          <Toggle checked={notif.enabled} onChange={() => toggleNotification(notif.id, 'enabled')} />
                        </div>

                        {notif.enabled && (
                          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                            {[
                              { label: 'In-App Notification', field: 'inApp' as const },
                              { label: 'Sound Alert', field: 'sound' as const },
                              { label: 'Visual Highlight', field: 'visual' as const },
                            ].map((channel) => (
                              <div key={channel.field} className="flex items-center justify-between bg-secondary/20 rounded-lg px-4 py-2.5">
                                <span className="text-[0.8125rem] text-muted-foreground">{channel.label}</span>
                                <Toggle
                                  checked={notif[channel.field]}
                                  onChange={() => toggleNotification(notif.id, channel.field)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feed Preview */}
                <div className="bg-card rounded-lg shadow-sm border border-border">
                  <div className="p-5 border-b border-border">
                    <h2 className="text-[1.25rem] text-foreground">Recent Notifications Feed</h2>
                    <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Sample of how alerts appear</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { type: 'New Patient Arrival', name: 'Ahmed Hassan', time: '2 min ago', icon: 'activity' as const, color: 'text-primary', bg: 'bg-primary/10' },
                      { type: 'Lab Test Completed', name: 'CBC — Nour Ahmed', time: '15 min ago', icon: 'check-circle' as const, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { type: 'New Patient Arrival', name: 'Tarek Adel', time: '22 min ago', icon: 'activity' as const, color: 'text-primary', bg: 'bg-primary/10' },
                      { type: 'Queue Overflow', name: 'General Medicine — 12 waiting', time: '45 min ago', icon: 'alert-circle' as const, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((item, i) => {
                      const IconComp = { 'activity': Activity, 'check-circle': CheckCircle2, 'alert-circle': AlertCircle }[item.icon];
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors duration-200">
                          <div className={`p-2 rounded-lg ${item.bg} flex-shrink-0`}>
                            <IconComp className={`size-4 ${item.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.875rem] text-foreground font-medium">{item.name}</p>
                            <p className="text-[0.75rem] text-muted-foreground">{item.type} • {item.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleSave('Notification settings saved')}
                  className="flex items-center gap-2 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
                >
                  <Save className="size-4" />
                  Save Notification Settings
                </button>
              </div>
            )}

            {/* ── SECTION: QUEUE & SYSTEM ── */}
            {activeSection === 'queue-system' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[1.75rem] text-foreground">Queue & Workflow Settings</h1>
                  <p className="text-muted-foreground text-[0.9375rem] mt-1">
                    Configure queue behavior, ticket format, and timing
                  </p>
                </div>

                {/* Queue Behavior */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Activity className="size-5 text-primary" />
                    Queue Behavior
                  </h2>

                  <div className="space-y-4">
                    {[
                      { label: 'Auto-call Next Patient', desc: 'Automatically advance to next patient', value: autoCallNext, setter: setAutoCallNext },
                      { label: 'Manual Control Only', desc: 'Doctor must manually advance queue', value: manualControl, setter: setManualControl },
                      { label: 'Allow Skip Patient', desc: 'Permit skipping patients in queue', value: allowSkip, setter: setAllowSkip },
                      { label: 'Allow Recall Patient', desc: 'Permit recalling a previous patient', value: allowRecall, setter: setAllowRecall },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-[0.9375rem] text-foreground">{item.label}</p>
                          <p className="text-[0.8125rem] text-muted-foreground">{item.desc}</p>
                        </div>
                        <Toggle checked={item.value} onChange={() => item.setter(!item.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Settings */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Hash className="size-5 text-primary" />
                    Ticket Settings
                  </h2>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-[0.875rem] text-foreground">Ticket Format</label>
                        <input
                          type="text"
                          value={ticketFormat}
                          onChange={(e) => setTicketFormat(e.target.value)}
                          placeholder="e.g., A-101"
                          className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.9375rem] text-foreground"
                        />
                        <p className="text-[0.75rem] text-muted-foreground mt-1.5">Prefix-number pattern (e.g., A-101, B-205)</p>
                      </div>
                      <div>
                        <label className="block mb-2 text-[0.875rem] text-foreground">Queue Limit per Clinic</label>
                        <input
                          type="number"
                          value={queueLimit}
                          onChange={(e) => setQueueLimit(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.9375rem] text-foreground">Reset Numbering Daily</p>
                        <p className="text-[0.8125rem] text-muted-foreground">Start ticket count from 1 each new day</p>
                      </div>
                      <Toggle checked={resetDaily} onChange={() => setResetDaily(!resetDaily)} />
                    </div>
                  </div>
                </div>

                {/* Timing Settings */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Timer className="size-5 text-primary" />
                    Timing Settings
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-[0.875rem] text-foreground">Avg. Consultation Time (min)</label>
                      <input
                        type="number"
                        value={consultationTime}
                        onChange={(e) => setConsultationTime(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                      />
                      <p className="text-[0.75rem] text-muted-foreground mt-1.5">Used for wait time estimation</p>
                    </div>
                    <div>
                      <label className="block mb-2 text-[0.875rem] text-foreground">Delay Between Calls (sec)</label>
                      <input
                        type="number"
                        value={callDelay}
                        onChange={(e) => setCallDelay(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                      />
                      <p className="text-[0.75rem] text-muted-foreground mt-1.5">Time between voice announcements</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSave('Queue settings saved')}
                  className="flex items-center gap-2 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
                >
                  <Save className="size-4" />
                  Save Queue Settings
                </button>
              </div>
            )}

            {/* ── SECTION: SOUND ── */}
            {activeSection === 'sound' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[1.75rem] text-foreground">Audio & Voice Settings</h1>
                  <p className="text-muted-foreground text-[0.9375rem] mt-1">
                    Configure Text-to-Speech and sound announcements
                  </p>
                </div>

                {/* TTS Toggle */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Volume2 className="size-5 text-primary" />
                    Text-to-Speech
                  </h2>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[0.9375rem] text-foreground">Enable Text-to-Speech</p>
                      <p className="text-[0.8125rem] text-muted-foreground">Voice announcements for patient calls</p>
                    </div>
                    <Toggle checked={ttsEnabled} onChange={() => setTtsEnabled(!ttsEnabled)} />
                  </div>
                </div>

                {/* Volume */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5 flex items-center gap-2">
                    <Volume2 className="size-5 text-primary" />
                    Volume Control
                  </h2>

                  <div className="flex items-center gap-4">
                    <Volume2 className="size-5 text-muted-foreground" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="flex-1 h-2 rounded-full appearance-none bg-secondary/50 accent-primary cursor-pointer"
                    />
                    <span className="text-[1rem] text-foreground font-medium w-12 text-right tabular-nums">{volume}%</span>
                  </div>
                </div>

                {/* Voice Config */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-[1.25rem] text-foreground mb-5">Voice Configuration</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-[0.875rem] text-foreground">Voice Speed</label>
                      <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
                        {(['slow', 'normal', 'fast'] as const).map((speed) => (
                          <button
                            key={speed}
                            onClick={() => setVoiceSpeed(speed)}
                            className={`flex-1 py-2.5 px-3 rounded-md transition-all duration-200 text-[0.875rem] capitalize ${
                              voiceSpeed === speed
                                ? 'bg-card shadow-sm text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {speed}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-[0.875rem] text-foreground">Language</label>
                      <select
                        value={soundLanguage}
                        onChange={(e) => setSoundLanguage(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                      >
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className="text-[1.125rem] text-foreground font-medium mb-3 flex items-center gap-2">
                    <Play className="size-4 text-primary" />
                    Preview Announcement
                  </h3>
                  <div className="flex items-center justify-between bg-card/80 rounded-lg p-4">
                    <div>
                      <p className="text-[0.8125rem] text-muted-foreground mb-1">Sample</p>
                      <p className="text-[0.9375rem] text-foreground italic">
                        "Patient number 15, please proceed to Clinic 2"
                      </p>
                    </div>
                    <button
                      onClick={() => handleSave('Playing sample announcement...')}
                      className="flex items-center gap-2 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 text-[0.875rem]"
                    >
                      <Play className="size-4" />
                      Play
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleSave('Sound settings saved')}
                  className="flex items-center gap-2 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
                >
                  <Save className="size-4" />
                  Save Sound Settings
                </button>
              </div>
            )}

            {/* ── SECTION: USERS & PATIENTS ── */}
            {activeSection === 'user-patient' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[1.75rem] text-foreground">User & Patient Management</h1>
                  <p className="text-muted-foreground text-[0.9375rem] mt-1">
                    Manage system users and patient records
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg w-fit">
                  {([
                    { key: 'users', label: 'Users', icon: Users },
                    { key: 'patients', label: 'Patients', icon: User },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setUserTab(tab.key)}
                      className={`py-2.5 px-5 rounded-md transition-all duration-200 text-[0.875rem] flex items-center gap-1.5 ${
                        userTab === tab.key
                          ? 'bg-card shadow-sm text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <tab.icon className="size-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Users Table ── */}
                {userTab === 'users' && (
                  <div className="bg-card rounded-lg shadow-sm border border-border">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                      <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          placeholder="Search users…"
                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.875rem]"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setEditingUser(null);
                          setUserForm({ name: '', email: '', role: 'reception', clinic: '' });
                          setShowUserModal(true);
                        }}
                        className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 text-[0.875rem]"
                      >
                        <Plus className="size-4" />
                        Add User
                      </button>
                    </div>

                    <div className="rounded-lg overflow-hidden">
                      <table className="w-full text-[0.875rem]">
                        <thead>
                          <tr className="bg-secondary/30">
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Role</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Clinic</th>
                            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                            <th className="text-center py-3 px-4 text-muted-foreground font-medium w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u, i) => {
                            const roleConfig = ROLES.find((r) => r.key === u.role)!;
                            return (
                              <tr key={u.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors duration-200`}>
                                <td className="py-3.5 px-4 text-foreground font-medium">{u.name}</td>
                                <td className="py-3.5 px-4 text-muted-foreground">{u.email}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-md text-[0.75rem] font-medium ${roleConfig.color}`}>
                                    {roleConfig.label}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-muted-foreground">{u.clinic || '—'}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-md text-[0.75rem] font-medium ${
                                    u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {u.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingUser(u);
                                        setUserForm({ name: u.name, email: u.email, role: u.role, clinic: u.clinic || '' });
                                        setShowUserModal(true);
                                      }}
                                      className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors duration-200"
                                      title="Edit"
                                    >
                                      <Edit2 className="size-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))}
                                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors duration-200"
                                      title="Delete"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Patients Table ── */}
                {userTab === 'patients' && (
                  <div className="bg-card rounded-lg shadow-sm border border-border">
                    <div className="p-5 border-b border-border">
                      <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchPatient}
                          onChange={(e) => setSearchPatient(e.target.value)}
                          placeholder="Search patients…"
                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.875rem]"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg overflow-hidden">
                      <table className="w-full text-[0.875rem]">
                        <thead>
                          <tr className="bg-secondary/30">
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Age</th>
                            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Gender</th>
                            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Visits</th>
                            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Last Visit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPatients.map((p, i) => (
                            <tr key={p.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors duration-200`}>
                              <td className="py-3.5 px-4 text-foreground font-medium">{p.name}</td>
                              <td className="py-3.5 px-4 text-muted-foreground">{p.phone}</td>
                              <td className="py-3.5 px-4 text-center text-foreground">{p.age}</td>
                              <td className="py-3.5 px-4 text-center text-muted-foreground">{p.gender}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[0.75rem] font-medium">{p.visits}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center text-muted-foreground">{p.lastVisit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION: ROLES & PERMISSIONS ── */}
            {activeSection === 'roles' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[1.75rem] text-foreground">Roles & Permissions</h1>
                  <p className="text-muted-foreground text-[0.9375rem] mt-1">
                    Control access for each role across system features
                  </p>
                </div>

                {/* Roles Legend */}
                <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
                  <div className="flex flex-wrap gap-3">
                    {ROLES.map((role) => (
                      <div key={role.key} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${role.gradient}`}>
                          <Shield className="size-4 text-white" strokeWidth={2} />
                        </div>
                        <span className={`text-[0.875rem] font-medium ${role.color.split(' ')[1]}`}>
                          {role.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                  <div className="p-5 border-b border-border">
                    <h2 className="text-[1.25rem] text-foreground">Permissions Matrix</h2>
                    <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Click checkboxes to toggle access per role</p>
                  </div>
                  <div className="rounded-lg overflow-hidden">
                    <table className="w-full text-[0.875rem]">
                      <thead>
                        <tr className="bg-secondary/30">
                          <th className="text-left py-3.5 px-4 text-muted-foreground font-medium w-64">Feature</th>
                          {ROLES.map((role) => (
                            <th key={role.key} className="text-center py-3.5 px-4 text-muted-foreground font-medium">
                              <span className={`px-2.5 py-1 rounded-md text-[0.75rem] font-medium ${role.color}`}>
                                {role.label}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {PERMISSIONS.map((perm, i) => (
                          <tr key={perm.feature} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors duration-200`}>
                            <td className="py-3.5 px-4 text-foreground font-medium">{perm.feature}</td>
                            {ROLES.map((role) => {
                              const checked = permissions[perm.feature]?.[role.key] ?? false;
                              const isAdmin = role.key === 'admin';
                              return (
                                <td key={role.key} className="py-3.5 px-4 text-center">
                                  <button
                                    onClick={() => !isAdmin && togglePermission(perm.feature, role.key)}
                                    disabled={isAdmin}
                                    className={`inline-flex items-center justify-center size-7 rounded-lg transition-all duration-200 ${
                                      checked
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-muted text-muted-foreground/30'
                                    } ${isAdmin ? 'cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-primary/30 hover:-translate-y-0.5'}`}
                                    title={`${role.label}: ${checked ? 'Has access' : 'No access'}`}
                                  >
                                    {checked ? <Check className="size-3.5" /> : <X className="size-3" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[0.8125rem] text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="size-4 text-amber-600" />
                    Admin permissions are always enabled and cannot be modified
                  </p>
                  <button
                    onClick={() => setShowPermissionsConfirm(true)}
                    className="flex items-center gap-2 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
                  >
                    <Save className="size-4" />
                    Save Permissions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* TOAST — Save Message                                      */}
      {/* ════════════════════════════════════════════════════════ */}
      {saveMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-[0.875rem]">
            <CheckCircle2 className="size-4" />
            {saveMessage}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL — Add/Edit User                                     */}
      {/* ════════════════════════════════════════════════════════ */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowUserModal(false)}>
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-[1.125rem] text-foreground">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowUserModal(false)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-2 text-[0.875rem] text-foreground">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Dr. Sarah Williams"
                  className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.9375rem]"
                />
              </div>
              <div>
                <label className="block mb-2 text-[0.875rem] text-foreground">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@clinic.com"
                  className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60 text-[0.9375rem]"
                />
              </div>
              <div>
                <label className="block mb-2 text-[0.875rem] text-foreground">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                  className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                >
                  <option value="admin">Admin</option>
                  <option value="reception">Reception</option>
                  <option value="doctor">Doctor</option>
                  <option value="technician">Lab Technician</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-[0.875rem] text-foreground">Assigned Clinic (optional)</label>
                <select
                  value={userForm.clinic}
                  onChange={(e) => setUserForm((p) => ({ ...p, clinic: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-[0.9375rem] text-foreground"
                >
                  <option value="">None</option>
                  {CLINICS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => setShowUserModal(false)} className="py-2.5 px-5 rounded-lg border-2 border-border bg-card text-foreground hover:bg-secondary/30 transition-all duration-200 text-[0.875rem]">
                Cancel
              </button>
              <button onClick={saveUser} className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 text-[0.875rem]">
                <Save className="size-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL — Permissions Confirm                                 */}
      {/* ════════════════════════════════════════════════════════ */}
      {showPermissionsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPermissionsConfirm(false)}>
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-sm border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center space-y-3">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="size-6 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-[1.125rem] text-foreground font-medium">Save Permission Changes?</h3>
              <p className="text-[0.875rem] text-muted-foreground">
                This will update access controls for all roles. Changes take effect immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 border-t border-border">
              <button onClick={() => setShowPermissionsConfirm(false)} className="flex-1 py-3 px-4 rounded-lg border-2 border-border bg-card text-foreground hover:bg-secondary/30 transition-all duration-200 text-[0.875rem]">
                Cancel
              </button>
              <button
                onClick={() => { setShowPermissionsConfirm(false); handleSave('Permissions updated successfully'); }}
                className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 text-[0.875rem]"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
