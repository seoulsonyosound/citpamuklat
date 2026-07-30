'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, MapPin, BadgeCheck, Activity, Plane, Calendar, ShieldCheck, Compass } from 'lucide-react'
import AdminNavbar from '@/components/AdminNavbar'

interface Student {
  id: string
  full_name: string
  email: string
  course: string
  section: string
  registration_date: string
}

interface ActivityLog {
  id: string
  user_role: string
  action: string
  details: any
  created_at: string
}

interface DestMetric {
  id: string
  title: string
  gate_number: string
  color: string
  completions: number
}

interface Props {
  studentsTotal: number
  destinationsTotal: number
  stampsTotal: number
  newestStudents: Student[]
  activityLogs: ActivityLog[]
  destMetrics: DestMetric[]
}

export default function AdminDashboardClient({
  studentsTotal,
  destinationsTotal,
  stampsTotal,
  newestStudents,
  activityLogs,
  destMetrics,
}: Props) {
  // Busiest gates (sorted by completions)
  const busiestGates = [...destMetrics].sort((a, b) => b.completions - a.completions)

  // Journey metrics
  const potentialStamps = studentsTotal * destinationsTotal
  const overallCompletionRate = potentialStamps > 0 ? Math.round((stampsTotal / potentialStamps) * 100) : 0

  return (
    <div className="min-h-screen bg-[#08111F] text-slate-100 flex flex-col pb-12">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-8">

        {/* Control Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                Operations Tower
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              ANALYTICS TOWER
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Terminal 1 traffic analysis, immigration gate validations, and passenger rosters.
            </p>
          </div>

          <div className="bg-[#040912]/80 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-mono uppercase text-slate-300 font-bold">
            System Clock: <strong className="text-white">{new Date().toLocaleTimeString()}</strong>
          </div>
        </section>

        {/* METRICS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Total Passengers */}
          <div className="glass-panel-dark rounded-2xl p-5 border-l-4 border-amber-500 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-300 font-bold uppercase block tracking-wider">Total Passengers</span>
                <span className="text-2xl font-black text-white">{studentsTotal}</span>
              </div>
              <span className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-400 shrink-0">
                <Users className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-slate-300 font-medium uppercase mt-4 tracking-wider">Registered freshmen students</p>
          </div>

          {/* Card 2: Total Gates */}
          <div className="glass-panel-dark rounded-2xl p-5 border-l-4 border-[#2563EB] shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-300 font-bold uppercase block tracking-wider">Active Gates</span>
                <span className="text-2xl font-black text-white">{destinationsTotal}</span>
              </div>
              <span className="bg-[#2563EB]/10 border border-[#60A5FA]/20 p-2 rounded-xl text-[#60A5FA] shrink-0">
                <MapPin className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-slate-300 font-medium uppercase mt-4 tracking-wider">Active booths/activities</p>
          </div>

          {/* Card 3: Stamps Earned */}
          <div className="glass-panel-dark rounded-2xl p-5 border-l-4 border-emerald-500 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-300 font-bold uppercase block tracking-wider">Stamps Issued</span>
                <span className="text-2xl font-black text-white">{stampsTotal}</span>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400 shrink-0">
                <BadgeCheck className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-slate-300 font-medium uppercase mt-4 tracking-wider">Destination completions</p>
          </div>

          {/* Card 4: Completion Ratio */}
          <div className="glass-panel-dark rounded-2xl p-5 border-l-4 border-indigo-500 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-300 font-bold uppercase block tracking-wider">Clearance Rate</span>
                <span className="text-2xl font-black text-white">{overallCompletionRate}%</span>
              </div>
              <span className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-indigo-400 shrink-0">
                <Activity className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-slate-300 font-medium uppercase mt-4 tracking-wider">Overall journey progress</p>
          </div>
        </section>

        {/* TWO COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMN 1 & 2: Popular Gates and Passenger Manifest */}
          <div className="lg:col-span-2 space-y-8">

            {/* GATE COMPLETION RATES CHART */}
            <div className="glass-panel-dark rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-xs font-extrabold tracking-widest text-[#60A5FA] uppercase">
                  Immigration Gate Activity
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Completed passport stamps issued per gate destination.
                </p>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-4">
                {busiestGates.map((gate) => {
                  const percent = studentsTotal > 0 ? Math.round((gate.completions / studentsTotal) * 100) : 0
                  return (
                    <div key={gate.id} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-white uppercase flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: gate.color }} />
                          {gate.title} ({gate.gate_number})
                        </span>
                        <span className="text-slate-400 font-bold">
                          {gate.completions} Stamped ({percent}%)
                        </span>
                      </div>

                      {/* Bar fill */}
                      <div className="h-3 w-full bg-slate-900/60 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className="h-full rounded-full transition-all duration-1000 shadow-inner"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: gate.color
                          }}
                        />
                      </div>
                    </div>
                  )
                })}

                {busiestGates.length === 0 && (
                  <div className="text-center py-8 text-slate-650 text-xs font-bold uppercase tracking-wider">
                    No active gates available.
                  </div>
                )}
              </div>
            </div>

            {/* NEWEST PASSENGERS LIST */}
            <div className="glass-panel-dark rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-xs font-extrabold tracking-widest text-[#60A5FA] uppercase">
                  Recent Passenger Registrations
                </h3>
                <Link href="/admin/students" className="text-[10px] font-mono text-amber-500 uppercase tracking-widest hover:text-white transition-colors">
                  View Full Roster
                </Link>
              </div>

              <div className="divide-y divide-slate-900 space-y-4">
                {newestStudents.map((stud) => (
                  <div key={stud.id} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8.5 w-8.5 rounded-full bg-[#2563EB]/25 text-white flex items-center justify-center font-bold text-xs uppercase border border-[#60A5FA]/20">
                        {stud.full_name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{stud.full_name.toUpperCase()}</div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                          {stud.course ? stud.course.split(' ')[0] : 'Freshman'} | SECTION {stud.section || 'TBD'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {new Date(stud.registration_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {newestStudents.length === 0 && (
                  <div className="text-center py-6 text-slate-650 text-xs font-bold uppercase tracking-wider">
                    Passenger manifest is empty.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMN 3: Operator Actions Logs Timeline */}
          <div className="space-y-6">
            <div className="glass-panel-dark rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-xs font-extrabold tracking-widest text-[#60A5FA] uppercase">
                  Flight Operations Ledger
                </h3>
                <Activity className="h-4 w-4 text-[#60A5FA]" />
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#040912]/50 border border-slate-800 rounded-xl text-[11px] space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white uppercase tracking-wide text-xs">
                        {log.action}
                      </span>
                      <span className="text-[8.5px] font-mono text-slate-300 font-bold">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Show details depending on log */}
                    <div className="text-[10px] text-slate-200 leading-normal font-sans font-medium">
                      {log.action === 'Destination Cleared' ? (
                        <span>
                          Cleared Gate <strong className="text-amber-400">{log.details?.gate_number}</strong> for {log.details?.destination_title}.
                        </span>
                      ) : log.action === 'Onboarding Completed' ? (
                        <span>
                          Issued passport ID <strong className="text-amber-400">{log.details?.student_id}</strong> for {log.details?.course?.split(' ')[0]}.
                        </span>
                      ) : (
                        <span>System action completed.</span>
                      )}
                    </div>
                  </div>
                ))}

                {activityLogs.length === 0 && (
                  <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    Ledger logs are silent.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
