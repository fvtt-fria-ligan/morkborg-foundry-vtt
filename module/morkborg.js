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
Hooks.once("init", async function() {
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
    label: "MB.SheetClassCharacter"
  });
  Actors.registerSheet("morkborg", MBActorSheetContainer, {
    types: ["container"],
    makeDefault: true,
    label: "MB.SheetClassContainer"
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
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createMorkBorgMacro(data, slot));  
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
  const fontSchemeSetting = game.settings.get("morkborg", "fontScheme");
  const fontScheme = CONFIG.MB.fontSchemes[fontSchemeSetting];
  const colorSchemeSetting = game.settings.get("morkborg", "colorScheme");
  const colorScheme = CONFIG.MB.colorSchemes[colorSchemeSetting];
  const r = document.querySelector(":root");
  r.style.setProperty("--window-background", colorScheme.windowBackground);
  r.style.setProperty("--background-color", colorScheme.background);
  r.style.setProperty("--foreground-color", colorScheme.foreground);
  r.style.setProperty("--foreground-alt-color", colorScheme.foregroundAlt);
  r.style.setProperty("--highlight-background-color", colorScheme.highlightBackground);
  r.style.setProperty("--highlight-foreground-color", colorScheme.highlightForeground);
  r.style.setProperty("--sidebar-background-color", colorScheme.sidebarBackground);
  r.style.setProperty("--sidebar-foreground-color", colorScheme.sidebarForeground);
  r.style.setProperty("--sidebar-button-background-color", colorScheme.sidebarButtonBackground);
  r.style.setProperty("--sidebar-button-foreground-color", colorScheme.sidebarButtonForeground);
  r.style.setProperty("--chat-font", fontScheme.chat);
  r.style.setProperty("--chat-info-font", fontScheme.chatInfo);
  r.style.setProperty("--h1-font", fontScheme.h1);
  r.style.setProperty("--h2-font", fontScheme.h2);
  r.style.setProperty("--h3-font", fontScheme.h3);
  r.style.setProperty("--item-font", fontScheme.item);
};

Hooks.on('dropActorSheetData', async (actor, actorSheet, dropped) => {
  // Handle one-only Class item
  if (dropped.type === "Item" && dropped.pack) {
    const packName = dropped.pack.split(".")[1];
    if (packName.startsWith("class-")) {
      // Dropping a new class, so nuke any pre-existing class item(s),
      // to enforce that a character only has one class item at a time.
      const classes = actor.items.filter(i => i.data.type === "class");
      const deletions = classes.map(i => i.id);
      await actor.deleteEmbeddedDocuments("Item", deletions);
    }
  }
  // TODO: test this when dropping a Class item from sidebar, rather than from compendium

  // Handle container actor destructive drag-drop
  if (dropped.type === "Item" && dropped.data && dropped.data._id) {
    const sourceActor = dropped.tokenId ? game.actors.tokens[dropped.tokenId] : game.actors.get(dropped.actorId);
    if (sourceActor && actor.id !== sourceActor.id && 
      (sourceActor.data.type === "container" || actor.data.type === "container")) {
      // either the source or target actor is a container,
      // so delete the item from the source
      await sourceActor.deleteEmbeddedDocuments("Item", [dropped.data._id]);
    }
  }
});

Hooks.on('createActor', async (actor, options, userId) => {
  // give Characters a default class
  if (actor.data.type === "character" && game.packs) {
    const hasAClass = actor.items.filter(i => i.data.type === "class").length > 0;
    if (!hasAClass) {
      const pack = game.packs.get("morkborg.class-classless-adventurer");
      if (!pack) {
        console.error("Could not find compendium morkborg.class-classless-adventurer");
        return;
      }
      const index = await pack.getIndex();
      const entry = index.find(e => e.name === "Adventurer");
      if (!entry) {
        console.error("Could not find Adventurer class in compendium.");
        return;
      }
      const entity = await pack.getDocument(entry._id);
      if (!entity) {
        console.error("Could not get document for Adventurer class.");
        return;
      }
      await actor.createEmbeddedDocuments("Item", [duplicate(entity.data)]);
    }
  }
});

Hooks.on('renderActorDirectory', (app,  html, data) => {
  if (game.user.can("ACTOR_CREATE")) {
    // only show the Create Scvm button to users who can create actors
    const section = document.createElement('header');
    section.classList.add('scvmfactory');
    section.classList.add('directory-header');
    // Add menu before directory header
    const dirHeader = html[0].querySelector('.directory-header');
    dirHeader.parentNode.insertBefore(section, dirHeader);
    section.insertAdjacentHTML('afterbegin',`
      <div class="header-actions action-buttons flexrow">
        <button class="create-scvm-button"><i class="fas fa-skull"></i>Create Scvm</button>
      </div>
      `);
    section.querySelector('.create-scvm-button').addEventListener('click', (ev) => {
      new ScvmDialog().render(true);
    });  
  }
});

const rollPartyInitiative = () => {
  if (game.combats && game.combat) {
    game.combat.rollPartyInitiative();
  } else {
    ui.notifications.warn(`${game.i18n.localize('MB.NoActiveEncounter')}!`);
  }  
};
Hooks.on('renderCombatTracker', (tracker, html) => {
  const partyInitiativeButton = `<a class="combat-control" title="${game.i18n.localize('MB.RollPartyInitiative')}" dataControl="rollParty"><i class="fas fa-dice-six"></i></a>`;
  html.find("header").find("nav").last().prepend(partyInitiativeButton);
  html.find("a[dataControl=rollParty]").click(ev => { rollPartyInitiative() });
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
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
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
/**
 * Formats a Roll as either the total or x + y + z = total if the roll has multiple results.
 */
Handlebars.registerHelper('xtotal', (roll) => {
  const resultPrefix = roll.result.length > 1 ? roll.result + " = " : "";
  return `${resultPrefix}${roll.total}`;
});