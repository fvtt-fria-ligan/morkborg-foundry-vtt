import MBActorSheet from "./actor-sheet.js";

/**
 * @extends {ActorSheet}
 */
export class MBCreatureSheet extends MBActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["crysborg", "sheet", "actor", "creature"],
      template: "systems/crysborg/templates/actor/creature-sheet.hbs",
      width: 720,
      height: 680,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "details",
        },
      ],
    });
  }
}
