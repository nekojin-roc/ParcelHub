const en = {
  common: {
    actions: {
      close: "Close",
      signOut: "Sign out",
    },
    roles: {
      admin: "Admin",
      user: "User",
    },
    status: {
      checkingAccess: "Checking access...",
      checkingSession: "Checking your session...",
      loading: "Loading...",
    },
  },
  navigation: {
    dashboard: "Dashboard",
    intake: "Intake",
    myPackages: "My Packages",
    packages: "Packages",
    pickup: "Pickup",
    recipients: "Recipients",
    settings: "Settings",
    users: "Users",
  },
  dashboard: {
    title: "Dashboard",
    description: "Overview of packages currently in your care.",
    metrics: {
      waitingForPickup: "Waiting for Pickup",
      pickedUp: "Picked Up",
      totalPackages: "Total Packages",
      recipients: "Recipients",
    },
    awaitingPickup: {
      title: "Packages Awaiting Pickup",
      packageCount_one: "{{count}} package",
      packageCount_other: "{{count}} packages",
    },
    empty: "No packages waiting. All clear!",
  },
} as const;

export default en;
