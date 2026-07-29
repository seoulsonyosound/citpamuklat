import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FB] text-[#0F1D36] flex items-center justify-center font-mono uppercase text-xs tracking-widest font-bold">
          LOADING KIOSK TERMINAL...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
