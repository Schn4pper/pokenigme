import { Langue } from "./langue";
import { ModeJeu } from "./modeJeu";

export default class SauvegardePartie {
	propositions: Array<string> = [];
	datePartie: Date = new Date();
	dateFinPartie?: Date;
	modeJeu?: ModeJeu;
	solution: string = "";
	idSolution: number = 0;
	langue?: Langue;
	partage?: boolean;
	indice?: string = "";
}
