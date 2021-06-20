import MBActorSheet from "./actor-sheet.js";

/**
 * @extends {ActorSheet}
 */
 export class MBActorSheetFollower extends MBActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "follower"],
      template: "systems/morkborg/templates/actor/follower-sheet.html",
      width: 720,
      height: 690,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      // is dragDrop needed?
      // dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const superData = super.getData();
    const data = superData.data;
    data.config = CONFIG.MB;
    if (this.actor.data.type == 'follower') {
      this._prepareFollowerItems(data);
    }
    return superData;
  }

  /**
   * Organize and classify Items for Follower sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareFollowerItems(sheetData) {
    // TODO: refactor / DRY with character-sheet.js. Maybe move into MBActor for better reuse?
    let equipment = [];
    let equippedArmor = null;
    let equippedShield = null;
    let equippedWeapons = [];
    let containers = [];

    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;

      item.equippable = (i.type === 'armor' || i.type === 'shield' || i.type === 'weapon');
      if (item.equippable) {
        const isEquipped = getProperty(item, "equipped");
        item.toggleClass = isEquipped ? "equipped" : "";
        item.toggleTitle = game.i18n.localize(isEquipped ? "MB.ItemEquipped" : "MB.ItemUnequipped");
      }

      if (CONFIG.MB.itemEquipmentTypes.includes(i.type)) {
        equipment.push(i);
      }      
      if (i.type === CONFIG.MB.itemTypes.armor) {
        item.damageReductionDie = CONFIG.MB.armorTiers[item.tier.value].damageReductionDie;
        if (item.equipped) {
          // only one armor may be equipped at a time
          equippedArmor = i;
        }
      } else if (i.type === CONFIG.MB.itemTypes.container) {
        containers.push(i);
      } else if (i.type === CONFIG.MB.itemTypes.shield) {
        if (item.equipped) {
          // only one shield may be equipped at a time
          equippedShield = i;
        }
      } else if (i.type === CONFIG.MB.itemTypes.weapon) {
        if (item.equipped) {
          equippedWeapons.push(i);
        }
      }      
    }
    equipment.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    equippedWeapons.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

    // Assign to new properties
    sheetData.data.equipment = equipment;
    sheetData.data.equippedArmor = equippedArmor;
    sheetData.data.equippedShield = equippedShield;
    sheetData.data.equippedWeapons = equippedWeapons;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Handle rollable items.
    html.find(".morale").on("click", this._onMoraleRoll.bind(this));
  }

  /**
   * Handle morale roll.
   */
  _onMoraleRoll(event) {
    event.preventDefault();   
    this.actor.checkMorale();
  }  
}
