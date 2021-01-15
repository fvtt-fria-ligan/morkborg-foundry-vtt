/**
 * @extends {ActorSheet}
 */
 export class MBActorSheetOutcast extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "outcast"],
      template: "systems/morkborg/templates/outcast-sheet.html",
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
    if (this.actor.data.type == 'outcast') {
      this._prepareOutcastItems(data);
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
  _prepareOutcastItems(sheetData) {
    const actorData = sheetData.actor;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // TODO: figure out how we want to handle outcast inventory
      // do we want equipment, equippedWeapon, etc just like character?
    }
  }

  /** @override */
  activateEditor(name, options={}, initialContent="") {
    options.relative_urls = true;
    options.skin_url = "/systems/morkborg/styles/skins/mb";
    options.skin = "morkborg";
    options.toolbar_location = 'bottom';
    options.plugins = 'lists table link image save';
    options.toolbar = 'formatselect | bold italic underline strikethrough bullist image link save';
    options.menubar = false;
    options.statusbar = false;
    super.activateEditor(name, options, initialContent);
  }
}
