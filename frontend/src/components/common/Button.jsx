export function Button({ children, variant = "primary", className = "", ...props }) {
  const classMap = {
    primary: "btn-primary",
    secondary: "btn-secondary",
  };

  return (
    <button type="button" className={`${classMap[variant] || classMap.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
