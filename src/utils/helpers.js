import { T } from "./translations.js";

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
};

export const getProjectName = (projectKey, lang = "ar") => {
  return projectKey;
};

export const getUserName = (userId, usersData, lang = "ar") => {
  const user = usersData.find((u) => u.id === userId);
  return user ? user[`name_${lang}`] : "-";
};

export const getIncidentTypeLabel = (type, lang = "ar") => {
  return translate(lang, type);
};

export const getPermitTypeLabel = (type, lang = "ar") => {
  return translate(lang, type);
};

export const getNoteTypeLabel = (type, lang = "ar") => {
  return translate(lang, type);
};

export const showToast = (message, type = "success") => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[Toast] ${type}: ${message}`);
  }
};

export const downloadCSV = (data, filename) => {
  const csvRows = [];
  const headers = Object.keys(data[0] || {});
  csvRows.push(headers.join(","));
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const translate = (lang, key) => {
  const dict = T[lang];
  if (!dict) return key;
  return dict[key] || key;
};
