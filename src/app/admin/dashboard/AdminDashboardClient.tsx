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
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F1D36] flex flex-col pb-12">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-8">

        {/* Control Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E2E8F0] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                Operations Tower
              </span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</span>
            </div>
            <h2 className="text-3xl font-black text-[#052856] tracking-tight mt-1">
              ANALYTICS TOWER
            </h2>
            <p className="text-xs text-[#475569] font-medium">
              Terminal 1 traffic analysis, immigration gate validations, and passenger rosters.
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 text-[10px] font-mono uppercase text-[#475569] font-bold shadow-sm">
            System Clock: <strong className="text-[#052856]">{new Date().toLocaleTimeString()}</strong>
          </div>
        </section>

        {/* METRICS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Total Passengers */}
          <div className="bg-white rounded-2xl p-5 border-l-4 border-amber-500 border-t border-r border-b border-[#E2E8F0] shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] font-bold uppercase block tracking-wider">Total Passengers</span>
                <span className="text-2xl font-black text-[#052856]">{studentsTotal}</span>
              </div>
              <span className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-600 shrink-0">
                <Users className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-[#64748B] font-semibold uppercase mt-4 tracking-wider">Registered freshmen students</p>
          </div>

          {/* Card 2: Total Gates */}
          <div className="bg-white rounded-2xl p-5 border-l-4 border-[#2563EB] border-t border-r border-b border-[#E2E8F0] shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] font-bold uppercase block tracking-wider">Active Gates</span>
                <span className="text-2xl font-black text-[#052856]">{destinationsTotal}</span>
              </div>
              <span className="bg-[#2563EB]/10 border border-[#2563EB]/20 p-2 rounded-xl text-[#2563EB] shrink-0">
                <MapPin className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-[#64748B] font-semibold uppercase mt-4 tracking-wider">Active booths/activities</p>
          </div>

          {/* Card 3: Stamps Earned */}
          <div className="bg-white rounded-2xl p-5 border-l-4 border-emerald-500 border-t border-r border-b border-[#E2E8F0] shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] font-bold uppercase block tracking-wider">Stamps Issued</span>
                <span className="text-2xl font-black text-[#052856]">{stampsTotal}</span>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-600 shrink-0">
                <BadgeCheck className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-[#64748B] font-semibold uppercase mt-4 tracking-wider">Destination completions</p>
          </div>

          {/* Card 4: Completion Ratio */}
          <div className="bg-white rounded-2xl p-5 border-l-4 border-indigo-500 border-t border-r border-b border-[#E2E8F0] shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] font-bold uppercase block tracking-wider">Clearance Rate</span>
                <span className="text-2xl font-black text-[#052856]">{overallCompletionRate}%</span>
              </div>
              <span className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-indigo-600 shrink-0">
                <Activity className="h-5 w-5" />
              </span>
            </div>
            <p className="text-[9px] text-[#64748B] font-semibold uppercase mt-4 tracking-wider">Overall journey progress</p>
          </div>
        </section>

        {/* TWO COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMN 1 & 2: Popular Gates and Passenger Manifest */}
          <div className="lg:col-span-2 space-y-8">

            {/* GATE COMPLETION RATES CHART */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0] space-y-6">
              <div>
                <h3 className="text-xs font-extrabold tracking-widest text-[#0A3A78] uppercase">
                  Immigration Gate Activity
                </h3>
                <p className="text-xs text-[#475569] mt-1 font-medium">
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
                        <span className="font-bold text-[#052856] uppercase flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: gate.color }} />
                          {gate.title} ({gate.gate_number})
                        </span>
                        <span className="text-[#475569] font-bold">
                          {gate.completions} Stamped ({percent}%)
                        </span>
                      </div>

                      {/* Bar fill */}
                      <div className="h-3 w-full bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E2E8F0]">
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
                  <div className="text-center py-8 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                    No active gates available.
                  </div>
                )}
              </div>
            </div>

            {/* NEWEST PASSENGERS LIST */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0] space-y-5">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <h3 className="text-xs font-extrabold tracking-widest text-[#0A3A78] uppercase">
                  Recent Passenger Registrations
                </h3>
                <Link href="/admin/students" className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest hover:text-[#052856] transition-colors">
                  View Full Roster
                </Link>
              </div>

              <div className="divide-y divide-[#E2E8F0] space-y-4">
                {newestStudents.map((stud) => (
                  <div key={stud.id} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8.5 w-8.5 rounded-full bg-[#052856]/10 text-[#052856] flex items-center justify-center font-bold text-xs uppercase border border-[#052856]/20">
                        {stud.full_name ? stud.full_name[0] : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F1D36]">{(stud.full_name || 'STUDENT').toUpperCase()}</div>
                        <div className="text-[9px] font-mono text-[#64748B] font-bold uppercase mt-0.5">
                          {stud.course ? stud.course.split(' ')[0] : 'Freshman'} | SECTION {stud.section || 'TBD'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-[#475569] font-bold">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#64748B]" />
                        {stud.registration_date ? new Date(stud.registration_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}

                {newestStudents.length === 0 && (
                  <div className="text-center py-6 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                    Passenger manifest is empty.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMN 3: Operator Actions Logs Timeline */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0] space-y-5">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <h3 className="text-xs font-extrabold tracking-widest text-[#0A3A78] uppercase">
                  Flight Operations Ledger
                </h3>
                <Activity className="h-4 w-4 text-[#0A3A78]" />
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11px] space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#052856] uppercase tracking-wide text-xs">
                        {log.action}
                      </span>
                      <span className="text-[8.5px] font-mono text-[#64748B] font-bold">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Show details depending on log */}
                    <div className="text-[10px] text-[#334155] leading-normal font-sans font-medium">
                      {log.action === 'Destination Cleared' ? (
                        <span>
                          Cleared Gate <strong className="text-amber-700">{log.details?.gate_number}</strong> for {log.details?.destination_title}.
                        </span>
                      ) : log.action === 'Onboarding Completed' ? (
                        <span>
                          Issued passport ID <strong className="text-amber-700">{log.details?.student_id}</strong> for {log.details?.course?.split(' ')[0]}.
                        </span>
                      ) : (
                        <span>System action completed.</span>
                      )}
                    </div>
                  </div>
                ))}

                {activityLogs.length === 0 && (
                  <div className="text-center py-8 text-[#64748B] font-bold text-xs uppercase tracking-wider">
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
