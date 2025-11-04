'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SessionType, SESSION_TYPE_CONFIG } from '@/types/database';

interface EnrollmentDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  linkedin_url: string | null;
  session_id: string;
  session_title: string;
  session_date: string;
  session_type: SessionType;
  amount_paid: number;
  currency: string;
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  enrolled_at: string;
  email_sent: boolean;
  email_sent_at: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export default function EnrollmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnrollment = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/enrollments/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
      } else {
        router.push('/admin/enrollments');
      }
    } catch (error) {
      console.error('Failed to fetch enrollment:', error);
      router.push('/admin/enrollments');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchEnrollment();
    }
  }, [params.id, fetchEnrollment]);

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
      refunded: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSessionTypeBadge = (type: SessionType) => {
    const config = SESSION_TYPE_CONFIG[type];
    const colors = {
      spark101: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      framework101: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      summit101: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    
    return (
      <Badge variant="outline" className={colors[type]}>
        {config.icon} {config.name}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-lg w-64"></div>
          <div className="h-96 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-400">Enrollment not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-instrument-serif text-3xl font-bold mb-1">Enrollment Details</h1>
          <p className="text-sm text-gray-500">View enrollment information</p>
        </div>
        <Button
          onClick={() => router.push('/admin/enrollments')}
          variant="outline"
          className="bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
        >
          ← Back to Enrollments
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <p className="text-white font-medium">{enrollment.name}</p>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-white">{enrollment.email}</p>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <label className="text-sm text-gray-400">Phone</label>
              <p className="text-white">{enrollment.phone}</p>
            </div>
            {enrollment.company && (
              <>
                <Separator className="bg-white/5" />
                <div>
                  <label className="text-sm text-gray-400">Company</label>
                  <p className="text-white">{enrollment.company}</p>
                </div>
              </>
            )}
            {enrollment.linkedin_url && (
              <>
                <Separator className="bg-white/5" />
                <div>
                  <label className="text-sm text-gray-400">LinkedIn</label>
                  <a
                    href={enrollment.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    View Profile
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Session Information */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Session Title</label>
              <p className="text-white font-medium">{enrollment.session_title}</p>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <label className="text-sm text-gray-400">Session Type</label>
              <div className="mt-1">{getSessionTypeBadge(enrollment.session_type)}</div>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <label className="text-sm text-gray-400">Session Date</label>
              <p className="text-white">{formatDate(enrollment.session_date)}</p>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <label className="text-sm text-gray-400">Enrolled At</label>
              <p className="text-white">{formatDate(enrollment.enrolled_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Amount Paid</label>
              <p className="text-white font-medium text-xl">
                ₹{(enrollment.amount_paid / 100).toLocaleString('en-IN')}
              </p>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <label className="text-sm text-gray-400">Payment Status</label>
              <div className="mt-1">{getStatusBadge(enrollment.payment_status)}</div>
            </div>
            <Separator className="bg-white/5" />
            <div>
              <label className="text-sm text-gray-400">Razorpay Order ID</label>
              <p className="text-white font-mono text-sm">{enrollment.razorpay_order_id}</p>
            </div>
            {enrollment.razorpay_payment_id && (
              <>
                <Separator className="bg-white/5" />
                <div>
                  <label className="text-sm text-gray-400">Razorpay Payment ID</label>
                  <p className="text-white font-mono text-sm">{enrollment.razorpay_payment_id}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Email & Marketing Information */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Email & Marketing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Confirmation Email</label>
              <div className="mt-1">
                {enrollment.email_sent ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                    ✓ Sent
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            {enrollment.email_sent_at && (
              <>
                <Separator className="bg-white/5" />
                <div>
                  <label className="text-sm text-gray-400">Email Sent At</label>
                  <p className="text-white">{formatDate(enrollment.email_sent_at)}</p>
                </div>
              </>
            )}
            {(enrollment.utm_source || enrollment.utm_medium || enrollment.utm_campaign) && (
              <>
                <Separator className="bg-white/5" />
                <div>
                  <label className="text-sm text-gray-400">UTM Parameters</label>
                  <div className="mt-2 space-y-1">
                    {enrollment.utm_source && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Source:</span> {enrollment.utm_source}
                      </p>
                    )}
                    {enrollment.utm_medium && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Medium:</span> {enrollment.utm_medium}
                      </p>
                    )}
                    {enrollment.utm_campaign && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Campaign:</span> {enrollment.utm_campaign}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
