'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Session, SessionType, SESSION_TYPE_CONFIG } from '@/types/database';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<SessionType | 'all'>('all');

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

  const getComputedStatus = (session: Session): Session['status'] => {
    if (session.status === 'cancelled') return 'cancelled';
    
    const now = new Date();
    const sessionDate = new Date(session.session_date);
    const sessionEnd = new Date(sessionDate.getTime() + session.duration_minutes * 60000);
    
    if (now < sessionDate) return 'upcoming';
    if (now >= sessionDate && now < sessionEnd) return 'ongoing';
    return 'completed';
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const computedStatus = getComputedStatus(session);
    const matchesStatus = statusFilter === 'all' || computedStatus === statusFilter;
    const matchesType = selectedType === 'all' || session.session_type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getSessionsByType = (type: SessionType) => {
    return filteredSessions.filter(s => s.session_type === type);
  };

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

  const getStatusBadge = (session: Session) => {
    const status = getComputedStatus(session);
    const variants: Record<string, { className: string; label: string }> = {
      upcoming: { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Upcoming' },
      ongoing: { className: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Live' },
      completed: { className: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Completed' },
      cancelled: { className: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Cancelled' },
    };
    
    const config = variants[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeColor = (type: SessionType) => {
    const colors = {
      spark101: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
      framework101: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      summit101: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    };
    return colors[type];
  };

  const SessionCard = ({ session }: { session: Session }) => {
    const config = SESSION_TYPE_CONFIG[session.session_type];
    
    return (
      <div className={`bg-gradient-to-br ${getTypeColor(session.session_type)} border rounded-xl p-6 hover:scale-[1.02] transition-all duration-200`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{config.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-instrument-serif text-lg font-bold text-white">
                  {session.title}
                </h3>
                {session.is_free && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    Free
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">{config.name}</p>
            </div>
          </div>
          {getStatusBadge(session)}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Date & Time</p>
            <p className="text-sm text-gray-300">{formatDate(session.session_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Duration</p>
            <p className="text-sm text-gray-300">{session.duration_minutes} mins</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-sm text-gray-300">
              {session.is_free ? 'Free' : `₹${session.price}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Enrollments</p>
            <p className="text-sm text-gray-300">
              {session.current_enrollments} / {session.max_capacity}
            </p>
          </div>
        </div>

        {/* Enrollment Stats */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-black/20 rounded-lg">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Capacity</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                  style={{ width: `${(session.current_enrollments / session.max_capacity) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {Math.round((session.current_enrollments / session.max_capacity) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push(`/admin/sessions/${session.id}`)}
            variant="outline"
            size="sm"
            className="flex-1 bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
          >
            View Details
          </Button>
          <Button
            onClick={() => router.push(`/admin/sessions/${session.id}/edit`)}
            variant="outline"
            size="sm"
            className="flex-1 bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
          >
            Edit
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white/5 rounded-xl"></div>
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-instrument-serif text-3xl font-bold mb-2">Sessions</h1>
            <p className="text-gray-400">Manage all your NXTAI101 sessions</p>
          </div>
          <Button
            onClick={() => router.push('/admin/sessions/new')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
            <p className="text-2xl font-bold">{sessions.length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Spark 101</p>
            <p className="text-2xl font-bold text-purple-400">
              {sessions.filter(s => s.session_type === 'spark101').length}
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Framework 101</p>
            <p className="text-2xl font-bold text-blue-400">
              {sessions.filter(s => s.session_type === 'framework101').length}
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Summit 101</p>
            <p className="text-2xl font-bold text-emerald-400">
              {sessions.filter(s => s.session_type === 'summit101').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Search</label>
            <Input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.03] border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all" className="text-white focus:bg-white/10">All Status</SelectItem>
                <SelectItem value="upcoming" className="text-white focus:bg-white/10">Upcoming</SelectItem>
                <SelectItem value="ongoing" className="text-white focus:bg-white/10">Ongoing</SelectItem>
                <SelectItem value="completed" className="text-white focus:bg-white/10">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-white focus:bg-white/10">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Session Type</label>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
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

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-instrument-serif text-xl font-medium mb-2">No sessions found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your filters or create a new session</p>
          <Button
            onClick={() => router.push('/admin/sessions/new')}
            variant="outline"
            className="border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
          >
            Create Session
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
