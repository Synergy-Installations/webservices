#!/usr/bin/env python3
"""Translate en.json from German to premium-toned English."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict

from argostranslate import translate as argos_translate
from langdetect import detect, LangDetectException


INPUT_FILE = Path(
    "/Users/erias/Documents/Programming/JavaScript/Synergy-installations/synergy-webservices/"
    "packages/frontend/shared/internationalization/messages/en.json"
)
DE_REFERENCE = Path(
    "/Users/erias/Documents/Programming/JavaScript/Synergy-installations/synergy-webservices/"
    "packages/frontend/shared/internationalization/messages/at-AT.json"
)

# Curated translations for frequently reused short strings to ensure tone consistency.
MANUAL_TRANSLATIONS: Dict[str, str] = {
    # Buttons & navigation
    "Jetzt Anfragen": "Request a Consultation",
    "Mehr erfahren": "Learn more",
    "Unsere Produkte": "Our Products",
    "Detaillierte Ansicht": "Detailed View",
    "Abschicken": "Send Request",
    "Weitere Informationen": "More Information",
    "Buchen Sie Ihre PV Montage": "Book Your PV Installation",
    "Kostenfreies Beratungsgespräch sichern": "Secure Your Complimentary Consultation",
    "/kontakt": "/contact",
    "/contact-us": "/contact-us",
    "/products": "/products",
    "/ueber-uns": "/about-us",
    "/funnel/photovoltaik": "/funnel/photovoltaics",
    "/focus/photovoltaik": "/focus/photovoltaics",
    "/focus/waermepumpe": "/focus/heat-pump",
    "/focus/klimasysteme": "/focus/climate-systems",
    "/focus/smart-home": "/focus/smart-home",
    "/focus/stromspeicher": "/focus/power-storage",
    "/focus/stromtankstelle": "/focus/charging-station",

    # Hero section
    "Photovoltaik": "Photovoltaics",
    "Wärmesysteme": "Heat Systems",
    "Klimatechnik": "Climate Technology",
    "Klimasysteme": "Climate Systems",
    "Smart Home": "Smart Home",
    "Energiemanagement": "Energy Management",
    "Wallbox": "Wallbox",

    # Teaser boxes
    "Ihr Vorteil:": "Your Advantage:",
    "Ihr maßgeschneidertes Konzept:": "Your Tailored Concept:",
    "Ihre Sicherheit:": "Your Security:",
    "Immer für Sie da:": "Always Here for You:",
    "Wir beraten Sie persönlich durch kompetente Fachkräfte.": (
        "Our seasoned experts provide bespoke, personal guidance."
    ),
    "Produktunabhängige Lösungen mit transparenter stabiler Preisgestaltung": (
        "Independent recommendations with transparent, stable pricing."
    ),
    "Präzise Machbarkeits- & Kosten-Nutzen-Analyse - Wir planen, errichten und betreuen Ihre Anlagen wie unsere eigenen.": (
        "Meticulous feasibility and cost-benefit assessments — we design, build, and maintain your systems as if they were our own."
    ),
    "Wir sind täglich für Sie im Einsatz und erreichbar.": (
        "We are on call every day and always within reach."
    ),

    # Headlines
    "Preisstabil, Unabhängig, Zuverlässig, Kompetent": "Price-Stable · Independent · Reliable · Expert",
    "Moderne Haustechnik <br></br> zum Wohlfühlen": "Modern Home Technology <br></br> that Feels Exceptional",
    "Erste Klasse": "First Class",
    "Kundenbedürfnisse": "Client Priorities",
    "Prozessorientiert": "Process-Oriented",
    "Hohe Standards": "Elevated Standards",
    "Unsere KundInnen sind überzeugt": "Our Clients Are Convinced",
    "kW gesamt installierte Leistung": "kW total installed capacity",
    "Jahre in der Branche": "Years in the industry",
    "Derzeitige Energietechnik": "Current Energy Technology",
    "Anlagenkomposition": "System Composition",

    # Footer
    "© Synergie.cc - Alle rechte Vorbehalten.": "© Synergie.cc – All rights reserved.",

    # Product highlights
    "Hochleistungsmodule": "High-Performance Modules",
    "Geringere Heizkosten": "Reduced Heating Costs",
    "Klimaanlage": "Air Conditioning",
    "Moderne Klimaanlagen": "Modern Air Conditioning Systems",
    "sind deutlich energieeffizienter geworden": "have become significantly more energy efficient",
    "Energiemanagement & Stromspeicher": "Energy Management & Power Storage",
    "Energiefluss jederzeit im Griff": "Energy flow under control at all times",
    "Splitklimaanlage Inverter Sensira 2,5 kW *": "Split air-conditioning system Inverter Sensira 2.5 kW *",
    "Keine Anfahrtskosten": "No travel costs",
    "Fronius Photovoltaik": "Fronius Photovoltaics",
    "In 6 Wochen installiert": "Installed within 6 weeks",
    "Dank der eignen Wallbox": "Thanks to your own wallbox",
    "Aufputz Montage der isolierten Kupferleitungen, im Kabelkanal verlegt bis max. 5 Meter": "Surface-mounted installation of insulated copper pipes in a cable duct up to 5 meters",
    "10 Meter Kupferleitungen isoliert ": "10 meters of insulated copper cabling",
    "Mit unserem Sonnenkraftwerk werden Sie zum unabhängigen Klimahelden.": "Our solar power plant turns you into a self-reliant climate champion.",
    "Nutzen Sie unser Wärmesystem und gönnen Sie sich ein warmes Zuhause aus eigener Produktion.": "Rely on our heat systems for a cozy home powered by your own energy.",
    "Erleben Sie das angenehme Raumklima, wohl temperiert und zugeschnitten auf Ihre Bedürfnisse.": "Enjoy perfectly balanced indoor comfort tailored to your needs.",
    "Lassen Sie sich verwöhnen, einfach zu bedienen und voll automatisiert.": "Indulge in intuitive controls that are effortless to use and fully automated.",
    "Bringen Sie das Verhältnis zwischen Produktion und Verbrauch in Einklang.": "Keep production and consumption perfectly in sync.",
    "Unäbhangig in das nachste Level - mit uns werden Sie mobil.": "Step up to effortless mobility with a wallbox tailored to you.",
    "Wallboxen": "Wallboxes",
    "Nie wieder tanken": "Never refuel again",
    "Elektroautos mit PV Strom laden": "Charge EVs with PV power",
    "Bei 30.000 km pro Jahr sparen Sie etwa 3.600 € pro Jahr - eine Kostenreduktion von rund 85%": "At 30,000 km a year you save roughly €3,600—around 85% in cost reductions.",
    "4x günstiger als Benzin": "Up to 4x more affordable than petrol",
    "Mit einer Wallbox laden Sie Ihr Elektroauto bequem zu Hause auf und fahren so bis zu viermal günstiger als mit Benzin.": "Charge conveniently at home and enjoy up to four times lower running costs.",
    "Schnelleres Laden": "Faster charging",
    "Wallboxen ermöglichen deutlich kürzere Ladezeiten im Vergleich zu herkömmlichen Steckdosen": "Wallboxes shorten charging sessions dramatically compared with standard sockets.",
    "Kompatibilität mit erneuerbaren Energien": "Seamless renewable pairing",
    "Wallboxen lassen sich mit Photovoltaikanlagen und Stromspeichern kombinieren, was die Nutzung von selbst erzeugtem Solarstrom ermöglicht": "Combine your wallbox with PV systems and storage to use self-generated solar power.",
    "Komfort und Bequemlichkeit": "Comfort and convenience",
    "Eine eigene Ladestation ermöglicht das bequeme Aufladen in der Garage oder unter einem Carport,": "Charge with ease in your garage or carport thanks to a dedicated station.",
    "Maximale Unabhängigkeit": "Maximum independence",
    "mit E-Auto & PV nahezu komplett autark von Ölindustrie": "Pair EVs with PV to become virtually independent from fossil fuels.",

    # B2B services
    "Energievertrieb": "Energy Sales",
    "Kundenbindung": "Customer Loyalty",
    "Neukundengewinnung": "New Customer Acquisition",
    "Langfristige Kundenbindung": "Long-term Customer Loyalty",
    "Analyse Ihrer Produkte": "Analysis of your products",
    "Kundenbetreuung": "Client Care",
    "Energievertrieb starten": "Launch Energy Sales",
    "Kosteneffiziente Alternative zu Gerichtsverfahren": "Cost-efficient alternative to litigation",
    "Energieausweis": "Energy Performance Certificate",
    "Energieausweis anfordern": "Request Energy Performance Certificate",
    "Langfristige Kosteneinsparungen": "Long-term cost savings",
    "Erstellung des Energieausweises": "Preparation of the energy performance certificate",
    "Planung": "Planning",
    "Planung anfragen": "Request Planning",
    "Projektplanung": "Project Planning",
    "Technische Planung": "Technical Planning",
    "Genehmigungsplanung": "Permitting Strategy",
    "Reduzierte Kosten durch vorausschauende Planung": "Reduced costs through forward-looking planning",
    "Kundendienst": "Customer Service",
    "Kundendienst anfragen": "Request Customer Service",
    "Optimierte Betriebskosten durch gezielte Eingriffe": "Optimised operating costs through targeted interventions",
    "Leistungsnachweis": "Performance verification",
    "Reduzierte Heizkosten": "Reduced heating costs",
    "Weniger Pumpenergieverbrauch": "Lower pump energy consumption",
    "Verbesserter Wohnkomfort": "Improved living comfort",
    "Kostenkontrolle": "Cost control",
    "Zentrale Planung & Steuerung": "Central Planning & Coordination",
    "Ergebnisdokumentation": "Outcome documentation",
    "Bessere Verhandlungsergebnisse": "Improved negotiation outcomes",
    "Dokumentation der Ergebnisse": "Documentation of the results",
    "Messbare Kampagnenergebnisse": "Measurable campaign results",
    "Erweiterung Ihres Marktanteils": "Expand your market share",
    "Moderation der Verhandlung": "Neutral negotiation moderation",
    "Erhalt der Garantie": "Preservation of manufacturer warranties",
    "Schnelle Wiederherstellung der Funktion": "Rapid restoration of functionality",
    "Identifikation der Fehlerquelle": "Identification of the root cause",
    "Berechnung der Soll-Werte": "Calculation of target values",
    "Festlegung der Standards": "Definition of standards",
    "Begleitung bis zum Vertragsabschluss": "Support through to contract signature",
    "Langfristige Begleitung": "Long-term support",

    # Contact & form options
    "Photovoltaik & Stromspeicher": "Photovoltaics & Power Storage",
    "Gemeinschaftliche Erzeugungsanlagen": "Community Generation Plants",
    "Energiegemeinschaften": "Energy Communities",
    "Energiekostenoptimierung": "Energy Cost Optimisation",
    "Smart Home & Energiemanagement Systeme": "Smart Home & Energy Management Systems",
    "Stromtankstellen & Wallboxen": "Charging Stations & Wallboxes",
    "Notstrom Versorgung": "Emergency Power Supply",
    "Adresse Endkunde": "Customer Address",
    "Anlage": "System",
    "Wie hoch ist der Montageort?": "What is the installation height?",
    "Wie ist der Status des Vorhabens? *": "What is the status of the project? *",

    # Focus pages
    "In 3 Monaten zur fertigen Anlage": "From concept to turnkey system in 3 months",
    "Effektive Stromkostenersparnis garantiert": "Effective electricity cost savings guaranteed",
    "Aktiver Umweltschutz durch Solarenergie": "Active environmental protection through solar energy",
    "Unschlagbarer Kundenservice rundum": "Unbeatable end-to-end customer service",
    "In 6 einfachen Schritten zur eigenen PV-Anlage:": "Your own PV system in 6 easy steps:",
    "<b>Drastische Senkung Ihrer Heizkosten</b> garantiert": "<b>Drastic reduction of your heating costs</b> guaranteed",
    "<b>Unschlagbarer Kundenservice</b> rundum": "<b>Unbeatable customer service</b> end to end",
    "Deutliche Senkung Ihrer Stromrechnung durch maximalen Eigenverbrauch": "Noticeable reduction of your electricity bill through maximum self-consumption",
    "In 6 einfachen Schritten zum eigenen Stromspeicher:": "Your own power storage in 6 easy steps:",
    "<b>Effektive Stromkostenersparnis garantiert</b> durch lokalen Energieaustausch": "<b>Effective electricity cost savings guaranteed</b> via local energy exchange",
    "Was ist eine Gemeinschaftliche Erzeugungsanlage (GEA)?": "What is a Community Generation Plant (CGP)?",
    "Wie funktioniert eine gemeinschaftliche Erzeugungsanlage?": "How does a community generation plant work?",
    "Was bringt eine gemeinschaftliche Erzeugungsanlage?": "What are the benefits of a community generation plant?",
    "<b>Planung & Installation:</b> Eine Photovoltaikanlage wird auf dem Dach Ihres Mehrparteienhauses installiert.": "<b>Planning & Installation:</b> A PV system is installed on the roof of your multi-unit property.",
    "Komfortabel, effizient & sicher": "Comfortable, efficient & secure",
    "Intelligentes Energiemanagement:": "Intelligent energy management:",
    "In 6 einfachen Schritten zu Ihrer Wallbox:": "Your wallbox in 6 easy steps:",
    "In 6 einfachen Schritten zu Ihrer Notstromversorgung:": "Your emergency power supply in 6 easy steps:",
    "Individuelle Planung des passenden Notstromsystems": "Tailored planning of the right backup power system",
    "In 6 einfachen Schritten zu Ihrer autarken Warmwassererzeugung:": "Your self-sufficient hot water solution in 6 easy steps:",
    "Maximale Leistung & Ertragssicherheit:": "Maximum output & dependable returns:",
    "Die 4 Stufen zu Ihrem optimalen System": "The 4 steps to your optimal system",
    "In wenigen Wochen zur neuen Heizung": "A new heating system within weeks",
    "In 6 einfachen Schritten zu Ihrem perfekten Raumklima:": "Your perfect indoor climate in 6 easy steps:",
    "In 6 einfachen Schritten zu Ihrem Smart Home:": "Your smart home in 6 easy steps:",
    "In 6 einfachen Schritten zu Ihrem Balkonkraftwerk:": "Your balcony power plant in 6 easy steps:",
    "In 6 einfachen Schritten zu Ihrem Energiemanagement-System:": "Your energy management system in 6 easy steps:",

    # Shared navigation + footer
    "Leistungen": "Services",
    "/leistungen": "/services",
    "Energiekostenberatung": "Energy Cost Advisory",
    "/energiekostenberatung": "/energy-cost-advisory",
    "/energiegemeinschaft": "/energy-community",
    "Stromspeicher": "Power Storage",
    "Stromtankstelle": "Charging Station",
    "/focus/energiegemeinschaft": "/focus/energy-community",
    "/focus/notstromversorgung": "/focus/emergency-power",
    "Komplettpaket Anlage": "Complete System Package",
    "/focus/energiekostenberatung": "/focus/energy-cost-advisory",
}


GERMAN_KEYWORDS = {
    "und",
    "oder",
    "auch",
    "nicht",
    "wir",
    "sie",
    "ihr",
    "ihre",
    "unser",
    "unsere",
    "mit",
    "für",
    "bei",
    "jetzt",
    "hier",
    "warum",
    "mehr",
    "über",
    "energie",
    "strom",
    "heiz",
    "wärme",
    "anfrage",
    "kunden",
    "beratung",
    "angebot",
    "lösungen",
}

TAG_PATTERN = re.compile(r"</?[^>]+?>")
NON_TRANSLATABLE_PREFIXES = (
    "http",
    "/frontend",
    "/focus/",
    "/products",
    "/contact",
    "/services",
    "/le",
    "#",
    "mailto:",
    "tel:",
)
NON_TRANSLATABLE_SUFFIXES = (
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".svg",
    ".mp4",
)


def get_translator():
    languages = argos_translate.load_installed_languages()
    de_language = next((lang for lang in languages if lang.code.startswith("de")), None)
    en_language = next((lang for lang in languages if lang.code.startswith("en")), None)
    if not de_language or not en_language:
        raise RuntimeError("German or English language package not installed for Argos Translate.")
    return de_language.get_translation(en_language)


def protect_tags(text: str):
    placeholders = {}

    def _replace(match):
        key = f"__HTML_TAG_{len(placeholders)}__"
        placeholders[key] = match.group(0)
        return key

    safe_text = TAG_PATTERN.sub(_replace, text)
    return safe_text, placeholders


def restore_tags(text: str, placeholders: Dict[str, str]) -> str:
    for key, tag in placeholders.items():
        text = text.replace(key, tag)
    return text


def clean_spacing(text: str) -> str:
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


def preserve_whitespace(original: str, translated: str) -> str:
    leading = len(original) - len(original.lstrip())
    trailing = len(original) - len(original.rstrip())
    prefix = original[:leading]
    suffix = original[len(original) - trailing :]
    return f"{prefix}{translated.strip()}{suffix}"


def contains_german(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    if stripped in MANUAL_TRANSLATIONS:
        return True
    if any(ch in stripped for ch in "äöüßÄÖÜ"):
        return True
    lowered = TAG_PATTERN.sub(" ", stripped).lower()
    words = re.findall(r"[a-zäöüß]+", lowered)
    return any(word in GERMAN_KEYWORDS for word in words)


def looks_like_text(value: str) -> bool:
    stripped = value.strip()
    if not stripped:
        return False
    lower = stripped.lower()
    if any(lower.startswith(prefix) for prefix in NON_TRANSLATABLE_PREFIXES):
        return False
    if any(lower.endswith(suffix) for suffix in NON_TRANSLATABLE_SUFFIXES):
        return False
    if "%" in stripped and lower.startswith("/"):
        return False
    return any(ch.isalpha() for ch in stripped)


def seems_german_by_detection(value: str) -> bool:
    stripped = value.strip()
    if len(stripped) < 10:
        return False
    try:
        return detect(stripped) == "de"
    except LangDetectException:
        return False


def translate_string(value_en: str, value_de: str | None, translator) -> str:
    if value_en in MANUAL_TRANSLATIONS:
        return MANUAL_TRANSLATIONS[value_en]
    if value_de and value_de in MANUAL_TRANSLATIONS:
        return MANUAL_TRANSLATIONS[value_de]

    if not looks_like_text(value_en):
        return value_de if value_de is not None else value_en

    needs_translation = False
    source_text = value_en

    if value_de is not None and value_en == value_de and looks_like_text(value_en):
        if contains_german(value_en) or seems_german_by_detection(value_en):
            needs_translation = True
            source_text = value_de
    elif contains_german(value_en):
        needs_translation = True
    elif value_de and looks_like_text(value_de) and seems_german_by_detection(value_de):
        needs_translation = True
        source_text = value_de

    if not needs_translation:
        return value_en

    safe_value, placeholders = protect_tags(source_text)
    try:
        translated = translator.translate(safe_value)
    except Exception:
        # Fall back to original if translation fails.
        return value_en

    translated = restore_tags(translated, placeholders)
    translated = clean_spacing(translated)
    return preserve_whitespace(value_en, translated)


def translate_structure(node_en: Any, node_de: Any, translator, stats: Dict[str, int]):
    if isinstance(node_en, dict):
        result = {}
        for key, value in node_en.items():
            counterpart = node_de.get(key) if isinstance(node_de, dict) else None
            result[key] = translate_structure(value, counterpart, translator, stats)
        return result
    if isinstance(node_en, list):
        result_list = []
        length = len(node_en)
        for idx in range(length):
            counterpart = node_de[idx] if isinstance(node_de, list) and idx < len(node_de) else None
            result_list.append(
                translate_structure(node_en[idx], counterpart, translator, stats)
            )
        return result_list
    if isinstance(node_en, str):
        counterpart = node_de if isinstance(node_de, str) else None
        translated = translate_string(node_en, counterpart, translator)
        if translated != node_en:
            stats["translated"] += 1
        return translated
    return node_en


def main():
    translator = get_translator()
    data_en = json.loads(INPUT_FILE.read_text(encoding="utf-8"))
    data_de = json.loads(DE_REFERENCE.read_text(encoding="utf-8"))
    stats = {"translated": 0}
    translated_data = translate_structure(data_en, data_de, translator, stats)
    INPUT_FILE.write_text(json.dumps(translated_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Translation completed. Updated {stats['translated']} strings.")


if __name__ == "__main__":
    main()
