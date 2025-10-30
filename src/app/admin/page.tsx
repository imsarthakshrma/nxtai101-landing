'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalEnrollments: number;
  totalRevenue: number;
  upcomingSessions: number;
  pendingPayments: number;
}

export default function AdminDashboard() {
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
      });
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    setLoading(false);
  }
};

  const statCards = [
    {
      label: 'Total Enrollments',
      value: stats.totalEnrollments,
      change: '+0%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+0%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      change: '',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPayments,
      change: '',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/5 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-instrument-serif text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                {stat.icon}
              </div>
              {stat.change && (
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="font-instrument-serif text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="font-instrument-serif text-2xl font-bold mb-2">Analytics Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Detailed charts, enrollment trends, and revenue analytics will be available here.
        </p>
      </div>
    </div>
  );
}