/**
 *
 */

import { MBActor } from "./actor.js";
import { MBActorSheet } from "./actor-sheet.js";
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
  Actors.registerSheet("morkborg", MBActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("morkborg", MBItemSheet, { makeDefault: true });
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});