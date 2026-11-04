import type { LessonViewData } from "@/components/LessonCards";
import { pickLang } from "./i18n/content";
import type { Lang } from "./i18n/dict";
import type { Lesson } from "./types";

/** Lesson fields in `lang`, each falling back to the other language. Null when empty. */
export function lessonView(lesson: Lesson | null, lang: Lang): LessonViewData | null {
  if (!lesson) return null;
  const view: LessonViewData = {
    title: pickLang(lang, lesson.title_he, lesson.title_ar),
    briefing: pickLang(lang, lesson.briefing_he, lesson.briefing_ar),
    message: pickLang(lang, lesson.message_he, lesson.message_ar),
    flyerUrl: pickLang(lang, lesson.flyer_he_url, lesson.flyer_ar_url),
  };
  if (!view.title && !view.briefing) return null;
  return view;
}
