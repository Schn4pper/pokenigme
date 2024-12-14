import Configuration from "./entites/configuration";
import InstanceConfiguration from "./instanceConfiguration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";

export default class NotesMaJPanel {
  private readonly _panelManager: PanelManager;

  private readonly _notes = [
    {
      version: 3,
      notes: [
        "Nouveau mode de jeu ⏱.️",
      ],
    },
    {
      version: 2,
      notes: [
        "Mise à jour de Pokénigme sur la base de la version actuelle de SUTOM.",
      ],
    },
  ];

  public constructor(panelManager: PanelManager) {
    this._panelManager = panelManager;
  }

  public afficher(versionOrigine: number): void {
    let titre = "Notes de mises à jour";

    // On affiche du plus récent au plus ancien
    const notesAAfficher = this._notes
      .filter((note) => note.version > versionOrigine)
      .sort((a, b) => {
        if (b.version > a.version) return 1;
        if (b.version < a.version) return -1;
        return 0;
      });

    if (notesAAfficher.length === 0) return;

    const notesArea = document.createElement("div");

    for (let note of notesAAfficher) {
      const divNote = document.createElement("div");

      const titre = document.createElement("h3");
      titre.innerText = `Version ${note.version}`;
      divNote.appendChild(titre);

      const listeNotes = document.createElement("ul");

      for (let item of note.notes) {
        const itemLi = document.createElement("li");
        itemLi.innerText = item;
        listeNotes.appendChild(itemLi);
      }

      divNote.appendChild(listeNotes);

      notesArea.appendChild(divNote);
    }

    this._panelManager.setContenuHtmlElement(titre, notesArea);
    this._panelManager.setClasses(["notes-panel"]);
    this._panelManager.setCallbackFermeture(() => {
      Sauvegardeur.sauvegarderConfig({
        ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
        changelog: InstanceConfiguration.derniereMiseAJour,
      });
    });
    this._panelManager.afficherPanel();
  }
}