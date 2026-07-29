import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { verifyAdminToken } from '@/lib/adminAuth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Skip static files, api routes, auth callbacks, and internal Next.js assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/auth/callback') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Run Supabase session updates
  const { supabaseResponse, user } = await updateSession(request)

  // 3. Admin Authentication Logic
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token')?.value
    const isValidAdmin = adminToken ? await verifyAdminToken(adminToken) : false

    if (pathname === '/admin/login') {
      if (isValidAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return supabaseResponse
    }

    if (!isValidAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return supabaseResponse
  }

  // 4. Student Authentication Logic
  const publicPaths = ['/login', '/']
  const isPublicPath = publicPaths.includes(pathname)

  if (!user) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // 5. Onboarding Logic (If logged in, check profile completion status)
  const { createServerClient } = await import('@supabase/ssr')
  const tempSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: profile } = await tempSupabase
    .from('profiles')
    .select('course, section, year_level')
    .eq('id', user.id)
    .single()

  const hasOnboarded = !!(profile?.course && profile?.section && profile?.year_level)

  if (pathname === '/onboarding') {
    if (hasOnboarded) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  if (!hasOnboarded) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  if (isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
