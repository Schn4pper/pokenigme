import Configuration from "./entites/configuration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import { VolumeSon } from "./entites/volumeSon";
import AudioPanel from "./audioPanel";
import { ClavierDisposition } from "./entites/clavierDisposition";
import Input from "./input";
import ThemeManager from "./themeManager";
import { Theme } from "./entites/theme";
import CopieHelper from "./copieHelper";
import { Police } from "./entites/police";
import { i18n } from "./i18n/i18n";
import { Langue } from "./entites/langue";

export default class ConfigurationPanel {
	private readonly _panelManager: PanelManager;
	private readonly _audioPanel: AudioPanel;
	private readonly _themeManager: ThemeManager;
	private readonly _configBouton: HTMLElement;

	private _input: Input | undefined;

	public constructor(panelManager: PanelManager, audioPanel: AudioPanel, themeManager: ThemeManager) {
		this._panelManager = panelManager;
		this._audioPanel = audioPanel;
		this._themeManager = themeManager;

		this._configBouton = document.getElementById("configuration-config-bouton") as HTMLElement;

		this._configBouton.addEventListener(
			"click",
			(() => {
				this.afficher();
			}).bind(this)
		);
	}

	public afficher(): void {
		let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
		let titre = i18n[config.langue_interface].configurationPanel.configuration;
		let contenu = document.createElement("div");
		contenu.id = "config-liste";

		contenu.appendChild(
			this.genererConfigItem(
				"langue-interface",
				i18n[config.langue_interface].configurationPanel.langue_interface,
				[
					{ value: Langue.FR.toString(), label: i18n[config.langue_interface].configurationPanel.francais },
					{ value: Langue.DE.toString(), label: i18n[config.langue_interface].configurationPanel.allemand },
					{ value: Langue.EN.toString(), label: i18n[config.langue_interface].configurationPanel.anglais },
					{ value: Langue.JA.toString(), label: i18n[config.langue_interface].configurationPanel.japonais },
				],
				(config.langue_interface ?? Configuration.Default.langue_interface).toString(),
				(event: Event) => {
					event.stopPropagation();
					let langue: Langue = parseInt((event.target as HTMLSelectElement).value);

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						langue_interface: langue,
					});
					window.location.reload();
				}
			)
		);
		
		contenu.appendChild(
			this.genererConfigItem(
				"langue-jeu",
				i18n[config.langue_interface].configurationPanel.langue_jeu,
				[
					{ value: Langue.FR.toString(), label: i18n[config.langue_interface].configurationPanel.francais },
					{ value: Langue.DE.toString(), label: i18n[config.langue_interface].configurationPanel.allemand },
					{ value: Langue.EN.toString(), label: i18n[config.langue_interface].configurationPanel.anglais },
					{ value: Langue.JA.toString(), label: i18n[config.langue_interface].configurationPanel.japonais_romaji },
				],
				(config.langue_jeu ?? Configuration.Default.langue_jeu).toString(),
				(event: Event) => {
					event.stopPropagation();
					let langue: Langue = parseInt((event.target as HTMLSelectElement).value);

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						langue_jeu: langue,
					});
					window.location.reload();
				}
			)
		);
		
		contenu.appendChild(
			this.genererConfigItem(
				"volume",
				i18n[config.langue_interface].configurationPanel.volume,
				[
					{ value: VolumeSon.Faible.toString(), label: i18n[config.langue_interface].configurationPanel.volume_faible },
					{ value: VolumeSon.Normal.toString(), label: i18n[config.langue_interface].configurationPanel.volume_normal },
					{ value: VolumeSon.Fort.toString(), label: i18n[config.langue_interface].configurationPanel.volume_fort },
				],
				(config.volumeSon ?? Configuration.Default.volumeSon).toString(),
				(event: Event) => {
					event.stopPropagation();
					let volumeSon: VolumeSon = parseInt((event.target as HTMLSelectElement).value);

					this._audioPanel.setVolumeSonore(volumeSon);

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						volumeSon,
					});
				}
			)
		);

		contenu.appendChild(
			this.genererConfigItem(
				"disposition-clavier",
				i18n[config.langue_interface].configurationPanel.clavier,
				[
					{ value: ClavierDisposition.Azerty.toString(), label: "AZERTY" },
					{ value: ClavierDisposition.Qwerty.toString(), label: "QWERTY" },
					{ value: ClavierDisposition.Qwertz.toString(), label: "QWERTZ" },
					{ value: ClavierDisposition.Bépo.toString(), label: "BÉPO" },
				],
				(config.disposition ?? Configuration.Default.disposition).toString(),
				(event: Event) => {
					event.stopPropagation();
					let disposition: ClavierDisposition = parseInt((event.target as HTMLSelectElement).value);

					if (this._input) this._input.dessinerClavier(disposition);

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						disposition,
					});
				}
			)
		);

		contenu.appendChild(
			this.genererConfigItem(
				"police-ecriture",
				i18n[config.langue_interface].configurationPanel.police,
				[
					{ value: Police.Humaine.toString(), label: i18n[config.langue_interface].configurationPanel.police_humaine },
					{ value: Police.Zarbi.toString(), label: i18n[config.langue_interface].configurationPanel.police_zarbi }
				],
				(config.police ?? Configuration.Default.police).toString(),
				(event: Event) => {
					event.stopPropagation();
					let police: Police = parseInt((event.target as HTMLSelectElement).value);

					this._themeManager.changerPolice(police);

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						police,
					});
				}
			)
		);

		contenu.appendChild(
			this.genererConfigItem(
				"theme",
				i18n[config.langue_interface].configurationPanel.theme,
				[
					{ value: Theme.Sombre.toString(), label: i18n[config.langue_interface].configurationPanel.theme_sombre },
					{ value: Theme.Clair.toString(), label: i18n[config.langue_interface].configurationPanel.theme_clair },
					{ value: Theme.SombreAccessible.toString(), label: i18n[config.langue_interface].configurationPanel.theme_sombre_accessible },
					{ value: Theme.ClairAccessible.toString(), label: i18n[config.langue_interface].configurationPanel.theme_clair_accessible },
				],
				(config.theme ?? Configuration.Default.theme).toString(),
				(event: Event) => {
					event.stopPropagation();
					let theme: Theme = parseInt((event.target as HTMLSelectElement).value);

					this._themeManager.changerCouleur(theme);

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						theme,
					});
				}
			)
		);

		contenu.appendChild(
			this.genererConfigItem(
				"afficher-temps",
				i18n[config.langue_interface].configurationPanel.temps,
				[
					{ value: false.toString(), label: i18n[config.langue_interface].configurationPanel.non },
					{ value: true.toString(), label: i18n[config.langue_interface].configurationPanel.oui },
				],
				(config.afficherChrono ?? Configuration.Default.afficherChrono).toString(),
				(event: Event) => {
					event.stopPropagation();
					let afficherChrono = (event.target as HTMLSelectElement).value === true.toString();

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						afficherChrono,
					});
				}
			)
		);

		contenu.appendChild(
			this.genererConfigItem(
				"haptique",
				i18n[config.langue_interface].configurationPanel.retour_haptique,
				[
					{ value: false.toString(), label: i18n[config.langue_interface].configurationPanel.non },
					{ value: true.toString(), label: i18n[config.langue_interface].configurationPanel.oui },
				],
				(config.haptique ?? Configuration.Default.haptique).toString(),
				(event: Event) => {
					event.stopPropagation();
					let haptique = (event.target as HTMLSelectElement).value === true.toString();

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						haptique,
					});

					// On redessine le clavier pour la prise en compte de l'option
					if (this._input) this._input.dessinerClavier(config.disposition ?? Configuration.Default.disposition);
				}
			)
		);

		let div = document.createElement("div");
		div.className = "config-item";

		let label = document.createElement("label");
		label.innerText = i18n[config.langue_interface].configurationPanel.generations;
		label.setAttribute("for", "config-generations");
		div.appendChild(label);

		let divGen = document.createElement("div");
		divGen.id = "config-generations-div";
		div.appendChild(divGen);
		
		if (config.generations === undefined) {
			Sauvegardeur.sauvegarderConfig({
				...Sauvegardeur.chargerConfig() ?? Configuration.Default,
				generations: Configuration.Default.generations
			});
			config.generations = Configuration.Default.generations;
		}
		
		for (let i = 1; i <= 9; i++) {
			let gen = document.createElement("label");
			gen.className = "generation-label";
			gen.innerText = `${i}`;
			gen.setAttribute("for", "config-generations");
			gen.style.textDecoration = config.generations.includes(i) ? "underline" : "line-through";
			divGen.appendChild(gen);
			gen.addEventListener("click", (event: Event) => {
				event.stopPropagation();
				const config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
				if ((event.target as HTMLLabelElement).style.textDecoration === "line-through") {
					(event.target as HTMLLabelElement).style.textDecoration = "underline";
					Sauvegardeur.sauvegarderConfig({
						...Sauvegardeur.chargerConfig() ?? Configuration.Default,
						generations: [...(config.generations || []), i]
					});
				} else if (config.generations.length > 1) {
					(event.target as HTMLLabelElement).style.textDecoration = "line-through";
					Sauvegardeur.sauvegarderConfig({
						...Sauvegardeur.chargerConfig() ?? Configuration.Default,
						generations: config.generations?.filter(num => num !== i) || []
					});
				}
				Sauvegardeur.purgerPartiesEnCours(false);
			});
		}

		contenu.appendChild(div);

		contenu.appendChild(
			this.genererConfigItem(
				"detective-propositions-preremplies",
				i18n[config.langue_interface].configurationPanel.propositions,
				[
					{ value: "1", label: "1" },
					{ value: "2", label: "2" },
					{ value: "3", label: "3" },
					{ value: "4", label: "4" },
					{ value: "5", label: "5" }
				],
				config.nbIndices.toString(),
				(event: Event) => {
					event.stopPropagation();
					let nbIndices = (event.target as HTMLInputElement).value;

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						nbIndices: Number(nbIndices)
					});
				}
			)
		);

		contenu.appendChild(
			this.genererConfigSaisieNumerique(
				"course-pokemon-a-trouver",
				i18n[config.langue_interface].configurationPanel.a_trouver,
				config.nbManches ?? Configuration.Default.nbManches,
				'',
				(event: Event) => {
					event.stopPropagation();
					let nbManches = (event.target as HTMLInputElement).value;

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						nbManches: Number(nbManches)
					});
				}
			)
		);

		contenu.appendChild(
			this.genererConfigSaisieNumerique(
				"course-temps-imparti",
				i18n[config.langue_interface].configurationPanel.temps_imparti,
				config.secondesCourse ?? Configuration.Default.secondesCourse,
				'',
				(event: Event) => {
					event.stopPropagation();
					let secondesCourse = (event.target as HTMLInputElement).value;

					Sauvegardeur.sauvegarderConfig({
						...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
						secondesCourse: Number(secondesCourse)
					});
				}
			)
		);

		if (Sauvegardeur.chargerSauvegardeStats()) contenu.appendChild(this.genererZoneExportSauvegarde());

		this._panelManager.setContenuHtmlElement(titre, contenu);
		this._panelManager.setClasses(["config-panel"]);
		this._panelManager.afficherPanel();
	}

	private genererConfigItem(
		idConfig: string,
		nomConfig: string,
		options: Array<{ value: string; label: string }>,
		valeurChoisie: string,
		onChange?: (event: Event) => void
	): HTMLElement {
		let div = document.createElement("div");
		div.className = "config-item";

		let label = document.createElement("label");
		label.innerText = nomConfig;
		label.setAttribute("for", `config-${idConfig}`);
		div.appendChild(label);

		let select = document.createElement("select");
		select.id = `config-${idConfig}`;
		for (let optionItem of options) {
			let optionElement = document.createElement("option");
			optionElement.value = optionItem.value;
			optionElement.innerText = optionItem.label;
			if (optionItem.value === valeurChoisie) optionElement.selected = true;
			select.appendChild(optionElement);
		}
		if (onChange !== undefined) select.addEventListener("change", onChange);
		div.appendChild(select);

		return div;
	}

	private genererConfigSaisieNumerique(
		idConfig: string,
		nomConfig: string,
		valeurChoisie: number,
		maxVal: string,
		onChange?: (event: Event) => void
	): HTMLElement {
		let div = document.createElement("div");
		div.className = "config-item";

		let label = document.createElement("label");
		label.innerText = nomConfig;
		label.setAttribute("for", `config-${idConfig}`);
		div.appendChild(label);

		const input = document.createElement("input");
		input.id = `config-${idConfig}`;
		input.type = "number";
		input.min = "1";
		input.step = "1";
		if (maxVal !== '') {
			input.max = maxVal;
		}
		input.value = valeurChoisie.toString();
		input.oninput = () => {
			if (Number(input.value) < 1) {
				input.value = "1"; // Forcer une valeur minimale de 1
			}
		};

		if (onChange !== undefined) input.addEventListener("change", onChange);
		div.appendChild(input);

		return div;
	}

	private genererZoneExportSauvegarde(): HTMLElement {
		let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
		let div = document.createElement("div");
		div.id = "config-sauvegarde-area";
		
		const titreSection = document.createElement("h3");
		titreSection.innerText = i18n[config.langue_interface].configurationPanel.exporter_stats;
		div.appendChild(titreSection);

		const explication = document.createElement("p");
		explication.innerText = i18n[config.langue_interface].configurationPanel.exporter_stats_etapes;
		div.appendChild(explication);

		const listeEtape = document.createElement("ol");

		const etape1 = document.createElement("li");

		const etape1Texte = document.createElement("p");
		etape1Texte.innerText = i18n[config.langue_interface].configurationPanel.exporter_stats_lien;
		etape1.appendChild(etape1Texte);

		const etape1Input = document.createElement("input");
		const contenuLien = Sauvegardeur.genererLien();
		const lien = window.location.origin + window.location.pathname + "#" + btoa(unescape(encodeURIComponent("s=" + contenuLien)));
		etape1Input.value = lien;
		etape1Input.readOnly = true;
		etape1.appendChild(etape1Input);

		const etape1Bouton = CopieHelper.creerBoutonPartage("config-sauvegarde-bouton");
		CopieHelper.attacheBoutonCopieLien(etape1Bouton, lien, i18n[config.langue_interface].configurationPanel.lien_copie);
		etape1.appendChild(etape1Bouton);

		listeEtape.appendChild(etape1);

		const etape2 = document.createElement("li");
		etape2.innerText = i18n[config.langue_interface].configurationPanel.envoi_lien;
		listeEtape.appendChild(etape2);

		const etape3 = document.createElement("li");
		etape3.innerText = i18n[config.langue_interface].configurationPanel.ouvrir_lien;
		listeEtape.appendChild(etape3);

		div.appendChild(listeEtape);

		return div;
	}

	public setInput(input: Input): void {
		this._input = input;
	}
}
