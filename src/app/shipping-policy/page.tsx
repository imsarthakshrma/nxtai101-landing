import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ShippingPolicyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: October 8, 2025</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Digital Service - No Physical Shipping</h2>
            <p>NXTAI101 provides 100% digital educational services. No physical products are shipped.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">What You Receive</h2>
            <p className="mb-2">Upon successful payment, you will receive via email:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Payment confirmation</li>
              <li>Zoom meeting link</li>
              <li>Session date and time</li>
              <li>Calendar invite (.ics file)</li>
              <li>Pre-session instructions</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Delivery Method</h2>
            <p>All course materials and access links are delivered electronically to your registered email address.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Delivery Time</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Instant: Confirmation email sent immediately after payment</li>
              <li>Within 5 minutes: Zoom link and calendar invite</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">No Physical Products</h2>
            <p>We do not sell or ship any physical goods, books, or materials.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">International Access</h2>
            <p>Our online sessions are accessible globally. No customs or shipping fees apply.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Technical Requirements</h2>
            <p className="mb-2">To access our services, you need:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stable internet connection</li>
              <li>Device with Zoom capability (computer, tablet, or smartphone)</li>
              <li>Valid email address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Delivery Issues</h2>
            <p className="mb-2">If you don&apos;t receive your confirmation email:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Check your spam/junk folder</li>
              <li>Verify the email address you provided</li>
              <li>
                Contact us at{" "}
                <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                  hello@nxtai101.com
                </a>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Re-sending Access Links</h2>
            <p>
              If you lose your Zoom link, email{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>{" "}
              with your order details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p>
              For delivery-related questions:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
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
