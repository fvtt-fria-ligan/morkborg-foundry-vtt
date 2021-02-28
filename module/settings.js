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

  /** Foreground (text) color */
  game.settings.register("morkborg", "colorScheme", {
    name: "SETTINGS.MBColorScheme",
    hint: "SETTINGS.MBColorSchemeHint",
    scope: "world",
    config: true,
    default: "white",
    type: String,
    choices: {
      "blackOnYellowWhite": "SETTINGS.MBBlackOnYellowWhite",
      "blackOnWhiteBlack": "SETTINGS.MBBlackOnWhiteBlack",
      "whiteOnBlackYellow": "SETTINGS.MBWhiteOnBlackYellow",
      "whiteOnBlackPink": "SETTINGS.MBWhiteOnBlackPink",
      "whiteOnPinkWhite": "SETTINGS.MBWhiteOnPinkWhite",    
    }
  });  
  
};
