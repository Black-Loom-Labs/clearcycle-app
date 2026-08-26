"use client"

import * as React from 'react'
import { DEMO_HOSPITAL_ID, DEMO_HOSPITALS } from './config'

interface HospitalContextValue {
  hospitalId: string
  setHospitalId: (id: string) => void
  hospitals: typeof DEMO_HOSPITALS
}

const HospitalContext = React.createContext<HospitalContextValue | null>(null)

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const [hospitalId, setHospitalId] = React.useState(DEMO_HOSPITAL_ID)

  return (
    <HospitalContext.Provider value={{ hospitalId, setHospitalId, hospitals: DEMO_HOSPITALS }}>
      {children}
    </HospitalContext.Provider>
  )
}

export function useHospital() {
  const ctx = React.useContext(HospitalContext)
  if (!ctx) throw new Error('useHospital must be used within HospitalProvider')
  return ctx
}
