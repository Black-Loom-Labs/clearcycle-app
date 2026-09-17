"use client"

import * as React from 'react'
import Link from 'next/link'
import { Search, X, Users, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/api-states'
import { api, type Patient } from '@/lib/api'
import { PatientRegistrationForm } from './patient-registration-form'

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [registerOpen, setRegisterOpen] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getPatients(search || undefined)
      .then((res) => setPatients(res.patients ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [search])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#5C5C6B]" />
          <Input
            placeholder="Search by name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64 pl-8 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute top-1/2 right-2.5 z-10 -translate-y-1/2 text-[#5C5C6B] hover:text-[#0A0A0F]"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <Button className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90" onClick={() => setRegisterOpen(true)}>
            <Plus className="size-4" />
            Register Patient
          </Button>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register Patient</DialogTitle>
              <DialogDescription>Add a new patient and their insurance policies.</DialogDescription>
            </DialogHeader>
            <PatientRegistrationForm
              onRegistered={() => {
                setRegisterOpen(false)
                load()
              }}
              onCancel={() => setRegisterOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>External ID</TableHead>
                <TableHead>Active Policies</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!loading && (patients?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <Users className="size-8 text-[#5C5C6B]" />
                      <p className="text-sm text-[#5C5C6B]">No patients found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                patients?.map((p) => (
                  <TableRow key={p.patient_id} className="cursor-pointer">
                    <TableCell className="font-medium text-[#0A0A0F]">
                      <Link href={`/patients/${p.patient_id}`} className="hover:text-[#1E6BFF]">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-[#5C5C6B]">{p.dob ?? '—'}</TableCell>
                    <TableCell className="text-sm text-[#5C5C6B]">{p.external_id ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.insurance_policies
                          .filter((ip) => ip.active)
                          .map((ip, i) => (
                            <Badge key={i} variant="outline">
                              {ip.carrier_id}
                            </Badge>
                          ))}
                        {p.insurance_policies.filter((ip) => ip.active).length === 0 && (
                          <span className="text-sm text-[#5C5C6B]">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#5C5C6B]">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={<Link href={`/patients/${p.patient_id}`} />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
