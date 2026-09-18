import { apiFetch as authFetch } from './auth'

// Thrown by apiFetch on any non-OK response. Extends Error so existing
// `.message`-only callers are unaffected; new callers can check `.status`
// (e.g. to special-case a 404 as "not computed yet" rather than a failure).
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await authFetch(path, options)
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.detail ?? ''
    } catch {
      // ignore — no JSON body
    }
    throw new ApiError(detail || `API error ${res.status}`, res.status)
  }
  return res.json()
}

// Multipart requests must NOT set a Content-Type header — the browser needs
// to add its own with the multipart boundary. authFetch skips it automatically
// when the body is FormData.
async function apiFetchForm<T = unknown>(path: string, body: FormData): Promise<T> {
  const res = await authFetch(path, { method: 'POST', body })
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
  // Not present in every API response — only used opportunistically for display.
  patient_name?: string
  treating_doctor_name?: string
  patient_id?: string | null
}

export interface ClaimStatusUpdate {
  claim_id: string
  status: string
  updated_at: string
}

export interface Doctor {
  id: string
  name: string
  phone: string
  speciality?: string
  registration_number?: string
  status: 'enabled' | 'disabled'
}

export interface WorkflowInitiateResult {
  claim_id: string
  status: string
  doctor_name?: string
}

export interface WorkflowBillingEdit {
  item: string
  original_amount: number
  revised_amount: number
  reason: string
}

export interface WorkflowRiskWarning {
  severity: string
  message: string
  action?: string
}

export interface ConsolidatedDraftReview {
  status?: 'approved' | 'rejected' | string
  doctor_name?: string
  reviewed_at?: string
  notes?: string
  coding_edits?: unknown[]
  financial_edits?: WorkflowBillingEdit[]
}

export interface ConsolidatedDraft {
  doctor_review?: ConsolidatedDraftReview
  billing_review?: ConsolidatedDraftReview
  risk_score?: number
  risk_warnings?: WorkflowRiskWarning[]
  required_docs?: string[]
}

export interface WorkflowResult {
  id: string
  claim_id: string
  status?: string
  doctor_status?: 'pending' | 'approved' | 'rejected' | string
  doctor_name?: string
  doctor_notes?: string
  doctor_reviewed_at?: string
  billing_status?: 'pending' | 'approved' | 'rejected' | string
  billing_decision?: 'approved' | 'rejected' | string
  billing_notes?: string
  billing_edits?: WorkflowBillingEdit[]
  billing_reviewed_at?: string
  admin_status?: 'pending' | 'approved' | 'rejected' | string
  admin_notes?: string
  admin_reviewed_at?: string
  consolidated_draft?: ConsolidatedDraft
  [key: string]: unknown
}

export interface AuditTrailEvent {
  id: string
  event_type: string
  actor_type: 'system' | 'doctor' | 'billing_staff' | 'admin' | 'tpa_portal' | string
  actor_name: string | null
  notes: string | null
  previous_state: Record<string, unknown>
  new_state: Record<string, unknown>
  changes: unknown[]
  created_at: string
}

export interface AuditTrailResponse {
  events: AuditTrailEvent[]
  total: number
}

export interface DocumentVersion {
  id: string
  document_type: string
  version_number: number
  created_at: string
  created_by_name?: string | null
  change_reason?: string | null
  is_current: boolean
  content: unknown
}

export interface DocumentVersionsResponse {
  versions: DocumentVersion[]
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

export interface InsurancePolicy {
  carrier_id: string
  policy_number: string
  plan_name: string
  sum_insured_inr: number
  sum_insured_used_inr: number
  room_category: string
  room_rent_limit_inr: number
  policy_start_date: string
  policy_end_date: string
  copay_pct: number
  pre_existing_conditions: string[]
  pre_auth_required_above_inr: number
  active: boolean
}

export interface Patient {
  patient_id: string
  hospital_id: string
  external_id: string | null
  name: string
  dob: string | null
  insurance_policies: InsurancePolicy[]
  active_policies: number
  created_at: string
}

// The API omits insurance_policies (rather than sending []) for patients
// with none on file — normalize so callers can always safely map/filter it.
function normalizePatient(patient: Patient): Patient {
  return { ...patient, insurance_policies: patient.insurance_policies ?? [] }
}

export interface PatientsListResponse {
  patients: Patient[]
  total: number
}

export interface CsvImportResult {
  batch_id: string
  records_received: number
  records_queued: number
  records_failed: number
  failures: Array<{ index: number; errors: string[] }>
}

export interface CarrierSetting {
  carrier_id: string
  submission_mode: 'manual_assist' | 'semi_autonomous' | 'fully_autonomous'
  portal_credentials_stored: boolean
  enabled: boolean
  updated_at: string
}

export interface PatientClaimsResponse {
  claims: Claim[]
  total: number
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

export interface FinancialSplitDeduction {
  category: string
  amount_inr: number
  items: string[]
  collectable_from_patient: boolean
  reason: string
}

export interface FinancialSplit {
  total_billed_inr: number
  insurer_pays_inr: number
  patient_pays_inr: number
  copay_inr: number
  patient_liability_pct: number
  requires_manager_review: boolean
  front_desk_message: string
  deduction_breakdown: FinancialSplitDeduction[]
}

export interface PayerPersonaWarning {
  severity: 'high' | 'medium' | string
  code: string
  message: string
  action: string
  required_docs: string[]
}

export interface PayerPersonaScrubResult {
  overall_risk_score: number
  persona_matches: number
  message: string
  warnings: PayerPersonaWarning[]
}

export interface PayerPersonaCommonReason {
  reason: string
  frequency: number
}

export interface PayerPersonaProfile {
  carrier_id: string
  icd_codes: string[]
  cpt_codes: string[]
  rejection_rate: number
  sample_size: number
  top_rejection_reason: string
  required_docs: string[]
  common_reasons: PayerPersonaCommonReason[]
  // Optional: not guaranteed by backend yet, present when available
  avg_settlement_days?: number
  total_deducted_inr?: number
  previous_rejection_rate?: number
  policy_excluded_reasons?: string[]
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
  updateCoding: (
    claimId: string,
    body: {
      diagnoses: CodingDiagnosis[]
      procedures: CodingProcedure[]
      notes: string
      action: 'approve'
    }
  ) =>
    apiFetch<Claim>(`/claims/${claimId}/coding`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  requestRecode: (claimId: string) =>
    apiFetch<{ status: string }>(`/claims/${claimId}/recode`, { method: 'POST' }),
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
  downloadCsvTemplate: async (): Promise<void> => {
    const res = await authFetch('/ingest/csv/template')
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clearcycle_claims_template.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
  importCsv: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiFetchForm<CsvImportResult>('/ingest/csv', form)
  },
  getCarrierSettings: () => apiFetch<CarrierSetting[]>('/settings/carriers'),
  updateCarrierSetting: (
    carrierId: string,
    data: Partial<Pick<CarrierSetting, 'submission_mode' | 'enabled'>>
  ) =>
    apiFetch<CarrierSetting>(`/settings/carriers/${carrierId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
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
    patient_id?: string
  }) => {
    const form = new FormData()
    form.append('file', fields.file)
    form.append('doc_type', fields.doc_type)
    form.append('hospital_id', fields.hospital_id)
    if (fields.carrier_id) form.append('carrier_id', fields.carrier_id)
    if (fields.claim_id) form.append('claim_id', fields.claim_id)
    if (fields.bill_file) form.append('bill_file', fields.bill_file)
    if (fields.patient_id) form.append('patient_id', fields.patient_id)
    return apiFetchForm<IngestDocumentResponse>('/ingest/document', form)
  },
  getClaim: (claimId: string) => apiFetch<Claim>(`/claims/${claimId}`),
  getClaimSplit: (claimId: string) => apiFetch<FinancialSplit>(`/claims/${claimId}/split`),
  updateClaimStatus: (
    claimId: string,
    body: { status: string; notes?: string; tpa_reference?: string }
  ) =>
    apiFetch<ClaimStatusUpdate>(`/claims/${claimId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  scrubPayerPersona: (body: {
    claim_id: string
    carrier_id: string
    icd_codes: string[]
    cpt_codes: string[]
  }) =>
    apiFetch<PayerPersonaScrubResult>('/payer-persona/scrub', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getPayerPersonaProfiles: (carrierId?: string) =>
    apiFetch<{ profiles: PayerPersonaProfile[]; total: number }>(
      `/payer-persona/profiles${carrierId ? `?carrier_id=${carrierId}` : ''}`
    ),
  rebuildPayerPersonaProfiles: () =>
    apiFetch<{ status?: string }>('/payer-persona/rebuild', { method: 'POST' }),
  getDoctors: (search?: string) =>
    apiFetch<{ doctors: Doctor[] }>(`/doctors${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createDoctor: (body: { name: string; phone: string; speciality?: string; registration_number?: string }) =>
    apiFetch<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(body) }),
  updateDoctor: (
    doctorId: string,
    body: { name?: string; phone?: string; speciality?: string; registration_number?: string }
  ) => apiFetch<Doctor>(`/doctors/${doctorId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  disableDoctor: (doctorId: string) => apiFetch<void>(`/doctors/${doctorId}`, { method: 'DELETE' }),
  initiateWorkflow: (body: {
    claim_id: string
    doctor_id?: string
    doctor_name?: string
    doctor_phone?: string
    doctor_speciality?: string
    save_doctor_to_directory?: boolean
    notes?: string
  }) =>
    apiFetch<WorkflowInitiateResult>('/workflows/initiate', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getWorkflow: (claimId: string) => apiFetch<WorkflowResult>(`/claims/${claimId}/workflow`),
  submitBillingReview: (
    workflowId: string,
    body: { decision: 'approved' | 'rejected'; notes: string; edits: WorkflowBillingEdit[] }
  ) =>
    apiFetch<void>(`/workflows/${workflowId}/billing-review`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  submitAdminReview: (workflowId: string, body: { decision: 'approved' | 'rejected'; notes: string }) =>
    apiFetch<void>(`/workflows/${workflowId}/admin-review`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getAuditTrail: (claimId: string) => apiFetch<AuditTrailResponse>(`/claims/${claimId}/audit-trail`),
  getDocumentVersions: (claimId: string) =>
    apiFetch<DocumentVersionsResponse>(`/claims/${claimId}/versions`),
  getPatients: (search?: string) =>
    apiFetch<PatientsListResponse>(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(
      (res) => ({ ...res, patients: (res.patients ?? []).map(normalizePatient) })
    ),
  getPatient: (id: string) => apiFetch<Patient>(`/patients/${id}`).then(normalizePatient),
  createPatient: (body: {
    hospital_id: string
    name: string
    dob: string
    external_id?: string
    insurance_policies?: Omit<InsurancePolicy, 'sum_insured_used_inr' | 'active'>[]
  }) =>
    apiFetch<Patient>('/patients', { method: 'POST', body: JSON.stringify(body) }).then(normalizePatient),
  updatePatientPolicy: (id: string, policy: Omit<InsurancePolicy, 'sum_insured_used_inr' | 'active'>) =>
    apiFetch<Patient>(`/patients/${id}/policy`, { method: 'PUT', body: JSON.stringify(policy) }).then(
      normalizePatient
    ),
  getPatientClaims: (id: string) => apiFetch<PatientClaimsResponse>(`/patients/${id}/claims`),
  runPreEncounterCheck: (body: {
    hospital_id: string
    patient_id: string
    carrier_id: string
    admission_date: string
    proposed_icd_codes?: string[]
    proposed_cpt_codes?: string[]
    estimated_cost_inr?: number
  }) =>
    apiFetch<PreEncounterResult>('/pre-encounter/check', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
