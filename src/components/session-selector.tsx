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
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-4">
            <h3 className="font-bold text-xl text-gray-900 mb-3">
              {session.title}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <span className="text-lg mr-2">📅</span>
                <span className="font-medium">
                  {format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-lg mr-2">🕐</span>
                <span className="font-medium">
                  {format(new Date(session.session_date), 'h:mm a')} IST
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-lg mr-2">👥</span>
                {session.is_full ? (
                  <span className="text-red-600 font-semibold">Session Full</span>
                ) : (
                  <span className="font-medium">
                    {session.available_seats} seats available
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => onSelectSession(session)}
            disabled={session.is_full}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {session.is_full ? 'Session Full' : 'Select This Session'}
          </Button>
        </div>
      ))}
    </div>
  );
}
