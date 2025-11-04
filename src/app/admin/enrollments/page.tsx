'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SessionType, SESSION_TYPE_CONFIG } from '@/types/database';

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  session_id: string;
  session_title: string;
  session_date: string;
  session_type?: SessionType; // Optional until migration is run
  amount_paid: number;
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  razorpay_payment_id: string | null;
  enrolled_at: string;
  email_sent: boolean;
}

export default function EnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');

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
      enrollment.phone.includes(searchQuery) ||
      enrollment.session_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || enrollment.payment_status === statusFilter;

    const matchesType =
      typeFilter === 'all' || enrollment.session_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      success: { className: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Success' },
      pending: { className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Pending' },
      failed: { className: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Failed' },
      refunded: { className: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Refunded' },
    };
    
    const config = variants[status] || variants.pending;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getSessionTypeBadge = (type: SessionType | undefined) => {
    // Default to spark101 if type is undefined
    const sessionType = type || 'spark101';
    const config = SESSION_TYPE_CONFIG[sessionType];
    const colors = {
      spark101: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      framework101: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      summit101: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    
    return (
      <Badge variant="outline" className={colors[sessionType]}>
        {config.icon} {config.name}
      </Badge>
    );
  };

  const getStatsByType = (type: SessionType) => {
    const typeEnrollments = enrollments.filter(e => e.session_type === type);
    const successCount = typeEnrollments.filter(e => e.payment_status === 'success').length;
    const revenue = typeEnrollments
      .filter(e => e.payment_status === 'success')
      .reduce((sum, e) => sum + e.amount_paid, 0);
    
    return { count: successCount, revenue: revenue / 100 };
  };

  const stats = {
    total: enrollments.length,
    success: enrollments.filter((e) => e.payment_status === 'success').length,
    pending: enrollments.filter((e) => e.payment_status === 'pending').length,
    failed: enrollments.filter((e) => e.payment_status === 'failed').length,
    revenue: enrollments
      .filter((e) => e.payment_status === 'success')
      .reduce((sum, e) => sum + e.amount_paid, 0) / 100,
    spark101: getStatsByType('spark101'),
    framework101: getStatsByType('framework101'),
    summit101: getStatsByType('summit101'),
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
          <div className="h-96 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-instrument-serif text-3xl font-bold mb-2">Enrollments</h1>
            <p className="text-gray-400">Manage all student enrollments across sessions</p>
          </div>
          <Button
            onClick={() => {/* TODO: Export CSV */}}
            variant="outline"
            className="bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.05]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Total Enrollments</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-400">{stats.success}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-400">₹{stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Session Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <p className="text-sm text-gray-400">Spark 101</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.spark101.count}</p>
            <p className="text-sm text-gray-500 mt-1">₹{stats.spark101.revenue.toLocaleString()} revenue</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔧</span>
              <p className="text-sm text-gray-400">Framework 101</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.framework101.count}</p>
            <p className="text-sm text-gray-500 mt-1">₹{stats.framework101.revenue.toLocaleString()} revenue</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏔️</span>
              <p className="text-sm text-gray-400">Summit 101</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.summit101.count}</p>
            <p className="text-sm text-gray-500 mt-1">₹{stats.summit101.revenue.toLocaleString()} revenue</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Search</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search by name, email, phone, session..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.03] border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Payment Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all" className="text-white focus:bg-white/10">All Status</SelectItem>
                <SelectItem value="success" className="text-white focus:bg-white/10">Success</SelectItem>
                <SelectItem value="pending" className="text-white focus:bg-white/10">Pending</SelectItem>
                <SelectItem value="failed" className="text-white focus:bg-white/10">Failed</SelectItem>
                <SelectItem value="refunded" className="text-white focus:bg-white/10">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Session Type</label>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all" className="text-white focus:bg-white/10">All Types</SelectItem>
                <SelectItem value="spark101" className="text-white focus:bg-white/10">⚡ Spark 101</SelectItem>
                <SelectItem value="framework101" className="text-white focus:bg-white/10">🔧 Framework 101</SelectItem>
                <SelectItem value="summit101" className="text-white focus:bg-white/10">🏔️ Summit 101</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-instrument-serif text-xl font-medium mb-2">No enrollments found</h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Enrollments will appear here once users sign up'}
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="text-gray-400">Student</TableHead>
                <TableHead className="text-gray-400">Contact</TableHead>
                <TableHead className="text-gray-400">Session</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Enrolled</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{enrollment.name}</p>
                      <p className="text-sm text-gray-500">{enrollment.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {enrollment.email}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-white">{enrollment.session_title}</p>
                      <p className="text-xs text-gray-500">{formatDate(enrollment.session_date)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSessionTypeBadge(enrollment.session_type)}
                  </TableCell>
                  <TableCell className="text-sm text-white font-medium">
                    ₹{(enrollment.amount_paid / 100).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(enrollment.payment_status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {formatDate(enrollment.enrolled_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/enrollments/${enrollment.id}`)}
                      className="text-gray-400 hover:text-white"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Results Count */}
      {filteredEnrollments.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {filteredEnrollments.length} of {enrollments.length} enrollments
        </div>
      )}
    </div>
  );
}
