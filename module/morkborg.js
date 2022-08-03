/**
 * Mork Borg module.
 */
import { MBActor } from "./actor/actor.js";
import { MBActorSheetCharacter } from "./actor/sheet/character-sheet.js";
import { MBActorSheetContainer } from "./actor/sheet/container-sheet.js";
import { MBActorSheetCreature } from "./actor/sheet/creature-sheet.js";
import { MBActorSheetFollower } from "./actor/sheet/follower-sheet.js";
import { MBCombat } from "./combat.js";
import { MB } from "./config.js";
import { configureHandlebars } from "./handlebars.js";
import { MBItem } from "./item/item.js";
import { MBItemSheet } from "./item/sheet/item-sheet.js";
import { rollItemMacro } from "./macros.js";
import { registerHooks } from "./hooks.js";
import { registerSystemSettings } from "./settings.js";

Hooks.once("init", async function () {
  console.log(`Initializing Mork Borg System`);
  game.morkborg = {};
  CONFIG.MB = MB;
  setupConfig();
  registerSystemSettings();
  registerDocumentClasses();
  registerSheets();
  configureHandlebars();
  registerHooks();
});

const setupConfig = () => {
  game.morkborg = {
    rollItemMacro,
  };
  CONFIG.Combat.initiative = {
    formula: "1d6 + @abilities.agility.value",
  };
};

const registerDocumentClasses = () => {
  CONFIG.Actor.documentClass = MBActor;
  CONFIG.Combat.documentClass = MBCombat;
  CONFIG.Item.documentClass = MBItem;
};

const registerSheets = () => {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("morkborg", MBActorSheetCharacter, {
    types: ["character"],
    makeDefault: true,
    label: "MB.SheetClassCharacter",
  });
  Actors.registerSheet("morkborg", MBActorSheetContainer, {
    types: ["container"],
    makeDefault: true,
    label: "MB.SheetClassContainer",
  });
  Actors.registerSheet("morkborg", MBActorSheetCreature, {
    types: ["creature"],
    makeDefault: true,
    label: "MB.SheetClassCreature",
  });
  Actors.registerSheet("morkborg", MBActorSheetFollower, {
    types: ["follower"],
    makeDefault: true,
    label: "MB.SheetClassFollower",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("morkborg", MBItemSheet, { makeDefault: true });
};
