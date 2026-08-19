import type { TranslationResource } from "@/i18n/locales/types";

const fr = {
  common: {
    actions: {
      cancel: "Annuler",
      close: "Fermer",
      signOut: "Se déconnecter",
    },
    packageStatus: { received: "Reçu", notified: "Notifié", pickedUp: "Retiré" },
    storageBins: {
      uncategorized: {
        label: "Non classé",
        description: "Colis sans bac de stockage attribué",
      },
    },
    language: {
      selectorLabel: "Langue",
      names: {
        en: "Anglais",
        zh: "Chinois",
        ja: "Japonais",
        fr: "Français",
        de: "Allemand",
      },
    },
    roles: {
      admin: "Administrateur",
      user: "Utilisateur",
    },
    status: {
      checkingAccess: "Vérification des accès…",
      checkingSession: "Vérification de votre session…",
      loading: "Chargement…",
    },
    values: { unknown: "Inconnu" },
  },
  navigation: {
    dashboard: "Tableau de bord",
    intake: "Réception",
    myPackages: "Mes colis",
    packages: "Colis",
    pickup: "Retrait",
    recipients: "Destinataires",
    settings: "Paramètres",
    users: "Utilisateurs",
  },
  dashboard: {
    title: "Tableau de bord",
    description: "Vue d’ensemble des colis actuellement sous votre garde.",
    metrics: {
      waitingForPickup: "En attente de retrait",
      pickedUp: "Retirés",
      totalPackages: "Total des colis",
      recipients: "Destinataires",
    },
    awaitingPickup: {
      title: "Colis en attente de retrait",
      packageCount_one: "{{count}} colis",
      packageCount_other: "{{count}} colis",
    },
    empty: "Aucun colis en attente. Tout est en ordre !",
  },
  auth: {
    signInDescription: "Connectez-vous pour gérer les colis et les retraits.", signUpDescription: "Les administrateurs sont promus par l’hôte ; les utilisateurs ne voient que les colis qui leur sont associés.",
    signIn: "Se connecter", createAccount: "Créer un compte", verificationSuccess: "Votre adresse e-mail a été vérifiée. Vous pouvez vous connecter normalement.",
    verificationError: "Ce lien de vérification est invalide ou a expiré.", name: "Nom", referralCode: "Code de parrainage",
    referralHelp: "Obligatoire après la création du premier compte.", email: "E-mail", password: "Mot de passe", forgotPassword: "Mot de passe oublié ?",
    passwordHelp: "Au moins 8 caractères.", unableToContinue: "Impossible de continuer",
    forgot: {
      title: "Réinitialiser votre mot de passe", description: "Saisissez l’adresse e-mail du compte pour recevoir un lien de réinitialisation à usage unique.",
      sent: "Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.", send: "Envoyer le lien", back: "Retour à la connexion", error: "Impossible de demander la réinitialisation du mot de passe",
    },
    reset: {
      title: "Choisir un nouveau mot de passe", updated: "Votre mot de passe a été mis à jour.", instructions: "Utilisez au moins 8 caractères pour votre nouveau mot de passe.",
      complete: "Les sessions existantes ont été déconnectées. Reconnectez-vous avec votre nouveau mot de passe.", invalid: "Ce lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien pour continuer.",
      invalidShort: "Ce lien de réinitialisation est invalide ou a expiré.", mismatch: "Les mots de passe ne correspondent pas.", newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le nouveau mot de passe", action: "Réinitialiser le mot de passe", requestNew: "Demander un nouveau lien", error: "Impossible de réinitialiser votre mot de passe",
    },
  },
  myPackages: {
    title: "Mes colis", description: "Suivez les colis conservés pour vous.", recipientDescription: "État des colis de {{name}}.",
    loading: "Chargement de vos colis…", errorTitle: "Impossible de charger les colis", noProfileTitle: "Aucun profil de destinataire associé",
    noProfileDescription: "Demandez à un administrateur d’associer ce compte à votre profil de destinataire. Vos colis apparaîtront ici une fois l’association effectuée.",
    metrics: { waiting: "En attente de retrait", pickedUp: "Retirés", total: "Total des colis" },
    sections: { current: "Colis actuels", history: "Historique des retraits", empty: "Vous n’avez aucun colis en attente de retrait." },
    status: {
      received: { label: "Reçu", description: "Votre colis est arrivé et sa mise à disposition est en cours." },
      notified: { label: "Prêt à retirer", description: "Votre colis est prêt à être retiré." },
      pickedUp: { label: "Retiré", description: "Ce colis a été retiré." },
    },
    fields: { description: "Description", received: "Reçu", trackingNumber: "Numéro de suivi", storageLocation: "Emplacement de stockage", pickedUp: "Retiré" },
    packageFallback: "Colis", photoAlt: "Colis {{barcode}}",
  },
  intake: {
    title: "Réception des colis", description: "Choisissez comment enregistrer les colis entrants.",
    actions: { start: "Réception", manual: "Réception manuelle", printLabel: "Imprimer l’étiquette", nextPackage: "Colis suivant", complete: "Terminer la réception" },
    manual: { title: "Réception manuelle", description: "Enregistrez un nouveau colis entrant." },
    labelFirst: {
      title: "Réception avec étiquette", description: "Imprimez d’abord une étiquette à code-barres, collez-la sur le colis, puis renseignez les détails.",
      packageDetailsTitle: "Détails du colis", printedDescription: "Étiquette envoyée à l’imprimante. Collez-la sur le colis, puis renseignez les détails.",
      downloadedDescription: "Étiquette téléchargée au format PDF. Imprimez-la, collez-la sur le colis, puis renseignez les détails.", pdf: "PDF",
    },
    success: {
      title: "Colis enregistré", logged: "Le colis de {{recipientName}} a été enregistré.",
      loggedAndNotified: "Le colis de {{recipientName}} a été enregistré et le destinataire a été notifié.", photoAlt: "Colis {{barcode}}",
    },
    form: {
      recipient: { label: "Destinataire *", placeholder: "Sélectionner un destinataire…" },
      description: { label: "Description", placeholder: "ex. figurine, appareils électroniques…" },
      orderNumber: { label: "Numéro de commande", placeholder: "ex. ORD-12345" },
      trackingNumber: { label: "Numéro de suivi du transporteur", placeholder: "ex. 1Z999AA10123456784" },
      photo: { label: "Photo du colis", helper: "Facultatif. JPEG, PNG ou WebP jusqu’à 5 Mo.", selected: "Sélectionné : {{fileName}}" },
      bin: { label: "Bac de stockage", placeholder: "Sélectionner un bac…" },
      notify: "Envoyer une notification par e-mail au destinataire", submit: "Enregistrer le colis",
    },
    errors: {
      checkRecipients: "Impossible de vérifier les destinataires. Actualisez la page et réessayez.",
      recipientRequiredForIntake: "Ajoutez un destinataire dans la page Destinataires avant de commencer la réception.",
      recipientRequiredForLabel: "Ajoutez un destinataire dans la page Destinataires avant d’imprimer une étiquette.",
      recipientRequiredForPackage: "Ajoutez un destinataire dans la page Destinataires avant d’ajouter un colis.",
      photoType: "Choisissez une image JPEG, PNG ou WebP.", photoSize: "La photo doit faire 5 Mo maximum.",
      photoUpload: "Le colis a été enregistré, mais sa photo n’a pas pu être téléversée.",
    },
    printWindowTitle: "Étiquette : {{barcode}}",
  },
  pickup: {
    title: "Retrait d’un colis", description: "Scannez ou saisissez un code-barres pour marquer un colis comme retiré.",
    modes: { manual: "Manuel / Scanner", camera: "Caméra" },
    scanner: {
      barcodeLabel: "Code-barres", placeholder: "Scanner ou saisir le code-barres…", submitLabel: "Rechercher le code-barres",
      tip: "Astuce : les scanners USB saisissent directement dans ce champ. Il suffit de scanner !", cameraTip: "Pointez la caméra vers l’étiquette à code-barres.",
    },
    confirm: {
      title: "Confirmer le retrait", description: "Vérifiez les détails avant de marquer le colis comme retiré.", barcode: "Code-barres", recipient: "Destinataire",
      packageDescription: "Description", bin: "Bac", received: "Reçu le", collectedBy: "Retiré par (facultatif)",
      collectedByPlaceholder: "Nom de la personne qui retire le colis", action: "Confirmer le retrait",
    },
    success: { title: "Colis retiré", description: "Le colis {{barcode}} de {{recipientName}} a été marqué comme retiré.", scanNext: "Scanner le suivant" },
    errors: {
      notFound: "Aucun colis trouvé avec le code-barres « {{barcode}} ».", alreadyPickedUp: "Ce colis a déjà été retiré le {{date}}.",
      lookupFailed: "Échec de la recherche", camera: "Impossible d’accéder à la caméra. Vérifiez les autorisations.",
    },
  },
  packages: {
    title: "Colis", description: "Consultez et recherchez tous les colis enregistrés.", searchPlaceholder: "Rechercher un code-barres, une description, une commande…",
    filters: { active: "Actifs (en attente)", all: "Tous" }, empty: "Aucun colis trouvé.", noDescription: "Aucune description",
    orderNumber: "Commande : {{orderNumber}}", bin: "Bac {{label}}",
  },
  recipients: {
    title: "Destinataires", description: "Gérez les amis qui reçoivent des colis à votre adresse.", add: "Ajouter un destinataire",
    empty: "Aucun destinataire. Ajoutez votre premier ami pour commencer.", deleteLabel: "Supprimer {{name}}", confirmDelete: "Supprimer {{name}} ?",
    packageCount_one: "{{count}} colis au total", packageCount_other: "{{count}} colis au total",
    dialog: {
      title: "Ajouter un destinataire", description: "Ajoutez un ami qui reçoit des colis à votre adresse.", nameLabel: "Nom *", namePlaceholder: "Nom complet",
      emailLabel: "E-mail *", emailPlaceholder: "email@example.com", phoneLabel: "Téléphone", phonePlaceholder: "+81-90-…",
      notesLabel: "Notes", notesPlaceholder: "ex. préfère un retrait le week-end",
    },
  },
  users: {
    title: "Utilisateurs inscrits", description: "Consultez les accès et associez chaque compte à un profil de destinataire.",
    referrals: {
      title: "Codes de parrainage", description: "Générez un code à usage unique pour un nouveau compte. Les codes utilisés disparaissent automatiquement.",
      generate: "Générer un code", loading: "Chargement des codes actifs…", empty: "Aucun code actif.", active: "Actif",
      generatedBy: "Généré le {{date}} par {{name}}",
    },
    card: {
      emailVerified: "E-mail vérifié", emailNotVerified: "E-mail non vérifié", registered: "Inscrit le {{date}}", linkedRecipient: "Destinataire associé",
      notLinked: "Non associé", selectorLabel: "Destinataire associé à {{name}}", selectorPlaceholder: "Sélectionner un destinataire", saveLink: "Enregistrer l’association",
    },
    errorTitle: "Impossible de charger ou modifier les utilisateurs", loadingTitle: "Chargement des utilisateurs",
    loadingDescription: "Récupération des comptes et profils de destinataire…", emptyTitle: "Aucun utilisateur inscrit",
    emptyDescription: "Les comptes apparaîtront ici après leur inscription.",
  },
  settings: {
    title: "Paramètres", description: "Configurez les bacs de stockage et les préférences du système.",
    bins: {
      title: "Bacs de stockage", description: "Définissez les emplacements physiques où sont stockés les colis.", deleteLabel: "Supprimer le bac {{label}}",
      confirmDelete: "Supprimer le bac « {{label}} » ?", defaultBadge: "Par défaut", labelPlaceholder: "Étiquette (ex. A-1)",
      descriptionPlaceholder: "Description (ex. étagère du haut)", addLabel: "Ajouter un bac de stockage",
    },
    email: {
      title: "Notifications par e-mail", description: "Les paramètres SMTP sont configurés dans le fichier .env du serveur. Modifiez server/.env pour changer de fournisseur, d’adresse d’expédition, etc.",
      current: "La configuration actuelle se trouve côté serveur. Redémarrez le serveur après toute modification du fichier .env.",
    },
  },
} satisfies TranslationResource;

export default fr;
