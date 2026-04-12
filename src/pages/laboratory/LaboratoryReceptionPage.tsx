import { useState } from 'react';
import {
  FlaskConical, Clock, Activity, CheckCircle2,
  Search, UserPlus, Printer, Ticket,
  ArrowRight, Beaker, FileText, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LabTest {
  id: string;
  name: string;
  code: string;
  duration: string;
}

interface QueueItem {
  ticket: string;
  patient: string;
  test: string;
  status: 'pending' | 'in-progress' | 'completed';
  time: string;
}

interface CompletedTest {
  ticket: string;
  patient: string;
  test: string;
  completedAt: string;
}

interface LabFlowStage {
  stage: string;
  count: number;
  color: string;
}

export default function LaboratoryReceptionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [currentTicketNumber, setCurrentTicketNumber] = useState('L-089');

  // Mock lab data
  const stats = [
    { label: 'Total Lab Requests Today', value: '124', icon: FlaskConical, color: 'text-primary' },
    { label: 'Pending Tests', value: '18', icon: Clock, color: 'text-amber-600' },
    { label: 'In Progress', value: '9', icon: Activity, color: 'text-primary' },
    { label: 'Completed Tests', value: '97', icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  const labTests: LabTest[] = [
    { id: '1', name: 'Complete Blood Count (CBC)', code: 'CBC', duration: '30 min' },
    { id: '2', name: 'Blood Chemistry Panel', code: 'CHEM', duration: '45 min' },
    { id: '3', name: 'Urine Analysis', code: 'UA', duration: '20 min' },
    { id: '4', name: 'Lipid Profile', code: 'LIPID', duration: '40 min' },
    { id: '5', name: 'Thyroid Function Test', code: 'TFT', duration: '50 min' },
    { id: '6', name: 'Blood Glucose', code: 'GLU', duration: '15 min' },
  ];

  const queueItems: QueueItem[] = [
    { ticket: 'L-085', patient: 'Sarah Johnson', test: 'CBC', status: 'in-progress', time: '09:15 AM' },
    { ticket: 'L-086', patient: 'Michael Chen', test: 'Blood Chemistry', status: 'pending', time: '09:22 AM' },
    { ticket: 'L-087', patient: 'Emily Rodriguez', test: 'Urine Analysis', status: 'in-progress', time: '09:28 AM' },
    { ticket: 'L-088', patient: 'David Kim', test: 'Lipid Profile', status: 'pending', time: '09:35 AM' },
  ];

  const completedTests: CompletedTest[] = [
    { ticket: 'L-078', patient: 'Alice Thompson', test: 'CBC', completedAt: '09:05 AM' },
    { ticket: 'L-079', patient: 'Robert Martinez', test: 'Blood Glucose', completedAt: '09:12 AM' },
    { ticket: 'L-081', patient: 'Jennifer Lee', test: 'Thyroid Panel', completedAt: '09:18 AM' },
    { ticket: 'L-082', patient: 'William Brown', test: 'Urine Analysis', completedAt: '09:25 AM' },
  ];

  const labFlow: LabFlowStage[] = [
    { stage: 'New Requests', count: 5, color: 'bg-secondary' },
    { stage: 'Pending', count: 18, color: 'bg-amber-500/20 text-amber-700' },
    { stage: 'Processing', count: 9, color: 'bg-primary/20 text-primary' },
    { stage: 'Completed', count: 97, color: 'bg-emerald-500/20 text-emerald-700' },
  ];

  const handleGenerateTicket = () => {
    console.log('Generating lab ticket...');
    // Generate new ticket number logic
    const newNumber = Math.floor(Math.random() * 999) + 1;
    setCurrentTicketNumber(`L-${newNumber.toString().padStart(3, '0')}`);
  };

  const handlePrintTicket = () => {
    console.log('Printing lab ticket...');
    // Print logic
  };

  const handlePrintReport = (ticket: string) => {
    console.log(`Printing report for ${ticket}...`);
    // Print report logic
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'in-progress':
        return 'text-primary bg-primary/10';
      case 'completed':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  };

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.75rem] text-foreground">Laboratory Reception</h1>
            <p className="text-muted-foreground text-[0.9375rem] mt-1">
              Lab registration, ticketing, and report management
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
              <FlaskConical className="size-5 text-white" strokeWidth={2} />
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

        {/* LAB FLOW VISUALIZATION */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-[1.25rem] text-foreground mb-5">Lab Test Flow</h2>
          <div className="flex items-center justify-between">
            {labFlow.map((stage, index) => (
              <div key={stage.stage} className="flex-1 text-center">
                <div className={`rounded-lg p-4 ${stage.color} mx-1`}>
                  <p className="text-[0.875rem] font-medium">{stage.stage}</p>
                  <p className="text-[1.5rem] font-bold mt-1">{stage.count}</p>
                </div>
                {index < labFlow.length - 1 && (
                  <ArrowRight className="size-5 text-muted-foreground mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN WORK AREA - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT - Patient Registration Panel */}
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-[1.25rem] text-foreground mb-5">Lab Test Registration</h2>

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

            {/* Test Selection */}
            <div className="mt-6">
              <label className="block mb-3 text-[0.875rem] text-foreground">
                Select Lab Test
              </label>
              <div className="space-y-2">
                {labTests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => setSelectedTest(test.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedTest === test.id
                        ? 'border-primary bg-secondary/30'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Beaker className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">{test.name}</p>
                          <p className="text-[0.8125rem] text-muted-foreground mt-0.5">
                            {test.code} • {test.duration}
                          </p>
                        </div>
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
              <h2 className="text-[1.25rem] text-foreground mb-5">Lab Ticket Issuing</h2>

              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border-2 border-primary/20 mb-6">
                <div className="text-center">
                  <p className="text-[0.8125rem] text-muted-foreground mb-2">Current Lab Ticket</p>
                  <p className="text-[3rem] leading-none text-primary mb-3">
                    {currentTicketNumber}
                  </p>
                  <p className="text-foreground">{labTests.find(t => t.id === selectedTest)?.name || 'Select a test'}</p>
                  <p className="text-[0.8125rem] text-muted-foreground mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateTicket}
                  disabled={!selectedTest || (!patientName && isNewPatient)}
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

            {/* Current Queue */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-foreground mb-4">Current Queue</h3>
              <div className="space-y-2">
                {queueItems.map((item) => (
                  <div
                    key={item.ticket}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-foreground font-medium">{item.ticket}</div>
                      <div>
                        <p className="text-sm text-foreground">{item.patient}</p>
                        <p className="text-xs text-muted-foreground">{item.test}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - Completed Tests */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[1.25rem] text-foreground">Completed Tests</h2>
            <button className="text-sm text-primary hover:text-accent transition-colors duration-200">
              View All Reports
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedTests.map((test) => (
              <div
                key={test.ticket}
                className="bg-gradient-to-br from-card to-secondary/20 rounded-lg p-4 border border-border hover:border-primary/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-foreground font-medium">{test.ticket}</p>
                    <p className="text-sm text-muted-foreground">{test.patient}</p>
                  </div>
                  <button
                    onClick={() => handlePrintReport(test.ticket)}
                    className="p-1.5 rounded hover:bg-secondary/50 transition-colors duration-200"
                    title="Print Report"
                  >
                    <FileText className="size-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">{test.test}</p>
                  <p className="text-xs text-emerald-600">Completed at {test.completedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
