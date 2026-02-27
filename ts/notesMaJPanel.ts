import Configuration from "./entites/configuration";
import InstanceConfiguration from "./instanceConfiguration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import { i18n } from "./i18n/i18n";
import { Langue } from "./entites/langue";

export default class NotesMaJPanel {
	private readonly _panelManager: PanelManager;

	private readonly _notes = [
		{
			version: 17,
			notes: {
				[Langue.FR] : "La génération 10 arrive !",
				[Langue.EN] : "The 10th generation came out !",
				[Langue.DE] : "Die Generation 10 kam heraus !",
				[Langue.JA] : "第10世代が登場。",
			},
		},
		{
			version: 16,
			notes: {
				[Langue.FR] : "En panne d'inspiration ? Vous pouvez désormais saisir des noms d'une longueur inférieure à la solution, en utilisant des espaces avant et après.",
				[Langue.EN] : "Out of inspiration ? You can now enter names shorter than the solution, using spaces before and after.",
				[Langue.DE] : "Ideenlos ? Sie können jetzt Namen eingeben, die kürzer als die Lösung sind, indem Sie Leerzeichen vor und nach dem Namen verwenden.",
				[Langue.JA] : "インスピレーションが出ないですか？解答より短い名前を、前後にスペースを入れて入力することができるようになりました。",
			},
		},
		{
			version: 15,
			notes: {
				[Langue.FR] : "Amélioration graphique de l'écran de fin et du Pokédex.",
				[Langue.EN] : "Graphical improvement of the finish screen and the Pokédex.",
				[Langue.DE] : "Graphische Verbesserung des Endbildschirms und des Pokédex.",
				[Langue.JA] : "エンドスクリーンとポケデックスのグラフィック改善。",
			},
		},
		{
			version: 14,
			notes: {
				[Langue.FR] : "Le filtrage par nombre de lettres est désormais possible.",
				[Langue.EN] : "You can now filter by number of letters.",
				[Langue.DE] : "Sie können nun per Buchstabenzahl filtern.",
				[Langue.JA] : "文字数でフィルターすることができます。",
			},
		},
		{
			version: 13,
			notes: {
				[Langue.FR] : "Vous pouvez désormais jouer avec des indices initiaux dans certains modes de jeux (activables dans les paramètres).",
				[Langue.EN] : "You can now play with cues at the start of some game modes (to be enabled in the settings).",
				[Langue.DE] : "Sie können nun mit Hinweisen am Anfang bestimmter Spielmodi spielen (in den Einstellungen zu aktivieren).",
				[Langue.JA] : "設定で有効にすると、一部のゲームモードの開始時にキューを使って遊べます。",
			},
		},
		{
			version: 12,
			notes: {
				[Langue.FR] : "Capturez-les tous ! 👀",
				[Langue.EN] : "Gotta catch 'em all ! 👀",
				[Langue.DE] : "Schnapp sie dir alle ! 👀",
				[Langue.JA] : "ゲットだぜー！ 👀",
			},
		},
		{
			version: 11,
			notes: {
				[Langue.FR] : "Vous pouvez désormais sauvegarder l'état de votre grille et l'envoyer à vos amis pour qu'ils la complètent à leur tour (depuis la rubrique des statistiques) !",
				[Langue.EN] : "You can now save the state of your game grid and send it to your friends for them to complete in turn !",
				[Langue.DE] : "Sie können nun den Zustand Ihres Spielfeldes speichern und es an Ihre Freunde senden, damit sie es ihrerseits vervollständigen können !",
				[Langue.JA] : "これで、ゲームグリッドの状態を保存して、友達に送り、彼らが順番に完成させることができます。",
			},
		},
		{
			version: 10,
			notes: {
				[Langue.FR] : "L'utilisation des caractères spéciaux est désormais supportée, rendant ainsi des Pokémon comme M. Mime, Porygon2, les deux Nidoran et Type:0 devinables !",
				[Langue.EN] : "The use of special characters is now supported, allowing Pokémon like Mr. Mime, Porygon 2 or the both Nidoran to be part of the game !",
				[Langue.DE] : "Die Verwendung von Sonderzeichen wird nun unterstützt, sodass Pokémon wie M. Mime, Porygon2, die beiden Nidoran und Typ:Null erraten werden können !",
				[Langue.JA] : "特殊文字の使用がサポートされるようになり、ポケモン（ポリゴン2、ニドラン♂・ニドラン♀、タイプ：ヌル）を当てられるようになりました。",
			},
		},
		{
			version: 9,
			notes: {
				[Langue.FR] : "Pokénigme est désormais disponible entièrement en japonais ! La langue d'affichage est désormais distincte de celle de jeu. Résolvez des énigmes dans d'autres langues tout en conservant l'interface en français.",
				[Langue.EN] : "Pokénigma available in Japanese !",
				[Langue.DE] : "Pokénigma erhältlich auf Japanisch !",
				[Langue.JA] : "ポケナゾが日本語で利用可能になりました！",
			},
		},
		{
			version: 8,
			notes: {
				[Langue.FR] : "Pokénigme est désormais disponible entièrement en anglais et en allemand !",
				[Langue.EN] : "Pokénigma available in English !",
				[Langue.DE] : "Pokénigma erhältlich auf Deutsch !",
			},
		},
		{
			version: 7,
			notes: {
				[Langue.FR] : "Mode de jeu ⏱ : le chronomètre est désormais mis en pause durant la validation des mots.",
			},
		},
		{
			version: 6,
			notes: {
				[Langue.FR] : "Le filtrage des générations est désormais possible (hors Pokémon du jour) !",
			},
		},
		{
			version: 5,
			notes: {
				[Langue.FR] : "L'utilisation du trait d'union est désormais supportée, rendant ainsi 24 Pokémon devinables de plus pour un total de 1015. Retrouvez entre autres Ho-Oh, Porygon-Z et les Pokémon paradoxes dans vos grilles !",
			},
		},
		{
			version: 4,
			notes: {
				[Langue.FR] : "Mode de jeu 🕵️:️ nombre de propositions préremplies désormais configurable (cinq par défaut).",
			},
		},
		{
			version: 3,
			notes: {
				[Langue.FR] : "Nouveau mode de jeu ⏱.️",
			},
		},
		{
			version: 2,
			notes: {
				[Langue.FR] : "Mise à jour de Pokénigme sur la base de la version actuelle de SUTOM.",
			},
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
			
			const noteTraduite = note.notes[config.langue_interface];

			if (noteTraduite) {
			    const itemLi = document.createElement("li");
			    itemLi.innerText = noteTraduite;
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