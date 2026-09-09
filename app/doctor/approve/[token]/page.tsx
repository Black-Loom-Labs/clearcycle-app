import { DoctorApproveClient } from './doctor-approve-client'

export default async function DoctorApprovePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <DoctorApproveClient token={token} />
}
