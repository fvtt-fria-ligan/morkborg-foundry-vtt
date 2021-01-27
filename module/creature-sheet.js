import * as editor from "./editor.js";

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
    editor.setCustomEditorOptions(options);
    super.activateEditor(name, options, initialContent);
  }

  /** @override */
  activateListeners(html) {
    console.log("************ activate");
    super.activateListeners(html);
    html.find(".morale").on("click", this._onMoraleRoll.bind(this));
    html.find(".reaction").on("click", this._onReactionRoll.bind(this));
  }

  /**
   * Handle morale roll.
   *
   * @param {Event} event   The originating click event
   * @private
   */
  _onMoraleRoll(event) {
    event.preventDefault();   
    this.actor.checkMorale();

    // event.preventDefault();
    // const element = event.currentTarget;
    // const dataset = element.dataset;
    // if (dataset.roll) {
    //   let roll = new Roll(dataset.roll, this.actor.data.data);
    //   let label = dataset.label ? `Rolling ${dataset.label}` : '';
    //   roll.roll().toMessage({
    //     speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //     flavor: label
    //   });
    // }
  }

  /**
   * Handle morale roll.
   *
   * @param {Event} event   The originating click event
   * @private
   */
  _onReactionRoll(event) {
    event.preventDefault();
    this.actor.checkReaction();

    // event.preventDefault();
    // const element = event.currentTarget;
    // const dataset = element.dataset;
    // if (dataset.roll) {
    //   let roll = new Roll(dataset.roll, this.actor.data.data);
    //   let label = dataset.label ? `Rolling ${dataset.label}` : '';
    //   roll.roll().toMessage({
    //     speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //     flavor: label
    //   });
    // }
  }    
}