import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_POLICY } from "@/lib/legal/privacy-policy";
import { PRIVACY_POLICY_KM } from "@/lib/legal/privacy-policy.km";

export const metadata: Metadata = {
  title: "Privacy Policy — Reeltime Media",
  description: "How Reeltime Media collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage documents={{ en: PRIVACY_POLICY, km: PRIVACY_POLICY_KM }} />;
}
