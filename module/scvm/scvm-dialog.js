import {
  setLastScvmfactorySelection,
  getLastScvmfactorySelection,
} from "../settings.js";
import { createScvm, findAllowedClasses, scvmifyActor } from "./scvmfactory.js";
import { sample } from "../utils.js";

export async function showScvmDialog(actor) {
  const lastScvmfactorySelection = getLastScvmfactorySelection();
  const allowedClasses = await findAllowedClasses();
  const classData = allowedClasses
    .map((c) => {
      return {
        name: c.name,
        uuid: c.uuid,
        checked:
          lastScvmfactorySelection.length > 0
            ? lastScvmfactorySelection.includes(c.uuid)
            : true,
      };
    })
    .sort((a, b) => (a.name > b.name ? 1 : -1));
  const dialog = new ScvmDialog();
  dialog.actor = actor;
  dialog.classes = classData;
  dialog.render(true);
};

export default class ScvmDialog extends Application {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "scvm-dialog";
    options.classes = ["morkborg"];
    options.title = game.i18n.localize("MB.TheScvmfactory");
    options.template = "systems/morkborg/templates/dialog/scvm-dialog.hbs";
    options.width = 420;
    options.height = "auto";
    return options;
  }

  /** @override */
  getData(options = {}) {
    return mergeObject(super.getData(options), {
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
