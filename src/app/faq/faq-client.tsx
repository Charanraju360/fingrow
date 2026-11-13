"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FAQItem {
  q: string;
  a: string;
  category: "General" | "Educators" | "Gamification" | "Safety";
}

const FAQS: FAQItem[] = [
  {
    category: "General",
    q: "Is FinGrow free for students and schools?",
    a: "Yes! All core curriculum modules, financial simulations, calculators, and educator classroom tools are completely free for students, teachers, and accredited schools.",
  },
  {
    category: "Safety",
    q: "Does FinGrow link to real bank accounts or brokerage apps?",
    a: "No. FinGrow is strictly an educational sandbox. We never connect to real bank accounts, never execute trades on live stock exchanges, and never handle real-money financial deposits. All balances are 100% simulated.",
  },
  {
    category: "Educators",
    q: "How do educators create classrooms and assign homework?",
    a: "Teachers can sign up as an Educator, click 'Create Classroom', and generate a unique 6-character join code and QR code. You can assign any module or quiz with specific due dates and track student completion in real time.",
  },
  {
    category: "Gamification",
    q: "How does the XP and Streak system work?",
    a: "You earn XP by completing lessons, passing quizzes with 80%+ accuracy, winning 1v1 game rounds, and participating constructively in community discussions. Completing at least one learning activity each calendar day advances your daily learning streak.",
  },
  {
    category: "General",
    q: "Can I use FinGrow on my mobile phone or tablet?",
    a: "Absolutely. FinGrow is fully responsive and optimized for smartphones, tablets, and desktop computers with touch-friendly controls and high-contrast accessible typography.",
  },
  {
    category: "Safety",
    q: "How do you protect student privacy?",
    a: "We collect minimal information necessary to deliver educational tracking. Students do not need to provide personal phone numbers or financial details, and classroom activity is kept private from public community feeds.",
  },
  {
    category: "Gamification",
    q: "How do 1v1 battle arena matches work?",
    a: "In the 1v1 Arena, you can create a private room code and invite a peer or classmate. Both players answer identical financial questions with a 15-second countdown timer. The server authoritatively tallies scores and awards bonus XP to the winner.",
  },
  {
    category: "Educators",
    q: "Can teachers export grades and analytics for their LMS?",
    a: "Yes. From any classroom dashboard, teachers can view detailed mastery reports and export student completion rates, average scores, and assignment submissions directly to CSV for easy import into Google Classroom or Canvas.",
  },
  {
    category: "Safety",
    q: "What happens if I make mistakes in the financial simulations?",
    a: "That is exactly what FinGrow is for! Making a mistake in our First Salary, Budget Shock, or Investment challenge costs zero real dollars. Every simulation outcome provides clear, constructive debriefs explaining the financial principle at play.",
  },
];

export function FAQClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]); // First two open by default

  const categories = ["All", "General", "Educators", "Gamification", "Safety"];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function toggleIndex(idx: number) {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-fingrow-midnight/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. privacy, virtual money, classrooms)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fingrow-midnight/15 bg-white text-sm text-fingrow-midnight placeholder:text-fingrow-midnight/40 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-fingrow-emerald text-white"
                  : "bg-white text-fingrow-midnight/70 hover:bg-fingrow-midnight/5 border border-fingrow-midnight/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-fingrow-midnight/10 p-6 space-y-2">
            <p className="text-fingrow-midnight font-bold">No questions found matching your search.</p>
            <p className="text-xs text-fingrow-midnight/60">
              Try searching for something else, or <a href="/contact" className="text-fingrow-emerald underline font-semibold">contact our support team</a>.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-fingrow-midnight/10 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-fingrow-emerald"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-fingrow-emerald block mb-0.5">
                        {faq.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-fingrow-midnight">
                        {faq.q}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-fingrow-midnight/50 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-fingrow-emerald" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-fingrow-midnight/75 pl-17 leading-relaxed border-t border-fingrow-midnight/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Help Card */}
      <div className="bg-fingrow-midnight text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xl font-bold text-white">Have a question not listed here?</h4>
          <p className="text-xs text-white/70">
            Our education advisors and technical support team respond within 24 hours.
          </p>
        </div>
        <a href="/contact">
          <button className="px-5 py-2.5 rounded-xl bg-fingrow-lime text-fingrow-midnight text-sm font-bold hover:bg-fingrow-lime/90 transition-colors whitespace-nowrap">
            Ask Us Directly
          </button>
        </a>
      </div>
    </div>
  );
}
