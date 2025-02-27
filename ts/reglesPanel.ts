import Configuration from "./entites/configuration";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import { i18n } from "./i18n/i18n";

export default class ReglesPanel {
	private readonly _panelManager: PanelManager;
	private readonly _rulesBouton: HTMLElement;

	public constructor(panelManager: PanelManager) {
		this._panelManager = panelManager;
		this._rulesBouton = document.getElementById("configuration-regles-bouton") as HTMLElement;

		this._rulesBouton.addEventListener(
			"click",
			(() => {
				this.afficher();
			}).bind(this)
		);
	}

	public afficher(): void {
		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

		let titre = i18n[config.langue].reglesPanel.regles;
		let contenu =
			"<p>" +
			i18n[config.langue].reglesPanel.regles_ligne_1 + "<br />" +
			i18n[config.langue].reglesPanel.regles_ligne_2 + "<br />" +
			i18n[config.langue].reglesPanel.regles_ligne_3 + "<br />" +
			"</p>" +
			'<div class="grille">' +
			'<table role="presentation">' +
			'<tr role="group" aria-label="' + i18n[config.langue].reglesPanel.mot_exemple + '">' +
			'<td class="resultat non-trouve" aria-label="' + i18n[config.langue].reglesPanel.statut_lettre_1 + '">' + i18n[config.langue].reglesPanel.lettre_1 + '</td>' +
			'<td class="resultat bien-place" aria-label="' + i18n[config.langue].reglesPanel.statut_lettre_2 + '">' + i18n[config.langue].reglesPanel.lettre_2 + '</td>' +
			'<td class="resultat mal-place" aria-label="' + i18n[config.langue].reglesPanel.statut_lettre_3 + '">' + i18n[config.langue].reglesPanel.lettre_3 + '</td>' +
			'<td class="resultat non-trouve" aria-label="' + i18n[config.langue].reglesPanel.statut_lettre_4 + '">' + i18n[config.langue].reglesPanel.lettre_4 + '</td>' +
			'<td class="resultat non-trouve" aria-label="' + i18n[config.langue].reglesPanel.statut_lettre_5 + '">' + i18n[config.langue].reglesPanel.lettre_5 + '</td>' +
			'<td class="resultat mal-place" aria-label="' + i18n[config.langue].reglesPanel.statut_lettre_6 + '">' + i18n[config.langue].reglesPanel.lettre_6 + '</td>' +
			'<td class="resultat bien-place" aria-label="' + i18n[config.langue].reglesPanel.statut_lettre_7 + '">' + i18n[config.langue].reglesPanel.lettre_7 + '</td>' +
			"</tr>" +
			"</table>" +
			i18n[config.langue].reglesPanel.regles_ligne_4 + "<br />" +
			i18n[config.langue].reglesPanel.regles_ligne_5 + "<br />" +
			i18n[config.langue].reglesPanel.regles_ligne_6 + "<br /><br/>" +
			i18n[config.langue].reglesPanel.regles_ligne_7 + "<br/>" +
			i18n[config.langue].reglesPanel.regles_ligne_8 + "<br/>" +
			i18n[config.langue].reglesPanel.regles_ligne_9 + "<br/>" +
			i18n[config.langue].reglesPanel.regles_ligne_10 + "<br/>" +
			i18n[config.langue].reglesPanel.regles_ligne_11 + "<br/>" +
			"</div>" +
			"<p>" +
			'<a target="_blank" href="https://github.com/Schn4pper/pokenigme">' + i18n[config.langue].reglesPanel.projet + '</a> '
			+ i18n[config.langue].reglesPanel.cree_par + ' <a href="mailto:schnapper@fog.gy">' + i18n[config.langue].reglesPanel.schnapper + '</a>. '
			+ i18n[config.langue].reglesPanel.base_sur + ' <a target="_blank" href="https://framagit.org/JonathanMM/sutom">' + i18n[config.langue].reglesPanel.sutom + '</a> ' + i18n[config.langue].reglesPanel.cree_par + ' <a target="_blank" href="https://twitter.com/Jonamaths">' + i18n[config.langue].reglesPanel.jonamaths + '</a>.<br />' +
			"</p>";

		this._panelManager.setContenu(titre, contenu);
		this._panelManager.setClasses(["regles-panel"]);
		this._panelManager.setCallbackFermeture(() => {
			Sauvegardeur.sauvegarderConfig({
				...(config),
				afficherRegles: false,
			});
		});
		this._panelManager.afficherPanel();
	}
}
