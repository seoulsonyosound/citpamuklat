'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Signpost, ShieldAlert, ArrowRight, ShieldCheck, MapPin, UserCheck, Sparkles, Navigation, Flag, Clock, Activity, CheckCircle2, Compass } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { OFFICIAL_PAMUKLAT_STOPS } from '@/lib/pamuklatStops'
import Footer from '@/components/Footer'

interface Flight {
  destination: string
  gate: string
  status: string
  time: string
}

export default function LoginClient() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get('error')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Mouse tilt position state for interactive 3D effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // 8 Official Pamuklat 2026 stops listed on departure board
  const [flights, setFlights] = useState<Flight[]>(
    OFFICIAL_PAMUKLAT_STOPS.map((stop, idx) => ({
      destination: stop.title.toUpperCase(),
      gate: stop.gate_number,
      status: idx % 2 === 0 ? 'BOARDING' : 'READY',
      time: `0${8 + Math.floor(idx / 2)}:${(idx % 2) * 30 || '00'}`
    }))
  )

  useEffect(() => {
    // Status update animation loop
    const interval = setInterval(() => {
      setFlights((prev) =>
        prev.map((flight, idx) => {
          if (idx === Math.floor(Math.random() * prev.length)) {
            const statuses = ['BOARDING', 'READY', 'FINAL CALL', 'OPEN']
            return {
              ...flight,
              status: statuses[Math.floor(Math.random() * statuses.length)],
            }
          }
          return flight
        })
      )
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    // Calculate tilt ratios from -1 to 1
    const x = (clientX / innerWidth - 0.5) * 2
    const y = (clientY / innerHeight - 0.5) * 2
    setMousePos({ x, y })
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setLoading(false)
      console.error('OAuth configuration failure:', error.message)
    }
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full relative overflow-hidden bg-[#F4F4F2] text-[#052856] flex flex-col perspective-1500 select-none"
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch">
        {/* LEFT COLUMN: Google Student Self Check-In Terminal Card with 3D Background Shapes */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 lg:p-12 items-center min-h-[550px] relative overflow-hidden bg-[#F4F4F2] border-b md:border-b-0 md:border-r border-[#E2E2E0] z-10">

          {/* 3D FLOATING BACKGROUND SHAPES & GLOWS (LEFT SIDE) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            
            {/* Radial Ambient Deep Royal Navy Blue Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#052856]/10 via-[#0A3A78]/15 to-[#1E4FCC]/10 rounded-full blur-[90px] pointer-events-none" />

            {/* Aesthetic Curvy Broken Dashed Line SVG in Single Solid Warm Gold Yellow (#E8A100) */}
            <svg
              viewBox="0 0 600 800"
              className="absolute inset-0 w-full h-full object-cover opacity-100 filter drop-shadow(0 6px 14px rgba(232, 161, 0, 0.45))"
              preserveAspectRatio="none"
            >
              {/* Curvy Broken Dashed Line in Solid #E8A100 */}
              <path
                d="M -20 680 C 150 520, 100 280, 320 220 C 480 160, 520 80, 620 20"
                fill="none"
                stroke="#E8A100"
                strokeWidth="5"
                strokeDasharray="20 12"
                strokeLinecap="round"
                className="animate-dash-flow"
              />
            </svg>

            {/* Pure Floating Location Pin (Top Right - Deep Royal Navy Blue #052856) - Filled with white circle */}
            <div className="absolute top-12 right-12 animate-chill-float pointer-events-none z-10 flex items-center justify-center opacity-90">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow(0 12px 24px rgba(5, 40, 86, 0.45))"
              >
                {/* Filled solid navy pin body */}
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#052856"
                  stroke="#052856"
                  strokeWidth="0.3"
                />
                {/* White circle hole in center */}
                <circle cx="12" cy="9" r="2.8" fill="white" />
              </svg>
            </div>

            {/* Pure Floating Finish Flag (Bottom Left - Crimson Red #861211) - FILLED */}
            <div className="absolute bottom-16 left-12 animate-chill-float-reverse pointer-events-none z-10 flex items-center justify-center opacity-90">
              <Flag className="h-20 w-20 text-[#861211] filter drop-shadow(0 12px 24px rgba(134, 18, 17, 0.45))" style={{ fill: '#861211', stroke: '#861211', strokeWidth: 1.5 }} />
            </div>

            {/* Rotating Compass background Grid */}
            <div className="absolute bottom-8 right-8 w-72 h-72 opacity-[0.18] text-[#052856] pointer-events-none bg-shape-spin">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <polygon points="50,5 58,42 95,50 58,58 50,95 42,58 5,50 42,42" />
              </svg>
            </div>
          </div>

          {/* SELF CHECK-IN TERMINAL CARD */}
          <div className="my-auto w-full max-w-md relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                rotateX: mousePos.y * 6,
                rotateY: mousePos.x * -6,
              }}
              className="rounded-3xl p-8 bg-white border border-[#E2E2E0] shadow-3d-card preserve-3d relative transition-all duration-300 hover:shadow-3d-float"
            >
              {/* Decorative Top Light Bar */}
              <div className="flex justify-between items-center mb-6 border-b border-[#E2E2E0] pb-4">
                <div className="flex gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#861211] border border-[#861211]/30 shadow-sm" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E8A100] border border-[#E8A100]/30 shadow-sm" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#052856] border border-[#052856]/30 shadow-sm" />
                </div>
                <div className="text-[10px] text-[#052856] font-mono tracking-widest uppercase font-extrabold flex items-center gap-1 bg-[#052856]/10 border border-[#052856]/20 px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-[#0A3A78]" /> Student Kiosk v2026.1
                </div>
              </div>

              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-[#0A3A78] uppercase tracking-[0.25em] block mb-1">
                  Freshmen Orientation Portal
                </span>
                <h2 className="text-2xl font-black text-[#052856] tracking-tight mb-2 uppercase">
                  Self Check-In Terminal
                </h2>
                <p className="text-xs text-[#5A6B85] max-w-xs mx-auto leading-relaxed">
                  Sign in with your Google student account to claim your Digital Passport booklet and track your 8 Pamuklat stamps.
                </p>
              </div>

              {/* Error alerts using Crimson Red #861211 */}
              {errorType && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className={`mb-6 p-4 rounded-2xl border text-xs flex gap-3 items-start ${
                    errorType === 'domain'
                      ? 'bg-[#861211]/10 text-[#861211] border-[#861211]/30'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {errorType === 'domain' ? (
                    <>
                      <ShieldAlert className="h-5 w-5 text-[#861211] shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block mb-1">Access Restricted</strong>
                        Only Google student email addresses ending with <strong>@student.ua.edu.ph</strong> are permitted to board.
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block mb-1">Boarding Warning</strong>
                        Authentication process failed. Please ensure your internet connection is active and try scanning again.
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Main Google sign in button using Deep Royal Navy Blue (#052856) gradient */}
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-[#052856] via-[#0A3A78] to-[#1E4FCC] hover:from-[#031D40] hover:to-[#083064] disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-[#052856]/25 border border-[#0A3A78]/30 cursor-pointer relative overflow-hidden group transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    {/* Google Custom G Icon */}
                    <div className="bg-white p-2.5 rounded-xl text-black shrink-0 shadow-md">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.98 1 12 1 7.35 1 3.37 3.65 1.42 7.54l3.88 3c.96-2.88 3.66-5.5 6.7-5.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.92c2.2-2.03 3.67-5.01 3.67-8.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.3 10.54c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.42 3C.51 4.8.01 6.84.01 9s.5 4.2 1.41 6l3.88-3.46z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.92c-1.05.7-2.39 1.13-4.2 1.13-3.04 0-5.74-2.62-6.7-5.5l-3.88 3c1.95 3.89 5.93 6.54 10.58 6.54z"
                        />
                      </svg>
                    </div>
                    <span className="tracking-wide text-xs font-extrabold uppercase text-left block">
                      {loading ? 'Initializing check-in...' : 'Google Student Check-In'}
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/90 group-hover:translate-x-1.5 transition-transform shrink-0" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#5A6B85] uppercase tracking-widest font-bold mt-4">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#052856]" />
                  Verified Student OAuth Security
                </div>
              </div>
            </motion.div>
          </div>

          {/* Small Admin Gateway link */}
          <div className="mt-6 text-center relative z-10">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-[11px] text-[#5A6B85] hover:text-[#052856] transition-colors uppercase tracking-widest border-b border-transparent hover:border-[#052856]/40 font-mono pb-0.5 font-bold"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#052856]" /> Flight Operations Terminal (Admin Access)
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: CIT PAMUKLAT 2026 Title Header & Departures Clearance Board */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 p-6 lg:p-10 flex flex-col justify-between bg-[#FAFBFD] relative overflow-hidden z-10 border-l border-[#E2E2E0]/80"
        >
          {/* Subtle Ambient Background Watermark / Grid Effect */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#052856] blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(#052856_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>

          <div className="relative z-10">
            {/* FRESHMEN ORIENTATION PORTAL Pill Badge with Live Status Pulsing Dot */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#052856]/10 border border-[#052856]/25 text-[#052856] shadow-sm">
                <Navigation className="h-3.5 w-3.5 text-[#052856]" />
                <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#052856]">
                  Freshmen Orientation Portal
                </span>
              </div>
              
              <div className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Terminal Board
              </div>
            </div>

            {/* Logo Brand Header Title */}
            <div className="flex items-center gap-4 mb-8">
              {/* Solid Blue Background Signpost Icon Container with Yellow Circle Below — tilted */}
              <div className="relative bg-[#043268] border border-[#043268] p-3.5 rounded-2xl shadow-md shadow-[#043268]/30 shrink-0 transform -rotate-12">
                <Signpost className="h-6 w-6 text-white" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E8A100] border-2 border-white shadow-sm" />
              </div>

              <div className="flex-1">
                <span className="font-extrabold text-[10px] tracking-[0.3em] text-[#0A3A78] uppercase block leading-none">
                  University of the Assumption — SSITE Chapter
                </span>
                <h1 className="font-black text-xl lg:text-2xl text-[#052856] tracking-tight mt-1">
                  CIT PAMUKLAT 2026 DIGITAL PASSPORT
                </h1>
              </div>


            </div>

            {/* DEPARTURES BOARD (8 STOPS) — High Tech Airport Terminal Styling */}
            <motion.div 
              style={{
                rotateX: mousePos.y * -3,
                rotateY: mousePos.x * 3,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="rounded-3xl border border-[#D8E0EB] bg-white shadow-[0_15px_45px_rgba(5,40,86,0.08)] relative preserve-3d transition-shadow hover:shadow-[0_20px_50px_rgba(5,40,86,0.14)] overflow-hidden"
            >
              {/* Terminal Board Header Banner */}
              <div className="bg-gradient-to-r from-[#052856] via-[#0A3A78] to-[#052856] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#0A3A78]/30">
                <div className="flex items-center gap-2">
                  <Signpost className="h-4 w-4 text-[#E8A100]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest">
                    Official Pamuklat 2026 Clearance Departure Board
                  </span>
                </div>
                <div className="text-[9px] font-mono text-white/80 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
                  8 STOPS ACTIVE
                </div>
              </div>

              {/* Table Header Row */}
              <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-slate-100 text-[9.5px] uppercase tracking-[0.2em] font-extrabold text-[#052856]/80 bg-slate-50/60">
                <div className="w-7/12 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-[#052856]" />
                  <span>Clearance Stop / Gate</span>
                </div>
                <div className="w-2/12 text-center flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-[#052856]" />
                  <span>Time</span>
                </div>
                <div className="w-3/12 text-right flex items-center justify-end gap-1">
                  <Activity className="h-3 w-3 text-[#052856]" />
                  <span>Status</span>
                </div>
              </div>

              {/* Table Rows */}
              <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto pr-2">
                {flights.map((flight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="flex items-center justify-between font-mono text-xs p-2.5 rounded-2xl bg-white border border-[#E8EEF5] hover:border-[#052856]/30 hover:bg-[#052856]/[0.02] hover:translate-x-1 transition-all group shadow-sm"
                  >
                    {/* Stop Name & Gate Pill */}
                    <div className="w-7/12 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-xl bg-[#052856]/10 text-[#052856] font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-[#052856]/15 group-hover:bg-[#052856] group-hover:text-white transition-colors">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="font-extrabold text-[#052856] tracking-wide text-xs group-hover:text-[#0A3A78] transition-colors">
                          {flight.destination}
                        </div>
                        <div className="text-[9px] text-[#5A6B85] font-sans tracking-wider uppercase font-extrabold mt-0.5 flex items-center gap-1">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                            {flight.gate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div className="w-2/12 text-center text-[#0A3A78] font-extrabold text-xs">
                      {flight.time}
                    </div>

                    {/* Live Status Pill Badge */}
                    <div className="w-3/12 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black rounded-lg tracking-wider border shadow-sm transition-all ${
                          flight.status === 'BOARDING'
                            ? 'bg-[#E8A100]/15 text-[#B47B00] border-[#E8A100]/40'
                            : flight.status === 'READY'
                            ? 'bg-[#052856]/10 text-[#052856] border-[#052856]/30'
                            : flight.status === 'FINAL CALL'
                            ? 'bg-[#861211]/15 text-[#861211] border-[#861211]/40 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {flight.status === 'BOARDING' && <span className="w-1.5 h-1.5 rounded-full bg-[#E8A100] animate-ping" />}
                        {flight.status === 'FINAL CALL' && <span className="w-1.5 h-1.5 rounded-full bg-[#861211]" />}
                        {flight.status === 'READY' && <CheckCircle2 className="h-3 w-3 text-[#052856]" />}
                        {flight.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Global Bottom Footer with 3 Logos (SSITE -> UA -> CIT) & CANDABA GURLZ badge */}
      <Footer />
    </div>
  )
}
