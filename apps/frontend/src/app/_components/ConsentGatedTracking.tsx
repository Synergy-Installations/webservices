"use client";

import GoogleTag from "@com.synergy/frontend-ui/GoogleTag";
import YandexTag from "@com.synergy/frontend-ui/YandexTag";
// @ts-ignore
import { useConsentManager } from "@c15t/react";

/**
 * Google Tag Manager, Google Analytics and Yandex Metrica are all analytics
 * ("measurement") trackers. They must only load once the visitor has granted
 * consent for that category in the cookie banner / privacy dialog.
 */

export function GatedYandexTag({ children }: { children: React.ReactNode }) {
  const { hasConsentFor } = useConsentManager();

  if (!hasConsentFor("measurement")) {
    return <>{children}</>;
  }

  return <YandexTag>{children}</YandexTag>;
}

export function GatedGoogleTag() {
  const { hasConsentFor } = useConsentManager();

  if (!hasConsentFor("measurement")) {
    return null;
  }

  return <GoogleTag />;
}
