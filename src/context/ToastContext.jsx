import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

const ICONS = {
  info: "ℹ️",
  success: "✓",
  error: "⚠️",
  warning: "⚠️",
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    info: (msg, d) => showToast(msg, "info", d),
    success: (msg, d) => showToast(msg, "success", d),
    error: (msg, d) => showToast(msg, "error", d),
    warning: (msg, d) => showToast(msg, "warning", d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`toast toast-${item.type}`}
            onClick={() => removeToast(item.id)}
            role="alert"
          >
            <span className="toast-icon">{ICONS[item.type]}</span>
            <span className="toast-message">{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
