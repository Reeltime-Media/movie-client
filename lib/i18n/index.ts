export type { Locale } from "./locale-store";
export {
  LOCALE_STORAGE_KEY,
  subscribeLocale,
  getServerLocaleSnapshot,
  getLocaleSnapshot,
  applyLocale,
} from "./locale-store";

export type { TranslationKey } from "./dictionaries/en";
export { messages, translate } from "./messages";
