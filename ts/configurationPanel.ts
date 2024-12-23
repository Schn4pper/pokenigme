import Configuration from "./entites/configuration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import { VolumeSon } from "./entites/volumeSon";
import AudioPanel from "./audioPanel";
import { ClavierDisposition } from "./entites/clavierDisposition";
import Input from "./input";
import ThemeManager from "./themeManager";
import { Theme } from "./entites/theme";
import CopieHelper from "./copieHelper";
import { Police } from "./entites/police";
import { ModeJeu } from "./entites/modeJeu";

export default class ConfigurationPanel {
  private readonly _panelManager: PanelManager;
  private readonly _audioPanel: AudioPanel;
  private readonly _themeManager: ThemeManager;

  private readonly _configBouton: HTMLElement;

  private _input: Input | undefined;

  public constructor(panelManager: PanelManager, audioPanel: AudioPanel, themeManager: ThemeManager) {
    this._panelManager = panelManager;
    this._audioPanel = audioPanel;
    this._themeManager = themeManager;

    this._configBouton = document.getElementById("configuration-config-bouton") as HTMLElement;

    this._configBouton.addEventListener(
      "click",
      (() => {
        this.afficher();
      }).bind(this)
    );
  }

  public afficher(): void {
    let titre = "Configuration";
    let contenu = document.createElement("div");
    contenu.id = "config-liste";
    let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;
    contenu.appendChild(
      this.genererConfigItem(
        "Volume du son (si activé)",
        [
          { value: VolumeSon.Faible.toString(), label: "Faible" },
          { value: VolumeSon.Normal.toString(), label: "Normal" },
          { value: VolumeSon.Fort.toString(), label: "Fort" },
        ],
        (config.volumeSon ?? Configuration.Default.volumeSon).toString(),
        (event: Event) => {
          event.stopPropagation();
          let volumeSon: VolumeSon = parseInt((event.target as HTMLSelectElement).value);

          this._audioPanel.setVolumeSonore(volumeSon);

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            volumeSon,
          });
        }
      )
    );

    contenu.appendChild(
      this.genererConfigItem(
        "Disposition du clavier",
        [
          { value: ClavierDisposition.Azerty.toString(), label: "AZERTY" },
          { value: ClavierDisposition.Qwerty.toString(), label: "QWERTY" },
          { value: ClavierDisposition.Qwertz.toString(), label: "QWERTZ" },
          { value: ClavierDisposition.Bépo.toString(), label: "BÉPO" },
        ],
        (config.disposition ?? Configuration.Default.disposition).toString(),
        (event: Event) => {
          event.stopPropagation();
          let disposition: ClavierDisposition = parseInt((event.target as HTMLSelectElement).value);

          if (this._input) this._input.dessinerClavier(disposition);

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            disposition,
          });
        }
      )
    );

        contenu.appendChild(
          this.genererConfigItem(
            "Police d'écriture",
            [
              { value: Police.Humaine.toString(), label: "Humaine" },
              { value: Police.Zarbi.toString(), label: "Zarbi" }
            ],
            (config.police ?? Configuration.Default.police).toString(),
            (event: Event) => {
              event.stopPropagation();
              let police: Police = parseInt((event.target as HTMLSelectElement).value);

                this._themeManager.changerPolice(police);

              Sauvegardeur.sauvegarderConfig({
                ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
                police,
              });
            }
          )
        );

    contenu.appendChild(
      this.genererConfigItem(
        "Thème",
        [
          { value: Theme.Sombre.toString(), label: "Sombre" },
          { value: Theme.Clair.toString(), label: "Clair" },
          { value: Theme.SombreAccessible.toString(), label: "Sombre (accessible)" },
          { value: Theme.ClairAccessible.toString(), label: "Clair (accessible)" },
        ],
        (config.theme ?? Configuration.Default.theme).toString(),
        (event: Event) => {
          event.stopPropagation();
          let theme: Theme = parseInt((event.target as HTMLSelectElement).value);

          this._themeManager.changerCouleur(theme);

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            theme,
          });
        }
      )
    );

    contenu.appendChild(
      this.genererConfigItem(
        "Afficher le temps sur le résumé (à la prochaine partie)",
        [
          { value: false.toString(), label: "Non" },
          { value: true.toString(), label: "Oui" },
        ],
        (config.afficherChrono ?? Configuration.Default.afficherChrono).toString(),
        (event: Event) => {
          event.stopPropagation();
          let afficherChrono = (event.target as HTMLSelectElement).value === true.toString();

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            afficherChrono,
          });
        }
      )
    );

    contenu.appendChild(
      this.genererConfigItem(
        "Retour haptique (si votre navigateur est compatible)",
        [
          { value: false.toString(), label: "Non" },
          { value: true.toString(), label: "Oui" },
        ],
        (config.haptique ?? Configuration.Default.haptique).toString(),
        (event: Event) => {
          event.stopPropagation();
          let haptique = (event.target as HTMLSelectElement).value === true.toString();

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            haptique,
          });

          // On redessine le clavier pour la prise en compte de l'option
          if (this._input) this._input.dessinerClavier(config.disposition ?? Configuration.Default.disposition);
        }
      )
    );
	
	contenu.appendChild(
      this.genererConfigSaisieNumerique(
        "️⏱️ Pokémon à trouver",
        config.nbManches ?? Configuration.Default.nbManches,
		'',
        (event: Event) => {
			event.stopPropagation();
			let nbManches = (event.target as HTMLInputElement).value;

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            nbManches : Number(nbManches)
          });
        }
      )
    );
	
	contenu.appendChild(
      this.genererConfigSaisieNumerique(
        "⏱️ Temps imparti (secondes)",
        config.secondesCourse ?? Configuration.Default.secondesCourse,
		'',
        (event: Event) => {
			event.stopPropagation();
			let secondesCourse = (event.target as HTMLInputElement).value;

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            secondesCourse : Number(secondesCourse)
          });
        }
      )
    );
	
	contenu.appendChild(
      this.genererConfigSaisieNumerique(
        "🕵️ Propositions préremplies",
        config.nbIndices ?? Configuration.Default.nbIndices,
		'5',
        (event: Event) => {
			event.stopPropagation();
			let nbIndices = (event.target as HTMLInputElement).value;

          Sauvegardeur.sauvegarderConfig({
            ...(Sauvegardeur.chargerConfig() ?? Configuration.Default),
            nbIndices : Number(nbIndices)
          });
        }
      )
    );
		
    if (Sauvegardeur.chargerSauvegardeStats()) contenu.appendChild(this.genererZoneExportSauvegarde());

    this._panelManager.setContenuHtmlElement(titre, contenu);
    this._panelManager.setClasses(["config-panel"]);
    this._panelManager.afficherPanel();
  }

  private genererConfigItem(
    nomConfig: string,
    options: Array<{ value: string; label: string }>,
    valeurChoisie: string,
    onChange?: (event: Event) => void
  ): HTMLElement {
    let div = document.createElement("div");
    div.className = "config-item";

    let label = document.createElement("label");
    label.innerText = nomConfig;
    div.appendChild(label);

    let select = document.createElement("select");
    for (let optionItem of options) {
      let optionElement = document.createElement("option");
      optionElement.value = optionItem.value;
      optionElement.innerText = optionItem.label;
      if (optionItem.value === valeurChoisie) optionElement.selected = true;
      select.appendChild(optionElement);
    }
    if (onChange !== undefined) select.addEventListener("change", onChange);
    div.appendChild(select);

    return div;
  }

  private genererConfigSaisieNumerique(
    nomConfig: string,
    valeurChoisie: number,
	maxVal: string,
    onChange?: (event: Event) => void
  ): HTMLElement {
    let div = document.createElement("div");
    div.className = "config-item";

    let label = document.createElement("label");
    label.innerText = nomConfig;
    div.appendChild(label);

	const input = document.createElement("input");
	input.type = "number";
	input.min = "1";
	input.step = "1";
	if (maxVal !== '') {
		input.max = maxVal;
	}
	input.value = valeurChoisie.toString();
	input.oninput = () => {
	  if (Number(input.value) < 1) {
		input.value = "1"; // Forcer une valeur minimale de 1
	  }
	};	
	
    if (onChange !== undefined) input.addEventListener("change", onChange);
    div.appendChild(input);

    return div;
  }
  
  private genererZoneExportSauvegarde(): HTMLElement {
    let div = document.createElement("div");
    div.id = "config-sauvegarde-area";

    const titreSection = document.createElement("h3");
    titreSection.innerText = "Exporter vos statistiques";
    div.appendChild(titreSection);

    const explication = document.createElement("p");
    explication.innerText = "Pour transférer vos statistiques sur un autre navigateur, il est possible de suivre les étapes suivantes :";
    div.appendChild(explication);

    const listeEtape = document.createElement("ol");

    const etape1 = document.createElement("li");

    const etape1Texte = document.createElement("p");
    etape1Texte.innerText = "Copiez ce lien à usage unique.";
    etape1.appendChild(etape1Texte);

    const etape1Input = document.createElement("input");
    const contenuLien = Sauvegardeur.genererLien();
    const lien = window.location.origin + window.location.pathname + "#" + btoa("s=" + contenuLien);
    etape1Input.value = lien;
    etape1Input.readOnly = true;
    etape1.appendChild(etape1Input);

    const etape1Bouton = CopieHelper.creerBoutonPartage("config-sauvegarde-bouton");
    CopieHelper.attacheBoutonCopieLien(etape1Bouton, lien, "Lien copié dans le presse-papiers.");
    etape1.appendChild(etape1Bouton);

    listeEtape.appendChild(etape1);

    const etape2 = document.createElement("li");
    etape2.innerText = "Envoyez le lien vers votre autre appareil.";
    listeEtape.appendChild(etape2);

    const etape3 = document.createElement("li");
    etape3.innerText = "Ouvrez ce lien dans votre autre navigateur.";
    listeEtape.appendChild(etape3);

    div.appendChild(listeEtape);

    return div;
  }

  public setInput(input: Input): void {
    this._input = input;
  }
}
