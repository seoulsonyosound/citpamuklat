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
    <div className="min-h-screen bg-[#08111F] text-slate-100 flex flex-col pb-12">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-8">
        
        {/* WELCOME HUD BANNER */}
        <section className="glass-panel-dark rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
          {/* Decorative radar rings */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-royal/5 rounded-full border border-sky-blue/5 pointer-events-none scale-150 transform translate-x-20 -translate-y-20" />

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#2563EB]/20 border border-[#60A5FA]/20 text-[#60A5FA] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                UA Flight Lounge
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Active boarding</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              WELCOME BACK, {profile.full_name.toUpperCase()} ✈️
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              You are checked in for flight <strong className="text-white">CIT-{profile.student_id ? profile.student_id.slice(-4) : '2026'}</strong>. 
              Complete your university clearance destinations to secure your immigration stamps.
            </p>
          </div>

          {/* Passenger Boarding Card Summary */}
          <div className="bg-[#040912]/80 border border-slate-800 rounded-2xl p-4 flex gap-4 shrink-0 w-full md:w-auto font-mono text-[11px] uppercase tracking-wider">
            <div className="space-y-1.5 border-r border-slate-850 pr-4">
              <div className="text-slate-500 font-sans text-[9px]">Passenger Class</div>
              <div className="font-bold text-white">{profile.course.split(' ')[0]}</div>
              <div className="text-slate-500 font-sans text-[9px] mt-1.5">Section</div>
              <div className="font-bold text-[#60A5FA]">{profile.section}</div>
            </div>
            <div className="space-y-1.5 pl-2">
              <div className="text-slate-500 font-sans text-[9px]">Passport State</div>
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> SECURE
              </div>
              <div className="text-slate-500 font-sans text-[9px] mt-1.5">Gate Assignment</div>
              <div className="font-bold text-white">GATE A-Z</div>
            </div>
          </div>
        </section>

        {/* FLIGHT JOURNEY ROUTE MAP */}
        <section className="glass-panel-dark rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="text-sm font-extrabold tracking-widest text-[#60A5FA] uppercase">
                Journey Route Map
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Boarding progress: {completedCount} of {totalDestinations} destinations cleared.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 font-mono">
              <div className="text-right">
                <div className="text-slate-500 text-[10px] uppercase">Completion Rate</div>
                <div className="text-xl font-bold text-white">{completionPercent}%</div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#60A5FA]/30 flex items-center justify-center text-indigo-400 font-bold bg-[#60A5FA]/5">
                ✈️
              </div>
            </div>
          </div>

          {/* Connected Pathway slider */}
          <div className="relative py-4 mb-4">
            {/* The line route background */}
            <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-slate-800 -translate-y-1/2" />
            
            {/* The completed glowing line route */}
            <div 
              className="absolute left-0 top-1/2 h-[3px] bg-gradient-to-r from-[#2563EB] to-[#60A5FA] -translate-y-1/2 shadow-lg shadow-[#2563EB]/40 transition-all duration-1000"
              style={{ width: `${completionPercent}%` }}
            />

            {/* Moving Airplane symbol */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -ml-3 transition-all duration-1000 z-10"
              style={{ left: `${completionPercent}%` }}
            >
              <div className="bg-[#2563EB] border border-[#60A5FA] p-2 rounded-full text-white shadow-xl shadow-[#2563EB]/40 transform rotate-90">
                <Plane className="h-4 w-4 shrink-0" />
              </div>
            </div>

            {/* Checkpoint nodes */}
            <div className="flex justify-between relative pointer-events-none">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-20" />
                <span className="text-[9px] uppercase tracking-wider mt-2.5 font-bold text-emerald-400">Check-in</span>
              </div>
              
              {initialDestinations.map((dest, idx) => {
                const isNodeDone = completedIds.includes(dest.id)
                return (
                  <div key={dest.id} className="flex flex-col items-center">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-500 z-20 ${
                        isNodeDone 
                          ? 'bg-[#2563EB] border-white shadow-md' 
                          : 'bg-[#08111F] border-slate-700'
                      }`}
                    />
                    <span className={`text-[8px] uppercase mt-2.5 font-bold tracking-wider hidden sm:block ${isNodeDone ? 'text-indigo-300' : 'text-slate-500'}`}>
                      Gate {dest.gate_number.replace('GATE', '').trim()}
                    </span>
                  </div>
                )
              })}

              <div className="flex flex-col items-center">
                <div 
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-500 z-20 ${
                    completionPercent === 100 
                      ? 'bg-emerald-500 border-white shadow-lg animate-bounce' 
                      : 'bg-[#08111F] border-slate-700'
                  }`}
                />
                <span className={`text-[9px] uppercase tracking-wider mt-2.5 font-bold ${completionPercent === 100 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Clearance
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1 & 2: Active Boarding Passes (Destinations) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-extrabold tracking-widest text-[#60A5FA] uppercase">
                  ACTIVE DEPARTURES / DESTINATIONS
                </h3>
                <p className="text-xs text-slate-400">
                  Select a gate below to inspect boarding instructions and scan your stamps.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#60A5FA] bg-[#60A5FA]/5 border border-[#60A5FA]/15 px-2.5 py-1 rounded-xl">
                {completedCount} Cleared / {remainingCount} Pending
              </span>
            </div>

            {/* Boarding Passes Lists */}
            <div className="space-y-5">
              {initialDestinations.map((dest) => {
                const isCompleted = completedIds.includes(dest.id)

                return (
                  <motion.div
                    key={dest.id}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="relative overflow-hidden ticket-card glass-panel-dark transition-all rounded-3xl"
                  >
                    {/* Decorative ticket line */}
                    <div className="absolute top-0 bottom-0 left-[72%] border-l-2 border-dashed border-slate-800 pointer-events-none" />

                    <div className="p-6 flex flex-col md:flex-row justify-between items-stretch gap-6">
                      
                      {/* Left Block: Flight Boarding Pass Information */}
                      <div className="md:w-[68%] flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#2563EB]/10 border border-[#60A5FA]/15 text-[#60A5FA] p-1.5 rounded-xl shrink-0">
                              {renderIcon(dest.icon, dest.destination_color)}
                            </span>
                            <div>
                              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block leading-none">
                                UA Clearance flight
                              </span>
                              <h4 className="text-base font-extrabold text-white tracking-wide mt-0.5">
                                {dest.title}
                              </h4>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#60A5FA] block leading-none">
                              Assign Gate
                            </span>
                            <span className="font-mono font-bold text-sm text-white uppercase">
                              {dest.gate_number}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>

                        <div className="flex items-center gap-5 text-[10px] text-slate-500 font-mono uppercase">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Flight Est: {dest.estimated_duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Compass className="h-3.5 w-3.5 text-slate-400" />
                            <span>Rep: {dest.representative}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Passenger Boarding Stub */}
                      <div className="md:w-[28%] flex flex-col justify-center items-center text-center border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 z-10">
                        {isCompleted ? (
                          <div className="flex flex-col items-center gap-1.5">
                            {/* Ink stamp stamp design overlay */}
                            <div className="border-2 border-dashed border-emerald-500 text-emerald-400 bg-emerald-950/20 text-[10px] font-black tracking-widest rounded-xl px-4 py-2 uppercase transform -rotate-6 shadow-inner animate-pulse">
                              IMMIGRATION CLEARED
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase mt-1">
                              Entry Granted ✔
                            </span>
                          </div>
                        ) : (
                          <Link href={`/destinations/${dest.id}`} className="w-full">
                            <div className="w-full flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-extrabold uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-[#2563EB]/20 border border-[#60A5FA]/20 cursor-pointer transition-colors group">
                              Board Gate
                              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </Link>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )
              })}

              {initialDestinations.length === 0 && (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-[#040912]/40 text-slate-500 space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-600" />
                  <div className="text-sm font-bold">No Active Flights Assigned</div>
                  <div className="text-xs max-w-xs mx-auto">
                    Immigration control has no active destinations assigned to this terminal yet. Please check back later.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Mini Passport & Notifications */}
          <div className="space-y-6">
            
            {/* MINI PASSPORT WIDGET */}
            <div className="glass-panel-dark rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-extrabold tracking-widest text-[#60A5FA] uppercase">
                Digital Wallet Passport
              </h3>
              
              <Link href="/passport" className="block cursor-pointer group">
                <div className="passport-cover-bg rounded-2xl p-5 aspect-[1/1.4] text-center flex flex-col justify-between text-slate-100 hover:scale-[1.02] transition-transform duration-300 relative border border-slate-700 shadow-xl select-none">
                  {/* Inside shine cover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-2xl pointer-events-none" />
                  
                  <div className="z-10 flex flex-col items-center">
                    <span className="text-[7px] tracking-[0.3em] text-[#C2C9D6] uppercase block font-bold leading-none">
                      University of the Assumption
                    </span>
                    <span className="text-[10px] font-black text-white/95 uppercase tracking-wide block mt-1">
                      CIT Digital Passport
                    </span>
                  </div>

                  <div className="my-auto z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border border-[#C2C9D6]/30 bg-indigo-950/40 flex items-center justify-center text-white/90 text-2xl mb-2 shadow-inner">
                      ✈️
                    </div>
                    {/* Passport icon symbol */}
                    <div className="w-8 h-6 border border-[#C2C9D6]/50 rounded flex flex-col justify-between p-0.5 opacity-60">
                      <div className="h-1 bg-[#C2C9D6]/50 w-full" />
                      <div className="h-2 w-2 rounded-full bg-[#C2C9D6]/50 mx-auto" />
                      <div className="h-1 bg-[#C2C9D6]/50 w-full" />
                    </div>
                  </div>

                  <div className="z-10">
                    <div className="font-mono text-[9px] text-[#C2C9D6]/80 uppercase truncate block">
                      {profile.full_name}
                    </div>
                    <div className="text-[8px] text-slate-500 uppercase mt-0.5 tracking-wider font-bold">
                      Tap to open passport
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* REAL-TIME NOTIFICATIONS BOARD */}
            <div id="notifications" className="glass-panel-dark rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold tracking-widest text-[#60A5FA] uppercase">
                  Immigration Telex Logs
                </h3>
                <Bell className="h-4 w-4 text-[#60A5FA]" />
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs transition-all relative ${
                      notif.is_read
                        ? 'bg-[#040912]/20 border-slate-900 text-slate-400'
                        : 'bg-[#2563EB]/5 border-[#2563EB]/20 text-slate-200'
                    }`}
                  >
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="absolute top-2.5 right-2.5 text-[9px] font-mono text-[#60A5FA] hover:text-white uppercase tracking-wider bg-[#2563EB]/10 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    <div className="font-bold pr-16 truncate">{notif.title}</div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal pr-2">
                      {notif.message}
                    </p>
                    <div className="text-[9px] text-slate-600 font-mono mt-2">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    Telex log is silent.
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
