/*
 * @extends {ItemSheet}
 */
export class MBItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "item"],
      template: "systems/foundry-morkborg/templates/item-sheet.html",
      width: 520,
      height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
    });
  }  
}