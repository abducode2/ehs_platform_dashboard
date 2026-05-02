import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Toast from "./components/UI/Toast";
import Loading from "./components/UI/Loading";

const Login = lazy(() => import("./pages/Login"));
const Layout = lazy(() => import("./components/Layout/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Permits = lazy(() => import("./pages/Permits"));
const FieldNotes = lazy(() => import("./pages/FieldNotes"));
const Incidents = lazy(() => import("./pages/Incidents"));
const TBT = lazy(() => import("./pages/TBT"));
const Licenses = lazy(() => import("./pages/Licenses"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Management = lazy(() => import("./pages/Management"));
const Notes = lazy(() => import("./pages/Notes"));

const PermitDetail = lazy(() => import("./components/Details/PermitDetail"));
const FieldNotesDetail = lazy(() => import("./components/Details/FieldNotesDetail"));
const IncidentDetail = lazy(() => import("./components/Details/IncidentDetail"));
const TBTDetail = lazy(() => import("./components/Details/TBTDetail"));
const LicenseDetail = lazy(() => import("./components/Details/LicenseDetail"));
export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">
    {localStorage.getItem("ehs_lang") === "en" ? "Loading..." : "جاري التحميل..."}
  </div>;

  return (
    <>
      <Toast />
      <Suspense
        fallback={
          <div className="loading-screen">
            <Loading />
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="permits" element={<Permits />} />
            <Route path="permits/:id" element={<PermitDetail />} />
            <Route path="fieldNotes" element={<FieldNotes />} />
            <Route path="fieldNotes/:id" element={<FieldNotesDetail />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="tbt" element={<TBT />} />
            <Route path="tbt/:id" element={<TBTDetail />} />
            <Route path="licenses" element={<Licenses />} />
            <Route path="licenses/:id" element={<LicenseDetail />} />
            <Route path="notes" element={<Notes />} />
            <Route path="reports" element={<Reports />} />
            <Route path="management" element={<Management />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
