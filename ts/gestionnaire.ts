import Dictionnaire from "./dictionnaire";
import Grille from "./grille";
import Input, { ContexteBloquage } from "./input";
import LettreResultat from "./entites/lettreResultat";
import { LettreStatut } from "./entites/lettreStatut";
import FinDePartiePanel from "./finDePartiePanel";
import NotificationMessage from "./notificationMessage";
import SauvegardeStats from "./entites/sauvegardeStats";
import Sauvegardeur from "./sauvegardeur";
import Configuration from "./entites/configuration";
import PartieEnCours from "./entites/partieEnCours";
import PanelManager from "./panelManager";
import ModeJeuPanel from "./modeJeuPanel";
import ReglesPanel from "./reglesPanel";
import ConfigurationPanel from "./configurationPanel";
import AudioPanel from "./audioPanel";
import ThemeManager from "./themeManager";
import InstanceConfiguration from "./instanceConfiguration";
import NotesMaJPanel from "./notesMaJPanel";
import { ModeJeu } from "./entites/modeJeu";
import { i18n } from "./i18n/i18n";
import { Langue } from "./entites/langue";
import ListeMotsProposables from "./mots/listeMotsProposables";
import { Pokemon } from "./mots/listeMotsProposables";

export default class Gestionnaire {
	private _grille: Grille | null = null;
	private _input: Input | null = null;
	private readonly _reglesPanel: ReglesPanel;
	private readonly _finDePartiePanel: FinDePartiePanel;
	private readonly _propositions: Array<string>;
	private readonly _resultats: Array<Array<LettreResultat>>;
	private readonly _panelManager: PanelManager;
	private readonly _themeManager: ThemeManager;
	private readonly _audioPanel: AudioPanel;
	private readonly _notesMaJPanel: NotesMaJPanel;

	private _motATrouver: string = "";
	private _idATrouver: number = 0;
	private _compositionMotATrouver: { [lettre: string]: number } = {};
	private _maxNbPropositions: number = 6;
	private _datePartieEnCours: Date;
	private _dateFinPartie: Date | undefined;
	private _modeJeu: ModeJeu;
	private _langue: Langue;
	private _partage: boolean;
	private _indice: string = "";
	private _stats: SauvegardeStats = SauvegardeStats.Default;
	private _config: Configuration = Configuration.Default;
	private _courseEnCours: boolean = false;
	private _secondesCourse: number = 300;
	private _manchesCourse: number = 3;
	private _mancheEnCours: number = 1;

	public constructor() {
				
		this._config = Sauvegardeur.chargerConfig() ?? this._config;
			
		let configurationReglesBouton: HTMLElement = document.getElementById("configuration-regles-bouton") as HTMLElement;
		let configurationConfigBouton: HTMLElement = document.getElementById("configuration-config-bouton") as HTMLElement;
		let configurationStatsBouton: HTMLElement = document.getElementById("configuration-stats-bouton") as HTMLElement;
		let btnFermeture: HTMLElement = document.getElementById("panel-fenetre-bouton-fermeture") as HTMLElement;

		configurationReglesBouton.setAttribute("aria-label", i18n[this._config.langue_interface].gestionnaire.afficher_regles);
		configurationConfigBouton.setAttribute("aria-label", i18n[this._config.langue_interface].gestionnaire.ouvrir_conf);
		configurationStatsBouton.setAttribute("aria-label", i18n[this._config.langue_interface].gestionnaire.afficher_stats);
		btnFermeture.setAttribute("aria-label", i18n[this._config.langue_interface].gestionnaire.fermer_panneau);
		document.title = i18n[this._config.langue_interface].modeJeuPanel.pokenigme;
		
		let partieEnCours = this.chargerPartieEnCours();

		this._partage = partieEnCours.partage;
		this._modeJeu = this._partage && partieEnCours.modeJeu ? partieEnCours.modeJeu : this._config.modeJeu;
		this._langue = partieEnCours.langue ?? this._config.langue_jeu;
						
		if (this._modeJeu === ModeJeu.DuJour) {
			let today = new Date();
			let datePartie = partieEnCours.datePartie ?? new Date();
			let utc1 = Date.UTC(datePartie.getFullYear(), datePartie.getMonth(), datePartie.getDate());
			let utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
			let diffDays = Math.floor((utc2 - utc1) / (1000 * 3600 * 24));

			if (diffDays != 0) {
				partieEnCours = new PartieEnCours();
			}
		}

		if (this._modeJeu === ModeJeu.Course) {
			this._secondesCourse = this._config.secondesCourse;
			this._manchesCourse = this._config.nbManches;
			partieEnCours = new PartieEnCours();
		}

		this._datePartieEnCours = partieEnCours.datePartie ?? new Date();

		if (partieEnCours.dateFinPartie) {
			this._dateFinPartie = partieEnCours.dateFinPartie;
		}

		this._propositions = new Array<string>();
		this._resultats = new Array<Array<LettreResultat>>();
		this._audioPanel = new AudioPanel(this._config);
		this._panelManager = new PanelManager();
		this._themeManager = new ThemeManager(this._config);
		this._reglesPanel = new ReglesPanel(this._panelManager);
		new ModeJeuPanel(this._panelManager);
		this._finDePartiePanel = new FinDePartiePanel(this._datePartieEnCours, this._panelManager);
		new ConfigurationPanel(this._panelManager, this._audioPanel, this._themeManager);
		this._notesMaJPanel = new NotesMaJPanel(this._panelManager);
		
		this.initialiserChoisirMot(partieEnCours);

		this.afficherReglesSiNecessaire();
		
		if (this._partage) {
			let modeJeu = document.getElementById("configuration-mode-jeu-bouton") as HTMLElement;
			modeJeu.innerHTML = i18n[this._config.langue_interface].modeJeuPanel.pokenigme + " 🔗";
		}
	}

	private chargerPartieEnCours(): PartieEnCours {
		this._stats = Sauvegardeur.chargerSauvegardeStats() ?? SauvegardeStats.Default;
		
		let partiePartage = Sauvegardeur.chargerSauvegardePartiePartagee();
		if (partiePartage) return partiePartage;
		
		let sauvegardePartieEnCours = Sauvegardeur.chargerSauvegardePartieEnCours();
		if (sauvegardePartieEnCours) return sauvegardePartieEnCours;

		return new PartieEnCours();
	}

	private async chargerPropositions(propositions: Array<string> | undefined): Promise<void> {
		if (!propositions || propositions.length === 0) return;
		for (let mot of propositions) {
			if (this._input) this._input.bloquer(ContexteBloquage.ValidationMot);
			await this.verifierMot(mot, true);
		}
	}

	private enregistrerPartieDansStats(): void {
		let estVictoire = this._resultats.some((resultat) => resultat.every((item) => item.statut === LettreStatut.BienPlace));

		if (this._modeJeu != ModeJeu.DuJour && this._modeJeu != ModeJeu.Infini) {
			if (estVictoire) {
				this.enregistrerPokemonDansStats();
				Sauvegardeur.sauvegarderStats(this._stats);
			}
			return;
		}
		
		this._stats.partiesJouees++;
		if (estVictoire) {
			this.enregistrerPokemonDansStats();
			this._stats.partiesGagnees++;
			let nbEssais = this._resultats.length;
			if (nbEssais >= 1 && nbEssais <= 6) {
				this._stats.repartition[nbEssais as 1 | 2 | 3 | 4 | 5 | 6]++;
			}
		} else {
			this._stats.repartition["-"]++;
		}
		this._stats.lettresRepartitions.bienPlace += this._resultats.reduce((accumulateur: number, mot: Array<LettreResultat>) => {
			accumulateur += mot.filter((item) => item.statut == LettreStatut.BienPlace).length;
			return accumulateur;
		}, 0);
		this._stats.lettresRepartitions.malPlace += this._resultats.reduce((accumulateur: number, mot: Array<LettreResultat>) => {
			accumulateur += mot.filter((item) => item.statut == LettreStatut.MalPlace).length;
			return accumulateur;
		}, 0);
		this._stats.lettresRepartitions.nonTrouve += this._resultats.reduce((accumulateur: number, mot: Array<LettreResultat>) => {
			accumulateur += mot.filter((item) => item.statut == LettreStatut.NonTrouve).length;
			return accumulateur;
		}, 0);

		Sauvegardeur.sauvegarderStats(this._stats);
	}
	
	private enregistrerPokemonDansStats(): void {
		let noPokemon = Object.values(ListeMotsProposables.Pokedex)
		  .filter((pokemon: Pokemon) => pokemon.noms[this._langue] === this._motATrouver)
		  .map((p: Pokemon) => p.numero)[0];

		if (!this._stats.pokemon.includes(noPokemon)) {
			this._stats.pokemon.push(noPokemon);
		}
	}

	private sauvegarderPartieEnCours(): void {
		Sauvegardeur.sauvegarderPartieEnCours(this._datePartieEnCours, this._propositions, this._motATrouver, this._idATrouver, this._dateFinPartie, this._modeJeu, this._langue, this._partage, this._indice);
	}

	private async choisirMot(partieEnCours: PartieEnCours): Promise<Record<number, string>> {
		if (this._modeJeu == ModeJeu.DuJour || partieEnCours.solution.trim() == "") {
			return Dictionnaire.getMot(this._modeJeu);
		}
		return ({ [partieEnCours.idSolution]: partieEnCours.solution });
	}

	private initialiserChoisirMot(partieEnCours: PartieEnCours): void {
		this.choisirMot(partieEnCours)
			.then(async (mot) => {
				
				if (!mot) {
					this.afficherAucunPokemon();
					return;
				}
				
				this._motATrouver = Object.values(mot)[0];
				this._idATrouver = +Object.keys(mot)[0];
				this._input = new Input(this, this._config, this._motATrouver.length);
				this._panelManager.setInput(this._input);
				this._grille = new Grille(this._motATrouver.length, this._maxNbPropositions, this._audioPanel);
				this._compositionMotATrouver = this.decompose(this._motATrouver);
				this._indice = partieEnCours.indice == "" ? this.genererIndice(this._motATrouver) : partieEnCours.indice;

				this._input.debloquer(ContexteBloquage.ValidationMot);

				if (this._langue !== undefined) {
					let barreEspace = document.getElementById("barre-espace") as HTMLElement;
					barreEspace.innerText = Langue[this._langue] + "·" + this._motATrouver.length;
				}
				
				if (this._partage) {
					let modeJeu = document.getElementById("configuration-mode-jeu-bouton") as HTMLElement;
					modeJeu.innerHTML = i18n[this._config.langue_interface].modeJeuPanel.pokenigme + (partieEnCours.idSolution == 151 ? " 🚚" : " 🔗");
				}
				
				switch (this._modeJeu) {
					case ModeJeu.Devinette:
						// Sans ça, l'actualisation de la page génère des propositions différentes pour la même solution
						if (partieEnCours.datePartie !== undefined) {
							await this.chargerPropositions(partieEnCours.propositions);
						} else {
							Dictionnaire.getDevinette(this._motATrouver).then(async (propositions) => await this.chargerPropositions(propositions));
						}
						break;
					case ModeJeu.Course:
						let notificationCourse: HTMLElement = document.getElementById("notification-course") as HTMLElement;
						if (!this._courseEnCours) {
							NotificationMessage.decompterTemps(this._secondesCourse).then((estTermine) => {
								if (estTermine) {
									// Effectuer une action spécifique, par exemple afficher un panneau de fin de partie
									this._finDePartiePanel.genererResume(false, false, this._idATrouver, new Array(), 0, false, this._langue);
									this._finDePartiePanel.afficher();
									Sauvegardeur.purgerPartieEnCours();
									this._courseEnCours = false;
									this._propositions.length = 0;
									if (this._input) this._input.bloquer(ContexteBloquage.ValidationMot);
								}
							});
							notificationCourse.style.opacity = "1";
							this._courseEnCours = true;
						}
						notificationCourse.innerHTML = this._mancheEnCours + "/" + this._manchesCourse;
						await this.chargerPropositions(partieEnCours.propositions);
						break;
					case ModeJeu.Desordre:
						this._input.updateClavierAvecProposition(this.analyserMot(this._motATrouver, true), true);
					default:
						await this.chargerPropositions(partieEnCours.propositions);
				}
				this.afficherIndice();
				this.sauvegarderPartieEnCours();
			})
			.catch(() => this.afficherAucunPokemon() );
	}
	
	private afficherIndice() : void {
		let resultatIndice = this.analyserMot(this._indice, false);
		if (this._input) this._input.updateClavierAvecProposition(resultatIndice, false);
		if (this._grille) this._grille.validerMot(this._indice, resultatIndice, false, true, true);
	}

	private decompose(mot: string): { [lettre: string]: number } {
		let composition: { [lettre: string]: number } = {};
		for (let position = 0; position < mot.length; position++) {
			let lettre = mot[position];
			if (composition[lettre]) composition[lettre]++;
			else composition[lettre] = 1;
		}
		return composition;
	}

	public async verifierMot(mot: string, chargementPartie: boolean = false): Promise<boolean> {
		mot = Dictionnaire.nettoyerMot(mot);
		

		if (mot.length !== this._motATrouver.length) {
			for (let i = mot.length; i < this._motATrouver.length; i++) {
				mot += " ";
			}
		}

		if (!(await Dictionnaire.estMotValide(mot))) {
			NotificationMessage.ajouterNotification((await Dictionnaire.estMotMissingno(mot)) ? i18n[this._config.langue_interface].gestionnaire.bien_essaye : i18n[this._config.langue_interface].gestionnaire.inconnu, false);
			return false;
		}

		if (!this._datePartieEnCours) this._datePartieEnCours = new Date();
		let resultats = this.analyserMot(mot, false);
		let isBonneReponse = resultats.every((item) => item.statut === LettreStatut.BienPlace);
		this._propositions.push(mot);
		this._resultats.push(resultats);

		if (isBonneReponse || this._propositions.length === this._maxNbPropositions) {
			if (!this._dateFinPartie || this._modeJeu == ModeJeu.Course) this._dateFinPartie = new Date();
			let duree = this._dateFinPartie.getTime() - this._datePartieEnCours.getTime();
			this._finDePartiePanel.genererResume(isBonneReponse, !this._stats.pokemon.includes(this._idATrouver), this._idATrouver, this._resultats, duree, this._partage, this._langue);
			if (!chargementPartie) this.enregistrerPartieDansStats();
		}

		if (this._grille) {
			this._grille.validerMot(mot, resultats, isBonneReponse, chargementPartie, false, () => {
				if (this._input) {
					this._input.updateClavier(resultats);
					if (isBonneReponse || this._propositions.length === this._maxNbPropositions) {
						if (this._modeJeu !== ModeJeu.Course || (isBonneReponse && this._mancheEnCours == this._manchesCourse)) {
							this._finDePartiePanel.afficher();
						}

						if (this._modeJeu !== ModeJeu.DuJour && this._modeJeu !== ModeJeu.Course) {
							Sauvegardeur.purgerPartieEnCours();
						}

						if (this._modeJeu == ModeJeu.Course && ((this._mancheEnCours != this._manchesCourse) || (!isBonneReponse && this._mancheEnCours == this._manchesCourse))) {
							if (isBonneReponse) this._mancheEnCours++;
							this._propositions.length = 0;
							let partieEnCours = this.chargerPartieEnCours();
							partieEnCours.solution = "";
							partieEnCours.idSolution = 0;
							partieEnCours.indice = "";
							if (partieEnCours.propositions !== undefined) partieEnCours.propositions.length = 0;
							this.initialiserChoisirMot(partieEnCours);
						}
					} else {
						// La partie n'est pas finie, on débloque
						this._input.debloquer(ContexteBloquage.ValidationMot);
					}
				}
			});
		}

		this.sauvegarderPartieEnCours();

		return true;
	}

	private genererIndice(solution: string): string {
		let nbIndices = 4;

		if (solution.length < 4 || !this._config.afficherIndice || (this._modeJeu != ModeJeu.Infini && this._modeJeu != ModeJeu.Course)) {
			nbIndices = 0;
		} else if (solution.length < 7) {
			nbIndices = 1;
		} else if (solution.length < 9) {
			nbIndices = 2;
		} else if (solution.length < 11) {
			nbIndices = 3;
		}

		// Générer des lettres uniques à afficher
		const indices = new Set<number>();
		while (indices.size < nbIndices) {
		  const randomIndex = Math.floor(Math.random() * solution.length);
		  indices.add(randomIndex);
		}

		// Construire la nouvelle chaîne d'indices
		return solution.split('')
		  .map((char, index) => (indices.has(index) ? char : '·'))
		  .join('');
	}

	public actualiserAffichage(mot: string): void {
		if (this._grille) this._grille.actualiserAffichage(Dictionnaire.nettoyerMot(mot));
	}
	

	private analyserMot(mot: string, markBienPlaceAsMalPlace: boolean): Array<LettreResultat> {
		let resultats = new Array<LettreResultat>();

		let composition = { ...this._compositionMotATrouver };

		for (let position = 0; position < this._motATrouver.length; position++) {
			let lettreATrouve = this._motATrouver[position];
			let lettreProposee = mot[position];

			if (lettreATrouve === lettreProposee) {
				composition[lettreProposee]--;
			}
		}

		for (let position = 0; position < this._motATrouver.length; position++) {
			let lettreProposee = mot[position];
			let isSpace = lettreProposee == ' ';
			let isFillingSpace = isSpace && (position == 0 || position+1 == this._motATrouver.length || mot[position-1] == " " || mot[position+1] == " ");
			let lettreATrouver = this._motATrouver[position];
			
			let resultat = new LettreResultat();
			resultat.lettre = lettreProposee;

			if (isFillingSpace) {
				resultat.statut = LettreStatut.FillingSpace;
			} else if (lettreATrouver === lettreProposee) {
				resultat.statut = markBienPlaceAsMalPlace ? LettreStatut.MalPlace : LettreStatut.BienPlace;
			} else if (this._motATrouver.includes(lettreProposee)) {
				if (composition[lettreProposee] > 0) {
					resultat.statut = LettreStatut.MalPlace;
					composition[lettreProposee]--;
				} else {
					resultat.statut = LettreStatut.NonTrouve;
				}
			} else {
				resultat.statut = LettreStatut.NonTrouve;
			}

			resultats.push(resultat);
		}

		return resultats;
	}

	private afficherReglesSiNecessaire(): void {
		if (this._config.afficherRegles !== undefined && !this._config.afficherRegles) {
			if (this._config.changelog === undefined || this._config.changelog < InstanceConfiguration.derniereMiseAJour) {
				this._notesMaJPanel.afficher(this._config.changelog ?? 0);
			}
			return;
		}

		this._reglesPanel.afficher();
	}
	
	private afficherAucunPokemon(): void {
		NotificationMessage.ajouterNotification(i18n[this._config.langue_interface].gestionnaire.aucun_pokemon, true); 
		var jeu = document.getElementById("grille") as HTMLElement;
		jeu.innerHTML = "";
	}

}


