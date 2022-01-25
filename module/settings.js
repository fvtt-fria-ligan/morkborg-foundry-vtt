export const registerSystemSettings = () => {
  /**
   * Track the system version upon which point a migration was last applied.
   */
  game.settings.register("morkborg", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  /** Whether to keep track of carrying capacity */
  game.settings.register("morkborg", "trackCarryingCapacity", {
    name: "MB.SettingsApplyOvercapacityPenalty",
    hint: "MB.SettingsApplyOvercapacityPenaltyHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
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
      "blackOnYellowWhite": "MB.SettingsBlackOnYellowWhite",
      "blackOnWhiteBlack": "MB.SettingsBlackOnWhiteBlack",
      "foundryDefault": "MB.SettingsFoundryDefault",
      "whiteOnBlackYellow": "MB.SettingsWhiteOnBlackYellow",
      "whiteOnBlackPink": "MB.SettingsWhiteOnBlackPink",
      "whiteOnPinkWhite": "MB.SettingsWhiteOnPinkWhite",    
    }
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
      "blackletter": "MB.SettingsBlackletter",
      "legible": "MB.SettingsLegible",
    }
  });  

};

export const trackCarryingCapacity = () => {
  return game.settings.get("morkborg", "trackCarryingCapacity");
}