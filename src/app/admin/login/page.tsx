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
    <div className="min-h-screen relative overflow-hidden bg-[#F4F6F9] text-[#0F1D36] flex flex-col items-center justify-center p-4">
      {/* Background ambient light glows */}
      <div className="absolute top-[20%] left-[20%] w-[35%] h-[35%] bg-[#0A3A78]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[35%] h-[35%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main access block */}
      <div className="w-full max-w-md my-auto">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center space-y-3">
          <div className="bg-[#052856]/10 border border-[#052856]/20 p-3 rounded-2xl text-[#052856] shadow-md">
            <Plane className="h-6 w-6 transform -rotate-45" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-[0.35em] text-[#0A3A78] uppercase block">
              Authorized Personnel Only
            </span>
            <h1 className="text-xl font-black text-[#052856] tracking-tight mt-1 uppercase">
              Flight Control Terminal
            </h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-[#E2E8F0]"
        >
          {/* Top terminal HUD styling */}
          <div className="flex justify-between items-center mb-6 border-b border-[#E2E8F0] pb-4">
            <span className="text-[10px] text-[#0A3A78] font-mono font-black tracking-widest uppercase">
              Immigration Operations Console
            </span>
            <div className="flex items-center gap-1.5 text-[9px] text-[#475569] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SECURE PORT 2026
            </div>
          </div>

          {state.error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 flex items-start gap-2.5 font-semibold">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold">
                Operator Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Enter operator code"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-3 pl-11 pr-4 outline-none text-xs transition-all font-mono font-semibold"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold">
                Clearance Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter authorization key"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-3 pl-11 pr-4 outline-none text-xs transition-all font-mono font-semibold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#052856] via-[#0A3A78] to-[#1E4FCC] hover:from-[#031D40] hover:to-[#083064] disabled:opacity-50 text-white font-black py-3.5 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-[#052856]/20 border border-[#0A3A78]/30 mt-6 cursor-pointer text-xs uppercase tracking-widest"
            >
              {isPending ? 'Requesting Operations Entry...' : 'Unlock Control Panel'}
              {!isPending && <ArrowRight className="h-4.5 w-4.5 text-white" />}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Return to passenger terminal link */}
      <div className="mt-8 text-center z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[11px] text-[#475569] hover:text-[#052856] transition-colors uppercase tracking-widest border-b border-transparent hover:border-[#052856]/40 font-mono pb-0.5 font-bold"
        >
          <Ticket className="h-3.5 w-3.5 text-[#0A3A78]" /> Return to Passenger Kiosk (Check-In)
        </Link>
      </div>
    </div>
  )
}
