'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plane, BarChart3, MapPin, Users, LogOut, Radio } from 'lucide-react'
import { adminLogoutAction } from '@/app/actions/authActions'

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await adminLogoutAction()
    router.push('/admin/login')
    router.refresh()
  }

  const navLinks = [
    { name: 'Analytics Tower', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Flight Gates', href: '/admin/destinations', icon: MapPin },
    { name: 'Passengers', href: '/admin/students', icon: Users },
  ]

  return (
    <header className="w-full bg-white/95 border-b border-[#E2E8F0] backdrop-blur-md sticky top-0 z-45 px-4 md:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-600 shadow-sm">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-[0.3em] text-amber-700 uppercase block leading-none">
              Control Tower
            </span>
            <span className="font-black text-sm text-[#052856] tracking-wide uppercase">
              CIT FLIGHT OPERATIONS
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 md:gap-3 bg-[#F1F5F9] border border-[#E2E8F0] p-1 rounded-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const LinkIcon = link.icon

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${isActive
                      ? 'text-white'
                      : 'text-[#475569] hover:text-[#052856]'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminNavIndicator"
                      className="absolute inset-0 bg-[#052856] rounded-xl shadow-md shadow-[#052856]/20 border border-[#0A3A78] z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <LinkIcon className="h-4 w-4 shrink-0 relative z-10" />
                  <span className="hidden md:inline relative z-10">{link.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Exit Logout */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-white border border-[#E2E8F0] hover:bg-red-50 hover:border-red-200 hover:text-red-600 p-2.5 rounded-xl text-[#475569] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-sm"
            title="Lock Operations Panel"
          >
            <LogOut className="h-4 w-4 shrink-0 text-[#475569]" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  )
}
