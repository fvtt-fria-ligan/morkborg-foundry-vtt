/**
 * Mork Borg module.
 */
import { MBActor } from "./actor/actor.js";
import { MBCharacterSheet } from "./actor/sheet/character-sheet.js";
import { MBContainerSheet } from "./actor/sheet/container-sheet.js";
import { MBCreatureSheet } from "./actor/sheet/creature-sheet.js";
import { MBFollowerSheet } from "./actor/sheet/follower-sheet.js";
import { MBMiseryTrackerSheet } from "./actor/sheet/misery-tracker-sheet.js";
import { registerCombat } from "./combat.js";
import { MB } from "./config.js";
import { enrichTextEditors } from "./enricher.js";
import { registerFonts } from "./fonts.js";
import { configureHandlebars } from "./handlebars.js";
import { registerHooks } from "./hooks.js";
import { MBItem } from "./item/item.js";
import { MBItemSheet } from "./item/sheet/item-sheet.js";
import { MBJournalSheet } from "./journal/journal-sheet.js";
import { registerMacros } from "./macros.js";
import { registerSystemSettings } from "./settings.js";
import { dumpUuids } from "./exporter.js";
import { drawFromTable } from "./packutils.js";

Hooks.once("init", async function () {
  console.log("Initializing MÖRK BORG system");
  game.morkborg = {};
  CONFIG.MB = MB;
  registerSystemSettings();
  registerDocumentClasses();
  registerSheets();
  enrichTextEditors();
  configureHandlebars();
  registerCombat();
  registerMacros();
  registerHooks();
  registerFonts();

  game.exporter = {
    // exportSubfoldersToCompendium,
    // locationPadRollTableIndexHtml
    dumpUuids,
    drawFromTable,
  };
});

function registerDocumentClasses() {
  CONFIG.Actor.documentClass = MBActor;
  CONFIG.Item.documentClass = MBItem;
}

function registerSheets() {
  foundry.documents.collections.Actors.unregisterSheet(
    "core",
    foundry.appv1.sheets.ActorSheet
  );
  foundry.documents.collections.Actors.registerSheet(
    MB.systemName,
    MBCharacterSheet,
    {
      types: [MB.actorTypes.character],
      makeDefault: true,
      label: "MB.SheetClassCharacter",
    }
  );
  foundry.documents.collections.Actors.registerSheet(
    MB.systemName,
    MBContainerSheet,
    {
      types: [MB.actorTypes.container],
      makeDefault: true,
      label: "MB.SheetClassContainer",
    }
  );
  foundry.documents.collections.Actors.registerSheet(
    MB.systemName,
    MBCreatureSheet,
    {
      types: [MB.actorTypes.creature],
      makeDefault: true,
      label: "MB.SheetClassCreature",
    }
  );
  foundry.documents.collections.Actors.registerSheet(
    MB.systemName,
    MBFollowerSheet,
    {
      types: [MB.actorTypes.follower],
      makeDefault: true,
      label: "MB.SheetClassFollower",
    }
  );
  foundry.documents.collections.Actors.registerSheet(
    MB.systemName,
    MBMiseryTrackerSheet,
    {
      types: [MB.actorTypes.miseryTracker],
      makeDefault: true,
      label: "MB.SheetClassMiseryTracker",
    }
  );
  foundry.documents.collections.Items.unregisterSheet(
    "core",
    foundry.appv1.sheets.ItemSheet
  );
  foundry.documents.collections.Items.registerSheet(
    MB.systemName,
    MBItemSheet,
    { makeDefault: true }
  );

  foundry.documents.collections.Journal.registerSheet?.(
    MB.systemName,
    MBJournalSheet,
    {
      types: ["base"],
      makeDefault: true,
      label: "MB.JournalSheet",
    }
  );
}
