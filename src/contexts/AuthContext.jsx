import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ✅ تصدير AuthContext لاستخدامه في useAuth
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // استعادة الجلسة من localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("ehs_user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setProfile(userData);
    }
    setLoading(false);
  }, []);

  // دالة تسجيل الدخول من جدول users
  const login = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password) // نص عادي للتجربة
        .single();

      if (error || !data) {
        console.error("Login error:", error?.message);
        return false;
      }

      localStorage.setItem("ehs_user", JSON.stringify(data));
      setUser(data);
      setProfile(data);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("ehs_user");
    setUser(null);
    setProfile(null);
  };

  const [projectsData, setProjectsData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  // جلب المشاريع والمستخدمين عند بدء التطبيق
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: projs } = await supabase.from("projects").select("*");
      if (projs) setProjectsData(projs);

      const { data: usrs } = await supabase.from("users").select("*");
      if (usrs) setUsersData(usrs);
    };
    fetchInitialData();
  }, []);

  const isManager = () => profile?.role === "manager";
  const getUserProjects = () => {
    if (isManager()) return projectsData.map((p) => p.key);
    return profile?.project ? [profile.project] : [];
  };
  const canAccess = (project) => getUserProjects().includes(project);

  const getProjectName = (key, lang = "ar") => {
    const proj = projectsData.find((p) => p.key === key);
    if (proj) return lang === "ar" ? proj.name_ar : proj.name_en;
    return key;
  };

  const getUserName = (id, lang = "ar") => {
    const user = usersData.find((u) => u.id === id);
    if (user) return lang === "ar" ? user.name_ar : user.name_en;
    return id;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        loading,
        login,
        logout,
        isManager,
        getUserProjects,
        canAccess,
        projects: projectsData.map((p) => p.key),
        projectsData,
        getProjectName,
        usersData,
        getUserName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
