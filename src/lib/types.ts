import type { Lang } from "./i18n/dict";

export type Coach = {
  id: string;
  full_name: string;
  role: string;
  phone: string;
  language: Lang;
  token: string;
  active: boolean;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  coach_id: string;
  active: boolean;
  created_at: string;
};

export type Lesson = {
  week_number: number;
  title_he: string;
  title_ar: string;
  briefing_he: string;
  briefing_ar: string;
  message_he: string;
  message_ar: string;
  flyer_he_url: string | null;
  flyer_ar_url: string | null;
};

export type Completion = {
  id: string;
  group_id: string;
  coach_id: string;
  week_number: number;
  completed_at: string;
};

export const LESSON_COLUMNS =
  "week_number,title_he,title_ar,briefing_he,briefing_ar,message_he,message_ar,flyer_he_url,flyer_ar_url";
