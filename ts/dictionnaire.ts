import InstanceConfiguration from "./instanceConfiguration";
import ListeMotsProposables from "./mots/listeMotsProposables";
import { ModeJeu } from "./entites/modeJeu";
import Configuration from "./entites/configuration";
import Sauvegardeur from "./sauvegardeur";

export default class Dictionnaire {
  public constructor() {}

  public static async getMot(modeJeu: ModeJeu): Promise<string> {
    var choix;
    var today = new Date();

    if (modeJeu !== ModeJeu.DuJour) {
		
	const listeNoms = this.filtrerGenerations(false);

      choix = Math.floor(today.getTime()) % listeNoms.length;
	      return listeNoms[choix];
    } else {
      let origine = InstanceConfiguration.dateOrigine;
      let utc1 = Date.UTC(origine.getFullYear(), origine.getMonth(), origine.getDate());
      let utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      let diffDays = Math.floor((utc2 - utc1)/(1000*3600*24));
	  const listeNoms = this.filtrerGenerations(true);

      choix = diffDays%listeNoms.length;
      return listeNoms[choix];
    }
  }

  public static async getDevinette(solution: string): Promise<Array<string>> {
    let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

    var nbLettres = solution.length;
    var choix = new Array<string>();
	
	const listeNoms = this.filtrerGenerations(true);
	
	
    var choixPossibles = listeNoms.filter(pokemon => pokemon.length === nbLettres && pokemon !== solution);
    for (var i = 0; i < (config.nbIndices ?? Configuration.Default.nbIndices); i++) {
      let rand = Math.floor(Math.random() * choixPossibles.length);
      let ligne = choixPossibles[rand];
      choix.push(ligne);
      choixPossibles.splice(rand,1);
    }
    return choix;
  }

  public static async estMotValide(mot: string): Promise<boolean> {
    mot = this.nettoyerMot(mot);
    let ListeMotsProposables = await import("./mots/listeMotsProposables");
    return this.filtrerGenerations(true).includes(mot) || ListeMotsProposables.default.EN.includes(mot) || ListeMotsProposables.default.DE.includes(mot);
  }

 public static async estMotMissingno(mot: string): Promise<boolean> {
    return "MISSINGNO" === mot.toUpperCase() || "MISSINGNO." === mot.toUpperCase();
  }

  public static nettoyerMot(mot: string): string {
    return mot
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }
  
  private static filtrerGenerations(toutesGenerations: boolean) : string[] {
    let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
	const generationsVoulues = config.generations ?? Configuration.Default.generations;
	const listeNoms: string[] = Array.from(ListeMotsProposables.Dictionnaire.entries())
		.filter(([key, value]) => toutesGenerations || generationsVoulues.includes(value))
		.map(([key]) => key);
	return listeNoms;
  }
}
