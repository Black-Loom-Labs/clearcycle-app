import { PatientDetailClient } from './patient-detail-client'

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PatientDetailClient patientId={id} />
}
