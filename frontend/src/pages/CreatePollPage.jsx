import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import api from "../utils/api.js";
import { TYPE_META } from "../components/FilterBar.jsx";
import { inputCls } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import { createPollStyles as s } from "../assets/dummyStyles";

const CATEGORIES = ["General", "Tech", "Food", "Sports", "Entertainment", "Gaming", "Music", "Travel", "Education", "Lifestyle", "Other"];

export default function CreatePollPage() {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("yesno");
  const [options, setOptions] = useState(["", ""]);
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, v) => {
    const next = [...options];
    next[i] = v;
    setOptions(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { question, type, category };
      if (type === "yesno") {
        payload.options = ["Yes", "No"];
      } else if (type === "single") {
        payload.options = options.filter(Boolean);
      } else if (type === "image") {
        payload.options = options.filter(Boolean);
      }
      await api.post("/polls", payload);
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
                onClick={() => setType(key)}
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

        {needsOptions && (
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