export default function Footer() {
  return (
    <footer className="relative bg-pink-100 text-gray-800 py-10 px-6 overflow-hidden">
      {/* Imagen con transparencia encima del fondo */}
      <div className="absolute inset-0">
        <img
          src="/images/footer-bg.png" // reemplaza con tu imagen
          alt="Decorative Overlay"
          className="w-full h-full object-cover opacity-7"
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
        <div>
          <img
            src="/images/logo-gb.png"
            alt="Glow Bake Logo"
            className="h-40 mx-auto md:mx-0 mb-4 hover:scale-145 transition-transform duration-200"
          />
          <p className="text-sm italic">So Sweet. So Handmade. So Glow Bake.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3 text-pink-700">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="#menu" className="hover:text-pink-600">
                Menu
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-pink-600">
                About
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-pink-600">
                Testimonials
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-pink-600">
                Contact us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h3 className="font-semibold mb-3 text-pink-700">Contact Us</h3>
          <p className="text-sm mb-1">📍 Princeton, TX</p>
          <p className="text-sm mb-1 flex items-center gap-2">
            <img src="/images/gmail.png" alt="gmail" className="h-6" />
            glow.bake.tx@gmail.com
          </p>
          <p className="text-sm mb-3">📱 (945) 400-5808</p>
          <div className="flex justify-center md:justify-start gap-4">
            <a
              href="https://www.instagram.com/glow.bake/"
              className="hover:text-pink-600 hover:scale-205 transition-transform duration-200"
              target="_blank"
            >
              <img
                src="/images/instagram.png"
                alt="Instagram"
                className="h-6"
              />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61578248566814"
              className="hover:text-pink-600 hover:scale-205 transition-transform duration-200"
              target="_blank"
            >
              <img src="/images/facebook.png" alt="Facebook" className="h-6" />
            </a>
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <h3 className="font-semibold mb-3 text-pink-700">Let’s Talk</h3>
          <p className="text-sm mb-3">Have a question or a custom order?</p>
          <a
            href="https://wa.me/19454005808"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-pink-600 text-white rounded-full text-sm hover:scale-145 transition-transform duration-200"
          >
            Contact via WhatsApp
          </a>
        </div>
      </div>

      <div className="relative z-10 mt-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Glow Bake. All rights reserved.
      </div>
    </footer>
  );
}
