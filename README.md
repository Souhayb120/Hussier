# Mofawid — Front-End

Interface web moderne pour **Mofawid**, l'application de gestion des études
d'huissier de justice (المفوّض القضائي) : dossiers, missions, observations et
documents. Elle consomme les endpoints du back-end Spring Boot existant
(`../mofawid`). **Le back-end n'est pas modifié.**

## Fonctionnalités

- **Bilingue FR / ع** avec bascule en un clic et support **RTL** complet
  (icônes, pagination, layout) + polices Inter / IBM Plex Sans Arabic.
- **Rôles gérés** : chaque utilisateur ne voit que ce qu'il peut faire.

| Rôle | Accès |
| ---- | ----- |
| `SUPER_ADMIN` | Études (tenants) uniquement : CRUD + création de l'admin de l'étude |
| `ADMIN` | Tout : dossiers, documents (soumission/approbation/suppression), missions, utilisateurs |
| `ASSISTANT` | Dossiers et documents uniquement |
| `COLLABORATEUR` | Missions qui lui sont assignées : démarrer, terminer, observations |

- Chaque endpoint du back-end a son interface : dossiers (liste, détail,
  onglets documents + missions + facturation + suivi client, création),
  missions (liste globale / « mes missions », détail, cycle démarrer →
  terminer), observations, documents (brouillon IA, soumission, approbation),
  utilisateurs (création, édition, activation, suppression) et études
  (`SUPER_ADMIN`).
- **Suivi client** : depuis l'onglet « Suivi client » d'un dossier
  (`ADMIN` / `ASSISTANT`), générez le code de suivi (`POST
  /api/cases/{id}/tracking-code`), copiez-le et prévisualisez la vue client.
  La page publique **`/suivi`** (`GET /api/public/tracking/{code}`) permet au
  client de consulter l'avancement de son dossier sans authentification.
- Tableaux paginés côté serveur avec recherche filtrée côté client par page.

## Déploiement

- **Back-end** : `https://mofawid-backend.onrender.com`
- **Front-end** : `https://hussier.onrender.com`

Le build de production (`.env.production`) appelle **directement** le back-end :

```
VITE_API_URL="https://mofawid-backend.onrender.com/api"
```

> Si l'URL du back-end change, mettez à jour `.env.production` puis relancez
> `npm run build` et redéployez le front.

Comme le front et le back sont sur **deux origines différentes**, le back-end
**doit autoriser l'origine du front** (CORS), sinon le navigateur bloque les
appels. À ajouter côté back-end Spring Boot :

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "https://hussier.onrender.com",
                "http://localhost:5173"
            )
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

Si Spring Security est utilisé, activez CORS dans la chaîne de filtres :
`.cors(Customizer.withDefaults())` et laissez passer les pré-vols `OPTIONS`
(`.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`).

## Stack

- React 18 + Vite 5 + TypeScript (strict)
- Tailwind CSS 3 (thème émeraude + or, propriétés logiques RTL)
- TanStack Query · React Hook Form + Zod · react-router · i18next
- UI maison : dialogues, confirmations, toasts, badges de statut, pagination

## Pré-requis

1. Back-end Mofawid accessible (par défaut **http://localhost:8080**,
   configurable via la variable `MOFAWID_API` dans `.env`).
2. Node.js 18+.

## Démarrage

```bash
npm install
npm run dev
```

L'application s'ouvre sur **http://localhost:5173** (proxy `/api` →
`MOFAWID_API`, par défaut `http://localhost:8080`).
La page de connexion liste les comptes de démonstration disponibles.

> Pour tester le suivi client sans compte : ouvrez
> **http://localhost:5173/suivi** et saisissez un code de suivi
> (`npm run seed` en affiche un, et l'onglet « Suivi client » d'un dossier
> permet d'en générer).

### Comptes de test

| Utilisateur | Mot de passe | Rôle |
| ----------- | ------------ | ---- |
| `superadmin` | `Admin@123` | `SUPER_ADMIN` |
| `admin.demo` | `Admin@123` | `ADMIN` |
| `assistant.demo` | `Assist@123` | `ASSISTANT` |
| `collab.ahmed` | `Ahmed@123` | `COLLABORATEUR` |

## Données de démonstration

Le script `seed.mjs` regénère un jeu de données complet via l'API
(études, admins, utilisateurs, dossiers, missions, documents, observations) :

```bash
npm run seed
```

## Scripts

| Commande | Description |
| -------- | ----------- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (`dist/`) |
| `npm run preview` | Prévisualise le build |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run seed` | Joue les données de démonstration via l'API |