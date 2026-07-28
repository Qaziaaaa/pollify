import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, AlertCircle, BarChart3, ThumbsUp, Star, Type, Image } from "lucide-react";
import api from "../utils/api.js";

const POLL_TYPES = [
    { key: "yesno", label: "Yes/No", Icon: ThumbsUp },
    { key: "single", label: "Multiple Choice", Icon: BarChart3 },
    { key: "rating", label: "Rating", Icon: Star },
    { key: "open", label: "Open", Icon: Type },
    { key: "image", label: "Image", Icon: Image },
];

export default function CreatePollPage() {
    const [question, setQuestion] = useState("");
    const [type, setType] = useState("yesno");
    const [options, setOptions] = useState(["", ""]);
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
            const payload = { question, type };
            if (type === "yesno") {
                payload.options = ["Yes", "No"];
            } else if (type === "single") {
                const filtered = options.filter(Boolean);
                if (filtered.length < 2) {
                    throw new Error("Add at least 2 options");
                }
                payload.options = filtered;
            }
            await api.post("/polls", payload);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Failed to create poll");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-lg font-bold text-white mb-6 font-['Plus_Jakarta_Sans']">Create a Poll</h1>

            {error && (
                <div className="mb-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 text-sm text-rose-400">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Question */}
                <div>
                    <label className="text-sm text-zinc-400 mb-1.5 block">Question</label>
                    <textarea
                        placeholder="What do you want to ask?"
                        className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm min-h-[80px] resize-none"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                </div>

                {/* Poll Type */}
                <div>
                    <label className="text-sm text-zinc-400 mb-1.5 block">Poll Type</label>
                    <div className="flex flex-wrap gap-2">
                        {POLL_TYPES.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setType(key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${
                                    type === key
                                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                                        : "border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600"
                                }`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Options for single/multiple choice */}
                {type === "single" && (
                    <div>
                        <label className="text-sm text-zinc-400 mb-1.5 block">Options</label>
                        <div className="space-y-2">
                            {options.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        placeholder={`Option ${i + 1}`}
                                        className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-2.5 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(i)}
                                            className="px-3 py-2.5 text-zinc-500 hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addOption}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-800/20 px-4 py-2.5 text-sm text-emerald-400 hover:border-zinc-600 transition-colors"
                            >
                                <Plus size={15} /> Add option
                            </button>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
                >
                    {loading ? "Creating…" : "Create Poll"}
                </button>
            </form>
        </div>
    );
}
