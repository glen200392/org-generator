// Internationalization functions
// Extracted from index.html L858-866

import { translations } from "./translations";
import type { Lang, TranslationKey } from "./translations";

/**
 * Create an i18n context with mutable language state.
 * This replaces the global uiLang/docLang variables from the original code.
 */
export function createI18n(initialUiLang: Lang = "tw", initialDocLang: Lang = "tw") {
  let uiLang: Lang = initialUiLang;
  let docLang: Lang = initialDocLang;

  /** Get a UI translation by key */
  function t(key: TranslationKey): string {
    const val = translations[uiLang][key];
    return val !== undefined ? val : key;
  }

  /** Get a UI translation with token replacement: {count}, {errors}, etc. */
  function tf(key: TranslationKey, values: Record<string, string | number> = {}): string {
    return t(key).replace(/\{(\w+)\}/g, (_, token: string) =>
      values[token] !== undefined ? String(values[token]) : "",
    );
  }

  /** Get a document-language translation (falls back to UI language) */
  function dt(key: TranslationKey): string {
    const val = translations[docLang][key];
    return val !== undefined ? val : t(key);
  }

  /** Set the UI language */
  function setUiLang(lang: Lang) {
    uiLang = lang;
  }

  /** Set the document/export language */
  function setDocLang(lang: Lang) {
    docLang = lang;
  }

  /** Get current UI language */
  function getUiLang(): Lang {
    return uiLang;
  }

  /** Get current document language */
  function getDocLang(): Lang {
    return docLang;
  }

  return { t, tf, dt, setUiLang, setDocLang, getUiLang, getDocLang };
}

export type I18n = ReturnType<typeof createI18n>;
