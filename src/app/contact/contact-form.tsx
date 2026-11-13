"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("Educator Pilot");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-fingrow-midnight">Message Received!</h3>
        <p className="text-sm text-fingrow-midnight/70 max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out, <strong className="text-fingrow-midnight">{name}</strong>. A member of our education team will respond to <strong className="text-fingrow-midnight">{email}</strong> within 1 business day.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          Send Another Note
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Full Name"
          placeholder="e.g. Professor Sarah Jenkins"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. sjenkins@school.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-fingrow-midnight">
          Inquiry Type
        </label>
        <select
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-sm focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
        >
          <option value="Educator Pilot">Educator / School Pilot Request</option>
          <option value="Curriculum Question">Curriculum / Content Feedback</option>
          <option value="Bug Report">Technical Bug Report</option>
          <option value="General Inquiry">General Partnership Inquiry</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-fingrow-midnight">
          Your Message
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your classroom, school, or inquiry..."
          className="w-full px-4 py-2.5 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-sm placeholder:text-fingrow-midnight/40 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
          required
        />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full justify-center">
        <Send className="w-4 h-4 mr-2" />
        <span>Send Inquiry</span>
      </Button>
    </form>
  );
}
