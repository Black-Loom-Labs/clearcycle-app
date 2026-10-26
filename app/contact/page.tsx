"use client"

import { useState } from "react"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { CheckCircle2, Loader2 } from "lucide-react"

const ROLES = [
  "Billing Manager / Head",
  "CFO / Finance Director",
  "Medical Director / CMO",
  "Hospital Administrator",
  "IT / HIS Manager",
  "Owner / Director",
  "Other",
]

const VOLUMES = [
  "Under 100 claims/month",
  "100–500 claims/month",
  "500–1,000 claims/month",
  "1,000–3,000 claims/month",
  "3,000+ claims/month",
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    hospital: "",
    role: "",
    phone: "",
    email: "",
    volume: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Something went wrong")
      }

      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }

  return (
    <div className="flex flex-col">
      <MarketingNav />

      {/* Hero */}
      <div className="border-b bg-[#0F1F3D] px-4 py-14 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-[#1E6BFF]">GET STARTED</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Talk to the team
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/60">
            We&apos;re offering a 3-month free pilot to the first hospitals we onboard. Tell us
            about your billing setup and we&apos;ll reach out within one business day.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 xl:px-10">
        {status === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-12 text-center">
            <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold text-emerald-900">We got your message!</h2>
            <p className="mt-2 text-emerald-700">
              Expect a reply from Gaurav within one business day. In the meantime, feel free to
              call{" "}
              <a href="tel:+919163236777" className="font-medium underline">
                +91 91632 36777
              </a>
              .
            </p>
            <button
              onClick={() => { setStatus("idle"); setForm({ name: "", hospital: "", role: "", phone: "", email: "", volume: "", message: "" }) }}
              className="mt-6 text-sm font-medium text-emerald-700 underline hover:text-emerald-900"
            >
              Submit another enquiry
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6">
            {/* Name + Hospital */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="name">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Dr. Priya Sharma"
                  className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="hospital">
                  Hospital name <span className="text-red-500">*</span>
                </label>
                <input
                  id="hospital"
                  required
                  value={form.hospital}
                  onChange={(e) => set("hospital", e.target.value)}
                  placeholder="Apollo Hospitals, Bengaluru"
                  className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
                />
              </div>
            </div>

            {/* Role + Phone */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="role">
                  Your role
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className="rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
                >
                  <option value="">Select a role…</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
                />
              </div>
            </div>

            {/* Email + Volume */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="email">
                  Work email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="billing@yourhospital.com"
                  className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="volume">
                  Monthly claim volume
                </label>
                <select
                  id="volume"
                  value={form.volume}
                  onChange={(e) => set("volume", e.target.value)}
                  className="rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
                >
                  <option value="">Select range…</option>
                  {VOLUMES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="message">
                Anything else?
              </label>
              <textarea
                id="message"
                rows={4}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Current challenges, HIS you use, TPAs you deal with most…"
                className="resize-none rounded-lg border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </p>
            )}

            {/* Submit */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#1E6BFF]/90 disabled:opacity-60 sm:w-auto"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send message"
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                Or call us directly:{" "}
                <a href="tel:+919163236777" className="font-medium text-foreground hover:underline">
                  +91 91632 36777
                </a>
              </p>
            </div>
          </form>
        )}

        {/* Trust row */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t pt-10 sm:grid-cols-3">
          {[
            { label: "Free 3-month pilot", desc: "No commitment, full pipeline live in 2 weeks" },
            { label: "Reply within 1 day", desc: "We respond to every enquiry personally" },
            { label: "Data stays in India", desc: "AWS ap-south-1, DPDP Act 2023 compliant" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
