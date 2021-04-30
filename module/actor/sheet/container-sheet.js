import MBActorSheet from "./actor-sheet.js";

/**
 * @extends {ActorSheet}
 */
 export class MBActorSheetContainer extends MBActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "container"],
      template: "systems/morkborg/templates/actor/container-sheet.html",
      width: 720,
      height: 680,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "contents"}],
      // is dragDrop needed?
      // dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.MB;
    if (this.actor.data.type == 'container') {
      this._prepareContainerItems(data);
    }
    return data;
  }

  /**
   * Organize and classify Items for Container sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareContainerItems(sheetData) {
    let equipment = [];
    for (let i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (CONFIG.MB.itemEquipmentTypes.includes(i.type)) {
        equipment.push(i);
      }
    }
    equipment.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    sheetData.actor.data.equipment = equipment;
    sheetData.actor.data.containerSpace = this._containerSpace(sheetData);
  }

  _containerSpace(sheetData) {
    let total = 0;
    for (const item of sheetData.items) {
      if (CONFIG.MB.itemEquipmentTypes.includes(item.type) &&         
          item.data.containerSpace) {  
          const roundedSpace = Math.ceil(item.data.containerSpace * item.data.quantity);
          total += roundedSpace;
      }
    }
    return total;
  }
}