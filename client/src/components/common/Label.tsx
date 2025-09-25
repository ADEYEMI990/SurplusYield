// src/components/common/Label.tsx

import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export default function Label({ children, required, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
