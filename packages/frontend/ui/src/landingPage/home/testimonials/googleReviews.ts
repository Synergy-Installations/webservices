/**
 * Lädt die aktuellen Google-Bewertungen von Synergie (Google Places API, „New“).
 *
 * Benötigt zwei Umgebungsvariablen (nur auf dem Server, z. B. in Vercel):
 *   GOOGLE_PLACES_API_KEY – API-Schlüssel mit aktivierter „Places API (New)“
 *   GOOGLE_PLACE_ID       – Place-ID des Google-Unternehmensprofils
 *
 * Fehlt eine Variable oder schlägt die Abfrage fehl, wird eine leere Liste
 * zurückgegeben – die Website zeigt dann die hinterlegten Bewertungen an.
 * Die Antwort wird 12 Stunden zwischengespeichert.
 */

export interface GoogleReview {
  name: string;
  profilePhotoUrl: string;
  profileUrl: string;
  rating: number;
  text: string;
}

const REVALIDATE_SECONDS = 60 * 60 * 12;

export async function fetchGoogleReviews(
  languageCode = "de",
): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return [];

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${languageCode}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "reviews",
        },
        // Next.js-Zwischenspeicher (nicht im Standard-Typ von fetch enthalten)
        next: { revalidate: REVALIDATE_SECONDS },
      } as RequestInit & { next?: { revalidate?: number } },
    );
    if (!res.ok) return [];
    const data: any = await res.json();
    const reviews: any[] = Array.isArray(data?.reviews) ? data.reviews : [];

    return reviews
      .map((r) => ({
        name: String(r?.authorAttribution?.displayName || ""),
        profilePhotoUrl: String(r?.authorAttribution?.photoUri || ""),
        profileUrl: String(r?.authorAttribution?.uri || ""),
        rating: Number(r?.rating || 0),
        text: String(r?.originalText?.text || r?.text?.text || ""),
      }))
      .filter((r) => r.name && r.text && r.rating >= 4);
  } catch {
    return [];
  }
}

export default fetchGoogleReviews;
