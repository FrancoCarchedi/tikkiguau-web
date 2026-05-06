'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOutIcon, PackageIcon, StoreIcon, PawPrintIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { ChangePasswordDialog } from './change-password-dialog'

type User = {
  id: string
  name: string
  email: string
  image?: string | null
}

const navItems = [
  { title: 'Órdenes', href: '/admin', icon: PackageIcon },
  { title: 'Tiendas', href: '/admin/tiendas', icon: StoreIcon },
]

export function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/admin/sign-in')
          router.refresh()
        },
      },
    })
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2">
          <PawPrintIcon className="size-5 text-primary shrink-0" />
          <span className="font-bold text-base leading-none">TikkiGuau</span>
          <span className="ml-auto text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            CMS
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium leading-tight">
              {user.name}
            </span>
            <span className="truncate text-xs text-muted-foreground leading-tight">
              {user.email}
            </span>
          </div>
          <ChangePasswordDialog />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
          >
            <LogOutIcon />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
