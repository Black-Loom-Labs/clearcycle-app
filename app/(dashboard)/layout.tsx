"use client"

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  UserCheck,
  AlertTriangle,
  Settings,
  Bell,
  Menu,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { HospitalProvider, useHospital } from '@/lib/hospital-context'
import { DEV_MODE } from '@/lib/config'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/claims', label: 'Claims', icon: FileText },
  { href: '/pre-encounter', label: 'Pre-Encounter', icon: UserCheck },
  { href: '/denial-intel', label: 'Denial Intel', icon: AlertTriangle },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function PageTitle() {
  const pathname = usePathname()
  const item = NAV_ITEMS.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + '/')
  )
  return <span className="text-base font-semibold text-[#0A0A0F]">{item?.label ?? 'ClearCycle'}</span>
}

function HospitalSelector() {
  const { hospitalId, setHospitalId, hospitals } = useHospital()
  const current = hospitals.find((h) => h.id === hospitalId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg border border-[#E4E4EF] bg-white px-3 py-1.5 text-sm text-[#0A0A0F] hover:bg-[#F7F8FA]">
        {current?.name ?? 'Select hospital'}
        <ChevronDown className="size-3.5 text-[#5C5C6B]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Hospital</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {hospitals.map((h) => (
            <DropdownMenuItem key={h.id} onClick={() => setHospitalId(h.id)}>
              {h.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-[#E4E4EF] bg-white transition-transform md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center border-b border-[#E4E4EF] px-5">
          <span className="text-lg font-bold text-[#1E6BFF]">ClearCycle</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#EAF2FF] text-[#1E6BFF]'
                    : 'text-[#5C5C6B] hover:bg-[#F7F8FA] hover:text-[#0A0A0F]'
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-3 border-t border-[#E4E4EF] p-4">
          <Avatar>
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-[#0A0A0F]">Dev Admin</span>
            <span className="text-xs text-[#5C5C6B]">Hospital Admin</span>
          </div>
        </div>
      </aside>
    </>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b border-[#E4E4EF] bg-white px-4 md:left-[240px] md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="text-[#5C5C6B] md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <PageTitle />
        </div>
        <div className="flex items-center gap-3">
          {DEV_MODE && <HospitalSelector />}
          <button className="rounded-full p-2 text-[#5C5C6B] hover:bg-[#F7F8FA]">
            <Bell className="size-4.5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar size="sm">
                <AvatarFallback>DA</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Dev Admin</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {DEV_MODE && (
        <div className="fixed top-14 right-0 left-0 z-20 bg-[#1E6BFF] px-4 py-1 text-center text-xs font-medium text-white md:left-[240px]">
          Dev Mode — authentication bypassed
        </div>
      )}

      <main
        className={cn(
          'min-h-screen bg-[#F7F8FA] p-6 md:ml-[240px]',
          DEV_MODE ? 'mt-[calc(3.5rem+1.5rem)]' : 'mt-14'
        )}
      >
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <HospitalProvider>
      <DashboardShell>{children}</DashboardShell>
    </HospitalProvider>
  )
}
