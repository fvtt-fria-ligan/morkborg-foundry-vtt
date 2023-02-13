import { AllowedScvmClassesDialog } from "./settings/allowed-scvm-classes-dialog.js";

const Settings = {
  allowedScvmClasses: "allowedScvmClasses",
  additionalAbilities: "additionalAbilities",
  colorScheme: "colorScheme",
  hitAutomation: "hitAutomation",
  fontScheme: "fontScheme",
  lastScvmfactorySelection: "lastScvmfactorySelection",
  systemMigrationVersion: "systemMigrationVersion",
  trackAmmo: "trackAmmo",
  trackCarryingCapacity: "trackCarryingCapacity",
};

export const registerSystemSettings = () => {
  /**
   * Track the system version upon which point a migration was last applied.
   */
  game.settings.register(
    CONFIG.MB.systemName,
    Settings.systemMigrationVersion,
    {
      name: "System Migration Version",
      scope: "world",
      config: false,
      type: String,
      default: "",
    }
  );

  /** Whether to keep track of carrying capacity */
  game.settings.register(CONFIG.MB.systemName, Settings.trackCarryingCapacity, {
    name: "MB.SettingsApplyOvercapacityPenalty",
    hint: "MB.SettingsApplyOvercapacityPenaltyHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  /** Whether to enable combat automation. E.g., automatically determining hit/miss and damage. */
  game.settings.register(CONFIG.MB.systemName, Settings.hitAutomation, {
    name: "MB.SettingsHitAutomation",
    hint: "MB.SettingsHitAutomationHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  /** Whether to keep track of ranged weapon ammo */
  game.settings.register(CONFIG.MB.systemName, Settings.trackAmmo, {
    name: "MB.SettingsTrackAmmo",
    hint: "MB.SettingsTrackAmmoHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  /** UI Color scheme */
  game.settings.register(CONFIG.MB.systemName, Settings.colorScheme, {
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
  game.settings.register(CONFIG.MB.systemName, Settings.fontScheme, {
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

  /** Additional Abilities */
  game.settings.register(CONFIG.MB.systemName, Settings.additionalAbilities, {
    name: "MB.AdditionalAbilities",
    hint: "MB.AdditionalAbilitiesHint",
    default: "",
    config: true,
    type: String,
    requiresReload: true,
    restricted: true,
  });

  /** The allowed classes menu */
  game.settings.registerMenu(
    CONFIG.MB.systemName,
    "EditAllowedScvmClassesMenu",
    {
      name: "MB.EditAllowedScvmClassesMenu",
      hint: "MB.EditAllowedScvmClassesMenuHint",
      label: "MB.EditAllowedScvmClassesMenuButtonLabel",
      icon: "fas fa-cog",
      type: AllowedScvmClassesDialog,
      restricted: true,
    }
  );

  /** The allowed classes menu for scvmfactory */
  game.settings.register(CONFIG.MB.systemName, Settings.allowedScvmClasses, {
    name: "",
    default: {},
    type: Object,
    scope: "world",
    config: false,
  });

  /** The client scvmfactory selected classes  */
  game.settings.register(
    CONFIG.MB.systemName,
    Settings.lastScvmfactorySelection,
    {
      name: "",
      default: [],
      type: Array,
      scope: "client",
      config: false,
    }
  );
};

const getSetting = (setting) => {
  return game.settings.get(CONFIG.MB.systemName, setting);
};

const setSetting = (setting, value) => {
  return game.settings.set(CONFIG.MB.systemName, setting, value);
};

export const hitAutomation = () => {
  return getSetting(Settings.hitAutomation);
};

export const trackCarryingCapacity = () => {
  return getSetting(Settings.trackCarryingCapacity);
};

export const trackAmmo = () => {
  return getSetting(Settings.trackAmmo);
};

export const isScvmClassAllowed = (classPack) => {
  const allowedScvmClasses = getSetting(Settings.allowedScvmClasses);
  return typeof allowedScvmClasses[classPack] === "undefined"
    ? true
    : !!allowedScvmClasses[classPack];
};

export const setAllowedScvmClasses = (allowedScvmClasses) => {
  return setSetting(Settings.allowedScvmClasses, allowedScvmClasses);
};

export const getLastScvmfactorySelection = () => {
  return getSetting(Settings.lastScvmfactorySelection);
};

export const setLastScvmfactorySelection = (lastScvmfactorySelection) => {
  return setSetting(
    Settings.lastScvmfactorySelection,
    lastScvmfactorySelection
  );
};

export const getAdditionalAbilities = () => {
  return getSetting(Settings.additionalAbilities);
};
