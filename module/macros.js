/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createMorkBorgMacro(data, slot) {
  if (data.type !== "Item") {
    return;
  }
  if (!("data" in data)) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }
  const item = data.data;
  const supportedItemTypes = ["armor", "feat", "scroll", "shield", "weapon"];
  if (!supportedItemTypes.includes(item.type)) {
    return ui.notifications.warn(
      `Macros only supported for item types: ${supportedItemTypes.join(", ")}`
    );
  }
  if (
    item.type === "feat" &&
    (!item.data.rollLabel || (!item.data.rollFormula && !item.data.rollMacro))
  ) {
    // we only allow rollable feats
    return ui.notifications.warn(
      "Macros only supported for feats with roll label and either a formula or macro."
    );
  }

  // Create the macro command
  const command = `game.morkborg.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "morkborg.itemMacro": true },
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
export function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) {
    actor = game.actors.tokens[speaker.token];
  }
  if (!actor) {
    actor = game.actors.get(speaker.actor);
  }

  // Get matching items
  const items = actor ? actor.items.filter((i) => i.name === itemName) : [];
  if (items.length > 1) {
    ui.notifications.warn(
      `Your controlled Actor ${actor.name} has more than one Item with name ${itemName}. The first matched item will be chosen.`
    );
  } else if (items.length === 0) {
    return ui.notifications.warn(
      `Your controlled Actor does not have an item named ${itemName}`
    );
  }
  const item = items[0];

  if (item.data.type === "weapon") {
    actor.attack(item.id);
  } else if (item.data.type === "armor" || item.data.type === "shield") {
    actor.defend();
  } else if (item.data.type === "scroll") {
    actor.wieldPower();
  } else if (item.data.type === "feat") {
    actor.useFeat(item.id);
  }
}
