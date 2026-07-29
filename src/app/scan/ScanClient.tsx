'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, AlertTriangle, ArrowLeft, RefreshCw, Key, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { verifyQRTokenAction } from '@/app/actions/scanActions'
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

export default function ScanClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const destinationId = searchParams.get('destinationId') || undefined

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<any>(null)
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
            () => {}
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
      const result = await verifyQRTokenAction(token, destinationId)
      if (result.error) {
        setErrorMsg(result.error)
        setLoading(false)
        restartScanner()
      } else {
        setSuccessInfo(result.destination)
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
            () => {}
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
    <div className="min-h-screen bg-[#08111F] text-slate-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-center">
        
        {/* Navigation title */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-mono cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Exit Scanner
          </Link>
          
          <button
            onClick={() => setManualInput(!manualInput)}
            className="flex items-center gap-1 text-[10px] text-[#60A5FA] bg-[#2563EB]/10 border border-[#60A5FA]/15 px-2.5 py-1 rounded-xl uppercase font-mono tracking-widest hover:bg-[#2563EB]/25 cursor-pointer"
          >
            <Key className="h-3.5 w-3.5" /> {manualInput ? 'Use Camera' : 'Enter Code'}
          </button>
        </div>

        {/* Target Destination banner if scoped */}
        {targetDestination && (
          <div className="mb-5 bg-[#2563EB]/10 border border-[#60A5FA]/25 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#60A5FA] font-bold block leading-none">
                Targeting Clearance Gate
              </span>
              <span className="text-sm font-extrabold text-white mt-1 block">
                {targetDestination.title}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg uppercase">
              {targetDestination.gate_number}
            </span>
          </div>
        )}

        {/* SCANNER CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden aspect-square border border-slate-800 bg-[#040912]/90 shadow-2xl flex items-center justify-center p-4">
          
          {manualInput ? (
            /* MANUAL TOKEN KEY ENTER DIALOG */
            <form onSubmit={handleManualSubmit} className="w-full space-y-4 text-center p-4 z-10 font-sans">
              <Key className="h-10 w-10 text-[#60A5FA] mx-auto opacity-70 mb-2" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Manual Gate Override</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Representing officer: Enter the secure cryptographically random token string below to stamp passport manually.
                </p>
              </div>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste token code here..."
                className="w-full bg-[#08111F] border border-slate-800 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-xs text-center transition-all font-mono"
              />
              <button
                type="submit"
                disabled={loading || !manualToken.trim()}
                className="w-full flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider py-3.5 rounded-xl cursor-pointer shadow-lg shadow-[#2563EB]/25"
              >
                Authenticate Token
              </button>
            </form>
          ) : (
            /* CAMERA VIEWPORT */
            <>
              {/* Target guidelines */}
              <div className="absolute inset-8 border border-white/5 pointer-events-none rounded-2xl" />
              <div className="absolute top-8 left-8 w-5 h-5 border-t-2 border-l-2 border-[#60A5FA]" />
              <div className="absolute top-8 right-8 w-5 h-5 border-t-2 border-r-2 border-[#60A5FA]" />
              <div className="absolute bottom-8 left-8 w-5 h-5 border-b-2 border-l-2 border-[#60A5FA]" />
              <div className="absolute bottom-8 right-8 w-5 h-5 border-b-2 border-r-2 border-[#60A5FA]" />
              
              {/* Laser scanner lines */}
              <div className="laser-line animate-scan" />

              <div id={scannerId} className="w-full h-full rounded-2xl overflow-hidden scale-x-[-1]" />

              {cameraPermission === false && (
                <div className="absolute inset-0 bg-[#040912]/95 flex flex-col items-center justify-center text-center p-6 space-y-3 z-20">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                  <div className="text-sm font-bold text-white uppercase tracking-wider">Camera Request Denied</div>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Camera access is required to scan gate codes. Please check site permissions in your browser or use the manual code entry option above.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Loading spinner block */}
          {loading && (
            <div className="absolute inset-0 bg-[#040912]/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
              <RefreshCw className="h-8 w-8 text-[#60A5FA] animate-spin" />
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Verifying Clearance...</div>
            </div>
          )}
        </div>

        {/* Error warning bar */}
        {errorMsg && (
          <div className="mt-5 p-4 bg-red-950/20 border border-red-500/15 rounded-2xl text-[11px] text-red-300 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Verification Refused</span>
              {errorMsg}
            </div>
          </div>
        )}

      </main>

      {/* STAMPING VERIFICATION SUCCESS POPUP */}
      <AnimatePresence>
        {successInfo && (
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
              className="max-w-md w-full bg-[#08111F] border border-[#2563EB]/25 rounded-3xl p-8 text-center shadow-2xl relative animate-pulse-slow"
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <motion.div
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25"
              >
                <ShieldCheck className="h-9 w-9 text-emerald-400" />
              </motion.div>

              <div className="space-y-1.5 mb-6">
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block">
                  ✔ Clearance Approved
                </span>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                  Identity Verified
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  You have successfully completed boarding for <strong>{successInfo.title.toUpperCase()}</strong>. Passport stamp is issued!
                </p>
              </div>

              {/* Ink Stamping animation */}
              <motion.div 
                initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                className="mx-auto my-6 border-3 border-dashed border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5 text-[10px] font-black tracking-widest py-3 px-6 uppercase rounded-xl transform rotate-[-8deg] pointer-events-none select-none max-w-[200px]"
                style={{
                  color: successInfo.destination_color,
                  borderColor: `${successInfo.destination_color}a0`,
                  backgroundColor: `${successInfo.destination_color}0a`,
                  textShadow: `0 0 4px ${successInfo.destination_color}20`
                }}
              >
                <div className="text-[7.5px] leading-none mb-0.5">UA IMMIGRATION</div>
                <div className="border-y border-dashed py-0.5 my-0.5 w-full text-[9px] tracking-wider" style={{ borderColor: `${successInfo.destination_color}35` }}>
                  {successInfo.gate_number}
                </div>
                <div className="text-[6.5px] leading-none font-bold text-slate-500 font-sans mt-0.5">PASSPORT UPDATED</div>
              </motion.div>

              <div className="flex gap-4 mt-6">
                <Link href="/dashboard" className="w-full">
                  <div className="w-full flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-extrabold uppercase tracking-wider py-3.5 rounded-xl cursor-pointer shadow-lg shadow-[#2563EB]/25 border border-[#60A5FA]/25">
                    Terminal Dashboard
                  </div>
                </Link>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
