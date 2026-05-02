import { useEffect, useRef } from "react";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";

const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  maxWidth = "560px",
  confirmText,
}) => {
  const { lang } = useThemeLang();
  const t = (key) => {
    const dict = T[lang];
    if (!dict) return key;
    return dict[key] || key;
  };
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={{ maxWidth }} ref={modalRef}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            {t("cancel")}
          </button>
          <button className="btn btn-primary" form="modal-form" type="submit">
            {confirmText || t("save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
