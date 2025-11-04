'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DashboardStats {
  totalEnrollments: number;
  totalRevenue: number;
  upcomingSessions: number;
  pendingPayments: number;
  sessionsByType?: {
    spark101: { count: number; enrollments: number; revenue: number };
    framework101: { count: number; enrollments: number; revenue: number };
    summit101: { count: number; enrollments: number; revenue: number };
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrollments: 0,
    totalRevenue: 0,
    upcomingSessions: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/analytics/overview');
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalEnrollments: data.totalEnrollments,
          totalRevenue: data.totalRevenue,
          upcomingSessions: data.upcomingSessions,
          pendingPayments: data.pendingPayments,
          sessionsByType: data.sessionsByType,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/5 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-instrument-serif text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your NXTAI101 sessions</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Enrollments */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-gray-500 mt-1">Successful payments</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">All time earnings</p>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-gray-500 mt-1">Scheduled ahead</p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Session Types Breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Session Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spark 101 */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
                  ⚡
                </div>
                <div>
                  <CardTitle className="text-base">Spark 101</CardTitle>
                  <p className="text-xs text-gray-500">Introduction to AI</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Sessions</span>
                <span className="text-sm font-medium">
                  {stats.sessionsByType?.spark101?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Enrollments</span>
                <span className="text-sm font-medium">
                  {stats.sessionsByType?.spark101?.enrollments || 0}
                </span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Revenue</span>
                <span className="text-sm font-semibold text-purple-400">
                  ₹{(stats.sessionsByType?.spark101?.revenue || 0).toLocaleString()}
                </span>
              </div>
              <Button
                onClick={() => router.push('/admin/sessions?type=spark101')}
                variant="outline"
                size="sm"
                className="w-full bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
              >
                View Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Framework 101 */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                  🔧
                </div>
                <div>
                  <CardTitle className="text-base">Framework 101</CardTitle>
                  <p className="text-xs text-gray-500">AI Frameworks</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Sessions</span>
                <span className="text-sm font-medium">
                  {stats.sessionsByType?.framework101?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Enrollments</span>
                <span className="text-sm font-medium">
                  {stats.sessionsByType?.framework101?.enrollments || 0}
                </span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Revenue</span>
                <span className="text-sm font-semibold text-blue-400">
                  ₹{(stats.sessionsByType?.framework101?.revenue || 0).toLocaleString()}
                </span>
              </div>
              <Button
                onClick={() => router.push('/admin/sessions?type=framework101')}
                variant="outline"
                size="sm"
                className="w-full bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
              >
                View Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Summit 101 */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                  🏔️
                </div>
                <div>
                  <CardTitle className="text-base">Summit 101</CardTitle>
                  <p className="text-xs text-gray-500">Advanced AI</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Sessions</span>
                <span className="text-sm font-medium">
                  {stats.sessionsByType?.summit101?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Enrollments</span>
                <span className="text-sm font-medium">
                  {stats.sessionsByType?.summit101?.enrollments || 0}
                </span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Revenue</span>
                <span className="text-sm font-semibold text-emerald-400">
                  ₹{(stats.sessionsByType?.summit101?.revenue || 0).toLocaleString()}
                </span>
              </div>
              <Button
                onClick={() => router.push('/admin/sessions?type=summit101')}
                variant="outline"
                size="sm"
                className="w-full bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
              >
                View Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => router.push('/admin/sessions/new')}
            variant="outline"
            className="h-auto py-4 flex-col items-start bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
          >
            <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Create Session</span>
            <span className="text-xs text-gray-500 mt-1">Schedule a new session</span>
          </Button>

          <Button
            onClick={() => router.push('/admin/sessions')}
            variant="outline"
            className="h-auto py-4 flex-col items-start bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
          >
            <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">View Sessions</span>
            <span className="text-xs text-gray-500 mt-1">Manage all sessions</span>
          </Button>

          <Button
            onClick={() => router.push('/admin/enrollments')}
            variant="outline"
            className="h-auto py-4 flex-col items-start bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
          >
            <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium">View Enrollments</span>
            <span className="text-xs text-gray-500 mt-1">Check student enrollments</span>
          </Button>

          <Button
            onClick={() => router.push('/admin/analytics')}
            variant="outline"
            className="h-auto py-4 flex-col items-start bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
          >
            <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Analytics</span>
            <span className="text-xs text-gray-500 mt-1">Coming soon</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
