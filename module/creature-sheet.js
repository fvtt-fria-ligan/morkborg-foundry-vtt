/**
 * @extends {ActorSheet}
 */
 export class MBActorSheetCreature extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "creature"],
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
    options.content_style = '@import url("https://fonts.googleapis.com/css2?family=Special+Elite&display=swap");';
    super.activateEditor(name, options, initialContent);
  }
}