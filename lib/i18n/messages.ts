import type { Locale } from "./locale-store";
import type { TranslationKey } from "./dictionaries/en";
import { en } from "./dictionaries/en";
import { km } from "./dictionaries/km";

export type { TranslationKey };

const messages: Record<Locale, { [K in TranslationKey]: string }> = {
  en,
  km,
};

export function translate(locale: Locale, key: TranslationKey): string {
  return messages[locale][key];
}
