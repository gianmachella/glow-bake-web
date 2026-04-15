"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import Swal from "sweetalert2";

export default function POSPage() {
  const [cookies, setCookies] = useState([]);
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // Estado para el método seleccionado

  useEffect(() => {
    fetch("/api/cookies")
      .then((res) => res.json())
      .then((data) => setCookies(data))
      .catch((err) => console.error("Error cargando galletas:", err));
  }, []);

  const addToCart = (cookie) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === cookie.id);
      if (existing) {
        return prev.map((item) =>
          item.id === cookie.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...cookie, quantity: 1 }];
    });
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!paymentMethod || cart.length === 0) return;
    setLoading(true);

    try {
      const saleData = {
        items: cart.map((item) => ({
          cookieId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        deliveryDay: "Event",
        customerEmail: email || null,
        paymentMethod,
        total,
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (res.ok) {
        Swal.fire({
          title: "¡Venta Exitosa!",
          text: email ? `Recibo enviado a ${email}` : "Venta registrada",
          icon: "success",
          confirmButtonColor: "#ec4899",
        });
        setCart([]);
        setEmail("");
        setPaymentMethod("");
      } else {
        throw new Error("Error en el servidor");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar la venta", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6">
      {/* GRID DE GALLETAS */}
      <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
        {cookies.map((cookie) => (
          <motion.div
            key={cookie.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(cookie)}
            className="relative bg-white p-4 rounded-3xl shadow-sm border-2 border-transparent hover:border-pink-300 transition-all cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-100 mb-2 group-hover:border-pink-300 transition-colors">
              <img
                src={cookie.image || "/images/cookies/default.png"}
                alt={cookie.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold text-gray-800 uppercase text-xs">
              {cookie.name}
            </h3>
            <p className="text-pink-600 font-black">
              ${cookie.price.toFixed(2)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CARRITO Y PAGO */}
      <div className="w-full lg:w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-pink-100 flex flex-col overflow-hidden">
        <div className="p-6 bg-pink-500 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black italic flex items-center gap-2">
              <ShoppingCart size={20} /> CURRENT ORDER
            </h2>
            <span className="bg-white text-pink-500 px-3 py-1 rounded-full text-xs font-bold">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </div>
        </div>

        {/* Lista de productos en carrito */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl group"
              >
                <div className="flex items-center gap-3">
                  {/* BOTONES REDONDOS DE CANTIDAD */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 rounded-full bg-white border border-pink-200 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors shadow-sm"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>

                    <span className="font-black text-gray-800 text-xs">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-pink-500 font-bold">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic py-10 text-center">
              <p>No hay galletas seleccionadas</p>
            </div>
          )}
        </div>

        {/* Sección de Pago */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email del cliente (Opcional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              Total a Pagar
            </span>
            <span className="text-3xl font-black text-gray-800">
              ${total.toFixed(2)}
            </span>
          </div>

          {/* Selector de Método de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("Cash")}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl font-bold border-2 transition-all ${
                paymentMethod === "Cash"
                  ? "border-pink-500 bg-pink-50 text-pink-600 shadow-sm"
                  : "border-gray-200 bg-white text-gray-400 hover:border-pink-200"
              }`}
            >
              <Banknote size={20} />
              <span className="text-[10px]">CASH</span>
              {paymentMethod === "Cash" && (
                <CheckCircle2 size={12} className="text-pink-500" />
              )}
            </button>

            <button
              onClick={() => setPaymentMethod("Card")}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl font-bold border-2 transition-all ${
                paymentMethod === "Card"
                  ? "border-pink-500 bg-pink-50 text-pink-600 shadow-sm"
                  : "border-gray-200 bg-white text-gray-400 hover:border-pink-200"
              }`}
            >
              <CreditCard size={20} />
              <span className="text-[10px]">CARD</span>
              {paymentMethod === "Card" && (
                <CheckCircle2 size={12} className="text-pink-500" />
              )}
            </button>
          </div>

          {/* Botón de Procesar */}
          <AnimatePresence>
            {paymentMethod && cart.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                disabled={loading}
                onClick={handleCheckout}
                className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black text-md shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>CONFIRM & PROCESS ORDER</>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
