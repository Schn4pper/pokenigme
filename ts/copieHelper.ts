import NotificationMessage from "./notificationMessage";

export default class CopieHelper {
  public static attacheBoutonCopieLien(bouton: HTMLElement, lien: string, messageSucces: string): void {
    bouton.addEventListener("click", (event) => {
      event.stopPropagation();
      new Promise((resolve, reject) => {
        if (window.navigator.clipboard !== undefined) {
          return resolve(window.navigator.clipboard.writeText(lien));
        }

        return reject();
      })
        .catch(
          () =>
            new Promise((resolve, reject) => {
              if (window.navigator.share !== undefined) return resolve(navigator.share({ text: lien }));

              return reject();
            })
        )
        .then(() => {
          NotificationMessage.ajouterNotificationPanel(messageSucces, bouton);
        })
        .catch((raison) => {
          NotificationMessage.ajouterNotificationPanel("Votre navigateur n'est pas compatible.", bouton);
        });
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
