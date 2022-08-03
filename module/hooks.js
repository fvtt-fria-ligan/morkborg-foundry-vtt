import ScvmDialog from "./scvm/scvm-dialog.js";
import { createMorkBorgMacro } from "./macros.js";
import { rollPartyInitiative } from "./combat.js";

export const registerHooks = () => {
  Hooks.once("ready", () => {
    applyFontsAndColors();
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) =>
      createMorkBorgMacro(data, slot)
    );
    Hooks.call("morkborgReady");
  });
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
