"use client"

import * as React from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api, type Patient } from '@/lib/api'
import { PatientRegistrationForm } from './patient-registration-form'

export function PatientSearchStep({ onSelected }: { onSelected: (patient: Patient) => void }) {
  const [query, setQuery] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [results, setResults] = React.useState<Patient[]>([])
  const [loading, setLoading] = React.useState(false)
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [registering, setRegistering] = React.useState(false)
  const [selected, setSelected] = React.useState<Patient | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  React.useEffect(() => {
    if (!debounced) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    api
      .getPatients(debounced)
      .then((res) => {
        if (!cancelled) setResults(res.patients ?? [])
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debounced])

  if (registering) {
    return (
      <PatientRegistrationForm
        onRegistered={(patient) => {
          setRegistering(false)
          setSelected(patient)
          onSelected(patient)
        }}
        onCancel={() => setRegistering(false)}
      />
    )
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-[#E4E4EF] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#0A0A0F]">{selected.name}</p>
              <p className="text-sm text-[#5C5C6B]">
                DOB: {selected.dob ?? '—'}
                {selected.external_id ? ` · MRN: ${selected.external_id}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-[#1E6BFF] hover:underline"
              onClick={() => setSelected(null)}
            >
              Change
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selected.insurance_policies
              .filter((p) => p.active)
              .map((p, i) => (
                <Badge key={i} variant="outline">
                  {p.plan_name || p.carrier_id}
                </Badge>
              ))}
            {selected.insurance_policies.filter((p) => p.active).length === 0 && (
              <span className="text-sm text-[#5C5C6B]">No active policies</span>
            )}
          </div>
        </div>
        <Button
          className="w-fit bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
          onClick={() => onSelected(selected)}
        >
          Use this patient
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#5C5C6B]" />
        <Input
          placeholder="Search by name or patient ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="pl-8"
        />
      </div>
      {showDropdown && (
        <div className="flex flex-col gap-1 rounded-lg border border-[#E4E4EF] bg-white p-1 shadow-sm">
          {loading && <div className="px-3 py-2 text-sm text-[#5C5C6B]">Searching…</div>}
          {!loading &&
            results.map((p) => (
              <button
                key={p.patient_id}
                type="button"
                className="flex flex-col items-start gap-1 rounded-md px-3 py-2 text-left hover:bg-[#F7F8FA]"
                onClick={() => {
                  setSelected(p)
                  setShowDropdown(false)
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium text-[#0A0A0F]">{p.name}</span>
                  <span className="text-xs text-[#5C5C6B]">DOB: {p.dob ?? '—'}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.insurance_policies
                    .filter((ip) => ip.active)
                    .map((ip, i) => (
                      <Badge key={i} variant="outline">
                        {ip.carrier_id}
                      </Badge>
                    ))}
                </div>
              </button>
            ))}
          {!loading && debounced && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-[#5C5C6B]">No patients found</div>
          )}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-left text-sm font-medium text-[#1E6BFF] hover:bg-[#F7F8FA]"
            onClick={() => {
              setRegistering(true)
              setShowDropdown(false)
            }}
          >
            <UserPlus className="size-3.5" />
            Register New Patient
          </button>
        </div>
      )}
    </div>
  )
}
