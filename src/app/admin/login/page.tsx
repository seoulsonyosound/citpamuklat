'use client'

import React, { useActionState, startTransition } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, User, Plane, AlertTriangle, ArrowRight, Ticket } from 'lucide-react'
import { adminLoginAction } from '@/app/actions/authActions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const initialState = {
  error: null as string | null,
  success: false as boolean,
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await adminLoginAction(prevState, formData)
      if (result.success) {
        // Force routing reload
        startTransition(() => {
          router.push('/admin/dashboard')
          router.refresh()
        })
        return { error: null, success: true }
      }
      return { error: result.error || 'Authentication failed', success: false }
    },
    initialState
  )

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#08111F] text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Background neon elements */}
      <div className="absolute top-[20%] left-[20%] w-[35%] h-[35%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[35%] h-[35%] bg-[#2563EB]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main access block */}
      <div className="w-full max-w-md my-auto">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/5">
            <Plane className="h-6 w-6 transform -rotate-45" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.35em] text-amber-400 uppercase block">
              Authorized Personnel Only
            </span>
            <h1 className="text-xl font-black text-white tracking-tight mt-1 uppercase">
              Flight Control Terminal
            </h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-dark rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-slate-850"
        >
          {/* Top terminal HUD styling */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-850 pb-4">
            <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">
              Immigration Operations Console
            </span>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              SECURE PORT 2026
            </div>
          </div>

          {state.error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/25 bg-red-950/25 text-xs text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                Operator Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Enter operator code"
                  className="w-full bg-[#0E1B30] border border-slate-800 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/40 text-slate-100 rounded-xl py-3 pl-11 pr-4 outline-none text-xs transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                Clearance Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter authorization key"
                  className="w-full bg-[#0E1B30] border border-slate-800 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/40 text-slate-100 rounded-xl py-3 pl-11 pr-4 outline-none text-xs transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-amber-600/10 border border-amber-500/25 mt-6 cursor-pointer text-xs uppercase tracking-widest"
            >
              {isPending ? 'Requesting Operations Entry...' : 'Unlock Control Panel'}
              {!isPending && <ArrowRight className="h-4.5 w-4.5 text-white/80" />}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Return to passenger terminal link */}
      <div className="mt-8 text-center z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-[#12484C] transition-colors uppercase tracking-widest border-b border-transparent hover:border-[#12484C]/40 font-mono pb-0.5"
        >
          <Ticket className="h-3.5 w-3.5 text-[#2B7574]" /> Return to Passenger Kiosk (Check-In)
        </Link>
      </div>
    </div>
  )
}
