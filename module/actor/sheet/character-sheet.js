import MBActorSheet from "./actor-sheet.js";
import RestDialog from "./rest-dialog.js";

/**
 * @extends {ActorSheet}
 */
export class MBActorSheetCharacter extends MBActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "character"],
      template: "systems/morkborg/templates/actor/character-sheet.html",
      width: 720,
      height: 690,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "violence"}],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const superData = super.getData();
    const data = superData.data;
    data.config = CONFIG.MB;

    // Ability Scores
    for (const [a, abl] of Object.entries(data.data.abilities)) {
      const translationKey = CONFIG.MB.abilities[a];
      abl.label = game.i18n.localize(translationKey);
    }

    // Prepare items.
    // TODO: should preparing items move into the MBActor class?
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    // console.log(superData);
    return superData;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} sheetData The sheet data to prepare.
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const byName = (a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
    sheetData.data.feats = sheetData.items.filter(item => item.type === CONFIG.MB.itemTypes.feat).sort(byName);
    sheetData.data.class = sheetData.items.filter(item => item.type === CONFIG.MB.itemTypes.class).pop();

    // TODO: make better use of filters below
    let equipment = [];
    let equippedArmor = null;
    let equippedShield = null;
    let equippedWeapons = [];
    // TODO: should we just create a hash of itemType => items?
    let scrolls = [];
    let containers = [];

    for (const i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;

      item.equippable = (i.type === CONFIG.MB.itemTypes.armor || i.type === CONFIG.MB.itemTypes.shield || i.type === CONFIG.MB.itemTypes.weapon);
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
      } else if (i.type === CONFIG.MB.itemTypes.scroll) {
        scrolls.push(i);
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
    // sort alphabetically
    equipment.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    equippedWeapons.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

    // Assign to new properties
    sheetData.data.equipment = equipment;
    sheetData.data.equippedArmor = equippedArmor;
    sheetData.data.equippedShield = equippedShield;
    sheetData.data.equippedWeapons = equippedWeapons;
    sheetData.data.scrolls = scrolls;

    sheetData.data.containerSpace = this.actor.containerSpace();
    sheetData.data.containerCapacity = this.actor.containerCapacity();
    // TODO: rename to carryingWeight?
    sheetData.data.carryingCount = this.actor.carryingWeight();
    sheetData.data.carryingCapacity = this.actor.normalCarryingCapacity();
    const isEncumbered = this.actor.isEncumbered();
    sheetData.data.encumbered = isEncumbered;
    sheetData.data.encumberedClass = isEncumbered ? "encumbered" : "";
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // sheet header
    html.find(".ability-label.rollable.strength").on("click", this._onStrengthRoll.bind(this));
    html.find(".ability-label.rollable.agility").on("click", this._onAgilityRoll.bind(this));
    html.find(".ability-label.rollable.presence").on("click", this._onPresenceRoll.bind(this));
    html.find(".ability-label.rollable.toughness").on("click", this._onToughnessRoll.bind(this));
    html.find('.item-scvmify').click(this._onScvmify.bind(this));
    html.find(".broken-button").on("click", this._onBroken.bind(this));
    html.find(".rest-button").on("click", this._onRest.bind(this));
    html.find(".omens-row span.rollable").on("click", this._onOmensRoll.bind(this));
    html.find(".get-better-button").on("click", this._onGetBetter.bind(this));
    // feats tab
    html.find(".feat-button").on("click", this._onFeatRoll.bind(this));
    // powers tab
    html.find(".wield-power-button").on("click", this._onWieldPowerRoll.bind(this));
    html.find(".powers-per-day-text").on("click", this._onPowersPerDayRoll.bind(this));
  }

  _onStrengthRoll(event) {
    event.preventDefault();
    this.actor.testStrength();
  }

  _onAgilityRoll(event) {
    event.preventDefault();
    this.actor.testAgility();
  }

  _onPresenceRoll(event) {
    event.preventDefault();
    this.actor.testPresence();
  }

  _onToughnessRoll(event) {
    event.preventDefault();
    this.actor.testToughness();
  }

  _onOmensRoll(event) {
    event.preventDefault();
    this.actor.rollOmens();
  }

  _onPowersPerDayRoll(event) {
    event.preventDefault();
    this.actor.rollPowersPerDay();
  }

  _onScvmify(event) {
    event.preventDefault();
    this.actor.scvmify();
  }

  _onBroken(event) {
    event.preventDefault();
    this.actor.rollBroken();
  }

  _onRest(event) {
    event.preventDefault();
    const restDialog = new RestDialog();
    // TODO: maybe move this into a constructor,
    // if we can resolve the mergeObject() Maximum call stack size exceeded error
    restDialog.actor = this.actor;
    restDialog.render(true);
  }

  _onGetBetter(event) {
    event.preventDefault();
    // confirm before doing get better
    let d = new Dialog({
      title: game.i18n.localize('MB.GetBetter'),
      content: "<p>&nbsp;<p>The game master decides when a character should be improved.<p>It can be after completing a scenario, killing mighty foes, or bringing home treasure.<p>&nbsp;",
      buttons: {
        cancel: {
          label: game.i18n.localize('MB.Cancel'),
        },
        getbetter: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('MB.GetBetter'),
          callback: () => this.actor.getBetter()
        },
      },
      default: "cancel",
     });
     d.render(true);
  }

  _onFeatRoll(event) {
    event.preventDefault();
    const button = $(event.currentTarget);
    const li = button.parents(".item");
    const itemId = li.data("itemId");
    this.actor.useFeat(itemId);
  }

  _onWieldPowerRoll(event) {
    event.preventDefault();
    this.actor.wieldPower();
  }
}
