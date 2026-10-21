/**
 * The site is for readers in India: every date/time shown is Indian Standard Time, whatever
 * timezone the server runs in (Azure App Service runs in UTC, 5½ hours behind IST).
 * Pass this as `timeZone` to every Intl.DateTimeFormat that displays a date or time.
 */
export const SITE_TIME_ZONE = "Asia/Kolkata";
