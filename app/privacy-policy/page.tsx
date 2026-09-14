import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_POLICY } from "@/lib/legal/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy — Reeltime Media",
  description: "How Reeltime Media collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage document={PRIVACY_POLICY} />;
}
