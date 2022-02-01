import MBActorSheet from "./actor-sheet.js";

/**
 * @extends {ActorSheet}
 */
export class MBActorSheetCreature extends MBActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "creature"],
      template: "systems/morkborg/templates/actor/creature-sheet.html",
      width: 720,
      height: 680,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "details",
        },
      ],
      // is dragDrop needed?
      // dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find(".morale").on("click", this._onMoraleRoll.bind(this));
    html.find(".reaction").on("click", this._onReactionRoll.bind(this));
  }

  /**
   * Handle morale roll.
   */
  _onMoraleRoll(event) {
    event.preventDefault();
    this.actor.checkMorale();
  }

  /**
   * Handle reaction roll.
   */
  _onReactionRoll(event) {
    event.preventDefault();
    this.actor.checkReaction();
  }
}
