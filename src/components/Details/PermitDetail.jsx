import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";
import { showToast } from "../../utils/helpers";
import { TypeBadge, StatusBadge } from "../Common/Badges";
import Loading from "../UI/Loading";

export default function PermitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectName, getUserName } = useAuth();
  const { lang } = useThemeLang();
  const t = (key) => {
    const dict = T[lang];
    if (!dict) return key;
    return dict[key] || key;
  };

  const [permit, setPermit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "",
    project: "",
    location: "",
    supervisor: "",
    date: "",
    description: "",
    status: "",
  });

  // جلب بيانات التصريح
  useEffect(() => {
    const fetchPermit = async () => {
      const { data, error } = await supabase
        .from("permits")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        showToast(error.message, "error");
        navigate("/permits");
      } else {
        setPermit(data);
        setFormData(data);
      }
      setLoading(false);
    };
    fetchPermit();
  }, [id, navigate]);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading />
      </div>
    );
  if (!permit)
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
            <span className="icon">📋</span> {t("permitDetails")}
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/permits")}
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
                type={permit.type}
                typeMap={{
                  hot: t("hot"),
                  cold: t("cold"),
                  confined: t("confined"),
                  heights: t("heights"),
                  electrical: t("electrical"),
                }}
              />
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("project")}</div>
            <div className="detail-value">
              {getProjectName(permit.project, lang)}
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("location")}</div>
            <div className="detail-value">{permit.location}</div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("supervisor")}</div>
            <div className="detail-value">
              {getUserName(permit.supervisor, lang)}
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("date")}</div>
            <div className="detail-value">{permit.date}</div>
          </div>
          <div className="detail-field">
            <div className="detail-label">{t("status")}</div>
            <div className="detail-value">
              <StatusBadge status={permit.status} />
            </div>
          </div>
        </div>
        <div className="detail-field">
          <div className="detail-label">{t("description")}</div>
          <div className="detail-value" style={{ marginTop: "8px" }}>
            {permit.description || t("noDescription")}
          </div>
        </div>
      </div>
    </div>
  );
}
