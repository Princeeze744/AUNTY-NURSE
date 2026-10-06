import type { ReactNode } from "react";
import MotherShell from "./mother-shell";
import "./mother.css";

export default function MotherLayout({ children }: { children: ReactNode }) {
  return <MotherShell>{children}</MotherShell>;
}
