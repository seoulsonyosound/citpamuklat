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
    <header className="w-full bg-[#040912]/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-[#2563EB]/20 border border-[#60A5FA]/20 p-2 rounded-xl text-[#60A5FA] group-hover:bg-[#2563EB]/30 transition-all">
            <Plane className="h-5 w-5 transform -rotate-45" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[9px] font-bold tracking-[0.3em] text-[#60A5FA] uppercase block leading-none">
              Terminal
            </span>
            <span className="font-extrabold text-sm text-white tracking-wide">
              CIT PASSPORT
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 md:gap-3 bg-[#08111F]/60 border border-slate-850 p-1 rounded-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const LinkIcon = link.icon

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#2563EB] rounded-xl shadow-lg shadow-[#2563EB]/25 border border-[#60A5FA]/20 -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{link.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User profile dropdown & Logout */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications bell */}
          <Link href="/dashboard#notifications" className="relative cursor-pointer hover:text-[#60A5FA] text-slate-400 transition-colors">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded-full border border-[#040912]">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Info */}
          {profile && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3 md:pl-4">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-8 w-8 rounded-full object-cover border border-[#60A5FA]/30"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs uppercase border border-[#60A5FA]/30">
                  {profile.full_name[0]}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="text-[10px] font-bold text-white block max-w-[100px] truncate">
                  {profile.full_name}
                </span>
                <span className="text-[8px] font-bold text-slate-500 block uppercase truncate max-w-[100px]">
                  {profile.course ? profile.course.split(' ')[0] : 'Freshman'}
                </span>
              </div>
            </div>
          )}

          {/* Exit Logout */}
          <button
            onClick={handleLogout}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:text-red-400 p-2 rounded-xl text-slate-400 transition-all cursor-pointer"
            title="Log Out Terminal"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
