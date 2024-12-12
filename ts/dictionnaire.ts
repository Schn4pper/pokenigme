import InstanceConfiguration from "./instanceConfiguration";
import ListeMotsProposables from "./mots/listeMotsProposables";
import { ModeJeu } from "./entites/modeJeu";

export default class Dictionnaire {
  public constructor() {}

  public static async getMot(modeJeu: ModeJeu): Promise<string> {
    var choix;
    var today = new Date();

    if (modeJeu !== ModeJeu.DuJour) {
      choix = Math.floor(today.getTime()) % ListeMotsProposables.Dictionnaire.length;
    } else {
      let origine = InstanceConfiguration.dateOrigine;
      let utc1 = Date.UTC(origine.getFullYear(), origine.getMonth(), origine.getDate());
      let utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      let diffDays = Math.floor((utc2 - utc1)/(1000*3600*24));
      choix = diffDays%ListeMotsProposables.Dictionnaire.length;
    }
    return ListeMotsProposables.Dictionnaire[choix];
  }

  public static async getDevinette(solution: string): Promise<Array<string>> {
    var nbLettres = solution.length;
    var choix = new Array<string>();
    var choixPossibles = ListeMotsProposables.Dictionnaire.filter(pokemon => pokemon.length === nbLettres && pokemon !== solution);
    for (var i = 0; i < 5; i++) {
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
    return ListeMotsProposables.default.Dictionnaire.includes(mot) || ListeMotsProposables.default.EN.includes(mot) || ListeMotsProposables.default.DE.includes(mot);
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
}
