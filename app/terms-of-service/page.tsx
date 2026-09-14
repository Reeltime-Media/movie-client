import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_OF_SERVICE } from "@/lib/legal/terms-of-service";

export const metadata: Metadata = {
  title: "Terms of Service — Reeltime Media",
  description: "The terms that govern your use of Reeltime.",
};

export default function TermsOfServicePage() {
  return <LegalPage document={TERMS_OF_SERVICE} />;
}
