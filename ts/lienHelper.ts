export default class LienHelper {
	public static extraireInformation(cle: string): string | null {
		if (window.location.hash === "" || window.location.hash === "#") return null;

		try {
			let hashPart = atob(window.location.hash.substring(1)).split("/");
			for (let infoPos in hashPart) {
				let info = hashPart[infoPos];
				if (!info.includes("=")) continue;
				let infoPart = info.split("=");
				let infoKey = infoPart[0];

				if (infoKey !== cle) continue;

				return infoPart[1];
			}
		} catch (e) {
			return null;
		}

		return null;
	}

	public static extraireInformationTexte(cle: string): string | null {
		if (window.location.hash === "" || window.location.hash === "#") return null;

		let hashPart = window.location.hash.substring(1).split("/");
		for (let infoPos in hashPart) {
			let info = hashPart[infoPos];
			if (!info.includes("=")) continue;
			let infoPart = info.split("=");
			let infoKey = infoPart[0];

			if (infoKey !== cle) continue;

			return infoPart[1];
		}

		return null;
	}
}
