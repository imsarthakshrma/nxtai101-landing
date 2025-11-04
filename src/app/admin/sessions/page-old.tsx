'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Session } from '@/types/database';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Compute session status based on date and time
  const getComputedStatus = (session: Session): Session['status'] => {
    // If manually cancelled, always show cancelled
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
          <div className="h-8 bg-white/5 rounded-lg w-48"></div>
          <div className="h-12 bg-white/5 rounded-xl w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-instrument-serif text-3xl font-bold mb-2">Sessions</h1>
          <p className="text-gray-400">Manage your Spark 101 sessions</p>
        </div>
        <Button
          onClick={() => router.push('/admin/sessions/new')}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-11 px-6 rounded-xl"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
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
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500 rounded-xl"
          />
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-instrument-serif text-xl font-bold mb-2">No sessions found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery ? 'Try a different search term' : 'Get started by creating your first session'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push('/admin/sessions/new')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Create Session
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const computedStatus = getComputedStatus(session);
            return (
              <div
                key={session.id}
                className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-instrument-serif text-xl font-bold">{session.title}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(
                          computedStatus
                        )}`}
                      >
                        {computedStatus}
                      </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Date & Time</p>
                      <p className="text-gray-300">{formatDate(session.session_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Price</p>
                      <p className="text-gray-300">₹{session.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Capacity</p>
                      <p className="text-gray-300">
                        {session.current_enrollments} / {session.max_capacity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Enrollment Rate</p>
                      <p className="text-gray-300">
                        {session.max_capacity > 0
                          ? `${Math.round((session.current_enrollments / session.max_capacity) * 100)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <Button
                    onClick={() => router.push(`/admin/sessions/${session.id}`)}
                    variant="outline"
                    className="bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg h-9"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => router.push(`/admin/sessions/${session.id}/edit`)}
                    variant="outline"
                    className="bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg h-9"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}