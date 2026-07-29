'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, BookOpen, Hash, Calendar, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'
import { completeOnboardingAction } from '@/app/actions/authActions'

const onboardingSchema = z.object({
  studentId: z.string().min(3, 'Student ID must be at least 3 characters.').max(15, 'Student ID too long.'),
  course: z.string().min(1, 'Please select your Course.'),
  section: z.string().min(1, 'Section is required (e.g. 1-A, 1-B).').max(10, 'Section name too long.'),
  yearLevel: z.string().min(1, 'Please select your Year Level.'),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

interface Props {
  email: string
  fullName: string
  avatarUrl: string
}

export default function OnboardingForm({ email, fullName, avatarUrl }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [successAnimation, setSuccessAnimation] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      studentId: '',
      course: 'BS in Information Technology',
      section: '',
      yearLevel: '1st Year',
    },
  })

  // Watch fields to update the live passport preview dynamically
  const watchStudentId = watch('studentId')
  const watchCourse = watch('course')
  const watchSection = watch('section')
  const watchYearLevel = watch('yearLevel')

  const onSubmit = async (values: OnboardingValues) => {
    setServerError(null)
    setIssuing(true)
    
    try {
      const result = await completeOnboardingAction(values)
      if (result.error) {
        setServerError(result.error)
        setIssuing(false)
      } else {
        // Play premium stamp success animation before redirect
        setSuccessAnimation(true)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2200)
      }
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred.')
      setIssuing(false)
    }
  }

  // Generate MRZ (Machine Readable Zone) code matching the passport details
  const generateMRZ = () => {
    const formattedName = fullName.replace(/\s+/g, '<').toUpperCase()
    const formattedCourse = (watchCourse || 'CIT').split(' ').map(w => w[0]).join('').toUpperCase()
    const cleanId = (watchStudentId || '0000000').padEnd(10, '<').replace(/\s+/g, '<')
    
    return (
      <div className="font-mono text-[9px] text-[#A78BFA] leading-none tracking-widest uppercase mt-4 border-t border-[#A78BFA]/10 pt-3">
        <div>P&lt;PHL{formattedName}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
        <div>{cleanId}PHL{formattedCourse}&lt;{watchSection || '1A'}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-y-auto bg-[#08111F] text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background radial overlays */}
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[#2563EB]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-[#60A5FA]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch mt-4 mb-4">
        
        {/* LEFT COLUMN: Passport Control Clearance Terminal */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#60A5FA] font-bold">
              Immigration Gate 01
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              PASSPORT CONTROL
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Review and complete your credentials. Once confirmed, your official Digital Passport will be issued.
            </p>
          </div>

          {/* Holographic Passport Preview Card */}
          <div className="relative rounded-3xl border border-slate-700 bg-radial-gradient p-6 shadow-2xl relative overflow-hidden passport-inner-bg text-slate-800 flex flex-col justify-between aspect-[1.58/1] min-h-[280px]">
            {/* Holographic grid watermark overlay */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-br from-[#2563EB]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-3 z-10">
              <div className="text-left">
                <span className="text-[7px] uppercase tracking-widest text-slate-500 font-bold block leading-none">
                  University of the Assumption
                </span>
                <span className="text-[10px] font-extrabold text-indigo-900 tracking-tight block uppercase mt-0.5">
                  CIT Freshmen Digital Passport
                </span>
              </div>
              <div className="text-right">
                <span className="text-[7px] uppercase tracking-widest text-slate-500 font-bold block leading-none">
                  Passport No.
                </span>
                <span className="text-[10px] font-mono font-bold text-red-600">
                  UA-2026-PENDING
                </span>
              </div>
            </div>

            {/* Central bio grid */}
            <div className="flex gap-4 items-center mt-3 z-10 flex-1">
              {/* Photo Frame */}
              <div className="relative w-20 h-24 rounded-lg overflow-hidden border-2 border-indigo-900/20 bg-slate-200 shadow-inner flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Google Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
                {/* Holographic target grid lines */}
                <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500" />
              </div>

              {/* Bio Details */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] flex-1">
                <div>
                  <span className="text-[6px] text-slate-500 uppercase block font-bold">Surname / Given Names</span>
                  <span className="font-bold text-indigo-950 uppercase truncate block max-w-[140px]">
                    {fullName}
                  </span>
                </div>
                <div>
                  <span className="text-[6px] text-slate-500 uppercase block font-bold">Email Address</span>
                  <span className="font-semibold text-slate-700 truncate block max-w-[140px]">
                    {email}
                  </span>
                </div>
                <div>
                  <span className="text-[6px] text-slate-500 uppercase block font-bold">Student ID</span>
                  <span className="font-mono font-bold text-indigo-950">
                    {watchStudentId || 'UA-XXXX-XXX'}
                  </span>
                </div>
                <div>
                  <span className="text-[6px] text-slate-500 uppercase block font-bold">Course / Degree</span>
                  <span className="font-bold text-indigo-950 truncate block max-w-[130px]" title={watchCourse}>
                    {watchCourse || 'Select Course'}
                  </span>
                </div>
                <div>
                  <span className="text-[6px] text-slate-500 uppercase block font-bold">Class Section</span>
                  <span className="font-bold text-indigo-950 uppercase">
                    {watchSection || 'TBD'}
                  </span>
                </div>
                <div>
                  <span className="text-[6px] text-slate-500 uppercase block font-bold">Year Level</span>
                  <span className="font-semibold text-slate-700">
                    {watchYearLevel || '1st Year'}
                  </span>
                </div>
              </div>
            </div>

            {/* MRZ footer */}
            {generateMRZ()}

            {/* Red Pending Stamp overlay */}
            <div className="absolute bottom-12 right-6 border-[3px] border-red-600/70 text-red-600/70 font-mono font-extrabold text-[10px] tracking-widest px-3 py-1.5 uppercase rounded transform rotate-[-12deg] pointer-events-none select-none shadow shadow-red-500/10">
              PENDING CLEARANCE
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Input Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel-dark rounded-3xl p-6 md:p-8 shadow-2xl relative"
          >
            {/* Header info */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <span className="text-xs uppercase tracking-widest text-[#60A5FA] font-bold">
                Clearance Application Form
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
            </div>

            {serverError && (
              <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-xs text-red-300 flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Student ID */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                  Student ID Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Hash className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    {...register('studentId')}
                    placeholder="e.g. 2026-10293"
                    className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-slate-100 rounded-xl py-3 pl-11 pr-4 outline-none text-sm transition-all font-mono"
                  />
                </div>
                {errors.studentId && (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    ⚠️ {errors.studentId.message}
                  </p>
                )}
              </div>

              {/* Course selection */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                  CIT Academic Program
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <select
                    {...register('course')}
                    className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-slate-100 rounded-xl py-3 pl-11 pr-4 outline-none text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option value="BS in Information Technology">BS in Information Technology (BSIT)</option>
                    <option value="BS in Computer Science">BS in Computer Science (BSCS)</option>
                    <option value="BS in Computer Engineering">BS in Computer Engineering (BSCpE)</option>
                    <option value="Associate in Computer Technology">Associate in Computer Technology (ACT)</option>
                  </select>
                </div>
                {errors.course && (
                  <p className="text-[11px] text-red-400 mt-1.5">⚠️ {errors.course.message}</p>
                )}
              </div>

              {/* Row Grid: Section & Year */}
              <div className="grid grid-cols-2 gap-4">
                {/* Section */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                    Class Section
                  </label>
                  <input
                    type="text"
                    {...register('section')}
                    placeholder="e.g. 1-A or 1-B"
                    className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-sm transition-all"
                  />
                  {errors.section && (
                    <p className="text-[11px] text-red-400 mt-1.5">⚠️ {errors.section.message}</p>
                  )}
                </div>

                {/* Year level */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                    Year Level
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <select
                      {...register('yearLevel')}
                      className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-slate-100 rounded-xl py-3 pl-10 pr-4 outline-none text-sm transition-all appearance-none cursor-pointer"
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                    </select>
                  </div>
                  {errors.yearLevel && (
                    <p className="text-[11px] text-red-400 mt-1.5">⚠️ {errors.yearLevel.message}</p>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={issuing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 mt-6 shadow-xl shadow-[#2563EB]/25 border border-[#60A5FA]/30 cursor-pointer"
              >
                {issuing ? 'Verifying Credentials...' : 'Issue Passport & Enter CIT'}
                {!issuing && <ArrowRight className="h-4.5 w-4.5" />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* SUCCESS POPUP SCREEN TRIGGER */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#040912]/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
              className="max-w-md w-full bg-[#08111F] border border-emerald-500/20 rounded-3xl p-8 text-center shadow-2xl relative"
            >
              {/* Outer sparks */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <motion.div
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mx-auto w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="h-10 w-10 text-emerald-400" />
              </motion.div>

              <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-2">
                Passport Cleared!
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Your credentials have been authenticated. Digital Passport is stamped and registered. Safe travels through CIT!
              </p>

              {/* Faux printing status */}
              <div className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest animate-pulse border border-emerald-500/15 bg-emerald-950/20 py-2 rounded-xl">
                ✈️ BOARDING PASS ISSUED. WELCOME ABOARD!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
