'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AdminUser } from '@/lib/admin-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          // Redirect to password change if required (except if already on that page)
          if (data.user.must_change_password && pathname !== '/admin/change-password') {
            router.push('/admin/change-password');
          }
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    if (pathname !== '/admin/login') {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always redirect to login, even if logout API fails
      router.push('/admin/login');
    }
  };

  // Show loading or login page
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return children;
  }

  if (!user) {
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Sessions',
      href: '/admin/sessions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Enrollments',
      href: '/admin/enrollments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      comingSoon: true,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-inter flex w-full">
        {/* Sidebar */}
        <Sidebar className="border-r border-white/5 bg-white/[0.02] backdrop-blur-xl">
          {/* Logo Header */}
          <SidebarHeader className="p-6 border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
              {/* <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/images/trans-logo.png"
                  alt="NXTAI101 Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div> */}
              <div className="flex flex-1 justify-center">
                <Image
                  src="/images/typo-logo.png"
                  alt="NXTAI101"
                  width={100}
                  height={20}
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
            <p className="text-xs text-gray-500 mt-2 pl-[52px]">Admin Dashboard</p>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    // Special handling for Dashboard to avoid matching other /admin/* routes
                    const isActive = item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          disabled={item.comingSoon}
                          className={`
                            ${isActive 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/15 hover:text-purple-300' 
                              : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                            }
                            ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <Link href={item.comingSoon ? '#' : item.href} className="flex items-center gap-3 w-full">
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                            {item.comingSoon && (
                              <span className="ml-auto text-xs bg-white/5 px-2 py-0.5 rounded-full">
                                Soon
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User Profile */}
          <SidebarFooter className="p-4 border-t border-white/5">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </Button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
