import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";
import { showToast } from "../../utils/helpers";
import { TypeBadge, SeverityBadge } from "../Common/Badges";
import Loading from "../UI/Loading";

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const t = (key) => T[lang][key] || key;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    const fetchPermit = async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single();
      if (error) showToast(error.message, "error");
      else setIncident(data);
      setLoading(false);
    };
    fetchPermit();
  }, [id]);
  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading />
      </div>
    );
  if (!incident)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        {t("itemNotFound")}
      </div>
    );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{t("incidentDetails")}</h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/incidents")}
          >
            {t("back")}
          </button>
        </div>
      </div>
      <div className="card">
        {/* عرض تفاصيل التصريح */}
        <div className="detail-grid">
          {/* Project */}
          <div className="detail-field">
            <div className="detail-label">{t("project")}</div>
            <div className="detail-value">
              {getProjectName(incident.project, lang)}
            </div>
          </div>

          {/* location */}
          <div className="detail-field">
            <div className="detail-label">{t("location")}</div>
            <div className="detail-value">{incident.location}</div>
          </div>

          {/* Injured Name */}
          <div className="detail-field">
            <div className="detail-label">{t("injured")}</div>
            <div className="detail-value">{incident.injured}</div>
          </div>
          {/* Date */}
          <div className="detail-field">
            <div className="detail-label">{t("date")}</div>
            <div className="detail-value">{incident.date}</div>
          </div>
          {/* type */}
          <div className="detail-field">
            <div className="detail-label">{t("type")}</div>
            <div className="detail-value">
              <TypeBadge
                type={incident.type}
                typeMap={{
                  injury: t("injury"),
                  electrical: t("electrical"),
                  slip: t("slip"),
                  fall: t("fall"),
                  fire: t("fire"),
                  suffocation: t("suffocation"),
                }}
              />
            </div>
          </div>
          {/* severity */}
          <div className="detail-field">
            <div className="detail-label">{t("severity")}</div>
            <div className="detail-value">
              <SeverityBadge severity={incident.severity} />
            </div>
          </div>
        </div>

        {/* description */}

        <div className="detail-field" style={{ marginBottom: "15px" }}>
          <div className="detail-label">{t("description")}</div>
          <div>{incident.description}</div>
        </div>

        {/* action */}
        <div className="detail-field">
          <div className="detail-label">{t("action")}</div>
          <div>{incident.action}</div>
        </div>
      </div>
    </>
  );
}
