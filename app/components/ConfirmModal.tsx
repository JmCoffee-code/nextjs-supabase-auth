"use client";

import { AlertTriangle, Icon, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen : boolean;
    onClose : () => void;
    onConfirm : () => void;
    title? : string;
    message : string;
    confirmText? : string;
    cancelText? : string;
    variant : "danger" | "warning" | "info";
    isLoading? : boolean;
    error? : string | null;
}

const ConfirmModal = ({
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action", 
    message, 
    confirmText = "Confirm",  
    cancelText = "Cancel", 
    variant = "danger", 
    isLoading = false,
    error
} : ConfirmModalProps) => {

        if(!isOpen) return null;

        const handleConfirm = () => {
            onConfirm();
        };

        const handleClose = () => {
            if(!isLoading) {
                onClose();
            }
        };

        const variantStyles = {
            danger: {
                icon: "text-red-400",
                button: "bg-red-500 hover:bg-red-600",
            },
            warning: {
                icon: "text-red-400",
                button: "bg-amber-500 hover:bg-red-600"
            },
            info: {
                icon: "text-red-400",
                button: "bg-blue-500 hover:bg-red-600"
            },
        };

        const styles = variantStyles[variant];
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900 shadow-xl">

      {/* Top section */}
      <div className="flex items-center justify-between border-b border-gray-800 p-6">

        <div className="flex items-center gap-3">
          <AlertTriangle className={`h-8 w-8 ${styles.icon}`} />
        </div>

        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>

      </div>

      {/* Message section */}
      <div className="p-6">
        <p className="text-gray-300">
          {message}
        </p>
      </div>

      {error && <div className="p-6">
        <p className="rounded-lg text-red-200 bg-red-900 px-4 py-2">
          {error}
        </p>
      </div>}

      <div className="flex justify-end gap-3 border-t border-gray-800 p-6">
        <button 
        type="button" 
        onClick={handleClose} 
        className="rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-2 cursor-pointer">
            {cancelText}
        </button>
        <button type="button" onClick={handleConfirm} className={`${styles.button} px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer`}>
            {isLoading ? "Processing..." : confirmText}
        </button>
      </div>

    </div>
  </div>
);
};

export default ConfirmModal