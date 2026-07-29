'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  CheckCircle,
  User,
  ShieldCheck,
  Download,
  Sparkles,
  MapPin,
  Compass,
  QrCode,
  Check
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import confetti from 'canvas-confetti'

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

interface Props {
  profile?: Profile | null
  destination: Destination
  isCompleted: boolean
  completionDate: string | null
}

export default function DestinationDetailsClient({
  profile,
  destination,
  isCompleted,
  completionDate
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [showLargeQR, setShowLargeQR] = useState(false)

  // Generate QR Code data URL on component mount
  useEffect(() => {
    if (profile && destination) {
      const payload = `PAMUKLAT_PASS:${profile.id}:${destination.id}`
      QRCode.toDataURL(payload, {
        margin: 1,
        width: 300,
        color: { dark: '#0F1D36', light: '#FFFFFF' }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err))
    }
  }, [profile, destination])

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  useEffect(() => {
    if (isCompleted) {
      triggerConfetti()
    }
  }, [isCompleted])

  // Download Boarding Pass Ticket as PDF
  const handleDownloadTicket = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })

      // Background header
      doc.setFillColor(15, 29, 54)
      doc.rect(0, 0, 148, 40, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('CIT PAMUKLAT 2026 BOARDING PASS', 10, 20)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Passenger: ${profile?.full_name || 'Student'}`, 10, 28)
      doc.text(`Student ID: ${profile?.student_id || 'N/A'}`, 10, 34)

      // Ticket Body
      doc.setTextColor(15, 29, 54)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Clearance Stop: ${destination.title.toUpperCase()}`, 10, 52)
      doc.text(`Gate: ${destination.gate_number}`, 10, 60)
      doc.text(`Program: ${profile?.course || 'N/A'} - Sec ${profile?.section || ''}`, 10, 68)

      // Insert QR code image
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 44, 78, 60, 60)
      }

      doc.setFontSize(8)
      doc.text('Present this QR code to the Stop Admin for scanning and stamp clearance.', 20, 145)

      doc.save(`Pamuklat_BoardingPass_${destination.gate_number.replace(/\s+/g, '')}.pdf`)
    } catch (err) {
      console.error('Failed to export ticket PDF:', err)
    }
  }

  // Generate short barcode string
  const barcodeString = `PASS-2026-${(profile?.student_id || 'STU').slice(-4)}-${destination.gate_number.replace(/\s+/g, '')}`

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0F1D36] flex flex-col pb-12 relative overflow-hidden">
      {/* Background World Map SVG Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-[280px] bg-gradient-to-b from-[#0F1D36] to-[#1E4FCC] text-white opacity-95 overflow-hidden">
        {/* World Map SVG background outline */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg viewBox="0 0 1000 500" className="w-full h-full object-cover">
            <path
              fill="currentColor"
              d="M150,150 Q200,100 250,160 T350,180 T450,120 T600,200 T800,150 T900,220 Q850,300 700,320 T500,280 T300,350 T150,300 Z"
            />
            <circle cx="250" cy="160" r="4" fill="#3B82F6" />
            <circle cx="700" cy="320" r="4" fill="#3B82F6" />
            <path d="M250,160 Q475,100 700,320" stroke="#60A5FA" strokeWidth="2" strokeDasharray="6 6" fill="none" />
          </svg>
        </div>

        {/* Floating clouds */}
        <div className="absolute top-[10%] left-[5%] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none bg-shape-float" />
      </div>

      <Navbar />

      <main className="max-w-md mx-auto px-4 py-6 flex-1 w-full relative z-10 space-y-6">

        {/* Top Header Controls */}
        <div className="flex items-center justify-between text-white">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15"
          >
            <ArrowLeft className="h-4 w-4" /> Boarding Pass
          </Link>
          <span className="text-[10px] font-mono font-bold tracking-widest bg-white/15 px-2.5 py-1 rounded-full uppercase border border-white/20">
            Gate {destination.gate_number}
          </span>
        </div>

        {/* TICKET CARD CONTAINER (MODERN AIRLINE BOARDING PASS STYLING) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-[#D4DCE8] overflow-hidden"
        >
          {/* Semicircular Ticket Side Cutout Notches */}
          <div className="absolute left-[-14px] top-[140px] w-7 h-7 bg-[#F5F7FB] rounded-full border border-[#D4DCE8] z-20" />
          <div className="absolute right-[-14px] top-[140px] w-7 h-7 bg-[#F5F7FB] rounded-full border border-[#D4DCE8] z-20" />

          {/* TOP TICKET SECTION: PASSENGER HEADER */}
          <div className="p-6 border-b-2 border-dashed border-[#E2E8F0] relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1E4FCC]/30 bg-[#EDF1F7] flex items-center justify-center shrink-0 shadow-sm">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-[#1E4FCC]" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F1D36] tracking-wide leading-tight uppercase">
                    {profile?.full_name || 'CIT Student'}
                  </h3>
                  <span className="text-[10px] text-[#5A6B85] font-semibold uppercase tracking-wider block">
                    Passenger • {profile?.course.split(' ')[0] || 'Freshmen'} ({profile?.section || '1A'})
                  </span>
                </div>
              </div>

              {/* Airline / Orgs Logo */}
              <div className="w-10 h-10 rounded-2xl bg-[#1E4FCC]/10 border border-[#1E4FCC]/20 flex items-center justify-center text-[#1E4FCC] shadow-sm shrink-0">
                <Plane className="h-5 w-5 transform -rotate-45" />
              </div>
            </div>
          </div>

          {/* FLIGHT ROUTE CODES (PAM -> DEST) */}
          <div className="p-6 border-b border-[#E2E8F0] bg-gradient-to-b from-white to-[#F8FAFC]">
            <div className="flex justify-between items-center text-center">
              {/* Origin Code */}
              <div className="text-left">
                <span className="font-black text-2xl text-[#0F1D36] tracking-tight block">
                  PAM
                </span>
                <span className="text-[9px] font-bold text-[#5A6B85] uppercase tracking-wider block">
                  Pamuklat 2026
                </span>
              </div>

              {/* Animated Flight Path Icon */}
              <div className="flex flex-col items-center flex-1 px-4">
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="h-[2px] bg-[#D4DCE8] flex-1 rounded-full" />
                  <motion.div
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-[#1E4FCC] text-white p-1.5 rounded-full shadow-sm"
                  >
                    <Plane className="h-3.5 w-3.5 transform rotate-90" />
                  </motion.div>
                  <div className="h-[2px] bg-[#D4DCE8] flex-1 rounded-full" />
                </div>
                <span className="text-[8px] font-mono text-[#1E4FCC] font-extrabold uppercase tracking-widest">
                  CIT Clearance Route
                </span>
              </div>

              {/* Destination Gate Code */}
              <div className="text-right">
                <span className="font-black text-2xl text-[#1E4FCC] tracking-tight block">
                  G0{destination.gate_number.replace(/\D/g, '') || '1'}
                </span>
                <span className="text-[9px] font-bold text-[#5A6B85] uppercase tracking-wider block truncate max-w-[90px]">
                  {destination.title}
                </span>
              </div>
            </div>

            {/* DATE & DURATION PILL BOX */}
            <div className="mt-5 bg-[#EDF1F7] border border-[#D4DCE8] rounded-2xl p-3.5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#1E4FCC]" />
                <div>
                  <span className="text-[8.5px] font-bold text-[#5A6B85] uppercase block leading-none">Date</span>
                  <span className="font-extrabold text-[#0F1D36] text-[11px] block mt-0.5">July 29, 2026</span>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-[#D4DCE8]" />

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#1E4FCC]" />
                <div>
                  <span className="text-[8.5px] font-bold text-[#5A6B85] uppercase block leading-none">Est Time</span>
                  <span className="font-extrabold text-[#0F1D36] text-[11px] block mt-0.5">{destination.estimated_duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TICKET DETAILS GRID */}
          <div className="px-6 py-4 bg-white border-b border-[#E2E8F0] grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-[8px] text-[#5A6B85] font-sans font-bold uppercase block">Gate</span>
              <span className="font-extrabold text-[#0F1D36] text-xs block mt-0.5">{destination.gate_number}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#5A6B85] font-sans font-bold uppercase block">Student ID</span>
              <span className="font-extrabold text-[#0F1D36] text-xs block mt-0.5 truncate">{profile?.student_id || '2026-0000'}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#5A6B85] font-sans font-bold uppercase block">Flight No.</span>
              <span className="font-extrabold text-[#1E4FCC] text-xs block mt-0.5">PAM-0{destination.gate_number.replace(/\D/g, '') || '1'}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#5A6B85] font-sans font-bold uppercase block">Class</span>
              <span className="font-extrabold text-[#0F1D36] text-xs block mt-0.5">{profile?.course.split(' ')[0] || 'BSIT'}</span>
            </div>
          </div>

          {/* BARCODE & QR CODE SECTION */}
          <div className="p-6 text-center space-y-4 bg-white relative">

            {/* STAMP OVERLAY IF COMPLETED */}
            {isCompleted && (
              <motion.div
                initial={{ scale: 2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: 'spring', damping: 12 }}
                className="absolute inset-0 m-auto w-56 h-28 border-3 border-dashed border-emerald-600 text-emerald-700 bg-emerald-50/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-3 font-mono text-center uppercase tracking-widest z-30 shadow-xl"
              >
                <div className="text-[9px] font-black text-emerald-800">UA IMMIGRATION CLEARED</div>
                <div className="border-y border-dashed border-emerald-600/40 py-1 my-1 w-full font-black text-xs flex items-center justify-center gap-1">
                  STAMPED <Check className="h-3.5 w-3.5 text-emerald-700" />
                </div>
                <div className="text-[8px] font-sans font-bold text-[#5A6B85]">
                  {completionDate ? new Date(completionDate).toLocaleDateString() : 'Verified Entry'}
                </div>
              </motion.div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#1E4FCC] uppercase tracking-widest block">
                Official Student Clearance Ticket
              </span>
              <p className="text-xs text-[#5A6B85]">
                Present this QR code to the Stop Facilitator / Admin for scanning.
              </p>
            </div>

            {/* QR Code Container */}
            <div
              onClick={() => setShowLargeQR(true)}
              className="inline-block p-3 rounded-2xl bg-[#F5F7FB] border border-[#D4DCE8] shadow-inner cursor-pointer group relative"
            >
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Student Boarding Pass QR"
                  className="w-44 h-44 mx-auto object-contain group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-44 h-44 bg-slate-200 animate-pulse rounded-xl flex items-center justify-center">
                  <QrCode className="h-10 w-10 text-slate-400" />
                </div>
              )}
              <span className="text-[8px] font-mono text-[#1E4FCC] uppercase font-bold block mt-1">
                Tap to enlarge QR
              </span>
            </div>

            {/* Simulated Barcode Graphic */}
            <div className="space-y-1 max-w-xs mx-auto">
              <div className="h-10 w-full bg-[#0F1D36] rounded flex items-center justify-between px-2 overflow-hidden opacity-90">
                {Array.from({ length: 38 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white h-full"
                    style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] font-bold text-[#5A6B85] tracking-widest block">
                {barcodeString}
              </span>
            </div>

            {/* Download Ticket Button */}
            <button
              onClick={handleDownloadTicket}
              className="w-full flex items-center justify-center gap-2 bg-[#0F1D36] hover:bg-[#0A1426] text-white text-xs font-extrabold uppercase tracking-widest py-4 px-6 rounded-2xl shadow-lg border border-slate-700 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4 text-[#3B82F6]" /> Download Boarding Ticket
            </button>
          </div>

          {/* TICKET FOOTER INSTRUCTIONS */}
          <div className="bg-[#EDF1F7] p-5 border-t border-[#D4DCE8] space-y-3">
            <h4 className="text-xs font-extrabold text-[#0F1D36] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-[#1E4FCC]" /> Clearance Instructions
            </h4>
            <p className="text-xs text-[#5A6B85] leading-relaxed">
              {destination.instructions}
            </p>
          </div>

        </motion.div>

      </main>

      {/* ENLARGED QR CODE MODAL OVERLAY */}
      <AnimatePresence>
        {showLargeQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F1D36]/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowLargeQR(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#D4DCE8]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-mono font-bold text-[#1E4FCC] uppercase tracking-widest block">
                Official Gate QR — {destination.gate_number}
              </span>
              <h3 className="text-lg font-black text-[#0F1D36] uppercase">
                {destination.title}
              </h3>

              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Enlarged Boarding Pass QR" className="w-64 h-64 mx-auto object-contain" />
              )}

              <p className="text-xs text-[#5A6B85]">
                Present this code to the booth administrator to scan and stamp your passport.
              </p>

              <button
                onClick={() => setShowLargeQR(false)}
                className="w-full bg-[#1E4FCC] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close QR Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
