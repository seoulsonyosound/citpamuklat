'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plane, Compass, CreditCard, ScanLine, Clock, LogOut, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Load profile data
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, course')
          .eq('id', user.id)
          .single()
        setProfile(data)

        // Load notifications count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
        setUnreadCount(count || 0)
      }
    }
    loadProfile()

    // Listen for notification updates in realtime
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          loadProfile()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { name: 'Terminal Dashboard', href: '/dashboard', icon: Compass },
    { name: 'Digital Passport', href: '/passport', icon: CreditCard },
    { name: 'Boarding Scanner', href: '/scan', icon: ScanLine },
  ]

  return (
    <header className="w-full bg-white/95 border-b border-[#E2E2E0] backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 md:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-[#052856]/10 border border-[#052856]/20 p-2 rounded-xl text-[#052856] group-hover:bg-[#052856]/20 transition-all">
            <Plane className="h-5 w-5 transform -rotate-45" />
          </div>
          <div className="hidden xs:block sm:block">
            <span className="text-[8.5px] font-extrabold tracking-[0.25em] text-[#0A3A78] uppercase block leading-none">
              University Terminal
            </span>
            <span className="font-black text-xs sm:text-sm text-[#052856] tracking-wide">
              CIT PASSPORT
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-[#F4F4F2] border border-[#E2E2E0] p-1 rounded-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const LinkIcon = link.icon

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-[#3B4E6B] font-extrabold hover:text-[#052856]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-[#052856] to-[#0A3A78] rounded-xl shadow-md shadow-[#052856]/20 border border-[#0A3A78]/30 z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 relative z-10" />
                  <span className="hidden sm:inline md:inline relative z-10">{link.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User profile dropdown & Logout */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Notifications bell */}
          <Link href="/dashboard#notifications" className="relative cursor-pointer hover:text-[#052856] text-[#3B4E6B] transition-colors p-1.5 font-bold">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#861211] text-white font-mono font-black text-[9px] px-1.5 py-0.2 rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Info */}
          {profile && (
            <div className="flex items-center gap-2 border-l border-[#E2E2E0] pl-2 sm:pl-3">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-[#052856]/30"
                />
              ) : (
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#052856] text-white flex items-center justify-center font-extrabold text-xs uppercase border border-[#052856]/30">
                  {profile.full_name[0]}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="text-[10px] font-black text-[#052856] block max-w-[100px] truncate">
                  {profile.full_name}
                </span>
                <span className="text-[8.5px] font-extrabold text-[#3B4E6B] block uppercase truncate max-w-[100px]">
                  {profile.course ? profile.course.split(' ')[0] : 'Freshman'}
                </span>
              </div>
            </div>
          )}

          {/* Exit Logout */}
          <button
            onClick={handleLogout}
            className="bg-[#F4F4F2] border border-[#E2E2E0] hover:bg-[#861211]/10 hover:border-[#861211]/30 hover:text-[#861211] p-2 rounded-xl text-[#3B4E6B] transition-all cursor-pointer font-bold"
            title="Log Out Terminal"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
