import CopieHelper from "./copieHelper";
import Configuration from "./entites/configuration";
import LettreResultat from "./entites/lettreResultat";
import { LettreStatut } from "./entites/lettreStatut";
import SauvegardeStats from "./entites/sauvegardeStats";
import InstanceConfiguration from "./instanceConfiguration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import StatistiquesDisplayer from "./statistiquesDisplayer";
import { ModeJeu } from "./entites/modeJeu";
import { i18n } from "./i18n/i18n";
import { Langue } from "./entites/langue";

export default class FinDePartiePanel {
	private readonly _datePartie: Date;
	private readonly _panelManager: PanelManager;
	private readonly _statsButton: HTMLElement;
	private readonly _config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

	private _resumeTexte: string = "";
	private _resumeTexteLegacy: string = "";
	private _motATrouver: string = "";
	private _estVictoire: boolean = false;
	private _partieEstFinie: boolean = false;

	public constructor(datePartie: Date, panelManager: PanelManager) {
		this._datePartie = new Date(datePartie);
		this._datePartie.setHours(0, 0, 0);
		this._panelManager = panelManager;
		this._statsButton = document.getElementById("configuration-stats-bouton") as HTMLElement;

		this._statsButton.addEventListener(
			"click",
			(() => {
				this.afficher();
			}).bind(this)
		);
	}

	public genererResume(estBonneReponse: boolean, motATrouver: string, resultats: Array<Array<LettreResultat>>, dureeMs: number): void {
		var nbManches = this._config.nbManches ?? Configuration.Default.nbManches;
		var secondesCourse = this._config.secondesCourse ?? Configuration.Default.secondesCourse;
		let dateGrille = this._datePartie.getTime();
		let origine = InstanceConfiguration.dateOrigine.getTime();
		this._motATrouver = motATrouver;
		this._estVictoire = estBonneReponse;
		this._partieEstFinie = true;
		let afficherChrono = (Sauvegardeur.chargerConfig() ?? Configuration.Default).afficherChrono;

		if (this._config.modeJeu == ModeJeu.Course) {
			let entete = "";
			if (estBonneReponse) {
				entete = i18n[this._config.langue_interface].finDePartiePanel.challenge_remporte + "<br/>"
				+ nbManches + " " + i18n[this._config.langue_interface].finDePartiePanel.challenge_remporte_pokemon_trouves + " " + this.genererTempsHumain(secondesCourse * 1000)
				+ (afficherChrono ? " (" + i18n[this._config.langue_interface].finDePartiePanel.temps + " " + this.genererTempsHumain(dureeMs) + ") " : " ")
				+ " (" + Langue[this._config.langue_jeu] + ")";
			} else {
				entete = i18n[this._config.langue_interface].finDePartiePanel.challenge_non_remporte + "<br/>"
				+ nbManches + " " + i18n[this._config.langue_interface].finDePartiePanel.challenge_non_remporte_pokemon + " " + this.genererTempsHumain(secondesCourse * 1000)
				+ " (" + Langue[this._config.langue_jeu] + ")";
			}
			this._resumeTexte = entete.replace("<br/>", " ");
			this._resumeTexteLegacy = entete;
			return;
		}

		let resultatsEmojis = resultats.map((mot) =>
			mot
				.map((resultat) => resultat.statut)
				.reduce((ligne, statut) => {
					switch (statut) {
						case LettreStatut.BienPlace:
							return ligne + "🟥";
						case LettreStatut.MalPlace:
							return ligne + "🟡";
						default:
							return ligne + "🟦";
					}
				}, "")
		);

		let resultatsEmojisLegacy = resultats.map((mot) =>
			mot
				.map((resultat) => resultat.statut)
				.reduce((ligne, statut) => {
					switch (statut) {
						case LettreStatut.BienPlace:
							return ligne + '<span class="emoji-carre-rouge">🟥</span>';
						case LettreStatut.MalPlace:
							return ligne + '<span class="emoji-cercle-jaune">🟡</span>';
						default:
							return ligne + '<span class="emoji-carre-bleu">🟦</span>';
					}
				}, "")
		);

		let numeroGrille;

		switch (this._config.modeJeu) {
			case ModeJeu.Infini:
				numeroGrille = "∞";
				break;
			case ModeJeu.DuJour:
				numeroGrille = "#" + (Math.round((dateGrille - origine) / (24 * 3600 * 1000)) + 1);
				break;
			case ModeJeu.Devinette:
				numeroGrille = "🕵️";
				break;
			case ModeJeu.Desordre:
				numeroGrille = "👀";
				break;
			default:
				numeroGrille = "∞";
		}

		const entete =
			i18n[this._config.langue_interface].finDePartiePanel.pokenigme + " " +
			numeroGrille +
			" (" + Langue[this._config.langue_jeu] + ") " +
			(estBonneReponse ? resultats.length : "-") +
			"/6" +
			(afficherChrono ? " " + i18n[this._config.langue_interface].finDePartiePanel.temps + " " + this.genererTempsHumain(dureeMs) : "") +
			"\n\n";
		this._resumeTexte = entete + resultatsEmojis.join("\n");
		this._resumeTexteLegacy = entete + resultatsEmojisLegacy.join("\n");
	}

	private genererTempsHumain(dureeMs: number): string {
		let duree = Math.floor(dureeMs / 1000);
		let retour = "";

		if (duree >= 3600) {
			retour += Math.floor(duree / 3600) + "h";
		}

		retour +=
			Math.floor((duree / 60) % 60)
				.toString()
				.padStart(2, "0") + ":";
		retour += Math.floor(duree % 60)
			.toString()
			.padStart(2, "0");

		return retour;
	}

	private attacherPartage(): void {
		const resumeBouton = document.getElementById("fin-de-partie-panel-resume-bouton") as HTMLElement;
		CopieHelper.attacheBoutonCopieLien(resumeBouton, this._resumeTexte + "\n\nhttps://fog.gy/pokenigme", i18n[this._config.langue_interface].finDePartiePanel.resume_copie);

		let rejouerInfiniBouton = document.getElementById("rejouer-infini-bouton") as HTMLElement;
		rejouerInfiniBouton.addEventListener("click", () => {
			var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
			config.modeJeu = ModeJeu.Infini;
			Sauvegardeur.sauvegarderConfig(config);
			window.location.reload();
		});

		let rejouerDevinetteBouton = document.getElementById("rejouer-devinette-bouton") as HTMLElement;
		rejouerDevinetteBouton.addEventListener("click", () => {
			var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
			config.modeJeu = ModeJeu.Devinette;
			Sauvegardeur.sauvegarderConfig(config);
			window.location.reload();
		});

		let rejouerDesordreBouton = document.getElementById("rejouer-desordre-bouton") as HTMLElement;
		rejouerDesordreBouton.addEventListener("click", () => {
			var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
			config.modeJeu = ModeJeu.Desordre;
			Sauvegardeur.sauvegarderConfig(config);
			window.location.reload();
		});

		let rejouerCourseBouton = document.getElementById("rejouer-course-bouton") as HTMLElement;
		rejouerCourseBouton.addEventListener("click", () => {
			var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
			config.modeJeu = ModeJeu.Course;
			Sauvegardeur.sauvegarderConfig(config);
			window.location.reload();
		});

	}

	public afficher(): void {
		let titre: string;
		let contenu: string = "";

		if (!this._partieEstFinie) {
			titre = i18n[this._config.langue_interface].finDePartiePanel.stats;
			contenu += '<p class="fin-de-partie-panel-phrase">' + i18n[this._config.langue_interface].finDePartiePanel.partie_non_finie + '</p>';
		} else {
			if (this._estVictoire) {
				titre = i18n[this._config.langue_interface].finDePartiePanel.felicitations;
				contenu += '<p class="fin-de-partie-panel-phrase">' + i18n[this._config.langue_interface].finDePartiePanel.bravo + '</p>';
			} else {
				titre = i18n[this._config.langue_interface].finDePartiePanel.perdu;
				contenu +=
					'<details class="fin-de-partie-panel-phrase"> \
			  <summary>' + i18n[this._config.langue_interface].finDePartiePanel.pokemon_etait + '</summary> ' +
					this._motATrouver.toUpperCase() +
					"<br /> \
			</details>";
			}

			contenu += StatistiquesDisplayer.genererResumeTexte(this._resumeTexteLegacy).outerHTML;
			contenu += '<p>' + i18n[this._config.langue_interface].finDePartiePanel.rejouer + '<br/><a href="#" id="rejouer-infini-bouton" class="rejouer-bouton">∞</a> <a href="#" id="rejouer-devinette-bouton" class="rejouer-bouton">🕵️</a> <a href="#" id="rejouer-desordre-bouton" class="rejouer-bouton">👀</a> <a href="#" id="rejouer-course-bouton" class="rejouer-bouton">⏱️</a></p>';
		}

		let stats = Sauvegardeur.chargerSauvegardeStats();
		if (stats) {
			contenu += StatistiquesDisplayer.genererHtmlStats(stats).outerHTML;
		}

		this._panelManager.setContenu(titre, contenu);
		this._panelManager.setClasses(["fin-de-partie-panel"]);
		if (this._partieEstFinie) this.attacherPartage();
		if (stats) this.attacherPartageStats(stats);
		this._panelManager.afficherPanel();
	}

	private attacherPartageStats(stats: SauvegardeStats): void {
		const resumeBouton = document.getElementById("fin-de-partie-panel-stats-bouton") as HTMLElement;

		let resumeTexte = StatistiquesDisplayer.genererResumeTexteStatistiques(stats);

		CopieHelper.attacheBoutonCopieLien(resumeBouton, resumeTexte + "\n\nhttps://fog.gy/pokenigme", i18n[this._config.langue_interface].finDePartiePanel.resume_copie);
	}

}
