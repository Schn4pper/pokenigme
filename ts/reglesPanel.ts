import Configuration from "./entites/configuration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";

export default class ReglesPanel {
  private readonly _panelManager: PanelManager;
  private readonly _rulesBouton: HTMLElement;

  public constructor(panelManager: PanelManager) {
    this._panelManager = panelManager;
    this._rulesBouton = document.getElementById("configuration-regles-bouton") as HTMLElement;

    this._rulesBouton.addEventListener(
      "click",
      (() => {
        this.afficher();
      }).bind(this)
    );
  }

  public afficher(): void {
    let titre = "Règles";
    let contenu =
      "<p>" +
      "Vous avez six essais pour deviner le Pokémon du jour, entre 4 et 12 lettres, commun à tous.<br />" +
      "Vous ne pouvez proposer que des noms de Pokémon en français de la même longueur que le mot recherché.<br />" +
      "Le mot change chaque jour. Prière donc d'éviter le divulgâchage et de privilégier le partage du résumé.<br />" +
      "</p>" +
      '<div class="grille">' +
      "<table>" +
      "<tr>" +
      '<td class="resultat bien-place">P</td>' +
      '<td class="resultat non-trouve">I</td>' +
      '<td class="resultat non-trouve">K</td>' +
      '<td class="resultat mal-place">A</td>' +
      '<td class="resultat bien-place">C</td>' +
      '<td class="resultat non-trouve">H</td>' +
      '<td class="resultat mal-place">U</td>' +
      "</tr>" +
      "</table>" +
      "Les lettres entourées d'un carré rouge sont bien placées.<br />" +
      "Les lettres entourées d'un cercle jaune sont présentes dans le mot mais mal placées.<br />" +
      "Les lettres qui restent sur fond bleu ne sont pas dans le mot.<br /><br/>" +
      "Le mode 📅 correspond à la Pokénigme du jour.<br/>" +
      "Le mode ∞ génère aléatoirement et de manière illimitée une Pokénigme.<br/>" +
      "Le mode 🕵️ génère aléatoirement et de manière illimitée une Pokénigme avec cinq propositions préremplies (exclu des statistiques).<br/>" +
      "Le mode 👀 génère aléatoirement et de manière illimitée une Pokénigme dont les lettres la composant sont indiquées sur le clavier (exclu des statistiques).<br/>" +
      "Les noms anglais et allemands sont acceptés, uniquement comme propositions." +
      "</div>" +
      "<p>" +
      '<a target="_blank" href="https://github.com/Schn4pper/pokenigme">Projet</a> créé par <a href="mailto:schnapper@fog.gy">Schnapper</a>. Basé sur l\'excellent <a target="_blank" href="https://framagit.org/JonathanMM/sutom">SUTOM</a> créé par <a target="_blank" href="https://twitter.com/Jonamaths">Jonamaths</a>.<br />' +
      "</p>";

    this._panelManager.setContenu(titre, contenu);
    this._panelManager.setClasses(["regles-panel"]);
    this._panelManager.setCallbackFermeture(() => {
      Sauvegardeur.sauvegarderConfig({
        ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
        afficherRegles: false,
      });
    });
    this._panelManager.afficherPanel();
  }
}
