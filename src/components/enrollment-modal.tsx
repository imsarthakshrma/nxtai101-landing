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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedSession ? 'Complete Your Enrollment' : 'Select a Session'}
          </DialogTitle>
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
