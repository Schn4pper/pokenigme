import Gestionnaire from "./gestionnaire";
import LettreResultat from "./entites/lettreResultat";
import { LettreStatut } from "./entites/lettreStatut";
import { ClavierDisposition } from "./entites/clavierDisposition";
import Configuration from "./entites/configuration";
import Dictionnaire from "./dictionnaire";
import Sauvegardeur from "./sauvegardeur";
import NotificationMessage from "./notificationMessage";
import { Langue } from "./entites/langue";

export enum ContexteBloquage {
	ValidationMot,
	Panel,
}

export default class Input {
	private readonly _inputArea: HTMLElement;
	private readonly _gestionnaire: Gestionnaire;

	private _longueurMot: number;
	private _motSaisi: string;
	private _estBloque: Array<ContexteBloquage>;
	private _resultats: Array<Array<LettreResultat>>;
	private _haptiqueActive: boolean;
	private _langueJeu: Langue;
	private _cars_allemands: Record<string, string> = {
		"ß": "SS",
		"ü": "UE",
		"Ü": "UE",
		"ä": "AE",
		"Ä": "AE",
		"ö": "OE",
		"Ö": "OE"
	};

	public constructor(gestionnaire: Gestionnaire, configuration: Configuration, longueurMot: number) {
		this._inputArea = document.getElementById("input-area") as HTMLElement;
		this._longueurMot = longueurMot;
		this._gestionnaire = gestionnaire;
		this._motSaisi = "";
		this._estBloque = new Array<ContexteBloquage>();
		this._resultats = new Array<Array<LettreResultat>>();
		this._haptiqueActive = configuration.haptique ?? Configuration.Default.haptique;
		this._langueJeu = configuration.langue_jeu;
		
		this.ajouterEvenementClavierPhysique();

		this.dessinerClavier(configuration.disposition ?? Configuration.Default.disposition);
	}

	public dessinerClavier(disposition: ClavierDisposition): void {
		let clavier = this.getDisposition(disposition);
		this._inputArea.innerHTML = "";
		let ligneDiv;
		
		for (let ligne of clavier) {
			ligneDiv = document.createElement("div");
			ligneDiv.className = "input-ligne";

			for (let lettre of ligne) {
				let lettreDiv = document.createElement("div");
				lettreDiv.className = "input-lettre";
				switch (lettre) {
					case "_effacer":
						lettreDiv.dataset["lettre"] = lettre;
						lettreDiv.innerText = "⌫";
						lettreDiv.classList.add("input-lettre-effacer");
						this.ajouterFocus(lettreDiv);
						break;
					case "_entree":
						lettreDiv.innerText = "↲";
						lettreDiv.dataset["lettre"] = lettre;
						lettreDiv.classList.add("input-lettre-entree");
						this.ajouterFocus(lettreDiv);
						break;
					case "_vide":
						lettreDiv.classList.add("input-lettre-vide");
						break;
					case " ":
						lettreDiv.dataset["lettre"] = lettre;
						lettreDiv.id = "barre-espace";
						this.ajouterFocus(lettreDiv);
						break;
					default:
						lettreDiv.dataset["lettre"] = lettre;
						lettreDiv.innerText = lettre;
						this.ajouterFocus(lettreDiv);
				}
				ligneDiv.appendChild(lettreDiv);
			}

			this._inputArea.appendChild(ligneDiv);
		}
		
		if (ligneDiv !== undefined) ligneDiv.className = "input-ligne-last";

		this._haptiqueActive = Sauvegardeur.chargerConfig()?.haptique ?? Configuration.Default.haptique;
		this.ajouterEvenementClavierVirtuel();
		this.remettrePropositions();
	}

	private ajouterFocus(element: HTMLElement): void {
		element.setAttribute("tabindex", "0");
		element.setAttribute("role", "button");
	}

	private getDisposition(clavier: ClavierDisposition): Array<Array<string>> {
		switch (clavier) {
			case ClavierDisposition.Bépo:
				return [
					["B", "E", "P", "O", "W", "V", "D", "L", "J", "Z"],
					["A", "U", "I", "C", "T", "S", "R", "N", "M"],
					["_effacer", "Y", "X", "K", "Q", "G", "H", "F", "_entree"],
					["_vide", "_vide", "2","0","♀","♂"," ","-", ".",":","'","_vide", "_vide"],
				];
			case ClavierDisposition.Qwertz:
				return [
					["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
					["A", "S", "D", "F", "G", "H", "J", "K", "L"],
					["_vide", "Y", "X", "C", "V", "B", "N", "M", "_effacer", "_entree"],
					["_vide", "_vide", "2","0","♀","♂"," ","-", ".",":","'","_vide", "_vide"],

				];
			case ClavierDisposition.Qwerty:
				return [
					["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
					["A", "S", "D", "F", "G", "H", "J", "K", "L"],
					["_vide", "Z", "X", "C", "V", "B", "N", "M", "_effacer", "_entree", "_vide"],
					["_vide", "_vide", "2","0","♀","♂"," ","-", ".",":","'","_vide", "_vide"],
				];
			case ClavierDisposition.Azerty:
			default:
				return [
					["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
					["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
					["_vide","W", "X", "C", "V", "B", "N", "_effacer", "_entree", "_vide", ],
					["_vide", "_vide", "2","0","♀","♂"," ","-", ".",":","'","_vide", "_vide"],
				];
		}
	}

	private ajouterEvenementClavierVirtuel(): void {
		this._inputArea.querySelectorAll(".input-lettre").forEach((lettreDiv) => {
			lettreDiv.addEventListener("click", (event) => {
				event.stopPropagation();
				let div = event.currentTarget;
				if (!div) return;
				if (this._haptiqueActive && window.navigator.vibrate) window.navigator.vibrate(75);
				let lettre = (div as HTMLElement).dataset["lettre"];
				if (lettre === undefined) {
					return;
				} else if (lettre === "_effacer") {
					this.effacerLettre();
				} else if (lettre === "_entree") {
					this.validerMot();
				} else {
					this.saisirLettre(lettre);
				}
			});

			(lettreDiv as HTMLElement).addEventListener(
				"keypress",
				((event: KeyboardEvent) => {
					event.stopPropagation();
					let touche = event.key;

					if (touche === "Enter") {
						let lettre = (lettreDiv as HTMLElement).dataset["lettre"];
						if (lettre === undefined) {
							return;
						} else if (lettre === "_effacer") {
							this.effacerLettre();
						} else if (lettre === "_entree") {
							this.validerMot();
						} else {
							this.saisirLettre(lettre);
						}
					}
				}).bind(this)
			);
		});
	}

	private ajouterEvenementClavierPhysique(): void {
		document.addEventListener(
			"keypress",
			((event: KeyboardEvent) => {
				event.stopPropagation();
				let touche = event.key;

				if (touche === "Enter") {
					this.validerMot();
				} else if (touche in this._cars_allemands) {
					this.saisirLettre(this._cars_allemands[touche][0]);	
					this.saisirLettre(this._cars_allemands[touche][1]);
				} else if (/^[A-Z.\-20:'♀♂ ]$/.test(Dictionnaire.nettoyerMot(touche))) {
					this.saisirLettre(touche);
				}
			}).bind(this)
		);

		// Le retour arrière n'est détecté que par keydown
		document.addEventListener(
			"keydown",
			((event: KeyboardEvent) => {
				event.stopPropagation();
				let touche = event.key;

				if (touche === "Backspace") {
					event.preventDefault();
					this.effacerLettre();
				}
			}).bind(this)
		);
	}

	private effacerLettre(): void {
		if (this.estBloque()) return;
		if (this._motSaisi.length !== 0) {
			this._motSaisi = this._motSaisi.substring(0, this._motSaisi.length - 1);
		}
		this._gestionnaire.actualiserAffichage(this._motSaisi);
	}

	private async validerMot(): Promise<void> {
		if (this.estBloque()) return;
		this.bloquer(ContexteBloquage.ValidationMot);

		let mot = this._motSaisi;
		// Cas particulier : si le préremplissage donne un mot complet
		let statutJeu = this.siPreremplissageEstReponse();
		if (statutJeu.preRempli && statutJeu.mot && this._motSaisi.length == 0) {
			mot = statutJeu.mot;
		}
		let isMotValide = await this._gestionnaire.verifierMot(mot);
		if (isMotValide) {
			// Si le mot est valide, alors c'est la grille qui nous débloque
			this._motSaisi = "";
		} else this.debloquer(ContexteBloquage.ValidationMot);
	}

	private siPreremplissageEstReponse(): { preRempli: boolean; mot?: string } {
		let lettrePrerempli = new Array<{ preRempli: boolean; lettre?: string }>();
		for (let i = 0; i < this._longueurMot; i++) lettrePrerempli.push({ preRempli: false });

		for (let resultat of this._resultats) {
			for (let positionResultat in resultat) {
				let lettreResultat = resultat[positionResultat];
				if (lettreResultat.statut === LettreStatut.BienPlace) lettrePrerempli[positionResultat] = { preRempli: true, lettre: lettreResultat.lettre };
			}
		}

		if (lettrePrerempli.every((lettre) => lettre.preRempli)) {
			return { preRempli: true, mot: lettrePrerempli.reduce((mot, lettre) => mot + lettre.lettre, "") };
		}

		return { preRempli: false };
	}

	private saisirLettre(lettre: string): void {
		if (this.estBloque()) return;
		if (this._motSaisi.length >= this._longueurMot) return;
		this._motSaisi += lettre;
		this._gestionnaire.actualiserAffichage(this._motSaisi);
	}

	public bloquer(contexte: ContexteBloquage): void {
		if (!this._estBloque.includes(contexte)) {
			this._estBloque.push(contexte);
		}
		if (contexte == ContexteBloquage.ValidationMot) {
			NotificationMessage.mettreEnPauseTemps();
		}
	}

	public debloquer(contexte: ContexteBloquage): void {
		if (this._estBloque.includes(contexte)) {
			this._estBloque.splice(this._estBloque.indexOf(contexte), 1);
		}
		if (contexte == ContexteBloquage.ValidationMot) {
			NotificationMessage.reprendreTemps();
		}
	}

	private estBloque(): boolean {
		return this._estBloque.length > 0;
	}

	public updateClavier(resultats: Array<LettreResultat>): void {
		this._resultats.push(resultats); // On sauvegarde au cas où on doit redessiner tout le clavier
		this.updateClavierAvecProposition(resultats, false);
	}

	private remettrePropositions(): void {
		for (let resultat of this._resultats) {
			this.updateClavierAvecProposition(resultat, false);
		}
		
		let barreEspace = document.getElementById("barre-espace") as HTMLElement;
		barreEspace.innerText = Langue[this._langueJeu] + "·" + this._longueurMot;
	}

	public updateClavierAvecProposition(resultats: Array<LettreResultat>, markBienPlaceAsMalPlace: boolean): void {
		let statutLettres: { [lettre: string]: LettreStatut } = {};
		for (let resultat of resultats) {
			if (!statutLettres[resultat.lettre]) statutLettres[resultat.lettre] = resultat.statut;
			else {
				switch (resultat.statut) {
					case LettreStatut.BienPlace:
						statutLettres[resultat.lettre] = markBienPlaceAsMalPlace ? LettreStatut.MalPlace : LettreStatut.BienPlace;
						break;
					case LettreStatut.MalPlace:
						if (statutLettres[resultat.lettre] !== LettreStatut.BienPlace) {
							statutLettres[resultat.lettre] = LettreStatut.MalPlace;
						}
						break;
					default:
						break;
				}
			}
		}

		let touches = this._inputArea.querySelectorAll(".input-lettre");

		for (let lettre in statutLettres) {
			let statut = statutLettres[lettre];
			for (let numTouche = 0; numTouche < touches.length; numTouche++) {
				let touche = touches.item(numTouche) as HTMLElement;
				if (touche === undefined || touche === null) continue;
				if (touche.dataset["lettre"] === lettre) {
					switch (statut) {
						case LettreStatut.BienPlace:
							touche.className = "";
							touche.classList.add("input-lettre");
							touche.classList.add("lettre-bien-place");
							break;
						case LettreStatut.MalPlace:
							if (touche.classList.contains("lettre-bien-place")) break;
							touche.className = "";
							touche.classList.add("input-lettre");
							touche.classList.add("lettre-mal-place");
							break;
						default:
							if (touche.classList.contains("lettre-bien-place")) break;
							if (touche.classList.contains("lettre-mal-place")) break;
							touche.className = "";
							touche.classList.add("input-lettre");
							touche.classList.add("lettre-non-trouve");
							break;
					}
				}
			}
		}
	}
}
