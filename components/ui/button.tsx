import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  { variants: { variant: { default: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5 hover:bg-blue-700", secondary: "bg-slate-900 text-white hover:bg-slate-800", outline: "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50", ghost: "text-slate-600 hover:bg-slate-100", green: "bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600" }, size: { default: "h-11 px-4", sm: "h-9 px-3.5 text-xs", lg: "h-12 px-5" } }, defaultVariants: { variant: "default", size: "default" } }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />);
Button.displayName = "Button";

export { Button, buttonVariants };
