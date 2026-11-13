import React from "react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { FAQClient } from "./faq-client";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — FinGrow",
  description:
    "Find answers to common questions about FinGrow's educational platform, virtual simulators, student privacy, and educator tools.",
  openGraph: {
    title: "Frequently Asked Questions — FinGrow",
    description: "Got questions about FinGrow? Learn about our 100% simulated money engine, classroom tools, and free access.",
    url: "https://fingrow.dev/faq",
  },
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is FinGrow free for students and schools?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All core curriculum modules, financial simulations, calculators, and educator classroom tools are completely free for students, teachers, and accredited schools."
        }
      },
      {
        "@type": "Question",
        "name": "Does FinGrow link to real bank accounts or brokerage apps?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. FinGrow is strictly an educational sandbox. We never connect to real bank accounts, never execute trades on live stock exchanges, and never handle real-money financial deposits."
        }
      },
      {
        "@type": "Question",
        "name": "How do educators create classrooms and assign homework?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Teachers can sign up as an Educator, click 'Create Classroom', and generate a unique join code and QR code. You can assign any module or quiz with specific due dates and track student completion in real time."
        }
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center space-y-3">
        <Badge variant="emerald" size="sm">QUESTIONS & ANSWERS</Badge>
        <h1 className="text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-fingrow-midnight/70 text-base leading-relaxed max-w-xl mx-auto">
          Everything you need to know about our virtual simulation engine, student privacy safeguards, and classroom features.
        </p>
      </div>

      <FAQClient />
    </div>
  );
}
