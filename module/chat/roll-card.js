import { showDice } from "../dice.js";
import { showRollResultCard } from "../utils.js";

/**
 * @param {ChatMessage} message
 * @param {JQuery.<HTMLElement>} html
 */
export async function handleRollCardButton(message, html) {
  // TODO: refactor to longer's Pirate Borg outcome handling framework
  html.on("click", "button.roll-card-button.damage-button", async (event) => {
    event.preventDefault();
    const button = event.currentTarget;
    const actor = game.actors.find((a) => a.id == button.dataset.actorId);
    if (!actor) {
      ui.notifications.error(game.i18n.localize("MB.ActorNotFound"));
      return;
    }
    await rollDamageDie(actor, button.dataset.itemId);
  });
}

async function rollDamageDie(actor, itemId) {
  const item = actor.items.get(itemId);
  if (!item) {
    ui.notifications.error(game.i18n.localize("MB.ItemNotFound"));
    return;
  }
  const roll = new Roll(item.system.damageDie);
  await roll.evaluate();
  await showDice(roll);
  const cardTitle = game.i18n.localize("MB.Damage");
  const data = {
    cardTitle,
    items: [item],
    rollResults: [
      {
        rollTitle: roll.formula,
        roll,
        outcomeLines: [],
      },
    ],
  };
  await showRollResultCard(actor, data);
}
