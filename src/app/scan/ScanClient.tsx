'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, AlertTriangle, ArrowLeft, RefreshCw, Key, ShieldCheck, User, Check } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { verifyQRTokenAction, verifyStudentBoardingPassAction } from '@/app/actions/scanActions'
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

export default function ScanClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const destinationId = searchParams.get('destinationId') || undefined

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<any>(null)
  const [scannedStudent, setScannedStudent] = useState<any>(null)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [targetDestination, setTargetDestination] = useState<any>(null)

  // Manual key overlay toggle
  const [manualInput, setManualInput] = useState(false)
  const [manualToken, setManualToken] = useState('')

  const html5QrCodeRef = useRef<any>(null)
  const scannerId = 'qr-reader'

  // Fetch target destination details if destinationId is passed
  useEffect(() => {
    if (destinationId) {
      const supabase = createClient()
      supabase
        .from('destinations')
        .select('title, gate_number, destination_color')
        .eq('id', destinationId)
        .single()
        .then(({ data }) => {
          if (data) setTargetDestination(data)
        })
    }
  }, [destinationId])

  // Initialize html5-qrcode dynamically on client mount
  useEffect(() => {
    let active = true

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (!active) return

        const html5QrCode = new Html5Qrcode(scannerId)
        html5QrCodeRef.current = html5QrCode

        // Check list of cameras
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setCameraPermission(true)

          const rearCamera = devices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          )
          const cameraId = rearCamera ? rearCamera.id : devices[0].id

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            async (decodedText) => {
              handleQRScanned(decodedText)
            },
            () => { }
          )
        } else {
          setCameraPermission(false)
        }
      } catch (err: any) {
        console.error('Camera init error:', err)
        setCameraPermission(false)
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
  }, [])

  const handleQRScanned = async (token: string) => {
    if (loading || successInfo) return

    setLoading(true)
    setErrorMsg(null)

    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
      } catch (e) {
        console.error(e)
      }
    }

    try {
      let result: any
      // Detect if scanning student's boarding pass QR code or gate token
      if (token.startsWith('PAMUKLAT_PASS:') || token.startsWith('{')) {
        result = await verifyStudentBoardingPassAction(token, destinationId)
      } else {
        result = await verifyQRTokenAction(token, destinationId)
      }

      if (result.error) {
        setErrorMsg(result.error)
        setLoading(false)
        restartScanner()
      } else {
        setSuccessInfo(result.destination)
        if (result.student) setScannedStudent(result.student)
        triggerConfetti()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
      setLoading(false)
      restartScanner()
    }
  }

  const restartScanner = async () => {
    setErrorMsg(null)
    if (html5QrCodeRef.current && !html5QrCodeRef.current.isScanning) {
      try {
        const devices = await html5QrCodeRef.current.constructor.getCameras()
        if (devices && devices.length > 0) {
          const rearCamera = devices.find((device: any) =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear')
          )
          const cameraId = rearCamera ? rearCamera.id : devices[0].id

          await html5QrCodeRef.current.start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (text: string) => handleQRScanned(text),
            () => { }
          )
        }
      } catch (e) {
        console.error('Failed to restart camera:', e)
      }
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualToken.trim()) {
      handleQRScanned(manualToken.trim())
    }
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0F1D36] flex flex-col pb-12 relative overflow-hidden">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-center relative z-10">

        {/* Navigation title */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#5A6B85] hover:text-[#0F1D36] transition-colors uppercase tracking-widest font-mono cursor-pointer font-bold">
            <ArrowLeft className="h-4 w-4" /> Exit Scanner
          </Link>

          <button
            onClick={() => setManualInput(!manualInput)}
            className="flex items-center gap-1 text-[10px] text-[#1E4FCC] bg-[#1E4FCC]/10 border border-[#1E4FCC]/20 px-3 py-1 rounded-xl uppercase font-mono tracking-widest hover:bg-[#1E4FCC]/20 cursor-pointer font-bold"
          >
            <Key className="h-3.5 w-3.5" /> {manualInput ? 'Use Camera' : 'Enter Code'}
          </button>
        </div>

        {/* Target Destination banner if scoped */}
        {targetDestination && (
          <div className="mb-5 bg-white border border-[#D4DCE8] rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#1E4FCC] font-extrabold block leading-none">
                Targeting Clearance Stop
              </span>
              <span className="text-sm font-black text-[#0F1D36] mt-1 block">
                {targetDestination.title}
              </span>
            </div>
            <span className="font-mono text-xs font-extrabold text-[#1E4FCC] bg-[#EDF1F7] border border-[#D4DCE8] px-2.5 py-1 rounded-lg uppercase">
              {targetDestination.gate_number}
            </span>
          </div>
        )}

        {/* SCANNER CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden aspect-square border border-[#D4DCE8] bg-white shadow-xl flex items-center justify-center p-4">

          {manualInput ? (
            /* MANUAL TOKEN KEY ENTER DIALOG */
            <form onSubmit={handleManualSubmit} className="w-full space-y-4 text-center p-4 z-10 font-sans">
              <Key className="h-10 w-10 text-[#1E4FCC] mx-auto opacity-80 mb-2" />
              <div>
                <h4 className="text-sm font-black text-[#0F1D36] uppercase tracking-wider">Manual Code Authenticator</h4>
                <p className="text-[10px] text-[#5A6B85] mt-1 max-w-xs mx-auto leading-relaxed">
                  Enter the student ID code or gate token string below to issue stamp clearance manually.
                </p>
              </div>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste token or Student ID here..."
                className="w-full bg-[#F5F7FB] border border-[#D4DCE8] focus:border-[#1E4FCC] focus:ring-1 focus:ring-[#1E4FCC] text-[#0F1D36] rounded-xl py-3.5 px-4 outline-none text-xs text-center transition-all font-mono font-bold"
              />
              <button
                type="submit"
                disabled={loading || !manualToken.trim()}
                className="w-full flex items-center justify-center gap-1.5 bg-[#1E4FCC] hover:bg-[#153FA8] disabled:opacity-50 text-white text-[10px] font-extrabold uppercase tracking-wider py-3.5 rounded-xl cursor-pointer shadow-md shadow-[#1E4FCC]/20"
              >
                Authenticate Clearance
              </button>
            </form>
          ) : (
            /* CAMERA VIEWPORT */
            <>
              {/* Target guidelines */}
              <div className="absolute inset-8 border border-[#1E4FCC]/20 pointer-events-none rounded-2xl" />
              <div className="absolute top-8 left-8 w-5 h-5 border-t-2 border-l-2 border-[#1E4FCC]" />
              <div className="absolute top-8 right-8 w-5 h-5 border-t-2 border-r-2 border-[#1E4FCC]" />
              <div className="absolute bottom-8 left-8 w-5 h-5 border-b-2 border-l-2 border-[#1E4FCC]" />
              <div className="absolute bottom-8 right-8 w-5 h-5 border-b-2 border-r-2 border-[#1E4FCC]" />

              {/* Laser scanner lines */}
              <div className="laser-line animate-scan" />

              <div id={scannerId} className="w-full h-full rounded-2xl overflow-hidden scale-x-[-1]" />

              {cameraPermission === false && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center text-center p-6 space-y-3 z-20">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                  <div className="text-sm font-bold text-[#0F1D36] uppercase tracking-wider">Camera Request Denied</div>
                  <p className="text-[10px] text-[#5A6B85] max-w-xs mx-auto leading-relaxed">
                    Camera access is required to scan boarding codes. Please check site permissions in your browser or use manual code entry.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Loading spinner block */}
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
              <RefreshCw className="h-8 w-8 text-[#1E4FCC] animate-spin" />
              <div className="text-[10px] font-mono text-[#5A6B85] uppercase tracking-widest font-bold">Verifying Student Passport...</div>
            </div>
          )}
        </div>

        {/* Error warning bar */}
        {errorMsg && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-800 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Verification Refused</span>
              {errorMsg}
            </div>
          </div>
        )}

      </main>

      {/* STAMPING VERIFICATION SUCCESS POPUP WITH STUDENT PROFILE */}
      <AnimatePresence>
        {successInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F1D36]/70 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
              className="max-w-md w-full bg-white border border-[#D4DCE8] rounded-3xl p-8 text-center shadow-2xl relative"
            >
              <motion.div
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm"
              >
                <ShieldCheck className="h-9 w-9 text-emerald-600" />
              </motion.div>

              {/* Student Photo & Identity Details if available */}
              {scannedStudent && (
                <div className="bg-[#EDF1F7] border border-[#D4DCE8] p-3.5 rounded-2xl mb-4 flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#1E4FCC]/30 bg-white shrink-0 flex items-center justify-center">
                    {scannedStudent.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={scannedStudent.avatar_url} alt={scannedStudent.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-[#1E4FCC]" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-[#1E4FCC] font-mono font-bold uppercase block leading-none">
                      Student Identified
                    </span>
                    <h4 className="text-sm font-black text-[#0F1D36] uppercase truncate mt-0.5">
                      {scannedStudent.full_name}
                    </h4>
                    <span className="text-[10px] text-[#5A6B85] font-semibold block">
                      ID: {scannedStudent.student_id} • {scannedStudent.course}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 mb-4">
                <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1 font-extrabold">
                  <Check className="h-3 w-3 text-emerald-700" /> Clearance Approved
                </span>
                <h3 className="text-xl font-black text-[#0F1D36] tracking-tight uppercase">
                  Passport Stamped
                </h3>
                <p className="text-xs text-[#5A6B85] leading-relaxed max-w-xs mx-auto">
                  Passport clearance for <strong>{successInfo.title.toUpperCase()}</strong> has been recorded successfully.
                </p>
              </div>

              {/* Ink Stamping animation */}
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
                className="mx-auto my-4 border-3 border-dashed border-[#1E4FCC] text-[#1E4FCC] bg-[#1E4FCC]/5 text-[10px] font-black tracking-widest py-3 px-6 uppercase rounded-xl transform rotate-[-8deg] pointer-events-none select-none max-w-[220px]"
                style={{
                  color: successInfo.destination_color || '#1E4FCC',
                  borderColor: `${successInfo.destination_color || '#1E4FCC'}a0`,
                }}
              >
                <div className="text-[7.5px] leading-none mb-0.5">UA IMMIGRATION</div>
                <div className="border-y border-dashed py-0.5 my-0.5 w-full text-[9px] tracking-wider">
                  {successInfo.gate_number} CLEARED
                </div>
                <div className="text-[6.5px] leading-none font-bold text-[#5A6B85] font-sans mt-0.5">STAMP VERIFIED</div>
              </motion.div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setSuccessInfo(null)
                    setScannedStudent(null)
                    restartScanner()
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#1E4FCC] hover:bg-[#153FA8] text-white text-[10px] font-extrabold uppercase tracking-wider py-3.5 rounded-xl cursor-pointer shadow-md shadow-[#1E4FCC]/20"
                >
                  Scan Next Passenger
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
