import Input, { ContexteBloquage } from "./input";

export default class PanelManager {
  private readonly _panelArea: HTMLElement;
  private readonly _panelFenetre: HTMLElement;
  private readonly _panelTitre: HTMLElement;
  private readonly _panelContenu: HTMLElement;
  private readonly _panelFermetureBouton: HTMLElement;

  private _input?: Input;

  public constructor() {
    this._panelArea = document.getElementById("panel-area") as HTMLElement;
    this._panelFenetre = document.getElementById("panel-fenetre") as HTMLElement;
    this._panelTitre = document.getElementById("panel-fenetre-titre") as HTMLElement;
    this._panelContenu = document.getElementById("panel-fenetre-contenu") as HTMLElement;
    this._panelFermetureBouton = document.getElementById("panel-fenetre-bouton-fermeture") as HTMLElement;

    this._panelArea.addEventListener(
      "click",
      ((event: Event) => {
        event.stopPropagation();
        this.cacherPanel();
      }).bind(this)
    );

    this._panelFenetre.addEventListener(
      "click",
      ((event: Event) => {
        event.stopPropagation(); // On évite ainsi de fermer le panel en appuyant sur la fenêtre
      }).bind(this)
    );

    this._panelFermetureBouton.addEventListener(
      "click",
      ((event: Event) => {
        event.stopPropagation();
        this.cacherPanel();
      }).bind(this)
    );
  
  this._panelArea.addEventListener(
      "keydown",
      ((event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          this.cacherPanel();
        } else if (event.key === "Tab") {
          if (!document.activeElement) return;
          const elementsWithFocus = this._panelArea.querySelectorAll("a[href], select, input");
          let elementsFocusable = [];
          for (let elementIndex = 0; elementIndex < elementsWithFocus.length; elementIndex++) {
            elementsFocusable.push(elementsWithFocus.item(elementIndex));
          }
          const elementIndex = elementsFocusable.indexOf(document.activeElement);
          if (elementIndex === -1) return;
          if (!event.shiftKey && elementIndex === elementsWithFocus.length - 1) {
            (elementsWithFocus.item(0) as HTMLElement).focus();
            event.preventDefault();
          } else if (event.shiftKey && elementIndex === 0) {
            (elementsWithFocus.item(elementsWithFocus.length - 1) as HTMLElement).focus();
            event.preventDefault();
          }
        }
      }).bind(this)
    );
  }
  public setInput(input: Input): void {
    this._input = input;
  }

  public afficherPanel(): void {
    this._panelArea.style.display = "block";
    this._panelArea.setAttribute("aria-modal", "true");
    this._panelArea.setAttribute("tabindex", "0");
    this._panelArea.focus();
    if (this._input) this._input.bloquer(ContexteBloquage.Panel);
  }

  public cacherPanel(): void {
    this._panelArea.style.display = "none";
    this._panelArea.setAttribute("aria-modal", "false");
    this._panelArea.removeAttribute("tabindex");
    if (this._input) this._input.debloquer(ContexteBloquage.Panel);
  }

  public setContenu(titre: string, contenu: string): void {
    this._panelTitre.innerText = titre;
    this._panelContenu.innerHTML = contenu;
  }

  public setContenuHtmlElement(titre: string, contenu: HTMLElement): void {
    this._panelTitre.innerText = titre;
    this._panelContenu.innerHTML = "";
    this._panelContenu.appendChild(contenu);
  }

  public setClasses(classes: Array<string>): void {
    this._panelArea.className = "";
    classes.forEach((nomClasse) => this._panelArea.classList.add(nomClasse));
  }

  public setCallbackFermeture(callback: () => void): void {
    this._panelFermetureBouton.addEventListener(
      "click",
      ((event: Event) => {
        callback();
      }).bind(this),
      { once: true }
    );
  }
}
