import React from "react";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";

const FiltersBar = ({ filters, onChange, className = "" }) => {
  const { lang } = useThemeLang();
  const t = (key) => {
    const dict = T[lang];
    if (!dict) return key;
    return dict[key] || key;
  };

  const renderFilter = (filter) => {
    const commonProps = {
      id: filter.id,
      className: "filter-select",
      value: filter.value,
      onChange: (e) => onChange(filter.id, e.target.value),
    };

    if (filter.type === "select") {
      return (
        <select {...commonProps}>
          <option value="">
            {filter.placeholder || t(filter.placeholderKey || "allTypes")}
          </option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (filter.type === "search") {
      return (
        <input
          type="text"
          className="filter-input"
          placeholder={filter.placeholder || t("search")}
          value={filter.value}
          onChange={(e) => onChange(filter.id, e.target.value)}
        />
      );
    }

    return null;
  };

  return (
    <div className={`filters-bar ${className}`}>
      {filters.map((filter) => (
        <React.Fragment key={filter.id}>{renderFilter(filter)}</React.Fragment>
      ))}
    </div>
  );
};

export default FiltersBar;
