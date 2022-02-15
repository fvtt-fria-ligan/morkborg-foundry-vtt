/**
 * Mork Borg module.
 */
import { MBActor } from "./actor/actor.js";
import { MBActorSheetCharacter } from "./actor/sheet/character-sheet.js";
import { MBActorSheetContainer } from "./actor/sheet/container-sheet.js";
import { MBActorSheetCreature } from "./actor/sheet/creature-sheet.js";
import { MBActorSheetFollower } from "./actor/sheet/follower-sheet.js";
import { MBCombat, rollPartyInitiative } from "./combat.js";
import { MB } from "./config.js";
import { MBItem } from "./item/item.js";
import { MBItemSheet } from "./item/sheet/item-sheet.js";
import { createMorkBorgMacro, rollItemMacro } from "./macros.js";
import { migrateWorld } from "./migration.js";
import ScvmDialog from "./scvm/scvm-dialog.js";
import { registerSystemSettings } from "./settings.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function () {
  console.log(`Initializing Mork Borg System`);

  // Patch Core Functions
  // TODO: decide if we need to patch initiative
  // CONFIG.Combat.initiative.formula = "1d20 + @attributes.init.mod + @attributes.init.prof + @attributes.init.bonus";
  // Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

  // Register System Settings
  registerSystemSettings();

  game.morkborg = {
    config: MB,
    createMorkBorgMacro,
    MBActor,
    MBItem,
    rollItemMacro,
  };

  configureHandlebar();

  // Define custom Entity classes
  CONFIG.Actor.documentClass = MBActor;
  CONFIG.Combat.documentClass = MBCombat;
  // TODO: push this into MBCombat?
  CONFIG.Combat.initiative = {
    formula: "1d6 + @abilities.agility.value",
  };
  CONFIG.Item.documentClass = MBItem;
  CONFIG.MB = MB;

  // Register sheet application classes
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
});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", () => {
  maybeMigrateWorld();
  applyFontsAndColors();
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createMorkBorgMacro(data, slot));
  Hooks.call("morkborgReady");
});

const maybeMigrateWorld = () => {
  // Determine whether a system migration is required and feasible
  if (!game.user.isGM) {
    return;
  }
  const currentVersion = game.settings.get(
    "morkborg",
    "systemMigrationVersion"
  );
  console.log(`Current version: ${currentVersion}`);
  const NEEDS_MIGRATION_VERSION = "0.2.0";
  // const COMPATIBLE_MIGRATION_VERSION = 0.80;
  const needsMigration =
    currentVersion === null ||
    isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
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
};

const applyFontsAndColors = () => {
  const fontSchemeSetting = game.settings.get("morkborg", "fontScheme");
  const fontScheme = CONFIG.MB.fontSchemes[fontSchemeSetting];
  const colorSchemeSetting = game.settings.get("morkborg", "colorScheme");
  const colorScheme = CONFIG.MB.colorSchemes[colorSchemeSetting];
  const r = document.querySelector(":root");
  r.style.setProperty("--window-background", colorScheme.windowBackground);
  r.style.setProperty("--background-color", colorScheme.background);
  r.style.setProperty("--foreground-color", colorScheme.foreground);
  r.style.setProperty("--foreground-alt-color", colorScheme.foregroundAlt);
  r.style.setProperty(
    "--highlight-background-color",
    colorScheme.highlightBackground
  );
  r.style.setProperty(
    "--highlight-foreground-color",
    colorScheme.highlightForeground
  );
  r.style.setProperty(
    "--sidebar-background-color",
    colorScheme.sidebarBackground
  );
  r.style.setProperty(
    "--sidebar-foreground-color",
    colorScheme.sidebarForeground
  );
  r.style.setProperty(
    "--sidebar-button-background-color",
    colorScheme.sidebarButtonBackground
  );
  r.style.setProperty(
    "--sidebar-button-foreground-color",
    colorScheme.sidebarButtonForeground
  );
  r.style.setProperty("--chat-font", fontScheme.chat);
  r.style.setProperty("--chat-info-font", fontScheme.chatInfo);
  r.style.setProperty("--h1-font", fontScheme.h1);
  r.style.setProperty("--h2-font", fontScheme.h2);
  r.style.setProperty("--h3-font", fontScheme.h3);
  r.style.setProperty("--item-font", fontScheme.item);
};

Hooks.on("renderActorDirectory", (app, html) => {
  if (game.user.can("ACTOR_CREATE")) {
    // only show the Create Scvm button to users who can create actors
    const section = document.createElement("header");
    section.classList.add("scvmfactory");
    section.classList.add("directory-header");
    // Add menu before directory header
    const dirHeader = html[0].querySelector(".directory-header");
    dirHeader.parentNode.insertBefore(section, dirHeader);
    section.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="header-actions action-buttons flexrow">
        <button class="create-scvm-button"><i class="fas fa-skull"></i>Create Scvm</button>
      </div>
      `
    );
    section
      .querySelector(".create-scvm-button")
      .addEventListener("click", () => {
        new ScvmDialog().render(true);
      });
  }
});

Hooks.on("renderCombatTracker", (tracker, html) => {
  const partyInitiativeButton = `<a class="combat-control" title="${game.i18n.localize(
    "MB.RollPartyInitiative"
  )}" dataControl="rollParty"><i class="fas fa-dice-six"></i></a>`;
  html.find("header").find("nav").last().prepend(partyInitiativeButton);
  html.find("a[dataControl=rollParty]").click(() => {
    rollPartyInitiative();
  });
});

const configureHandlebar = () => {
  // Handlebars helpers
  // TODO: registering a helper named "eq" breaks filepicker
  Handlebars.registerHelper("ifEq", function (arg1, arg2, options) {
    // TODO: verify whether we want == or === for this equality check
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifGe", function (arg1, arg2, options) {
    return arg1 >= arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifGt", function (arg1, arg2, options) {
    return arg1 > arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifLe", function (arg1, arg2, options) {
    return arg1 <= arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifLt", function (arg1, arg2, options) {
    return arg1 < arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifNe", function (arg1, arg2, options) {
    // TODO: verify whether we want == or === for this equality check
    return arg1 != arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifPrint", function (cond, v1) {
    return cond ? v1 : "";
  });
  Handlebars.registerHelper("ifPrintElse", function (cond, v1, v2) {
    return cond ? v1 : v2;
  });

  /**
   * Formats a Roll as either the total or x + y + z = total if the roll has multiple terms.
   */
  Handlebars.registerHelper("xtotal", (roll) => {
    // collapse addition of negatives into just subtractions
    // e.g., 15 +  - 1 => 15 - 1
    // Also: apparently roll.result uses 2 spaces as separators?
    // We replace both 2- and 1-space varieties
    const result = roll.result.replace("+  -", "-").replace("+ -", "-");

    // roll.result is a string of terms. E.g., "16" or "1 + 15".
    if (result !== roll.total.toString()) {
      return `${result} = ${roll.total}`;
    } else {
      return result;
    }
  });

  loadTemplates([
    "systems/morkborg/templates/actor/common/actor-equipment-list.html",
    "systems/morkborg/templates/actor/common/item-row.html",
  ]);
};
