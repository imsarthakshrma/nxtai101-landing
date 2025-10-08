import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 mb-12">We&apos;re here to help!</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">General Inquiries</h2>
            <p>
              Email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a href="https://nxtai101.com" className="text-indigo-600 hover:underline">
                https://nxtai101.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Course Enrollment</h2>
            <p>For questions about courses, schedules, or enrollment:</p>
            <p>
              Email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Technical Support</h2>
            <p>For issues with Zoom links, payments, or website:</p>
            <p>
              Email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Refunds & Cancellations</h2>
            <p>For refund requests or cancellations:</p>
            <p>
              Email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
            <p className="mt-2">Include: Your name, order ID, and reason</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Business Inquiries</h2>
            <p>For partnerships, corporate training, or bulk enrollments:</p>
            <p>
              Email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Response Time</h2>
            <p>We typically respond within 24-48 hours during business days.</p>
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
