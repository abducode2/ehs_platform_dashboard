import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ConfirmModal from "../components/UI/ConfirmModal";
import Modal from "../components/UI/Modal";
import SimpleBarChart from "../components/Charts/SimpleBarChart";
import {
  StatusBadge,
  SeverityBadge,
  TypeBadge,
} from "../components/Common/Badges";
import FiltersBar from "../components/Common/FiltersBar";
import { useAuth } from "../hooks/useAuth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { formatDate, showToast, downloadCSV } from "../utils/helpers";

export const useSupabaseQuery = (table, filters = {}, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from(table).select("*");
    // تطبيق الفلاتر
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) setError(error);
    else setData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, loading, error, refetch: fetchData };
};
