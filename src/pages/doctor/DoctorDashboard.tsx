import { useState } from 'react';
import {
  User, Clock, Ticket, Phone,
  ChevronRight, Pause, Play, SkipForward,
  FileText, LogOut, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  ticketNumber: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  visitTime: string;
  status: 'waiting' | 'in-progress' | 'skipped';
}

type QueueStatus = 'available' | 'paused';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [queueStatus, setQueueStatus] = useState<QueueStatus>('available');
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data
  const doctorName = user?.name || 'Dr. Sarah Williams';
  const clinicName = 'General Medicine';
  const todayTotalPatients = 24;

  const patients: Patient[] = [
    {
      id: '1',
      ticketNumber: 'A-142',
      name: 'Ahmed Hassan',
      age: 34,
      gender: 'Male',
      phone: '+20 123 456 7890',
      visitTime: '09:15 AM',
      status: 'in-progress',
    },
    {
      id: '2',
      ticketNumber: 'A-143',
      name: 'Mona Ali',
      age: 28,
      gender: 'Female',
      phone: '+20 111 222 3333',
      visitTime: '09:30 AM',
      status: 'waiting',
    },
    {
      id: '3',
      ticketNumber: 'A-144',
      name: 'Omar Khaled',
      age: 45,
      gender: 'Male',
      phone: '+20 100 555 6666',
      visitTime: '09:45 AM',
      status: 'waiting',
    },
    {
      id: '4',
      ticketNumber: 'A-145',
      name: 'Fatma Ibrahim',
      age: 52,
      gender: 'Female',
      phone: '+20 122 777 8888',
      visitTime: '10:00 AM',
      status: 'waiting',
    },
    {
      id: '5',
      ticketNumber: 'A-146',
      name: 'Youssef Mohamed',
      age: 19,
      gender: 'Male',
      phone: '+20 105 999 0000',
      visitTime: '10:15 AM',
      status: 'waiting',
    },
    {
      id: '6',
      ticketNumber: 'A-147',
      name: 'Nour Ahmed',
      age: 67,
      gender: 'Female',
      phone: '+20 114 333 4444',
      visitTime: '10:30 AM',
      status: 'waiting',
    },
    {
      id: '7',
      ticketNumber: 'A-148',
      name: 'Karim Mostafa',
      age: 41,
      gender: 'Male',
      phone: '+20 120 666 7777',
      visitTime: '10:45 AM',
      status: 'waiting',
    },
  ];

  const currentPatient = patients[currentPatientIndex];
  const remainingPatients = patients.length - currentPatientIndex - 1;

  const handleNextPatient = () => {
    if (currentPatientIndex < patients.length - 1) {
      setCurrentPatientIndex((prev) => prev + 1);
      setShowDetails(false);
    }
  };

  const handleToggleQueue = () => {
    setQueueStatus((prev) => (prev === 'available' ? 'paused' : 'available'));
  };

  const handleRecallPatient = () => {
    // Recall logic - would navigate back to previous patient
    if (currentPatientIndex > 0) {
      setCurrentPatientIndex((prev) => prev - 1);
      setShowDetails(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full p-6 space-y-6">

        {/* ============================================ */}
        {/* ZONE 1: TOP BAR — Doctor Status & Summary    */}
        {/* ============================================ */}
        <div className="flex items-center justify-between">
          {/* Doctor Info */}
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="size-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[1.125rem] text-foreground font-medium">{doctorName}</p>
              <p className="text-[0.8125rem] text-muted-foreground">{clinicName}</p>
            </div>
          </div>

          {/* Today's Total */}
          <div className="flex items-center gap-2 bg-card rounded-lg px-4 py-2.5 shadow-sm border border-border">
            <User className="size-4 text-muted-foreground" />
            <span className="text-[0.875rem] text-muted-foreground">Today</span>
            <span className="text-[1.25rem] text-foreground font-medium">{todayTotalPatients}</span>
          </div>

          {/* Status Toggle & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleQueue}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-[0.875rem] ${
                queueStatus === 'available'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              {queueStatus === 'available' ? (
                <>
                  <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  Available
                </>
              ) : (
                <>
                  <div className="size-2 rounded-full bg-amber-500" />
                  Paused
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* ZONE 2: MAIN FOCUS — Current Patient         */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Current Patient Card (spans 2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              {/* Section Title */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[1.25rem] text-foreground">Current Patient</h2>
                <span className="text-[0.8125rem] text-muted-foreground">
                  {remainingPatients} remaining
                </span>
              </div>

              {/* Patient Info */}
              <div className="space-y-4">
                {/* Name & Ticket */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[1.75rem] text-foreground font-medium leading-tight">
                      {currentPatient.name}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[0.9375rem] text-muted-foreground flex items-center gap-1.5">
                        <User className="size-4" />
                        {currentPatient.age} years · {currentPatient.gender}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
                    <Ticket className="size-4 text-primary" />
                    <span className="text-[1.125rem] text-primary font-medium">
                      {currentPatient.ticketNumber}
                    </span>
                  </div>
                </div>

                {/* Visit Time */}
                <div className="flex items-center gap-1.5 text-[0.875rem] text-muted-foreground">
                  <Clock className="size-4" />
                  Visit time: {currentPatient.visitTime}
                </div>

                {/* Divider */}
                <div className="border-t border-border pt-4" />

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Next Patient — Primary */}
                  <button
                    onClick={handleNextPatient}
                    disabled={currentPatientIndex >= patients.length - 1}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 text-[0.9375rem]"
                  >
                    <SkipForward className="size-5" />
                    Next Patient
                    <ChevronRight className="size-4" />
                  </button>

                  {/* Pause Queue */}
                  <button
                    onClick={handleToggleQueue}
                    className={`flex items-center justify-center gap-2 py-3.5 px-5 rounded-lg border-2 transition-all duration-200 text-[0.9375rem] ${
                      queueStatus === 'available'
                        ? 'border-border bg-card text-foreground hover:border-amber-300 hover:bg-amber-50'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {queueStatus === 'available' ? (
                      <>
                        <Pause className="size-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Resume
                      </>
                    )}
                  </button>

                  {/* Recall Patient */}
                  <button
                    onClick={handleRecallPatient}
                    disabled={currentPatientIndex === 0}
                    className="py-3.5 px-5 rounded-lg border-2 border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary/20 text-[0.9375rem]"
                  >
                    Recall
                  </button>
                </div>

                {/* View Details Toggle */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full py-2.5 rounded-lg text-[0.875rem] text-muted-foreground hover:text-primary hover:bg-secondary/30 transition-all duration-200"
                >
                  {showDetails ? 'Hide Details' : 'View Patient Details'}
                </button>
              </div>

              {/* Expandable Patient Details */}
              {showDetails && (
                <div className="mt-4 pt-5 border-t border-border space-y-5 animate-in fade-in">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-[0.9375rem] text-foreground mb-3 font-medium">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[0.75rem] text-muted-foreground mb-1">Full Name</p>
                        <p className="text-[0.9375rem] text-foreground">{currentPatient.name}</p>
                      </div>
                      <div>
                        <p className="text-[0.75rem] text-muted-foreground mb-1">Phone Number</p>
                        <p className="text-[0.9375rem] text-foreground flex items-center gap-1.5">
                          <Phone className="size-3.5" />
                          {currentPatient.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.75rem] text-muted-foreground mb-1">Age</p>
                        <p className="text-[0.9375rem] text-foreground">{currentPatient.age} years</p>
                      </div>
                      <div>
                        <p className="text-[0.75rem] text-muted-foreground mb-1">Gender</p>
                        <p className="text-[0.9375rem] text-foreground">{currentPatient.gender}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div>
                    <h3 className="text-[0.9375rem] text-foreground mb-3 font-medium flex items-center gap-1.5">
                      <FileText className="size-4" />
                      Medical History
                    </h3>
                    <div className="bg-secondary/20 rounded-lg p-4 border border-border">
                      <p className="text-[0.875rem] text-muted-foreground leading-relaxed">
                        No previous visits recorded. Patient is new to this clinic.
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="text-[0.9375rem] text-foreground mb-3 font-medium">Notes</h3>
                    <div className="bg-secondary/20 rounded-lg p-4 border border-border">
                      <p className="text-[0.875rem] text-muted-foreground leading-relaxed">
                        No notes added for this visit yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* ZONE 3: SIDE PANEL — Queue Overview          */}
          {/* ============================================ */}
          <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col">
            <div className="p-5 border-b border-border">
              <h2 className="text-[1.125rem] text-foreground">Queue</h2>
              <p className="text-[0.8125rem] text-muted-foreground mt-0.5">
                {patients.length} patients total
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {patients.map((patient, index) => {
                const isCurrent = index === currentPatientIndex;
                const isPast = index < currentPatientIndex;

                return (
                  <div
                    key={patient.id}
                    className={`rounded-lg p-3.5 transition-all duration-200 ${
                      isCurrent
                        ? 'bg-primary/5 border-2 border-primary/30 shadow-sm'
                        : isPast
                          ? 'bg-muted/30 border border-transparent opacity-60'
                          : 'bg-card border border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Ticket + Status Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[0.8125rem] font-medium ${
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {patient.ticketNumber}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[0.6875rem] bg-primary/10 text-primary">
                              Now
                            </span>
                          )}
                          {patient.status === 'skipped' && (
                            <span className="px-1.5 py-0.5 rounded text-[0.6875rem] bg-amber-100 text-amber-700">
                              Skipped
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <p className={`text-[0.9375rem] truncate ${
                          isCurrent ? 'text-foreground font-medium' : 'text-foreground'
                        }`}>
                          {patient.name}
                        </p>

                        {/* Time */}
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                          {patient.visitTime}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
