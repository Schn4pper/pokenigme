import { Langue } from "./langue";
import { ModeJeu } from "./modeJeu";

export default class SauvegardePartie {
	propositions: Array<string> = [];
	datePartie: Date = new Date();
	dateFinPartie?: Date;
	idPartie?: string;
	modeJeu?: ModeJeu;
	solution: string = "";
	langue?: Langue;
}
