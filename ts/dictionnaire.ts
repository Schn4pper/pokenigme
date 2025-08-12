import InstanceConfiguration from "./instanceConfiguration";
import ListeMotsProposables from "./mots/listeMotsProposables";
import { ModeJeu } from "./entites/modeJeu";
import Configuration from "./entites/configuration";
import Sauvegardeur from "./sauvegardeur";

export default class Dictionnaire {
	public constructor() { }

	public static async getMot(modeJeu: ModeJeu): Promise<Record<number, string>> {
		var choix;
		var today = new Date();

		if (modeJeu !== ModeJeu.DuJour) {
			const listeNoms = this.filtrerGenerationsEtLongueur(false, false);
			choix = Math.floor(today.getTime()) % listeNoms.length;
			return listeNoms[choix];
		} else {
			let origine = InstanceConfiguration.dateOrigine;
			let utc1 = Date.UTC(origine.getFullYear(), origine.getMonth(), origine.getDate());
			let utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
			let diffDays = Math.floor((utc2 - utc1) / (1000 * 3600 * 24));
			const listeNoms = this.filtrerGenerationsEtLongueur(true, true);

			choix = diffDays % listeNoms.length;
			return listeNoms[choix];
		}
	}

	public static async getDevinette(solution: string): Promise<Array<string>> {
		let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

		var nbLettres = solution.length;
		var choix = new Array<string>();

		const listeNoms = this.filtrerGenerationsEtLongueur(true, true);

		var choixPossibles = listeNoms.filter(pokemon => {
			const pokemonNom = Object.values(pokemon)[0];
			return pokemonNom.length === nbLettres && pokemonNom !== solution;
		});

		for (var i = 0; i < (config.nbIndices ?? Configuration.Default.nbIndices); i++) {
			let rand = Math.floor(Math.random() * choixPossibles.length);
			let ligne = choixPossibles[rand];
			choix.push(Object.values(ligne)[0]);
			choixPossibles.splice(rand, 1);
		}

		return choix;
	}

	public static async estMotValide(mot: string): Promise<boolean> {
		mot = this.nettoyerMot(mot);
		return Object.values(ListeMotsProposables.Pokedex).flatMap(pokemon => Object.values(pokemon.noms)).includes(mot);
	}

	public static async estMotMissingno(mot: string): Promise<boolean> {
		return "MISSINGNO" === mot || "MISSINGNO." === mot;
	}

	public static nettoyerMot(mot: string): string {
		return mot
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toUpperCase();
	}

	private static filtrerGenerationsEtLongueur(toutesGenerations: boolean, toutesLongueurs: boolean): Record<number, string>[] {
		let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
		const generationsVoulues = config.generations ?? Configuration.Default.generations;
		const longueursVoulues = config.longueur ?? Configuration.Default.longueur;

		var propositions = ListeMotsProposables.Ordre[config.langue_jeu];

		return propositions
		  .map(id => ListeMotsProposables.Pokedex[id])
		  .filter(pokemon => pokemon && (toutesGenerations || generationsVoulues.includes(pokemon.generation)))
		  .filter(pokemon => pokemon && (toutesLongueurs || longueursVoulues.includes(pokemon.noms[config.langue_jeu].length)))
		  .map(pokemon => ({ [pokemon.numero]: pokemon.noms[config.langue_jeu] }));
	}
	
}
