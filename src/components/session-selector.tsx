'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Session } from '@/types/database';

interface SessionWithAvailability extends Session {
  available_seats: number;
  is_full: boolean;
}

interface SessionSelectorProps {
  onSelectSession: (session: SessionWithAvailability) => void;
}

export function SessionSelector({ onSelectSession }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<SessionWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch('/api/sessions/available');
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      setSessions(data.sessions);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading available sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchSessions} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No upcoming sessions available.</p>
        <p className="text-sm text-gray-500 mt-2">Check back soon for new dates!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="border border-gray-200 rounded-lg p-6 hover:border-indigo-400 transition-colors"
        >
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {session.title}
          </h3>
          <p className="text-gray-600 mb-1">
            📅 {format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-gray-600 mb-3">
            🕐 {format(new Date(session.session_date), 'h:mm a')} IST
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {session.is_full ? (
              <span className="text-red-600 font-medium">Session Full</span>
            ) : (
              <span>
                {session.available_seats} seats available (out of {session.max_capacity})
              </span>
            )}
          </p>
          <Button
            onClick={() => onSelectSession(session)}
            disabled={session.is_full}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {session.is_full ? 'Full' : 'Select This Session'}
          </Button>
        </div>
      ))}
    </div>
  );
}
