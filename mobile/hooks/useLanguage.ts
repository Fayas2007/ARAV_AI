// hooks/useLanguage.ts
import { useAuthStore } from '../store/authStore';
import { locales, LocaleKey, Translations } from '../locales';

export function useLanguage() {
  const user = useAuthStore((s) => s.user);
  const lang = (user?.preferred_language || 'en') as LocaleKey;
  const strings: Translations = locales[lang] || locales.en;
  return { lang, strings };
}
