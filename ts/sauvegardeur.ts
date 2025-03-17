import Configuration from "./entites/configuration";
import PartieEnCours from "./entites/partieEnCours";
import SauvegardePartie from "./entites/sauvegardePartie";
import SauvegardeStats from "./entites/sauvegardeStats";
import LienHelper from "./lienHelper";
import NotificationMessage from "./notificationMessage";
import { ModeJeu } from "./entites/modeJeu";
import { i18n } from "./i18n/i18n";
import { Langue } from "./entites/langue";

export default class Sauvegardeur {
	private static readonly _cleStats = "statistiques";
	private static readonly _clePartieEnCoursDuJour = "partieEnCoursDuJour";
	private static readonly _clePartieEnCoursInfini = "partieEnCoursInfini";
	private static readonly _clePartieEnCoursDevinette = "partieEnCoursDevinette";
	private static readonly _clePartieEnCoursDesordre = "partieEnCoursDesordre";
	private static readonly _clePartieEnCoursCourse = "partieEnCoursCourse";
	private static readonly _clePartieEnCoursPartage = "partieEnCoursPartage";

	private static readonly _cleConfiguration = "configuration";

	public static sauvegarderStats(stats: SauvegardeStats): void {
		localStorage.setItem(this._cleStats, JSON.stringify(stats));
	}

	public static chargerSauvegardeStats(): SauvegardeStats | undefined {
		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
		const contenuLocation = LienHelper.extraireInformation("s");

		if (contenuLocation) {
			const donneesDepuisLien = Sauvegardeur.chargerInformationDepuisLien(contenuLocation);
			window.location.hash = "";
			if (donneesDepuisLien) {
				NotificationMessage.ajouterNotification(i18n[config.langue_interface].sauvegardeur.stats_chargees);
				Sauvegardeur.sauvegarderStats(donneesDepuisLien);
				return donneesDepuisLien;
			}

			NotificationMessage.ajouterNotification(i18n[config.langue_interface].sauvegardeur.stats_ko);
		}

		const dataStats = localStorage.getItem(this._cleStats);
		if (!dataStats) return;

		let stats = JSON.parse(dataStats) as SauvegardeStats;
		return stats;
	}

	public static sauvegarderPartieEnCours(datePartie: Date, propositions: Array<string>, solution: string, dateFinPartie?: Date, modeJeu?: ModeJeu, langue?: Langue, partage?: boolean): void {
		let partieEnCours: SauvegardePartie = {
			propositions: propositions,
			datePartie,
			dateFinPartie,
			modeJeu,
			solution,
			langue,
			partage
		};

		let clePartie;

		if (partage) {
			localStorage.setItem(this._clePartieEnCoursPartage, JSON.stringify(partieEnCours));
			return;
		}		
				
		switch (modeJeu) {
			case ModeJeu.Infini:
				clePartie = this._clePartieEnCoursInfini;
				break;
			case ModeJeu.DuJour:
				clePartie = this._clePartieEnCoursDuJour;
				break;
			case ModeJeu.Devinette:
				clePartie = this._clePartieEnCoursDevinette;
				break;
			case ModeJeu.Desordre:
				clePartie = this._clePartieEnCoursDesordre;
				break;
			case ModeJeu.Course:
			default:
				clePartie = this._clePartieEnCoursCourse;
		}
			
		localStorage.setItem(clePartie + langue, JSON.stringify(partieEnCours));
	}

	public static chargerSauvegardePartieEnCours(): PartieEnCours | undefined {
		let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

		let dataPartieEnCours;
		
		if (localStorage.getItem(this._clePartieEnCoursPartage)) {
			dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursPartage);
		} else {
			switch (config.modeJeu) {
				case ModeJeu.Infini:
					dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursInfini + config.langue_jeu);
					break;
				case ModeJeu.DuJour:
					dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursDuJour + config.langue_jeu);
					break;
				case ModeJeu.Devinette:
					dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursDevinette + config.langue_jeu);
					break;
				case ModeJeu.Desordre:
					dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursDesordre + config.langue_jeu);
					break;
				case ModeJeu.Course:
				default:
					dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursCourse + config.langue_jeu);
			}
		}

		if (!dataPartieEnCours) return;

		let partieEnCours = JSON.parse(dataPartieEnCours) as SauvegardePartie;
		let aujourdhui = new Date();
		let datePartieEnCours = new Date(partieEnCours.datePartie);
		if (
			aujourdhui.getDate() !== datePartieEnCours.getDate() ||
			aujourdhui.getMonth() !== datePartieEnCours.getMonth() ||
			aujourdhui.getFullYear() !== datePartieEnCours.getFullYear()
		) {
			this.purgerPartieEnCours();
			return;
		}
		let dateFinPartie = partieEnCours.dateFinPartie === undefined ? undefined : new Date(partieEnCours.dateFinPartie);

		return {
			datePartie: datePartieEnCours,
			dateFinPartie: dateFinPartie,
			propositions: partieEnCours.propositions,
			modeJeu: partieEnCours.modeJeu,
			solution: partieEnCours.solution,
			langue: partieEnCours.langue,
			partage: partieEnCours.partage ?? false
		};
	}

	public static sauvegarderConfig(config: Configuration): void {
		localStorage.setItem(this._cleConfiguration, JSON.stringify(config));
	}

	public static chargerConfig(): Configuration | null {
		let dataConfig = localStorage.getItem(this._cleConfiguration);
		if (!dataConfig) return null;

		let config = JSON.parse(dataConfig) as Configuration;
		
		this.cleanConfig(config);
		
		return config;
	}

	public static purgerPartieEnCours(): void {
		if (localStorage.getItem(this._clePartieEnCoursPartage)) {
			localStorage.removeItem(this._clePartieEnCoursPartage);
		} else {
			let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

			switch (config.modeJeu) {
				case ModeJeu.Infini:
					localStorage.removeItem(this._clePartieEnCoursInfini + config.langue_jeu);
					break;
				case ModeJeu.DuJour:
					localStorage.removeItem(this._clePartieEnCoursDuJour + config.langue_jeu);
					break;
				case ModeJeu.Devinette:
					localStorage.removeItem(this._clePartieEnCoursDevinette + config.langue_jeu);
					break;
				case ModeJeu.Desordre:
					localStorage.removeItem(this._clePartieEnCoursDesordre + config.langue_jeu);
					break;
				case ModeJeu.Course:
				default:
					localStorage.removeItem(this._clePartieEnCoursCourse + config.langue_jeu);
			}
		}
	}
	
	public static purgerPartiePartage(): void {
		if (localStorage.getItem(this._clePartieEnCoursPartage)) {
			localStorage.removeItem(this._clePartieEnCoursPartage);
		}
	}

	public static purgerPartiesEnCours(duJour : boolean): void {
		let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

		localStorage.removeItem(this._clePartieEnCoursInfini + config.langue_jeu);
		localStorage.removeItem(this._clePartieEnCoursDevinette + config.langue_jeu);
		localStorage.removeItem(this._clePartieEnCoursDesordre + config.langue_jeu);
		localStorage.removeItem(this._clePartieEnCoursCourse + config.langue_jeu);
		localStorage.removeItem(this._clePartieEnCoursPartage);
		if (duJour) localStorage.removeItem(this._clePartieEnCoursDuJour + config.langue_jeu);
	}

	public static genererLien(): string {
		const stats = Sauvegardeur.chargerSauvegardeStats() ?? SauvegardeStats.Default;
		return [
			stats.repartition[1],
			stats.repartition[2],
			stats.repartition[3],
			stats.repartition[4],
			stats.repartition[5],
			stats.repartition[6],
			stats.repartition["-"],
			stats.lettresRepartitions.bienPlace,
			stats.lettresRepartitions.malPlace,
			stats.lettresRepartitions.nonTrouve,
		].join(",");
	}

	private static chargerInformationDepuisLien(contenu: string): SauvegardeStats | null {
		const [
			UnCoupString,
			DeuxCoupsString,
			TroisCoupsString,
			QuatreCoupsString,
			CinqCoupsString,
			SixCoupsString,
			PerduString,
			LettresBienPlaceesString,
			LettresMalPlaceesString,
			LettresNonTrouveString
		] = contenu.split(",");

		const UnCoup = parseInt(UnCoupString);
		const DeuxCoups = parseInt(DeuxCoupsString);
		const TroisCoups = parseInt(TroisCoupsString);
		const QuatreCoups = parseInt(QuatreCoupsString);
		const CinqCoups = parseInt(CinqCoupsString);
		const SixCoups = parseInt(SixCoupsString);
		const Perdu = parseInt(PerduString);
		const LettresBienPlacees = parseInt(LettresBienPlaceesString);
		const LettresMalPlacees = parseInt(LettresMalPlaceesString);
		const LettresNonTrouve = parseInt(LettresNonTrouveString);

		return {
			partiesJouees: UnCoup + DeuxCoups + TroisCoups + QuatreCoups + CinqCoups + SixCoups + Perdu,
			partiesGagnees: UnCoup + DeuxCoups + TroisCoups + QuatreCoups + CinqCoups + SixCoups,
			repartition: {
				1: UnCoup,
				2: DeuxCoups,
				3: TroisCoups,
				4: QuatreCoups,
				5: CinqCoups,
				6: SixCoups,
				"-": Perdu,
			},
			lettresRepartitions: {
				bienPlace: LettresBienPlacees,
				malPlace: LettresMalPlacees,
				nonTrouve: LettresNonTrouve,
			},
		};
	}
	
	
	public static chargerSauvegardePartiePartagee(): PartieEnCours | null {
		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
		const contenuLocation = LienHelper.extraireInformation("p");

		if (contenuLocation) {
			const partieDepuisLien = Sauvegardeur.chargerPartieDepuisLien(contenuLocation);
			window.location.hash = "";
			if (partieDepuisLien) {
				NotificationMessage.ajouterNotification(i18n[config.langue_interface].sauvegardeur.partie_partage_ok);
				return partieDepuisLien;
			}

			NotificationMessage.ajouterNotification(i18n[config.langue_interface].sauvegardeur.partie_partage_ko);
		}

		return null;
	}
	
	public static genererLienPartie(): string {
		const partie = this.chargerSauvegardePartieEnCours() ?? new PartieEnCours();
		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
	
		if (partie.propositions !== undefined && (partie.propositions.length == 6 || partie.propositions.includes(partie.solution))) {
			if (partie.modeJeu != ModeJeu.Devinette) {
				partie.propositions = new Array<string>;
			} else {
				for (let i = 6; i > config.nbIndices; i--) {
					partie.propositions.pop();
				}
			}
		}
				
		if (partie.modeJeu != ModeJeu.Desordre) {
			partie.modeJeu = ModeJeu.Devinette;
		}
		
		return [
			JSON.stringify(partie.propositions),
			partie.modeJeu,
			partie.solution,
			partie.langue,
		].join("|");
	}

	private static chargerPartieDepuisLien(partie: string): PartieEnCours | null {
		const [
			propositions,
			modeJeu,
			solution,
			langue,
		] = partie.split("|");
		
		var parsedPropositions: string[] = propositions ? JSON.parse(propositions) : [];
		var parsedModeJeu: ModeJeu = modeJeu ? Number(modeJeu) as ModeJeu : ModeJeu.Infini;
		var parsedLangue: Langue = langue ? Number(langue) as Langue : Langue.FR;

		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

		if (parsedModeJeu != ModeJeu.Desordre) {
			parsedModeJeu = ModeJeu.Devinette;
		} else {
			parsedModeJeu = ModeJeu.Desordre;
		}
				
		return {
			propositions: parsedPropositions,
			datePartie: new Date(),
			dateFinPartie: undefined,
			modeJeu: parsedModeJeu,
			solution: solution,
			langue: parsedLangue,
			partage: true
		};
	}

	private static cleanConfig(config: Configuration) {
		const langue = LienHelper.extraireInformationTexte("l");
		if (langue) {
			switch (langue) {
				case "FR":
					config.langue_interface = Langue.FR;
					config.langue_jeu = Langue.FR;
					break;
				case "DE":
					config.langue_interface = Langue.DE;
					config.langue_jeu = Langue.DE;
					break;
				case "JA":
					config.langue_interface = Langue.JA;
					config.langue_jeu = Langue.JA;
					break;
				case "EN":
				default:
					config.langue_interface = Langue.EN;
					config.langue_jeu = Langue.EN;
			}
			Sauvegardeur.sauvegarderConfig({
				...config,
				langue_interface: config.langue_interface,
				langue_jeu: config.langue_jeu
			});
		}
		
		if (config.langue_interface === undefined) {
			Sauvegardeur.sauvegarderConfig({
				...config,
				langue_interface: Configuration.Default.langue_interface
			});
			config.langue_interface = Configuration.Default.langue_interface;
		}
		
		if (config.langue_jeu === undefined) {
			Sauvegardeur.sauvegarderConfig({
				...config,
				langue_jeu: Configuration.Default.langue_jeu
			});
			config.langue_jeu = Configuration.Default.langue_jeu;
		}
				
		if (config.generations === undefined) {
			Sauvegardeur.sauvegarderConfig({
				...config,
				generations: Configuration.Default.generations
			});
			config.generations = Configuration.Default.generations;
		}
		
		if (config.nbIndices === undefined) {
			Sauvegardeur.sauvegarderConfig({
				...config,
				nbIndices: Configuration.Default.nbIndices
			});
			config.nbIndices = Configuration.Default.nbIndices;
		}
		
		if (config.nbManches === undefined) {
			Sauvegardeur.sauvegarderConfig({
				...config,
				nbManches: Configuration.Default.nbManches
			});
			config.nbManches = Configuration.Default.nbManches;
		}
		
		if (config.secondesCourse === undefined) {
			Sauvegardeur.sauvegarderConfig({
				...config,
				secondesCourse: Configuration.Default.secondesCourse
			});
			config.secondesCourse = Configuration.Default.secondesCourse;
		}
	}

}

