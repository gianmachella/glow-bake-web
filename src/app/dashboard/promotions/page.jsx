"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Edit2, Eye, EyeOff, Image as ImageIcon, Plus, RefreshCw,
  Tag, Trash2, X, QrCode, Users, TicketPercent, Percent, Cookie, Gift,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loading from "@/components/Loading";
import QrScanner from "@/components/QrScanner";
import Swal from "sweetalert2";

// ─── QR Coupons tab ─────────────────────────────────────────────────────────

function QrCouponsTab() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => { fetchPromotions(); }, []);

  async function fetchPromotions() {
    setLoading(true);
    try {
      const res = await fetch("/api/promotions/list");
      setPromotions(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    try {
      const res = await fetch("/api/admin/marketing-list");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const csv = [
        ["Email", "Source", "Name"].join(","),
        ...data.map((r) => `${r.email},${r.source},${r.name}`),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `glowbake_marketing_${new Date().toLocaleDateString()}.csv`;
      a.click();
    } catch {
      Swal.fire("Error", "Could not export the list", "error");
    }
  }

  async function handleScan(decoded) {
    setScanning(false);
    Swal.fire({ title: "Validating...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch("/api/promotions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: decoded }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Valid Coupon!", text: `Apply $1 off to: ${data.email}`, confirmButtonColor: "#ec4899" });
        fetchPromotions();
      } else {
        Swal.fire({ icon: "error", title: "Invalid Coupon", text: data.error || "Code not recognized", confirmButtonColor: "#ef4444" });
      }
    } catch {
      Swal.fire("Error", "Connection error", "error");
    }
  }

  if (loading) return <Loading />;

  const used = promotions.filter((p) => p.used).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 text-center">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Generated</p>
            <p className="text-3xl font-bold text-pink-600 mt-1">{promotions.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 text-center">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Redeemed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{used}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all shadow active:scale-95 text-sm"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => setScanning(true)}
            className="flex items-center gap-2 px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-pink-200 active:scale-95 text-sm"
          >
            <QrCode size={16} /> Scan QR
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow border border-pink-100">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-pink-100 to-pink-200 text-left font-semibold text-pink-700">
              <th className="p-4">Customer Email</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4">Used At</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">No coupons generated yet.</td></tr>
            ) : (
              promotions.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-pink-50/60 transition border-b border-gray-100 last:border-0"
                >
                  <td className="p-4 font-medium">{p.email}</td>
                  <td className="p-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    {p.used
                      ? <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">USED</span>
                      : <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">ACTIVE</span>}
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {p.usedAt ? new Date(p.usedAt).toLocaleString() : "—"}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Scanner modal */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md text-center"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-600">Scan QR Coupon</h2>
                <button onClick={() => setScanning(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
              </div>
              <QrScanner onScanSuccess={handleScan} />
              <p className="mt-4 text-sm text-gray-500 italic">Point the customer&apos;s QR at the camera</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Campaigns tab ───────────────────────────────────────────────────────────

const EMPTY_CAMPAIGN = {
  name: "", description: "", discountType: "PERCENTAGE", discountValue: "",
  startDate: "", endDate: "", active: true, targetType: "ALL",
  targetEmails: "", couponCode: "",
};

function CampaignPreview({ form, imagePreview }) {
  const isPercent = form.discountType === "PERCENTAGE";
  const val = form.discountValue ? `${isPercent ? "" : "$"}${form.discountValue}${isPercent ? "%" : ""}` : "—";

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden max-w-sm w-full">
      {imagePreview && (
        <div className="w-full h-40 overflow-hidden">
          <img src={imagePreview} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <div className="inline-block mb-2 px-2 py-0.5 bg-pink-100 text-pink-600 text-xs font-bold rounded-full uppercase tracking-widest">
          {isPercent ? "% Discount" : "Fixed Discount"}
        </div>
        <h3 className="text-xl font-extrabold text-gray-800 mb-1">{form.name || "Campaign Name"}</h3>
        <p className="text-gray-500 text-sm mb-4">{form.description || "Campaign description..."}</p>
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-center">
          <p className="text-pink-600 font-bold text-3xl">{val} off</p>
          {form.couponCode && <p className="text-xs text-gray-500 mt-1">Code: <strong>{form.couponCode}</strong></p>}
        </div>
        <div className="mt-4 flex gap-2 text-xs text-gray-400 justify-center">
          {form.startDate && <span>From {new Date(form.startDate).toLocaleDateString()}</span>}
          {form.endDate && <span>Until {new Date(form.endDate).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
}

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchCampaigns(); }, []);

  async function fetchCampaigns() {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      setCampaigns(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null); setForm(EMPTY_CAMPAIGN); setImageFile(null); setImagePreview(null);
    setShowPreview(false); setShowForm(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name, description: c.description || "",
      discountType: c.discountType, discountValue: c.discountValue,
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
      active: c.active, targetType: c.targetType,
      targetEmails: c.targetEmails ? c.targetEmails.join(", ") : "",
      couponCode: c.couponCode || "",
    });
    setImageFile(null); setImagePreview(c.image || null);
    setShowPreview(false); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.discountValue) {
      Swal.fire("Missing fields", "Name and discount value are required.", "warning");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("discountType", form.discountType);
      fd.append("discountValue", form.discountValue);
      fd.append("startDate", form.startDate);
      fd.append("endDate", form.endDate);
      fd.append("active", String(form.active));
      fd.append("targetType", form.targetType);
      if (form.targetType === "SPECIFIC") {
        const emails = form.targetEmails.split(",").map((e) => e.trim()).filter(Boolean);
        fd.append("targetEmails", JSON.stringify(emails));
      }
      fd.append("couponCode", form.couponCode);
      if (imageFile) fd.append("image", imageFile);
      if (!imageFile && !imagePreview && editing?.image) fd.append("removeImage", "true");

      const url = editing ? `/api/campaigns/${editing.id}` : "/api/campaigns";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error(await res.text());
      await fetchCampaigns();
      setShowForm(false);
      Swal.fire({ icon: "success", title: editing ? "Updated!" : "Created!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c) {
    const fd = new FormData();
    fd.append("name", c.name);
    fd.append("discountType", c.discountType);
    fd.append("discountValue", c.discountValue);
    fd.append("active", String(!c.active));
    fd.append("targetType", c.targetType);
    await fetch(`/api/campaigns/${c.id}`, { method: "PUT", body: fd });
    fetchCampaigns();
  }

  async function handleDelete(c) {
    const { isConfirmed } = await Swal.fire({
      title: "Delete campaign?", text: `"${c.name}" will be removed.`, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ec4899", confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    await fetch(`/api/campaigns/${c.id}`, { method: "DELETE" });
    fetchCampaigns();
  }

  if (loading) return <Loading />;

  const activeCnt = campaigns.filter((c) => c.active).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {[
            { label: "Total", value: campaigns.length, col: "from-pink-100 to-pink-200 text-pink-700" },
            { label: "Active", value: activeCnt, col: "from-green-100 to-green-200 text-green-700" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.col} px-6 py-4 rounded-2xl text-center shadow-sm`}>
              <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95 text-sm"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag size={44} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No campaigns yet</p>
          <p className="text-sm mt-1">Create your first promotion campaign</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow border border-pink-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {c.image ? (
                <img src={c.image} alt={c.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Tag size={26} className="text-pink-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{c.name}</h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {c.targetType === "ALL" ? "All Customers" : "Specific"}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </div>
                {c.description && <p className="text-gray-500 text-sm line-clamp-1">{c.description}</p>}
                {c.couponCode && <p className="text-xs text-gray-400 mt-1">Code: <strong className="text-gray-600">{c.couponCode}</strong></p>}
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                  {c.startDate && <span>From: {new Date(c.startDate).toLocaleDateString()}</span>}
                  {c.endDate && <span>Until: {new Date(c.endDate).toLocaleDateString()}</span>}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(c)} title={c.active ? "Deactivate" : "Activate"}
                  className={`p-2.5 rounded-xl transition-all ${c.active ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                  {c.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(c)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(c)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Campaign form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-800">{editing ? "Edit Campaign" : "New Campaign"}</h2>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all">
                    <Eye size={15} /> {showPreview ? "Hide Preview" : "Preview"}
                  </button>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X size={20} /></button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Summer Sale" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Coupon Code (optional)</label>
                      <input value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. SUMMER20" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3} placeholder="Describe the promotion..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Type *</label>
                      <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-white">
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Value * {form.discountType === "PERCENTAGE" ? "(%)" : "($)"}
                      </label>
                      <input type="number" min="0" step="0.01" value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        placeholder={form.discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 5.00"}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                  </div>

                  {/* Target */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Audience</label>
                    <div className="flex gap-3">
                      {[
                        { v: "ALL", label: "All Customers", icon: <Users size={14} /> },
                        { v: "SPECIFIC", label: "Specific Customers", icon: <Tag size={14} /> },
                      ].map(({ v, label, icon }) => (
                        <button key={v} type="button" onClick={() => setForm({ ...form, targetType: v })}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.targetType === v ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                    {form.targetType === "SPECIFIC" && (
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500 mb-1">Customer emails (comma-separated)</label>
                        <textarea value={form.targetEmails} onChange={(e) => setForm({ ...form, targetEmails: e.target.value })}
                          placeholder="customer@email.com, another@email.com" rows={2}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition resize-none" />
                      </div>
                    )}
                    {form.targetType === "GROUP" && (
                      <p className="mt-2 text-xs text-gray-400 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                        Customer groups — coming soon
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                      <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                      <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image (optional)</label>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="" className="h-28 rounded-xl object-cover border border-gray-200" />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-pink-200 rounded-xl text-sm text-pink-500 hover:border-pink-400 hover:bg-pink-50 transition-all">
                        <ImageIcon size={16} /> Upload image
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files[0]; if (!f) return;
                      setImageFile(f); setImagePreview(URL.createObjectURL(f));
                    }} />
                  </div>

                  {/* Active toggle */}
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 transition-colors">
                    <div onClick={() => setForm({ ...form, active: !form.active })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.active ? "bg-pink-500" : "bg-gray-200"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? "left-6" : "left-1"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">Active</p>
                      <p className="text-gray-400 text-xs mt-0.5">Eligible customers can see and use this promotion</p>
                    </div>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-200 disabled:opacity-60 flex items-center justify-center gap-2">
                      {saving && <RefreshCw size={16} className="animate-spin" />}
                      {saving ? "Saving..." : editing ? "Save Changes" : "Create Campaign"}
                    </button>
                  </div>
                </form>

                {/* Preview panel */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }} animate={{ width: 380, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                      className="border-l border-gray-100 bg-pink-50 flex items-center justify-center p-8 overflow-hidden"
                    >
                      <div className="w-full max-w-xs">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Live Preview</p>
                        <CampaignPreview form={form} imagePreview={imagePreview} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Automatic Discounts tab ─────────────────────────────────────────────────

const EMPTY_AUTO_DISCOUNT = {
  cookieId: "",
  type: "FIXED",
  discountType: "FIXED",
  discountValue: "",
  minQuantity: 3,
  active: true,
  startDate: "",
  endDate: "",
};

function AutoDiscountsTab() {
  const [discounts, setDiscounts] = useState([]);
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_AUTO_DISCOUNT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDiscounts();
    fetchCookies();
  }, []);

  async function fetchDiscounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/auto-discounts");
      setDiscounts(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function fetchCookies() {
    try {
      const res = await fetch("/api/cookies");
      setCookies(await res.json());
    } catch {
      // non-critical — cookie select will just be empty
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_AUTO_DISCOUNT);
    setShowForm(true);
  }

  function openEdit(d) {
    setEditing(d);
    setForm({
      cookieId: d.cookieId,
      type: d.type,
      discountType: d.discountType,
      discountValue: d.discountValue,
      minQuantity: d.minQuantity,
      active: d.active,
      startDate: d.startDate ? d.startDate.slice(0, 10) : "",
      endDate: d.endDate ? d.endDate.slice(0, 10) : "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.cookieId || !form.discountValue) {
      Swal.fire("Missing fields", "Cookie and discount value are required.", "warning");
      return;
    }
    if (form.type === "VOLUME" && (!form.minQuantity || form.minQuantity < 2)) {
      Swal.fire("Invalid quantity", "Volume discounts need a minimum quantity of 2 or more.", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        cookieId: form.cookieId,
        type: form.type,
        discountType: form.type === "VOLUME" ? form.discountType : "FIXED",
        discountValue: parseFloat(form.discountValue),
        minQuantity: form.type === "VOLUME" ? parseInt(form.minQuantity, 10) : 1,
        active: form.active,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      const url = editing ? `/api/auto-discounts/${editing.id}` : "/api/auto-discounts";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Request failed");
      await fetchDiscounts();
      setShowForm(false);
      Swal.fire({ icon: "success", title: editing ? "Updated!" : "Created!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d) {
    await fetch(`/api/auto-discounts/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cookieId: d.cookieId,
        type: d.type,
        discountType: d.discountType,
        discountValue: d.discountValue,
        minQuantity: d.minQuantity,
        active: !d.active,
        startDate: d.startDate,
        endDate: d.endDate,
      }),
    });
    fetchDiscounts();
  }

  async function handleDelete(d) {
    const { isConfirmed } = await Swal.fire({
      title: "Delete discount?",
      text: `The discount rule for "${d.cookie?.name || "this cookie"}" will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    await fetch(`/api/auto-discounts/${d.id}`, { method: "DELETE" });
    fetchDiscounts();
  }

  if (loading) return <Loading />;

  const activeCnt = discounts.filter((d) => d.active).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {[
            { label: "Total", value: discounts.length, col: "from-pink-100 to-pink-200 text-pink-700" },
            { label: "Active", value: activeCnt, col: "from-green-100 to-green-200 text-green-700" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.col} px-6 py-4 rounded-2xl text-center shadow-sm`}>
              <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95 text-sm"
        >
          <Plus size={16} /> New Discount
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Percent size={44} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No automatic discounts yet</p>
          <p className="text-sm mt-1">Create a per-cookie discount applied automatically at checkout</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {discounts.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow border border-pink-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Cookie size={24} className="text-pink-300" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{d.cookie?.name || "Unknown cookie"}</h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    {d.type === "VOLUME" ? "Volume / Bulk" : "Fixed Amount"}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {d.discountType === "PERCENTAGE" ? `${d.discountValue}% off` : `$${d.discountValue} off`}
                  </span>
                  {d.type === "VOLUME" && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                      Buy {d.minQuantity}+
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${d.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {d.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                  {d.startDate && <span>From: {new Date(d.startDate).toLocaleDateString()}</span>}
                  {d.endDate && <span>Until: {new Date(d.endDate).toLocaleDateString()}</span>}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(d)} title={d.active ? "Deactivate" : "Activate"}
                  className={`p-2.5 rounded-xl transition-all ${d.active ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                  {d.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(d)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(d)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Discount form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-800">{editing ? "Edit Discount" : "New Automatic Discount"}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cookie *</label>
                  <select value={form.cookieId} onChange={(e) => setForm({ ...form, cookieId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-white">
                    <option value="">Select a cookie</option>
                    {cookies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Strategy</label>
                  <div className="flex gap-3">
                    {[
                      { v: "FIXED", label: "Fixed Amount", icon: <Tag size={14} /> },
                      { v: "VOLUME", label: "Volume / Bulk", icon: <Percent size={14} /> },
                    ].map(({ v, label, icon }) => (
                      <button key={v} type="button" onClick={() => setForm({ ...form, type: v, discountType: v === "FIXED" ? "FIXED" : form.discountType })}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === v ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.type === "FIXED" ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount off per cookie ($) *</label>
                    <input type="number" min="0" step="0.01" value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      placeholder="e.g. 1.00"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum quantity *</label>
                      <input type="number" min="2" step="1" value={form.minQuantity}
                        onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                        placeholder="e.g. 3"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount type *</label>
                      <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-white">
                        <option value="FIXED">Fixed ($)</option>
                        <option value="PERCENTAGE">Percentage (%)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Value off per cookie {form.discountType === "PERCENTAGE" ? "(%)" : "($)"} *
                      </label>
                      <input type="number" min="0" step="0.01" value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        placeholder={form.discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 0.50"}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 transition-colors">
                  <div onClick={() => setForm({ ...form, active: !form.active })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.active ? "bg-pink-500" : "bg-gray-200"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? "left-6" : "left-1"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">Active</p>
                    <p className="text-gray-400 text-xs mt-0.5">Applied automatically at checkout when eligible</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-200 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <RefreshCw size={16} className="animate-spin" />}
                    {saving ? "Saving..." : editing ? "Save Changes" : "Create Discount"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Web Promotions tab (advertised on the home page, applied automatically) ─

const EMPTY_WEB_PROMOTION = {
  name: "",
  description: "",
  appliesToAll: false,
  cookieId: "",
  type: "FIXED",
  discountType: "FIXED",
  discountValue: "",
  minQuantity: 3,
  active: true,
  startDate: "",
  endDate: "",
};

function WebPromotionsTab() {
  const [promotions, setPromotions] = useState([]);
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_WEB_PROMOTION);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    fetchPromotions();
    fetchCookies();
  }, []);

  async function fetchPromotions() {
    setLoading(true);
    try {
      const res = await fetch("/api/web-promotions");
      setPromotions(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function fetchCookies() {
    try {
      const res = await fetch("/api/cookies");
      setCookies(await res.json());
    } catch {
      // non-critical — cookie select will just be empty
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_WEB_PROMOTION);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      appliesToAll: !p.cookieId,
      cookieId: p.cookieId || "",
      type: p.type,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minQuantity: p.minQuantity,
      active: p.active,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      endDate: p.endDate ? p.endDate.slice(0, 10) : "",
    });
    setImageFile(null);
    setImagePreview(p.image || null);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || (!form.appliesToAll && !form.cookieId) || !form.discountValue) {
      Swal.fire("Missing fields", "Name, cookie (or All Cookies) and discount value are required.", "warning");
      return;
    }
    if (form.type === "VOLUME" && (!form.minQuantity || form.minQuantity < 2)) {
      Swal.fire("Invalid quantity", "Volume discounts need a minimum quantity of 2 or more.", "warning");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("cookieId", form.appliesToAll ? "" : form.cookieId);
      fd.append("type", form.type);
      fd.append("discountType", form.type === "VOLUME" ? form.discountType : "FIXED");
      fd.append("discountValue", form.discountValue);
      fd.append("minQuantity", form.type === "VOLUME" ? form.minQuantity : 1);
      fd.append("active", String(form.active));
      fd.append("startDate", form.startDate);
      fd.append("endDate", form.endDate);
      if (imageFile) fd.append("image", imageFile);
      if (!imageFile && !imagePreview && editing?.image) fd.append("removeImage", "true");

      const url = editing ? `/api/web-promotions/${editing.id}` : "/api/web-promotions";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error((await res.json())?.error || "Request failed");
      await fetchPromotions();
      setShowForm(false);
      Swal.fire({ icon: "success", title: editing ? "Updated!" : "Created!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p) {
    const fd = new FormData();
    fd.append("name", p.name);
    fd.append("description", p.description || "");
    fd.append("cookieId", p.cookieId || "");
    fd.append("type", p.type);
    fd.append("discountType", p.discountType);
    fd.append("discountValue", p.discountValue);
    fd.append("minQuantity", p.minQuantity);
    fd.append("active", String(!p.active));
    if (p.startDate) fd.append("startDate", p.startDate.slice(0, 10));
    if (p.endDate) fd.append("endDate", p.endDate.slice(0, 10));
    await fetch(`/api/web-promotions/${p.id}`, { method: "PUT", body: fd });
    fetchPromotions();
  }

  async function handleDelete(p) {
    const { isConfirmed } = await Swal.fire({
      title: "Delete promotion?",
      text: `"${p.name}" and its claimed codes will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    await fetch(`/api/web-promotions/${p.id}`, { method: "DELETE" });
    fetchPromotions();
  }

  if (loading) return <Loading />;

  const activeCnt = promotions.filter((p) => p.active).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
          {[
            { label: "Total", value: promotions.length, col: "from-pink-100 to-pink-200 text-pink-700" },
            { label: "Active", value: activeCnt, col: "from-green-100 to-green-200 text-green-700" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.col} px-6 py-4 rounded-2xl text-center shadow-sm`}>
              <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95 text-sm"
        >
          <Plus size={16} /> New Web Promotion
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Gift size={44} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No web promotions yet</p>
          <p className="text-sm mt-1">Create a discount that&apos;s advertised on the home page and applied automatically at checkout</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {promotions.map((p, i) => {
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow border border-pink-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Gift size={26} className="text-pink-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                      {p.type === "VOLUME" ? "Volume / Bulk" : "Fixed Amount"}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {p.discountType === "PERCENTAGE" ? `${p.discountValue}% off` : `$${p.discountValue} off`}
                    </span>
                    {p.type === "VOLUME" && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        Buy {p.minQuantity}+
                      </span>
                    )}
                    {!p.cookieId && (
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">
                        All Cookies
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {p.description && <p className="text-gray-500 text-sm line-clamp-1">{p.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                    <span>Cookie: {p.cookieId ? p.cookie?.name || "Unknown" : "All Cookies"}</span>
                    {p.startDate && <span>From: {new Date(p.startDate).toLocaleDateString()}</span>}
                    {p.endDate && <span>Until: {new Date(p.endDate).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(p)} title={p.active ? "Deactivate" : "Activate"}
                    className={`p-2.5 rounded-xl transition-all ${p.active ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                    {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => openEdit(p)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(p)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Web promotion form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-800">{editing ? "Edit Web Promotion" : "New Web Promotion"}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Summer Cookie Deal"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3} placeholder="Describe the promotion..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Image (optional)</label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="" className="h-28 rounded-xl object-cover border border-gray-200" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-pink-200 rounded-xl text-sm text-pink-500 hover:border-pink-400 hover:bg-pink-50 transition-all">
                      <ImageIcon size={16} /> Upload image
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files[0]; if (!f) return;
                    setImageFile(f); setImagePreview(URL.createObjectURL(f));
                  }} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Applies To</label>
                  <div className="flex gap-3 mb-3">
                    {[
                      { v: false, label: "Specific Cookie", icon: <Cookie size={14} /> },
                      { v: true, label: "All Cookies", icon: <Gift size={14} /> },
                    ].map(({ v, label, icon }) => (
                      <button key={String(v)} type="button"
                        onClick={() => setForm({ ...form, appliesToAll: v, cookieId: v ? "" : form.cookieId })}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.appliesToAll === v ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                  {!form.appliesToAll && (
                    <select value={form.cookieId} onChange={(e) => setForm({ ...form, cookieId: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-white">
                      <option value="">Select a cookie</option>
                      {cookies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Strategy</label>
                  <div className="flex gap-3">
                    {[
                      { v: "FIXED", label: "Fixed Amount", icon: <Tag size={14} /> },
                      { v: "VOLUME", label: "Volume / Bulk", icon: <Percent size={14} /> },
                    ].map(({ v, label, icon }) => (
                      <button key={v} type="button" onClick={() => setForm({ ...form, type: v, discountType: v === "FIXED" ? "FIXED" : form.discountType })}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === v ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.type === "FIXED" ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount off per cookie ($) *</label>
                    <input type="number" min="0" step="0.01" value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      placeholder="e.g. 1.00"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum quantity *</label>
                      <input type="number" min="2" step="1" value={form.minQuantity}
                        onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                        placeholder="e.g. 3"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount type *</label>
                      <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-white">
                        <option value="FIXED">Fixed ($)</option>
                        <option value="PERCENTAGE">Percentage (%)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Value off per cookie {form.discountType === "PERCENTAGE" ? "(%)" : "($)"} *
                      </label>
                      <input type="number" min="0" step="0.01" value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        placeholder={form.discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 0.50"}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition" />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 transition-colors">
                  <div onClick={() => setForm({ ...form, active: !form.active })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.active ? "bg-pink-500" : "bg-gray-200"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? "left-6" : "left-1"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">Active</p>
                    <p className="text-gray-400 text-xs mt-0.5">Shown on the home page and applied automatically at checkout</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-200 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <RefreshCw size={16} className="animate-spin" />}
                    {saving ? "Saving..." : editing ? "Save Changes" : "Create Promotion"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main promotions page ────────────────────────────────────────────────────

const TABS = [
  { id: "campaigns", label: "Campaigns", icon: <TicketPercent size={16} /> },
  { id: "qr", label: "QR Coupons", icon: <QrCode size={16} /> },
  { id: "auto", label: "Automatic Discounts", icon: <Percent size={16} /> },
  { id: "web", label: "Web Promotions", icon: <Gift size={16} /> },
];

export default function PromotionsPage() {
  const [tab, setTab] = useState("campaigns");

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6 md:p-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-pink-100 rounded-xl">
            <TicketPercent className="text-pink-600" size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">Promotions</h1>
        </div>
        <p className="text-gray-500 text-sm ml-14">Manage discount campaigns and QR coupons</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 shadow border border-pink-100 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : "text-gray-500 hover:text-pink-600"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "campaigns" && <CampaignsTab />}
      {tab === "qr" && <QrCouponsTab />}
      {tab === "auto" && <AutoDiscountsTab />}
      {tab === "web" && <WebPromotionsTab />}
    </div>
  );
}
