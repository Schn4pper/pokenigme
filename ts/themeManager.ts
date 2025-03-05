import Configuration from "./entites/configuration";
import { Theme } from "./entites/theme";
import { Police } from "./entites/police";

export default class ThemeManager {
	public constructor(config: Configuration) {
		this.changerCouleur(config.theme ?? Configuration.Default.theme);
		this.changerPolice(config.police ?? Configuration.Default.police);
	}

	public changerCouleur(theme: Theme): void {
		const root = document.documentElement;
		switch (theme) {
			case Theme.Clair:
			case Theme.ClairAccessible:
				root.style.setProperty("--couleur-fond-rgb", "245, 245, 220");
				root.style.setProperty("--couleur-police", "#000000");
				root.style.setProperty("--couleur-bordure", "rgb(55, 55, 55)");
				root.style.setProperty("--couleur-icone", "rgb(55, 55, 55)");
				root.style.setProperty("--couleur-lettre-speciale", "rgb(210, 210, 210)");
				root.style.setProperty("--couleur-lettre-survole", "rgb(140, 140, 140)");
				root.style.setProperty("--couleur-lettre-speciale-survole", "rgb(140, 140, 140)");
				break;
			default:
				root.style.setProperty("--couleur-fond-rgb", "43, 43, 43");
				root.style.setProperty("--couleur-police", "#ffffff");
				root.style.setProperty("--couleur-bordure", "rgb(200, 200, 200)");
				root.style.setProperty("--couleur-icone", "rgb(200, 200, 200)");
				root.style.setProperty("--couleur-lettre-speciale", "rgb(75, 75, 75)");
				root.style.setProperty("--couleur-lettre-survole", "rgba(75, 75, 75, 0.65)");
				root.style.setProperty("--couleur-lettre-speciale-survole", "rgba(75, 75, 75, 0.65)");
		}
		switch (theme) {
			case Theme.ClairAccessible:
			case Theme.SombreAccessible:
				root.style.setProperty("--couleur-bien-place", "rgb(9, 104, 0)");
				root.style.setProperty("--couleur-mal-place", "rgb(219, 124, 0)");
				break;
			default:
				root.style.setProperty("--couleur-bien-place", "rgb(231, 0, 42)");
				root.style.setProperty("--couleur-mal-place", "rgb(255, 189, 0)");
		}
		switch (theme) {
			case Theme.ClairAccessible:
				root.style.setProperty("--couleur-lettre-survole-bien-place", "rgb(5, 61, 0)");
				root.style.setProperty("--couleur-lettre-survole-mal-place", "rgb(128, 72, 0)");
				break;
			case Theme.SombreAccessible:
				root.style.setProperty("--couleur-lettre-survole-bien-place", "rgba(9, 104, 0, 0.65)");
				root.style.setProperty("--couleur-lettre-survole-mal-place", "rgba(219, 124, 0, 0.65)");
				break;
			case Theme.Clair:
				root.style.setProperty("--couleur-lettre-survole-bien-place", "rgb(153, 0, 28)");
				root.style.setProperty("--couleur-lettre-survole-mal-place", "rgb(153, 112, 0)");
				break;
			default:
				root.style.setProperty("--couleur-lettre-survole-bien-place", "rgba(231, 0, 42, 0.65)");
				root.style.setProperty("--couleur-lettre-survole-mal-place", "rgba(255, 189, 0, 0.65)");
		}
	}

	public changerPolice(police: Police): void {
		const root = document.documentElement;
		switch (police) {
			case Police.Zarbi:
				root.style.setProperty("--police-grille", "Zarbi, Roboto, Ubuntu, Arial, Helvetica, sans-serif");
				root.style.setProperty("--police-clavier", "Zarbi, Roboto, Ubuntu, Arial, Helvetica, sans-serif");
				break;
			case Police.Humaine:
			default:
				root.style.setProperty("--police-grille", "Roboto, Ubuntu, Arial, Helvetica, sans-serif");
				root.style.setProperty("--police-clavier", "monospace");
		}
	}
}
