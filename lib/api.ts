import { API_BASE } from './config'

async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.detail ?? ''
    } catch {
      // ignore — no JSON body
    }
    throw new Error(detail || `API error ${res.status}`)
  }
  return res.json()
}

// Multipart requests must NOT set a Content-Type header — the browser needs
// to add its own with the multipart boundary.
async function apiFetchForm<T = unknown>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body })
  if (!res.ok) {
    let detail = ''
    try {
      const json = await res.json()
      detail = json?.detail ?? ''
    } catch {
      // ignore — no JSON body
    }
    throw new Error(detail || `API error ${res.status}`)
  }
  try {
    return await res.json()
  } catch {
    return null as T
  }
}

// ---- Response shapes (verified against the live API) ----

export interface AgingBucket {
  count: number
  claim_ids?: string[]
}

export interface CarrierBreakdown {
  carrier_id: string
  plan_name: string
  claims: number
  total_billed_inr: number
  total_approved_inr: number
  total_deducted_inr: number
  collection_rate_pct: number
  adjudication_breakdown: { fully_approved: number; partial: number; rejected: number }
}

export interface DenialCategorySummary {
  category: string
  label: string
  count: number
  avg_win_probability: number
}

export interface ARDashboardResponse {
  hospital_id: string
  computed_at: string
  summary: {
    total_claims: number
    claims_by_status: Record<string, number>
    adjudicated_claims: number
    adjudication_breakdown: { fully_approved: number; partial: number; rejected: number }
    financial: {
      total_billed_inr: number
      total_approved_inr: number
      total_deducted_inr: number
      total_copay_inr: number
      net_leakage_inr: number
    }
    collection_rate_pct: number
    denial_rate_pct: number
  }
  aging_buckets: Record<string, AgingBucket>
  carrier_breakdown: CarrierBreakdown[]
  denial_patterns: {
    top_denial_categories: DenialCategorySummary[]
    total_denial_intel_claims: number
    nme_deductions: {
      total_inr: number
      top_items: { description: string; total_deducted_inr: number }[]
    }
  }
  leakage: {
    total_leakage_inr: number
    breakdown: {
      nme_deductions_inr: number
      proportional_deductions_inr: number
      copay_inr: number
    }
    rejected_claims: { count: number; total_billed_inr: number; potentially_recoverable_inr: number }
    partial_claims: { count: number }
    leakage_prevention_opportunity?: { note: string; estimated_recoverable_inr: number }
  }
  pipeline_velocity: {
    avg_processing_minutes: number
    avg_processing_display: string
    measured_claims: number
    benchmark: {
      manual_processing_days: string
      clearcycle_processing: string
      improvement_factor: number
    }
  }
}

export interface PipelineStageStatus {
  status: string
  [key: string]: unknown
}

export interface Claim {
  id: string
  hospital_id: string
  claim_type: string
  payer_id: string | null
  status: string
  readiness_score: number | null
  total_charges: number | null
  admission_date: string | null
  discharge_date: string | null
  created_at: string
  updated_at: string
  pipeline_stages: Record<string, PipelineStageStatus>
}

export interface ClaimsListResponse {
  claims: Claim[]
  total: number
  page: number
  per_page: number
}

export interface CodingDiagnosis {
  code: string
  description: string
  confidence: number
  diagnosis_type?: string
}

export interface CodingProcedure {
  code: string
  description: string
  units?: number
  confidence: number
}

export interface CodingResult {
  claim_id: string
  agent: string
  result: {
    diagnoses: CodingDiagnosis[]
    procedures: CodingProcedure[]
    overall_confidence: number
    diagnosis_count: number
    procedure_count: number
  }
  tokens_used: number
  duration_ms: number
  completed_at: string
}

export interface AdjudicationLineItem {
  description: string
  billed_inr: number
  approved_inr: number
  deduction_inr: number
  deduction_reason?: string
}

export interface AdjudicationResult {
  claim_id: string
  carrier_id: string
  plan_name: string
  status: 'approved' | 'partial' | 'rejected' | string
  summary: {
    total_billed_inr: number
    total_approved_inr: number
    total_deducted_inr: number
    copay_amount_inr: number
  }
  line_items: AdjudicationLineItem[]
  rejection_reasons: string[]
  completed_at: string
}

export interface DenialCategory {
  category: string
  label: string
  appealable: boolean
  confidence: number
  description: string
  appeal_strategy: string
  win_probability: number
  required_documents: string[]
}

export interface DenialIntelResult {
  claim_id: string
  adjudication_status: string
  carrier_id: string
  plan_name: string
  denial_categories: DenialCategory[]
  overall_win_probability: number
  appeal_recommended: boolean
  appeal_letter?: string
  generated_at: string
}

export interface DenialsListResponse {
  denials: { claim_id: string; result: DenialIntelResult; created_at: string; payer_id: string }[]
  page: number
  per_page: number
}

export interface PreEncounterFlag {
  severity: 'block' | 'warn' | 'info' | string
  code: string
  title: string
  detail: string
  action_required?: string
}

export interface PreEncounterResult {
  patient_id: string
  hospital_id: string
  claim_id?: string
  carrier_id: string
  plan_name: string
  policy_number: string
  admission_date: string
  clearance_status: 'cleared' | 'conditional' | 'blocked' | string
  flags: PreEncounterFlag[]
  pre_auth_required: boolean
  pre_auth_procedures?: string[]
  pre_auth_letter?: string
  room_entitlement?: string
  sum_insured_inr?: number
  sum_insured_used_inr?: number
  sum_insured_available_inr?: number
  months_covered?: number
  generated_at: string
}

export interface Carrier {
  carrier_id: string
  carrier_name: string
  plan_name: string
  display_label: string
  short_name: string
  is_default?: boolean
  [key: string]: unknown
}

export interface IngestDocumentResponse {
  claim_id?: string
  status?: string
  [key: string]: unknown
}

export const api = {
  getARDashboard: (hospitalId: string) =>
    apiFetch<ARDashboardResponse>(`/ar/dashboard?hospital_id=${hospitalId}`),
  getClaims: (hospitalId: string, params?: Record<string, string>) =>
    apiFetch<ClaimsListResponse>(
      `/claims?hospital_id=${hospitalId}&${new URLSearchParams(params).toString()}`
    ),
  getCodingResult: (claimId: string) =>
    apiFetch<CodingResult>(`/results/${claimId}/coding`),
  getAdjudication: (claimId: string) =>
    apiFetch<AdjudicationResult>(`/results/${claimId}/adjudication`),
  getDenialIntel: (claimId: string) =>
    apiFetch<DenialIntelResult>(`/results/${claimId}/denial-intel`),
  getDenials: (hospitalId: string, params?: Record<string, string>) =>
    apiFetch<DenialsListResponse>(
      `/denials?hospital_id=${hospitalId}&${new URLSearchParams(params).toString()}`
    ),
  getPreEncounter: (claimId: string) =>
    apiFetch<PreEncounterResult>(`/pre-encounter/${claimId}`),
  checkEligibility: (body: object) =>
    apiFetch<PreEncounterResult>('/pre-encounter/check', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getARCarriers: (hospitalId: string) =>
    apiFetch(`/ar/carriers?hospital_id=${hospitalId}`),
  getCarriers: () => apiFetch<Carrier[]>('/carriers'),
  getARLeakage: (hospitalId: string) =>
    apiFetch(`/ar/leakage?hospital_id=${hospitalId}`),
  getARVelocity: (hospitalId: string) =>
    apiFetch(`/ar/velocity?hospital_id=${hospitalId}`),
  ingestDocument: (fields: {
    file: File
    hospital_id: string
    doc_type: string
    carrier_id?: string
    claim_id?: string
    bill_file?: File
  }) => {
    const form = new FormData()
    form.append('file', fields.file)
    form.append('doc_type', fields.doc_type)
    form.append('hospital_id', fields.hospital_id)
    if (fields.carrier_id) form.append('carrier_id', fields.carrier_id)
    if (fields.claim_id) form.append('claim_id', fields.claim_id)
    if (fields.bill_file) form.append('bill_file', fields.bill_file)
    return apiFetchForm<IngestDocumentResponse>('/ingest/document', form)
  },
}
