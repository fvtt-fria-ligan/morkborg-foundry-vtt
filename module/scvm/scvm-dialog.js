import {
  setLastScvmfactorySelection,
  getLastScvmfactorySelection,
} from "../settings.js";
import { createScvm, findAllowedClasses, scvmifyActor } from "./scvmfactory.js";
import { sample } from "../utils.js";

export async function showScvmDialog(actor) {
  const lastScvmfactorySelection = getLastScvmfactorySelection();
  
  // Ruft die Klassen aus findAllowedClasses ab und teilt sie in Standard- und neue Klassen auf
  const { standardClasses, newClasses } = await findAllowedClasses();

  // Bereite die Daten für Standardklassen vor und setze den Checked-Status basierend auf der letzten Auswahl
  const standardClassData = standardClasses
    .map((classItem) => ({
      name: classItem.name,
      uuid: classItem.uuid,
      checked: lastScvmfactorySelection.length > 0
        ? lastScvmfactorySelection.includes(classItem.uuid)
        : true,
    }))
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  // Bereite die Daten für neue Klassen vor und setze den Checked-Status basierend auf der letzten Auswahl
  const newClassData = newClasses
    .map((classItem) => ({
      name: classItem.name,
      uuid: classItem.uuid,
      checked: lastScvmfactorySelection.length > 0
        ? lastScvmfactorySelection.includes(classItem.uuid)
        : true,
    }))
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  // Erstelle den Dialog und übergebe die getrennten Klassendaten
  const dialog = new ScvmDialog();
  dialog.actor = actor;
  dialog.standardClasses = standardClassData;
  dialog.newClasses = newClassData;
  dialog.render(true);
};

export default class ScvmDialog extends Application {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "scvm-dialog";
    options.classes = ["crysborg"];
    options.title = game.i18n.localize("MB.TheScvmfactory");
    options.template = "systems/crysborg/templates/dialog/scvm-dialog.hbs";
    options.width = 420;
    options.height = "auto";
    return options;
  }

  /** @override */
  getData(options = {}) {
    return foundry.utils.mergeObject(super.getData(options), {
      classes: this.classes,
      forActor: this.actor !== undefined && this.actor !== null,
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".toggle-all").click(this._onToggleAll.bind(this));
    html.find(".toggle-none").click(this._onToggleNone.bind(this));
    html.find(".cancel-button").click(this._onCancel.bind(this));
    html.find(".scvm-button").click(this._onScvm.bind(this));
  }

  _onToggleAll(event) {
    event.preventDefault();
    const form = $(event.currentTarget).parents(".scvm-dialog")[0];
    $(form).find(".class-checkbox").prop("checked", true);
  }

  _onToggleNone(event) {
    event.preventDefault();
    const form = $(event.currentTarget).parents(".scvm-dialog")[0];
    $(form).find(".class-checkbox").prop("checked", false);
  }

  _onCancel(event) {
    event.preventDefault();
    this.close();
  }

  async _onScvm(event) {
    event.preventDefault();
    const form = $(event.currentTarget).parents(".scvm-dialog")[0];
    const selectedUuids = [];
    $(form)
      .find("input:checked")
      .each(function () {
        selectedUuids.push($(this).attr("name"));
      });

    if (selectedUuids.length === 0) {
      // nothing selected, so bail
      return;
    }
    setLastScvmfactorySelection(selectedUuids);
    const uuid = sample(selectedUuids);
    const clazz = await fromUuid(uuid);
    if (!clazz) {
      // couldn't find class item, so bail
      const err = `No class item ${uuid} found`;
      console.error(err);
      ui.notifications.error(err);
      return;
    }

    try {
      if (this.actor) {
        await scvmifyActor(this.actor, clazz);
      } else {
        await createScvm(clazz);
      }
    } catch (err) {
      console.error(err);
      ui.notifications.error(
        `Error creating ${clazz.name}. Check console for error log.`
      );
    }

    this.close();
  }
}
