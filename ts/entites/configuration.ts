import { ClavierDisposition } from "./clavierDisposition";
import { Theme } from "./theme";
import { VolumeSon } from "./volumeSon";
import { Police } from "./police";
import { ModeJeu } from "./modeJeu";

export default class Configuration {
  public static Default: Configuration = {
    hasAudio: false,
    afficherRegles: true,
    afficherChrono: false,
    volumeSon: VolumeSon.Normal,
    disposition: ClavierDisposition.Azerty,
    theme: Theme.Sombre,
    haptique: false,
    changelog: 0,
    police: Police.Humaine,
    modeJeu: ModeJeu.DuJour
  };

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
}
