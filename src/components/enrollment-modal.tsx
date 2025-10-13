'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SessionSelector } from './session-selector';
import { EnrollmentForm } from './enrollment-form';
import type { Session } from '@/types/database';

interface SessionWithAvailability extends Session {
  available_seats: number;
  is_full: boolean;
}

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (enrollmentId: string) => void;
}

export function EnrollmentModal({ open, onOpenChange, onSuccess }: EnrollmentModalProps) {
  const [selectedSession, setSelectedSession] = useState<SessionWithAvailability | null>(null);

  function handleSessionSelect(session: SessionWithAvailability) {
    setSelectedSession(session);
  }

  function handleBack() {
    setSelectedSession(null);
  }

  function handleSuccess(enrollmentId: string) {
    setSelectedSession(null);
    onOpenChange(false);
    onSuccess(enrollmentId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-3xl font-bold text-gray-900">
            {selectedSession ? 'Complete Your Enrollment' : 'Select a Session'}
          </DialogTitle>
          {!selectedSession && (
            <p className="text-gray-600 mt-2">Choose your preferred session time</p>
          )}
        </DialogHeader>

        {!selectedSession ? (
          <SessionSelector onSelectSession={handleSessionSelect} />
        ) : (
          <EnrollmentForm
            session={selectedSession}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
