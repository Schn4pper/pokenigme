import PanelManager from "./panelManager";

export default class NotificationMessage {
  private static _notificationArea: HTMLElement = document.getElementById("notification-area") as HTMLElement;
  private static _notificationAreaTemps: HTMLElement = document.getElementById("notification-area-temps") as HTMLElement;
  private static _notificationLabel: HTMLElement = document.getElementById("notification-label") as HTMLElement;
  private static _notificationTemps: HTMLElement = document.getElementById("notification-temps") as HTMLElement;
  private static _notificationPanelArea: HTMLElement = document.getElementById("panel-fenetre-notification-area") as HTMLElement;
  private static _notificationPanelLabel: HTMLElement = document.getElementById("panel-fenetre-notification-label") as HTMLElement;
  private static _tempsRestant: number | null = null;
  private static _pause: boolean = false;

  private static _tempsTimeout: NodeJS.Timeout | undefined; // Timeout pour le chronomètre
  private static _notificationTimeout: NodeJS.Timeout | undefined; // Timeout pour les notifications
  
  public static ajouterNotification(message: string): void {
    this.ajouterNotificationDiv(this._notificationArea, this._notificationLabel, message);
  }
  
public static decompterTemps(secondes: number): Promise<boolean> {
  return new Promise((resolve) => {
  this._tempsRestant = secondes;
      
  const afficherTemps = () => {
    if (this._tempsRestant === null) return;
    const minutes = Math.floor(this._tempsRestant / 60);
    const secondesRestantes = this._tempsRestant % 60;
    const message = `${minutes}:${secondesRestantes.toString().padStart(2, '0')}`;

    this._notificationAreaTemps.style.opacity = "1";
    this._notificationTemps.style.opacity = "1";
    this._notificationTemps.innerHTML = message;
    if (this._tempsRestant > 0) {
      if (!this._pause) this._tempsRestant--;
      this._tempsTimeout = setTimeout(afficherTemps, 1000);
    } else {
        if (!this._pause) { // Si le joueur valide à la dernière seconde
          this._tempsTimeout = undefined;
          this._tempsRestant = null;
          resolve(true);
        } else {
            setTimeout(afficherTemps, 1000);
        }
	}
  };

  // Initialiser le décompte
  afficherTemps();
  });
}

public static stopperTemps(): void {
	if (this._tempsTimeout) {
		clearTimeout(this._tempsTimeout);
		this._tempsTimeout = undefined;
	}
}

public static mettreEnPauseTemps(): void {
      this._pause = true;
}

public static reprendreTemps(): void {
    this._pause = false;
}

  public static ajouterNotificationPanel(message: string, origine: HTMLElement): void {
    this.ajouterNotificationDiv(this._notificationPanelArea, this._notificationPanelLabel, message);
    const { top: topParent, left: leftParent } = origine.getBoundingClientRect();
    this._notificationPanelArea.style.top = `${topParent + 30}px`;
    this._notificationPanelArea.style.left = `${leftParent - this._notificationPanelArea.getBoundingClientRect().width / 2}px`;
  }

  private static ajouterNotificationDiv(divArea: HTMLElement, divLabel: HTMLElement, message: string): void {
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
      this._notificationTimeout = undefined;
    }
    divLabel.innerHTML = message;
    divArea.style.opacity = "1";
    this._notificationTimeout = setTimeout(
      (() => {
        divArea.style.opacity = "0";
        this._notificationTimeout = setTimeout(
          (() => {
            divLabel.innerHTML = "";
            this._notificationTimeout = undefined;
          }).bind(this),
          1000
        );
      }).bind(this),
      5000
    );
  }
}
