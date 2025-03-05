import AudioPanel from "./audioPanel";
import Configuration from "./entites/configuration";
import { Langue } from "./entites/langue";
import LettreResultat from "./entites/lettreResultat";
import { LettreStatut } from "./entites/lettreStatut";
import { i18n } from "./i18n/i18n";
import Sauvegardeur from "./sauvegardeur";

export default class Grille {
	private readonly _grille: HTMLElement;
	private readonly _propositions: Array<string>;
	private readonly _resultats: Array<Array<LettreResultat>>;
	private readonly _longueurMot: number;
	private readonly _maxPropositions: number;
	private readonly _audioPanel: AudioPanel;
	private readonly _langue: Langue;
	private _indice: Array<string | undefined>;
	private _motActuel: number;

	public constructor(longueurMot: number, maxPropositions: number, audioPanel: AudioPanel) {
		this._grille = document.getElementById("grille") as HTMLElement;
		this._audioPanel = audioPanel;
		this._langue = Sauvegardeur.chargerConfig()?.langue_interface ?? Configuration.Default.langue_interface;
		this._longueurMot = longueurMot;
		this._maxPropositions = maxPropositions;
		this._indice = new Array<string | undefined>(longueurMot);

		this._propositions = new Array<string>();
		this._resultats = new Array<Array<LettreResultat>>();
		this._motActuel = 0;
		this.afficherGrille();
	}

	private afficherGrille() {
		let table = document.createElement("table");
		for (let nbMot = 0; nbMot < this._maxPropositions; nbMot++) {
			let ligne = document.createElement("tr");
			let mot = this._propositions.length <= nbMot ? "" : this._propositions[nbMot];
			if (mot.length > 0) {
				ligne.setAttribute("role", "group");
				ligne.setAttribute("aria-label", `${i18n[this._langue].grille.mot} ${nbMot + 1} ${i18n[this._langue].grille.sur_6}`);
			}
			for (let nbLettre = 0; nbLettre < this._longueurMot; nbLettre++) {
				let cellule = document.createElement("td");
				let contenuCellule: string = "";
				if (nbMot < this._motActuel || (nbMot === this._motActuel && mot.length !== 0)) {
					if (mot.length <= nbLettre) {
						contenuCellule = ".";
						cellule.classList.add("cellule-lettre-pas-curseur");
					} else {
						contenuCellule = mot[nbLettre];
						cellule.classList.remove("cellule-lettre-pas-curseur");
					}
				} else if (nbMot === this._motActuel) {
					let lettreIndice = this._indice[nbLettre];
					if (lettreIndice !== undefined) {
						contenuCellule = lettreIndice;
						cellule.classList.remove("cellule-lettre-pas-curseur");
					} else {
						contenuCellule = ".";
						cellule.classList.add("cellule-lettre-pas-curseur");
					}
				}
				if (this._resultats.length > nbMot && this._resultats[nbMot][nbLettre]) {
					let resultat = this._resultats[nbMot][nbLettre];
					switch (resultat.statut) {
						case LettreStatut.BienPlace:
							cellule.classList.add("bien-place", "resultat");
							cellule.setAttribute("aria-label", `${i18n[this._langue].grille.lettre} ${resultat.lettre} ${i18n[this._langue].grille.bien_placee}`);
							break;
						case LettreStatut.MalPlace:
							cellule.classList.add("mal-place", "resultat");
							cellule.setAttribute("aria-label", `${i18n[this._langue].grille.lettre} ${resultat.lettre} ${i18n[this._langue].grille.mal_placee}`);
							break;
						default:
							cellule.classList.add("non-trouve", "resultat");
							cellule.setAttribute("aria-label", `${i18n[this._langue].grille.lettre} ${resultat.lettre} ${i18n[this._langue].grille.non_presente}`);
					}
				}
				cellule.innerText = contenuCellule;
				ligne.appendChild(cellule);
			}

			table.appendChild(ligne);
		}
		this._grille.innerHTML = "";
		this._grille.appendChild(table);
	}

	public actualiserAffichage(mot: string) {
		this.saisirMot(this._motActuel, mot);

		this.afficherGrille();
	}

	public validerMot(mot: string, resultats: Array<LettreResultat>, isBonneReponse: boolean, skipAnimation: boolean = false, endCallback?: () => void): void {
		this.saisirMot(this._motActuel, mot);
		this.mettreAJourIndice(resultats);
		this._resultats.push(resultats);

		if (!skipAnimation) this.animerResultats(resultats, endCallback);

		if (isBonneReponse) {
			this.bloquerGrille();
		} else {
			this._motActuel++;
		}

		if (skipAnimation) {
			this.afficherGrille();
			if (endCallback) endCallback();
		}
	}

	private animerResultats(resultats: Array<LettreResultat>, endCallback?: () => void): void {
		let table = this._grille.getElementsByTagName("table").item(0);
		if (table === null) {
			this.afficherGrille();
			if (endCallback) endCallback();
			return;
		}

		let ligne = table.getElementsByTagName("tr").item(this._motActuel);
		if (ligne === null) {
			this.afficherGrille();
			if (endCallback) endCallback();
			return;
		}

		let td = ligne.getElementsByTagName("td");
		this.animerLettre(td, resultats, 0, endCallback);
	}

	private animerLettre(td: HTMLCollectionOf<HTMLTableCellElement>, resultats: Array<LettreResultat>, numLettre: number, endCallback?: () => void): void {
		if (numLettre >= td.length) {
			this.afficherGrille();
			if (endCallback) endCallback();
			return;
		}
		let cellule = td[numLettre];
		let resultat = resultats[numLettre];
		cellule.innerHTML = resultat.lettre;
		let callback = (() => this.animerLettre(td, resultats, numLettre + 1, endCallback)).bind(this);
		switch (resultat.statut) {
			case LettreStatut.BienPlace:
				cellule.classList.add("bien-place", "resultat");
				cellule.setAttribute("aria-label", `${i18n[this._langue].grille.lettre} ${resultat.lettre} ${i18n[this._langue].grille.bien_placee}`);
				this._audioPanel.jouerSonLettreBienPlace(callback);
				break;
			case LettreStatut.MalPlace:
				cellule.classList.add("mal-place", "resultat");
				cellule.setAttribute("aria-label", `${i18n[this._langue].grille.lettre} ${resultat.lettre} ${i18n[this._langue].grille.mal_placee}`);
				this._audioPanel.jouerSonLettreMalPlace(callback);
				break;
			default:
				cellule.classList.add("non-trouve", "resultat");
				cellule.setAttribute("aria-label", `${i18n[this._langue].grille.lettre} ${resultat.lettre} ${i18n[this._langue].grille.non_presente}`);
				this._audioPanel.jouerSonLettreNonTrouve(callback);
		}
	}

	private mettreAJourIndice(resultats: Array<LettreResultat>): void {
		for (let i = 0; i < this._indice.length; i++) {
			if (!this._indice[i]) {
				this._indice[i] = resultats[i].statut === LettreStatut.BienPlace ? resultats[i].lettre : undefined;
			}
		}
	}

	private saisirMot(position: number, mot: string): void {
		if (this._propositions.length <= position) {
			this._propositions.push("");
		}
		this._propositions[position] = mot;
	}

	private bloquerGrille(): void { }
}
