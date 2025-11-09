#!/usr/bin/env python3
import json
import re

def translate_value(value):
    """Translate German text to English"""
    translations = {
        # Basic buttons and common terms
        "Jetzt Anfragen": "Contact Now",
        "Mehr erfahren": "Learn More",
        "Unsere Produkte": "Our Products",
        "Detaillierte Ansicht": "Detailed View",
        "Abschicken": "Submit",
        
        # Hero section
        "Photovoltaik": "Photovoltaics",
        "Wärmesysteme": "Heat Systems", 
        "Klimatechnik": "Air Conditioning",
        "Smart Home": "Smart Home",
        "Energiemanagement": "Energy Management",
        "Wallbox": "Wallbox",
        
        # Blue boxes
        "Ihr Vorteil:": "Your Advantage:",
        "Ihr maßgeschneidertes Konzept:": "Your Tailored Concept:",
        "Ihre Sicherheit:": "Your Security:",
        "Immer für Sie da:": "Always There for You:",
        
        # Descriptions
        "Wir beraten Sie persönlich durch kompetente Fachkräfte.": "We provide personal consultation through competent specialists.",
        "Produktunabhängige Lösungen mit transparenter stabiler Preisgestaltung": "Product-independent solutions with transparent, stable pricing",
        "Präzise Machbarkeits- & Kosten-Nutzen-Analyse - Wir planen, errichten und betreuen Ihre Anlagen wie unsere eigenen.": "Precise feasibility & cost-benefit analysis - We plan, build and maintain your systems as if they were our own.",
        "Wir sind täglich für Sie im Einsatz und erreichbar.": "We are in action daily and available for you.",
        
        # Rotating text
        "Preisstabil, Unabhängig, Zuverlässig, Kompetent": "Price Stable, Independent, Reliable, Competent",
        
        # Banner
        "Einfach Geld Sparen * Endlich Unabhängig * Leistbar * Transparent * Auf Augenhöhe": "Simply Save Money * Finally Independent * Affordable * Transparent * On Equal Terms",
        
        # Service catalog
        "Moderne Haustechnik <br></br> zum Wohlfühlen": "Modern Home Technology <br></br> for Comfort",
        "Mit unserem Sonnenkraftwerk werden Sie zum unabhängigen Klimahelden.": "With our solar power plant, you become an independent climate hero.",
        "Nutzen Sie unser Wärmesystem und gönnen Sie sich ein warmes Zuhause aus eigener Produktion.": "Use our heating system and treat yourself to a warm home from your own production.",
        "Erleben Sie das angenehme Raumklima, wohl temperiert und zugeschnitten auf Ihre Bedürfnisse.": "Experience the pleasant room climate, well-tempered and tailored to your needs.",
        "Lassen Sie sich verwöhnen, einfach zu bedienen und voll automatisiert.": "Let yourself be pampered, easy to use and fully automated.",
        "Bringen Sie das Verhältnis zwischen Produktion und Verbrauch in Einklang.": "Balance the relationship between production and consumption.",
        "Unäbhangig in das nachste Level - mit uns werden Sie mobil.": "Independent to the next level - become mobile with us.",
        
        # Feature advantages
        "Erste Klasse": "First Class",
        "Ihr Fachmann mit Handschlagqualität und Kundenfokus.": "Your specialist with handshake quality and customer focus.",
        "Kundenbedürfnisse": "Customer Needs",
        "Prozessorientiert": "Process-Oriented",
        "Hohe Standards": "High Standards",
        
        # Stats
        "Sonnenkraftprojekte realisiert": "Solar power projects realized",
        "kW gesamt installierte Leistung": "kW total installed capacity",
        "Jahre in der Branche": "Years in the industry",
        "Wohlfühlanlagen installiert": "Comfort systems installed",
        
        # Feature steps
        "Die 4 Stufen zu Ihrem optimalen System": "The 4 Steps to Your Optimal System",
        "Örtliche Gegebenheit": "Local Conditions",
        "Derzeitige Energietechnik": "Current Energy Technology",
        "Kundenbedürfnisse": "Customer Needs",
        "Anlagenkomposition": "System Composition",
        
        # Testimonials
        "Unsere KundInnen sind überzeugt": "Our Customers are Convinced",
        
        # Products
        "Sparen und unabhängig vom Strompreis sein": "Save and be independent from electricity prices",
        "Intelligent und smart heizen mit Wärmepumpen": "Intelligent and smart heating with heat pumps",
        "Komfortables Wohnen bei zunehmenden Hitzetagen": "Comfortable living during increasing hot days",
        "Lösungen für Komfort, Licht und Energiemanagement": "Solutions for comfort, lighting and energy management",
        "Energiefluss jederzeit im Griff": "Energy flow always under control",
        "Nie wieder tanken": "Never refuel again",
        
        # B2B
        "Marketing": "Marketing",
        "Beratung & Engineering": "Consulting & Engineering",
        "Service": "Service",
        "Umsetzung": "Implementation",
        "Beratung": "Consulting",
        
        # Contact
        "Starten Sie in die Energieunabhängikeit!": "Start your energy independence!",
        "Wir übernehmen Verantwortung.": "We take responsibility.",
        "Innerhalb von 24 Stunden nehmen wir mit Ihnen Kontakt auf.": "We will contact you within 24 hours.",
        
        # Common terms
        "Name": "Name",
        "E-Mail": "Email",
        "Telefon": "Phone",
        "Nachricht": "Message",
        
        # Footer
        "© Synergie.cc - Alle rechte Vorbehalten.": "© Synergie.cc - All rights reserved.",
        
        # Header navigation
        "Produkte": "Products",
        "Über uns": "About Us",
        "Kontakt": "Contact",
        
        # Focus pages
        "Warum jetzt Photovoltaik? Warum wir?": "Why photovoltaics now? Why us?",
        "Warum wir?": "Why us?",
        "Warum das richtige Heizsystem finden?": "Why find the right heating system?",
        "Warum jetzt? Warum wir?": "Why now? Why us?",
    }
    
    # If the value is a string, try to translate it
    if isinstance(value, str):
        # First try exact match
        if value in translations:
            return translations[value]
        
        # Then try partial matches for longer texts
        for german, english in translations.items():
            if german in value:
                value = value.replace(german, english)
        
        return value
    
    return value

def translate_json_recursive(obj):
    """Recursively translate all string values in a JSON object"""
    if isinstance(obj, dict):
        return {key: translate_json_recursive(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [translate_json_recursive(item) for item in obj]
    elif isinstance(obj, str):
        return translate_value(obj)
    else:
        return obj

def main():
    # Read the input file
    input_file = "/Users/erias/Documents/Programming/JavaScript/Synergy-installations/synergy-webservices/packages/frontend/shared/internationalization/messages/en.json"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Translate the data
    translated_data = translate_json_recursive(data)
    
    # Write back to the file
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(translated_data, f, ensure_ascii=False, indent=2)
    
    print("Translation completed!")

if __name__ == "__main__":
    main()