/**
 * Liste aller Bilder auf der Website, die mit KI erstellt wurden.
 * Jedes Bild, dessen Pfad einen dieser Einträge enthält, bekommt automatisch
 * die Kennzeichnung „KI-generiert“.
 *
 * Neues KI-Bild? Einfach den Dateinamen (oder einen eindeutigen Teil davon)
 * hier ergänzen.
 */
export const AI_GENERATED_IMAGES: string[] = [
  "ChatGPT", // alle Bilder, die mit ChatGPT erstellt wurden
];

export const isAiGenerated = (src: string | undefined | null): boolean => {
  if (!src) return false;
  let decoded = src;
  try {
    decoded = decodeURIComponent(src);
  } catch {
    // ungültige Kodierung – Originalpfad verwenden
  }
  return AI_GENERATED_IMAGES.some(
    (entry) => src.includes(entry) || decoded.includes(entry)
  );
};

export default isAiGenerated;
