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
  AlertCircle,
  Map,
  Check,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

// Helper to resolve Lucide Icons dynamically
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

  // Helper to render lucide icon dynamically with a fallback
  const renderIcon = (iconName: string, color: string) => {
    // Standard icon dictionary fallback
    const IconComponent = (Icons as any)[iconName] || Icons.MapPin
    return <IconComponent className="h-5 w-5" style={{ color }} />
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0F1D36] flex flex-col pb-12 relative overflow-hidden">
      {/* BACKGROUND FLOATING CAMPUS TRAVEL SHAPES */}
      <div className="absolute top-[5%] left-[2%] w-64 h-64 bg-[#1E4FCC]/5 rounded-full blur-3xl pointer-events-none bg-shape-float" />
      <div className="absolute top-[40%] right-[3%] w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none bg-shape-float-delay" />

      {/* Decorative Compass Rose SVG Background Element */}
      <div className="absolute top-[120px] right-[-80px] w-96 h-96 opacity-[0.03] text-[#0F1D36] pointer-events-none bg-shape-spin">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <polygon points="50,0 55,45 100,50 55,55 50,100 45,55 0,50 45,45" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-8 relative z-10">

        {/* WELCOME HUD BANNER / CAMPUS TOUR LOUNGE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel-dark rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md relative overflow-hidden bg-white border border-[#D4DCE8]"
        >
          {/* Decorative radar rings */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#1E4FCC]/5 rounded-full border border-[#3B82F6]/10 pointer-events-none scale-150 transform translate-x-20 -translate-y-20" />

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#1E4FCC]/10 border border-[#1E4FCC]/20 text-[#1E4FCC] px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <Compass className="h-3.5 w-3.5 text-[#1E4FCC]" /> UA Campus Tour Guide
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">Live Tour Active</span>
            </div>

            <h2 className="text-3xl font-extrabold text-[#0F1D36] tracking-tight">
              WELCOME BACK, {profile.full_name.toUpperCase()}
            </h2>
            <p className="text-xs text-[#2D3748] font-medium max-w-xl leading-relaxed">
              Explore your freshmen campus orientation tour! Visit each booth stop to collect stamps in your <strong className="text-[#0F1D36]">Digital Passport</strong>.
            </p>
          </div>

          {/* Passenger Boarding Card Summary */}
          <div className="bg-[#EDF1F7] border border-[#D4DCE8] rounded-2xl p-4 flex gap-4 shrink-0 w-full md:w-auto font-mono text-[11px] uppercase tracking-wider shadow-sm">
            <div className="space-y-1.5 border-r border-[#D4DCE8] pr-4">
              <div className="text-[#2D3748] font-sans text-[9px] font-bold">Explorer Class</div>
              <div className="font-bold text-[#0F1D36]">{profile.course.split(' ')[0]}</div>
              <div className="text-[#2D3748] font-sans text-[9px] font-bold mt-1.5">Section</div>
              <div className="font-bold text-[#1E4FCC]">{profile.section}</div>
            </div>
            <div className="space-y-1.5 pl-2">
              <div className="text-[#2D3748] font-sans text-[9px] font-bold">Passport Status</div>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
              </div>
              <div className="text-[#2D3748] font-sans text-[9px] font-bold mt-1.5">Tour Checkpoints</div>
              <div className="font-bold text-[#0F1D36]">{completedCount} / {totalDestinations} CLEARED</div>
            </div>
          </div>
        </motion.section>

        {/* CAMPUS TOUR JOURNEY ROUTE MAP */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel-dark rounded-3xl p-6 md:p-8 shadow-md bg-white border border-[#D4DCE8] relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#1E4FCC] font-bold block leading-none mb-1">
                Interactive Map
              </span>
              <h3 className="text-base font-extrabold tracking-wide text-[#0F1D36] uppercase flex items-center gap-2">
                <Map className="h-4 w-4 text-[#1E4FCC]" /> Campus Tour Trajectory
              </h3>
              <p className="text-xs text-[#5A6B85] mt-1">
                {completedCount} of {totalDestinations} Pamuklat clearance stops completed.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 font-mono">
              <div className="text-right">
                <div className="text-[#5A6B85] text-[10px] uppercase">Clearance Progress</div>
                <div className="text-2xl font-black text-[#0F1D36]">{completionPercent}%</div>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-[#D4DCE8] bg-[#EDF1F7] flex items-center justify-center text-[#1E4FCC] font-bold shadow-sm">
                <Plane className="h-5 w-5 text-[#1E4FCC]" />
              </div>
            </div>
          </div>

          {/* Connected Pathway slider */}
          <div className="relative py-6 mb-2">
            {/* The line route background */}
            <div className="absolute left-0 right-0 top-1/2 h-[4px] bg-[#E2E8F0] -translate-y-1/2 rounded-full" />

            {/* The completed glowing line route */}
            <div
              className="absolute left-0 top-1/2 h-[4px] bg-gradient-to-r from-[#1E4FCC] to-[#3B82F6] -translate-y-1/2 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${completionPercent}%` }}
            />

            {/* Moving Airplane symbol with smooth motion */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -ml-4 z-20"
              style={{ left: `${completionPercent}%` }}
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <div className="bg-[#1E4FCC] border-2 border-white p-2.5 rounded-full text-white shadow-lg transform rotate-90 flex items-center justify-center">
                <Plane className="h-4 w-4 shrink-0" />
              </div>
            </motion.div>

            {/* Checkpoint nodes */}
            <div className="flex justify-between relative pointer-events-none">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm z-10 flex items-center justify-center text-[9px] text-white font-bold">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-[9px] uppercase tracking-wider mt-2.5 font-bold text-emerald-600">Start</span>
              </div>

              {initialDestinations.map((dest, idx) => {
                const isNodeDone = completedIds.includes(dest.id)
                return (
                  <div key={dest.id} className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-500 z-10 flex items-center justify-center text-[8px] font-bold ${isNodeDone
                        ? 'bg-[#1E4FCC] border-white text-white shadow-sm'
                        : 'bg-white border-[#D4DCE8] text-[#5A6B85]'
                        }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-[8px] uppercase mt-2.5 font-bold tracking-wider hidden sm:block ${isNodeDone ? 'text-[#1E4FCC]' : 'text-[#5A6B85]'}`}>
                      Gate 0{idx + 1}
                    </span>
                  </div>
                )
              })}

              <div className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-500 z-10 flex items-center justify-center text-[8px] font-bold ${completionPercent === 100
                    ? 'bg-emerald-500 border-white text-white shadow-md animate-bounce'
                    : 'bg-white border-[#D4DCE8] text-[#5A6B85]'
                    }`}
                >
                  <Award className="h-3 w-3 text-emerald-600" />
                </div>
                <span className={`text-[9px] uppercase tracking-wider mt-2.5 font-bold ${completionPercent === 100 ? 'text-emerald-600' : 'text-[#5A6B85]'}`}>
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
                <h3 className="text-base font-extrabold tracking-wider text-[#0F1D36] uppercase flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#1E4FCC]" /> Official Pamuklat 2026 Checkpoints
                </h3>
                <p className="text-xs text-[#5A6B85]">
                  Select a stop to view instructions and scan your stamp QR code.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#1E4FCC] bg-[#1E4FCC]/10 border border-[#1E4FCC]/20 px-3 py-1 rounded-xl font-bold">
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
                    className="relative overflow-hidden ticket-card glass-panel-dark transition-all rounded-3xl bg-white border border-[#D4DCE8] shadow-md hover:shadow-lg"
                  >
                    {/* Decorative ticket cutout line */}
                    <div className="absolute top-0 bottom-0 left-[72%] border-l-2 border-dashed border-[#D4DCE8] pointer-events-none hidden md:block" />

                    <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-stretch gap-6">

                      {/* Left Block: Flight Boarding Pass Information */}
                      <div className="md:w-[68%] flex flex-col justify-between space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="bg-[#EDF1F7] border border-[#D4DCE8] p-2.5 rounded-xl shrink-0 shadow-sm">
                              {renderIcon(dest.icon, dest.destination_color)}
                            </span>
                            <div>
                              <span className="text-[9px] font-mono uppercase tracking-widest text-[#1E4FCC] block leading-none font-bold">
                                Pamuklat Stop #{idx + 1}
                              </span>
                              <h4 className="text-base font-extrabold text-[#0F1D36] tracking-wide mt-0.5">
                                {dest.title}
                              </h4>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#5A6B85] block leading-none">
                              Gate
                            </span>
                            <span className="font-mono font-extrabold text-xs text-[#0F1D36] bg-[#EDF1F7] px-2 py-0.5 rounded border border-[#D4DCE8] mt-0.5 inline-block">
                              {dest.gate_number}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#2D3748] font-medium line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>

                        <div className="flex items-center gap-5 text-[10px] text-[#2D3748] font-mono font-bold uppercase">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#1E4FCC]" />
                            <span>Est: {dest.estimated_duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Compass className="h-3.5 w-3.5 text-[#1E4FCC]" />
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
                            <span className="text-[8px] font-mono text-[#5A6B85] uppercase mt-1 font-bold">
                              Verified Entry
                            </span>
                          </div>
                        ) : (
                          <Link href={`/destinations/${dest.id}`} className="w-full">
                            <div className="w-full flex items-center justify-center gap-1.5 bg-[#12484C] hover:bg-[#0E2931] text-white text-[10px] font-extrabold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md shadow-[#12484C]/20 border border-[#2B7574]/20 cursor-pointer transition-colors group">
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
            className="glass-panel-dark rounded-3xl p-6 shadow-md space-y-4 bg-white border border-[#D4DCE8]"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold tracking-widest text-[#1E4FCC] uppercase">
                Immigration Telex Logs
              </h3>
              <Bell className="h-4 w-4 text-[#1E4FCC]" />
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border text-xs transition-all relative ${notif.is_read
                    ? 'bg-[#EDF1F7]/50 border-[#E2E8F0] text-[#5A6B85]'
                    : 'bg-[#1E4FCC]/5 border-[#1E4FCC]/20 text-[#0F1D36]'
                    }`}
                >
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="absolute top-2.5 right-2.5 text-[9px] font-mono text-[#1E4FCC] hover:text-[#0F1D36] uppercase tracking-wider bg-[#1E4FCC]/10 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                    >
                      Acknowledge
                    </button>
                  )}
                  <div className="font-bold pr-16 truncate text-[#0F1D36]">{notif.title}</div>
                  <p className="text-[11px] text-[#5A6B85] mt-1 leading-normal pr-2">
                    {notif.message}
                  </p>
                  <div className="text-[9px] text-[#5A6B85]/80 font-mono mt-2">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 text-[#5A6B85] text-xs font-bold uppercase tracking-wider">
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
