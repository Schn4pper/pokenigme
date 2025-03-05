import NotificationMessage from "./notificationMessage";
import { i18n } from "./i18n/i18n";
import Configuration from "./entites/configuration";
import Sauvegardeur from "./sauvegardeur";

export default class CopieHelper {
	public static attacheBoutonCopieLien(bouton: HTMLElement, lien: string, messageSucces: string): void {
		bouton.addEventListener("click", (event) => {
			event.stopPropagation();
			new Promise((resolve, reject) => {
				return window.navigator.clipboard !== undefined ? resolve(window.navigator.clipboard.writeText(lien)) : reject();
			})
				.catch(
					() =>
						new Promise((resolve, reject) => {
							return window.navigator.share !== undefined ? resolve(navigator.share({ text: lien })) : reject();
						})
				)
				.then(() => { NotificationMessage.ajouterNotificationPanel(messageSucces, bouton) })
				.catch(() => { NotificationMessage.ajouterNotificationPanel(i18n[Sauvegardeur.chargerConfig()?.langue_interface ?? Configuration.Default.langue_interface].copieHelper.pas_compatible, bouton) });
		});
	}

	public static creerBoutonPartage(idBouton: string, label?: string): HTMLElement {
		const lien = document.createElement("a");
		lien.id = idBouton;
		lien.className = "bouton-partage";
		lien.href = "#";

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const useSvg = document.createElementNS("http://www.w3.org/2000/svg", "use") as SVGUseElement;
		useSvg.setAttribute("href", "#icone-copie");
		useSvg.setAttribute("stroke", "var(--couleur-icone)");
		useSvg.setAttribute("fill", "var(--couleur-icone)");
		svg.appendChild(useSvg);
		lien.appendChild(svg);

		if (label) {
			const texteBouton = document.createElement("span");
			texteBouton.className = "bouton-partage-texte";
			texteBouton.innerText = label;
			lien.appendChild(texteBouton);
		}

		return lien;
	}
}
