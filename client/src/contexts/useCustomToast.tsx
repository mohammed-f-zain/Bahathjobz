import { X } from "lucide-react";
import toast, { Toast } from "react-hot-toast";
import React from "react";

export function useCustomToast() {
  const toastSuccess = (message: string) => {
    const id = toast.success(
      (t: Toast) => (
        <div className="flex items-center justify-between w-full text-sm">
          <span>{message}</span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-2 text-gray-500 hover:text-gray-800"
          >
            <X size={14} />
          </button>
        </div>
      ),
      {
        style: {
          padding: "6px 10px",
          fontSize: "13px",
          minWidth: "auto",
          borderRadius: "6px",
        },
      }
    );
    return id;
  };

  const toastError = (message: string) => {
    const id = toast.error(
      (t: Toast) => (
        <div className="flex items-center justify-between w-full text-sm">
          <span>{message}</span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-2 text-gray-500 hover:text-gray-800"
          >
            <X size={14} />
          </button>
        </div>
      ),
      {
        style: {
          padding: "6px 10px",
          fontSize: "13px",
          minWidth: "auto",
          borderRadius: "6px",
        },
      }
    );
    return id;
  };

  return { toastSuccess, toastError };
}
