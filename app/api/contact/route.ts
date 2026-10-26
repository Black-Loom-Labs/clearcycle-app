import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const TO = "gaurav@gauravhira.dev"
const CC = "gauravhira24@gmail.com"
const FROM = "ClearCycle <hello@clearcycle.in>"

const ENQUIRY_LABELS: Record<string, string> = {
  hospital_pilot: "Hospital — free pilot programme",
  tpa_integration: "TPA — integration or data partnership",
  his_integration: "HIS / billing software — API integration",
  partnership: "Business partnership or distribution",
  investor: "Investor enquiry",
  other: "Other",
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { enquiryType, name, organisation, role, phone, email, volume, message } = body

  if (!name || !organisation || !phone || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 })
  }

  const enquiryLabel = ENQUIRY_LABELS[enquiryType] ?? enquiryType ?? "—"
  const subject = `[${enquiryLabel}] ${organisation} — ${name}`

  const html = `
<div style="font-family:sans-serif;max-width:600px;color:#1a1a1a">
  <h2 style="margin:0 0 4px;font-size:20px">New enquiry — ClearCycle</h2>
  <p style="margin:0 0 24px;color:#666;font-size:14px">Submitted via clearcycle.in/contact</p>

  <table style="width:100%;border-collapse:collapse;font-size:15px">
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:160px">Enquiry type</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;color:#1E6BFF">${enquiryLabel}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Name</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${name}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Organisation</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${organisation}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Role</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee">${role || "—"}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Phone</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee">
          <a href="tel:${phone}" style="color:#1E6BFF">${phone}</a></td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Email</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee">
          <a href="mailto:${email}" style="color:#1E6BFF">${email}</a></td></tr>
    ${volume ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Monthly volume</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee">${volume}</td></tr>` : ""}
    <tr><td style="padding:10px 0;color:#888;vertical-align:top">Message</td>
        <td style="padding:10px 0;white-space:pre-line">${message || "—"}</td></tr>
  </table>

  <div style="margin-top:24px;padding:16px;background:#f0f6ff;border-radius:8px;font-size:13px;color:#444">
    Reply directly to <strong>${email}</strong> or call <strong>${phone}</strong>.
  </div>
</div>`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      cc: [CC],
      replyTo: email,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Contact route error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
