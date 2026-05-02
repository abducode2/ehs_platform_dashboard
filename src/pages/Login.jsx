import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { T } from "../utils/translations";
import "./Login.css";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { lang } = useThemeLang();
  const navigate = useNavigate();
  const t = (key) => {
    const dict = T[lang];
    if (!dict) return key;
    return dict[key] || key;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(id, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError(t("invalidLogin"));
    }
  };

  const quickLogin = (userId, userPass) => {
    setId(userId);
    setPassword(userPass);
  };

  const testAccounts = [
    {
      id: "1001",
      pass: "1234",
      name: "أحمد الزهراني / Ahmed Al-Zahrani",
      role: "manager",
    },
    {
      id: "2001",
      pass: "1234",
      name: "محمد العتيبي / Mohammed Al-Otaibi",
      role: "supervisor",
    },
    {
      id: "2002",
      pass: "1234",
      name: "خالد السهلي / Khaled Al-Sahli",
      role: "supervisor",
    },
    {
      id: "2003",
      pass: "1234",
      name: "فيصل الدوسري / Faisal Al-Dosari",
      role: "supervisor",
    },
  ];

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <span className="icon">🛡️</span>
          <h1>{t("appName")}</h1>
          <p>{t("appSub")}</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">{t("username")}</label>
            <input
              className="form-control"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={t("username")}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("password")}</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>
          <button type="submit" className="login-btn">
            {t("loginBtn")}
          </button>
        </form>
        {/* <div className="login-users">
          <p>{t("testAccounts")}</p>
          {testAccounts.map((acc) => (
            <div
              key={acc.id}
              className="login-user-item"
              onClick={() => quickLogin(acc.id, acc.pass)}
            >
              <span style={{ fontSize: 18 }}>
                {acc.role === "manager" ? "👔" : "👷"}
              </span>
              <div>
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: "#1e3a5f" }}
                >
                  {acc.id}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{acc.name}</div>
              </div>
              <span
                className={`role-badge ${acc.role === "manager" ? "role-manager" : "role-supervisor"}`}
              >
                {acc.role === "manager"
                  ? t("safetyManager")
                  : t("safetySupervisor")}
              </span>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
