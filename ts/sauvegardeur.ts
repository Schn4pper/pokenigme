import Configuration from "./entites/configuration";
import PartieEnCours from "./entites/partieEnCours";
import SauvegardePartie from "./entites/sauvegardePartie";
import SauvegardeStats from "./entites/sauvegardeStats";
import LienHelper from "./lienHelper";
import NotificationMessage from "./notificationMessage";
import { ModeJeu } from "./entites/modeJeu";

export default class Sauvegardeur {
  private static readonly _cleStats = "statistiques";
  private static readonly _clePartieEnCoursDuJour = "partieEnCoursDuJour";
  private static readonly _clePartieEnCoursInfini = "partieEnCoursInfini";
  private static readonly _clePartieEnCoursDevinette = "partieEnCoursDevinette";
  private static readonly _clePartieEnCoursDesordre = "partieEnCoursDesordre";
  private static readonly _clePartieEnCours = "partieEnCours";

  private static readonly _cleConfiguration = "configuration";

  public static sauvegarderStats(stats: SauvegardeStats): void {
    localStorage.setItem(this._cleStats, JSON.stringify(stats));
  }

  public static chargerSauvegardeStats(): SauvegardeStats | undefined {
    const contenuLocation = LienHelper.extraireInformation("s");

    if (contenuLocation) {
      const donneesDepuisLien = Sauvegardeur.chargerInformationDepuisLien(contenuLocation);
      window.location.hash = "";
      if (donneesDepuisLien) {
        NotificationMessage.ajouterNotification("Statistiques chargées avec succès.");
        Sauvegardeur.sauvegarderStats(donneesDepuisLien);
        return donneesDepuisLien;
      }

      NotificationMessage.ajouterNotification("Impossible de charger les statistiques depuis le lien.");
    }

    const dataStats = localStorage.getItem(this._cleStats);
    if (!dataStats) return;

    let stats = JSON.parse(dataStats) as SauvegardeStats;
    if (stats.dernierePartie !== null) stats.dernierePartie = new Date(stats.dernierePartie);
    return stats;
  }

  public static sauvegarderPartieEnCours(idPartie: string, datePartie: Date, propositions: Array<string>, solution : string, dateFinPartie?: Date, modeJeu?: ModeJeu): void {
    let partieEnCours: SauvegardePartie = {
      propositions: propositions,
      datePartie,
      dateFinPartie,
      idPartie,
      modeJeu,
      solution
    };

    let clePartie;

    switch (modeJeu) {
        case ModeJeu.Infini:
            clePartie = this._clePartieEnCoursInfini;
            break;
        case ModeJeu.DuJour:
            clePartie = this._clePartieEnCoursDuJour;
            break;
        case ModeJeu.Devinette:
            clePartie = this._clePartieEnCoursDevinette;
            break;
        default:
            clePartie = this._clePartieEnCoursDesordre;
            break;
    }

    localStorage.setItem(clePartie, JSON.stringify(partieEnCours));
  }

  public static chargerSauvegardePartieEnCours(): PartieEnCours | undefined {
    let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

    let dataPartieEnCours;
    switch (config.modeJeu) {
        case ModeJeu.Infini:
            dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursInfini);
            break;
        case ModeJeu.DuJour:
            dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursDuJour);
            break;
        case ModeJeu.Devinette:
            dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursDevinette);
            break;
        default:
            dataPartieEnCours = localStorage.getItem(this._clePartieEnCoursDesordre);
            break;
    }

    if (!dataPartieEnCours) return;

    let partieEnCours = JSON.parse(dataPartieEnCours) as SauvegardePartie;
    let aujourdhui = new Date();
    let datePartieEnCours = new Date(partieEnCours.datePartie);
    if (
      aujourdhui.getDate() !== datePartieEnCours.getDate() ||
      aujourdhui.getMonth() !== datePartieEnCours.getMonth() ||
      aujourdhui.getFullYear() !== datePartieEnCours.getFullYear()
    ) {
      this.purgerPartieEnCours();
      return;
    }
    let dateFinPartie = partieEnCours.dateFinPartie === undefined ? undefined : new Date(partieEnCours.dateFinPartie);

    return {
      datePartie: datePartieEnCours,
      dateFinPartie: dateFinPartie,
      propositions: partieEnCours.propositions,
      idPartie: partieEnCours.idPartie,
      modeJeu: partieEnCours.modeJeu,
      solution: partieEnCours.solution
    };
  }

  public static sauvegarderConfig(config: Configuration): void {
    localStorage.setItem(this._cleConfiguration, JSON.stringify(config));
  }

  public static chargerConfig(): Configuration | null {
    let dataConfig = localStorage.getItem(this._cleConfiguration);
    if (!dataConfig) return null;

    let config = JSON.parse(dataConfig) as Configuration;
    return config;
  }

  public static purgerPartieEnCours(): void {
    let config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

    switch (config.modeJeu) {
        case ModeJeu.Infini:
            localStorage.removeItem(this._clePartieEnCoursInfini);
            break;
        case ModeJeu.DuJour:
            localStorage.removeItem(this._clePartieEnCoursDuJour);
            break;
        case ModeJeu.Devinette:
            localStorage.removeItem(this._clePartieEnCoursDevinette);
            break;
        default:
            localStorage.removeItem(this._clePartieEnCoursDesordre);
            break;
    }
  }
  
  public static genererLien(): string {
    const stats = Sauvegardeur.chargerSauvegardeStats() ?? SauvegardeStats.Default;
    return [
      stats.repartition[1],
      stats.repartition[2],
      stats.repartition[3],
      stats.repartition[4],
      stats.repartition[5],
      stats.repartition[6],
      stats.repartition["-"],
      stats.lettresRepartitions.bienPlace,
      stats.lettresRepartitions.malPlace,
      stats.lettresRepartitions.nonTrouve,
      stats.dernierePartie ? stats.dernierePartie.toISOString() : "null",
    ].join(",");
  }

  private static chargerInformationDepuisLien(contenu: string): SauvegardeStats | null {
    const [
      UnCoupString,
      DeuxCoupsString,
      TroisCoupsString,
      QuatreCoupsString,
      CinqCoupsString,
      SixCoupsString,
      PerduString,
      LettresBienPlaceesString,
      LettresMalPlaceesString,
      LettresNonTrouveString,
      dernierePartie,
    ] = contenu.split(",");

    const UnCoup = parseInt(UnCoupString);
    const DeuxCoups = parseInt(DeuxCoupsString);
    const TroisCoups = parseInt(TroisCoupsString);
    const QuatreCoups = parseInt(QuatreCoupsString);
    const CinqCoups = parseInt(CinqCoupsString);
    const SixCoups = parseInt(SixCoupsString);
    const Perdu = parseInt(PerduString);
    const LettresBienPlacees = parseInt(LettresBienPlaceesString);
    const LettresMalPlacees = parseInt(LettresMalPlaceesString);
    const LettresNonTrouve = parseInt(LettresNonTrouveString);

    return {
      dernierePartie: dernierePartie === "null" ? null : new Date(dernierePartie),
      partiesJouees: UnCoup + DeuxCoups + TroisCoups + QuatreCoups + CinqCoups + SixCoups + Perdu,
      partiesGagnees: UnCoup + DeuxCoups + TroisCoups + QuatreCoups + CinqCoups + SixCoups,
      repartition: {
        1: UnCoup,
        2: DeuxCoups,
        3: TroisCoups,
        4: QuatreCoups,
        5: CinqCoups,
        6: SixCoups,
        "-": Perdu,
      },
      lettresRepartitions: {
        bienPlace: LettresBienPlacees,
        malPlace: LettresMalPlacees,
        nonTrouve: LettresNonTrouve,
      },
    };
  }


}
