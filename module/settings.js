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

  /** Background color */
  game.settings.register("morkborg", "backgroundColor", {
    name: "SETTINGS.MBBackgroundColor",
    hint: "SETTINGS.MBBackgroundColorHint",
    scope: "world",
    config: true,
    default: "black",
    type: String,
    choices: {
        "black": "SETTINGS.MBBlack",
        "pink": "SETTINGS.MBPink",
        "white": "SETTINGS.MBWhite",
        "yellow": "SETTINGS.MBYellow"
    }
  });  

  /** Foreground (text) color */
  game.settings.register("morkborg", "foregroundColor", {
    name: "SETTINGS.MBForegroundColor",
    hint: "SETTINGS.MBForegroundColorHint",
    scope: "world",
    config: true,
    default: "white",
    type: String,
    choices: {
        "black": "SETTINGS.MBBlack",
        "gray": "SETTINGS.MBGray",
        "white": "SETTINGS.MBWhite"
    }
  });  

  /** Highlight color */
  game.settings.register("morkborg", "highlightColor", {
    name: "SETTINGS.MBHighlightColor",
    hint: "SETTINGS.MBHighlightColorHint",
    scope: "world",
    config: true,
    default: "yellow",
    type: String,
    choices: {
        "black": "SETTINGS.MBBlack",
        "pink": "SETTINGS.MBPink",
        "white": "SETTINGS.MBWhite",
        "yellow": "SETTINGS.MBYellow"
    }
  });   
};
