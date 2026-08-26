import { ClaimDetailClient } from './claim-detail-client'

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ClaimDetailClient claimId={id} />
}
