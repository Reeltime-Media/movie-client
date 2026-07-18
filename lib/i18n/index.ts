export type { Locale } from "./locale-store";
export {
  subscribeLocale,
  getServerLocaleSnapshot,
  getLocaleSnapshot,
  applyLocale,
} from "./locale-store";

export type { TranslationKey } from "./dictionaries/en";
export { translate } from "./messages";
