"use client";

import { useEffect, useRef, useState } from "react";

import Loading from "@/components/Loading";
import Swal from "sweetalert2";
import ToggleSwitch from "@/components/ToggleSwitch";

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime";

export default function GalleryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to load gallery");
      setItems(await res.json());
    } catch (err) {
      Swal.fire("Error", "Could not load the gallery", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      Swal.fire("Choose a file", "Select a photo or video to upload.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);

    setUploading(true);
    try {
      const res = await fetch("/api/gallery", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to upload");

      setItems((prev) => [...prev, data]);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      Swal.fire("Uploaded", "Media added to the gallery.", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const togglePublished = async (id, published) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, published } : it))
    );
    try {
      const res = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      Swal.fire("Error", "Could not update visibility", "error");
      fetchItems();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this media?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      Swal.fire("Error", "Could not delete media", "error");
    }
  };

  const move = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setItems(reordered);

    try {
      const res = await fetch("/api/gallery/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((it, i) => ({ id: it.id, order: i })),
        }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      setItems(await res.json());
    } catch (err) {
      Swal.fire("Error", "Could not reorder media", "error");
      fetchItems();
    }
  };

  if (loading) return <Loading isVisible />;

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-white to-pink-100 rounded-2xl shadow-lg min-h-screen space-y-8">
      <h1 className="text-4xl text-black tracking-tight">Gallery Management</h1>

      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row gap-4 sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo or video
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, WEBP, MP4, or MOV
          </p>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caption (optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Fresh out of the oven..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg transition disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No media uploaded yet 📷
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square bg-gray-100">
                {item.type === "VIDEO" ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption || "Gallery item"}
                    className="w-full h-full object-cover"
                  />
                )}
                {!item.published && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-wide">
                      Hidden
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col gap-2 flex-1">
                {item.caption && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.caption}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">
                      {item.published ? "Published" : "Hidden"}
                    </span>
                    <ToggleSwitch
                      checked={item.published}
                      onChange={(val) => togglePublished(item.id, val)}
                    />
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ↑ Move up
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ↓ Move down
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
