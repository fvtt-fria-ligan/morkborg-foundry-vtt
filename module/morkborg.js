/**
 * Mork Borg module.
 */
import { MBActor } from "./actor.js";
import { MBActorSheetCharacter } from "./character-sheet.js";
import { MBActorSheetCreature } from "./creature-sheet.js";
import { MBActorSheetOutcast } from "./outcast-sheet.js";
import { _getInitiativeFormula } from "./combat.js";
import { MB } from "./config.js";
import { MBItem } from "./item.js";
import { MBItemSheet } from "./item-sheet.js";
import { createMorkBorgMacro } from "./macro.js";

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

  CONFIG.Combat.initiative = {
    // formula: "1d6",
    // decimals: 2
    // TODO: not sure how best to deal with NPCs not having abilities. Maybe giving them some, 
    // or do the _getInitiativeFormula patch to check for ability first.
    formula: "1d6 + @abilities.agility.score",
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
  Actors.registerSheet("morkborg", MBActorSheetOutcast, {
    types: ["outcast"],
    makeDefault: true,
    label: "MB.SheetClassOutcast"
  });  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("morkborg", MBItemSheet, { makeDefault: true });
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