import React from "react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Building2, HelpCircle } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact & Institutional Demo Request — FinGrow",
  description:
    "Request an institutional classroom pilot, report an issue, or reach out to the FinGrow education team.",
  openGraph: {
    title: "Contact & Institutional Demo Request — FinGrow",
    description: "Request an institutional classroom pilot or reach out to the FinGrow education team.",
    url: "https://fingrow.dev/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="emerald" size="sm">GET IN TOUCH</Badge>
        <h1 className="text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Contact FinGrow Team
        </h1>
        <p className="text-fingrow-midnight/70 text-base leading-relaxed max-w-xl mx-auto">
          Request an institutional school demo, report an issue, or ask questions about our curriculum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-fingrow-midnight">School & District Pilots</h3>
              <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                We assist schools with classroom onboarding, customized curricula, and student progress reports.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fingrow-lime/20 text-[#3f7700] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-fingrow-midnight">Direct Email</h3>
              <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                Reach our team directly at <strong className="text-fingrow-midnight">hello@fingrow.dev</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fingrow-midnight/10 text-fingrow-midnight flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-fingrow-midnight">Instant FAQ</h3>
              <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                Check our <a href="/faq" className="text-fingrow-emerald font-semibold underline underline-offset-2">FAQ section</a> for quick answers about student privacy and features.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
