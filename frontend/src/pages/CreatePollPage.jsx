// ===== CREATE POLL PAGE =====
// Form to create a new poll. Supports all types: yesno, single, image, rating, open.
// Image type triggers FormData upload; single type manages dynamic option fields.

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Image, AlertCircle, X } from "lucide-react";
import api from "../utils/api.js";
import { TYPE_META } from "../components/FilterBar.jsx";
import { inputCls } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import { createPollStyles as s } from "../assets/dummyStyles";

const CATEGORIES = ["General", "Tech", "Food", "Sports", "Entertainment", "Gaming", "Music", "Travel", "Education", "Lifestyle", "Other"];

export default function CreatePollPage() {
  // Form state for question, type, options, images, category

  const [question, setQuestion] = useState("");
  const [type, setType] = useState("yesno");
  const [options, setOptions] = useState(["", ""]);
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, v) => {
    // Update value of a single option at index i
    const next = [...options];
    next[i] = v;
    setOptions(next);
  };

  const handleImageSelect = (e) => {
    // Collect selected images with preview URLs.
    // No `accept` filter on the input (it makes Windows render thumbnails,
    // which stalls the dialog) — so validate types here instead.
    const files = Array.from(e.target.files || []);
    const images = files.filter((f) => f.type.startsWith("image/"));
    const skipped = files.length - images.length;
    if (skipped > 0) {
      setError(`${skipped} file${skipped === 1 ? "" : "s"} skipped — only images are allowed.`);
    }
    setImages((prev) => [...prev, ...images.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (i) => {
    // Revoke object URL and remove image from list
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (e) => {
    // Submit poll: FormData for image type, JSON for all others
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (type === "image") {
        if (images.length < 2) throw new Error("Add at least 2 images");
        const fd = new FormData();
        fd.append("question", question);
        fd.append("type", "image");
        fd.append("category", category);
        images.forEach((img) => fd.append("images", img.file));
        await api.post("/polls", fd);
      } else {
        const payload = { question, type, category };
        if (type === "yesno") {
          payload.options = ["Yes", "No"];
        } else if (type === "single") {
          payload.options = options.filter(Boolean);
        }
        await api.post("/polls", payload);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const needsOptions = type === "single" || type === "image";

  return (
    <Layout>
      <h1 className={s.heading}>Create a Poll</h1>
      {error && (
        <div className={s.errorBox}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className={s.form}>
        <div>
          <label className={s.label}>Question</label>
          <textarea
            className={`${inputCls} ${s.textarea}`}
            placeholder="What do you want to ask?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={s.label}>Poll Type</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setType(key);
                  if (key !== "image") setImages([]);
                }}
                className={`${s.typeButtonBase} ${
                  type === key ? s.typeButtonActive : s.typeButtonInactive
                }`}
              >
                <meta.Icon size={14} />
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={s.label}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {type === "single" && (
          <div className={s.optionsContainer}>
            <label className={s.label}>Options</label>
            {options.map((opt, i) => (
              <div key={i} className={s.optionInputWrapper}>
                <input
                  className={inputCls}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)} className={`${s.optionDeleteButton} text-zinc-600 hover:text-rose-400`}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption} className={`${inputCls} ${s.addOptionButton} text-emerald-400 border-dashed`}>
              <Plus size={14} /> Add option
            </button>
          </div>
        )}

        {type === "image" && (
          <div>
            <label className={s.label}>Upload Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-800/70 border border-zinc-700/60">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/80"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-8" />
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-zinc-700/60 hover:border-emerald-500/40 bg-zinc-800/30 hover:bg-zinc-800/60 transition-all flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-emerald-400 group"
              >
                <Image size={22} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">{images.length === 0 ? "Add Images" : "Add More"}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              // No accept="image/*" — on Windows it switches the dialog to
              // thumbnail mode, making files show as "loading" and unclickable.
              // Type filtering happens in handleImageSelect instead.
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            {images.length < 2 && (
              <p className="text-[11px] text-rose-400/80 mt-2 flex items-center gap-1">
                <AlertCircle size={11} /> Add at least 2 images
              </p>
            )}
          </div>
        )}

        {type === "rating" && (
          <p className="text-xs text-zinc-500 mt-1">Users will rate 1-5 stars.</p>
        )}
        {type === "open" && (
          <p className="text-xs text-zinc-500 mt-1">Users will submit free-text responses.</p>
        )}

        <button type="submit" disabled={loading} className={`${inputCls} ${s.submitButton} bg-emerald-500 text-white font-semibold hover:bg-emerald-400`}>
          {loading ? "Creating…" : "Create Poll"}
        </button>
      </form>
    </Layout>
  );
}