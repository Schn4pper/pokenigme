import CopieHelper from "./copieHelper";
import Configuration from "./entites/configuration";
import SauvegardeStats from "./entites/sauvegardeStats";
import { i18n } from "./i18n/i18n";
import Sauvegardeur from "./sauvegardeur";
import ListeMotsProposables from "./mots/listeMotsProposables";

export default class StatistiquesDisplayer {

	public static genererResumeTexte(texte: string): HTMLElement {
		var langue = Sauvegardeur.chargerConfig()?.langue_interface ?? Configuration.Default.langue_interface;

		const area = document.createElement("div");

		const titre = document.createElement("h3");
		titre.innerText = i18n[langue].statistiquesDisplayer.resume;

		titre.appendChild(CopieHelper.creerBoutonPartage("fin-de-partie-panel-resume-bouton", i18n[langue].statistiquesDisplayer.partager));
		area.appendChild(titre);

		const resumeArea = document.createElement("pre");
		resumeArea.id = "fin-de-partie-panel-resume";
		resumeArea.innerHTML = texte;
		area.appendChild(resumeArea);

		return area;
	}

	public static genererHtmlStats(stats: SauvegardeStats): HTMLElement {
		var langue = Sauvegardeur.chargerConfig()?.langue_interface ?? Configuration.Default.langue_interface;
		const statsArea = document.createElement("div");
		statsArea.className = "stats-area";

		const titre = document.createElement("h3");
		titre.innerText = i18n[langue].statistiquesDisplayer.stats;
		titre.appendChild(CopieHelper.creerBoutonPartage("fin-de-partie-panel-stats-bouton", i18n[langue].statistiquesDisplayer.partager));
		statsArea.appendChild(titre);

		const statsParties = document.createElement("div");
		statsParties.className = "stats-parties";

		const max = this.getMax(stats.repartition);

		statsParties.appendChild(this.creerBar("1", stats.repartition[1], max));
		statsParties.appendChild(this.creerBar("2", stats.repartition[2], max));
		statsParties.appendChild(this.creerBar("3", stats.repartition[3], max));
		statsParties.appendChild(this.creerBar("4", stats.repartition[4], max));
		statsParties.appendChild(this.creerBar("5", stats.repartition[5], max));
		statsParties.appendChild(this.creerBar("6", stats.repartition[6], max));
		statsParties.appendChild(this.creerBar("-", stats.repartition["-"], max));

		statsArea.appendChild(statsParties);

		const statsNumeriques = document.createElement("div");
		statsNumeriques.className = "stats-numeriques-area";

		statsNumeriques.appendChild(this.creerStatNumerique(i18n[langue].statistiquesDisplayer.pokemon, stats.pokemon.length, Object.keys(ListeMotsProposables.Pokedex).length));
		statsNumeriques.appendChild(this.creerStatNumerique(i18n[langue].statistiquesDisplayer.victoires, stats.partiesGagnees, stats.partiesJouees));
		statsNumeriques.appendChild(this.creerStatNumerique(i18n[langue].statistiquesDisplayer.moyenne, this.getMoyenne(stats.repartition)));
		statsNumeriques.appendChild(this.creerStatNumerique(i18n[langue].statistiquesDisplayer.lettres + ' <span class="emoji-carre-rouge">🟥</span>', stats.lettresRepartitions.bienPlace));
		statsNumeriques.appendChild(this.creerStatNumerique(i18n[langue].statistiquesDisplayer.lettres + ' <span class="emoji-cercle-jaune">🟡</span>', stats.lettresRepartitions.malPlace));
		statsNumeriques.appendChild(this.creerStatNumerique(i18n[langue].statistiquesDisplayer.lettres + ' <span class="emoji-carre-bleu">🟦</span>', stats.lettresRepartitions.nonTrouve));

		statsArea.appendChild(statsNumeriques);

		return statsArea;
	}

	private static creerBar(label: string, valeur: number, max: number): HTMLElement {
		const ligne = document.createElement("div");
		ligne.className = "stats-ligne";

		const labelDiv = document.createElement("div");
		labelDiv.className = "stats-label";
		labelDiv.innerText = label;
		ligne.appendChild(labelDiv);

		const barAreaDiv = document.createElement("div");
		barAreaDiv.className = "stats-bar-area";

		const barDiv = document.createElement("div");
		barDiv.className = "stats-bar";

		const longueurEnPourcent = Math.round((valeur / max) * 100);
		if (valeur === max) barDiv.classList.add("bar-max");

		barDiv.style.width = longueurEnPourcent === 0 ? "0px" : `calc(${longueurEnPourcent}% - 2px)`;
		barAreaDiv.appendChild(barDiv);
		ligne.appendChild(barAreaDiv);

		const valeurDiv = document.createElement("div");
		valeurDiv.className = "stats-valeur";
		valeurDiv.innerText = valeur.toString();
		ligne.appendChild(valeurDiv);

		return ligne;
	}

	private static creerStatNumerique(label: string, valeur: number, valeurSecondaire?: number): HTMLElement {
		const caseDiv = document.createElement("div");
		caseDiv.className = "stats-numerique-case";

		const valeurDiv = document.createElement("div");
		valeurDiv.className = "stats-numerique-case-valeur";
		valeurDiv.innerText = valeur.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
		caseDiv.appendChild(valeurDiv);

		if (valeurSecondaire !== undefined) {
			const secondaireDiv = document.createElement("div");
			secondaireDiv.className = "stats-numerique-case-secondaire";
			secondaireDiv.innerText = valeurSecondaire.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
			caseDiv.appendChild(secondaireDiv);
		}

		const labelDiv = document.createElement("div");
		labelDiv.className = "stats-numerique-case-label";
		labelDiv.innerHTML = label;
		caseDiv.appendChild(labelDiv);

		return caseDiv;
	}

	private static getMax(repartition: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; "-": number }): number {
		return Math.max(repartition[1], repartition[2], repartition[3], repartition[4], repartition[5], repartition[6], repartition["-"]);
	}

	private static getMoyenne(repartition: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; "-": number }): number {
		return (
			(repartition[1] * 1 + repartition[2] * 2 + repartition[3] * 3 + repartition[4] * 4 + repartition[5] * 5 + repartition[6] * 6 + repartition["-"] * 6) /
			(repartition[1] + repartition[2] + repartition[3] + repartition[4] + repartition[5] + repartition[6] + repartition["-"])
		);
	}

	public static genererResumeTexteStatistiques(stats: SauvegardeStats): string {
		var langue = Sauvegardeur.chargerConfig()?.langue_interface ?? Configuration.Default.langue_interface;

		const max = this.getMax(stats.repartition);

		return i18n[langue].statistiquesDisplayer.stats_pokenigme + `

${i18n[langue].statistiquesDisplayer.pokemon} : ${stats.pokemon.length}/${Object.keys(ListeMotsProposables.Pokedex).length} 
1/6 - ${this.genererBarTexte(stats.repartition[1], max)} ${stats.repartition[1]}
2/6 - ${this.genererBarTexte(stats.repartition[2], max)} ${stats.repartition[2]}
3/6 - ${this.genererBarTexte(stats.repartition[3], max)} ${stats.repartition[3]}
4/6 - ${this.genererBarTexte(stats.repartition[4], max)} ${stats.repartition[4]}
5/6 - ${this.genererBarTexte(stats.repartition[5], max)} ${stats.repartition[5]}
6/6 - ${this.genererBarTexte(stats.repartition[6], max)} ${stats.repartition[6]}
-/6 - ${this.genererBarTexte(stats.repartition["-"], max)} ${stats.repartition["-"]}
-/6 - ${this.genererBarTexte(stats.repartition["-"], max)} ${stats.repartition["-"]}

${i18n[langue].statistiquesDisplayer.moy} ${this.getMoyenne(stats.repartition).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
${stats.lettresRepartitions.bienPlace}🟥- ${stats.lettresRepartitions.malPlace}🟡- ${stats.lettresRepartitions.nonTrouve}🟦`;
	}

	private static genererBarTexte(valeur: number, max: number): string {
		if (valeur === 0) return "";

		const caractere = valeur === max ? "🟥" : "🟦";
		const longueurEnNbChars = Math.round((valeur / max) * 8);

		return longueurEnNbChars === 0 ? caractere : caractere.repeat(longueurEnNbChars);
	}

}