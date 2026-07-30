// ===== POLL TYPE METADATA & FILTERS =====
// Defines the five poll types and the filter tabs used across the app.

import { Scale, List, Star, Image, MessageSquare, Sparkles } from "lucide-react";

// Metadata lookup: maps type string → { label, Icon }
export const TYPE_META = {
  yesno: { label: "Yes / No", Icon: Scale },
  single: { label: "Single Choice", Icon: List },
  rating: { label: "Rating", Icon: Star },
  image: { label: "Image", Icon: Image },
  open: { label: "Open Ended", Icon: MessageSquare },
};

// Filter options for the dashboard FilterBar component
export const FILTERS = [
  { key: "all", label: "All", Icon: Sparkles },
  ...Object.entries(TYPE_META).map(([key, v]) => ({ key, label: v.label, Icon: v.Icon })),
];
