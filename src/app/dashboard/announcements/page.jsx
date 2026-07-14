"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Eye, EyeOff, Image as ImageIcon, Plus, RefreshCw, Trash2, X, Megaphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";

const EMPTY_FORM = {
  title: "",
  content: "",
  startDate: "",
  endDate: "",
  enabled: true,
  alwaysShow: false,
};

function AnnouncementPreview({ form, imagePreview }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-pink-100">
      {imagePreview && (
        <div className="w-full h-44 overflow-hidden">
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-7">
        <div className="inline-block mb-3 px-3 py-1 bg-pink-100 text-pink-600 text-xs font-bold rounded-full uppercase tracking-widest">
          Glow Bake
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-3 leading-tight">
          {form.title || "Announcement Title"}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
          {form.content || "Your announcement content will appear here..."}
        </p>
        <button className="mt-6 w-full py-3 bg-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 cursor-default">
          Got it!
        </button>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements/admin");
      const data = await res.json();
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setShowPreview(false);
    setShowForm(true);
  }

  function openEdit(a) {
    setEditing(a);
    setForm({
      title: a.title,
      content: a.content,
      startDate: a.startDate ? a.startDate.slice(0, 10) : "",
      endDate: a.endDate ? a.endDate.slice(0, 10) : "",
      enabled: a.enabled,
      alwaysShow: a.alwaysShow,
    });
    setImageFile(null);
    setImagePreview(a.image || null);
    setShowPreview(false);
    setShowForm(true);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      Swal.fire("Missing fields", "Title and content are required.", "warning");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append("image", imageFile);
      if (!imageFile && !imagePreview && editing?.image) fd.append("removeImage", "true");

      const url = editing ? `/api/announcements/${editing.id}` : "/api/announcements";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });

      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
      setShowForm(false);
      Swal.fire({ icon: "success", title: editing ? "Updated!" : "Created!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(a) {
    const fd = new FormData();
    fd.append("title", a.title);
    fd.append("content", a.content);
    fd.append("enabled", String(!a.enabled));
    fd.append("alwaysShow", String(a.alwaysShow));
    if (a.startDate) fd.append("startDate", a.startDate.slice(0, 10));
    if (a.endDate) fd.append("endDate", a.endDate.slice(0, 10));
    await fetch(`/api/announcements/${a.id}`, { method: "PUT", body: fd });
    fetchAll();
  }

  async function handleDelete(a) {
    const { isConfirmed } = await Swal.fire({
      title: "Delete announcement?",
      text: `"${a.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    await fetch(`/api/announcements/${a.id}`, { method: "DELETE" });
    fetchAll();
  }

  const active = announcements.filter((a) => a.enabled).length;
  const total = announcements.length;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-pink-100 rounded-xl">
              <Megaphone className="text-pink-600" size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">Announcements</h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">Manage popup announcements shown to website visitors</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-200 active:scale-95"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total", value: total, color: "from-pink-100 to-pink-200 text-pink-700" },
          { label: "Active", value: active, color: "from-green-100 to-green-200 text-green-700" },
          { label: "Inactive", value: total - active, color: "from-gray-100 to-gray-200 text-gray-600" },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} p-5 rounded-2xl shadow-sm text-center`}>
            <p className="text-sm font-medium opacity-80">{s.label}</p>
            <p className="text-3xl font-extrabold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {announcements.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Megaphone size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No announcements yet</p>
          <p className="text-sm">Create your first popup announcement for visitors</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow border border-pink-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {a.image && (
                <img src={a.image} alt={a.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              )}
              {!a.image && (
                <div className="w-20 h-20 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={28} className="text-pink-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{a.title}</h3>
                  {a.alwaysShow && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Always Show</span>
                  )}
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${a.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {a.enabled ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2">{a.content}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  {a.startDate && <span>From: {new Date(a.startDate).toLocaleDateString()}</span>}
                  {a.endDate && <span>Until: {new Date(a.endDate).toLocaleDateString()}</span>}
                  <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleEnabled(a)}
                  title={a.enabled ? "Disable" : "Enable"}
                  className={`p-2.5 rounded-xl transition-all ${a.enabled ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                >
                  {a.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(a)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(a)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-800">
                  {editing ? "Edit Announcement" : "New Announcement"}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all"
                  >
                    <Eye size={15} /> {showPreview ? "Hide Preview" : "Preview"}
                  </button>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Weekend Special!"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content *</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Write your announcement message here..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition resize-none"
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image (optional)</label>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-pink-200 rounded-xl text-sm text-pink-500 hover:border-pink-400 hover:bg-pink-50 transition-all"
                      >
                        <ImageIcon size={16} /> Upload image
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {[
                      { key: "enabled", label: "Enabled", desc: "Show this announcement to visitors" },
                      { key: "alwaysShow", label: "Always Show", desc: "Show every visit, even if already seen" },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className="flex-1 flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 transition-colors">
                        <div className="pt-0.5">
                          <div
                            onClick={() => setForm({ ...form, [key]: !form[key] })}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form[key] ? "bg-pink-500" : "bg-gray-200"}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? "left-6" : "left-1"}`} />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 text-sm">{label}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-200 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {saving ? <RefreshCw size={16} className="animate-spin" /> : null}
                      {saving ? "Saving..." : editing ? "Save Changes" : "Create Announcement"}
                    </button>
                  </div>
                </form>

                {/* Preview panel */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 420, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="border-l border-gray-100 bg-pink-50 flex items-center justify-center p-8 overflow-hidden"
                    >
                      <div className="w-full max-w-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Live Preview</p>
                        <AnnouncementPreview form={form} imagePreview={imagePreview} />
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
