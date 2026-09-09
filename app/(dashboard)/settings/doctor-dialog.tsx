"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/api-states'
import { useToast } from '@/components/toast'
import { api, type Doctor } from '@/lib/api'

// Add/edit modal for the Doctors directory. `doctor` present = editing an
// existing entry (admin-only, enforced by the caller not rendering the Edit
// action for other roles); absent = adding a new doctor.
export function DoctorDialog({
  open,
  onOpenChange,
  doctor,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: Doctor | null
  onSaved: () => void
}) {
  const { showToast } = useToast()
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [speciality, setSpeciality] = React.useState('')
  const [registrationNumber, setRegistrationNumber] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName(doctor?.name ?? '')
      setPhone(doctor?.phone ?? '')
      setSpeciality(doctor?.speciality ?? '')
      setRegistrationNumber(doctor?.registration_number ?? '')
      setError(null)
    }
  }, [open, doctor])

  function handleOpenChange(next: boolean) {
    if (!submitting) onOpenChange(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const body = {
        name: name.trim(),
        phone: phone.trim(),
        speciality: speciality.trim() || undefined,
        registration_number: registrationNumber.trim() || undefined,
      }
      if (doctor) {
        await api.updateDoctor(doctor.id, body)
        showToast(`Dr. ${name.trim()} updated`)
      } else {
        await api.createDoctor(body)
        showToast(`Dr. ${name.trim()} added to the directory`)
      }
      onOpenChange(false)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save doctor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor
              ? 'Update this doctor’s directory details.'
              : 'Add a doctor to the directory for approval workflows.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Phone" required>
            <Input
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </Field>
          <Field label="Speciality">
            <Input value={speciality} onChange={(e) => setSpeciality(e.target.value)} />
          </Field>
          <Field label="Registration Number">
            <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
          </Field>

          {error && <ErrorState message={error} />}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
              {submitting ? 'Saving...' : doctor ? 'Save Changes' : 'Add Doctor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#0A0A0F]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </label>
      {children}
    </div>
  )
}
