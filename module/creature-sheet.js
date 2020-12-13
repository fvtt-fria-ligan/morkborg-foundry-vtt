/**
 * @extends {ActorSheet}
 */
 export class MBActorSheetCreature extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor"],
      template: "systems/morkborg/templates/creature-sheet.html",
      width: 720,
      height: 680,
      // tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory"}],
      // is dragDrop needed?
      // dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }  
}