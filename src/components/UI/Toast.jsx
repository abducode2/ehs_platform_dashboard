import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

let toastContainer = null;
let toastRoot = null;

const ToastItem = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  return (
    <div className={`toast-item toast-${type}`}>
      <span>{icons[type] || "ℹ️"}</span> {message}
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    window.showToast = addToast;
  }, []);

  return (
    <div id="toast">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      ))}
    </div>
  );
};

export const initToast = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
    toastRoot.render(<ToastContainer />);
  }
};

const Toast = () => {
  initToast();
  return null;
};

export default Toast;
