import type { Metadata } from "next";
import Story from "@/components/story/Story";

export const metadata: Metadata = {
  title: { absolute: "NODAL | A reef written by the water" },
  description:
    "Cybersigil data center pods for the tropics, drawn like bio-organic tattoos, shaped by the seafloor and paired with a protocol that can say do not deploy yet.",
};

export default function Page() {
  return <Story />;
}
