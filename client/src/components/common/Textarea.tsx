// src/components/common/Textarea.tsx

import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, ...props }: TextareaProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <textarea
        {...props}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
