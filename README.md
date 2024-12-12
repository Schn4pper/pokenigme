# POKÉNIGME

Jeu de lettres en ligne (et en français) basé sur Wordle. Le jeu se trouve à l'adresse https://fog.gy/pokenigme

## Contact

Pour toute question, remarque ou suggestion: schnapper@fog.gy.

## Développement

### Avec npm

Pour pouvoir travailler en local, il faut commencer par installer ce qu'il faut à node :

```sh
npm i
```

Puis, on lance le serveur :

```sh
npm run start:dev
```

### Avec Docker

Un Dockerfile est disponible pour pouvoir démarrer le site en local sans `npm`.

```sh
docker build --build-arg MODE=development -t pokenigme .

docker run -it --rm -p 4000:4000 pokenigme npm run start:dev
```

### Accès au site

Une fois démarré, le site sera disponible sur http://localhost:4000 et le typescript va se recompiler tout seul à chaque modification de fichier.

## Déployer en production

### Avec npm

Pour déployer en production, on installe les dépendances :

```sh
npm install --production
```

Puis on lance le serveur :

```sh
npm start
```

### Avec Docker

On lance Docker en production en créant l'image et en la lançant sans les options particulières pour le mode "development" :

```sh
docker build -t pokenigme .

docker run -it --rm -p 4000:4000 pokenigme
```

## Autres infos et remerciements

- Merci au projet [SUTOM](https://framagit.org/JonathanMM/sutom) et à son auteur.
- Merci à tous les gens qui me remontent des bugs et qui me donnent des idées, ça m'aide beaucoup.
- Merci à toutes les personnes qui jouent, c'est une belle récompense que vous me donnez.
