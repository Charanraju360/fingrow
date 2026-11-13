import React from "react";
import { TrendingUp, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-fingrow-midnight text-white pt-16 pb-12 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-fingrow-emerald flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5 text-fingrow-lime" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Fin<span className="text-fingrow-lime">Grow</span>
              </span>
            </a>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Don&apos;t just teach people how money works. Let them experience how money works. Interactive financial education, gamified competitions, and risk-free simulations.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-fingrow-lime font-medium">
              <ShieldCheck className="w-4 h-4 text-fingrow-lime" />
              <span>100% Educational • Risk-Free Virtual Money Engine</span>
            </div>
          </div>

          {/* Column: Learning */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Curriculum</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/curriculum" className="hover:text-fingrow-lime transition-colors">Curriculum Overview</a></li>
              <li><a href="/learn" className="hover:text-fingrow-lime transition-colors">Course Catalogue</a></li>
              <li><a href="/learn/stock-market-fundamentals" className="hover:text-fingrow-lime transition-colors">Stock Market</a></li>
              <li><a href="/learn/mutual-funds-and-sips" className="hover:text-fingrow-lime transition-colors">Mutual Funds & SIPs</a></li>
              <li><a href="/learn/risk-and-diversification" className="hover:text-fingrow-lime transition-colors">Portfolio & Risk</a></li>
              <li><a href="/learn/inflation-and-compound-interest" className="hover:text-fingrow-lime transition-colors">Compound Interest</a></li>
              <li><a href="/learn/credit-and-debit-mastery" className="hover:text-fingrow-lime transition-colors">Credit & Debt</a></li>
              <li><a href="/learn/personal-finance-and-budgeting" className="hover:text-fingrow-lime transition-colors">Personal Budgeting</a></li>
              <li><a href="/learn/business-fundamentals-and-ebitda" className="hover:text-fingrow-lime transition-colors">Business & EBITDA</a></li>
              <li><a href="/learn/career-skills-and-side-hustles" className="hover:text-fingrow-lime transition-colors">Side Hustles & Career</a></li>
            </ul>
          </div>

          {/* Column: Product & Practice */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Simulations & Games</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/simulations-showcase" className="hover:text-fingrow-lime transition-colors">Simulations Showcase</a></li>
              <li><a href="/simulations" className="hover:text-fingrow-lime transition-colors">Simulators Hub</a></li>
              <li><a href="/simulations/first-salary" className="hover:text-fingrow-lime transition-colors">First Salary Simulator</a></li>
              <li><a href="/simulations/budget" className="hover:text-fingrow-lime transition-colors">Monthly Budget & Shocks</a></li>
              <li><a href="/simulations/investing" className="hover:text-fingrow-lime transition-colors">Investment Challenge</a></li>
              <li><a href="/simulations/sip" className="hover:text-fingrow-lime transition-colors">SIP & Compounding</a></li>
              <li><a href="/simulations/startup" className="hover:text-fingrow-lime transition-colors">Startup Runway Builder</a></li>
              <li><a href="/simulations/calculators" className="hover:text-fingrow-lime transition-colors">Financial Calculators</a></li>
              <li><a href="/games-showcase" className="hover:text-fingrow-lime transition-colors">Games Showcase</a></li>
              <li><a href="/games" className="hover:text-fingrow-lime transition-colors">Games Lobby</a></li>
              <li><a href="/games/quick" className="hover:text-fingrow-lime transition-colors">Speed Trivia Solo</a></li>
              <li><a href="/games/battle" className="hover:text-fingrow-lime transition-colors">1v1 Battle Arena</a></li>
              <li><a href="/games/leaderboard" className="hover:text-fingrow-lime transition-colors">XP Leaderboards</a></li>
            </ul>
          </div>

          {/* Column: Institutional & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Platform & Trust</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/for-educators" className="hover:text-fingrow-lime transition-colors">For Educators & Schools</a></li>
              <li><a href="/community-preview" className="hover:text-fingrow-lime transition-colors">Community Preview</a></li>
              <li><a href="/community" className="hover:text-fingrow-lime transition-colors">Community Feed</a></li>
              <li><a href="/about" className="hover:text-fingrow-lime transition-colors">About FinGrow</a></li>
              <li><a href="/faq" className="hover:text-fingrow-lime transition-colors">Frequently Asked Questions</a></li>
              <li><a href="/contact" className="hover:text-fingrow-lime transition-colors">Contact & Demo Booking</a></li>
              <li><a href="/disclaimer" className="hover:text-fingrow-lime transition-colors font-semibold text-white/95">Financial Disclaimer</a></li>
              <li><a href="/privacy" className="hover:text-fingrow-lime transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-fingrow-lime transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Legal & Educational Disclaimer Notice */}
        <div className="pt-8 text-xs text-white/50 space-y-3">
          <p className="leading-relaxed">
            <strong className="text-white/80">Educational Disclaimer:</strong> FinGrow is strictly a financial education and simulation platform. All portfolio balances, cash amounts, stock price scenarios, investment gains, and business revenues displayed across this platform are 100% simulated with virtual currency. FinGrow does not provide personalized investment advice, brokerage account connections, or real-money trade execution. Past simulated performance is never a guarantee of future real-world financial returns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <p>© {new Date().getFullYear()} FinGrow Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Empowering students, young professionals, and classrooms with risk-free financial mastery.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
