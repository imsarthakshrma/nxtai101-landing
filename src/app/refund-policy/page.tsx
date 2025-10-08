import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full bg-gray-900 border-b border-gray-800">
        <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <Image src="/images/typo-logo.png" alt="NXTAI101" width={120} height={40} className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#courses" className="text-gray-300 hover:text-white transition-colors duration-200">
              Courses
            </Link>
            <Link href="/#about" className="text-gray-300 hover:text-white transition-colors duration-200">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </div>

          <Link href="/">
            <Button className="bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-300">
              Enroll Now
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: October 8, 2025</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Refund Eligibility</h2>
            <p className="mb-2">You are eligible for a full refund if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You request a refund at least 24 hours before the scheduled session</li>
              <li>You have not attended the session</li>
              <li>The session was cancelled by NXTAI101</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Non-Refundable Situations</h2>
            <p className="mb-2">No refunds will be provided if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The session has already started or completed</li>
              <li>You request a refund less than 24 hours before the session</li>
              <li>You missed the session without prior notice</li>
              <li>You violated our Terms & Conditions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How to Request a Refund</h2>
            <p className="mb-2">
              Email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>{" "}
              with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your name and email used during enrollment</li>
              <li>Order ID or Payment ID</li>
              <li>Reason for refund request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Refund Processing Time</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds are processed within 5-7 business days</li>
              <li>The amount will be credited to your original payment method</li>
              <li>You will receive a confirmation email once processed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Cancellation by NXTAI101</h2>
            <p className="mb-2">If we cancel a session:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will receive a full automatic refund</li>
              <li>Or you can choose to attend a rescheduled session</li>
              <li>You will be notified via email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Partial Refunds</h2>
            <p>Not applicable. Refunds are full or none.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p>
              For refund inquiries:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
            <p>Response time: Within 24-48 hours</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="text-center md:text-left">
              <Image src="/images/trans-logo.png" alt="NXTAI101" width={80} height={80} className="h-16 w-auto mb-2" />
              <p className="text-gray-400 text-sm">Preparing professionals for the AI-first future</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">hello@nxtai101.com</p>
              <p className="text-gray-500 text-xs">© 2025 NXTAI101. All rights reserved.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 border-t border-gray-800 pt-8">
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">
              Shipping Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
