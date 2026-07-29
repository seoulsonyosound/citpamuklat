'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Compass, Clock, CheckCircle, ArrowLeft, PlaneTakeoff, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import * as Icons from 'lucide-react'

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
  destination: Destination
  isCompleted: boolean
  completionDate: string | null
}

export default function DestinationDetailsClient({ destination, isCompleted, completionDate }: Props) {
  
  const renderIcon = (iconName: string, color: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.MapPin
    return <IconComponent className="h-6 w-6" style={{ color }} />
  }

  // Format step-by-step instructions (split by numbered steps or newlines)
  const formatInstructions = (text: string) => {
    return text.split('\n').filter(line => line.trim().length > 0).map((line, idx) => {
      // Remove leading numbers/dots if they exist
      const cleanLine = line.replace(/^\d+[\.\-\s]*/, '')
      return (
        <li key={idx} className="flex gap-4 items-start text-xs text-slate-300 leading-relaxed">
          <span className="flex h-5 w-5 bg-slate-900 border border-slate-800 text-[#60A5FA] font-mono text-[10px] font-bold rounded-lg items-center justify-center shrink-0 mt-0.5 shadow-inner">
            {idx + 1}
          </span>
          <span className="pt-0.5">{cleanLine}</span>
        </li>
      )
    })
  }

  return (
    <div className="min-h-screen bg-[#08111F] text-slate-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Back Button */}
        <Link href="/dashboard">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-mono cursor-pointer mb-2">
            <ArrowLeft className="h-4 w-4" /> Return to Terminal
          </div>
        </Link>

        {/* BOARDING PASS TICKET OUTLINE */}
        <div className="relative overflow-hidden ticket-card glass-panel-dark rounded-3xl shadow-2xl border border-slate-850">
          
          {/* Decorative ticket line */}
          <div className="absolute top-0 bottom-0 left-[70%] border-l-2 border-dashed border-slate-800 pointer-events-none hidden md:block" />

          {/* Ticket Header status bar */}
          <div className="bg-[#040912]/80 border-b border-slate-850 px-6 py-4 flex justify-between items-center text-xs uppercase tracking-widest text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="h-4 w-4 text-[#60A5FA]" />
              <span>CIT BOARDING INSTRUCTIONS</span>
            </div>
            <div className="font-bold text-[#60A5FA]">
              Flight CIT-2026
            </div>
          </div>

          {/* Main Content Body */}
          <div className="flex flex-col md:flex-row items-stretch">
            
            {/* LEFT BLOCK: Flight details & instructions */}
            <div className="p-6 md:p-8 md:w-[70%] space-y-6">
              
              {/* Destination Header */}
              <div className="flex items-start gap-4">
                <div className="bg-[#2563EB]/15 border border-[#60A5FA]/15 p-2 rounded-xl shrink-0">
                  {renderIcon(destination.icon, destination.destination_color)}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#60A5FA] font-bold block leading-none">
                    Assign Gate: {destination.gate_number}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">
                    {destination.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-350 leading-relaxed bg-[#040912]/30 border border-slate-900/50 p-4 rounded-2xl">
                {destination.description}
              </p>

              {/* Instructions checklist */}
              <div className="space-y-4 border-t border-slate-900 pt-5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">
                  Gate Boarding Requirements
                </h4>
                <ul className="space-y-3">
                  {formatInstructions(destination.instructions)}
                </ul>
              </div>

            </div>

            {/* RIGHT BLOCK: Boarding stamp clearance stub */}
            <div className="p-6 md:p-8 md:w-[30%] bg-[#040912]/40 flex flex-col justify-between items-center text-center border-t md:border-t-0 md:border-l border-slate-900 z-10 space-y-6">
              
              {/* Gate metadata details */}
              <div className="space-y-4 w-full">
                <div className="bg-[#08111F]/70 border border-slate-850 p-3 rounded-2xl font-mono text-[10px] uppercase text-left w-full space-y-2">
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-bold text-white flex items-center gap-1"><Clock className="h-3 w-3" /> {destination.estimated_duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Officer:</span>
                    <span className="font-bold text-white flex items-center gap-1"><Compass className="h-3 w-3" /> {destination.representative}</span>
                  </div>
                </div>
              </div>

              {/* Clearance Stamp Status */}
              <div className="flex flex-col items-center justify-center flex-1">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0.8, rotate: -20 }}
                    animate={{ scale: 1, rotate: -8 }}
                    className="border-3 border-dashed border-emerald-500 text-emerald-400 bg-emerald-950/20 font-mono font-black text-xs tracking-widest p-4 uppercase rounded-xl select-none"
                    style={{ textShadow: '0 0 5px rgba(16,185,129,0.2)' }}
                  >
                    <div className="text-[8px] leading-none mb-0.5">UA IMMIGRATION</div>
                    <div className="border-y border-dashed border-emerald-500/30 py-1 my-1 w-full text-[10px]">
                      PASSPORT CLR
                    </div>
                    <div className="text-[7px] leading-none text-slate-500 font-sans mt-0.5">
                      {completionDate ? new Date(completionDate).toLocaleDateString() : ''}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {/* Visual Stamp preview sticker */}
                    <div className="w-16 h-16 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-600 relative">
                      <Sparkles className="h-6 w-6 text-slate-600" />
                      <div className="absolute inset-1 rounded-full border border-slate-800" />
                    </div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">
                      Stamp Locked
                    </span>
                  </div>
                )}
              </div>

              {/* Action Board Button */}
              <div className="w-full">
                {isCompleted ? (
                  <div className="w-full text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    ✔ Gate Clearance Approved
                  </div>
                ) : (
                  <Link href={`/scan?destinationId=${destination.id}`} className="w-full block">
                    <div className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-2xl shadow-xl shadow-[#2563EB]/25 border border-[#60A5FA]/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5">
                      Scan Boarding QR <PlaneTakeoff className="h-4 w-4 text-white/80" />
                    </div>
                  </Link>
                )}
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  )
}
