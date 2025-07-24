"use client";

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
    <section id="contact" className="w-full px-6 py-20 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-script text-pink-700 mb-6">
          Contact Us
        </h2>
        <p className="text-gray-700 text-base md:text-lg mb-10">
          Have a question, want to place a custom order, or just want to say hi?
          We’d love to hear from you!
        </p>
        <form onSubmit={handleSubmit} className="grid gap-6 text-left">
          <div>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-pink-600 text-white px-6 py-3 rounded hover:bg-pink-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
