'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const enrollmentId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enrollmentId) {
      setError('No enrollment ID provided');
      setLoading(false);
      return;
    }

    // In a real implementation, you'd fetch enrollment details here
    // For now, we'll just show a success message
    setLoading(false);
  }, [enrollmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !enrollmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Invalid enrollment'}</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-scale-in">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="font-instrument-serif text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          Enrollment Successful!
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 mb-12">
          You&apos;re enrolled in Spark 101
        </p>

        {/* Simple Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">
            Check your email for the Zoom/Meet link and calendar invite.
            <br />
            <span className="text-gray-500 text-base">
              We&apos;ll send you a reminder 24 hours before the session.
            </span>
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => router.push('/')}
          className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 text-white to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          Back to Home
        </Button>

        {/* Support Note */}
        <p className="text-sm text-gray-400 mt-8">
          Questions?{' '}
          <a
            href="mailto:hello@nxtai101.com"
            className="text-indigo-600 hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
