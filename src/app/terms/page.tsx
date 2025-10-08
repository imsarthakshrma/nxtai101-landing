import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: October 8, 2025</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By enrolling in NXTAI101 courses, you agree to these Terms & Conditions. If you do not agree, please do
              not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Services Provided</h2>
            <p className="mb-2">NXTAI101 offers live online AI training sessions via Zoom, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Spark 101 (60-minute session, ₹199)</li>
              <li>Framework 101 (Coming Soon)</li>
              <li>Summit 101 (Coming Soon)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Enrollment and Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All payments are processed through Razorpay</li>
              <li>Prices are in Indian Rupees (INR)</li>
              <li>Payment must be completed to confirm enrollment</li>
              <li>You will receive a confirmation email with Zoom link upon successful payment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Session Access</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sessions are live and scheduled at specific dates/times</li>
              <li>Zoom links are sent via email after payment</li>
              <li>Maximum 150 participants per session</li>
              <li>Sessions are not recorded or available for replay (unless specified)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. User Responsibilities</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information during enrollment</li>
              <li>Attend sessions on time</li>
              <li>Not record, reproduce, or distribute course content</li>
              <li>Not share Zoom links with non-enrolled individuals</li>
              <li>Maintain respectful behavior during sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Refund and Cancellation Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds available if requested 24+ hours before the session</li>
              <li>No refunds after the session has started</li>
              <li>Refunds processed within 5-7 business days</li>
              <li>Contact hello@nxtai101.com for refund requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Rescheduling</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We reserve the right to reschedule sessions due to unforeseen circumstances</li>
              <li>You will be notified via email at least 24 hours in advance</li>
              <li>Alternative dates will be provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All course content, materials, and trademarks are owned by NXTAI101/Nxtailabs</li>
              <li>You may not reproduce, distribute, or create derivative works without written permission</li>
              <li>Personal use for learning purposes is permitted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>NXTAI101 is not liable for technical issues (internet, Zoom outages)</li>
              <li>We do not guarantee specific outcomes or results from courses</li>
              <li>Our liability is limited to the amount you paid for the course</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Privacy</h2>
            <p>Your personal information is handled according to our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Prohibited Conduct</h2>
            <p className="mb-2">You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use our services for illegal purposes</li>
              <li>Harass or abuse other participants or instructors</li>
              <li>Attempt to hack or disrupt our systems</li>
              <li>Impersonate others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Termination</h2>
            <p>We reserve the right to terminate your access if you violate these terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Modifications</h2>
            <p>We may update these terms at any time. Continued use means acceptance of updated terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Dispute Resolution</h2>
            <p>Any disputes will be resolved through arbitration in accordance with Indian law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. Contact Us</h2>
            <p>
              For questions about these terms, email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">16. Governing Law</h2>
            <p>These terms are governed by the laws of India.</p>
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
