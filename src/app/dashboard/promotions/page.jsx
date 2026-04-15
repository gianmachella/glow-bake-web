"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import QrScanner from "@/components/QrScanner"; // Asegúrate de crear este componente como vimos antes
import Swal from "sweetalert2";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar promociones al inicio
  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    try {
      const res = await fetch("/api/promotions/list"); // Necesitaremos esta ruta para ver el listado
      if (!res.ok) throw new Error("Failed to fetch promotions");
      const data = await res.json();
      setPromotions(data);
    } catch {
      // Si aún no creas la ruta de listado, no bloqueamos la app
      console.log("No se pudo cargar la lista de cupones");
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/admin/marketing-list");
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to fetch list");

      // Crear el encabezado del CSV
      const headers = ["Email", "Source", "Name"];
      const csvRows = data.map(
        (item) => `${item.email},${item.source},${item.name}`,
      );

      // Unir todo con saltos de línea
      const csvContent = [headers.join(","), ...csvRows].join("\n");

      // Crear el archivo para descarga
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `glowbake_marketing_list_${new Date().toLocaleDateString()}.csv`,
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire("Error", "Could not export the list", "error");
    }
  };

  const handleScanSuccess = async (decodedText) => {
    setIsScannerOpen(false); // Cerramos el scanner al detectar algo

    // Mostramos un loader mientras validamos
    Swal.fire({
      title: "Validando Cupón...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch("/api/promotions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: decodedText }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Cupón Válido!",
          text: `Aplicar $1 de descuento a: ${data.email}`,
          confirmButtonColor: "#ec4899", // Rosa GlowBake
        });
        fetchPromotions(); // Recargamos la lista
      } else {
        Swal.fire({
          icon: "error",
          title: "Cupón Inválido",
          text: data.error || "Este código no es válido",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      Swal.fire("Error", "Problema de conexión con el servidor", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}

      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Market Promotions
          </h1>

          <div className="flex gap-3">
            {/* Botón de Exportar */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all shadow-lg active:scale-95"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-pink-600">Promociones</h1>
          <p className="text-gray-500">Farmers Market de Lucas</p>
        </div>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl shadow-lg font-bold transition flex items-center gap-2 transform hover:scale-105"
        >
          <span className="text-2xl">📷</span> ESCANEAR CUPÓN
        </button>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 text-center">
          <p className="text-gray-500 font-medium">Cupones Generados</p>
          <p className="text-3xl font-bold text-pink-600">
            {promotions.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 text-center">
          <p className="text-gray-500 font-medium">Cupones Redimidos</p>
          <p className="text-3xl font-bold text-green-500">
            {promotions.filter((p) => p.used).length}
          </p>
        </div>
      </div>

      {/* Tabla de Seguimiento */}
      <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-pink-100 to-pink-200 text-left font-semibold text-pink-700">
              <th className="p-4">Email del Cliente</th>
              <th className="p-4">Fecha Creación</th>
              <th className="p-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-400">
                  No hay cupones generados todavía.
                </td>
              </tr>
            ) : (
              promotions.map((p, idx) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-pink-50/70 transition"
                >
                  <td className="p-4 border-b border-gray-100 font-medium">
                    {p.email}
                  </td>
                  <td className="p-4 border-b border-gray-100">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center">
                    {p.used ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        USADO
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        ACTIVO
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal del Scanner */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md text-center"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-600">
                  Escaneando QR
                </h2>
                <button
                  onClick={() => setIsScannerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Cerrar
                </button>
              </div>

              <QrScanner onScanSuccess={handleScanSuccess} />

              <p className="mt-4 text-sm text-gray-500 italic">
                Coloca el QR del cliente frente a la cámara
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
