import { useState, useMemo } from 'react';
import {
  Monitor, Bell, Settings, Volume2, Users, Shield,
  Search, Plus, Edit2, Trash2, X, Save, Check,
  ArrowLeft, Tv, Play, Eye, SkipForward, RotateCcw,
  Clock, Hash, Timer, AlertCircle, CheckCircle2, ChevronRight,
  Activity, User
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

interface User {
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

const INITIAL_USERS: User[] = [
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

const ROLES: { key: UserRole; label: string; color: string }[] = [
  { key: 'admin', label: 'Admin', color: 'bg-destructive/10 text-destructive' },
  { key: 'reception', label: 'Reception', color: 'bg-primary/10 text-primary' },
  { key: 'doctor', label: 'Doctor', color: 'bg-emerald-50 text-emerald-700' },
  { key: 'technician', label: 'Technician', color: 'bg-amber-50 text-amber-700' },
];

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
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [patients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [searchUser, setSearchUser] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
  const navItems: { key: SettingsSection; label: string; icon: React.ElementType }[] = [
    { key: 'queue-display', label: 'Queue Display (TV)', icon: Tv },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'queue-system', label: 'Queue & System', icon: Settings },
    { key: 'sound', label: 'Sound & Voice', icon: Volume2 },
    { key: 'user-patient', label: 'Users & Patients', icon: Users },
    { key: 'roles', label: 'Roles & Permissions', icon: Shield },
  ];

  // ── Section Renderer ──
  const renderSection = () => {
    switch (activeSection) {

      // ───────────────────────────────────────────────────────────
      // 1. QUEUE DISPLAY SETTINGS
      // ───────────────────────────────────────────────────────────
      case 'queue-display':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.25rem] text-foreground">Queue Display Configuration</h2>
              <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Configure how the TV screen displays the live queue</p>
            </div>

            {/* Display Settings */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Monitor className="size-4" />
                Display Settings
              </h3>

              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.875rem] text-foreground">Enable Queue Screen</p>
                  <p className="text-[0.75rem] text-muted-foreground">Turn the live queue display on or off</p>
                </div>
                <button
                  onClick={() => setQueueDisplayEnabled(!queueDisplayEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    queueDisplayEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    queueDisplayEnabled ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              {/* Clinics to Display */}
              <div>
                <p className="text-[0.875rem] text-foreground mb-2">Select Clinics to Display</p>
                <div className="flex flex-wrap gap-2">
                  {CLINICS.map((clinic) => (
                    <button
                      key={clinic}
                      onClick={() => toggleClinicSelection(clinic)}
                      className={`px-3 py-1.5 rounded-lg text-[0.8125rem] border transition-all duration-200 ${
                        selectedClinics.includes(clinic)
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {clinic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Mode */}
              <div>
                <p className="text-[0.875rem] text-foreground mb-2">Display Mode</p>
                <div className="flex gap-2 p-1 bg-card rounded-lg w-fit">
                  <button
                    onClick={() => setDisplayMode('single')}
                    className={`py-2 px-4 rounded-md transition-all duration-200 text-[0.8125rem] ${
                      displayMode === 'single'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Single Clinic
                  </button>
                  <button
                    onClick={() => setDisplayMode('multi')}
                    className={`py-2 px-4 rounded-md transition-all duration-200 text-[0.8125rem] ${
                      displayMode === 'multi'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Multi-Clinic Grid
                  </button>
                </div>
              </div>
            </div>

            {/* Screen Content */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Tv className="size-4" />
                Screen Content
              </h3>

              {[
                { label: 'Show Current Patient Number', value: showCurrentPatient, setter: setShowCurrentPatient },
                { label: 'Show Next Patient Number', value: showNextPatient, setter: setShowNextPatient },
                { label: 'Show Clinic Name', value: showClinicName, setter: setShowClinicName },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-[0.875rem] text-foreground">{item.label}</p>
                  <button
                    onClick={() => item.setter(!item.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      item.value ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      item.value ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Visual Options */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Eye className="size-4" />
                Visual Options
              </h3>

              {/* Font Size */}
              <div>
                <p className="text-[0.875rem] text-foreground mb-2">Font Size</p>
                <div className="flex gap-2 p-1 bg-card rounded-lg w-fit">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`py-2 px-4 rounded-md transition-all duration-200 text-[0.8125rem] capitalize ${
                        fontSize === size
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Contrast & Fullscreen */}
              {[
                { label: 'High Contrast Mode (for large screens)', value: highContrast, setter: setHighContrast },
                { label: 'Fullscreen Mode', value: fullscreenMode, setter: setFullscreenMode },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-[0.875rem] text-foreground">{item.label}</p>
                  <button
                    onClick={() => item.setter(!item.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      item.value ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      item.value ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Audio Settings */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Volume2 className="size-4" />
                Voice Announcements
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.875rem] text-foreground">Enable Voice Announcements</p>
                  <p className="text-[0.75rem] text-muted-foreground">Announce patient numbers via speakers</p>
                </div>
                <button
                  onClick={() => setVoiceAnnouncements(!voiceAnnouncements)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    voiceAnnouncements ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    voiceAnnouncements ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Language</label>
                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[0.875rem] text-foreground"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Voice Style</label>
                  <select
                    value={voiceStyle}
                    onChange={(e) => setVoiceStyle(e.target.value as 'male' | 'female')}
                    className="w-full px-3 py-2.5 rounded-lg bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[0.875rem] text-foreground"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-5 border-2 border-primary/20">
              <h3 className="text-[0.9375rem] text-foreground font-medium mb-3 flex items-center gap-1.5">
                <Eye className="size-4" />
                Preview — TV Screen
              </h3>
              <div className={`rounded-lg p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white ${
                highContrast ? 'border-4 border-white' : ''
              } ${fullscreenMode ? 'aspect-video' : ''}`}>
                <div className="text-center space-y-4">
                  <p className={`font-bold ${
                    fontSize === 'small' ? 'text-lg' : fontSize === 'medium' ? 'text-2xl' : 'text-3xl'
                  }`}>
                    {selectedClinics[0] || 'Select a clinic'}
                  </p>
                  {showCurrentPatient && (
                    <div>
                      <p className={`text-muted-foreground ${fontSize === 'small' ? 'text-sm' : 'text-base'}`}>Now Serving</p>
                      <p className={`font-bold text-primary-400 ${
                        fontSize === 'small' ? 'text-4xl' : fontSize === 'medium' ? 'text-5xl' : 'text-6xl'
                      }`}>
                        A-142
                      </p>
                    </div>
                  )}
                  {showNextPatient && (
                    <div className="pt-2 border-t border-white/10">
                      <p className={`text-muted-foreground ${fontSize === 'small' ? 'text-sm' : 'text-base'}`}>Next</p>
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
              className="flex items-center gap-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
            >
              <Save className="size-4" />
              Save Display Settings
            </button>
          </div>
        );

      // ───────────────────────────────────────────────────────────
      // 2. NOTIFICATIONS CENTER SETTINGS
      // ───────────────────────────────────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.25rem] text-foreground">Notifications Configuration</h2>
              <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Manage notification types and delivery channels</p>
            </div>

            {/* Notification Types */}
            <div className="space-y-3">
              {notifications.map((notif) => {
                const iconMap: Record<string, React.ElementType> = {
                  'activity': Activity,
                  'check-circle': CheckCircle2,
                  'alert-circle': AlertCircle,
                };
                const Icon = iconMap[notif.icon] || Activity;
                return (
                  <div key={notif.id} className="bg-secondary/20 rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${notif.enabled ? 'bg-primary/10' : 'bg-muted/50'}`}>
                          <Icon className={`size-4 ${notif.enabled ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        </div>
                        <p className="text-[0.9375rem] text-foreground font-medium">{notif.label}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(notif.id, 'enabled')}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          notif.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          notif.enabled ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>

                    {notif.enabled && (
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
                        {[
                          { label: 'In-App', field: 'inApp' as const },
                          { label: 'Sound Alert', field: 'sound' as const },
                          { label: 'Visual Highlight', field: 'visual' as const },
                        ].map((channel) => (
                          <div key={channel.field} className="flex items-center justify-between">
                            <span className="text-[0.8125rem] text-muted-foreground">{channel.label}</span>
                            <button
                              onClick={() => toggleNotification(notif.id, channel.field)}
                              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                                notif[channel.field] ? 'bg-primary' : 'bg-muted-foreground/30'
                              }`}
                            >
                              <div className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 ${
                                notif[channel.field] ? 'translate-x-4' : ''
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notification Feed Preview */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-[0.9375rem] text-foreground font-medium">Recent Notifications Feed</h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { type: 'New Patient Arrival', name: 'Ahmed Hassan', time: '2 min ago', icon: 'activity' as const, color: 'text-primary' },
                  { type: 'Lab Test Completed', name: 'CBC — Nour Ahmed', time: '15 min ago', icon: 'check-circle' as const, color: 'text-emerald-600' },
                  { type: 'New Patient Arrival', name: 'Tarek Adel', time: '22 min ago', icon: 'activity' as const, color: 'text-primary' },
                  { type: 'Queue Overflow', name: 'General Medicine — 12 waiting', time: '45 min ago', icon: 'alert-circle' as const, color: 'text-amber-600' },
                ].map((item, i) => {
                  const iconMap: Record<string, React.ElementType> = {
                    'activity': Activity,
                    'check-circle': CheckCircle2,
                    'alert-circle': AlertCircle,
                  };
                  const Icon = iconMap[item.icon];
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                      <div className={`p-1.5 rounded ${item.color === 'text-primary' ? 'bg-primary/10' : item.color === 'text-emerald-600' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <Icon className={`size-3.5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8125rem] text-foreground font-medium">{item.name}</p>
                        <p className="text-[0.6875rem] text-muted-foreground">{item.type} • {item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleSave('Notification settings saved')}
              className="flex items-center gap-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
            >
              <Save className="size-4" />
              Save Notification Settings
            </button>
          </div>
        );

      // ───────────────────────────────────────────────────────────
      // 3. QUEUE & SYSTEM SETTINGS
      // ───────────────────────────────────────────────────────────
      case 'queue-system':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.25rem] text-foreground">Queue & Workflow Settings</h2>
              <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Configure queue behavior, ticket format, and timing</p>
            </div>

            {/* Queue Behavior */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Activity className="size-4" />
                Queue Behavior
              </h3>

              {[
                { label: 'Auto-call Next Patient', desc: 'Automatically advance to next patient', value: autoCallNext, setter: setAutoCallNext },
                { label: 'Manual Control Only', desc: 'Doctor must manually advance queue', value: manualControl, setter: setManualControl },
                { label: 'Allow Skip Patient', desc: 'Permit skipping patients in queue', value: allowSkip, setter: setAllowSkip },
                { label: 'Allow Recall Patient', desc: 'Permit recalling a previous patient', value: allowRecall, setter: setAllowRecall },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.875rem] text-foreground">{item.label}</p>
                    <p className="text-[0.75rem] text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.setter(!item.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      item.value ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      item.value ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Ticket Settings */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Hash className="size-4" />
                Ticket Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Ticket Format</label>
                  <input
                    type="text"
                    value={ticketFormat}
                    onChange={(e) => setTicketFormat(e.target.value)}
                    placeholder="e.g., A-101"
                    className="w-full px-3 py-2.5 rounded-lg bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60 text-[0.875rem] text-foreground"
                  />
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">Prefix-number pattern</p>
                </div>
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Queue Limit per Clinic</label>
                  <input
                    type="number"
                    value={queueLimit}
                    onChange={(e) => setQueueLimit(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[0.875rem] text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.875rem] text-foreground">Reset Numbering Daily</p>
                  <p className="text-[0.75rem] text-muted-foreground">Start from 1 each new day</p>
                </div>
                <button
                  onClick={() => setResetDaily(!resetDaily)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    resetDaily ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    resetDaily ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
            </div>

            {/* Timing Settings */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Timer className="size-4" />
                Timing Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Avg. Consultation Time (min)</label>
                  <input
                    type="number"
                    value={consultationTime}
                    onChange={(e) => setConsultationTime(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[0.875rem] text-foreground"
                  />
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">Used for wait time estimation</p>
                </div>
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Delay Between Calls (sec)</label>
                  <input
                    type="number"
                    value={callDelay}
                    onChange={(e) => setCallDelay(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[0.875rem] text-foreground"
                  />
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">Time between voice announcements</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSave('Queue settings saved')}
              className="flex items-center gap-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
            >
              <Save className="size-4" />
              Save Queue Settings
            </button>
          </div>
        );

      // ───────────────────────────────────────────────────────────
      // 4. SOUND SETTINGS
      // ───────────────────────────────────────────────────────────
      case 'sound':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.25rem] text-foreground">Audio & Voice Settings</h2>
              <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Configure Text-to-Speech and sound announcements</p>
            </div>

            {/* TTS Toggle */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.875rem] text-foreground">Enable Text-to-Speech</p>
                  <p className="text-[0.75rem] text-muted-foreground">Voice announcements for patient calls</p>
                </div>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    ttsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    ttsEnabled ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
            </div>

            {/* Volume */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium flex items-center gap-1.5">
                <Volume2 className="size-4" />
                Volume
              </h3>

              <div className="flex items-center gap-4">
                <Volume2 className="size-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-[0.875rem] text-foreground font-medium w-10 text-right">{volume}%</span>
              </div>
            </div>

            {/* Voice Speed & Language */}
            <div className="bg-secondary/20 rounded-lg p-5 space-y-4">
              <h3 className="text-[0.9375rem] text-foreground font-medium">Voice Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Voice Speed</label>
                  <div className="flex gap-1 p-1 bg-card rounded-lg">
                    {(['slow', 'normal', 'fast'] as const).map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setVoiceSpeed(speed)}
                        className={`flex-1 py-2 px-3 rounded-md transition-all duration-200 text-[0.8125rem] capitalize ${
                          voiceSpeed === speed
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 text-[0.8125rem] text-foreground">Language</label>
                  <select
                    value={soundLanguage}
                    onChange={(e) => setSoundLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[0.875rem] text-foreground"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-5 border-2 border-primary/20">
              <h3 className="text-[0.9375rem] text-foreground font-medium mb-3">Preview</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.875rem] text-foreground mb-1">Sample Announcement</p>
                  <p className="text-[0.8125rem] text-muted-foreground italic">
                    "Patient number 15, please proceed to Clinic 2"
                  </p>
                </div>
                <button
                  onClick={() => handleSave('Playing sample announcement...')}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all duration-200 text-[0.8125rem]"
                >
                  <Play className="size-3.5" />
                  Play Sample
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSave('Sound settings saved')}
              className="flex items-center gap-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
            >
              <Save className="size-4" />
              Save Sound Settings
            </button>
          </div>
        );

      // ───────────────────────────────────────────────────────────
      // 5. USER & PATIENT MANAGEMENT
      // ───────────────────────────────────────────────────────────
      case 'user-patient':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.25rem] text-foreground">User & Patient Management</h2>
              <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Manage system users and patient records</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg w-fit">
              <button
                onClick={() => setUserTab('users')}
                className={`py-2 px-5 rounded-md transition-all duration-200 text-[0.875rem] flex items-center gap-1.5 ${
                  userTab === 'users'
                    ? 'bg-card shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="size-4" />
                Users
              </button>
              <button
                onClick={() => setUserTab('patients')}
                className={`py-2 px-5 rounded-md transition-all duration-200 text-[0.875rem] flex items-center gap-1.5 ${
                  userTab === 'patients'
                    ? 'bg-card shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="size-4" />
                Patients
              </button>
            </div>

            {/* ── Users Table ── */}
            {userTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="Search users…"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60 text-[0.875rem]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ name: '', email: '', role: 'reception', clinic: '' });
                      setShowUserModal(true);
                    }}
                    className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all text-[0.8125rem]"
                  >
                    <Plus className="size-3.5" />
                    Add User
                  </button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
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
                          <tr key={u.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors`}>
                            <td className="py-3 px-4 text-foreground font-medium">{u.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[0.6875rem] font-medium ${roleConfig.color}`}>
                                {roleConfig.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{u.clinic || '—'}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[0.6875rem] font-medium ${
                                u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => { setEditingUser(u); setUserForm({ name: u.name, email: u.email, role: u.role, clinic: u.clinic || '' }); setShowUserModal(true); }} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Edit">
                                  <Edit2 className="size-3.5" />
                                </button>
                                <button onClick={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
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
              <div className="space-y-4">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    placeholder="Search patients…"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60 text-[0.875rem]"
                  />
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
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
                        <tr key={p.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors`}>
                          <td className="py-3 px-4 text-foreground font-medium">{p.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{p.phone}</td>
                          <td className="py-3 px-4 text-center text-foreground">{p.age}</td>
                          <td className="py-3 px-4 text-center text-muted-foreground">{p.gender}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[0.6875rem] font-medium">{p.visits}</span>
                          </td>
                          <td className="py-3 px-4 text-center text-muted-foreground">{p.lastVisit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      // ───────────────────────────────────────────────────────────
      // 6. ROLES & PERMISSIONS
      // ───────────────────────────────────────────────────────────
      case 'roles':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.25rem] text-foreground">Roles & Permissions</h2>
              <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Control access for each role across system features</p>
            </div>

            {/* Roles Legend */}
            <div className="flex flex-wrap gap-3">
              {ROLES.map((role) => (
                <div key={role.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${role.color}`}>
                  <div className="size-2 rounded-full bg-current opacity-60" />
                  <span className="text-[0.8125rem] font-medium">{role.label}</span>
                </div>
              ))}
            </div>

            {/* Permissions Matrix */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-[0.875rem]">
                <thead>
                  <tr className="bg-secondary/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium w-64">Feature</th>
                    {ROLES.map((role) => (
                      <th key={role.key} className="text-center py-3 px-4 text-muted-foreground font-medium">
                        <span className={`px-2 py-0.5 rounded text-[0.75rem] font-medium ${role.color}`}>
                          {role.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((perm, i) => (
                    <tr key={perm.feature} className={`${i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'} border-t border-border hover:bg-secondary/20 transition-colors`}>
                      <td className="py-3 px-4 text-foreground font-medium">{perm.feature}</td>
                      {ROLES.map((role) => {
                        const checked = permissions[perm.feature]?.[role.key] ?? false;
                        const isAdmin = role.key === 'admin';
                        return (
                          <td key={role.key} className="py-3 px-4 text-center">
                            <button
                              onClick={() => !isAdmin && togglePermission(perm.feature, role.key)}
                              disabled={isAdmin}
                              className={`inline-flex items-center justify-center size-6 rounded transition-all duration-200 ${
                                checked
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'bg-muted text-muted-foreground/30'
                              } ${isAdmin ? 'cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-primary/30'}`}
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

            <div className="flex items-center justify-between">
              <p className="text-[0.75rem] text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="size-3.5" />
                Admin permissions are always enabled and cannot be modified
              </p>
              <button
                onClick={() => setShowPermissionsConfirm(true)}
                className="flex items-center gap-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
              >
                <Save className="size-4" />
                Save Permissions
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full flex">

        {/* ── Left Sidebar ── */}
        <div className="w-64 bg-card border-r border-border flex-shrink-0 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-border">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-[0.8125rem] mb-3"
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Settings className="size-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[0.9375rem] text-foreground font-medium">System Settings</p>
                <p className="text-[0.6875rem] text-muted-foreground">Configuration</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.875rem] transition-all duration-200 text-left ${
                  activeSection === item.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                }`}
              >
                <item.icon className="size-4 flex-shrink-0" />
                {item.label}
                {activeSection === item.key && <ChevronRight className="size-3 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.8125rem] text-foreground font-medium">{user?.name}</p>
                <p className="text-[0.6875rem] text-muted-foreground">Administrator</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
                title="Logout"
              >
                <Settings className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-3xl space-y-1">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* ── Save Message Toast ── */}
      {saveMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-[0.875rem]">
            <CheckCircle2 className="size-4" />
            {saveMessage}
          </div>
        </div>
      )}

      {/* ── User Modal ── */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowUserModal(false)}>
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-[1.125rem] text-foreground">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Dr. Sarah Williams"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@clinic.com"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                >
                  <option value="admin">Admin</option>
                  <option value="reception">Reception</option>
                  <option value="doctor">Doctor</option>
                  <option value="technician">Lab Technician</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-[0.8125rem] text-foreground">Assigned Clinic (optional)</label>
                <select
                  value={userForm.clinic}
                  onChange={(e) => setUserForm((p) => ({ ...p, clinic: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                >
                  <option value="">None</option>
                  {CLINICS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => setShowUserModal(false)} className="py-2.5 px-5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all text-[0.875rem]">
                Cancel
              </button>
              <button onClick={saveUser} className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all text-[0.875rem]">
                <Save className="size-3.5" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Permissions Save Confirmation ── */}
      {showPermissionsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPermissionsConfirm(false)}>
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-sm border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center space-y-3">
              <div className="size-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                <AlertCircle className="size-5 text-amber-600" />
              </div>
              <h3 className="text-[1.125rem] text-foreground">Save Permission Changes?</h3>
              <p className="text-[0.875rem] text-muted-foreground">
                This will update access controls for all roles. Changes take effect immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 border-t border-border">
              <button onClick={() => setShowPermissionsConfirm(false)} className="flex-1 py-2.5 px-4 rounded-lg border-2 border-border bg-card text-foreground hover:bg-secondary/30 transition-all text-[0.875rem]">
                Cancel
              </button>
              <button
                onClick={() => { setShowPermissionsConfirm(false); handleSave('Permissions updated successfully'); }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all text-[0.875rem]"
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
