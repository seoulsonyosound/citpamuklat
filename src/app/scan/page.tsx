import { Suspense } from 'react'
import ScanClient from './ScanClient'

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FB] text-[#0F1D36] flex items-center justify-center font-mono uppercase text-xs tracking-widest font-bold">
          LOADING SCANNER HUD...
        </div>
      }
    >
      <ScanClient />
    </Suspense>
  )
}
