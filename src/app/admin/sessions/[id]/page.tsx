'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Session } from '@/types/database';

interface SessionWithCount extends Session {
  enrollment_count: number;
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [session, setSession] = useState<SessionWithCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/sessions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      } else {
        router.push('/admin/sessions');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      router.push('/admin/sessions');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchSession();
    }
  }, [params.id, fetchSession]);

  const handleDelete = async () => {
    if (!session) return;

    if (session.enrollment_count > 0) {
      alert(`Cannot delete session with ${session.enrollment_count} enrollments. Cancel it instead.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/sessions/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/admin/sessions');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session');
    } finally {
      setDeleting(false);
    }
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

  const getComputedStatus = (session: Session): Session['status'] => {
    if (session.status === 'cancelled') return 'cancelled';
    
    const now = new Date();
    const sessionDate = new Date(session.session_date);
    const sessionEnd = new Date(sessionDate.getTime() + session.duration_minutes * 60000);
    
    if (now < sessionDate) return 'upcoming';
    if (now >= sessionDate && now < sessionEnd) return 'ongoing';
    return 'completed';
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ongoing':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-lg w-64"></div>
          <div className="h-64 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Session not found</h2>
          <Button onClick={() => router.push('/admin/sessions')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  const computedStatus = getComputedStatus(session);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            onClick={() => router.push('/admin/sessions')}
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
          >
            ← Back to Sessions
          </Button>
          <h1 className="font-instrument-serif text-3xl font-bold mb-2">
            {session.title}
          </h1>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(
                computedStatus
              )}`}
            >
              {computedStatus}
            </span>
            {session.is_free && (
              <span className="text-xs px-3 py-1 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">
                Free
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push(`/admin/sessions/${params.id}/edit`)}
            className="bg-white text-black hover:bg-gray-100"
          >
            Edit Session
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting || session.enrollment_count > 0}
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <h2 className="font-instrument-serif text-xl font-bold mb-4">
              Session Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm mb-1">Date & Time</p>
                <p className="text-white">{formatDate(session.session_date)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Duration</p>
                <p className="text-white">{session.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Price</p>
                <p className="text-white">
                  {session.is_free ? 'Free' : `₹${session.price}`}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Capacity</p>
                <p className="text-white">
                  {session.current_enrollments} / {session.max_capacity}
                </p>
              </div>
            </div>
          </div>

          {/* Zoom Details */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <h2 className="font-instrument-serif text-xl font-bold mb-4">
              Zoom Meeting Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Zoom Link</p>
                <a
                  href={session.zoom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 break-all"
                >
                  {session.zoom_link}
                </a>
              </div>
              {session.zoom_meeting_id && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Meeting ID</p>
                  <p className="text-white font-mono">{session.zoom_meeting_id}</p>
                </div>
              )}
              {session.zoom_passcode && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Passcode</p>
                  <p className="text-white font-mono">{session.zoom_passcode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <h2 className="font-instrument-serif text-xl font-bold mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold text-white">
                  {session.enrollment_count}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Enrollment Rate</p>
                <p className="text-3xl font-bold text-white">
                  {session.max_capacity > 0
                    ? Math.round((session.current_enrollments / session.max_capacity) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Available Seats</p>
                <p className="text-3xl font-bold text-white">
                  {session.max_capacity - session.current_enrollments}
                </p>
              </div>
              {!session.is_free && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Potential Revenue</p>
                  <p className="text-3xl font-bold text-white">
                    ₹{session.enrollment_count * session.price}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <h2 className="font-instrument-serif text-xl font-bold mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/admin/enrollments?session=${params.id}`)}
                variant="outline"
                className="w-full bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
              >
                View Enrollments
              </Button>
              <Button
                onClick={() => window.open(session.zoom_link, '_blank')}
                variant="outline"
                className="w-full bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
              >
                Open Zoom Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
