# Lingola APIs (auth only)

Sadece kimlik doğrulama ve profil uçları.

## Kurulum

```bash
npm install
cp .env.example .env
# FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## SQL

1. **Şimdi:** `scripts/init_auth_schema.sql`
2. **Sonra:** `scripts/future_tables.sql` (sohbet, eğitmen, premium vb.)

## Çalıştır

```bash
npm run dev
```

## Uçlar

| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/auth/firebase` | `{ idToken }` |
| POST | `/auth/guest` | `{ deviceId }` |
| POST | `/auth/logout` | Bearer |
| GET | `/auth/me` | Bearer |
| PUT | `/auth/profile` | Bearer |
| DELETE | `/auth/account` | Bearer |

## Klasör yapısı

```
lingola_apis/
├── app.js
├── config/          database, firebase
├── middleware/      auth, errorHandler
├── models/          User
├── repositories/    User, Token
├── routes/          auth
├── services/        auth, user
├── utils/           jwt, dbRetry
└── scripts/         init_auth_schema.sql, future_tables.sql
```
