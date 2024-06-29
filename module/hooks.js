import { showScvmDialog } from "./scvm/scvm-dialog.js";
import { createScvmFromClassUuid } from "./scvm/scvmfactory.js";
import { handleRollCardButton } from "./chat/roll-card.js";

export function registerHooks() {
  Hooks.once("ready", () => {
    applyFontsAndColors();
    Hooks.call("morkborgReady");
  });
  Hooks.on("renderActorDirectory", addCreateScvmButton);
  Hooks.on("renderChatMessage", handleRollCardButton);

  Hooks.on("renderJournalTextPageSheet", (journalTextPageSheet, html) => {
    html.find(".draw-from-table").on("click", drawFromRollableTable.bind(this));
    html.find(".rollable").click(roll.bind(this));
    html.find(".create-scvm").click(createScvm.bind(this));
  });

  Hooks.on("closeJournalTextPageSheet", (journalTextPageSheet, html) => {
    html.find(".draw-from-table").off("click");
    html.find(".rollable").off("click");
    html.find(".create-scvm").off("click");
  });
};

function applyFontsAndColors() {
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
  r.style.setProperty("--sidebar-background", colorScheme.sidebarBackground);
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

  // Foundry vars
  r.style.setProperty(
    "--color-border-highlight",
    colorScheme.highlightBackground
  );
};

function addCreateScvmButton(app, html) {
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
        showScvmDialog();
      });
  }
};

async function drawFromRollableTable(event) {
  event.preventDefault();
  const uuid = event.currentTarget.getAttribute("data-uuid");
  if (uuid) {
    const table = await fromUuid(uuid);
    if (table instanceof RollTable) {
      const formula = event.currentTarget.getAttribute("data-roll");
      const roll = formula ? new Roll(formula) : null;
      await table.draw({ roll });
    }
  }
}

function roll(event) {
  event.preventDefault();
  const formula = event.currentTarget.dataset.roll;
  if (formula) {
    const roll = new Roll(formula);
    roll.toMessage();
  }
}

async function createScvm(event) {
  event.preventDefault();
  const uuid = event.currentTarget.dataset.uuid;
  await createScvmFromClassUuid(uuid);
}
