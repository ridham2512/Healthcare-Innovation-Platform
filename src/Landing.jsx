import React, { useState } from "react";
import { useStateContext } from "./context";

const Landing = () => {
  const { login } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: "🧬",
      title: "AI Medical Report Analysis",
      description:
        "Upload your medical reports and get instant, detailed AI-powered analysis using Google Gemini. Understand your diagnosis in plain language.",
    },
    {
      icon: "📋",
      title: "Personalized Treatment Plans",
      description:
        "Automatically generate structured, actionable treatment plans tailored to your specific health conditions.",
    },
    {
      icon: "🗂️",
      title: "Smart Health Records",
      description:
        "Organize all your medical records in one secure place. Create folders, upload files, and access them anytime.",
    },
    {
      icon: "📊",
      title: "Kanban Treatment Board",
      description:
        "Track your treatment progress visually with a drag-and-drop Kanban board. Move tasks from Todo to Done.",
    },
    {
      icon: "🔒",
      title: "Secure Authentication",
      description:
        "Sign in with email or your Web3 wallet via Privy. Your health data is private and encrypted.",
    },
    {
      icon: "📈",
      title: "Health Dashboard",
      description:
        "Get a bird's-eye view of your health journey with metrics on screenings, treatments, and progress.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Sign In",
      description: "Create your account with email or a Web3 wallet in seconds.",
    },
    {
      number: "02",
      title: "Upload Report",
      description:
        "Upload your medical reports, scans, or test results as PDF, PNG or JPEG.",
    },
    {
      number: "03",
      title: "Get AI Analysis",
      description:
        "Our AI analyzes your report and provides detailed, personalized insights.",
    },
    {
      number: "04",
      title: "Track Progress",
      description:
        "Manage your treatment plan visually and track your health journey.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">CureCloud</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition">
              How it Works
            </a>
            <button
              onClick={login}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile menu btn */}
          <button
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen((p) => !p)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-gray-600">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600">How it Works</a>
              <button
                onClick={login}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 py-24 px-6">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100 opacity-40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-green-100 opacity-40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            AI-Powered Healthcare Management
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Your Health,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Intelligently Managed
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Upload medical reports, get instant AI analysis, generate personalized treatment
            plans, and track your health journey — all in one secure platform.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={login}
              className="w-full rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 sm:w-auto"
            >
              Start for Free →
            </button>
            <a
              href="#how-it-works"
              className="w-full rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 transition sm:w-auto"
            >
              See How It Works
            </a>
          </div>

          {/* Trust bar */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> Powered by Gemini AI
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> Secured with Privy
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to manage your health
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Powerful AI tools that make healthcare accessible and understandable.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-green-50 text-2xl">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Up and running in 4 simple steps
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              From sign-up to personalized treatment plan in minutes.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="absolute top-7 left-1/2 hidden h-0.5 w-full bg-gradient-to-r from-blue-200 to-green-200 lg:block" />
                )}
                <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
                  {step.number}
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Take control of your health today
          </h2>
          <p className="mt-4 text-blue-200 text-lg">
            Join thousands of users managing their health smarter with AI.
          </p>
          <button
            onClick={login}
            className="mt-10 rounded-2xl bg-white px-10 py-4 text-base font-bold text-blue-700 shadow-xl hover:bg-blue-50 transition"
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white py-10 px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
              </svg>
            </div>
            <span className="font-bold text-gray-800">CureCloud</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} CureCloud. Built with AI for better healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
