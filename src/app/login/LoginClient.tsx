'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Plane, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

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

  // Mock flight departure data for the airport kiosk departure board
  const [flights, setFlights] = useState<Flight[]>([
    { destination: 'REGISTRATION DESK', gate: 'GATE A1', status: 'BOARDING', time: '09:00' },
    { destination: 'COLLEGE LIBRARY', gate: 'GATE B2', status: 'READY', time: '09:30' },
    { destination: 'SSITE COMPUTER LAB', gate: 'GATE C1', status: 'BOARDING', time: '10:00' },
    { destination: 'STUDENT SERVICES', gate: 'GATE D3', status: 'DELAYED', time: '10:45' },
    { destination: 'INNOVATION HUB', gate: 'GATE E1', status: 'READY', time: '11:15' },
    { destination: 'ORGANIZATION FAIR', gate: 'GATE F2', status: 'CLOSED', time: '12:00' },
  ])

  useEffect(() => {
    // Add split-flap noise/letter rotatory effect by changing status randomly
    const interval = setInterval(() => {
      setFlights((prev) =>
        prev.map((flight, idx) => {
          if (idx === Math.floor(Math.random() * prev.length)) {
            const statuses = ['BOARDING', 'READY', 'FINAL CALL', 'CLOSED']
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
    <div className="min-height-screen w-full relative overflow-hidden bg-[#08111F] text-slate-100 flex flex-col md:flex-row items-stretch min-h-screen">
      {/* Background glowing airport HUDs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2563EB]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#60A5FA]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* LEFT COLUMN: Airport Flight Departures Board */}
      <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-[#040912]/80 backdrop-blur-md">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-[#2563EB]/20 border border-[#60A5FA]/30 p-2.5 rounded-xl shadow-lg shadow-[#2563EB]/10">
              <Plane className="h-6 w-6 text-[#60A5FA] transform -rotate-45" />
            </div>
            <div>
              <span className="font-semibold text-xs tracking-[0.25em] text-[#60A5FA] uppercase block">
                UA Onboarding
              </span>
              <h1 className="font-bold text-lg text-white leading-none">CIT DIGITAL PASSPORT</h1>
            </div>
          </div>

          {/* DEPARTURES BOARD */}
          <div className="rounded-2xl border border-slate-800 bg-[#08111F]/90 p-6 shadow-2xl relative">
            <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-[#2563EB] text-[9px] font-bold text-white px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md">
              Live Terminal 1 Status
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400">
              <div className="w-1/2">Destination Gate</div>
              <div className="w-1/4 text-center">Time</div>
              <div className="w-1/4 text-right">Status</div>
            </div>

            <div className="space-y-4">
              {flights.map((flight, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between font-mono text-sm border-b border-slate-900 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="w-1/2 flex items-start gap-2">
                    <span className="text-[#60A5FA] font-bold text-xs shrink-0 mt-0.5">
                      📍
                    </span>
                    <div>
                      <div className="font-bold text-white tracking-wide uppercase">
                        {flight.destination}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans tracking-wide uppercase">
                        {flight.gate}
                      </div>
                    </div>
                  </div>
                  <div className="w-1/4 text-center text-[#60A5FA] font-semibold">
                    {flight.time}
                  </div>
                  <div className="w-1/4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded tracking-widest border transition-all ${
                        flight.status === 'BOARDING'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                          : flight.status === 'READY'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                          : flight.status === 'FINAL CALL'
                          ? 'bg-red-950/40 text-red-400 border-red-500/30 animate-pulse'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      {flight.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer citation */}
        <div className="mt-8 text-xs text-slate-500 flex items-center justify-between border-t border-slate-900 pt-6">
          <span>University of the Assumption</span>
          <span>© 2026 SSITE Chapter</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Kiosk Screen Interactive Card */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 lg:p-12 items-center min-h-[500px]">
        <div className="my-auto w-full max-w-md">
          {/* Main check-in terminal panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-panel-dark rounded-3xl p-8 shadow-2xl relative"
          >
            {/* Design header lines */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/40 border border-red-500/20" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500/40 border border-amber-500/20" />
                <span className="w-3.5 h-3.5 rounded-full bg-green-500/40 border border-green-500/20" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                System Kiosk v1.0.0
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                SELF CHECK-IN KIOSK
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Scan your credentials to issue your digital boarding pass and start your campus journey.
              </p>
            </div>

            {/* Error alerts */}
            {errorType && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`mb-6 p-4 rounded-xl border text-xs flex gap-3 items-start ${
                  errorType === 'domain'
                    ? 'bg-red-950/30 text-red-300 border-red-500/20'
                    : 'bg-amber-950/30 text-amber-300 border-amber-500/20'
                }`}
              >
                {errorType === 'domain' ? (
                  <>
                    <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-1">Access Restricted</strong>
                      Only Google student email addresses ending with <strong>@student.ua.edu.ph</strong> are permitted to board this flight.
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-1">Boarding Warning</strong>
                      Authentication process failed. Please ensure your internet connection is active and try scanning again.
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Main Google sign in card button */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-between bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-[#2563EB]/20 border border-[#60A5FA]/30 cursor-pointer relative overflow-hidden group"
              >
                <div className="flex items-center gap-4">
                  {/* Google Custom G Icon */}
                  <div className="bg-white p-2 rounded-xl text-black shrink-0">
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
                  <span className="tracking-wide text-sm font-bold uppercase text-left block">
                    {loading ? 'Initializing check-in...' : 'Google Student Check-in'}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest mt-4">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Secure Google OAuth check
              </div>
            </div>
          </motion.div>
        </div>

        {/* Small Admin Gateway link */}
        <div className="mt-8 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#60A5FA] transition-colors uppercase tracking-widest border-b border-transparent hover:border-[#60A5FA]/40 font-mono pb-0.5"
          >
            👨‍✈️ Flight Operations Terminal (Admin Access)
          </Link>
        </div>
      </div>
    </div>
  )
}
