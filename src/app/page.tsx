"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { EnrollmentModal } from "@/components/enrollment-modal"
import { useRouter } from "next/navigation"
import React from "react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter();
  const [enrollmentModalOpen, setEnrollmentModalOpen] = React.useState(false);

  function handleEnrollmentSuccess(enrollmentId: string) {
    router.push(`/success?id=${enrollmentId}`);
  }
  React.useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view")
          entry.target.classList.remove("fade-out")
        } else {
          entry.target.classList.remove("in-view")
          entry.target.classList.add("fade-out")
        }
      })
    }, observerOptions)

    const scrollElements = document.querySelectorAll(".scroll-fade-text")
    scrollElements.forEach((el) => observer.observe(el))

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        {/* Background Image - Only for Hero */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background.png"
            alt="Futuristic gradient background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-black/70"></div>
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="network-node absolute top-1/4 left-1/4"></div>
          <div className="network-node absolute top-1/3 right-1/3"></div>
          <div className="network-node absolute bottom-1/3 left-1/3"></div>
          <div className="network-node absolute top-2/3 right-1/4"></div>
          <div className="network-edge absolute top-1/4 left-1/4 w-32 h-px"></div>
          <div className="network-edge absolute top-1/3 right-1/3 w-24 h-px rotate-45"></div>
        </div>

        {/* Header */}
        <header className="relative z-20 w-full">
          <nav className="flex items-center justify-between px-6 py-6 md:px-12">
            <div className="flex items-center">
              <Image src="/images/typo-logo.png" alt="NXTAI101" width={120} height={40} className="h-8 w-auto" />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#courses"
                className="text-gray-200 hover:text-white transition-colors duration-200 font-medium text-lg font-inter hover-glow"
              >
                Courses
              </a>
              <a
                href="#how-it-works"
                className="text-gray-200 hover:text-white transition-colors duration-200 font-medium text-lg font-inter hover-glow"
              >
                How it works
              </a>
              <a
                href="/contact"
                className="text-gray-200 hover:text-white transition-colors duration-200 font-medium text-lg font-inter hover-glow"
              >
                Contact
              </a>
            </div>

            {/* Enroll Now Button */}
            <a href="#pricing">
              <Button className="btn-alive bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-300 border-0">
                Enroll Now
              </Button>
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="relative z-20 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-16">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Headline */}
            <h1 className="font-instrument-serif text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-tight text-balance font-medium animate-fade-in-up italic">
              Step Into the AI Era
            </h1>

            <p className="text-gray-200 text-xl md:text-2xl lg:text-3xl font-light mb-16 max-w-4xl mx-auto leading-relaxed text-pretty animate-fade-in-up-delayed">
              From your first AI prompt to becoming a confident creator — NXT makes you future-ready.
            </p>

            <div className="flex justify-center">
              <a href="#pricing">
                <Button
                  variant="default"
                  className="btn-alive bg-white text-indigo-700 py-5 px-10 rounded-full hover:bg-gray-100 transition-all duration-300 border-0 animate-fade-in-up-button text-lg font-medium"
                >
                  Enroll In Spark 101
                </Button>
              </a>
            </div>
          </div>
        </main>
      </div>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-instrument-serif text-4xl md:text-5xl text-black mb-8 text-balance scroll-fade-text">
            Prompt Engineering is Yesterday&apos;s Skill.
          </h2>
          <p className="text-gray-800 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto scroll-fade-text">
            Everyone&apos;s busy crafting clever prompts. But in 2025, prompts alone break down—too fragile, too
            inconsistent, too shallow. The future belongs to those who can engineer contexts: structured systems that
            guide AI reasoning, scale across teams, and deliver enterprise-grade reliability.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black animated-gradient">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-instrument-serif text-4xl md:text-5xl text-white mb-16 text-center text-balance scroll-fade-text">
            Beyond Prompts. Beyond Templates.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 card-ripple transition-all duration-300 scroll-fade-text">
              <h3 className="text-xl font-semibold text-white mb-4">Context Engineering First</h3>
              <p className="text-gray-200">Learn the framework behind the world&apos;s most advanced AI systems.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 card-ripple transition-all duration-300 scroll-fade-text">
              <h3 className="text-xl font-semibold text-white mb-4">Engineer &gt; Hacker</h3>
              <p className="text-gray-200">
                Built by practitioners who design AI architectures, not influencers chasing trends.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 card-ripple transition-all duration-300 scroll-fade-text">
              <h3 className="text-xl font-semibold text-white mb-4">Scalable, Enterprise-Ready</h3>
              <p className="text-gray-200">From solo workflows to global deployments—skills that grow with you.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="relative py-24 px-6 bg-gradient-to-br from-[#0C0F1A] via-[#131933] to-[#0C0F1A] overflow-hidden">
        {/* Floating particle field background */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="builder-particle absolute top-1/4 left-1/4"></div>
          <div className="builder-particle absolute top-1/2 right-1/3"></div>
          <div className="builder-particle absolute bottom-1/3 left-1/2"></div>
          <div className="builder-particle absolute top-2/3 right-1/4"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Headline with glowing gradient */}
          <h2 className="font-instrument-serif text-4xl md:text-5xl text-center mb-4 text-balance scroll-fade-text builder-headline">
            Built for the Builders
          </h2>

          {/* Subheadline */}
          <p className="text-center text-gray-400 text-lg mb-16 font-serif scroll-fade-text">
            The ones engineering the future — not just prompting it.
          </p>

          {/* 4 Card Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Professionals Card */}
            <div className="builder-card group relative p-8 rounded-2xl bg-indigo-950/30 backdrop-blur-md border border-violet-500/20 transition-all duration-500 scroll-fade-text">
              <div className="builder-grid-pattern"></div>
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">Professionals</h3>
              <p className="text-violet-300 font-medium mb-2 relative z-10">Move beyond shallow prompting.</p>
              <p className="text-gray-400 text-sm relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Learn to command context and reason like an AI architect.
              </p>
            </div>

            {/* Teams Card */}
            <div className="builder-card group relative p-8 rounded-2xl bg-indigo-950/30 backdrop-blur-md border border-violet-500/20 transition-all duration-500 scroll-fade-text">
              <div className="builder-grid-pattern"></div>
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">Teams</h3>
              <p className="text-violet-300 font-medium mb-2 relative z-10">Integrate AI workflows systematically.</p>
              <p className="text-gray-400 text-sm relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Design adaptive, context-aware collaboration systems.
              </p>
            </div>

            {/* Leaders Card */}
            <div className="builder-card group relative p-8 rounded-2xl bg-indigo-950/30 backdrop-blur-md border border-violet-500/20 transition-all duration-500 scroll-fade-text">
              <div className="builder-grid-pattern"></div>
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">Leaders</h3>
              <p className="text-violet-300 font-medium mb-2 relative z-10">Design AI-first strategies that scale.</p>
              <p className="text-gray-400 text-sm relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Build org-level context frameworks for consistent intelligence.
              </p>
            </div>

            {/* Developers Card */}
            <div className="builder-card group relative p-8 rounded-2xl bg-indigo-950/30 backdrop-blur-md border border-violet-500/20 transition-all duration-500 scroll-fade-text">
              <div className="builder-grid-pattern"></div>
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">Developers</h3>
              <p className="text-violet-300 font-medium mb-2 relative z-10">Bridge code, context, and cognition.</p>
              <p className="text-gray-400 text-sm relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Engineer reasoning layers and context-aware APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-instrument-serif text-4xl md:text-5xl text-black mb-4 text-balance scroll-fade-text">
              Start Where You Are. Grow As You Go.
            </h2>
            <p className="text-gray-600 text-lg scroll-fade-text">
              Each session builds on the last — from your first spark to full-scale AI fluency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Spark 101 Card */}
            <div className="pricing-card group relative p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-400 transition-all duration-500 scroll-fade-text">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                  Level 1 of 3
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Spark 101</h3>
              <p className="text-indigo-600 font-medium mb-4">The AI Awakening Session</p>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Duration: 60–75 mins (Live, interactive)</p>
                <p className="text-3xl font-medium text-gray-900">₹199</p>
              </div>
              <div className="mb-6">
                <p className="font-semibold text-gray-900 mb-3">You&apos;ll Learn:</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>How AI already works in your daily life</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>The basics of prompting and AI communication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>First prompt framework and hands-on examples</span>
                  </li>
                </ul>
              </div>
              <div className="mb-6 p-4 bg-white/50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Outcome:</span> Leave with your first working prompt and clarity on
                  how to think like AI.
                </p>
              </div>
              <Button 
                onClick={() => setEnrollmentModalOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 btn-alive"
              >
                Enroll in Spark 101
              </Button>
            </div>

            {/* Framework 101 Card */}
            <div className="pricing-card group relative p-8 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-400 hover:border-indigo-600 transition-all duration-500 scroll-fade-text shadow-xl">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-semibold rounded-full">
                  Level 2 of 3
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Framework 101</h3>
              <p className="text-indigo-700 font-medium mb-4">The Foundation Course for Context Engineering</p>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Duration: 2–3 hours (Live cohort or 1:1 coaching)</p>
                <p className="text-3xl font-medium text-gray-900">Coming Soon!</p>
                <p className="text-sm text-gray-600 mt-1">Pricing to be announced</p>
              </div>
              <div className="mb-6">
                <p className="font-semibold text-gray-900 mb-3">You&apos;ll Learn:</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Prompt patterns, role-context-constraint model</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Context layering and information hierarchies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Debugging and improving prompt outputs</span>
                  </li>
                </ul>
              </div>
              <div className="mb-6 p-4 bg-white/70 rounded-xl">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Outcome:</span> Predictable, reliable, professional-grade prompts for
                  work or projects.
                </p>
              </div>
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 rounded-full hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 btn-alive shadow-lg">
                Starting Soon!
              </Button>
            </div>

            {/* Summit 101 Card */}
            <div className="pricing-card group relative p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 transition-all duration-500 scroll-fade-text">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                  Level 3 of 3
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Summit 101</h3>
              <p className="text-blue-600 font-medium mb-4">The Advanced AI Integration Workshop</p>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Duration: 4-6 hours (Team or enterprise sessions)</p>
                <p className="text-3xl font-medium text-gray-900">Coming Soon!</p>
                <p className="text-sm text-gray-600 mt-1">Pricing to be announced</p>
              </div>
              <div className="mb-6">
                <p className="font-semibold text-gray-900 mb-3">You&apos;ll Learn:</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Multi-step AI workflows, system prompting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Custom personas, RAG, and toolchain integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>PromptOps & AI process design</span>
                  </li>
                </ul>
              </div>
              <div className="mb-6 p-4 bg-white/50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Outcome:</span> Operate AI at scale — the way startups and labs do.
                </p>
              </div>
              <Button className="w-full bg-white text-blue-700 border-2 border-blue-600 py-3 rounded-full hover:bg-blue-50 transition-all duration-300 btn-alive">
                Starting Soon!
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          {/* Updated headline */}
          <h2 className="font-instrument-serif text-4xl md:text-5xl text-white mb-8 text-balance scroll-fade-text">
            Where Engineering Meets Creative Intelligence
          </h2>
          {/* Updated subtext */}
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 scroll-fade-text">
            NXTAI101 is born out of real-world practice—where AI systems either scale or break based on how their
            contexts are engineered. Our team blends deep technical reasoning with real-world creative workflows,
            bringing both sides of AI—the builder&apos;s logic and the creator&apos;s spark—into every session.
          </p>
          {/* Added CTA button */}
          <div className="flex flex-col items-center gap-3 mt-12">
            <a href="#pricing">
              <Button className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-all duration-300 border-0 btn-alive text-lg">
                Enroll in Spark 101
              </Button>
            </a>
            {/* Added small subtitle */}
            <p className="text-gray-500 text-sm max-w-md">
              Start your AI journey with us. Learn how real engineers and creators think, not just how they prompt.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-gray-900 border-t border-gradient">
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

      {/* Enrollment Modal */}
      <EnrollmentModal
        open={enrollmentModalOpen}
        onOpenChange={setEnrollmentModalOpen}
        onSuccess={handleEnrollmentSuccess}
      />
    </div>
  )
}
