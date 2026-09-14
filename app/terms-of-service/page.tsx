import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_OF_SERVICE } from "@/lib/legal/terms-of-service";
import { TERMS_OF_SERVICE_KM } from "@/lib/legal/terms-of-service.km";

export const metadata: Metadata = {
  title: "Terms of Service — Reeltime Media",
  description: "The terms that govern your use of Reeltime.",
};

export default function TermsOfServicePage() {
  return <LegalPage documents={{ en: TERMS_OF_SERVICE, km: TERMS_OF_SERVICE_KM }} />;
}
