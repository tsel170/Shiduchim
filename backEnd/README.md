# shidohim-server

NestJS backend with **MongoDB** (Mongoose).

## Database

**Default URI:** `mongodb://localhost:27017/shiduchim`

Collections:

| Collection | Description |
|------------|-------------|
| `accounts` | Login accounts with embedded settings |
| `profiles` | Matchmaking profiles |
| `favorites` | Saved profiles with embedded ratings |
| `interests` | Profiles under consideration |
| `matchRequests` | Requests sent to shadchanim |

Embedded documents: `ReferenceContact`, `AccountSettings`, `FilterSettings`, `DisplayPreferences`, `ProfileRating`.

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

Requires a running MongoDB instance (local or Atlas).

## Swagger

**http://localhost:3000/api**

## API

Base URL: `http://localhost:3000`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/accounts` | Create account |
| GET | `/accounts` | Get all accounts |
| GET | `/accounts/:accountId` | Get account |
| PATCH | `/accounts/:accountId` | Update account |
| PATCH | `/accounts/:accountId/settings` | Update account settings |
| DELETE | `/accounts/:accountId` | Delete account |
| GET | `/profiles/options` | Selection options |
| POST | `/profiles` | Create profile |
| GET | `/profiles` | Get all profiles |
| GET | `/profiles/:profileId` | Get profile |
| PATCH | `/profiles/:profileId` | Update profile |
| DELETE | `/profiles/:profileId` | Delete profile |
| POST | `/favorites` | Add favorite |
| GET | `/favorites` | Get favorites (`?ownerAccountId=`) |
| GET | `/favorites/:favoriteId` | Get favorite |
| PATCH | `/favorites/:favoriteId` | Update favorite |
| DELETE | `/favorites/:favoriteId` | Delete favorite |
| POST | `/interests` | Create interest |
| GET | `/interests` | Get interests (`?ownerAccountId=`) |
| GET | `/interests/:interestId` | Get interest |
| PATCH | `/interests/:interestId` | Update interest |
| DELETE | `/interests/:interestId` | Delete interest |
| POST | `/match-requests` | Create match request |
| GET | `/match-requests` | Get match requests |
| GET | `/match-requests/:requestId` | Get match request |
| PATCH | `/match-requests/:requestId` | Update match request |
| DELETE | `/match-requests/:requestId` | Delete match request |
