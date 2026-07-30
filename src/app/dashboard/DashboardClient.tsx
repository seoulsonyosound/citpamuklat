'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plane,
  Clock,
  Compass,
  MapPin,
  CheckCircle,
  Bell,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight,
  Map,
  Check,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

import * as Icons from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  student_id: string
  course: string
  section: string
  year_level: string
  registration_date: string
}

interface Destination {
  id: string
  title: string
  description: string
  instructions: string
  representative: string
  stamp_image_url: string
  destination_color: string
  icon: string
  status: string
  gate_number: string
  estimated_duration: string
}

interface Completion {
  destination_id: string
  completion_date: string
}

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface Props {
  profile: Profile
  initialDestinations: Destination[]
  initialCompletions: Completion[]
  initialNotifications: Notification[]
}

export default function DashboardClient({
  profile,
  initialDestinations,
  initialCompletions,
  initialNotifications,
}: Props) {
  const supabase = createClient()
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const completedIds = completions.map((c) => c.destination_id)
  const totalDestinations = initialDestinations.length
  const completedCount = completions.length
  const remainingCount = totalDestinations - completedCount
  const completionPercent = totalDestinations > 0 ? Math.round((completedCount / totalDestinations) * 100) : 0

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    }
  }

  const renderIcon = (iconName: string, color: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.MapPin
    return <IconComponent className="h-5 w-5" style={{ color: color || '#052856' }} />
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F1D36] flex flex-col pb-12 relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-[5%] left-[2%] w-64 h-64 bg-[#052856]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[3%] w-80 h-80 bg-[#0A3A78]/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-8 relative z-10">

        {/* WELCOME HUD BANNER / CAMPUS TOUR LOUNGE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden bg-white border border-[#E2E8F0]"
        >
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#052856]/10 border border-[#052856]/20 text-[#052856] px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <Compass className="h-3.5 w-3.5 text-[#052856]" /> UA Campus Tour Guide
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-700 font-extrabold tracking-wider uppercase">Live Tour Active</span>
            </div>

            <h2 className="text-3xl font-black text-[#052856] tracking-tight">
              WELCOME BACK, {profile.full_name.toUpperCase()}
            </h2>
            <p className="text-xs text-[#334155] font-semibold max-w-xl leading-relaxed">
              Explore your freshmen campus orientation tour! Visit each booth stop to collect stamps in your <strong className="text-[#052856] font-bold">Digital Passport</strong>.
            </p>
          </div>

          {/* Passenger Boarding Card Summary */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 flex gap-6 shrink-0 w-full md:w-auto font-mono text-[11px] uppercase tracking-wider shadow-sm">
            <div className="space-y-1.5 border-r border-[#CBD5E1] pr-5">
              <div className="text-[#64748B] font-sans text-[9px] font-bold">Explorer Class</div>
              <div className="font-extrabold text-[#052856]">{profile.course ? profile.course.split(' ')[0] : 'BSIT'}</div>
              <div className="text-[#64748B] font-sans text-[9px] font-bold mt-1.5">Section</div>
              <div className="font-extrabold text-[#0A3A78]">{profile.section || '1-A'}</div>
            </div>
            <div className="space-y-1.5 pl-1">
              <div className="text-[#64748B] font-sans text-[9px] font-bold">Passport Status</div>
              <div className="font-extrabold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> VERIFIED
              </div>
              <div className="text-[#64748B] font-sans text-[9px] font-bold mt-1.5">Tour Checkpoints</div>
              <div className="font-extrabold text-[#052856]">{completedCount} / {totalDestinations} CLEARED</div>
            </div>
          </div>
        </motion.section>

        {/* CAMPUS TOUR JOURNEY ROUTE MAP */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl p-6 md:p-8 shadow-sm bg-white border border-[#E2E8F0] relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#0A3A78] font-black block leading-none mb-1">
                Interactive Map
              </span>
              <h3 className="text-lg font-black tracking-wide text-[#052856] uppercase flex items-center gap-2">
                <Map className="h-5 w-5 text-[#052856]" /> Campus Tour Trajectory
              </h3>
              <p className="text-xs text-[#475569] font-medium mt-1">
                {completedCount} of {totalDestinations} Pamuklat clearance stops completed.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 font-mono">
              <div className="text-right">
                <div className="text-[#64748B] text-[10px] uppercase font-bold">Clearance Progress</div>
                <div className="text-2xl font-black text-[#052856]">{completionPercent}%</div>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-center text-[#052856] font-bold shadow-sm">
                <Plane className="h-5 w-5 text-[#052856]" />
              </div>
            </div>
          </div>

          {/* Connected Pathway slider */}
          <div className="relative py-6 mb-2">
            <div className="absolute left-0 right-0 top-1/2 h-[4px] bg-[#E2E8F0] -translate-y-1/2 rounded-full" />
            <div
              className="absolute left-0 top-1/2 h-[4px] bg-gradient-to-r from-[#052856] to-[#0A3A78] -translate-y-1/2 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${completionPercent}%` }}
            />

            {/* Moving Airplane symbol */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -ml-4 z-20"
              style={{ left: `${completionPercent}%` }}
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <div className="bg-[#052856] border-2 border-white p-2.5 rounded-full text-white shadow-lg transform rotate-90 flex items-center justify-center">
                <Plane className="h-4 w-4 shrink-0" />
              </div>
            </motion.div>

            {/* Checkpoint nodes */}
            <div className="flex justify-between relative pointer-events-none">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm z-10 flex items-center justify-center text-[9px] text-white font-bold">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-[9px] uppercase tracking-wider mt-2.5 font-extrabold text-emerald-700">Start</span>
              </div>

              {initialDestinations.map((dest, idx) => {
                const isNodeDone = completedIds.includes(dest.id)
                return (
                  <div key={dest.id} className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-500 z-10 flex items-center justify-center text-[8px] font-bold ${
                        isNodeDone
                          ? 'bg-[#052856] border-white text-white shadow-sm'
                          : 'bg-white border-[#CBD5E1] text-[#64748B]'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-[8px] uppercase mt-2.5 font-black tracking-wider hidden sm:block ${isNodeDone ? 'text-[#052856]' : 'text-[#64748B]'}`}>
                      Gate 0{idx + 1}
                    </span>
                  </div>
                )
              })}

              <div className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-500 z-10 flex items-center justify-center text-[8px] font-bold ${
                    completionPercent === 100
                      ? 'bg-emerald-500 border-white text-white shadow-md animate-bounce'
                      : 'bg-white border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  <Award className="h-3 w-3 text-emerald-600" />
                </div>
                <span className={`text-[9px] uppercase tracking-wider mt-2.5 font-extrabold ${completionPercent === 100 ? 'text-emerald-700' : 'text-[#64748B]'}`}>
                  Cleared
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMN 1 & 2: Active Boarding Passes (8 Pamuklat Stops) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black tracking-wider text-[#052856] uppercase flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#052856]" /> Official Pamuklat 2026 Checkpoints
                </h3>
                <p className="text-xs text-[#475569] font-medium">
                  Select a stop to view instructions and scan your stamp QR code.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#052856] bg-[#052856]/10 border border-[#052856]/20 px-3 py-1 rounded-xl font-extrabold">
                {completedCount} Cleared / {remainingCount} Pending
              </span>
            </div>

            {/* Boarding Passes Lists */}
            <div className="space-y-4">
              {initialDestinations.map((dest, idx) => {
                const isCompleted = completedIds.includes(dest.id)

                return (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="relative overflow-hidden ticket-card transition-all rounded-3xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md"
                  >
                    {/* Decorative ticket cutout line */}
                    <div className="absolute top-0 bottom-0 left-[72%] border-l-2 border-dashed border-[#E2E8F0] pointer-events-none hidden md:block" />

                    <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-stretch gap-6">

                      {/* Left Block: Flight Boarding Pass Information */}
                      <div className="md:w-[68%] flex flex-col justify-between space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-xl shrink-0 shadow-sm">
                              {renderIcon(dest.icon, dest.destination_color)}
                            </span>
                            <div>
                              <span className="text-[9px] font-mono uppercase tracking-widest text-[#0A3A78] block leading-none font-black">
                                Pamuklat Stop #{idx + 1}
                              </span>
                              <h4 className="text-base font-black text-[#052856] tracking-tight mt-0.5">
                                {dest.title}
                              </h4>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#64748B] block leading-none font-bold">
                              Gate
                            </span>
                            <span className="font-mono font-extrabold text-xs text-[#052856] bg-[#F8FAFC] px-2.5 py-0.5 rounded-md border border-[#CBD5E1] mt-0.5 inline-block">
                              {dest.gate_number}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#334155] font-medium line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>

                        <div className="flex items-center gap-5 text-[10px] text-[#475569] font-mono font-extrabold uppercase">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#052856]" />
                            <span>Est: {dest.estimated_duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Compass className="h-3.5 w-3.5 text-[#052856]" />
                            <span>Rep: {dest.representative}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Passenger Boarding Stub */}
                      <div className="md:w-[28%] flex flex-col justify-center items-center text-center border-t md:border-t-0 border-[#E2E8F0] pt-4 md:pt-0 z-10">
                        {isCompleted ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <motion.div
                              initial={{ scale: 0.8, rotate: -15 }}
                              animate={{ scale: 1, rotate: -6 }}
                              className="border-2 border-dashed border-emerald-600 text-emerald-700 bg-emerald-50 text-[10px] font-black tracking-widest rounded-xl px-4 py-2 uppercase shadow-sm flex items-center gap-1"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" /> STAMP CLEARED
                            </motion.div>
                            <span className="text-[8px] font-mono text-[#64748B] uppercase mt-1 font-extrabold">
                              Verified Entry
                            </span>
                          </div>
                        ) : (
                          <Link href={`/destinations/${dest.id}`} className="w-full">
                            <div className="w-full flex items-center justify-center gap-1.5 bg-[#052856] hover:bg-[#031D40] text-white text-[10px] font-extrabold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md shadow-[#052856]/20 border border-[#0A3A78] cursor-pointer transition-colors group">
                              Visit Stop
                              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* REAL-TIME NOTIFICATIONS BOARD */}
          <motion.div
            id="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-3xl p-6 shadow-sm space-y-4 bg-white border border-[#E2E8F0]"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black tracking-widest text-[#052856] uppercase">
                Immigration Telex Logs
              </h3>
              <Bell className="h-4 w-4 text-[#052856]" />
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all relative ${
                    notif.is_read
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                      : 'bg-blue-50 border-blue-200 text-[#052856]'
                  }`}
                >
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="absolute top-2.5 right-2.5 text-[9px] font-mono text-[#052856] hover:text-[#031D40] uppercase tracking-wider bg-white border border-blue-200 px-2 py-0.5 rounded cursor-pointer font-bold shadow-xs"
                    >
                      Acknowledge
                    </button>
                  )}
                  <div className="font-bold pr-16 truncate text-[#052856]">{notif.title}</div>
                  <p className="text-[11px] text-[#334155] font-medium mt-1 leading-normal pr-2">
                    {notif.message}
                  </p>
                  <div className="text-[9px] text-[#64748B] font-mono mt-2 font-semibold">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                  Telex log is silent.
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
