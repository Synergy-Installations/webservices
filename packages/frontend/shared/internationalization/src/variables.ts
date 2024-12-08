export const locales: string[] = ["en-US", "de-AT"];
export const defaultLocale: string = "en-US";
// The user locale is responsible for storing the user's preferred locale.
export const userCookieLocale: string = "x-synergy-user-locale";
// The predictive locale is the locale that the server predicts the user prefers.
// If no locale is set at first request, the predictive locale will be negotiated
// based on the user's preferred locale (if already available) or accept-language header.
export const predictiveCookieLocale: string =
  "x-synergy-predict-locale";

export default locales;
