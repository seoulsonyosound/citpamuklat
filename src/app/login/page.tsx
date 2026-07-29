import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08111F] text-slate-100 flex items-center justify-center font-mono uppercase text-xs tracking-widest">
          ✈️ LOADING KIOSK TERMINAL...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
