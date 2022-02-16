import { AllowedScvmClassesDialog } from "./settings/allowed-scvm-classes-dialog.js";

export const registerSystemSettings = () => {
  /**
   * Track the system version upon which point a migration was last applied.
   */
  game.settings.register("morkborg", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  /** Whether to keep track of carrying capacity */
  game.settings.register("morkborg", "trackCarryingCapacity", {
    name: "MB.SettingsApplyOvercapacityPenalty",
    hint: "MB.SettingsApplyOvercapacityPenaltyHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  /** Whether to keep track of ranged weapon ammo */
  game.settings.register("morkborg", "trackAmmo", {
    name: "MB.SettingsTrackAmmo",
    hint: "MB.SettingsTrackAmmoHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  /** UI Color scheme */
  game.settings.register("morkborg", "colorScheme", {
    name: "MB.SettingsColorScheme",
    hint: "MB.SettingsColorSchemeHint",
    scope: "client",
    config: true,
    default: "whiteOnBlackYellow",
    type: String,
    choices: {
      blackOnYellowWhite: "MB.SettingsBlackOnYellowWhite",
      blackOnWhiteBlack: "MB.SettingsBlackOnWhiteBlack",
      foundryDefault: "MB.SettingsFoundryDefault",
      whiteOnBlackYellow: "MB.SettingsWhiteOnBlackYellow",
      whiteOnBlackPink: "MB.SettingsWhiteOnBlackPink",
      whiteOnPinkWhite: "MB.SettingsWhiteOnPinkWhite",
    },
    onChange: () => {
      location.reload();
    },
  });

  /** UI Font scheme */
  game.settings.register("morkborg", "fontScheme", {
    name: "MB.SettingsFontScheme",
    hint: "MB.SettingsFontSchemeHint",
    scope: "client",
    config: true,
    default: "blackletter",
    type: String,
    choices: {
      blackletter: "MB.SettingsBlackletter",
      legible: "MB.SettingsLegible",
    },
    onChange: () => {
      location.reload();
    },
  });

  /** The allowed classes menu */
  game.settings.registerMenu("morkborg", "EditAllowedScvmClassesMenu", {
    name: "MB.EditAllowedScvmClassesMenu",
    hint: "MB.EditAllowedScvmClassesMenuHint",
    label: "MB.EditAllowedScvmClassesMenuButtonLabel",
    icon: "fas fa-cog",
    type: AllowedScvmClassesDialog,
    restricted: true,
  });

  /** The allowed classes menu for scvmfactory */
  game.settings.register("morkborg", "allowedScvmClasses", {
    name: "",
    default: {},
    type: Object,
    scope: "world",
    config: false,
  });

  /** The client scvmfactory selected classes  */
  game.settings.register("morkborg", "lastScvmfactorySelection", {
    name: "",
    default: [],
    type: Array,
    scope: "client",
    config: false,
  });
};

export const trackCarryingCapacity = () => {
  return game.settings.get("morkborg", "trackCarryingCapacity");
};

export const trackAmmo = () => {
  return game.settings.get("morkborg", "trackAmmo");
};

export const isScvmClassAllowed = (classPack) => {
  const allowedScvmClasses = game.settings.get(
    "morkborg",
    "allowedScvmClasses"
  );
  return typeof allowedScvmClasses[classPack] === "undefined"
    ? true
    : !!allowedScvmClasses[classPack];
};

export const setAllowedScvmClasses = (allowedScvmClasses) => {
  return game.settings.set(
    "morkborg",
    "allowedScvmClasses",
    allowedScvmClasses
  );
};

export const getLastScvmfactorySelection = () => {
  return game.settings.get("morkborg", "lastScvmfactorySelection");
};

export const setLastScvmfactorySelection = (lastScvmfactorySelection) => {
  return game.settings.set(
    "morkborg",
    "lastScvmfactorySelection",
    lastScvmfactorySelection
  );
};
