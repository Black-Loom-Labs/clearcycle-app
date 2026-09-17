"use client"

import { Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useHospital } from '@/lib/hospital-context'
import { DoctorsTab } from './doctors-tab'
import { TpaSubmissionTab } from './tpa-submission-tab'

export default function SettingsPage() {
  const { hospitalId, hospitals } = useHospital()
  const current = hospitals.find((h) => h.id === hospitalId)

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="tpa-submission">TPA Submission</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card className="border-[#E4E4EF]">
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
              <Settings className="size-8 text-[#5C5C6B]" />
              <p className="font-medium text-[#0A0A0F]">Hospital Settings</p>
              <p className="text-sm text-[#5C5C6B]">
                Settings for {current?.name ?? 'this hospital'} are coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="doctors">
          <DoctorsTab />
        </TabsContent>
        <TabsContent value="tpa-submission">
          <TpaSubmissionTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
