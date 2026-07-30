// ===== SHARED UI PRIMITIVES =====
// Reusable button, input, avatar, and skeleton components used across pages.
// Styles are pulled from dummyStyles to keep Tailwind classes centralized.

import { uiElementStyles as s } from "../dummyStyles";

const btnStyles = {
  primary: s.btnPrimary,
  ghost: s.btnGhost,
  danger: s.btnDanger,
};

// Polymorphic button with variant support (primary / ghost / danger)
export function Button({ variant = "primary", className = "", ...props }) {
  return <button className={`${s.btnBase} ${btnStyles[variant]} ${className}`} {...props} />;
}

export const inputCls = s.inputCls;
export const authInputCls = inputCls;

// Submit button specifically for auth forms
export function AuthButton({ className = "", ...props }) {
  return <button className={`${s.authButton} ${className}`} {...props} />;
}

// Label + input field wrapper for forms
export function Field({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className={s.fieldLabel}>{label}</span>}
      <input className={`${inputCls} ${className}`} {...props} />
    </label>
  );
}

// Avatar: shows image if available, otherwise initial-letter fallback
export function Avatar({ user = {}, className = "w-10 h-10" }) {
  if (user.avatar)
    return <img src={user.avatar} alt={user.name} className={`${className} ${s.avatarImg}`} />;
  return <div className={`${className} ${s.avatarPlaceholder}`}>{user.name?.[0]?.toUpperCase() || "?"}</div>;
}

// Loading placeholder while polls are being fetched
export function PollSkeleton({ count = 3 }) {
  return (
    <div className={s.skeletonContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={s.skeletonCard}>
          <div className="flex items-center gap-2 mb-3">
            <div className={s.skeletonAvatar} />
            <div className={s.skeletonName} />
            <div className={s.skeletonUsername} />
            <div className={s.skeletonCategory} />
          </div>
          <div className={s.skeletonQuestion} />
          <div className={s.skeletonOptions}>
            <div className={s.skeletonOption1} />
            <div className={s.skeletonOption2} />
          </div>
          <div className={s.skeletonFooter}>
            <div className={s.skeletonAction1} />
            <div className={s.skeletonAction2} />
            <div className={s.skeletonAction3} />
          </div>
        </div>
      ))}
    </div>
  );
}
