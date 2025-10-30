'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  session_id: string;
  session_title: string;
  session_date: string;
  amount_paid: number;
  payment_status: string;
  razorpay_payment_id: string | null;
  enrolled_at: string;
  email_sent: boolean;
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/admin/enrollments');
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || enrollment.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const stats = {
    total: enrollments.length,
    success: enrollments.filter((e) => e.payment_status === 'success').length,
    pending: enrollments.filter((e) => e.payment_status === 'pending').length,
    failed: enrollments.filter((e) => e.payment_status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-lg w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
            ))}
          </div>
          <div className="h-12 bg-white/5 rounded-xl w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
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
        <h1 className="font-instrument-serif text-3xl font-bold mb-2">Enrollments</h1>
        <p className="text-gray-400">View and manage all enrollments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total</p>
          <p className="font-instrument-serif text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Successful</p>
          <p className="font-instrument-serif text-2xl font-bold text-green-400">{stats.success}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Pending</p>
          <p className="font-instrument-serif text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Failed</p>
          <p className="font-instrument-serif text-2xl font-bold text-red-400">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500 rounded-xl"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 px-4 bg-white/[0.03] border border-white/10 text-white rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <Button
          onClick={() => {/* TODO: Export CSV */}}
          variant="outline"
          className="h-12 px-6 bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-xl"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Enrollments Table */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="font-instrument-serif text-xl font-bold mb-2">No enrollments found</h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Enrollments will appear here once users sign up'}
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr className="text-left">
                  <th className="p-4 text-sm font-medium text-gray-400">Name</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Email</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Session</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Enrolled</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{enrollment.name}</p>
                        <p className="text-sm text-gray-500">{enrollment.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{enrollment.email}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium">{enrollment.session_title}</p>
                        <p className="text-xs text-gray-500">{formatDate(enrollment.session_date)}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">₹{enrollment.amount_paid / 100}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(
                          enrollment.payment_status
                        )}`}
                      >
                        {enrollment.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{formatDate(enrollment.enrolled_at)}</td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs text-gray-400 hover:text-white"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}