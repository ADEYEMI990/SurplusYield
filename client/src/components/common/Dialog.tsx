// src/components/common/Dialog.tsx

import React from "react";
import clsx from "clsx";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const maxWidthClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Dialog({ isOpen, onClose, title, children, maxWidth = "md" }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div
        className={clsx(
          "bg-white rounded-lg shadow-lg w-full mx-4 p-6 relative",
          maxWidthClasses[maxWidth]
        )}
      >
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        {children}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
