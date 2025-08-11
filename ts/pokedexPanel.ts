import Configuration from "./entites/configuration";
import SauvegardeStats from "./entites/sauvegardeStats";
import PanelManager from "./panelManager";
import Sauvegardeur from "./sauvegardeur";
import { i18n } from "./i18n/i18n";
import ListeMotsProposables from "./mots/listeMotsProposables";
import { Pokemon } from "./mots/listeMotsProposables";

export default class PokedexPanel {
	private readonly _panelManager: PanelManager;
	private _contenu: HTMLDivElement;
	private _filterContainer: HTMLDivElement;
	private _generationFilter: HTMLSelectElement;
	private _statusFilter: HTMLSelectElement;

	public constructor(panelManager: PanelManager) {
		this._panelManager = panelManager;
		this._contenu = document.createElement("div");
		this._filterContainer = document.createElement("div");
		this._generationFilter = document.createElement("select");
		this._statusFilter = document.createElement("select");
	}

	public afficher(stats: SauvegardeStats): void {
		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

		var nbPokemon = stats.pokemon.length;
		var nbTotalPokemon = Object.keys(ListeMotsProposables.Pokedex).length;
		const h3 = document.createElement("h3");
		h3.innerText = `${nbPokemon} ${i18n[config.langue_interface].pokedexPanel.pokemon_attrapes}`;
		this._contenu.appendChild(h3);

		if (nbPokemon == nbTotalPokemon-1) {
			const oh = document.createElement("h3");
			const ohLien = document.createElement("a");
			ohLien.href = "./#" +  btoa(unescape(encodeURIComponent("p=[]|2|MEW|" + config.langue_jeu)));
			ohLien.target = "_blank";
			ohLien.innerText = `🚚`;
			oh.appendChild(ohLien);
			this._contenu.appendChild(oh);
		} else if (nbPokemon == nbTotalPokemon) {
			h3.innerText = i18n[config.langue_interface].pokedexPanel.felicitations;
		}

		const listePokemon = document.createElement("div");
		listePokemon.classList.add("pokemon-list");

		this._generationFilter.innerHTML = `<option value="all" selected>${i18n[config.langue_interface].pokedexPanel.toutes_generations}</option>` +
		Array.from({ length: 9 }, (_, i) => `<option value="${i + 1}">${i18n[config.langue_interface].pokedexPanel.generation} ${i + 1}</option>`).join("");

		this._statusFilter.innerHTML = `<option value="all">${i18n[config.langue_interface].pokedexPanel.tous}</option>
		<option value="caught" selected>${i18n[config.langue_interface].pokedexPanel.attrapes}</option>
		<option value="uncaught">${i18n[config.langue_interface].pokedexPanel.non_attrapes}</option>`;

		this._filterContainer.appendChild(this._statusFilter);
		this._filterContainer.appendChild(this._generationFilter);
		this._contenu.appendChild(this._filterContainer);

		this._generationFilter.addEventListener("change", () => this.renderPokemonList(listePokemon, stats));
		this._statusFilter.addEventListener("change", () => this.renderPokemonList(listePokemon, stats));

		this.renderPokemonList(listePokemon, stats);
	}

	private renderPokemonList(listePokemon : HTMLDivElement, stats: SauvegardeStats) {
		var config = Sauvegardeur.chargerConfig() ?? Configuration.Default;

		listePokemon.innerHTML = "";

		const selectedGeneration = this._generationFilter.value;
		const selectedStatus = this._statusFilter.value;

		Object.values(ListeMotsProposables.Pokedex)
			.filter(p => selectedGeneration === "all" || p.generation === Number(selectedGeneration))
			.filter(p => {
				const isCaught = stats.pokemon.includes(p.numero);
				return selectedStatus === "all" ||
					(selectedStatus === "caught" && isCaught) ||
					(selectedStatus === "uncaught" && !isCaught);
			})
			.forEach((p: Pokemon) => {
				const pkDiv = document.createElement("div");
				pkDiv.classList.add("pokemon-item", stats.pokemon.includes(p.numero) ? "caught" : "uncaught");

				const formattedNumber = `${String(p.numero).padStart(4, "0")}`;
				const pkTxt = document.createElement("p");
				pkTxt.innerHTML = `<span class="pokemon-number">#${formattedNumber}</span><p class="pokedex-cadre-img"><img class="pokedex-${stats.pokemon.includes(p.numero) ? "caught" : "uncaught"}" src="./public/img/${formattedNumber}.png"/></p>${p.noms[config.langue_interface]}`;

				const generationDiv = document.createElement("div");
				generationDiv.classList.add("pokemon-generation");
				generationDiv.innerText = `${i18n[config.langue_interface].pokedexPanel.gen} ${p.generation}`;

				const namesDiv = document.createElement("div");
				namesDiv.classList.add("pokemon-names");
				const filteredNames = Object.entries(p.noms).filter(([langue, _]) => Number(langue) !== config.langue_interface).map(([_, nom]) => nom);
				namesDiv.innerText = filteredNames.join(", ");

				pkDiv.appendChild(pkTxt);
				pkDiv.appendChild(generationDiv);
				pkDiv.appendChild(namesDiv);
				listePokemon.appendChild(pkDiv);
			});

			this._contenu.appendChild(listePokemon);
			this._panelManager.setContenuHtmlElement(i18n[config.langue_interface].pokedexPanel.collection, this._contenu);
			this._panelManager.setClasses(["pokedex-panel"]);
			this._panelManager.afficherPanel();
	}
}
