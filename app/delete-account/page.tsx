"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/auth/use-user";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { pageTitleClassName } from "@/lib/ui/page-title";

const SUPPORT_EMAIL = "support@reeltime.com";
// Kept in English in both locales so the subject line quoted in step 2 always
// matches what actually lands in the support inbox.
const MAIL_SUBJECT = "Delete my Reeltime account";

const COPY = {
  en: {
    title: "Delete your account",
    intro: "You can ask us to delete your Reeltime account and the personal data associated with it at any time, whether or not you're currently signed in. Follow the steps below to submit a request.",
    howToTitle: "How to request deletion",
    step1Prefix: "Email ",
    step1Suffix: " from the address on your Reeltime account, or include that email address in your message.",
    step2: `Use the subject line "${MAIL_SUBJECT}" so we can route your request quickly.`,
    // 30-day SLA is a placeholder default — confirm the real turnaround with the business before publishing.
    step3: "We verify the request and delete your account within 30 days.",
    signedInAs: "Signed in as",
    ctaLabel: "Request account deletion",
    mailBodyIntro: "Please delete my Reeltime account and associated data.",
    mailBodyEmailLabel: "Account email",
    mailBodyEmailPlaceholder: "[enter your account email]",
    deletedTitle: "What gets deleted",
    deletedItems: [
      "Your profile (name, email, password, avatar)",
      "Your watch history, watch progress, and library/favorites",
      "Comments you've posted",
      "Any devices linked to your account",
    ],
    retainTitle: "What we retain, and why",
    retainText: "We keep records of completed purchases and payments (made via KHQR/Bakong) for a limited period after deletion, as required for accounting, tax, and legal compliance, and to prevent fraud. These records aren't used for any other purpose and are deleted or anonymized once that retention period ends.",
    privacyLead: "For full detail on how we collect, use, and protect your data, see our",
    privacyLinkLabel: "Privacy Policy",
  },
  km: {
    title: "លុបគណនីរបស់អ្នក",
    intro: "អ្នកអាចស្នើសុំឲ្យយើងលុបគណនី Reeltime និងទិន្នន័យផ្ទាល់ខ្លួនពាក់ព័ន្ធនឹងវា នៅពេលណាមួយ មិនថាអ្នកកំពុងចូលគណនីឬអត់នោះទេ។ សូមអនុវត្តតាមជំហានខាងក្រោម ដើម្បីដាក់ស្នើសំណើ។",
    howToTitle: "របៀបស្នើសុំលុបគណនី",
    step1Prefix: "ផ្ញើអ៊ីមែលទៅ ",
    step1Suffix: " ពីអាសយដ្ឋានដែលភ្ជាប់ជាមួយគណនី Reeltime របស់អ្នក ឬបញ្ចូលអាសយដ្ឋានអ៊ីមែលនោះនៅក្នុងសាររបស់អ្នក។",
    step2: `ប្រើចំណងជើងសារ "${MAIL_SUBJECT}" ដើម្បីឲ្យយើងអាចដំណើរការសំណើរបស់អ្នកបានលឿន។`,
    step3: "យើងផ្ទៀងផ្ទាត់សំណើ ហើយលុបគណនីរបស់អ្នកក្នុងរយៈពេល ៣០ថ្ងៃ។",
    signedInAs: "កំពុងចូលគណនីជា",
    ctaLabel: "ស្នើសុំលុបគណនី",
    mailBodyIntro: "សូមលុបគណនី Reeltime និងទិន្នន័យពាក់ព័ន្ធរបស់ខ្ញុំ។",
    mailBodyEmailLabel: "អាសយដ្ឋានអ៊ីមែលគណនី",
    mailBodyEmailPlaceholder: "[បញ្ចូលអាសយដ្ឋានអ៊ីមែលគណនីរបស់អ្នក]",
    deletedTitle: "អ្វីដែលនឹងត្រូវលុប",
    deletedItems: [
      "ព័ត៌មានប្រវត្តិរូបរបស់អ្នក (ឈ្មោះ អ៊ីមែល ពាក្យសម្ងាត់ រូបភាពប្រវត្តិរូប)",
      "ប្រវត្តិទស្សនា វឌ្ឍនភាពទស្សនា និងបណ្ណាល័យ/ចំណូលចិត្តរបស់អ្នក",
      "មតិយោបល់ដែលអ្នកបានបង្ហោះ",
      "ឧបករណ៍ណាមួយដែលបានភ្ជាប់ជាមួយគណនីរបស់អ្នក",
    ],
    retainTitle: "អ្វីដែលយើងរក្សាទុក និងហេតុអ្វី",
    retainText: "យើងរក្សាទុកកំណត់ត្រានៃការទិញ និងការទូទាត់ដែលបានបញ្ចប់ (ធ្វើឡើងតាមរយៈ KHQR/Bakong) សម្រាប់រយៈពេលមានកម្រិតមួយ បន្ទាប់ពីការលុបគណនី ដូចដែលតម្រូវសម្រាប់ការគណនេយ្យ ពន្ធដារ និងការអនុលោមតាមច្បាប់ និងដើម្បីទប់ស្កាត់ការក្លែងបន្លំ។ កំណត់ត្រាទាំងនេះមិនត្រូវបានប្រើសម្រាប់គោលបំណងផ្សេងទៀតឡើយ ហើយនឹងត្រូវបានលុប ឬធ្វើឲ្យមិនអាចសម្គាល់អត្តសញ្ញាណបាន នៅពេលដែលរយៈពេលរក្សាទុកនោះបានផុតកំណត់។",
    privacyLead: "សម្រាប់ព័ត៌មានលម្អិតពេញលេញអំពីរបៀបដែលយើងប្រមូល ប្រើប្រាស់ និងការពារទិន្នន័យរបស់អ្នក សូមមើល",
    privacyLinkLabel: "គោលការណ៍ភាពឯកជន",
  },
};

function buildDeletionMailto(email: string | null, copy: (typeof COPY)["en"]): string {
  const subject = encodeURIComponent(MAIL_SUBJECT);
  const body = encodeURIComponent(
    `${copy.mailBodyIntro}\n\n${copy.mailBodyEmailLabel}: ${
      email ?? copy.mailBodyEmailPlaceholder
    }`,
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export default function DeleteAccountPage() {
  // refreshIfMissing: false — this page must render the same instructions for a
  // signed-out visitor (incl. an app-store reviewer) as for a signed-in user.
  const { user } = useUser({ refreshIfMissing: false });
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <PageShell footer>
      <section className="px-6 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="mx-auto max-w-2xl">
          <h1 className={pageTitleClassName}>{copy.title}</h1>
          <p className="mt-4 text-[13px] leading-relaxed text-text-muted">{copy.intro}</p>

          <div className="mt-8 rounded-xl border border-border bg-surface p-5 md:p-6">
            <h2 className="text-[14px] font-bold text-text">{copy.howToTitle}</h2>
            <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-[13px] leading-relaxed text-text-muted">
              <li>
                {copy.step1Prefix}
                <span className="text-text">{SUPPORT_EMAIL}</span>
                {copy.step1Suffix}
              </li>
              <li>{copy.step2}</li>
              <li>{copy.step3}</li>
            </ol>

            {user?.email ? (
              <p className="mt-4 text-[12px] text-text-disabled">
                {copy.signedInAs} <span className="text-text-muted">{user.email}</span>
              </p>
            ) : null}

            <a
              href={buildDeletionMailto(user?.email ?? null, copy)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Mail size={15} aria-hidden />
              {copy.ctaLabel}
            </a>
          </div>

          <div className="mt-10">
            <h2 className="text-[14px] font-bold text-text">{copy.deletedTitle}</h2>
            <ul className="mt-3 space-y-2">
              {copy.deletedItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-muted"
                >
                  <span
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-text-disabled"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="text-[14px] font-bold text-text">{copy.retainTitle}</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-text-muted">{copy.retainText}</p>
          </div>

          <p className="mt-10 text-[12px] leading-relaxed text-text-muted">
            {copy.privacyLead}{" "}
            <Link
              href="/privacy-policy"
              className="text-text-muted underline underline-offset-2 hover:text-text"
            >
              {copy.privacyLinkLabel}
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
