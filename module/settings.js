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

  /** UI Color scheme */
  game.settings.register("morkborg", "colorScheme", {
    name: "SETTINGS.MBColorScheme",
    hint: "SETTINGS.MBColorSchemeHint",
    scope: "client",
    config: true,
    default: "whiteOnBlackYellow",
    type: String,
    choices: {
      "blackOnYellowWhite": "SETTINGS.MBBlackOnYellowWhite",
      "blackOnWhiteBlack": "SETTINGS.MBBlackOnWhiteBlack",
      "whiteOnBlackYellow": "SETTINGS.MBWhiteOnBlackYellow",
      "whiteOnBlackPink": "SETTINGS.MBWhiteOnBlackPink",
      "whiteOnPinkWhite": "SETTINGS.MBWhiteOnPinkWhite",    
    }
  });  

  /** UI Font scheme */
  game.settings.register("morkborg", "fontScheme", {
    name: "SETTINGS.MBFontScheme",
    hint: "SETTINGS.MBFontSchemeHint",
    scope: "client",
    config: true,
    default: "blackletter",
    type: String,
    choices: {
      "blackletter": "SETTINGS.MBBlackletter",
      "legible": "SETTINGS.MBLegible",
    }
  });  

};
