import MBActorSheet from "./actor-sheet.js";
import { MB } from "../../config.js";
import RestDialog from "./rest-dialog.js";
import { trackAmmo, trackCarryingCapacity } from "../../settings.js";
import { showScvmDialog } from "../../scvm/scvm-dialog.js";
import { byName } from "../../utils.js";
import { rollBroken } from "../broken.js";
import { getBetter } from "../get-better.js";
import { useFeat } from "../feats.js";
import {
  testAgility,
  testCustomAbility,
  testPresence,
  testStrength,
  testToughness,
} from "../test-abilities.js";
import { rollOmens } from "../omens.js";
import { wieldPower } from "../powers.js";
import { upperCaseFirst } from "../../utils.js";

/**
 * @extends {ActorSheet}
 */
export class MBCharacterSheet extends MBActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "character"],
      template: "systems/morkborg/templates/actor/character-sheet.hbs",
      width: 750,
      height: 690,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "violence",
        },
      ],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  /** @override */
  async getData() {
    const superData = await super.getData();
    superData.config = CONFIG.MB;
    const data = superData.data;

    // Ability Scores
    data.system.orderedAbilities = [];
    for (const abilityName of MB.abilitySheetOrder) {
      const ability = data.system.abilities[abilityName];
      const translationKey = `MB.Ability${upperCaseFirst(abilityName)}`;
      ability.label = game.i18n.localize(translationKey);
      data.system.orderedAbilities.push(ability);
    }
    // custom abilities are in an ordered csv string
    const additionalAbilitiesCsv = game.settings.get(
      "morkborg",
      "additionalAbilities"
    );
    if (additionalAbilitiesCsv) {
      const customAbilities = additionalAbilitiesCsv.split(",").map((key) => {
        return {
          value: data.system.abilities[key.toLowerCase()]?.value ?? 0,
          label: key,
        };
      });
      if (customAbilities.length) {
        data.system.orderedAbilities =
          data.system.orderedAbilities.concat(customAbilities);
      }
    }

    this._prepareCharacterItems(data);
    data.system.trackCarryingCapacity = trackCarryingCapacity();
    data.system.trackAmmo = trackAmmo();
    return superData;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} sheetData The sheet data to prepare.
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    sheetData.system.feats = sheetData.items
      .filter((item) => item.type === CONFIG.MB.itemTypes.feat)
      .sort(byName);

    sheetData.system.class = sheetData.items.find(
      (item) => item.type === CONFIG.MB.itemTypes.class
    );

    sheetData.system.scrolls = sheetData.items
      .filter((item) => item.type === CONFIG.MB.itemTypes.scroll)
      .sort(byName);

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

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // sheet header
    html
      .find(".ability-label.rollable.strength")
      .on("click", this._onStrengthRoll.bind(this));
    html
      .find(".ability-label.rollable.agility")
      .on("click", this._onAgilityRoll.bind(this));
    html
      .find(".ability-label.rollable.presence")
      .on("click", this._onPresenceRoll.bind(this));
    html
      .find(".ability-label.rollable.toughness")
      .on("click", this._onToughnessRoll.bind(this));
    html
      .find(".ability-label.rollable.custom")
      .on("click", this._onCustomAbilityRoll.bind(this));

    html.find(".reroll-button").click(this._onReroll.bind(this));
    html.find(".broken-button").on("click", this._onBroken.bind(this));
    html.find(".rest-button").on("click", this._onRest.bind(this));
    html
      .find(".omens-row span.rollable")
      .on("click", this._onOmensRoll.bind(this));
    html.find(".get-better-button").on("click", this._onGetBetter.bind(this));
    // powers tab
    html.find(".feat-button").on("click", this._onFeatRoll.bind(this));
    html
      .find(".wield-power-button")
      .on("click", this._onWieldPowerRoll.bind(this));
  }

  _onStrengthRoll(event) {
    event.preventDefault();
    testStrength(this.actor);
  }

  _onAgilityRoll(event) {
    event.preventDefault();
    testAgility(this.actor);
  }

  _onPresenceRoll(event) {
    event.preventDefault();
    testPresence(this.actor);
  }

  _onToughnessRoll(event) {
    event.preventDefault();
    testToughness(this.actor);
  }

  _onCustomAbilityRoll(event) {
    event.preventDefault();
    const customAbility = event.currentTarget.className.split(" ")[3];
    testCustomAbility(this.actor, customAbility);
  }

  _onOmensRoll(event) {
    event.preventDefault();
    rollOmens(this.actor);
  }

  _onBroken(event) {
    event.preventDefault();
    rollBroken(this.actor);
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
    const d = new Dialog({
      title: game.i18n.localize("MB.GetBetter"),
      content:
        "<p>&nbsp;<p>The game master decides when a character should be improved.<p>It can be after completing a scenario, killing mighty foes, or bringing home treasure.<p>&nbsp;",
      buttons: {
        cancel: {
          label: game.i18n.localize("MB.Cancel"),
        },
        getbetter: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("MB.GetBetter"),
          callback: () => getBetter(this.actor),
        },
      },
      default: "cancel",
    });
    d.render(true);
  }

  _onReroll(event) {
    event.preventDefault();
    showScvmDialog(this.actor);
  }

  _onFeatRoll(event) {
    event.preventDefault();
    const button = $(event.currentTarget);
    const li = button.parents(".item");
    const itemId = li.data("itemId");
    useFeat(this.actor, itemId);
  }

  _onWieldPowerRoll(event) {
    event.preventDefault();
    wieldPower(this.actor);
  }
}
