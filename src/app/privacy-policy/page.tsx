import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
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

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: October 8, 2025</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              NXTAI101 (operated by Nxtailabs) is committed to protecting your privacy. This policy explains how we
              collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email, phone number</li>
              <li>Company name and LinkedIn profile (optional)</li>
              <li>Payment information (processed by Razorpay)</li>
              <li>Device and usage data (IP address, browser type)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide course access and send Zoom links</li>
              <li>To process payments and send confirmations</li>
              <li>To communicate updates and reminders</li>
              <li>To improve our services</li>
              <li>To comply with legal requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p className="mb-2">We use:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Supabase (database storage)</li>
              <li>Razorpay (payment processing)</li>
              <li>Resend (email delivery)</li>
              <li>Zoom or Google meet(video conferencing)</li>
              <li>AWS (website hosting)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We use SSL encryption, secure databases, and payment verification to protect your data. However, no
              internet transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="mb-2">You can request to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your data</li>
              <li>Opt-out of marketing emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p>
              We retain your data for as long as needed to provide services and comply with legal obligations (e.g., tax
              records for 7 years).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p>
              We use cookies for website functionality and analytics. You can control cookies through your browser
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>Our services are not intended for individuals under 18 years of age.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
            <p>
              For privacy concerns, email:{" "}
              <a href="mailto:hello@nxtai101.com" className="text-indigo-600 hover:underline">
                hello@nxtai101.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Changes to Policy</h2>
            <p>We may update this policy. Continued use of our services means you accept the updated policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Governing Law</h2>
            <p>This policy is governed by the laws of India.</p>
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
