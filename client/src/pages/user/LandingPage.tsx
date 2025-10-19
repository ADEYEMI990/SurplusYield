"use client";

import { useEffect, useState } from "react";
import LandingCalculator from "../../components/user/LandingCalculator";
import { ArrowRight, Shield, BarChart, Wallet, Menu, X } from "lucide-react";
import Create from "../../components/user/Create";
import Planss from "../../components/user/Planss";
import { assets } from "../../assets/assets";
import AOS from "aos";
import "aos/dist/aos.css";

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  // ✅ Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 100,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <main className="font-sans text-gray-800 scroll-smooth">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <img
              src={assets.SY}
              alt="Logo"
              className="w-9 h-9 rounded bg-gray-800"
              data-aos="fade-right"
            />
            <span
              className="text-2xl font-extrabold text-blue-600"
              data-aos="fade-right"
              data-aos-delay="150"
            >
              Surplus<span className="text-gray-800">Yield</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["Home", "Features", "Plans", "Calculator", "Contact"].map(
              (link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="hover:text-blue-600 transition-colors"
                  data-aos="fade-down"
                  data-aos-delay="200"
                >
                  {link}
                </a>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div
            className="hidden md:flex items-center gap-4"
            data-aos="fade-left"
            data-aos-delay="300"
          >
            <a
              href="/auth/login"
              className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700"
            >
              Login
            </a>
            <a
              href="/auth/register"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Register
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div
            className="md:hidden bg-white border-t border-gray-100 flex flex-col items-center py-4 space-y-3 text-sm font-medium"
            data-aos="fade-down"
          >
            {["Home", "Features", "Plans", "Calculator", "Contact"].map(
              (link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="hover:text-blue-600 transition"
                  onClick={() => setMobileMenu(false)}
                >
                  {link}
                </a>
              )
            )}
            <div className="flex flex-col w-3/4 mt-3 space-y-2">
              <a
                href="/auth/login"
                className="text-center py-2 border border-blue-600 rounded-lg text-blue-600 font-medium hover:bg-blue-50"
              >
                Login
              </a>
              <a
                href="/auth/register"
                className="text-center py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Register
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section
        id="home"
        className="relative overflow-hidden pt-32 pb-24 bg-gradient-to-b from-blue-50 to-white text-center"
      >
        {/* --- Animated Gradient Blobs --- */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl animate-float1 top-[-150px] left-[-150px]" />
          <div className="absolute w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl animate-float2 bottom-[-200px] right-[-150px]" />
          <div className="absolute w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-3xl animate-float3 top-[40%] left-[60%]" />
        </div>

        {/* --- Hero Content --- */}
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h1
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-5 leading-tight"
            data-aos="fade-up"
          >
            Grow Your Wealth with{" "}
            <span className="text-blue-600">SurplusYield</span>
          </h1>
          <p
            className="text-lg md:text-xl text-gray-600 mb-8"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Invest smartly, earn consistently — automated ROI with total
            transparency.
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow hover:bg-blue-700 transition"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            Start Investing <ArrowRight className="w-5 h-5" />
          </a>

          {/* ✅ Optional Hero Image with AOS */}
          {/* <div
            className="mt-12 flex justify-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <img
              src={assets.SY}
              alt="Investment Growth"
              className="w-full max-w-md aos-animate"
            />
          </div> */}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2
            className="text-3xl font-bold text-gray-900 mb-12"
            data-aos="fade-up"
          >
            Why Choose SurplusYield
          </h2>
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <FeatureCard
              icon={<BarChart className="w-8 h-8 text-blue-600" />}
              title="Automated ROI"
              desc="Your investments grow automatically with our intelligent ROI engine."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="Secure Investments"
              desc="Multi-layered security ensures your capital is always protected."
            />
            <FeatureCard
              icon={<Wallet className="w-8 h-8 text-blue-600" />}
              title="Transparent Withdrawals"
              desc="Withdraw your earnings anytime with full visibility and no hidden fees."
            />
          </div>
        </div>
      </section>

      {/* ===== PLANS ===== */}
      <section id="plans" className="py-20 bg-gray-50" data-aos="fade-up">
        <Planss />
      </section>

      {/* ===== CALCULATOR ===== */}
      <div data-aos="fade-up" data-aos-delay="200">
        <LandingCalculator />
      </div>

      {/* ===== LIVE DATA ===== */}
      <div data-aos="fade-up" data-aos-delay="300">
        <Create />
      </div>

      {/* ===== STATS ===== */}
      <section
        className="py-20 bg-white border-t border-gray-100"
        data-aos="fade-up"
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Trusted by Thousands of Investors
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <StatCard value="15K+" label="Active Investors" />
            <StatCard value="$2.5M+" label="Total Payouts" />
            <StatCard value="98%" label="Customer Satisfaction" />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center px-6"
        data-aos="fade-up"
      >
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          Join SurplusYield Today
        </h2>
        <p className="text-lg mb-8 opacity-90">
          Start earning smarter — your money deserves to grow.
        </p>
        <a
          href="/auth/register"
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          data-aos="zoom-in"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </a>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-gray-100 py-10 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} SurplusYield. All rights reserved.</p>
        <div className="mt-3 space-x-4">
          <a href="#features" className="hover:text-blue-600">
            Features
          </a>
          <a href="#calculator" className="hover:text-blue-600">
            Calculator
          </a>
          <a href="#contact" className="hover:text-blue-600">
            Contact
          </a>
        </div>
      </footer>
    </main>
  );
}

// ===== REUSABLE COMPONENTS =====
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center hover:shadow-lg transition"
      data-aos="zoom-in"
      data-aos-delay="150"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-sm md:text-base">{desc}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="p-6 bg-blue-50 border border-blue-100 rounded-2xl hover:shadow-md transition"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <p className="text-3xl font-bold text-blue-600">{value}</p>
      <p className="text-gray-700 mt-1">{label}</p>
    </div>
  );
}