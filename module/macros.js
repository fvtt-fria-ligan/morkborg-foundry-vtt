import { attack } from "./actor/attack.js";
import { defend } from "./actor/defend.js";
import { useFeat } from "./actor/feats.js";
import { wieldPower } from "./actor/powers.js";
import { MB } from "./config.js";

const supportedItemTypes = [
  MB.itemTypes.armor,
  MB.itemTypes.feat,
  MB.itemTypes.scroll,
  MB.itemTypes.shield,
  MB.itemTypes.weapon,
];

export function registerMacros() {
  game.crysborg = {
    rollItemMacro,
  };
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type == "Item") {
      createcrysborgMacro(data, slot);
      return false;
    }
  });
};

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createcrysborgMacro(data, slot) {
  const item = await fromUuid(data.uuid);
  if (!supportedItemTypes.includes(item.type)) {
    return ui.notifications.warn(
      `Macros only supported for item types: ${supportedItemTypes.join(", ")}`
    );
  }
  if (
    item.type === "feat" &&
    (!item.system.rollLabel ||
      (!item.system.rollFormula && !item.system.rollMacro))
  ) {
    // we only allow rollable feats
    return ui.notifications.warn(
      "Macros only supported for feats with roll label and either a formula or macro."
    );
  }

  // Create the macro command
  const command = `game.crysborg.rollItemMacro("${item.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "crysborg.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
export async function rollItemMacro(uuid) {
  const item = await fromUuid(uuid);
  const actor = item.parent;
  if (!item || !actor) {
    return;
  }
  if (item.type === MB.itemTypes.weapon) {
    attack(actor, item.id);
  } else if (
    item.type === MB.itemTypes.armor ||
    item.type === MB.itemTypes.shield
  ) {
    defend(actor, item.id);
  } else if (item.type === MB.itemTypes.scroll) {
    wieldPower(actor);
  } else if (item.type === MB.itemTypes.feat) {
    useFeat(actor, item.id);
  }
}
