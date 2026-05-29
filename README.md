# PrintQuote

MVP pentru vânzători mici de printare 3D: oferte, comenzi, clienți și mesaje WhatsApp — fără API oficial WhatsApp.

## Funcționalități

- Landing page în română
- Autentificare Supabase (email/parolă)
- Panou cu statistici
- Tablou Kanban comenzi (8 statusuri)
- Calculator ofertă cu detaliere preț live
- Detalii comandă + mesaje WhatsApp (`wa.me` + `encodeURIComponent`)
- **Link public ofertă** (`/q/{token}`) — pagină read-only pentru clienți, fără login
- Gestionare clienți
- Setări prețuri implicite
- Date demo opționale (3 clienți, 5 comenzi)

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS + componente stil shadcn/ui
- Supabase (Auth + PostgreSQL + RLS)

## Setup

### 1. Supabase

1. Creează un proiect pe [supabase.com](https://supabase.com)
2. În **SQL Editor**, rulează migrațiile în ordine:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_fixes.sql`
   - `supabase/migrations/003_public_quote_share.sql`
3. În **Authentication → Providers**, activează Email
4. Copiază URL-ul proiectului și cheia `anon` din **Settings → API**

### 2. Variabile de mediu

```bash
cp .env.example .env.local
```

Completează:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Instalare și rulare

```bash
npm install
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000).

### 4. Primii pași

1. Înregistrează un cont
2. Mergi la **Panou** → **Încarcă date demo** (opțional)
3. Creează o ofertă nouă sau explorează comenzile demo

## Structură i18n

Textele UI sunt în `src/locales/ro.ts`. Pentru engleză, extinde `src/locales/en.ts` și schimbă `getMessages()` din `src/locales/index.ts`.

## Deploy

Compatibil cu Vercel: setează aceleași variabile de mediu și deploy din repo.

## Limitări MVP (intenționate)

- Fără plăți / abonamente
- Fără API WhatsApp oficial
- Fără parsare STL
- Timp print și material introduse manual
