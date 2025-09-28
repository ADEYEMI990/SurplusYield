import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const paddingClasses: Record<string, string> = {
  none: "p-0",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

const roundedClasses: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export default function Card({
  children,
  className,
  shadow = true,
  padding = "md",
  rounded = "lg",
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white",
        shadow && "shadow-md",
        paddingClasses[padding],
        roundedClasses[rounded],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={clsx("text-xl font-semibold", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}
