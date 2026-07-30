'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, BookOpen, Hash, Calendar, ArrowRight, ShieldAlert, Sparkles, Layers } from 'lucide-react'
import { completeOnboardingAction } from '@/app/actions/authActions'

const onboardingSchema = z.object({
  studentId: z.string().min(3, 'Student ID must be at least 3 characters.').max(15, 'Student ID too long.'),
  course: z.string().min(1, 'Please select your Course.'),
  section: z.string().min(1, 'Please select your Class Section.'),
  yearLevel: z.string().min(1, 'Please select your Year Level.'),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

interface Props {
  email: string
  fullName: string
  avatarUrl: string
}

const SECTION_OPTIONS = [
  '1-A',
  '1-B',
  '1-C',
]

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
      section: '1-A',
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
      <div className="font-mono text-[7.5px] sm:text-[9px] text-[#0A3A78] leading-none tracking-tight sm:tracking-widest uppercase mt-2.5 sm:mt-4 border-t border-[#E2E8F0] pt-2 sm:pt-3 overflow-hidden whitespace-nowrap z-10">
        <div className="truncate">P&lt;PHL{formattedName}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
        <div className="truncate">{cleanId}PHL{formattedCourse}&lt;{watchSection || '1A'}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-y-auto bg-[#F4F6F9] text-[#0F1D36] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
      {/* Background radial overlays */}
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[#052856]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-[#0A3A78]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 sm:gap-8 items-stretch mt-2 sm:mt-4 mb-2 sm:mb-4 z-10">

        {/* LEFT COLUMN: Passport Control Clearance Terminal */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#0A3A78] font-black">
              Immigration Gate 01
            </span>
            <h2 className="text-3xl font-black text-[#052856] tracking-tight mt-1">
              PASSPORT CONTROL
            </h2>
            <p className="text-xs text-[#475569] font-semibold mt-2">
              Review and complete your credentials. Once confirmed, your official Digital Passport will be issued.
            </p>
          </div>

          {/* Holographic Passport Preview Card */}
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-xl relative overflow-hidden passport-inner-bg text-[#0F1D36] flex flex-col justify-between aspect-[1.58/1] min-h-[250px] sm:min-h-[280px]">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-2 sm:pb-3 z-10 gap-2 min-w-0">
              <div className="text-left min-w-0 flex-1">
                <span className="text-[6px] sm:text-[7px] uppercase tracking-wider sm:tracking-widest text-[#64748B] font-bold block leading-none truncate">
                  University of the Assumption
                </span>
                <span className="text-[8.5px] sm:text-[10px] font-black text-[#052856] tracking-tight block uppercase mt-0.5 truncate">
                  CIT Freshmen Digital Passport
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[6px] sm:text-[7px] uppercase tracking-wider sm:tracking-widest text-[#64748B] font-bold block leading-none">
                  Passport No.
                </span>
                <span className="text-[8.5px] sm:text-[10px] font-mono font-black text-red-600 block">
                  UA-2026-PENDING
                </span>
              </div>
            </div>

            {/* Central bio grid */}
            <div className="flex gap-2.5 sm:gap-4 items-center mt-2.5 sm:mt-3 z-10 flex-1 min-w-0">
              {/* Photo Frame */}
              <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 border-[#052856]/20 bg-[#F8FAFC] shadow-inner flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Google Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-[#64748B]" />
                )}
              </div>

              {/* Bio Details */}
              <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-1.5 text-[8px] sm:text-[9px] flex-1 min-w-0">
                <div className="min-w-0">
                  <span className="text-[5.5px] sm:text-[6px] text-[#64748B] uppercase block font-bold leading-none mb-0.5">Surname / Given Names</span>
                  <span className="font-extrabold text-[#052856] uppercase truncate block">
                    {fullName}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[5.5px] sm:text-[6px] text-[#64748B] uppercase block font-bold leading-none mb-0.5">Email Address</span>
                  <span className="font-semibold text-[#334155] truncate block" title={email}>
                    {email}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[5.5px] sm:text-[6px] text-[#64748B] uppercase block font-bold leading-none mb-0.5">Student ID</span>
                  <span className="font-mono font-extrabold text-[#052856] truncate block">
                    {watchStudentId || 'UA-XXXX-XXX'}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[5.5px] sm:text-[6px] text-[#64748B] uppercase block font-bold leading-none mb-0.5">Course / Degree</span>
                  <span className="font-extrabold text-[#052856] truncate block" title={watchCourse}>
                    {watchCourse || 'Select Course'}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[5.5px] sm:text-[6px] text-[#64748B] uppercase block font-bold leading-none mb-0.5">Class Section</span>
                  <span className="font-extrabold text-[#052856] uppercase truncate block">
                    {watchSection || '1-A'}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[5.5px] sm:text-[6px] text-[#64748B] uppercase block font-bold leading-none mb-0.5">Year Level</span>
                  <span className="font-semibold text-[#334155] truncate block">
                    {watchYearLevel || '1st Year'}
                  </span>
                </div>
              </div>
            </div>

            {/* MRZ footer */}
            {generateMRZ()}

            {/* Red Pending Stamp overlay */}
            <div className="absolute bottom-9 right-3 sm:bottom-12 sm:right-6 border-2 sm:border-[3px] border-red-600 text-red-600 font-mono font-black text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 uppercase rounded transform rotate-[-12deg] pointer-events-none select-none shadow-sm z-20">
              PENDING CLEARANCE
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Input Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#E2E8F0] relative text-[#0F1D36]"
          >
            {/* Header info */}
            <div className="flex justify-between items-center mb-6 border-b border-[#E2E8F0] pb-4">
              <span className="text-xs uppercase tracking-widest text-[#0A3A78] font-black">
                Clearance Application Form
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#052856] animate-pulse" />
            </div>

            {serverError && (
              <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-start gap-2.5 font-semibold">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Student ID */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-2">
                  Student ID Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Hash className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    {...register('studentId')}
                    placeholder="e.g. 2026-10293"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-3 pl-11 pr-4 outline-none text-sm transition-all font-mono font-semibold"
                  />
                </div>
                {errors.studentId && (
                  <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-bold">
                    ⚠️ {errors.studentId.message}
                  </p>
                )}
              </div>

              {/* Course selection */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-2">
                  CIT Academic Program *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <select
                    {...register('course')}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] font-semibold rounded-xl py-3 pl-11 pr-4 outline-none text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option value="BS in Information Technology">BS in Information Technology (BSIT)</option>
                    <option value="BS in Computer Science">BS in Computer Science (BSCS)</option>
                    <option value="BS in Computer Engineering">BS in Computer Engineering (BSCpE)</option>
                    <option value="Associate in Computer Technology">Associate in Computer Technology (ACT)</option>
                  </select>
                </div>
                {errors.course && (
                  <p className="text-[11px] text-red-600 mt-1.5 font-bold">⚠️ {errors.course.message}</p>
                )}
              </div>

              {/* Row Grid: Section & Year */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">
                {/* Class Section Dropdown */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-2">
                    Class Section *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                      <Layers className="h-4.5 w-4.5" />
                    </div>
                    <select
                      {...register('section')}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] font-extrabold rounded-xl py-3 pl-10 pr-4 outline-none text-sm transition-all appearance-none cursor-pointer"
                    >
                      {SECTION_OPTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.section && (
                    <p className="text-[11px] text-red-600 mt-1.5 font-bold">⚠️ {errors.section.message}</p>
                  )}
                </div>

                {/* Year level */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-2">
                    Year Level *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <select
                      {...register('yearLevel')}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] font-semibold rounded-xl py-3 pl-10 pr-4 outline-none text-sm transition-all appearance-none cursor-pointer"
                    >
                      <option value="1st Year">1st Year (Freshmen)</option>
                    </select>
                  </div>
                  {errors.yearLevel && (
                    <p className="text-[11px] text-red-600 mt-1.5 font-bold">⚠️ {errors.yearLevel.message}</p>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={issuing}
                className="w-full flex items-center justify-center gap-2 bg-[#052856] hover:bg-[#031D40] disabled:opacity-50 text-white font-black py-3.5 px-6 rounded-2xl transition-all duration-300 mt-6 shadow-md shadow-[#052856]/20 border border-[#0A3A78] cursor-pointer uppercase text-xs tracking-wider"
              >
                {issuing ? 'Verifying Credentials...' : 'Issue Passport & Enter CIT'}
                {!issuing && <ArrowRight className="h-4.5 w-4.5 text-white" />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* SUCCESS POPUP SCREEN TRIGGER */}
      <AnimatePresence>
        {successAnimation && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
              className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center shadow-2xl relative text-[#0F1D36]"
            >
              <motion.div
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mx-auto w-20 h-20 bg-emerald-50 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-md"
              >
                <Sparkles className="h-10 w-10 text-emerald-600" />
              </motion.div>

              <h3 className="text-2xl font-black text-[#052856] tracking-tight uppercase mb-2">
                Passport Cleared!
              </h3>
              <p className="text-xs text-[#475569] font-medium leading-relaxed mb-6">
                Your credentials have been authenticated. Digital Passport is stamped and registered. Safe travels through CIT!
              </p>

              <div className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-extrabold border border-emerald-200 bg-emerald-50 py-2.5 rounded-xl">
                ✈️ BOARDING PASS ISSUED. WELCOME ABOARD!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
