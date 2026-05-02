import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { translate } from "../../utils/helpers";
import { supabase } from "../../lib/supabaseClient";

const Topbar = ({ toggleSidebar }) => {
  const { isManager, getUserProjects } = useAuth();
  const { lang, theme, toggleTheme, toggleLang } = useThemeLang();
  const location = useLocation();
  const t = (key) => translate(lang, key);

  const pageTitle =
    {
      "/dashboard": "dashboard",
      "/permits": "permitsManagement",
      "/fieldNotes": "notesManagement",
      "/incidents": "incidentsManagement",
      "/tbt": "tbtManagement",
      "/licenses": "licensesManagement",
      "/reports": "reportsView",
      "/settings": "settingsPage",
    }[location.pathname] || "dashboard";

  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const fetchProjectName = async () => {
      if (isManager()) {
        setProjectName(t("allProjects"));
        return;
      }
      
      const userProjects = getUserProjects();
      if (userProjects && userProjects.length > 0) {
        const projectKey = userProjects[0];
        const { data, error } = await supabase
          .from("projects")
          .select("name_ar, name_en")
          .eq("key", projectKey)
          .single();
        
        if (data && !error) {
          setProjectName(lang === "ar" ? data.name_ar : data.name_en);
        } else {
          // Fallback if not found in DB
          setProjectName(projectKey);
        }
      }
    };

    fetchProjectName();
  }, [lang, isManager]);

  const projectDisplay = projectName || "...";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <div>
          <div className="topbar-title">{t(pageTitle)}</div>
        </div>
      </div>
      <div className="topbar-right">
        <span className="topbar-project-badge">{projectDisplay}</span>
        <button
          className="topbar-btn"
          onClick={toggleTheme}
          title={t("darkMode")}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button className="topbar-lang" onClick={toggleLang}>
          {lang === "ar" ? "EN" : "ع"}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
