import { Suspense } from 'react'
import ScanClient from './ScanClient'

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08111F] text-slate-100 flex items-center justify-center font-mono uppercase text-xs tracking-widest">
          ✈️ LOADING SCANNER HUD...
        </div>
      }
    >
      <ScanClient />
    </Suspense>
  )
}
