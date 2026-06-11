# shidohim-server

NestJS backend connected to **Microsoft SQL Server** via **SSMS**.

## Database (SSMS)

**Server:** `localhost\SQLEXPRESS`  
**Database:** `Shidohim`  
**Auth:** Windows Authentication

### Setup in SSMS

1. Open SQL Server Management Studio
2. Connect to `localhost\SQLEXPRESS`
3. Run: `database/init-all.sql`

See `database/README.md` for details.

## App setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Swagger

**http://localhost:3000/api**

## API

Base URL: `http://localhost:3000`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/profiles/options` | Selection options |
| POST | `/profiles` | Create profile |
| GET | `/profiles` | Get all profiles |
| GET | `/profiles/:id` | Get profile by id |
| PATCH | `/profiles/:id` | Update profile |
| DELETE | `/profiles/:id` | Delete profile |
