/**
 * Mork Borg module.
 */
import { MBActor } from "./actor.js";
import { MBActorSheetCharacter } from "./character-sheet.js";
import { MBActorSheetCreature } from "./creature-sheet.js";
import { MBActorSheetFollower } from "./follower-sheet.js";
//import { _getInitiativeFormula } from "./combat.js";
import { MB } from "./config.js";
import { MBItem } from "./item.js";
import { MBItemSheet } from "./item-sheet.js";
import { createMorkBorgMacro } from "./macro.js";
import { migrateWorld } from "./migration.js";
import { registerSystemSettings } from "./settings.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function() {
  console.log(`Initializing Mork Borg System`);

  // Patch Core Functions
  // TODO: decide if we need to patch initiative
  // CONFIG.Combat.initiative.formula = "1d20 + @attributes.init.mod + @attributes.init.prof + @attributes.init.bonus";
  // Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

  // Register System Settings
  registerSystemSettings();

  CONFIG.Combat.initiative = {
    // formula: "1d6",
    // decimals: 2
    // TODO: not sure how best to deal with NPCs not having abilities. Maybe giving them some, 
    // or do the _getInitiativeFormula patch to check for ability first.
    formula: "1d6 + @abilities.agility.value",
  };

  game.morkborg = {
    config: MB,
    createMorkBorgMacro,
    MBActor,
    MBItem
  };

  // Define custom Entity classes
  CONFIG.Actor.entityClass = MBActor;  
  CONFIG.Item.entityClass = MBItem;
  CONFIG.MB = MB;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("morkborg", MBActorSheetCharacter, {
    types: ["character"],
    makeDefault: true,
    label: "MB.SheetClassCharacter"
  });
  Actors.registerSheet("morkborg", MBActorSheetCreature, {
    types: ["creature"],
    makeDefault: true,
    label: "MB.SheetClassCreature"
  });
  Actors.registerSheet("morkborg", MBActorSheetFollower, {
    types: ["follower"],
    makeDefault: true,
    label: "MB.SheetClassFollower"
  });  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("morkborg", MBItemSheet, { makeDefault: true });
});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", () => {
  maybeMigrateWorld();
  applyFontsAndColors();
});

const maybeMigrateWorld = () => {
  // Determine whether a system migration is required and feasible
  if (!game.user.isGM) {
    return;
  }
  const currentVersion = game.settings.get("morkborg", "systemMigrationVersion");
  console.log(`Current version: ${currentVersion}`);
  const NEEDS_MIGRATION_VERSION = "0.2.0";
  // const COMPATIBLE_MIGRATION_VERSION = 0.80;
  const needsMigration = currentVersion === null || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
  if (!needsMigration) {
    console.log(`Version doesn't need migration.`);
    return;
  }
  // Perform the migration
  // if ( currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion) ) {
  //   const warning = `Your system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`;
  //   ui.notifications.error(warning, {permanent: true});
  // }
  console.log(`Migrating!`);
  migrateWorld();
}

const applyFontsAndColors = () => {
  const colorSchemeSetting = game.settings.get("morkborg", "colorScheme");
  if (!colorSchemeSetting) {
    colorSchemeSetting = "WhiteOnBlackYellow";  // default
    game.settings.set("morkborg", "colorScheme", colorSchemeSetting);
  }
  let colorScheme = CONFIG.MB.colorSchemes[colorSchemeSetting];
  console.log("******************");
  console.log(colorSchemeSetting);
  console.log(colorScheme);
  const r = document.querySelector(":root");
  // r.style.setProperty('--aliengreen', game.settings.get('', 'fontColour'));
  // r.style.setProperty('--alienfont', game.settings.get('alienrpg', 'fontStyle'));
  r.style.setProperty('--background-color', colorScheme.background);
  r.style.setProperty('--foreground-color', colorScheme.foreground);
  r.style.setProperty('--highlight-background-color', colorScheme.highlightBackground);
  r.style.setProperty('--highlight-foreground-color', colorScheme.highlightForeground);
};

Hooks.on('dropActorSheetData', async (actor, sheet, data) => {
  if (data.type === "Item" && data.pack === "morkborg.classes") {
    // Dropping a new class, so nuke any pre-existing class item(s),
    // to enforce that a character only has one class item at a time.
    const classes = actor.items.filter(i => i.data.type === "class");
    const deletions = classes.map(i => i._id);
    const deleted = await actor.deleteEmbeddedEntity("OwnedItem", deletions);
  }
});

Hooks.on('createActor', async (actor, options, userId) => {
  // give Characters a default class
  if (actor.data.type === "character" && game.packs) {
    const pack = game.packs.get("morkborg.classes");
    let index = await pack.getIndex();
    let entry = index.find(e => e.name === "Adventurer");
    let entity = await pack.getEntity(entry._id);
    actor.createEmbeddedEntity("OwnedItem", duplicate(entity.data));
  }
});

// Handlebars helpers
// TODO: registering a helper named "eq" breaks filepicker
Handlebars.registerHelper('ifEq', function(arg1, arg2, options) {
  // TODO: verify whether we want == or === for this equality check
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifGe', function(arg1, arg2, options) {
  return (arg1 >= arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifGt', function(arg1, arg2, options) {
  return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifLe', function(arg1, arg2, options) {
  return (arg1 <= arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifLt', function(arg1, arg2, options) {
  return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifNe', function(arg1, arg2, options) {
  // TODO: verify whether we want == or === for this equality check
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});