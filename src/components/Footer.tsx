'use client'

import React from 'react'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="w-full py-5 px-6 lg:px-12 bg-white/90 border-t border-[#E2E2E0] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20 backdrop-blur-sm">
      {/* Logos in exact order: SSITE -> UA -> CIT — no rectangle */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* 1. SSITE Logo */}
        <Image
          src="/logos/ssite.png"
          alt="SSITE Logo"
          width={32}
          height={32}
          className="h-8 w-auto object-contain hover:scale-110 transition-transform"
        />
        {/* 2. UA Logo */}
        <Image
          src="/logos/ua.png"
          alt="University of the Assumption Logo"
          width={32}
          height={32}
          className="h-8 w-auto object-contain hover:scale-110 transition-transform"
        />
        {/* 3. CIT Logo */}
        <Image
          src="/logos/cit.png"
          alt="CIT Logo"
          width={32}
          height={32}
          className="h-8 w-auto object-contain hover:scale-110 transition-transform"
        />
      </div>

      {/* CANDABA GURLZ & Credits */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052856] text-white text-[10px] font-black uppercase tracking-widest shadow-md border border-[#0A3A78]">
          <span>CANDABA GURLZ</span>
        </div>
        <span className="text-[11px] font-bold text-[#5A6B85] tracking-tight">
          University of the Assumption • CIT PAMUKLAT 2026
        </span>
      </div>
    </footer>
  )
}
