'use client'

import { Header } from '@/components/layout/header'
import * as React from 'react'
import { SchoolProfileProvider, useSchoolProfile } from '@/context/school-profile-context'
import { DataProvider } from '@/context/data-context'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth, useUser } from '@/firebase'

import {
  BookOpenCheck,
  Briefcase,
  CalendarCheck,
  FileText,
  IndianRupee,
  LayoutDashboard,
  School,
  Users,
  ClipboardList,
  BookCopy,
  Building,
  LogOut,
  Receipt,
  Archive,
  FileCheck,
  ListOrdered,
} from 'lucide-react'

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/students', icon: Users, label: 'Students' },
  { href: '/teachers', icon: Briefcase, label: 'Teachers' },
  { href: '/classes', icon: School, label: 'Classes' },
  { href: '/roster', icon: ListOrdered, label: 'Class Roster' },
  { href: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/teacher-attendance', icon: ClipboardList, label: 'Teacher Muster' },
  { href: '/fees', icon: IndianRupee, label: 'Fees' },
  { href: '/expense', icon: Receipt, label: 'Expense' },
  { href: '/dead-stock', icon: Archive, label: 'Dead Stock' },
  { href: '/exam', icon: FileCheck, label: 'Exam Marksheet' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/reports', icon: BookCopy, label: 'Reports' },
  { href: '/settings', icon: Building, label: 'School Profile' },
]

function AppSidebar() {
  const pathname = usePathname()
  const { schoolProfile } = useSchoolProfile()
  const auth = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            {schoolProfile.logoUrl ? (
            <Image src={schoolProfile.logoUrl} alt={schoolProfile.name} width={32} height={32} className="object-contain rounded-md" />
            ) : (
            <BookOpenCheck className="h-8 w-8 shrink-0 rounded-md bg-primary p-1 text-primary-foreground" />
            )}
            <div className="flex flex-col">
                <span className="font-semibold text-base text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden">
                    {schoolProfile.name}
                </span>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="justify-start"
                  tooltip={{children: item.label}}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
       <SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="justify-start" tooltip={{children: 'Logout'}}>
                <LogOut />
                <span>Logout</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </Sidebar>
  )
}

const MainAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    React.useEffect(() => {
        if (!isUserLoading && !user && isMounted) {
            router.push('/login');
        }
    }, [isUserLoading, user, isMounted, router]);

    if (!isMounted || isUserLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Loading VidyaVerse...</p>
            </div>
        )
    }
    
    return (
        <SchoolProfileProvider>
            <DataProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                    <Header />
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        {children}
                    </main>
                    </SidebarInset>
                </SidebarProvider>
            </DataProvider>
      </SchoolProfileProvider>
    );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // FirebaseClientProvider is now in the root layout
  return (
      <MainAppLayout>
        {children}
      </MainAppLayout>
  )
}
