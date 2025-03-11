import { Langue } from "./langue";
import { ModeJeu } from "./modeJeu";

export default class PartieEnCours {
	public propositions: Array<string> | undefined;
	public datePartie: Date | undefined;
	public dateFinPartie: Date | undefined;
	public modeJeu: ModeJeu | undefined;
	public solution: string = "";
	public langue: Langue | undefined;
}
