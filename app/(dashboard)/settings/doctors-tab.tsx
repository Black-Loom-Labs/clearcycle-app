"use client"

import * as React from 'react'
import { Plus, Pencil, Ban } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, EmptyState } from '@/components/api-states'
import { useToast } from '@/components/toast'
import { api, type Doctor } from '@/lib/api'
import { canAddDoctors, canManageDoctors, getCurrentRole } from '@/lib/roles'
import { DoctorDialog } from './doctor-dialog'

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return digits
  return `${'•'.repeat(digits.length - 4)}${digits.slice(-4)}`
}

export function DoctorsTab() {
  const { showToast } = useToast()
  const role = React.useMemo(() => getCurrentRole(), [])
  const canAdd = canAddDoctors(role)
  const canManage = canManageDoctors(role)

  const [doctors, setDoctors] = React.useState<Doctor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingDoctor, setEditingDoctor] = React.useState<Doctor | null>(null)
  const [disablingId, setDisablingId] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getDoctors()
      .then((res) => setDoctors(res.doctors ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  function openAdd() {
    setEditingDoctor(null)
    setDialogOpen(true)
  }

  function openEdit(doctor: Doctor) {
    setEditingDoctor(doctor)
    setDialogOpen(true)
  }

  async function handleDisable(doctor: Doctor) {
    setDisablingId(doctor.id)
    try {
      await api.disableDoctor(doctor.id)
      showToast(`Dr. ${doctor.name} disabled`)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to disable doctor')
    } finally {
      setDisablingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[#0A0A0F]">Doctors Directory</p>
          <p className="text-sm text-[#5C5C6B]">
            Doctors available for approval workflows on discharge claims.
          </p>
        </div>
        {canAdd && (
          <Button className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90" onClick={openAdd}>
            <Plus className="size-4" />
            Add Doctor
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors yet" description="Add a doctor to get started." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Speciality</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell className="font-medium text-[#0A0A0F]">{doctor.name}</TableCell>
                <TableCell className="text-sm text-[#5C5C6B]">{doctor.speciality ?? '—'}</TableCell>
                <TableCell className="font-mono text-sm text-[#5C5C6B]">{maskPhone(doctor.phone)}</TableCell>
                <TableCell>
                  <Badge className={doctor.status === 'enabled' ? 'bg-[#EAFBF0] text-[#16A34A]' : 'bg-[#F4F4F5] text-[#5C5C6B]'}>
                    {doctor.status === 'enabled' ? 'Enabled' : 'Disabled'}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(doctor)}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={doctor.status === 'disabled' || disablingId === doctor.id}
                        onClick={() => handleDisable(doctor)}
                        className="text-[#DC2626] hover:text-[#DC2626]"
                      >
                        <Ban className="size-3.5" />
                        {disablingId === doctor.id ? 'Disabling...' : 'Disable'}
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} doctor={editingDoctor} onSaved={load} />
    </div>
  )
}
