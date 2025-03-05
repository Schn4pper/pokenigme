import Configuration from "./entites/configuration";
import InstanceConfiguration from "./instanceConfiguration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import { i18n } from "./i18n/i18n";

export default class NotesMaJPanel {
	private readonly _panelManager: PanelManager;

	private readonly _notes = [
		{
			version: 9,
			notes: [
				"FR : Pokénigme est désormais disponible entièrement en japonais ! La langue d'affichage est désormais distincte de celle de jeu. Résolvez des énigmes dans d'autres langues tout en conservant l'interface en français.",
				"EN : Pokénigma available in Japanese !",
				"DE : Pokénigma erhältlich auf Japanisch !",
				"JP : ポケナゾが日本語で利用可能になりました！",
			],
		},
		{
			version: 8,
			notes: [
				"FR : Pokénigme est désormais disponible entièrement en anglais et en allemand !",
				"EN : Pokénigma available in English !",
				"DE : Pokénigma erhältlich auf Deutsch !",
			],
		},
		{
			version: 7,
			notes: [
				"Mode de jeu ⏱ : le chronomètre est désormais mis en pause durant la validation des mots.",
			],
		},
		{
			version: 6,
			notes: [
				"Le filtrage des générations est désormais possible (hors Pokémon du jour) !",
			],
		},
		{
			version: 5,
			notes: [
				"L'utilisation du trait d'union est désormais supportée, rendant ainsi 24 Pokémon devinables de plus pour un total de 1015. Retrouvez entre autres Ho-Oh, Porygon-Z et les Pokémon paradoxes dans vos grilles !",
			],
		},
		{
			version: 4,
			notes: [
				"Mode de jeu 🕵️:️ nombre de propositions préremplies désormais configurable (cinq par défaut).",
			],
		},
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
		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
		let titre = i18n[config.langue_interface].notesMaJPanel.notes;

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
			titre.innerText = `${i18n[config.langue_interface].notesMaJPanel.version} ${note.version}`;
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
				...(config),
				changelog: InstanceConfiguration.derniereMiseAJour,
			});
		});
		this._panelManager.afficherPanel();
	}
}