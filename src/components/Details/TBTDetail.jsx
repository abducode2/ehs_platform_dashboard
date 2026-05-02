import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";
import { showToast, formatDate } from "../../utils/helpers";
import Loading from "../UI/Loading";

export default function TBTDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectName, getUserName } = useAuth();
  const { lang } = useThemeLang();
  const t = (key) => T[lang][key] || key;
  const [tbt, setTbt] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    const fetchTbt = async () => {
      const { data, error } = await supabase
        .from("tbt_sessions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) showToast(error.message, "error");
      else setTbt(data);
      setLoading(false);
    };
    fetchTbt();
  }, [id]);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading />
      </div>
    );
  if (!tbt)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        {t("itemNotFound")}
      </div>
    );
  const rate = tbt.attendees
    ? Math.round((tbt.actual_attend / tbt.attendees) * 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon">📝</span> {t("tbtDetails")}
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/tbt")}>
            {t("back")}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="detail-grid">
          {/* Project  */}
          <div className="detail-field">
            <div className="detail-label">{t("project")}</div>
            <div className="detail-value">
              {getProjectName(tbt.project, lang)}
            </div>
          </div>
          {/* Trainer / Supervisor  */}
          <div className="detail-field">
            <div className="detail-label">{t("supervisor")}</div>
            <div className="detail-value">
              {getUserName(tbt.supervisor, lang)}
            </div>
          </div>
          {/* Location  */}
          <div className="detail-field">
            <div className="detail-label">{t("location")}</div>
            <div className="detail-value">{tbt.location}</div>
          </div>
          {/* Date  */}
          <div className="detail-field">
            <div className="detail-label">
              {t("date")} || {t("time")}
            </div>
            <div className="detail-value">
              {formatDate(tbt.date)} || {tbt.time?.substring(0, 5)}
            </div>
          </div>

          <div className="detail-field">
            <label className="detail-label">{t("attendees")}</label>
            <div className="detail-value">
              {tbt.actual_attend}/{tbt.attendees}
            </div>
          </div>
          <div className="detail-field">
            <label className="detail-label">{t("attendRate")}</label>

            <div className="detail-value">{rate}%</div>
          </div>
        </div>
        {/* Topic */}
        <div className="detail-field">
          <div className="detail-label">{t("topic")}</div>
          <div className="detail-value">{tbt.topic}</div>
        </div>
        {/* Description  */}
        <div className="detail-field" style={{ marginTop: "12px" }}>
          <div className="detail-label">{t("description")}</div>
          <div className="detail-value">
            {tbt.description || t("noDescription")}
          </div>
        </div>
      </div>
    </div>
  );
}
