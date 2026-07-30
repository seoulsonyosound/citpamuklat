'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, User, ShieldCheck, ArrowRight, ArrowLeft, BookOpen, Star, HelpCircle, Bookmark, Download, FileText, RefreshCw } from 'lucide-react'
import Navbar from '@/components/Navbar'

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
  gate_number: string
}

interface Completion {
  destination_id: string
  completion_date: string
}

interface Props {
  profile: Profile
  destinations: Destination[]
  completions: Completion[]
}

export default function PassportClient({ profile, destinations, completions }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const passportRef = useRef<HTMLDivElement>(null)
  const completedIds = completions.map((c) => c.destination_id)

  const handleDownloadPassport = async (format: 'png' | 'pdf' = 'png') => {
    if (!passportRef.current) return
    setDownloading(true)

    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(passportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#F5F7FB',
      })

      const cleanStudentId = profile.student_id ? profile.student_id.replace(/[^a-z0-9]/gi, '_') : 'passport'
      const filename = `CIT_Passport_${profile.full_name.replace(/\s+/g, '_')}_${cleanStudentId}`

      if (format === 'png') {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `${filename}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const jsPDF = (await import('jspdf')).default
        const img = new Image()
        img.src = dataUrl
        await new Promise((res) => {
          img.onload = res
        })

        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height],
        })
        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height)
        pdf.save(`${filename}.pdf`)
      }
    } catch (err: any) {
      console.error('Failed to generate downloadable passport:', err)
      alert(`Could not generate passport download: ${err?.message || 'Unexpected error'}`)
    } finally {
      setDownloading(false)
    }
  }

  const generateMRZ = () => {
    const formattedName = profile.full_name.replace(/\s+/g, '<').toUpperCase()
    const courseCode = profile.course.split(' ').map(w => w[0]).join('').toUpperCase()
    const cleanId = (profile.student_id || '0000000').padEnd(10, '<').replace(/\s+/g, '<')

    return (
      <div className="font-mono text-[9.5px] text-[#2D1F15] font-extrabold leading-none tracking-widest uppercase border-t border-[#4A3728]/25 pt-3.5 mt-3 select-none">
        <div>P&lt;PHL{formattedName}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
        <div>{cleanId}PHL{courseCode}&lt;{profile.section}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </div>
    )
  }

  // Get completion date for a specific destination
  const getStampCompletionDate = (destId: string) => {
    const comp = completions.find((c) => c.destination_id === destId)
    if (!comp) return ''
    return new Date(comp.completion_date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0F1D36] flex flex-col pb-12 relative overflow-hidden">
      {/* Background Floating Travel Shapes */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-[#1E4FCC]/5 rounded-full blur-3xl pointer-events-none bg-shape-float" />
      <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none bg-shape-float-delay" />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex-1 w-full flex flex-col items-center justify-center space-y-8 relative z-10">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#1E4FCC] font-black flex items-center justify-center gap-1.5 mb-1">
              <Plane className="h-4 w-4 text-[#1E4FCC]" /> Electronic Passport Booklet
            </span>
            <h2 className="text-3xl font-black text-[#0F1D36] tracking-tight">
              MY DIGITAL CAMPUS PASSPORT
            </h2>
            <p className="text-xs text-[#2D3748] font-medium mt-2 max-w-sm mx-auto leading-relaxed">
              {isOpen
                ? 'Your passport is open below. Use the download buttons to save a high-resolution copy of your clearance stamps.'
                : 'Click the passport cover below to flip open your booklet and view your collected Pamuklat clearance stamps.'}
            </p>
          </div>

          {/* DOWNLOAD PASSPORT CONTROL BUTTONS (Shown when passport is open) */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <button
                onClick={() => handleDownloadPassport('png')}
                disabled={downloading}
                className="flex items-center gap-2 bg-[#052856] hover:bg-[#031D40] active:bg-[#020F24] text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all shadow-lg shadow-[#052856]/15 cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4 text-white" />
                {downloading ? 'Exporting Passport...' : 'Download Passport (PNG Image)'}
              </button>

              <button
                onClick={() => handleDownloadPassport('pdf')}
                disabled={downloading}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#052856] font-extrabold text-xs uppercase tracking-wider px-4 py-3 rounded-2xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FileText className="h-4 w-4 text-[#052856]" />
                Download PDF
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* PASSPORT BOOKLET FRAME CONTAINER */}
        <div className="relative w-full max-w-[700px] flex items-center justify-center min-h-[460px]">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* PASSPORT COVER PAGE */
              <motion.div
                key="passport-cover"
                initial={{ rotateY: -90, opacity: 0, scale: 0.95 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                exit={{ rotateY: 90, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-[340px] aspect-[1/1.42] passport-cover-bg rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-2xl relative border-2 border-slate-700/30 cursor-pointer select-none group transform hover:scale-[1.02] transition-transform duration-300"
                onClick={() => setIsOpen(true)}
              >
                {/* Embossed gold/silver outer shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-3xl pointer-events-none" />

                <div className="space-y-2">
                  <span className="text-[8.5px] tracking-[0.35em] text-slate-100 font-black uppercase block leading-none">
                    University of the Assumption
                  </span>
                  <span className="text-[7.5px] tracking-[0.2em] text-slate-200 font-extrabold uppercase block">
                    Pampanga, Philippines
                  </span>
                </div>

                <div className="my-auto space-y-8 flex flex-col items-center">
                  {/* Metallic stamped crest circle */}
                  <div className="w-24 h-24 rounded-full border-4 border-[#C2C9D6]/40 bg-gradient-to-br from-[#E2E8F0]/10 to-[#94A3B8]/20 flex items-center justify-center relative shadow-lg bg-shape-spin">
                    <Plane className="h-10 w-10 text-[#C2C9D6] transform -rotate-45" />
                    <div className="absolute inset-2 rounded-full border border-dashed border-[#C2C9D6]/30" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black tracking-[0.1em] text-white uppercase">
                      DIGITAL PASSPORT
                    </h3>
                    <span className="text-[9.5px] tracking-[0.25em] text-[#60A5FA] font-black uppercase block">
                      CIT Freshmen Onboarding
                    </span>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  {/* Biometric passport symbol */}
                  <div className="w-9 h-6 border border-[#C2C9D6]/40 rounded-md mx-auto flex flex-col justify-between p-0.5 opacity-60">
                    <div className="h-0.5 bg-[#C2C9D6]/40 w-full" />
                    <div className="h-2 w-2 rounded-full bg-[#C2C9D6]/40 mx-auto" />
                    <div className="h-0.5 bg-[#C2C9D6]/40 w-full" />
                  </div>

                  <button className="flex items-center gap-1.5 mx-auto bg-white/15 hover:bg-white/25 text-white font-extrabold text-[9px] uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all border border-white/20 cursor-pointer shadow-md group-hover:translate-x-1">
                    Open Passport <ArrowRight className="h-3 w-3 text-white" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* PASSPORT INSIDE PAGES SPREAD (TWO COLUMNS) */
              <motion.div
                ref={passportRef}
                key="passport-inner"
                initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.9, opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.6 }}
                className="w-full flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden shadow-2xl relative border-2 border-slate-400/40"
              >
                {/* Central booklet shadow spine */}
                <div className="absolute top-0 bottom-0 left-1/2 w-8 bg-gradient-to-r from-black/20 via-transparent to-black/20 transform -translate-x-1/2 pointer-events-none hidden md:block z-20" />

                {/* LEFT PAGE: Biological Identity Data Card */}
                <div className="w-full md:w-1/2 p-6 md:p-8 passport-inner-bg text-[#2D1F15] flex flex-col justify-between relative min-h-[380px] border-b md:border-b-0 md:border-r border-slate-300">
                  {/* Holographic school seal watermark */}
                  <div className="absolute right-6 top-8 w-24 h-24 rounded-full border border-indigo-900/5 bg-indigo-950/[0.02] flex items-center justify-center pointer-events-none">
                    <span className="text-[7px] uppercase font-black text-indigo-950/20 tracking-widest text-center">OFFICIAL SEAL</span>
                  </div>

                  <div className="flex justify-between items-start border-b border-[#4A3728]/25 pb-3">
                    <div>
                      <span className="text-[7.5px] uppercase tracking-[0.2em] text-[#3E2723] font-black block leading-none">
                        University of the Assumption
                      </span>
                      <span className="text-[10px] font-black text-indigo-950 tracking-tight block uppercase mt-1">
                        CIT Freshmen Digital Passport
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[7.5px] uppercase tracking-[0.2em] text-[#3E2723] font-black block leading-none">
                        Passport No.
                      </span>
                      <span className="text-[10px] font-mono font-black text-indigo-950">
                        UA-2026-{profile.student_id ? profile.student_id.slice(-4) : '2026'}
                      </span>
                    </div>
                  </div>

                  {/* Biological Photo & Text grids */}
                  <div className="flex gap-4 items-center mt-4 flex-1">
                    {/* Passport Photo */}
                    <div className="relative w-20 h-26 rounded-lg overflow-hidden border-2 border-indigo-950/30 bg-slate-200 shadow-inner flex items-center justify-center shrink-0">
                      {profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-slate-500" />
                      )}
                      {/* Biometric overlay */}
                      <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-emerald-500" />
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-emerald-500" />
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-emerald-500" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-emerald-500" />
                    </div>

                    {/* Passport detail labels */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[9px] flex-1">
                      <div>
                        <span className="text-[7px] text-[#3E2723] uppercase block font-black leading-none">Surname / Given Name</span>
                        <span className="font-extrabold text-indigo-950 uppercase truncate block max-w-[130px]">
                          {profile.full_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-[#3E2723] uppercase block font-black leading-none">Student ID</span>
                        <span className="font-mono font-black text-indigo-950">
                          {profile.student_id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-[#3E2723] uppercase block font-black leading-none">Academic Program</span>
                        <span className="font-extrabold text-indigo-950 truncate block max-w-[130px]" title={profile.course}>
                          {profile.course}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-[#3E2723] uppercase block font-black leading-none">Class Section</span>
                        <span className="font-extrabold text-indigo-950 uppercase">
                          {profile.section}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-[#3E2723] uppercase block font-black leading-none">Registration Date</span>
                        <span className="font-extrabold text-[#2D1F15]">
                          {new Date(profile.registration_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-[#3E2723] uppercase block font-black leading-none">Year Level</span>
                        <span className="font-extrabold text-[#2D1F15]">
                          {profile.year_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Machine Readable Zone */}
                  {generateMRZ()}
                </div>

                {/* RIGHT PAGE: Visa Immigration Stamps Book */}
                <div className="w-full md:w-1/2 p-6 md:p-8 passport-inner-bg text-[#4A3728] flex flex-col justify-between relative min-h-[380px]">

                  {/* Visas Title */}
                  <div className="flex justify-between items-center border-b border-[#4A3728]/15 pb-3">
                    <span className="text-[10px] font-black text-indigo-950 tracking-wider uppercase flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5 text-[#2B7574]" /> Pamuklat Clearance Stamps
                    </span>
                    <span className="text-[7px] uppercase tracking-widest text-[#78614E] font-bold">
                      Page 03
                    </span>
                  </div>

                  {/* Visa Stamps Grid */}
                  <div className="grid grid-cols-2 gap-3.5 my-auto py-4">
                    {destinations.map((dest, index) => {
                      const isStamped = completedIds.includes(dest.id)
                      const stampDate = getStampCompletionDate(dest.id)

                      const rotations = ['-rotate-6', 'rotate-6', '-rotate-12', 'rotate-12', 'rotate-3', '-rotate-3']
                      const rotationClass = rotations[index % rotations.length]

                      return (
                        <div
                          key={dest.id}
                          className="relative flex flex-col items-center justify-center border border-[#4A3728]/10 bg-slate-350/[0.02] rounded-xl aspect-[1.25/1] p-2 relative shadow-inner overflow-hidden select-none"
                        >
                          <span className="absolute top-1 left-1.5 text-[6.5px] text-slate-400 font-mono font-bold">
                            GATE {dest.gate_number.replace('GATE', '').trim()}
                          </span>

                          {isStamped ? (
                            /* Render the Ink Stamp */
                            <motion.div
                              initial={{ scale: 2, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed font-mono uppercase text-center w-full h-full text-[9px] font-black tracking-wide ${rotationClass}`}
                              style={{
                                color: dest.destination_color,
                                borderColor: `${dest.destination_color}90`,
                                backgroundColor: `${dest.destination_color}08`,
                              }}
                            >
                              <div className="text-[7px] leading-none mb-0.5 tracking-widest">UA CIT</div>
                              <div className="truncate w-full max-w-[80px] font-extrabold leading-none my-0.5">{dest.title}</div>
                              <div className="text-[7.5px] border-y border-dashed py-0.5 my-0.5 w-full tracking-wider" style={{ borderColor: `${dest.destination_color}30` }}>
                                ENTRY GRANTED
                              </div>
                              <div className="text-[6.5px] leading-none text-slate-500 font-bold font-sans mt-0.5">{stampDate}</div>
                            </motion.div>
                          ) : (
                            /* Stamped slot placeholder */
                            <div className="flex flex-col items-center gap-1.5 opacity-30">
                              <Star className="h-4 w-4 text-slate-400" />
                              <span className="text-[7px] uppercase font-bold tracking-widest text-slate-500">
                                Reserved
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {destinations.length === 0 && (
                      <div className="col-span-2 text-center text-slate-500 text-xs py-8 font-bold uppercase tracking-wider">
                        No Visa Slots Available
                      </div>
                    )}
                  </div>

                  {/* Actions buttons inside */}
                  <div className="flex justify-between items-center border-t border-[#4A3728]/15 pt-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1 bg-[#4A3728]/10 hover:bg-[#4A3728]/20 text-[#4A3728] font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors border border-transparent cursor-pointer"
                    >
                      <ArrowLeft className="h-3 w-3" /> Close Cover
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPassport('png')}
                        disabled={downloading}
                        className="flex items-center gap-1 bg-[#052856] hover:bg-[#031D40] text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Download className="h-3 w-3 text-white" />
                        {downloading ? 'Exporting...' : 'Download Passport'}
                      </button>
                      <div className="hidden sm:flex items-center gap-1 text-[8px] text-[#78614E] font-bold uppercase">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-900" /> Biometric Secured
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  )
}
