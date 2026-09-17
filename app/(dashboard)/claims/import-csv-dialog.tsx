"use client"

import * as React from 'react'
import { Loader2, FolderOpen, UploadCloud, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/api-states'
import { api, type CsvImportResult } from '@/lib/api'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function ImportCsvDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<CsvImportResult | null>(null)
  const [showErrors, setShowErrors] = React.useState(false)

  function reset() {
    setFile(null)
    setError(null)
    setResult(null)
    setShowErrors(false)
  }

  function handleOpenChange(next: boolean) {
    if (!submitting) {
      setOpen(next)
      if (!next) reset()
    }
  }

  function pickFile(f: File | null) {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.csv') && f.type !== 'text/csv') {
      setError('Only CSV files are accepted')
      return
    }
    if (f.size > MAX_SIZE_BYTES) {
      setError('File exceeds the 5MB size limit')
      return
    }
    setError(null)
    setFile(f)
  }

  async function handleImport() {
    if (!file) {
      setError('Please select a CSV file')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.importCsv(file)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import CSV')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setOpen(false)
    reset()
    onImported()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FolderOpen className="size-4" />
        Import CSV
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Claims from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with claim records. Download the template to see the expected format.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#16A34A]/30 bg-[#DCFCE7] px-4 py-3 text-sm font-semibold text-[#16A34A]">
              <CheckCircle2 className="size-4" />
              {result.records_queued} claims imported successfully
            </div>
            {result.records_failed > 0 && (
              <div className="rounded-lg border border-[#D97706]/30 bg-[#FEF3C7] px-4 py-3 text-sm font-semibold text-[#D97706]">
                ⚠️ {result.records_failed} rows skipped
              </div>
            )}
            {result.failures?.length > 0 && (
              <div className="rounded-lg border border-[#E4E4EF]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-[#0A0A0F]"
                  onClick={() => setShowErrors((s) => !s)}
                >
                  Show errors
                  <span className="text-xs text-[#5C5C6B]">{showErrors ? 'Hide' : 'Show'}</span>
                </button>
                {showErrors && (
                  <ul className="max-h-48 overflow-auto border-t border-[#E4E4EF] px-4 py-2 text-sm text-[#5C5C6B]">
                    {result.failures.map((f, i) => (
                      <li key={i}>
                        Row {f.index}: {f.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleClose} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => api.downloadCsvTemplate()}
              className="w-fit text-sm font-medium text-[#1E6BFF] hover:underline"
            >
              Download Template
            </button>

            <div
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragging ? 'border-[#1E6BFF] bg-[#EAF2FF]' : 'border-[#E4E4EF]'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                pickFile(e.dataTransfer.files?.[0] ?? null)
              }}
            >
              <UploadCloud className="size-8 text-[#5C5C6B]" />
              {file ? (
                <p className="text-sm font-medium text-[#0A0A0F]">{file.name}</p>
              ) : (
                <p className="text-sm text-[#5C5C6B]">Drag and drop a CSV file here, or</p>
              )}
              <label className="cursor-pointer text-sm font-medium text-[#1E6BFF] hover:underline">
                Browse files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {error && <ErrorState message={error} />}

            <DialogFooter>
              <Button
                onClick={handleImport}
                disabled={submitting}
                className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Claims'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
