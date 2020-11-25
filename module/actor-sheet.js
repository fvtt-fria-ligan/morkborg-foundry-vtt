/**
 * @extends {ActorSheet}
 */
export class MBActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor"],
      template: "systems/foundry-morkborg/templates/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
    });
  }
}
