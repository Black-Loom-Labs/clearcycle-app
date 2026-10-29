"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

const VOLUMES = [
  "Under 100 claims/month",
  "100-500 claims/month",
  "500-1,000 claims/month",
  "1,000-3,000 claims/month",
  "3,000+ claims/month",
]

export function AuditForm() {
  const [form, setForm] = useState({ name: "", hospital: "", phone: "", email: "", volume: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryType: "hospital_pilot",
          name: form.name,
          organisation: form.hospital,
          phone: form.phone,
          email: form.email,
          volume: form.volume,
          message: "Audit request via homepage form",
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-12 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <p className="mt-4 text-lg font-semibold text-[#0F1F3D]">We&apos;ll be in touch within one business day.</p>
        <p className="mt-2 text-sm text-[#8A8070]">Or call Gaurav directly: <a href="tel:+919163236777" className="text-[#1E6BFF] underline">+91 91632 36777</a></p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8A8070]">Your name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Rajesh Kumar"
          className="rounded-lg border border-[#E0DAD0] bg-white px-4 py-2.5 text-sm text-[#0F1F3D] placeholder:text-[#C0B8A8] outline-none transition focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8A8070]">Hospital name *</label>
        <input
          required
          value={form.hospital}
          onChange={(e) => set("hospital", e.target.value)}
          placeholder="Apollo Hospitals, Chennai"
          className="rounded-lg border border-[#E0DAD0] bg-white px-4 py-2.5 text-sm text-[#0F1F3D] placeholder:text-[#C0B8A8] outline-none transition focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8A8070]">Phone *</label>
        <input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+91 98765 43210"
          className="rounded-lg border border-[#E0DAD0] bg-white px-4 py-2.5 text-sm text-[#0F1F3D] placeholder:text-[#C0B8A8] outline-none transition focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8A8070]">Work email *</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@hospital.com"
          className="rounded-lg border border-[#E0DAD0] bg-white px-4 py-2.5 text-sm text-[#0F1F3D] placeholder:text-[#C0B8A8] outline-none transition focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF]"
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-[#8A8070]">Monthly claim volume</label>
        <select
          value={form.volume}
          onChange={(e) => set("volume", e.target.value)}
          className="rounded-lg border border-[#E0DAD0] bg-white px-4 py-2.5 text-sm text-[#0F1F3D] outline-none transition focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF]"
        >
          <option value="">Select range...</option>
          {VOLUMES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        {status === "error" && (
          <p className="mb-3 text-sm text-red-400">Something went wrong. Try again or call +91 91632 36777.</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] py-3 text-sm font-semibold text-white transition hover:bg-[#1E6BFF]/90 disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {status === "loading" ? (
            <><Loader2 className="size-4 animate-spin" /> Sending...</>
          ) : (
            "Get my free audit"
          )}
        </button>
      </div>
    </form>
  )
}
