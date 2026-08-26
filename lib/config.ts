export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.blackloomlabs.com'
export const DEMO_HOSPITAL_ID = '00000000-0000-0000-0000-000000000001'

export const DEMO_HOSPITALS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Demo General Hospital' },
]
