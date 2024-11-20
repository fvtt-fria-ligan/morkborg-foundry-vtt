import { AllowedScvmClassesDialog } from "./settings/allowed-scvm-classes-dialog.js";

const Settings = {
  allowedScvmClasses: "allowedScvmClasses",
  additionalAbilities: "additionalAbilities",
  colorScheme: "colorScheme",
  deleteZeroQuantity: "deleteZeroQuantity",
  hitAutomation: "hitAutomation",
  fontScheme: "fontScheme",
  lastScvmfactorySelection: "lastScvmfactorySelection",
  miseryTrackerAnimations: "miseryTrackerAnimations",
  systemMigrationVersion: "systemMigrationVersion",
  trackAmmo: "trackAmmo",
  trackCarryingCapacity: "trackCarryingCapacity",
};

export function registerSystemSettings() {
  // register non-menu settings in (english) alphabetical order

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

  /** UI Color scheme */
  game.settings.register(CONFIG.MB.systemName, Settings.colorScheme, {
    name: "MB.SettingsColorScheme",
    hint: "MB.SettingsColorSchemeHint",
    scope: "client",
    config: true,
    default: "whiteOnBlackYellow",
    type: String,
    choices: {
      CrysBorgSignature: "MB.SettingsCrysBorgSignature",
	  CrysBorgSignatureAlt: "MB.SettingsCrysBorgSignatureAlt",
	  blackOnYellowWhite: "MB.SettingsBlackOnYellowWhite",
      blackOnWhiteBlack: "MB.SettingsBlackOnWhiteBlack",
      foundryDefault: "MB.SettingsFoundryDefault",
      whiteOnBlackYellow: "MB.SettingsWhiteOnBlackYellow",
      whiteOnBlackPink: "MB.SettingsWhiteOnBlackPink",
      whiteOnPinkWhite: "MB.SettingsWhiteOnPinkWhite",
	  GoblinGonzo: "MB.SettingsGoblinGonzo"
    },
    onChange: () => {
      location.reload();
    },
  });

  /** Whether to keep track of ranged weapon ammo */
  game.settings.register(CONFIG.MB.systemName, Settings.deleteZeroQuantity, {
    name: "MB.SettingsDeleteZeroQuantity",
    hint: "MB.SettingsDeleteZeroQuantityHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });

  /** UI Font scheme */
  game.settings.register(CONFIG.MB.systemName, Settings.fontScheme, {
    name: "MB.SettingsFontScheme",
    hint: "MB.SettingsFontSchemeHint",
    scope: "client",
    config: true,
    default: "crysborg",
    type: String,
    choices: {
      crysborg: "MB.SettingsCBFont",
	  blackletter: "MB.SettingsBlackletter",
      legible: "MB.SettingsLegible"
    },
    onChange: () => {
      location.reload();
    },
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

  /** Whether to show animations on the Misery Tracker */
  game.settings.register(
    CONFIG.MB.systemName,
    Settings.miseryTrackerAnimations,
    {
      name: "MB.SettingsMiseryTrackerAnimations",
      hint: "MB.SettingsMiseryTrackerAnimationsHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    }
  );

  /** Whether to keep track of ranged weapon ammo */
  game.settings.register(CONFIG.MB.systemName, Settings.trackAmmo, {
    name: "MB.SettingsTrackAmmo",
    hint: "MB.SettingsTrackAmmoHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
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

function getSetting(setting) {
  return game.settings.get(CONFIG.MB.systemName, setting);
};

function setSetting(setting, value) {
  return game.settings.set(CONFIG.MB.systemName, setting, value);
};

export function hitAutomation() {
  return getSetting(Settings.hitAutomation);
};

export function trackCarryingCapacity() {
  return getSetting(Settings.trackCarryingCapacity);
};

export function trackAmmo() {
  return getSetting(Settings.trackAmmo);
};

export function isScvmClassAllowed(uuid) {
  const allowedScvmClasses = getSetting(Settings.allowedScvmClasses);
  return typeof allowedScvmClasses[uuid] === "undefined"
    ? true
    : !!allowedScvmClasses[uuid];
};

export function getAllowedScvmClasses() {
  return getSetting(Settings.allowedScvmClasses);
};

export function setAllowedScvmClasses(allowedScvmClasses) {
  return setSetting(Settings.allowedScvmClasses, allowedScvmClasses);
};

export function getLastScvmfactorySelection() {
  return getSetting(Settings.lastScvmfactorySelection);
};

export function setLastScvmfactorySelection(lastScvmfactorySelection) {
  return setSetting(
    Settings.lastScvmfactorySelection,
    lastScvmfactorySelection
  );
};

export function getAdditionalAbilities() {
  return getSetting(Settings.additionalAbilities);
};

export function deleteZeroQuantity() {
  return getSetting(Settings.deleteZeroQuantity);
};

export function miseryTrackerAnimations() {
  return getSetting(Settings.miseryTrackerAnimations);
};
