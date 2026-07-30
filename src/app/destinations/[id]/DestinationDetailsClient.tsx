'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  CheckCircle,
  User,
  ShieldCheck,
  Sparkles,
  Compass,
  Check,
  Camera,
  AlertTriangle,
  RefreshCw,
  Key,
  ChevronRight,
  MapPin,
  ArrowRight,
  PartyPopper,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import confetti from 'canvas-confetti'
import { verifyQRTokenAction } from '@/app/actions/scanActions'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  student_id: string
  course: string
  section: string
  year_level: string
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
  gate_number: string
  estimated_duration: string
}

interface NextDestination {
  id: string
  gate_number: string
  title: string
}

interface Props {
  profile?: Profile | null
  destination: Destination
  isCompleted: boolean
  completionDate: string | null
  nextDestination?: NextDestination | null
}

export default function DestinationDetailsClient({
  profile,
  destination,
  isCompleted,
  completionDate,
  nextDestination,
}: Props) {
  const router = useRouter()
  const [localCompleted, setLocalCompleted] = useState(isCompleted)
  const [loadingScan, setLoadingScan] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)

  // Next gate modal — shown after successful scan
  const [showNextGateModal, setShowNextGateModal] = useState(false)

  // Manual code entry fallback
  const [manualInput, setManualInput] = useState(false)
  const [manualToken, setManualToken] = useState('')

  const html5QrCodeRef = useRef<any>(null)
  const scannerId = `dest-scanner-${destination.id}`

  const triggerConfetti = () => {
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#052856', '#0A3A78', '#10B981', '#F59E0B', '#EF4444'],
    })
    // Second burst after 600ms
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#052856', '#10B981'],
      })
    }, 600)
  }

  useEffect(() => {
    if (isCompleted) {
      triggerConfetti()
    }
  }, [isCompleted])

  // Initialize html5-qrcode dynamically inside this section
  useEffect(() => {
    let active = true

    async function initScanner() {
      if (localCompleted) return

      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (!active) return

        const html5QrCode = new Html5Qrcode(scannerId)
        html5QrCodeRef.current = html5QrCode

        const scanConfig = { fps: 15, qrbox: { width: 240, height: 240 } }

        try {
          // Force main 1x rear camera
          await html5QrCode.start(
            { facingMode: 'environment' },
            scanConfig,
            async (decodedText: string) => {
              handleQRScanned(decodedText)
            },
            () => {}
          )
          if (active) setCameraPermission(true)
        } catch (e) {
          // Fallback camera selection
          const devices = await Html5Qrcode.getCameras()
          if (devices && devices.length > 0) {
            if (active) setCameraPermission(true)
            const mainRear = devices.find((d: any) => {
              const label = d.label.toLowerCase()
              return (
                (label.includes('back') || label.includes('rear') || label.includes('environment')) &&
                !label.includes('0.5') &&
                !label.includes('wide') &&
                !label.includes('ultra')
              )
            }) || devices.find((d: any) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')) || devices[0]

            await html5QrCode.start(
              mainRear.id,
              scanConfig,
              async (decodedText: string) => {
                handleQRScanned(decodedText)
              },
              () => {}
            )
          } else {
            if (active) setCameraPermission(false)
          }
        }
      } catch (err: any) {
        console.error('Embedded camera init error:', err)
        if (active) setCameraPermission(false)
      }
    }

    initScanner()

    return () => {
      active = false
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e: any) => console.error('Failed to stop camera:', e))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination.id, localCompleted])

  const handleQRScanned = async (token: string) => {
    if (loadingScan || localCompleted) return

    setLoadingScan(true)
    setScanError(null)

    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
      } catch (e) {
        console.error(e)
      }
    }

    try {
      const result = await verifyQRTokenAction(token, destination.id)
      if (result.error) {
        setScanError(result.error)
        setLoadingScan(false)
        restartScanner()
      } else {
        setLocalCompleted(true)
        setLoadingScan(false)
        triggerConfetti()
        // Show next gate modal after brief celebration delay
        if (nextDestination) {
          setTimeout(() => setShowNextGateModal(true), 1200)
        }
      }
    } catch (err: any) {
      setScanError(err.message || 'An unexpected verification error occurred.')
      setLoadingScan(false)
      restartScanner()
    }
  }

  const restartScanner = async () => {
    setScanError(null)
    if (html5QrCodeRef.current && !html5QrCodeRef.current.isScanning) {
      try {
        const scanConfig = { fps: 15, qrbox: { width: 240, height: 240 } }
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          scanConfig,
          (text: string) => handleQRScanned(text),
          () => {}
        )
      } catch (e) {
        console.error('Failed to restart embedded camera:', e)
      }
    }
  }

  const handleExitClick = () => {
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualToken.trim()) {
      handleQRScanned(manualToken.trim())
    }
  }

  const handleGoToNextGate = () => {
    if (nextDestination) {
      router.push(`/destinations/${nextDestination.id}`)
    }
  }

  return (
    <div className={`min-h-screen bg-[#F4F6F9] text-[#0F1D36] flex flex-col ${localCompleted && nextDestination ? 'pb-28' : 'pb-12'} relative overflow-hidden`}>
      {/* Top Header Background Banner */}
      <div className="absolute top-0 left-0 right-0 h-[240px] bg-gradient-to-r from-[#052856] via-[#0A3A78] to-[#052856] text-white opacity-95 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 1000 500" className="w-full h-full object-cover">
            <circle cx="250" cy="160" r="4" fill="#60A5FA" />
            <circle cx="700" cy="320" r="4" fill="#60A5FA" />
            <path d="M250,160 Q475,100 700,320" stroke="#60A5FA" strokeWidth="2" strokeDasharray="6 6" fill="none" />
          </svg>
        </div>
      </div>

      <Navbar />

      <main className="max-w-md mx-auto px-4 py-6 flex-1 w-full relative z-10 space-y-6">

        {/* Top Exit Navigation Header */}
        <div className="flex items-center justify-between text-white">
          <button
            onClick={handleExitClick}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Scanner
          </button>
          <span className="text-[10px] font-mono font-black tracking-widest bg-white/20 px-3 py-1 rounded-full uppercase border border-white/30">
            {destination.gate_number}
          </span>
        </div>

        {/* TICKET CARD CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white rounded-3xl shadow-xl border border-[#E2E8F0] overflow-hidden"
        >
          {/* PASSENGER HEADER */}
          <div className="p-6 border-b-2 border-dashed border-[#E2E8F0] relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#052856]/20 bg-[#F8FAFC] flex items-center justify-center shrink-0 shadow-sm">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-[#052856]" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-base text-[#052856] tracking-tight uppercase">
                    {profile?.full_name || 'CIT Student'}
                  </h3>
                  <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wider block">
                    Passenger • {profile?.course ? profile.course.split(' ')[0] : 'Freshmen'} ({profile?.section || '1-A'})
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#052856]/10 border border-[#052856]/20 flex items-center justify-center text-[#052856] shadow-sm shrink-0">
                <Plane className="h-5 w-5 transform -rotate-45" />
              </div>
            </div>
          </div>

          {/* FLIGHT ROUTE CODES */}
          <div className="p-6 border-b border-[#E2E8F0] bg-gradient-to-b from-white to-[#F8FAFC]">
            <div className="flex justify-between items-center text-center">
              <div className="text-left">
                <span className="font-black text-2xl text-[#052856] tracking-tight block">
                  PAM
                </span>
                <span className="text-[9px] font-extrabold text-[#64748B] uppercase tracking-wider block">
                  Pamuklat 2026
                </span>
              </div>

              <div className="flex flex-col items-center flex-1 px-4">
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="h-[2px] bg-[#E2E8F0] flex-1 rounded-full" />
                  <motion.div
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-[#052856] text-white p-1.5 rounded-full shadow-sm"
                  >
                    <Plane className="h-3.5 w-3.5 transform rotate-90" />
                  </motion.div>
                  <div className="h-[2px] bg-[#E2E8F0] flex-1 rounded-full" />
                </div>
                <span className="text-[8px] font-mono text-[#052856] font-black uppercase tracking-widest">
                  Clearance Station
                </span>
              </div>

              <div className="text-right">
                <span className="font-black text-2xl text-[#052856] tracking-tight block">
                  G0{destination.gate_number.replace(/\D/g, '') || '1'}
                </span>
                <span className="text-[9px] font-extrabold text-[#64748B] uppercase tracking-wider block truncate max-w-[90px]">
                  {destination.title}
                </span>
              </div>
            </div>

            {/* DATE & DURATION PILL */}
            <div className="mt-5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3.5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#052856]" />
                <div>
                  <span className="text-[8.5px] font-bold text-[#64748B] uppercase block leading-none">Date</span>
                  <span className="font-extrabold text-[#052856] text-[11px] block mt-0.5">July 29, 2026</span>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-[#CBD5E1]" />

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#052856]" />
                <div>
                  <span className="text-[8.5px] font-bold text-[#64748B] uppercase block leading-none">Est Time</span>
                  <span className="font-extrabold text-[#052856] text-[11px] block mt-0.5">{destination.estimated_duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TICKET DETAILS GRID */}
          <div className="px-6 py-4 bg-white border-b border-[#E2E8F0] grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-[8px] text-[#64748B] font-sans font-bold uppercase block">Gate</span>
              <span className="font-black text-[#052856] text-xs block mt-0.5">{destination.gate_number}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#64748B] font-sans font-bold uppercase block">Student ID</span>
              <span className="font-black text-[#052856] text-xs block mt-0.5 truncate">{profile?.student_id || '2026-0000'}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#64748B] font-sans font-bold uppercase block">Flight No.</span>
              <span className="font-black text-[#0A3A78] text-xs block mt-0.5">PAM-0{destination.gate_number.replace(/\D/g, '') || '1'}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#64748B] font-sans font-bold uppercase block">Class</span>
              <span className="font-black text-[#052856] text-xs block mt-0.5">{profile?.course ? profile.course.split(' ')[0] : 'BSIT'}</span>
            </div>
          </div>

          {/* EMBEDDED LIVE BOARDING SCANNER SECTION */}
          <div className="p-6 text-center space-y-4 bg-white relative">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <span className="text-[10px] font-black text-[#052856] uppercase tracking-widest block">
                  Official Gate Clearance Scanner
                </span>
                <p className="text-xs text-[#475569] font-medium mt-0.5">
                  Point your phone camera at the booth&apos;s QR code to collect your stamp.
                </p>
              </div>

              {!localCompleted && (
                <button
                  onClick={() => setManualInput(!manualInput)}
                  className="flex items-center gap-1 text-[9px] text-[#052856] bg-[#052856]/10 border border-[#052856]/20 px-2.5 py-1 rounded-xl uppercase font-mono font-bold hover:bg-[#052856]/20"
                >
                  <Key className="h-3 w-3" /> {manualInput ? 'Camera' : 'Code'}
                </button>
              )}
            </div>

            {/* STAMP OVERLAY IF COMPLETED */}
            {localCompleted ? (
              <motion.div
                initial={{ scale: 1.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -6 }}
                transition={{ type: 'spring', damping: 12 }}
                className="my-4 border-3 border-dashed border-emerald-600 text-emerald-800 bg-emerald-50 rounded-2xl p-6 flex flex-col items-center justify-center font-mono text-center uppercase tracking-widest shadow-md"
              >
                <ShieldCheck className="h-10 w-10 text-emerald-600 mb-2" />
                <div className="text-xs font-black text-emerald-900">UA IMMIGRATION CLEARED</div>
                <div className="border-y border-dashed border-emerald-600/40 py-1.5 my-2 w-full font-black text-sm flex items-center justify-center gap-1 text-emerald-700">
                  PASSPORT STAMPED <Check className="h-4 w-4 text-emerald-700" />
                </div>
                <div className="text-[9px] font-sans font-extrabold text-[#475569]">
                  {completionDate ? new Date(completionDate).toLocaleDateString() : 'Verified Gate Entry'}
                </div>

                {/* Next gate inline prompt if modal was dismissed */}
                {nextDestination && !showNextGateModal && (
                  <button
                    onClick={handleGoToNextGate}
                    className="mt-4 flex items-center gap-2 bg-[#052856] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl cursor-pointer hover:bg-[#031D40] transition-colors"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Go to {nextDestination.gate_number}
                  </button>
                )}
              </motion.div>
            ) : (
              /* LIVE CAMERA SCANNER VIEWPORT */
              <div className="relative rounded-2xl overflow-hidden aspect-square border border-[#CBD5E1] bg-[#F8FAFC] shadow-inner flex items-center justify-center p-3">
                {manualInput ? (
                  <form onSubmit={handleManualSubmit} className="w-full space-y-3 text-center p-2 z-10">
                    <Key className="h-8 w-8 text-[#052856] mx-auto opacity-80" />
                    <div className="text-xs font-black text-[#052856] uppercase">Manual Token Authenticator</div>
                    <input
                      type="text"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Enter gate token..."
                      className="w-full bg-white border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] rounded-xl py-3 px-3 outline-none text-xs text-center font-mono font-bold"
                    />
                    <button
                      type="submit"
                      disabled={loadingScan || !manualToken.trim()}
                      className="w-full bg-[#052856] hover:bg-[#031D40] text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl shadow-md cursor-pointer"
                    >
                      Authenticate Stamp
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="absolute inset-6 border border-[#052856]/20 pointer-events-none rounded-xl" />
                    <div className="laser-line animate-scan" />

                    <div id={scannerId} className="w-full h-full rounded-xl overflow-hidden" />

                    {cameraPermission === false && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center text-center p-4 space-y-2 z-20">
                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                        <div className="text-xs font-bold text-[#052856] uppercase">Camera Access Required</div>
                        <p className="text-[10px] text-[#475569] font-medium leading-relaxed">
                          Please allow camera access in browser permissions or use manual code entry.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {loadingScan && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-30">
                    <RefreshCw className="h-8 w-8 text-[#052856] animate-spin" />
                    <div className="text-[10px] font-mono text-[#052856] font-black uppercase">Verifying Gate Token...</div>
                  </div>
                )}
              </div>
            )}

            {scanError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 flex items-start gap-2 text-left font-semibold">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block">Verification Declined</strong>
                  {scanError}
                </div>
              </div>
            )}
          </div>

          {/* TICKET FOOTER INSTRUCTIONS */}
          <div className="bg-[#F8FAFC] p-5 border-t border-[#E2E8F0] space-y-2.5">
            <h4 className="text-xs font-black text-[#052856] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-[#052856]" /> Clearance Instructions
            </h4>
            <p className="text-xs text-[#334155] font-semibold leading-relaxed">
              {destination.instructions}
            </p>
          </div>

        </motion.div>

      </main>

      {/* ════════════════════════════════════════════════════
          NEXT GATE MODAL — pops up after successful scan
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNextGateModal && nextDestination && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowNextGateModal(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="fixed inset-x-4 bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] z-50 bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden"
            >
              {/* Green success top bar */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-black text-sm uppercase tracking-wider">Stamp Collected! ✓</div>
                  <div className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                    {destination.gate_number} cleared successfully
                  </div>
                </div>
              </div>

              {/* Next gate info */}
              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-[#475569] uppercase tracking-widest mb-1">Next Stop</p>
                  <div className="flex items-center gap-3 bg-[#F4F6F9] border border-[#E2E8F0] rounded-2xl p-4">
                    <div className="bg-[#052856] text-white p-2.5 rounded-xl shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono font-black text-[#0A3A78] uppercase tracking-widest">
                        {nextDestination.gate_number}
                      </div>
                      <div className="font-black text-sm text-[#052856] truncate">
                        {nextDestination.title}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <ChevronRight className="h-4 w-4 text-[#052856]" />
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNextGateModal(false)}
                    className="flex-1 py-3.5 rounded-2xl border border-[#E2E8F0] text-[#475569] text-xs font-extrabold uppercase tracking-wider hover:bg-[#F4F6F9] transition-colors cursor-pointer min-h-[44px]"
                  >
                    Stay Here
                  </button>
                  <button
                    onClick={handleGoToNextGate}
                    className="flex-2 flex-grow-[2] py-3.5 px-5 rounded-2xl bg-[#052856] hover:bg-[#031D40] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#052856]/20 cursor-pointer transition-colors min-h-[44px]"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Go to {nextDestination.gate_number}
                  </button>
                </div>

                <p className="text-center text-[9px] font-mono text-[#94A3B8] uppercase tracking-wider">
                  Tap outside to dismiss
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sticky/Fixed bottom panel for next gate navigation if completed */}
      {localCompleted && nextDestination && (
        <motion.div 
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E2E8F0] p-4 flex items-center justify-between z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.06)]"
        >
          <div className="flex-1 min-w-0 pr-4">
            <span className="text-[9px] font-mono font-black text-[#0A3A78] uppercase tracking-widest block leading-none">
              Immigration Clear
            </span>
            <span className="font-black text-xs text-[#052856] block truncate mt-1.5">
              Next Stop: {nextDestination.gate_number} • {nextDestination.title}
            </span>
          </div>
          <button
            onClick={handleGoToNextGate}
            className="bg-[#052856] hover:bg-[#031D40] active:bg-[#020F24] text-white text-xs font-black uppercase tracking-wider py-3 px-5 rounded-2xl shadow-lg shadow-[#052856]/15 flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[46px] transition-all"
          >
            Go to Next Gate
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  )
}

