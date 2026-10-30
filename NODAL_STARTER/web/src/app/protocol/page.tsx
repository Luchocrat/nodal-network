import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Protocol: Marine Observatory",
  description:
    "Environmental decision-support prototype for proposed underwater computing infrastructure in Miami. Observed data, explicit simulation, conceptual architecture. Not a deployment certification.",
};

export default function ProtocolPage() {
  return <Dashboard />;
}
