import React from "react";


export function Badge({ variant = "default", className = "", ...props }) {
  const base =
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold " +
    "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    outline: "text-foreground",
    destructive: "bg-destructive text-destructive-foreground border-transparent",
  };
  const classes = `${base} ${variants[variant] || variants.default} ${className}`;
  return <span className={classes} {...props} />;
}

export default Badge;
