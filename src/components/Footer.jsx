export default function Footer() {
  return (
    <footer className="bg-pink-100 text-gray-800 py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
        {/* Logo + Eslogan */}
        <div>
          <img
            src="/images/logo-gb.png"
            alt="Glow Bake Logo"
            className="h-10 mx-auto md:mx-0 mb-4"
          />
          <p className="text-sm italic">So Sweet. So Handmade. So Glow Bake.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3 text-pink-700">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/menu" className="hover:text-pink-600">
                Menu
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-pink-600">
                About
              </a>
            </li>
            <li>
              <a href="/cart" className="hover:text-pink-600">
                Cart
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3 text-pink-700">Contact Us</h3>
          <p className="text-sm mb-1">📍 Princeton, TX</p>
          <p className="text-sm mb-1">📧 glowbake@email.com</p>
          <p className="text-sm mb-3">📱 (123) 456-7890</p>
          <div className="flex justify-center md:justify-start gap-4">
            <a href="#" className="hover:text-pink-600">
              <img src="/icons/instagram.svg" alt="Instagram" className="h-6" />
            </a>
            <a href="#" className="hover:text-pink-600">
              <img src="/icons/facebook.svg" alt="Facebook" className="h-6" />
            </a>
          </div>
        </div>

        {/* Contact Form Link or WhatsApp */}
        <div>
          <h3 className="font-semibold mb-3 text-pink-700">Let’s Talk</h3>
          <p className="text-sm mb-3">Have a question or a custom order?</p>
          <a
            href="https://wa.me/1XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-pink-600 text-white rounded-full text-sm hover:bg-pink-700 transition"
          >
            Contact via WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Glow Bake. All rights reserved.
      </div>
    </footer>
  );
}
