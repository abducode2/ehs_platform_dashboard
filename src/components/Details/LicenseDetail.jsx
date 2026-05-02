import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";
import { showToast } from "../../utils/helpers";
import { StatusBadge } from "../Common/Badges";
import Loading from "../UI/Loading";

export default function LicenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const t = (key) => T[lang][key] || key;
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    const fetchLicense = async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) showToast(error.message, "error");
      else setLicense(data);
      setLoading(false);
    };
    fetchLicense();
  }, [id]);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading />
      </div>
    );
  if (!license)
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
            <span className="icon">📝</span> {t("licenseDetails")}
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/licenses")}
          >
            {t("back")}
          </button>
        </div>
      </div>

      <div className="card">
        {/* license_name  */}
        <div className="detail-field" style={{ marginBottom: "20px" }}>
          <div className="detail-label">{t("license_name")}</div>
          <div className="detail-value">{license.name}</div>
        </div>
        <div className="detail-grid">
          {/* project  */}
          <div className="detail-field">
            <div className="detail-label">{t("project")}</div>
            <div className="detail-value">
              {getProjectName(license.project, lang)}
            </div>
          </div>
          {/* issue_date  */}
          <div className="detail-field">
            <div className="detail-label">{t("issue_date")}</div>
            <div className="detail-value">{license.issue_date}</div>
          </div>
          {/* expiry_date  */}

          <div className="detail-field">
            <label className="detail-label">{t("expiry_date")}</label>
            <div className="detail-value">{license.expiry_date}</div>
          </div>
          {/* status */}
          <div className="detail-field">
            <label className="detail-label">{t("status")}</label>
            <div className="detail-value">
              <StatusBadge status={license.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
