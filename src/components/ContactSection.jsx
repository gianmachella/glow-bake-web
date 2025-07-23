"use client";

export default function ContactSection() {
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
        <form className="grid gap-6">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-pink-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-pink-500"
          />
          <textarea
            rows={5}
            placeholder="Your Message"
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-pink-500"
          />
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
