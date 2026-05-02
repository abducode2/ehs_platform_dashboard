import React, { useEffect, useRef } from "react";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const { lang } = useThemeLang();
  const t = (key) => {
    const dict = T[lang];
    if (!dict) return key;
    return dict[key] || key;
  };
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="confirm-box" ref={modalRef}>
        <div className="confirm-icon">🗑️</div>
        <div className="confirm-title">{title || t("confirmDelete")}</div>
        <div className="confirm-sub">{message || t("confirmDeleteMsg")}</div>
        <div className="confirm-actions">
          <button className="btn btn-danger" onClick={onConfirm}>
            {t("yes")}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>
            {t("no")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
