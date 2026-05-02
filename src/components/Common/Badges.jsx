import { useThemeLang } from "../../contexts/ThemeLangContext";
import { translate } from "../../utils/helpers";

export const StatusBadge = ({ status }) => {
  const { lang } = useThemeLang();
  const t = (key) => translate(lang, key);

  const config = {
    active: { class: "badge-active", label: t("active") },
    closed: { class: "badge-closed", label: t("closed") },
    valid: { class: "badge-valid", label: t("valid") },
    expired: { class: "badge-expired", label: t("expired") },
    expiring: { class: "badge-expiring", label: t("expiring") },
    open: { class: "badge-open", label: t("open") },
  };
  const { class: badgeClass, label } = config[status] || {
    class: "badge-medium",
    label: status,
  };
  return <span className={`badge-status ${badgeClass}`}>{label}</span>;
};

export const SeverityBadge = ({ severity }) => {
  const { lang } = useThemeLang();
  const t = (key) => translate(lang, key);

  const config = {
    critical: { class: "badge-critical", label: t("critical") },
    high: { class: "badge-high", label: t("high") },
    medium: { class: "badge-medium", label: t("medium") },
    low: { class: "badge-low", label: t("low") },
  };
  const { class: badgeClass, label } = config[severity] || {
    class: "badge-medium",
    label: severity,
  };
  return <span className={`badge-status ${badgeClass}`}>{label}</span>;
};

export const TypeBadge = ({ type, typeMap }) => {
  const label = typeMap[type] || type;
  return <span className="badge-status badge-medium">{label}</span>;
};
