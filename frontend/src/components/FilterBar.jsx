import { FILTERS } from "../assets/helpers component/FilterBar.jsx";
import { filterBarStyles as s } from "../assets/dummyStyles";

export { TYPE_META, FILTERS } from "../assets/helpers component/FilterBar.jsx";

export default function FilterBar({ active, onChange }) {
  return (
    <div className={s.container}>
      {FILTERS.map((f) => {
        const Icon = f.Icon;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`${s.filterBase} ${active === f.key ? s.filterActive : s.filterInactive}`}
          >
            {Icon && <Icon size={12} />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
