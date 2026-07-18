import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl border border-white/80 bg-white/85 shadow-[0_12px_45px_rgba(15,23,42,0.06)] backdrop-blur", className)} {...props} />;
}
