'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Session } from '@/types/database';

interface SessionWithAvailability extends Session {
  available_seats: number;
  is_full: boolean;
}

interface EnrollmentFormProps {
  session: SessionWithAvailability;
  onSuccess: (enrollmentId: string) => void;
  onCancel: () => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: unknown) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface WindowWithRazorpay extends Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

export function EnrollmentForm({ session, onSuccess, onCancel }: EnrollmentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedin_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  function handleReview(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Show review screen
    setShowReview(true);
  }

  async function handleConfirmSubmit() {

    try {
      setLoading(true);

      // Check if session is free
      const isFreeSession = session.is_free || session.price === 0;

      if (isFreeSession) {
        // Handle free session enrollment
        const enrollRes = await fetch('/api/enroll/free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: session.id,
            user_info: formData,
          }),
        });

        const enrollData = await enrollRes.json();

        if (!enrollRes.ok || !enrollData.success) {
          console.error('Free enrollment error:', enrollData);
          throw new Error(enrollData.error || 'Failed to enroll');
        }

        console.log('Free enrollment successful:', enrollData);

        // Skip Razorpay for free sessions
        toast.success('Enrollment successful!');
        onSuccess(enrollData.enrollment_id);
        return;
      }

      // Load Razorpay script for paid sessions
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Create order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          user_info: formData,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'NXTAI101',
        description: 'Spark 101 - AI Fundamentals',
        image: '/images/trans-logo.png',
        order_id: orderData.order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#6366f1',
        },
        handler: async (response: unknown) => {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success('Payment successful!');
              onSuccess(verifyData.enrollment_id);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            toast.error(errorMessage);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new (window as unknown as WindowWithRazorpay).Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as { Razorpay?: unknown }).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  if (showReview) {
    return (
      <div className="space-y-6">
        {/* Review Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Review Your Details</h3>
          <p className="text-sm text-gray-600">Please verify all information is correct before confirming</p>
        </div>

        {/* Session Details */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">Session Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Session:</span>
              <span className="font-semibold text-gray-900">{session.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-gray-900">
                {new Date(session.session_date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold text-gray-900">
                {new Date(session.session_date).toLocaleTimeString('en-IN', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'Asia/Kolkata',
                })} IST
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
              <span className="text-gray-600">Amount:</span>
              {session.is_free || session.price === 0 ? (
                <span className="text-xl font-bold text-green-600">FREE</span>
              ) : (
                <span className="text-xl font-bold text-indigo-600">₹{session.price}</span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Your Details</h4>
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ✏️ Edit
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold text-gray-900">{formData.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-900">{formData.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold text-gray-900">{formData.phone}</span>
            </div>
            {formData.company && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Company:</span>
                <span className="font-semibold text-gray-900">{formData.company}</span>
              </div>
            )}
            {formData.linkedin_url && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">LinkedIn:</span>
                <span className="font-semibold text-gray-900 truncate max-w-xs">{formData.linkedin_url}</span>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Confirmation Email</p>
              <p className="text-xs text-blue-700">
                Session details and meeting link will be sent to <span className="font-semibold">{formData.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowReview(false)}
            disabled={loading}
            className="flex-1 h-12 text-base font-semibold border-2 hover:bg-gray-50"
          >
            ← Back to Edit
          </Button>
          <Button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={loading}
            className="flex-1 h-12 text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 font-medium text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : session.is_free || session.price === 0 ? (
              '✓ Confirm & Enroll'
            ) : (
              '✓ Confirm & Pay'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleReview} className="space-y-6">
      {/* Selected Session Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">Selected Session</h3>
            <p className="text-lg font-bold text-gray-900 mb-1">{session.title}</p>
            <div className="flex items-center text-gray-700 space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(session.session_date).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(session.session_date).toLocaleTimeString('en-IN', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'Asia/Kolkata',
                })} IST
              </span>
            </div>
          </div>
          <div className="text-right">
            {session.is_free || session.price === 0 ? (
              <>
                <p className="text-2xl font-bold text-green-600">FREE</p>
                <p className="text-xs text-gray-500">No payment required</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-indigo-600">₹{session.price}</p>
                <p className="text-xs text-gray-500">One-time payment</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        <div>
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">We&apos;ll send your Zoom/Meet link here</p>
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="company" className="text-sm font-semibold text-gray-700 mb-2 block">
              Company <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="company"
              placeholder="Your company name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-700 mb-2 block">
              LinkedIn <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="linkedin"
              placeholder="linkedin.com/in/yourprofile"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 h-12 text-base font-semibold border-2 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 h-12 text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
        >
          Review Details →
        </Button>
      </div>
    </form>
  );
}
