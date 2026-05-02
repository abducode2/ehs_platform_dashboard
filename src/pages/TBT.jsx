import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { showToast, formatDate, translate } from "../utils/helpers";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import FiltersBar from "../components/Common/FiltersBar";
import { useNavigate } from "react-router-dom";
import Loading from "../components/UI/Loading";

export default function TBT() {
  const { isManager, getUserProjects, user, getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const navigate = useNavigate();
  const t = (key) => translate(lang, key);
  const [tbtList, setTbtList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", project: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTbt, setEditingTbt] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [supervisorsList, setSupervisorsList] = useState([]);
  const [formData, setFormData] = useState({
    topic: "",
    project: "",
    location: "",
    date: "",
    supervisor: "",
    attendees: 0,
    actual_attend: 0,
  });

  // جلب التصاريح من Supabase مع مراعاة الصلاحيات
  const fetchTbtList = async () => {
    setLoading(true);
    let query = supabase.from("tbt_sessions").select("*");
    if (!isManager()) {
      const projects = getUserProjects();
      if (projects.length) query = query.in("project", projects);
    }
    // تطبيق الفلاتر

    if (filters.project && isManager())
      query = query.eq("project", filters.project);
    if (filters.status) query = query.eq("status", filters.status);
    query = query.order("date", { ascending: false });

    const { data, error } = await query;
    if (error) {
      showToast(error.message, "error");
    } else {
      setTbtList(data || []);
    }
    setLoading(false);

    // جلب قائمة المشاريع لملء القوائم المنسدلة
    const { data: projs } = await supabase
      .from("projects")
      .select("key, name_ar, name_en");
    if (projs) setProjectsList(projs);

    // جلب المراقبين لربطهم بالمشاريع
    const { data: sups } = await supabase
      .from("users")
      .select("name, project")
      .eq("role", "supervisor");
    if (sups) setSupervisorsList(sups);
  };
  // ===== ROUTER =====

  useEffect(() => {
    fetchTbtList();
  }, [filters, isManager]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setEditingTbt(null);
    setFormData({
      topic: "",
      project: isManager() ? "" : getUserProjects()[0],
      location: "",
      supervisor: user?.name || "",
      date: new Date().toISOString().split("T")[0],

      attendees: 0,
      actual_attend: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (tbt) => {
    setEditingTbt(tbt);
    setFormData({
      topic: tbt.topic,
      project: tbt.project,
      location: tbt.location,
      supervisor: tbt.supervisor,
      date: tbt.date,
      attendees: tbt.attendees || 0,
      actual_attend: tbt.actual_attend || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.topic ||
      !formData.project ||
      !formData.location ||
      !formData.supervisor ||
      !formData.date ||
      !formData.attendees ||
      !formData.actual_attend
    ) {
      showToast(t("required"), "warning");
      return;
    }

    if (editingTbt) {
      const { error } = await supabase
        .from("tbt_sessions")
        .update(formData)
        .eq("id", editingTbt.id);
      if (error) showToast(error.message, "error");
      else showToast(t("updated"), "success");
    } else {
      const { error } = await supabase.from("tbt_sessions").insert([
        {
          ...formData,
          created_by: user?.id,
        },
      ]);
      if (error) showToast(error.message, "error");
      else showToast(t("added"), "success");
    }
    setModalOpen(false);
    fetchTbtList();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase
      .from("tbt_sessions")
      .delete()
      .eq("id", confirmDelete.id);
    if (error) showToast(error.message, "error");
    else showToast(t("deleted"), "success");
    setConfirmDelete(null);
    fetchTbtList();
  };

  // const filterConfig = [
  //   {
  //     id: "type",
  //     type: "select",
  //     value: filters.type,
  //     placeholderKey: "allTypes",
  //     options: [
  //       { value: "hot", label: t("hot") },
  //       { value: "cold", label: t("cold") },
  //       { value: "confined", label: t("confined") },
  //       { value: "heights", label: t("heights") },
  //       { value: "electrical", label: t("electrical") },
  //     ],
  //   },
  //   ...(isManager()
  //     ? [
  //         {
  //           id: "project",
  //           type: "select",
  //           value: filters.project,
  //           placeholderKey: "allProj",
  //           options: [
  //             ...projectsList.map((p) => ({
  //               value: p.key,
  //               label: lang === "ar" ? p.name_ar : p.name_en,
  //             })),
  //           ],
  //         },
  //       ]
  //     : []),
  //   {
  //     id: "status",
  //     type: "select",
  //     value: filters.status,
  //     placeholderKey: "allStatus",
  //     options: [
  //       { value: "active", label: t("active") },
  //       { value: "closed", label: t("closed") },
  //     ],
  //   },
  // ];
  const filterConfig = isManager()
    ? [
        {
          id: "project",
          type: "select",
          value: filters.project,
          placeholderKey: "allProj",
          options: [
            ...projectsList.map((p) => ({
              value: p.key,
              label: lang === "ar" ? p.name_ar : p.name_en,
            })),
          ],
        },
      ]
    : [];
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon">🎓</span> {t("tbtManagement")}
          </div>
        </div>
        {isManager() && (
          <button className="btn btn-primary" onClick={openAddModal}>
            {t("addTBT")}
          </button>
        )}
      </div>
      <FiltersBar filters={filterConfig} onChange={handleFilterChange} />
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("topic")}</th>
                <th>{t("project")}</th>
                <th>{t("location")}</th>
                <th>{t("date")}</th>
                <th>{t("supervisor")}</th>
                <th>{t("attendees")}</th>
                <th>{t("attendRate")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9">
                    <Loading />
                  </td>
                </tr>
              ) : (
                tbtList.map((t, idx) => {
                  const rate = t.attendees
                    ? Math.round((t.actual_attend / t.attendees) * 100)
                    : 0;
                  return (
                    <tr key={t.id}>
                      <td>{idx + 1}</td>
                      <td>{t.topic}</td>
                      <td>{getProjectName(t.project, lang)}</td>
                      <td>{t.location}</td>
                      <td>
                        {formatDate(t.date)} {t.time}
                      </td>
                      <td>{t.supervisor}</td>
                      <td>
                        {t.actual_attend}/{t.attendees}
                      </td>
                      <td>
                        <span
                          className={`badge-status ${rate >= 80 ? "badge-active" : rate >= 60 ? "badge-high" : "badge-critical"}`}
                        >
                          {rate}%
                        </span>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => navigate(`/tbt/${t.id}`)}
                          >
                            👁️
                          </button>
                          {isManager() && (
                            <>
                              <button
                                className="btn btn-primary btn-sm btn-icon"
                                onClick={() => openEditModal(t)}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-danger btn-sm btn-icon"
                                onClick={() => setConfirmDelete(t)}
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              {!tbtList.length && !loading && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: 32 }}>
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTbt ? t("edit") : t("addTBT")}
      >
        <form id="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("topic")} *</label>
            <input
              className="form-control"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              required
            />
          </div>
          {isManager() && (
            <div className="form-group">
              <label className="form-label">{t("project")} *</label>
              <select
                className="form-control"
                value={formData.project}
                onChange={(e) => {
                  const projectKey = e.target.value;
                  const sup = supervisorsList.find(
                    (s) => s.project === projectKey,
                  );
                  setFormData({
                    ...formData,
                    project: projectKey,
                    supervisor: sup ? sup.name : "",
                  });
                }}
                required
              >
                <option value="">--</option>
                {projectsList.map((p) => {
                  const sup = supervisorsList.find((s) => s.project === p.key);
                  return (
                    <option key={p.key} value={p.key}>
                      {lang === "ar" ? p.name_ar : p.name_en}{" "}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t("supervisor")} *</label>
            <select
              className="form-control"
              value={formData.supervisor}
              onChange={(e) =>
                setFormData({ ...formData, supervisor: e.target.value })
              }
              required
            >
              <option value="">--</option>
              {supervisorsList.map((sup, idx) => (
                <option key={idx} value={sup.name}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t("location")}</label>
            <input
              className="form-control"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t("date")}</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t("time")}</label>
              <input
                type="time"
                className="form-control"
                value={formData.time?.substring(0, 5)}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t("attendees")}</label>
            <input
              type="number"
              className="form-control"
              value={formData.attendees}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attendees: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("attendRate")}</label>
            <input
              type="number"
              className="form-control"
              value={formData.actual_attend}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  actual_attend: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={t("confirmDelete")}
        message={t("confirmDeleteMsg")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
