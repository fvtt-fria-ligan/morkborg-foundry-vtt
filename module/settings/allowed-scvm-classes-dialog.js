import { findClassPacks } from "../scvm/scvmfactory.js";
import { isScvmClassAllowed, setAllowedScvmClasses } from "../settings.js";

export class AllowedScvmClassesDialog extends FormApplication {
  constructor() {
    super();
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "allowed-scvm-classes-dialog",
      title: game.i18n.localize("MB.AllowedScvmClassesEdit"),
      template:
        "systems/morkborg/templates/dialog/allowed-scvm-classes-dialog.html",
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

  getData(options = {}) {
    return mergeObject(super.getData(options), {
      classes: this._getAllowedClasses(),
    });
  }

  _getAllowedClasses() {
    const classPacks = findClassPacks();
    return classPacks
      .map((classPack) => {
        return {
          name: classPack,
          label: classPack.split("class-")[1].replace(/-/g, " "),
          checked: isScvmClassAllowed(classPack),
        };
      })
      .sort((a, b) => (a.label > b.label ? 1 : -1));
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
