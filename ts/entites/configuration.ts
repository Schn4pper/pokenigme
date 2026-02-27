import { ClavierDisposition } from "./clavierDisposition";
import { Theme } from "./theme";
import { VolumeSon } from "./volumeSon";
import { Police } from "./police";
import { ModeJeu } from "./modeJeu";
import { Langue } from "./langue";
import InstanceConfiguration from "../instanceConfiguration";

export default class Configuration {
	public static Default: Configuration = {
		langue_interface: Langue.FR,
		langue_jeu: Langue.FR,
		hasAudio: false,
		afficherRegles: true,
		afficherChrono: false,
		volumeSon: VolumeSon.Normal,
		disposition: ClavierDisposition.Azerty,
		theme: Theme.Sombre,
		haptique: false,
		changelog: InstanceConfiguration.derniereMiseAJour,
		police: Police.Humaine,
		modeJeu: ModeJeu.DuJour,
		generations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		longueur: [4, 5, 6, 7, 8, 9, 10, 11, 12],
		nbManches: 3,
		secondesCourse: 300,
		nbIndices: 5,
		afficherIndice: false
	};

	langue_interface: Langue = Langue.FR;
	langue_jeu: Langue = Langue.FR;
	hasAudio: boolean = false;
	afficherRegles: boolean = true;
	afficherChrono: boolean = false;
	volumeSon: VolumeSon = VolumeSon.Normal;
	disposition: ClavierDisposition = ClavierDisposition.Azerty;
	theme: Theme = Theme.Sombre;
	haptique: boolean = false;
	changelog: number = 0;
	police: Police = Police.Humaine;
	modeJeu: ModeJeu = ModeJeu.DuJour;
	generations: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	longueur: number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12];
	nbManches: number = 3;
	secondesCourse: number = 300;
	nbIndices: number = 5;
    afficherIndice: boolean = false;
}
