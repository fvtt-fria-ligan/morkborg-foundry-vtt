import MBActorSheet from "./actor-sheet.js";
import { byName } from "../../utils.js";

/**
 * @extends {ActorSheet}
 */
export class MBFollowerSheet extends MBActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "follower"],
      template: "systems/morkborg/templates/actor/follower-sheet.hbs",
      width: 720,
      height: 690,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  /** @override */
  async getData() {
    const superData = await super.getData();
    const data = superData.data;
    data.config = CONFIG.MB;
    this._prepareFollowerItems(data);
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
    sheetData.system.equipment = sheetData.items
      .filter((item) => CONFIG.MB.itemEquipmentTypes.includes(item.type))
      .filter((item) => !item.system.hasContainer)
      .sort(byName);

    sheetData.system.equippedArmor = sheetData.items
      .filter((item) => item.type === CONFIG.MB.itemTypes.armor)
      .find((item) => item.system.equipped);

    sheetData.system.equippedShield = sheetData.items
      .filter((item) => item.type === CONFIG.MB.itemTypes.shield)
      .find((item) => item.system.equipped);

    sheetData.system.equippedWeapons = sheetData.items
      .filter((item) => item.type === CONFIG.MB.itemTypes.weapon)
      .filter((item) => item.system.equipped)
      .sort(byName);

    sheetData.system.ammo = sheetData.items
      .filter((item) => item.type === CONFIG.MB.itemTypes.ammo)
      .sort(byName);
  }
}
