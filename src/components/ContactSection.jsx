"use client";

import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/motion/SectionHeading";
import Swal from "sweetalert2";
import { useState } from "react";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.includes("@")) newErrors.email = "Enter a valid email.";
    if (!message.trim()) newErrors.message = "Message cannot be empty.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const res = await fetch("/api/send-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      Swal.fire("Message Sent!", "We'll get back to you soon!", "success");
      setName("");
      setEmail("");
      setMessage("");
    } else {
      Swal.fire("Oops!", "Something went wrong. Try again later.", "error");
    }
  };

  return (
    <section id="contact" className="w-full px-6 py-24 md:py-32 bg-[#fffaf7]">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="Say hello"
          title="Contact us"
          lead="Have a question, want to place a custom order, or just want to say hi? We’d love to hear from you!"
        />
        <Reveal
          as="form"
          onSubmit={handleSubmit}
          className="grid gap-5 text-left rounded-[2rem] bg-white p-6 sm:p-10 shadow-xl shadow-pink-900/5 ring-1 ring-pink-100"
        >
          <div>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 text-stone-800 placeholder-stone-400 transition focus:bg-white focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 text-stone-800 placeholder-stone-400 transition focus:bg-white focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <textarea
              rows={5}
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 text-stone-800 placeholder-stone-400 transition focus:bg-white focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="justify-self-center sm:justify-self-end rounded-full bg-pink-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition hover:-translate-y-0.5 hover:bg-pink-700 active:scale-95"
          >
            Send Message
          </button>
        </Reveal>
      </div>
    </section>
  );
}
