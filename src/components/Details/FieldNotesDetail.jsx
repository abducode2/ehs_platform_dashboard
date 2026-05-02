import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";
import { showToast, formatDate } from "../../utils/helpers";
import { TypeBadge, SeverityBadge } from "../Common/Badges";
import Loading from "../../components/UI/Loading";

export default function FieldNotesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const t = (key) => T[lang][key] || key;
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات التصريح
  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) showToast(error.message, "error");
      else setNote(data);
      setLoading(false);
    };
    fetchNote();
  }, [id]);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading />
      </div>
    );
  if (!note)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        {t("itemNotFound")}
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon"></span> {t("noteDetails")}
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/fieldNotes")}
          >
            {t("back")}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-field">
            <div className="detail-label">{t("type")}</div>
            <div className="detail-value">
              <TypeBadge
                type={note.type}
                typeMap={{
                  unsafeAct: t("unsafeAct"),
                  unsafeCondition: t("unsafeCondition"),
                }}
              />
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("severity")}</div>
            <div className="detail-value">
              <SeverityBadge severity={note.severity} />
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("project")}</div>
            <div className="detail-value">
              {getProjectName(note.project, lang)}
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("location")}</div>
            <div className="detail-value">{note.location}</div>
          </div>

          <div className="detail-field">
            <div className="detail-label">{t("date")}</div>
            <div className="detail-value">{formatDate(note.date)}</div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("status")}</div>
            <div className="detail-value">
              <span
                className={`badge-status ${note.status === "active" ? "badge-active" : "badge-closed"}`}
              >
                {note.status === "active" ? t("active") : t("closed")}
              </span>
            </div>
          </div>
        </div>
        <div className="detail-field">
          <div className="detail-label">{t("noteDescription")}</div>
          <div className="detail-value" style={{ marginTop: "8px" }}>
            {note.description || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
