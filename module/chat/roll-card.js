/**
 * @param {ChatMessage} message
 * @param {JQuery.<HTMLElement>} html
 */
export const handleRollCardButton = async (message, html) => {
  // TODO: refactor to longer's Pirate Borg outcome handling framework
  html.on("click", "button.roll-card-button.damage-button", async (event) => {
    event.preventDefault();
    const button = event.currentTarget;
    const actor = game.actors.find((a) => a.id == button.dataset.actorId);
    if (!actor) {
      ui.notifications.error(game.i18n.localize("MB.ActorNotFound"));
      return;
    }
    await actor.rollDamageDie(button.dataset.itemId);
  });
};
