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
    <header className="w-full bg-[#040912]/95 border-b border-amber-500/10 backdrop-blur-md sticky top-0 z-45 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-400">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-[0.3em] text-amber-400 uppercase block leading-none">
              Control Tower
            </span>
            <span className="font-extrabold text-sm text-white tracking-wide uppercase">
              CIT FLIGHT OPERATIONS
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 md:gap-3 bg-[#08111F]/70 border border-slate-800 p-1 rounded-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const LinkIcon = link.icon

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${isActive
                      ? 'text-white font-extrabold'
                      : 'text-slate-300 hover:text-white font-extrabold'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminNavIndicator"
                      className="absolute inset-0 bg-amber-600 rounded-xl shadow-lg shadow-amber-600/10 border border-amber-500/20 z-0"
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
            className="bg-[#0e1b30] border border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:text-red-400 p-2.5 rounded-xl text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            title="Lock Operations Panel"
          >
            <LogOut className="h-4 w-4 shrink-0 text-slate-200" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  )
}
