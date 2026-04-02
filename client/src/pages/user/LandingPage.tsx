// // src/pages/LandingPage.tsx

// "use client";

// import { useEffect, useState } from "react";
// import LandingCalculator from "../../components/user/LandingCalculator";
// import { ArrowRight, Shield, Wallet, Menu, X, TrendingUp, DollarSign, Users, CheckCircle, Zap } from "lucide-react";
// import Create from "../../components/user/Create";
// import PlansLanding from "../../components/user/Planss";
// import { assets } from "../../assets/assets";
// import AOS from "aos";
// import "aos/dist/aos.css";

// export default function LandingPage() {
//   const [mobileMenu, setMobileMenu] = useState(false);

//   // Initialize AOS
//   useEffect(() => {
//     AOS.init({
//       duration: 1000,
//       offset: 100,
//       once: true,
//       easing: "ease-in-out",
//     });
//   }, []);

//   return (
//     <main className="font-sans text-gray-800 scroll-smooth">
//       {/* ===== NAVBAR ===== */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
//         <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
//           {/* Logo */}
//           <div
//             className="flex items-center gap-2 cursor-pointer"
//             onClick={() => (window.location.href = "/")}
//           >
//             <img
//               src={assets.SY}
//               alt="Logo"
//               className="w-9 h-9 rounded-full bg-green-600 p-1"
//               data-aos="fade-right"
//             />
//             <span
//               className="text-2xl font-extrabold text-green-600"
//               data-aos="fade-right"
//               data-aos-delay="150"
//             >
//               Surplus<span className="text-gray-800">Yield</span>
//             </span>
//           </div>

//           {/* Desktop Links */}
//           <div className="hidden md:flex items-center gap-8 text-sm font-medium">
//             {["Home", "Features", "Plans", "Calculator", "Contact"].map(
//               (link) => (
//                 <a
//                   key={link}
//                   href={`#${link.toLowerCase()}`}
//                   className="hover:text-green-600 transition-colors text-gray-600"
//                   data-aos="fade-down"
//                   data-aos-delay="200"
//                 >
//                   {link}
//                 </a>
//               )
//             )}
//           </div>

//           {/* Auth Buttons */}
//           <div
//             className="hidden md:flex items-center gap-4"
//             data-aos="fade-left"
//             data-aos-delay="300"
//           >
//             <a
//               href="/auth/login"
//               className="px-4 py-2 text-green-600 font-medium hover:text-green-700"
//             >
//               Login
//             </a>
//             <a
//               href="/auth/register"
//               className="px-5 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-sm"
//             >
//               Get Started
//             </a>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden text-gray-700"
//             onClick={() => setMobileMenu(!mobileMenu)}
//           >
//             {mobileMenu ? <X size={26} /> : <Menu size={26} />}
//           </button>
//         </div>

//         {/* Mobile Dropdown */}
//         {mobileMenu && (
//           <div
//             className="md:hidden bg-white border-t border-gray-100 flex flex-col items-center py-4 space-y-3 text-sm font-medium"
//             data-aos="fade-down"
//           >
//             {["Home", "Features", "Plans", "Calculator", "Contact"].map(
//               (link) => (
//                 <a
//                   key={link}
//                   href={`#${link.toLowerCase()}`}
//                   className="hover:text-green-600 transition text-gray-600"
//                   onClick={() => setMobileMenu(false)}
//                 >
//                   {link}
//                 </a>
//               )
//             )}
//             <div className="flex flex-col w-3/4 mt-3 space-y-2">
//               <a
//                 href="/auth/login"
//                 className="text-center py-2 border border-green-600 rounded-xl text-green-600 font-medium hover:bg-green-50"
//               >
//                 Login
//               </a>
//               <a
//                 href="/auth/register"
//                 className="text-center py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
//               >
//                 Get Started
//               </a>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* ===== HERO SECTION ===== */}
//       <section
//         id="home"
//         className="relative overflow-hidden pt-32 pb-24 bg-gradient-to-b from-green-50 to-white text-center"
//       >
//         {/* Animated Gradient Blobs */}
//         <div className="absolute inset-0 -z-10 overflow-hidden">
//           <div className="absolute w-[600px] h-[600px] bg-green-400/20 rounded-full blur-3xl animate-float1 top-[-150px] left-[-150px]" />
//           <div className="absolute w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl animate-float2 bottom-[-200px] right-[-150px]" />
//           <div className="absolute w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-3xl animate-float3 top-[40%] left-[60%]" />
//         </div>

//         {/* Hero Content */}
//         <div className="max-w-4xl mx-auto px-6 relative z-10">
//           <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6" data-aos="fade-up">
//             <Zap className="w-4 h-4" />
//             Start Earning Today
//           </div>
//           <h1
//             className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
//             data-aos="fade-up"
//           >
//             Grow Your Wealth with{" "}
//             <span className="text-green-600">SurplusYield</span>
//           </h1>
//           <p
//             className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
//             data-aos="fade-up"
//             data-aos-delay="150"
//           >
//             Invest smartly, earn consistently — automated ROI with total
//             transparency and security.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="zoom-in" data-aos-delay="300">
//             <a
//               href="/auth/register"
//               className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-green-700 transition transform hover:scale-105"
//             >
//               Start Investing <ArrowRight className="w-5 h-5" />
//             </a>
//             <a
//               href="#calculator"
//               className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-green-600 hover:text-green-600 transition"
//             >
//               Calculate Returns
//             </a>
//           </div>

//           {/* Trust Badges */}
//           <div className="mt-12 flex flex-wrap justify-center gap-8" data-aos="fade-up" data-aos-delay="400">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-green-500" />
//               <span className="text-sm text-gray-600">Secure Platform</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-green-500" />
//               <span className="text-sm text-gray-600">24/7 Support</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-green-500" />
//               <span className="text-sm text-gray-600">Instant Withdrawals</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ===== FEATURES ===== */}
//       <section id="features" className="py-20 bg-white">
//         <div className="max-w-6xl mx-auto px-6 text-center">
//           <div className="mb-12" data-aos="fade-up">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               Why Choose SurplusYield
//             </h2>
//             <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//               Experience the future of investing with our cutting-edge platform
//             </p>
//           </div>
//           <div
//             className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
//             data-aos="fade-up"
//             data-aos-delay="200"
//           >
//             <FeatureCard
//               icon={<TrendingUp className="w-8 h-8 text-green-600" />}
//               title="Automated ROI"
//               desc="Your investments grow automatically with our intelligent ROI engine. Sit back and watch your wealth multiply."
//             />
//             <FeatureCard
//               icon={<Shield className="w-8 h-8 text-green-600" />}
//               title="Secure Investments"
//               desc="Multi-layered security with bank-grade encryption ensures your capital is always protected."
//             />
//             <FeatureCard
//               icon={<Wallet className="w-8 h-8 text-green-600" />}
//               title="Transparent Withdrawals"
//               desc="Withdraw your earnings anytime with full visibility, no hidden fees, and instant processing."
//             />
//           </div>
//         </div>
//       </section>

//       {/* ===== PLANS ===== */}
//       <section id="plans" className="py-20 bg-gray-50" data-aos="fade-up">
//         <PlansLanding />
//       </section>

//       {/* ===== CALCULATOR ===== */}
//       <div data-aos="fade-up" data-aos-delay="200">
//         <LandingCalculator />
//       </div>

//       {/* ===== LIVE DATA ===== */}
//       <div data-aos="fade-up" data-aos-delay="300">
//         <Create />
//       </div>

//       {/* ===== STATS ===== */}
//       <section
//         className="py-20 bg-white border-t border-gray-100"
//         data-aos="fade-up"
//       >
//         <div className="max-w-6xl mx-auto px-6 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
//             Trusted by Thousands of Investors
//           </h2>
//           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
//             <StatCard value="15K+" label="Active Investors" icon={<Users className="w-6 h-6 text-green-600" />} />
//             <StatCard value="$2.5M+" label="Total Payouts" icon={<DollarSign className="w-6 h-6 text-green-600" />} />
//             <StatCard value="98%" label="Customer Satisfaction" icon={<TrendingUp className="w-6 h-6 text-green-600" />} />
//           </div>
//         </div>
//       </section>

//       {/* ===== CTA ===== */}
//       <section
//         id="contact"
//         className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white text-center px-6"
//         data-aos="fade-up"
//       >
//         <div className="max-w-3xl mx-auto">
//           <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
//             Ready to Start Growing?
//           </h2>
//           <p className="text-lg md:text-xl mb-8 opacity-90">
//             Join thousands of investors who are already earning with SurplusYield
//           </p>
//           <a
//             href="/auth/register"
//             className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
//             data-aos="zoom-in"
//           >
//             Create Free Account <ArrowRight className="w-5 h-5" />
//           </a>
//         </div>
//       </section>

//       {/* ===== FOOTER ===== */}
//       <footer className="bg-white border-t border-gray-100 py-12">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <img src={assets.SY} alt="Logo" className="w-8 h-8 rounded-full bg-green-600 p-1" />
//                 <span className="text-xl font-bold text-green-600">SurplusYield</span>
//               </div>
//               <p className="text-sm text-gray-600">
//                 Smart investing for the modern world. Grow your wealth with confidence.
//               </p>
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li><a href="#features" className="hover:text-green-600">Features</a></li>
//                 <li><a href="#plans" className="hover:text-green-600">Investment Plans</a></li>
//                 <li><a href="#calculator" className="hover:text-green-600">Calculator</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li><a href="#" className="hover:text-green-600">Help Center</a></li>
//                 <li><a href="#" className="hover:text-green-600">Contact Us</a></li>
//                 <li><a href="#" className="hover:text-green-600">FAQ</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li><a href="#" className="hover:text-green-600">Terms of Service</a></li>
//                 <li><a href="#" className="hover:text-green-600">Privacy Policy</a></li>
//                 <li><a href="#" className="hover:text-green-600">Cookie Policy</a></li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-500">
//             <p>© {new Date().getFullYear()} SurplusYield. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </main>
//   );
// }

// // ===== REUSABLE COMPONENTS =====
// function FeatureCard({
//   icon,
//   title,
//   desc,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   desc: string;
// }) {
//   return (
//     <div
//       className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
//       data-aos="zoom-in"
//       data-aos-delay="150"
//     >
//       <div className="flex justify-center mb-4">
//         <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition">
//           {icon}
//         </div>
//       </div>
//       <h3 className="text-xl font-semibold text-gray-900 mb-2">
//         {title}
//       </h3>
//       <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
//     </div>
//   );
// }

// function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
//   return (
//     <div
//       className="p-8 bg-green-50 border border-green-100 rounded-2xl hover:shadow-md transition"
//       data-aos="fade-up"
//       data-aos-delay="200"
//     >
//       <div className="flex justify-center mb-3">{icon}</div>
//       <p className="text-4xl font-bold text-green-600">{value}</p>
//       <p className="text-gray-700 mt-2 font-medium">{label}</p>
//     </div>
//   );
// }


// src/pages/LandingPage.tsx

"use client";

import { useEffect, useState } from "react";
import LandingCalculator from "../../components/user/LandingCalculator";
import { ArrowRight, Shield, Wallet, Menu, X, TrendingUp, DollarSign, CheckCircle, Zap } from "lucide-react";
import Create from "../../components/user/Create";
import PlansLanding from "../../components/user/Planss";
import AOS from "aos";
import "aos/dist/aos.css";
import { assets } from "../../assets/assets";

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <main className="font-sans text-gray-900 scroll-smooth">
      {/* ===== NAVBAR - CASH APP STYLE ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo - Cash App Style */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <img
              src={assets.cashapp_logo}
              alt="Logo"
              className="w-15 h-15 rounded-full  p-1"
              data-aos="fade-right"
            />
            <span className="text-xl font-bold text-gray-900">
              CashApp<span className="text-green-600">Invest</span>
            </span>
          </div>

          {/* Desktop Links - Simplified */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Plans", "Calculator"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Auth Buttons - Cash App Style */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/auth/login"
              className="px-5 py-2 text-gray-700 font-medium hover:text-green-600 transition"
            >
              Sign In
            </a>
            <a
              href="/auth/register"
              className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition shadow-sm"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6">
            <div className="flex flex-col space-y-3">
              {["Features", "Plans", "Calculator"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-gray-600 hover:text-green-600 transition py-2"
                  onClick={() => setMobileMenu(false)}
                >
                  {link}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                <a
                  href="/auth/login"
                  className="text-center py-2 text-gray-700 font-medium"
                >
                  Sign In
                </a>
                <a
                  href="/auth/register"
                  className="text-center py-2 bg-green-600 text-white rounded-full font-semibold"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION - CASH APP STYLE ===== */}
      <section id="home" className="relative pt-32 pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div data-aos="fade-right">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Zap className="w-3 h-3" />
                Invest & Earn
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Grow your money with
                <span className="text-green-600"> CashApp Invest</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Start investing from as little as $100. Get automated returns daily, weekly, or monthly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition shadow-md"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#calculator"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:border-green-600 hover:text-green-600 transition"
                >
                  Calculate Returns
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">FDIC Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Instant Withdrawals</span>
                </div>
              </div>
            </div>

            {/* Right Content - Cash App Style Image */}
            <div data-aos="fade-left" className="relative">
              <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 shadow-xl">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-600 rounded-2xl p-4 inline-block">
                    <DollarSign className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Balance</span>
                    <span className="text-2xl font-bold text-gray-900">$1,234.56</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Today's Earnings</span>
                    <span className="text-green-600 font-semibold">+$12.34</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Plans</span>
                    <span className="font-medium text-gray-900">2</span>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-100 rounded-full blur-2xl opacity-50 -z-10" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-green-100 rounded-full blur-2xl opacity-50 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES - CASH APP STYLE ===== */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why invest with us
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Simple, transparent, and designed for your financial growth
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-green-600" />}
              title="Daily Returns"
              desc="Earn returns daily on your investments. Watch your money grow in real-time."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-green-600" />}
              title="Bank-Level Security"
              desc="Your funds are protected with industry-leading security measures."
            />
            <FeatureCard
              icon={<Wallet className="w-8 h-8 text-green-600" />}
              title="Instant Access"
              desc="Withdraw your earnings instantly, 24/7, with no withdrawal limits."
            />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS - CASH APP STYLE ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-gray-600 text-lg">Start investing in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up in seconds with just your email</p>
            </div>
            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose a Plan</h3>
              <p className="text-gray-600">Select from our range of investment plans</p>
            </div>
            <div className="text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Earning</h3>
              <p className="text-gray-600">Watch your returns grow automatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLANS ===== */}
      <section id="plans" className="py-20 bg-gray-50" data-aos="fade-up">
        <PlansLanding />
      </section>

      {/* ===== CALCULATOR ===== */}
      <div data-aos="fade-up" data-aos-delay="200">
        <LandingCalculator />
      </div>

      {/* ===== LIVE ACTIVITY ===== */}
      <div data-aos="fade-up" data-aos-delay="300">
        <Create />
      </div>

      {/* ===== STATS - CASH APP STYLE ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Trusted by thousands
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <StatCard value="50K+" label="Active Investors" />
            <StatCard value="$10M+" label="Total Invested" />
            <StatCard value="99%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* ===== CTA - CASH APP STYLE ===== */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start investing today
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of investors already earning with CashApp Invest
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ===== FOOTER - CASH APP STYLE ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={assets.cashapp_logo}
                  alt="Logo"
                  className="w-15 h-15 rounded-full  p-1"
                  data-aos="fade-right"
                />
                <span className="text-xl font-bold text-white">CashApp Invest</span>
              </div>
              <p className="text-sm">
                Invest smarter, earn consistently.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-green-400 transition">Features</a></li>
                <li><a href="#plans" className="hover:text-green-400 transition">Investment Plans</a></li>
                <li><a href="#calculator" className="hover:text-green-400 transition">Calculator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">About</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} CashApp Invest. All rights reserved.</p>
          </div>
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
      className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 group border border-gray-100"
      data-aos="zoom-in"
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="p-8 bg-gray-50 rounded-2xl hover:shadow-md transition"
      data-aos="fade-up"
    >
      <p className="text-4xl font-bold text-green-600">{value}</p>
      <p className="text-gray-700 mt-2 font-medium">{label}</p>
    </div>
  );
}