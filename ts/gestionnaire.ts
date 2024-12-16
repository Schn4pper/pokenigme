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
import ReglesPanel from "./reglesPanel";
import ModeJeuPanel from "./modeJeuPanel";
import ConfigurationPanel from "./configurationPanel";
import AudioPanel from "./audioPanel";
import ThemeManager from "./themeManager";
import InstanceConfiguration from "./instanceConfiguration";
import LienHelper from "./lienHelper";
import NotesMaJPanel from "./notesMaJPanel";
import { ModeJeu } from "./entites/modeJeu";

export default class Gestionnaire {
  private _grille: Grille | null = null;
  private _input: Input | null = null;
  private readonly _reglesPanel: ReglesPanel;
  private readonly _modeJeuPanel: ModeJeuPanel;
  private readonly _finDePartiePanel: FinDePartiePanel;
  private readonly _configurationPanel: ConfigurationPanel;
  private readonly _propositions: Array<string>;
  private readonly _resultats: Array<Array<LettreResultat>>;
  private readonly _panelManager: PanelManager;
  private readonly _themeManager: ThemeManager;
  private readonly _audioPanel: AudioPanel;
  private readonly _notesMaJPanel: NotesMaJPanel;

  private _motATrouver: string = "";
  private _compositionMotATrouver: { [lettre: string]: number } = {};
  private _maxNbPropositions: number = 6;
  private _datePartieEnCours: Date;
  private _idPartieEnCours: string;
  private _dateFinPartie: Date | undefined;
  private _modeJeu: ModeJeu;
  private _stats: SauvegardeStats = SauvegardeStats.Default;
  private _config: Configuration = Configuration.Default;
  private _courseEnCours: boolean = false;
  private _secondesCourse: number  = 300;
  private _manchesCourse: number = 3;
  private _mancheEnCours : number = 1;
  
  public constructor() {
    this._config = Sauvegardeur.chargerConfig() ?? this._config;

    let partieEnCours = this.chargerPartieEnCours();

    this._idPartieEnCours = this.getIdPartie(partieEnCours);

    this._modeJeu = this._config.modeJeu ?? ModeJeu.DuJour;

    if (this._modeJeu === ModeJeu.DuJour) {
      let today = new Date();
      let datePartie = partieEnCours.datePartie ?? new Date();
      let utc1 = Date.UTC(datePartie.getFullYear(), datePartie.getMonth(), datePartie.getDate());
      let utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      let diffDays = Math.floor((utc2 - utc1)/(1000*3600*24));

      if (diffDays != 0) {
        partieEnCours = new PartieEnCours();
      }
    }
	
	if (this._modeJeu === ModeJeu.Course) {
        partieEnCours = new PartieEnCours();
		this._secondesCourse = this._config.secondesCourse ?? Configuration.Default.secondesCourse;
		this._manchesCourse = this._config.nbManches ?? Configuration.Default.nbManches;
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
    this._modeJeuPanel = new ModeJeuPanel(this._panelManager);
    this._finDePartiePanel = new FinDePartiePanel(this._datePartieEnCours, this._panelManager);
    this._configurationPanel = new ConfigurationPanel(this._panelManager, this._audioPanel, this._themeManager);
    this._notesMaJPanel = new NotesMaJPanel(this._panelManager);

	this.initialiserChoisirMot(partieEnCours);
      
    this.afficherReglesSiNecessaire();
  }

  private getIdPartie(partieEnCours: PartieEnCours) {
    const infoDansLocation = LienHelper.extraireInformation("p");

    if (infoDansLocation !== null) return infoDansLocation;

    if (partieEnCours.idPartie !== undefined) return partieEnCours.idPartie;

    return InstanceConfiguration.idPartieParDefaut;
  }

  private chargerPartieEnCours(): PartieEnCours {
	  
	//if (this._config.modeJeu == ModeJeu.Course) return new PartieEnCours();
	
    this._stats = Sauvegardeur.chargerSauvegardeStats() ?? SauvegardeStats.Default;

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
    // On regarde si c'est le même jour que la dernière partie dans les stats.
    // Si c'est identique, on ne sauvegarde pas
    if (
      this._stats.dernierePartie &&
      this._stats.dernierePartie.getFullYear() === this._datePartieEnCours.getFullYear() &&
      this._stats.dernierePartie.getMonth() === this._datePartieEnCours.getMonth() &&
      this._stats.dernierePartie.getDate() === this._datePartieEnCours.getDate()
    )
      return;

    this._stats.partiesJouees++;
    let estVictoire = this._resultats.some((resultat) => resultat.every((item) => item.statut === LettreStatut.BienPlace));
    if (estVictoire) {
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
    this._stats.dernierePartie = this._datePartieEnCours;

    Sauvegardeur.sauvegarderStats(this._stats);
  }

  private sauvegarderPartieEnCours(): void {
    Sauvegardeur.sauvegarderPartieEnCours(this._idPartieEnCours, this._datePartieEnCours, this._propositions, this._motATrouver, this._dateFinPartie, this._modeJeu);
  }

  private async choisirMot(modeJeu: ModeJeu, solution : string): Promise<string> {
    if (modeJeu == ModeJeu.DuJour || solution.trim() == "") {
      return Dictionnaire.getMot(modeJeu);
    }
    return solution;
  }
  
  private initialiserChoisirMot(partieEnCours : PartieEnCours) : void {
      this.choisirMot(this._modeJeu, partieEnCours.solution)
      .then(async (mot) => {
        this._motATrouver = mot;
        this._input = new Input(this, this._config, this._motATrouver.length);
        this._panelManager.setInput(this._input);
        this._grille = new Grille(this._motATrouver.length, this._maxNbPropositions, this._motATrouver[0], this._audioPanel);
        this._configurationPanel.setInput(this._input);
        this._compositionMotATrouver = this.decompose(this._motATrouver);
		
		switch(this._modeJeu) {
          case ModeJeu.Devinette:
            if (partieEnCours.idPartie !== undefined) {
              await this.chargerPropositions(partieEnCours.propositions);
            } else {
              Dictionnaire.getDevinette(mot).then(async(propositions) => await this.chargerPropositions(propositions));
            }
			break;
		  case ModeJeu.Course:
			let notificationCourse: HTMLElement = document.getElementById("notification-course") as HTMLElement;
		    if (!this._courseEnCours) {
 			NotificationMessage.decompterTemps(this._secondesCourse).then((estTermine) => {
				if (estTermine) {
					// Effectuer une action spécifique, par exemple afficher un panneau de fin de partie
					this._finDePartiePanel.genererResume(false, this._motATrouver, new Array(), 0);
					this._finDePartiePanel.afficher();  
					Sauvegardeur.purgerPartieEnCours();
					this._courseEnCours = false;
					this._propositions.length = 0;
					this.initialiserChoisirMot(new PartieEnCours());  
				}
			});
			notificationCourse.style.opacity = "1";
			notificationCourse.style.opacity = "1";
			this._courseEnCours = true;
			}
			notificationCourse.innerHTML = this._mancheEnCours + "/" + this._manchesCourse;
            await this.chargerPropositions(partieEnCours.propositions);
			break;
	      case ModeJeu.Desordre:
            await this._input.updateClavierAvecProposition(this.analyserMot(this._motATrouver, true), true);
		  default:
            await this.chargerPropositions(partieEnCours.propositions);
		}
      })
      .catch((raison) => NotificationMessage.ajouterNotification("Aucun Pokémon n'a été trouvé pour aujourd'hui."));
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
      NotificationMessage.ajouterNotification("Proposition trop courte.");
      return false;
    }

    if (mot.includes(".")) {
      NotificationMessage.ajouterNotification((await Dictionnaire.estMotMissingno(mot)) ? "Bien essayé ! ;-)" : "Proposition incomplète.");
      return false;
    }

    if (!(await Dictionnaire.estMotValide(mot))) {
      NotificationMessage.ajouterNotification((await Dictionnaire.estMotMissingno(mot)) ? "Bien essayé ! ;-)" : "Pokémon inconnu.");
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
      this._finDePartiePanel.genererResume(isBonneReponse, this._motATrouver, this._resultats, duree);
      if (!chargementPartie && (this._modeJeu == ModeJeu.DuJour || this._modeJeu == ModeJeu.Infini)) this.enregistrerPartieDansStats();
    }

    if (this._grille) {
      this._grille.validerMot(mot, resultats, isBonneReponse, chargementPartie, () => {
        if (this._input) {
          this._input.updateClavier(resultats);
          if (isBonneReponse || this._propositions.length === this._maxNbPropositions) {
			  if (this._modeJeu !== ModeJeu.Course || (isBonneReponse && this._mancheEnCours == this._manchesCourse)) {
				NotificationMessage.stopperTemps();
				this._finDePartiePanel.afficher();  
				Sauvegardeur.purgerPartieEnCours();
			  }
			  
            if (this._modeJeu !== ModeJeu.DuJour && this._modeJeu !== ModeJeu.Course) {
				Sauvegardeur.purgerPartieEnCours();
            }
			
			  if (this._modeJeu == ModeJeu.Course && ((this._mancheEnCours != this._manchesCourse) || (!isBonneReponse && this._mancheEnCours == this._manchesCourse))) {
				if (isBonneReponse) this._mancheEnCours++;
				this._propositions.length = 0;
				let partieEnCours = this.chargerPartieEnCours();
				partieEnCours.solution = "";
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

  public actualiserAffichage(mot: string): void {
    if (this._grille) this._grille.actualiserAffichage(Dictionnaire.nettoyerMot(mot));
  }

  private analyserMot(mot: string, markBienPlaceAsMalPlace: boolean): Array<LettreResultat> {
    let resultats = new Array<LettreResultat>();
    mot = mot.toUpperCase();

    let composition = { ...this._compositionMotATrouver };

    for (let position = 0; position < this._motATrouver.length; position++) {
      let lettreATrouve = this._motATrouver[position];
      let lettreProposee = mot[position];

      if (lettreATrouve === lettreProposee) {
        composition[lettreProposee]--;
      }
    }

    for (let position = 0; position < this._motATrouver.length; position++) {
      let lettreATrouve = this._motATrouver[position];
      let lettreProposee = mot[position];

      let resultat = new LettreResultat();
      resultat.lettre = lettreProposee;

      if (lettreATrouve === lettreProposee) {
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

}
