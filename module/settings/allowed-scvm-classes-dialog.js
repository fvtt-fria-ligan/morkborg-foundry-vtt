import { findClasses } from "../scvm/scvmfactory.js";
import { isScvmClassAllowed, setAllowedScvmClasses } from "../settings.js";

export class AllowedScvmClassesDialog extends FormApplication {
  constructor() {
    super();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "allowed-scvm-classes-dialog",
      title: game.i18n.localize("MB.AllowedScvmClassesEdit"),
      template:
        "systems/morkborg/templates/dialog/allowed-scvm-classes-dialog.hbs",
      classes: ["form", "morkborg"],
      popOut: true,
      width: 420,
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".toggle-all").click((event) => this._onToggleAll(event));
    html.find(".toggle-none").click((event) => this._onToggleNone(event));
    html.find(".cancel-button").click((event) => this._onCancel(event));
    html.find(".ok-button").click((event) => this._onOk(event));
  }

  async getData(options = {}) {
    const classes = await this._getClassData();
    return foundry.utils.mergeObject(super.getData(options), {
      classes,
    });
  }

  async _getClassData() {
    const classes = await findClasses();
    const classData = classes.entries().map(([groupName, group]) => {
      return {
        groupName,
        group: group.map((c) => {
          return {
            name: c.name,
            uuid: c.uuid,
            checked: isScvmClassAllowed(c.uuid),
          };
        }),
      };
    });

    return classData;
  }

  _onToggleAll(event) {
    event.preventDefault();
    const form = $(event.currentTarget).parents(
      ".allowed-scvm-classes-dialog"
    )[0];
    $(form).find(".class-checkbox").prop("checked", true);
  }

  _onToggleNone(event) {
    event.preventDefault();
    const form = $(event.currentTarget).parents(
      ".allowed-scvm-classes-dialog"
    )[0];
    $(form).find(".class-checkbox").prop("checked", false);
  }

  _onCancel(event) {
    event.preventDefault();
    this.close();
  }

  _onOk(event) {
    const form = $(event.currentTarget).parents(
      ".allowed-scvm-classes-dialog"
    )[0];
    const selected = [];
    $(form)
      .find("input:checked")
      .each(function () {
        selected.push($(this).attr("name"));
      });

    if (selected.length === 0) {
      event.preventDefault();
      return;
    }
  }

  /** @override */
  async _updateObject(event, formData) {
    setAllowedScvmClasses(formData);
  }
}
