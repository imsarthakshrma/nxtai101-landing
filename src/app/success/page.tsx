'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🎉 Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You&apos;re enrolled in Spark 101
            </p>

            {/* Confirmation Details */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-indigo-900 mb-4 text-center">
                What happens next?
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">📧</span>
                  <span>
                    <strong>Check your email</strong> - You&apos;ll receive a confirmation with your Zoom link
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">📅</span>
                  <span>
                    <strong>Add to calendar</strong> - We&apos;ve attached a calendar invite to your email
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">⏰</span>
                  <span>
                    <strong>Get a reminder</strong> - We&apos;ll send you a reminder 24 hours before the session
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">🎯</span>
                  <span>
                    <strong>Join early</strong> - Log in 5 minutes before to test your audio/video
                  </span>
                </li>
              </ul>
            </div>

            {/* Pro Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-yellow-900 mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Check your spam folder if you don&apos;t see the email</li>
                <li>• Test your Zoom setup before the session</li>
                <li>• Prepare questions you want to ask</li>
                <li>• Join from a quiet space with good internet</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="px-8"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => window.open('mailto:hello@nxtai101.com', '_blank')}
                className="px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Contact Support
              </Button>
            </div>

            {/* Support Note */}
            <p className="text-sm text-gray-500 mt-8">
              Didn&apos;t receive the email?{' '}
              <a
                href="mailto:hello@nxtai101.com"
                className="text-indigo-600 hover:underline"
              >
                Contact us
              </a>
            </p>
          </div>

          {/* Footer Logo */}
          <div className="text-center mt-8">
            <Image
              src="/images/trans-logo.png"
              alt="NXTAI101"
              width={80}
              height={80}
              className="mx-auto opacity-50"
            />
          </div>
        </div>
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
