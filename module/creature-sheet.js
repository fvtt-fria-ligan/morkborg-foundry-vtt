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
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      // is dragDrop needed?
      // dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.MB;
    if (this.actor.data.type == 'character') {
      this._prepareCreatureItems(data);
    }    
    return data;
  }

  /**
   * Organize and classify Items for Creature sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;  

    // TODO: just iterate over the config constants
    // Initialize containers.
    var attacks = [];
    var bounties = [];

    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;

      // TODO: how do we want to localize creature stuff?

      if (i.type === 'creatureAttack') {
        attacks.push(i);
      } else if (i.type === 'bounty') {
        bounties.push(i);
      }
    }

    // Assign to new properties
    actorData.attacks = attacks;
    actorData.bounties = bounties;
  }
}