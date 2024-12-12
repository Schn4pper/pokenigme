export default class NotificationMessage {
  private static _notificationArea: HTMLElement = document.getElementById("notification-area") as HTMLElement;
  private static _notificationLabel: HTMLElement = document.getElementById("notification-label") as HTMLElement;
  private static _notificationPanelArea: HTMLElement = document.getElementById("panel-fenetre-notification-area") as HTMLElement;
  private static _notificationPanelLabel: HTMLElement = document.getElementById("panel-fenetre-notification-label") as HTMLElement;
  private static _currentTimeout: NodeJS.Timeout | undefined;
  public static ajouterNotification(message: string): void {
    this.ajouterNotificationDiv(this._notificationArea, this._notificationLabel, message);
  }

  public static ajouterNotificationPanel(message: string, origine: HTMLElement): void {
    this.ajouterNotificationDiv(this._notificationPanelArea, this._notificationPanelLabel, message);
    const { top: topParent, left: leftParent } = origine.getBoundingClientRect();
    this._notificationPanelArea.style.top = `${topParent + 30}px`;
    this._notificationPanelArea.style.left = `${leftParent - this._notificationPanelArea.getBoundingClientRect().width / 2}px`;
  }

  private static ajouterNotificationDiv(divArea: HTMLElement, divLabel: HTMLElement, message: string): void {
    if (this._currentTimeout) {
      clearTimeout(this._currentTimeout);
      this._currentTimeout = undefined;
    }
    divLabel.innerHTML = message;
    divArea.style.opacity = "1";
    this._currentTimeout = setTimeout(
      (() => {
        divArea.style.opacity = "0";
        this._currentTimeout = setTimeout(
          (() => {
            divLabel.innerHTML = "";
            this._currentTimeout = undefined;
          }).bind(this),
          1000
        );
      }).bind(this),
      5000
    );
  }
}
