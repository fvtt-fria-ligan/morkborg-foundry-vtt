/**
 * Mork Borg module.
 */
import { MBActor } from "./actor/actor.js";
import { MBCharacterSheet } from "./actor/sheet/character-sheet.js";
import { MBContainerSheet } from "./actor/sheet/container-sheet.js";
import { MBCreatureSheet } from "./actor/sheet/creature-sheet.js";
import { MBFollowerSheet } from "./actor/sheet/follower-sheet.js";
import { registerCombat } from "./combat.js";
import { MB } from "./config.js";
import { registerFonts } from "./fonts.js";
import { configureHandlebars } from "./handlebars.js";
import { registerHooks } from "./hooks.js";
import { MBItem } from "./item/item.js";
import { MBItemSheet } from "./item/sheet/item-sheet.js";
import { MBJournalSheet } from "./journal/journal-sheet.js";
import { registerMacros } from "./macros.js";
import { registerSystemSettings } from "./settings.js";

Hooks.once("init", async function () {
  console.log("Initializing MÖRK BORG system");
  game.morkborg = {};
  CONFIG.MB = MB;
  registerSystemSettings();
  registerDocumentClasses();
  registerSheets();
  configureHandlebars();
  registerCombat();
  registerMacros();
  registerHooks();
  registerFonts();
});

const registerDocumentClasses = () => {
  CONFIG.Actor.documentClass = MBActor;
  CONFIG.Item.documentClass = MBItem;
};

const registerSheets = () => {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(MB.systemName, MBCharacterSheet, {
    types: [MB.actorTypes.character],
    makeDefault: true,
    label: "MB.SheetClassCharacter",
  });
  Actors.registerSheet(MB.systemName, MBContainerSheet, {
    types: [MB.actorTypes.container],
    makeDefault: true,
    label: "MB.SheetClassContainer",
  });
  Actors.registerSheet(MB.systemName, MBCreatureSheet, {
    types: [MB.actorTypes.creature],
    makeDefault: true,
    label: "MB.SheetClassCreature",
  });
  Actors.registerSheet(MB.systemName, MBFollowerSheet, {
    types: [MB.actorTypes.follower],
    makeDefault: true,
    label: "MB.SheetClassFollower",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(MB.systemName, MBItemSheet, { makeDefault: true });

  Journal.registerSheet?.(MB.systemName, MBJournalSheet, {
    types: ["base"],
    makeDefault: true,
    label: "MB.JournalSheet",
  });
};
