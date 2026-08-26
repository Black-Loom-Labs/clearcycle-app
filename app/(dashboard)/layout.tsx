"use client"

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
import { ToastProvider } from '@/components/toast'
import { HospitalProvider, useHospital } from '@/lib/hospital-context'
import { DEV_MODE } from '@/lib/config'
import { clearTokens, getUserFromToken } from '@/lib/auth'
import { canAccessRoute, getCurrentRole, type Role } from '@/lib/roles'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/claims', label: 'Claims', icon: FileText },
  { href: '/pre-encounter', label: 'Pre-Encounter', icon: UserCheck },
  { href: '/denial-intel', label: 'Denial Intel', icon: AlertTriangle },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const ROLE_LABELS: Record<Role, string> = {
  read_only: 'Read Only',
  billing_staff: 'Billing Staff',
  admin: 'Hospital Admin',
}

function initialsFrom(value: string): string {
  const parts = value.split(/[\s@.]+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

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

function Sidebar({
  open,
  onClose,
  role,
  userName,
  roleLabel,
  initials,
}: {
  open: boolean
  onClose: () => void
  role: Role
  userName: string
  roleLabel: string
  initials: string
}) {
  const pathname = usePathname()
  const navItems = NAV_ITEMS.filter((item) => canAccessRoute(role, item.href))

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
        <div className="flex items-center border-b border-[#E4E4EF] px-4 py-4">
          <Image src="/logo.svg" alt="ClearCycle" width={160} height={40} priority />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
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
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-[#0A0A0F]">{userName}</span>
            <span className="text-xs text-[#5C5C6B]">{roleLabel}</span>
          </div>
        </div>
      </aside>
    </>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  // DEV_MODE is a build-time constant, so this initial value is identical on
  // the server and first client render — no hydration mismatch. Real,
  // token-derived user info only exists in the browser, so it's filled in
  // after mount below.
  const [role, setRole] = React.useState<Role>(DEV_MODE ? 'admin' : 'read_only')
  const [displayUser, setDisplayUser] = React.useState({
    name: DEV_MODE ? 'Dev Admin' : '',
    roleLabel: DEV_MODE ? ROLE_LABELS.admin : '',
    initials: DEV_MODE ? 'DA' : '?',
  })

  React.useEffect(() => {
    if (DEV_MODE) return
    const currentRole = getCurrentRole()
    setRole(currentRole)
    const user = getUserFromToken()
    if (user) {
      const name = user.name || user.email || 'User'
      setDisplayUser({
        name,
        roleLabel: ROLE_LABELS[currentRole],
        initials: initialsFrom(name),
      })
    }
  }, [])

  // Redirect away from routes the current role isn't allowed to see.
  React.useEffect(() => {
    if (DEV_MODE) return
    if (!canAccessRoute(role, pathname)) {
      router.replace('/dashboard')
    }
  }, [role, pathname, router])

  function handleSignOut() {
    clearTokens()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
        userName={displayUser.name}
        roleLabel={displayUser.roleLabel}
        initials={displayUser.initials}
      />

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
                <AvatarFallback>{displayUser.initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{displayUser.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
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
      <ToastProvider>
        <DashboardShell>{children}</DashboardShell>
      </ToastProvider>
    </HospitalProvider>
  )
}
