import { useState } from 'react';
import {
  Users, Clock, CheckCircle2, Building2,
  Search, UserPlus, Printer, Ticket,
  Activity, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  waiting: number;
}

interface QueueStatus {
  clinic: string;
  current: string;
  next: string;
  status: 'active' | 'waiting';
}

export default function ReceptionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [currentTicketNumber, setCurrentTicketNumber] = useState('A-142');

  // Mock data
  const stats = [
    { label: 'Total Patients Today', value: '87', icon: Users, color: 'text-primary' },
    { label: 'Patients Waiting', value: '12', icon: Clock, color: 'text-amber-600' },
    { label: 'Completed Cases', value: '75', icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Active Clinics', value: '4', icon: Building2, color: 'text-primary' },
  ];

  const clinics: Clinic[] = [
    { id: '1', name: 'General Medicine', specialty: 'Family Care', waiting: 5 },
    { id: '2', name: 'Cardiology', specialty: 'Heart & Vascular', waiting: 3 },
    { id: '3', name: 'Pediatrics', specialty: 'Child Care', waiting: 4 },
    { id: '4', name: 'Laboratory', specialty: 'Diagnostic Tests', waiting: 0 },
  ];

  const queueStatus: QueueStatus[] = [
    { clinic: 'General Medicine', current: 'A-138', next: 'A-139', status: 'active' },
    { clinic: 'Cardiology', current: 'C-024', next: 'C-025', status: 'active' },
    { clinic: 'Pediatrics', current: 'P-056', next: 'P-057', status: 'active' },
    { clinic: 'Laboratory', current: 'L-089', next: 'L-090', status: 'waiting' },
  ];

  const handleGenerateTicket = () => {
    console.log('Generating ticket...');
    // Generate new ticket number logic
    const prefix = clinics.find(c => c.id === selectedClinic)?.name.charAt(0) || 'A';
    const newNumber = Math.floor(Math.random() * 999) + 1;
    setCurrentTicketNumber(`${prefix}-${newNumber.toString().padStart(3, '0')}`);
  };

  const handlePrintTicket = () => {
    console.log('Printing ticket...');
    // Print logic
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.75rem] text-foreground">Reception Dashboard</h1>
            <p className="text-muted-foreground text-[0.9375rem] mt-1">
              Patient registration and queue management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <p className="text-foreground font-medium">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="size-5 text-muted-foreground" />
            </button>
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="size-5 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* TOP SUMMARY BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-lg p-5 shadow-sm border border-border hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[0.8125rem] text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-[2rem] leading-none text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg bg-secondary/50 ${stat.color}`}>
                  <stat.icon className="size-5" strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN WORK AREA - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT - Patient Registration Panel */}
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-[1.25rem] text-foreground mb-5">Patient Registration</h2>

            {/* Patient Type Toggle */}
            <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg mb-6">
              <button
                onClick={() => setIsNewPatient(false)}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all duration-200 text-[0.9375rem] ${
                  !isNewPatient
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Search className="size-4 inline mr-2" />
                Existing Patient
              </button>
              <button
                onClick={() => setIsNewPatient(true)}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all duration-200 text-[0.9375rem] ${
                  isNewPatient
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="size-4 inline mr-2" />
                New Patient
              </button>
            </div>

            {/* Search or Form */}
            {!isNewPatient ? (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by phone or name..."
                  className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60"
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block mb-2 text-[0.875rem] text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60"
                    autoFocus
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block mb-2 text-[0.875rem] text-foreground">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Age & Gender Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[0.875rem] text-foreground">
                      Age
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Age"
                      className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[0.875rem] text-foreground">
                      Gender
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-lg bg-input-background border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-foreground"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Clinic Selection */}
            <div className="mt-6">
              <label className="block mb-3 text-[0.875rem] text-foreground">
                Select Clinic
              </label>
              <div className="space-y-2">
                {clinics.map((clinic) => (
                  <button
                    key={clinic.id}
                    onClick={() => setSelectedClinic(clinic.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedClinic === clinic.id
                        ? 'border-primary bg-secondary/30'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">{clinic.name}</p>
                        <p className="text-[0.8125rem] text-muted-foreground mt-0.5">
                          {clinic.specialty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.8125rem] text-muted-foreground">Waiting</p>
                        <p className="text-amber-600">{clinic.waiting}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT - Ticket Issuing Panel */}
          <div className="space-y-6">
            {/* Live Ticket Display */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h2 className="text-[1.25rem] text-foreground mb-5">Ticket Issuing</h2>

              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border-2 border-primary/20 mb-6">
                <div className="text-center">
                  <p className="text-[0.8125rem] text-muted-foreground mb-2">Current Ticket</p>
                  <p className="text-[3rem] leading-none text-primary mb-3">
                    {currentTicketNumber}
                  </p>
                  <p className="text-foreground">{clinics.find(c => c.id === selectedClinic)?.name || 'Select a clinic'}</p>
                  <p className="text-[0.8125rem] text-muted-foreground mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateTicket}
                  disabled={!selectedClinic || (!patientName && isNewPatient)}
                  className="py-3.5 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30"
                >
                  <Ticket className="size-5 inline mr-2" />
                  Generate
                </button>
                <button
                  onClick={handlePrintTicket}
                  className="py-3.5 px-4 rounded-lg border-2 border-border bg-card text-foreground hover:border-primary hover:bg-secondary/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  <Printer className="size-5 inline mr-2" />
                  Print
                </button>
              </div>
            </div>

            {/* Ticket Preview */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-foreground mb-4">Ticket Preview</h3>

              <div className="bg-gradient-to-b from-card to-secondary/20 rounded-lg p-5 border border-dashed border-border space-y-3">
                <div className="text-center pb-3 border-b border-dashed border-border">
                  <p className="text-[0.75rem] text-muted-foreground mb-1">TICKET NUMBER</p>
                  <p className="text-[2rem] leading-none text-foreground">{currentTicketNumber}</p>
                </div>

                <div className="space-y-2 text-[0.875rem]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient:</span>
                    <span className="text-foreground">{patientName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinic:</span>
                    <span className="text-foreground">
                      {clinics.find(c => c.id === selectedClinic)?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="text-foreground">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Queue Position:</span>
                    <span className="text-amber-600">
                      {selectedClinic ? clinics.find(c => c.id === selectedClinic)?.waiting : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - Live Queue Overview */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-[1.25rem] text-foreground mb-5">Live Queue Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {queueStatus.map((queue) => (
              <div
                key={queue.clinic}
                className="relative bg-gradient-to-br from-card to-secondary/20 rounded-lg p-5 border border-border hover:border-primary/50 transition-all duration-200"
              >
                {/* Live Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`size-2.5 rounded-full ${
                    queue.status === 'active'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                      : 'bg-amber-500'
                  }`} />
                </div>

                <h3 className="text-foreground mb-4 pr-6">{queue.clinic}</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-[0.75rem] text-muted-foreground mb-1">Current</p>
                    <p className="text-[1.5rem] leading-none text-primary">{queue.current}</p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-muted-foreground mb-1">Next</p>
                    <p className="text-[1.125rem] leading-none text-muted-foreground">{queue.next}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
