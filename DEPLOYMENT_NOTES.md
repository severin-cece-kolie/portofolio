# Sécurité & Déploiement — notes rapides

1. Ne commitez jamais de clés/secret dans le dépôt.

2. Configuration recommandée pour Vercel :
   - Dashboard → Project → Settings → Environment Variables
   - Ajoutez : `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `CONTACT_EMAIL` (ou d'autres clés serveur)

3. Local : créez un fichier `.env` à la racine (ne pas committer). Voir `.env.example`.

4. Si une clé a été exposée : révoquez-la immédiatement via le fournisseur, puis purgez l'historique Git.

5. Optionnel (sécurité renforcée) : déplacer l'envoi d'emails vers une fonction serverless (API) qui lit les clés depuis `process.env`.
