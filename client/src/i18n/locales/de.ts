import type { TranslationResource } from "@/i18n/locales/types";

const de = {
  common: {
    actions: {
      cancel: "Abbrechen",
      close: "Schließen",
      signOut: "Abmelden",
    },
    packageStatus: { received: "Eingegangen", notified: "Benachrichtigt", pickedUp: "Abgeholt" },
    storageBins: {
      uncategorized: {
        label: "Nicht kategorisiert",
        description: "Pakete ohne zugewiesene Lagerbox",
      },
    },
    language: {
      selectorLabel: "Sprache",
      names: {
        en: "Englisch",
        zh: "Chinesisch",
        ja: "Japanisch",
        fr: "Französisch",
        de: "Deutsch",
      },
    },
    roles: {
      admin: "Administrator",
      user: "Benutzer",
    },
    status: {
      checkingAccess: "Zugriff wird geprüft…",
      checkingSession: "Sitzung wird geprüft…",
      loading: "Wird geladen…",
    },
    values: { unknown: "Unbekannt" },
  },
  navigation: {
    dashboard: "Übersicht",
    intake: "Annahme",
    myPackages: "Meine Pakete",
    packages: "Pakete",
    pickup: "Abholung",
    recipients: "Empfänger",
    settings: "Einstellungen",
    users: "Benutzer",
  },
  dashboard: {
    title: "Übersicht",
    description: "Übersicht der Pakete, die sich derzeit in Ihrer Obhut befinden.",
    metrics: {
      waitingForPickup: "Wartet auf Abholung",
      pickedUp: "Abgeholt",
      totalPackages: "Pakete insgesamt",
      recipients: "Empfänger",
    },
    awaitingPickup: {
      title: "Zur Abholung bereite Pakete",
      packageCount_one: "{{count}} Paket",
      packageCount_other: "{{count}} Pakete",
    },
    empty: "Keine Pakete warten auf Abholung. Alles erledigt!",
  },
  auth: {
    signInDescription: "Melden Sie sich an, um Pakete und Abholungen zu verwalten.", signUpDescription: "Administratoren werden vom Host ernannt; Benutzer sehen nur die mit ihnen verknüpften Pakete.",
    signIn: "Anmelden", createAccount: "Konto erstellen", verificationSuccess: "Ihre E-Mail-Adresse wurde bestätigt. Sie können sich jetzt anmelden.",
    verificationError: "Dieser Bestätigungslink ist ungültig oder abgelaufen.", name: "Name", referralCode: "Empfehlungscode",
    referralHelp: "Nach Erstellung des ersten Kontos erforderlich.", email: "E-Mail", password: "Passwort", forgotPassword: "Passwort vergessen?",
    passwordHelp: "Mindestens 8 Zeichen.", unableToContinue: "Fortfahren nicht möglich",
    forgot: {
      title: "Passwort zurücksetzen", description: "Geben Sie die E-Mail-Adresse Ihres Kontos ein. Wir senden Ihnen einen einmalig nutzbaren Link.",
      sent: "Falls für diese Adresse ein Konto existiert, wurde ein Link zum Zurücksetzen gesendet.", send: "Link senden", back: "Zurück zur Anmeldung", error: "Zurücksetzen des Passworts konnte nicht angefordert werden",
    },
    reset: {
      title: "Neues Passwort wählen", updated: "Ihr Passwort wurde aktualisiert.", instructions: "Verwenden Sie mindestens 8 Zeichen für das neue Passwort.",
      complete: "Bestehende Sitzungen wurden abgemeldet. Melden Sie sich mit dem neuen Passwort erneut an.", invalid: "Dieser Link zum Zurücksetzen ist ungültig oder abgelaufen. Fordern Sie einen neuen Link an.",
      invalidShort: "Dieser Link zum Zurücksetzen ist ungültig oder abgelaufen.", mismatch: "Die Passwörter stimmen nicht überein.", newPassword: "Neues Passwort",
      confirmPassword: "Neues Passwort bestätigen", action: "Passwort zurücksetzen", requestNew: "Neuen Link anfordern", error: "Passwort konnte nicht zurückgesetzt werden",
    },
  },
  myPackages: {
    title: "Meine Pakete", description: "Verfolgen Sie die für Sie aufbewahrten Pakete.", recipientDescription: "Paketstatus für {{name}}.",
    loading: "Ihre Pakete werden geladen…", errorTitle: "Pakete konnten nicht geladen werden", noProfileTitle: "Kein Empfängerprofil verknüpft",
    noProfileDescription: "Bitten Sie einen Administrator, dieses Konto mit Ihrem Empfängerprofil zu verknüpfen. Danach erscheinen Ihre Pakete hier.",
    metrics: { waiting: "Wartet auf Abholung", pickedUp: "Abgeholt", total: "Pakete insgesamt" },
    sections: { current: "Aktuelle Pakete", history: "Abholverlauf", empty: "Sie haben keine Pakete, die auf Abholung warten." },
    status: {
      received: { label: "Eingegangen", description: "Ihr Paket ist angekommen und wird für die Abholung vorbereitet." },
      notified: { label: "Abholbereit", description: "Ihr Paket kann abgeholt werden." },
      pickedUp: { label: "Abgeholt", description: "Dieses Paket wurde abgeholt." },
    },
    fields: { description: "Beschreibung", received: "Eingegangen", trackingNumber: "Sendungsnummer", storageLocation: "Lagerort", pickedUp: "Abgeholt" },
    packageFallback: "Paket", photoAlt: "Paket {{barcode}}",
  },
  intake: {
    title: "Paketannahme", description: "Wählen Sie, wie eingehende Pakete erfasst werden sollen.",
    actions: { start: "Annehmen", manual: "Manuelle Annahme", printLabel: "Etikett drucken", nextPackage: "Nächstes Paket", complete: "Annahme abschließen" },
    manual: { title: "Manuelle Annahme", description: "Erfassen Sie ein neu eingegangenes Paket." },
    labelFirst: {
      title: "Annahme mit Etikett", description: "Drucken Sie zuerst ein Barcode-Etikett, kleben Sie es auf das Paket und geben Sie dann die Details ein.",
      packageDetailsTitle: "Paketdetails", printedDescription: "Etikett wurde an den Drucker gesendet. Kleben Sie es auf das Paket und geben Sie dann die Details ein.",
      downloadedDescription: "Etikett wurde als PDF heruntergeladen. Drucken Sie es, kleben Sie es auf das Paket und geben Sie dann die Details ein.", pdf: "PDF",
    },
    success: {
      title: "Paket registriert", logged: "Das Paket für {{recipientName}} wurde erfasst.",
      loggedAndNotified: "Das Paket für {{recipientName}} wurde erfasst und die Person wurde benachrichtigt.", photoAlt: "Paket {{barcode}}",
    },
    form: {
      recipient: { label: "Empfänger *", placeholder: "Empfänger auswählen…" },
      description: { label: "Beschreibung", placeholder: "z. B. Figur, Elektronik…" },
      orderNumber: { label: "Bestellnummer", placeholder: "z. B. ORD-12345" },
      trackingNumber: { label: "Sendungsnummer", placeholder: "z. B. 1Z999AA10123456784" },
      photo: { label: "Paketfoto", helper: "Optional. JPEG, PNG oder WebP bis 5 MB.", selected: "Ausgewählt: {{fileName}}" },
      bin: { label: "Lagerbox", placeholder: "Lagerbox auswählen…" },
      notify: "E-Mail-Benachrichtigung an den Empfänger senden", submit: "Paket registrieren",
    },
    errors: {
      checkRecipients: "Empfänger konnten nicht geprüft werden. Laden Sie die Seite neu und versuchen Sie es erneut.",
      recipientRequiredForIntake: "Fügen Sie vor der Annahme auf der Empfängerseite einen Empfänger hinzu.",
      recipientRequiredForLabel: "Fügen Sie vor dem Etikettdruck auf der Empfängerseite einen Empfänger hinzu.",
      recipientRequiredForPackage: "Fügen Sie vor dem Paket auf der Empfängerseite einen Empfänger hinzu.",
      photoType: "Wählen Sie ein JPEG-, PNG- oder WebP-Bild.", photoSize: "Das Foto darf höchstens 5 MB groß sein.",
      photoUpload: "Das Paket wurde gespeichert, aber das Foto konnte nicht hochgeladen werden.",
    },
    printWindowTitle: "Etikett: {{barcode}}",
  },
  pickup: {
    title: "Paketabholung", description: "Scannen oder geben Sie einen Barcode ein, um ein Paket als abgeholt zu markieren.",
    modes: { manual: "Manuell / Scanner", camera: "Kamera" },
    scanner: {
      barcodeLabel: "Barcode", placeholder: "Barcode scannen oder eingeben…", submitLabel: "Barcode suchen",
      tip: "Tipp: USB-Barcodescanner geben direkt in dieses Feld ein. Einfach scannen!", cameraTip: "Richten Sie die Kamera auf das Barcode-Etikett.",
    },
    confirm: {
      title: "Abholung bestätigen", description: "Prüfen Sie die Details, bevor Sie das Paket als abgeholt markieren.", barcode: "Barcode", recipient: "Empfänger",
      packageDescription: "Beschreibung", bin: "Lagerbox", received: "Eingegangen", collectedBy: "Abgeholt von (optional)",
      collectedByPlaceholder: "Name der abholenden Person", action: "Abholung bestätigen",
    },
    success: { title: "Paket abgeholt", description: "{{barcode}} für {{recipientName}} wurde als abgeholt markiert.", scanNext: "Nächstes scannen" },
    errors: {
      notFound: "Kein Paket mit dem Barcode „{{barcode}}“ gefunden.", alreadyPickedUp: "Dieses Paket wurde bereits am {{date}} abgeholt.",
      lookupFailed: "Suche fehlgeschlagen", camera: "Kein Kamerazugriff. Prüfen Sie die Berechtigungen.",
    },
  },
  packages: {
    title: "Pakete", description: "Alle registrierten Pakete anzeigen und durchsuchen.", searchPlaceholder: "Barcode, Beschreibung oder Bestellung suchen…",
    filters: { active: "Aktiv (wartend)", all: "Alle" }, empty: "Keine Pakete gefunden.", noDescription: "Keine Beschreibung",
    orderNumber: "Bestellung: {{orderNumber}}", bin: "Lagerbox {{label}}",
  },
  recipients: {
    title: "Empfänger", description: "Verwalten Sie Freunde, die Pakete an Ihrer Adresse erhalten.", add: "Empfänger hinzufügen",
    empty: "Noch keine Empfänger. Fügen Sie die erste Person hinzu.", deleteLabel: "{{name}} löschen", confirmDelete: "{{name}} löschen?",
    packageCount_one: "Insgesamt {{count}} Paket", packageCount_other: "Insgesamt {{count}} Pakete",
    dialog: {
      title: "Empfänger hinzufügen", description: "Fügen Sie einen Freund hinzu, der Pakete an Ihrer Adresse erhält.", nameLabel: "Name *", namePlaceholder: "Vollständiger Name",
      emailLabel: "E-Mail *", emailPlaceholder: "email@example.com", phoneLabel: "Telefon", phonePlaceholder: "+81-90-…",
      notesLabel: "Notizen", notesPlaceholder: "z. B. bevorzugt Abholung am Wochenende",
    },
  },
  users: {
    title: "Registrierte Benutzer", description: "Kontozugriff anzeigen und jedes Konto mit einem Empfängerprofil verknüpfen.",
    referrals: {
      title: "Empfehlungscodes", description: "Erstellen Sie einen einmaligen Code für ein neues Konto. Verwendete Codes verschwinden automatisch.",
      generate: "Code erstellen", loading: "Aktive Codes werden geladen…", empty: "Keine aktiven Codes.", active: "Aktiv",
      generatedBy: "Am {{date}} von {{name}} erstellt",
    },
    card: {
      emailVerified: "E-Mail bestätigt", emailNotVerified: "E-Mail nicht bestätigt", registered: "Registriert am {{date}}", linkedRecipient: "Verknüpfter Empfänger",
      notLinked: "Nicht verknüpft", selectorLabel: "Mit {{name}} verknüpfter Empfänger", selectorPlaceholder: "Empfänger auswählen", saveLink: "Verknüpfung speichern",
    },
    errorTitle: "Registrierte Benutzer konnten nicht geladen oder aktualisiert werden", loadingTitle: "Registrierte Benutzer werden geladen",
    loadingDescription: "Konten und Empfängerprofile werden abgerufen…", emptyTitle: "Keine registrierten Benutzer",
    emptyDescription: "Konten erscheinen hier nach Abschluss der Registrierung.",
  },
  settings: {
    title: "Einstellungen", description: "Lagerboxen und Systemeinstellungen konfigurieren.",
    bins: {
      title: "Lagerboxen", description: "Definieren Sie die physischen Orte, an denen Pakete gelagert werden.", deleteLabel: "Lagerbox {{label}} löschen",
      confirmDelete: "Lagerbox „{{label}}“ löschen?", defaultBadge: "Standard", labelPlaceholder: "Bezeichnung (z. B. A-1)",
      descriptionPlaceholder: "Beschreibung (z. B. oberes Regal)", addLabel: "Lagerbox hinzufügen",
    },
    email: {
      title: "E-Mail-Benachrichtigungen", description: "SMTP wird über die .env-Datei des Servers konfiguriert. Bearbeiten Sie server/.env, um Anbieter, Absenderadresse usw. zu ändern.",
      current: "Die aktuelle Konfiguration liegt auf dem Server. Starten Sie ihn nach Änderungen an .env neu.",
    },
  },
} satisfies TranslationResource;

export default de;
