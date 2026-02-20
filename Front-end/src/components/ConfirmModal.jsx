import { useEffect } from "react";

/**
 * ConfirmModal Component
 * Reusable confirmation modal with custom actions
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "danger", // 'danger' | 'success' | 'warning'
  children,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      button: "bg-red-600 hover:bg-red-700 text-white",
      icon: "text-red-600",
    },
    success: {
      button: "bg-green-600 hover:bg-green-700 text-white",
      icon: "text-green-600",
    },
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
      icon: "text-yellow-600",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-purple/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-beige rounded-2xl shadow-2xl max-w-md w-full animate-modal-appear">
        {/* Header */}
        <div className="p-6 border-b border-lavender/20">
          <h3 className="text-2xl font-bold text-dark-purple font-saira">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <p className="text-gray-700 mb-4 leading-relaxed">{message}</p>
          )}
          {children}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-lavender/20 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border-2 border-lavender text-dark-purple font-semibold hover:bg-lavender/10 transition-colors font-saira"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-colors font-saira ${typeStyles[type].button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
