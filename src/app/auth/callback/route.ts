import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  // Determine dynamic origin safely for Vercel/mobile deployments
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  
  let origin = requestUrl.origin
  if (forwardedHost) {
    const proto = forwardedProto || 'https'
    origin = `${proto}://${forwardedHost}`
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const user = data.user
      const email = user.email || ''
      const domain = email.split('@')[1] || ''
      
      const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || 'ua.edu.ph'
      const allowAll = process.env.NEXT_PUBLIC_ALLOW_ALL_EMAILS === 'true'
      const isValidDomain =
        domain === allowedDomain ||
        domain.endsWith(`.${allowedDomain}`) ||
        email.endsWith(`@${allowedDomain}`) ||
        allowAll

      if (!isValidDomain) {
        // Sign out immediately and redirect back to login with error
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=domain`)
      }

      // Check if profile exists; if not, do an upsert
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: email,
          full_name: user.user_metadata.full_name || user.user_metadata.name || 'Freshman Student',
          avatar_url: user.user_metadata.avatar_url || '',
        })
      }

      // Check if onboarding is needed
      const course = profile?.course || ''
      const section = profile?.section || ''
      const year = profile?.year_level || ''
      const needsOnboarding = !course || !section || !year

      if (needsOnboarding) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page if some login failure occurs
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
