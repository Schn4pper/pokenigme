import { ModeJeu } from "./modeJeu";

export default class PartieEnCours {
  public propositions: Array<string> | undefined;
  public datePartie: Date | undefined;
  public dateFinPartie: Date | undefined;
  public idPartie: string | undefined;
  public modeJeu: ModeJeu | undefined;
  public solution: string = "";
}