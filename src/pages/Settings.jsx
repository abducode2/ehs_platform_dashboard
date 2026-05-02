import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { showToast, translate } from "../utils/helpers";
import "./Settings.css";

export default function Settings() {
  const { isManager, user, setUser, setProfile } = useAuth();
  const { lang, theme, toggleTheme, toggleLang } = useThemeLang();
  const t = (key) => translate(lang, key);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showToast(t("required"), "warning");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast(t("passwordMismatch"), "error");
      return;
    }

    if (user.password_hash !== passwords.current) {
      showToast(
        lang === "ar"
          ? "كلمة المرور الحالية غير صحيحة"
          : "Current password is incorrect",
        "error",
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ password_hash: passwords.new })
        .eq("id", user.id);

      if (error) throw error;

      const updatedUser = { ...user, password_hash: passwords.new };
      localStorage.setItem("ehs_user", JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      if (setProfile) setProfile(updatedUser);

      showToast(t("saved"), "success");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon">⚙️</span> {t("settings")}
          </div>
        </div>
      </div>

      <div
        className={
          isManager()
            ? "card-theme-language-password-settings"
            : "card-supervisor"
        }
      >
        <div
          className={
            isManager() ? "settings-section" : "settings-section-supervisor"
          }
        >
          <div className={isManager() ? "settings-section-theme" : ""}>
            <div className="settings-title">🎨 {t("theme")}</div>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("darkMode")}</div>
              </div>
              <div
                className={`toggle-switch ${theme === "dark" ? "on" : ""}`}
                onClick={toggleTheme}
              ></div>
            </div>
          </div>
          <div className={isManager() ? "settings-section-language" : ""}>
            <div className="settings-title">🌐 {t("language")}</div>
            <div className="settings-row">
              <div>
                <div className="settings-label">
                  {t("arabicLang")} / {t("englishLang")}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={toggleLang}>
                {lang === "ar" ? "English" : "العربية"}
              </button>
            </div>
          </div>
        </div>
        <div
          className={
            isManager()
              ? "settings-section-password"
              : "settings-section-supervisor"
          }
        >
          <div className="settings-title">🔒 {t("changePassword")}</div>
          <div style={{ padding: "8px 0" }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t("currentPass")}</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="••••"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("newPass")}</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="••••"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("confirmPass")}</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="••••"
                />
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePasswordChange}
            >
              {t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
