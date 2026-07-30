'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plane, Compass, CreditCard, ScanLine, LogOut, Bell } from 'lucide-react'
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

        // Load unread notifications count
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
    { name: 'Dashboard', href: '/dashboard', icon: Compass },
    { name: 'Passport', href: '/passport', icon: CreditCard },
    { name: 'Scanner', href: '/scan', icon: ScanLine },
  ]

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between h-14 sm:h-16">
        
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group shrink-0">
          <div className="bg-[#052856]/10 border border-[#052856]/20 p-2 rounded-xl text-[#052856] group-hover:bg-[#052856]/20 transition-all">
            <Plane className="h-5 w-5 transform -rotate-45" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[8.5px] font-extrabold tracking-[0.25em] text-[#0A3A78] uppercase block leading-none">
              University Terminal
            </span>
            <span className="font-black text-sm text-[#052856] tracking-wide">
              CIT PASSPORT
            </span>
          </div>
        </Link>

        {/* Navigation Tabs — larger tap targets on mobile */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-[#F4F6F9] border border-[#E2E8F0] p-1 rounded-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const LinkIcon = link.icon

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`relative flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-extrabold uppercase tracking-wide transition-all duration-300 cursor-pointer min-w-[44px] min-h-[36px] justify-center ${
                    isActive
                      ? 'text-white'
                      : 'text-[#334155] hover:text-[#052856] hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-[#052856] to-[#0A3A78] rounded-xl shadow-md shadow-[#052856]/20 border border-[#0A3A78]/30 z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <LinkIcon className="h-4 w-4 sm:h-4 sm:w-4 shrink-0 relative z-10" />
                  <span className="hidden sm:inline relative z-10 text-xs">{link.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Right Side: Notifications + Profile + Logout */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Notifications bell — larger tap target */}
          <Link
            href="/dashboard#notifications"
            className="relative cursor-pointer text-[#334155] hover:text-[#052856] transition-colors p-2 rounded-xl hover:bg-[#F4F6F9] min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Info */}
          {profile && (
            <div className="hidden sm:flex items-center gap-2 border-l border-[#E2E8F0] pl-3">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-8 w-8 rounded-full object-cover border border-[#052856]/30 shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#052856] text-white flex items-center justify-center font-extrabold text-xs uppercase border border-[#052856]/30 shrink-0">
                  {profile.full_name?.[0] || 'S'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="text-[10px] font-black text-[#052856] block max-w-[110px] truncate">
                  {profile.full_name}
                </span>
                <span className="text-[8.5px] font-extrabold text-[#475569] block uppercase truncate max-w-[110px]">
                  {profile.course ? profile.course.split(' ')[0] : 'Freshman'}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button — larger tap target */}
          <button
            onClick={handleLogout}
            className="bg-[#F4F6F9] border border-[#E2E8F0] hover:bg-red-50 hover:border-red-200 hover:text-red-600 p-2.5 rounded-xl text-[#475569] transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Log Out Terminal"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
