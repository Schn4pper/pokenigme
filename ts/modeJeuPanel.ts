import Configuration from "./entites/configuration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import { ModeJeu } from "./entites/modeJeu";

export default class ModeJeuPanel {
  private readonly _panelManager: PanelManager;
  private readonly _modeJeuBouton: HTMLElement;
  private _modeJeuDuJour: HTMLElement;
  private _modeJeuInfini: HTMLElement;
  private _modeJeuDevinette: HTMLElement;
  private _modeJeuDesordre: HTMLElement;

  public constructor(panelManager: PanelManager) {
    this._panelManager = panelManager;

    this._modeJeuBouton = document.getElementById("configuration-mode-jeu-bouton") as HTMLElement;
    this._modeJeuDuJour = this._modeJeuBouton;
    this._modeJeuInfini = this._modeJeuBouton;
    this._modeJeuDevinette = this._modeJeuBouton;
    this._modeJeuDesordre = this._modeJeuBouton;

    this._modeJeuBouton.addEventListener(
      "click",
      (() => {
        this.afficher();
      }).bind(this)
    );

    this.afficherModeDeJeu();
  }

  public afficherModeDeJeu(): void {
    var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

    let modeJeuTexte;

    switch (config.modeJeu) {
        case ModeJeu.DuJour:
            modeJeuTexte = "📅";
            break;
        case ModeJeu.Infini:
            modeJeuTexte = "∞";
            break;
        case ModeJeu.Devinette:
            modeJeuTexte = "🕵️";
            break;
        default:
            modeJeuTexte = "👀";
            break;
    }

    this._modeJeuBouton.innerHTML = "Pokénigme " + modeJeuTexte;



  }

  public sauvegarderModeJeu(mode : ModeJeu): void {
    var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
    Sauvegardeur.sauvegarderConfig({
    ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
        modeJeu: mode
     });
  }

  public afficher(): void {
    let titre = "Mode de jeu";
    let contenu =
      "<h2>" +
      '<a href="#" id="mode-jeu-dujour">📅</a> <a href="#" id="mode-jeu-infini">∞</a> <a href="#" id="mode-jeu-devinette">🕵️</a> <a href="#" id="mode-jeu-desordre">👀</a>' +
      "</h2>";

    this._panelManager.setContenu(titre, contenu);
    this._panelManager.setClasses(["mode-jeu-panel"]);
    this._panelManager.afficherPanel();

    this._modeJeuDuJour = document.getElementById("mode-jeu-dujour") as HTMLElement;
    this._modeJeuInfini = document.getElementById("mode-jeu-infini") as HTMLElement;
    this._modeJeuDevinette = document.getElementById("mode-jeu-devinette") as HTMLElement;
    this._modeJeuDesordre = document.getElementById("mode-jeu-desordre") as HTMLElement;


    this._modeJeuDuJour.addEventListener(
        "click",
        (() => {
            this.sauvegarderModeJeu(ModeJeu.DuJour);
            location.reload();
        }).bind(this)
    );

    this._modeJeuInfini.addEventListener(
        "click",
        (() => {
            this.sauvegarderModeJeu(ModeJeu.Infini);
            location.reload();
        }).bind(this)
    );

    this._modeJeuDevinette.addEventListener(
        "click",
        (() => {
            this.sauvegarderModeJeu(ModeJeu.Devinette);
            location.reload();
        }).bind(this)
    );

    this._modeJeuDesordre.addEventListener(
        "click",
        (() => {
            this.sauvegarderModeJeu(ModeJeu.Desordre);
            location.reload();
        }).bind(this)
    );
  }
}