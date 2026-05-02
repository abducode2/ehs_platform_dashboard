import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { translate } from "../../utils/helpers";

const Sidebar = ({ open }) => {
  const { user, logout, isManager } = useAuth();
  const { lang } = useThemeLang();
  const navigate = useNavigate();
  const t = (key) => translate(lang, key);

  const navItems = [
    { path: "/dashboard", icon: "📊", label: "dashboard" },
    { path: "/permits", icon: "📋", label: "permits" },
    { path: "/fieldNotes", icon: "📝", label: "fieldNotes" },
    ...(isManager()
      ? [{ path: "/incidents", icon: "⚠️", label: "incidents" }]
      : []),
    { path: "/tbt", icon: "🎓", label: "tbt" },
    { path: "/licenses", icon: "🏅", label: "licenses" },
    { path: "/reports", icon: "📈", label: "reports" },
    ...(isManager()
      ? [{ path: "/management", icon: "🏗️", label: "projectsAndSupervisors" }]
      : []),
    { path: "/settings", icon: "⚙️", label: "settings" },
  ];

  const userName =
    user?.name?.split("/")[lang === "ar" ? 0 : 1]?.trim() || user?.name || "";
  const userRole = isManager() ? t("safetyManager") : t("safetySupervisor");

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div>
          <div className="logo-text">{t("appName")}</div>
          <div className="logo-sub">{t("appSub")}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{t(item.label)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{userName.charAt(0)}</div>
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-role">{userRole}</div>
          </div>
        </div>
        <button
          className="btn-logout"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <span>🚪</span> {t("logout")}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
