# Aviora Business Services

Full-stack platform for **Aviora Business Services** — remote accounting, finance, HR, advisory, and creative services. Clients book services and appointments; admins manage operations through a dashboard API.

This folder is the **project root**.  It contains two applications managed within a single Git repository:

| Folder | Stack | Purpose |
|--------|--------|---------|
| [`Front/`](Front/) | React + Vite | Client, Admin, and Employee web interfaces |
| [`Back/`](Back/) | Laravel 12 + PHP 8.2 | REST API, auth, mail, payments, database |

---

## Repository layout

```
CBS_site/
├── README.md          ← this file
├── Front/             ←  frontend monorepo
│   ├── Client_interface/    Public website & client portal
│   ├── Admin_interface/     Super-admin dashboard
│   └── Employee_interface/    Employee portal (scaffold)
└── Back/              ← Laravel API
    ├── app/
    ├── routes/api.php
    ├── database/
    └── ...
```

---

## Prerequisites

- **Node.js** 18+ (LTS recommended) and npm
- **PHP** 8.2+ and **Composer**
- **Git**

For local API development, SQLite is used by default (see `Back/.env.example`). MySQL/MariaDB can be configured in `.env` for production.

---

## Quick start (local development)

Run the **API first**, then the frontends that talk to it.

### 1. Backend API (`Back/`)

```powershell
cd Back
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API base URL: `http://localhost:8000`

Optional (Laravel Vite assets):

```powershell
npm install
npm run dev
```

### 2. Client website (`Front/Client_interface/`)

```powershell
cd Front\Client_interface
npm install
```

Create `.env` (or copy from example if present):

```env
VITE_API_BASE_URL=http://localhost:8000
```

```powershell
npm run dev
```

Default dev URL: `http://localhost:5173`

### 3. Admin dashboard (`Front/Admin_interface/`)

```powershell
cd Front\Admin_interface
npm install
npm run dev
```

Point the admin API base URL in its `.env` to the same Laravel server (see `Admin_interface/src/services/api.js`).

### 4. Employee interface (`Front/Employee_interface/`) — optional

```powershell
cd Front/Employee_interface
npm install
npm run dev
```

---

## Main features

**Client (`Client_interface`)**
- Home, About, Services, Cart, Contact
- Registration, login, email verification, password reset
- Profile and appointment booking

**Admin (`Admin_interface`)**
- Services, clients, appointments, contacts, payments
- Super-admin authentication

**API (`Back`)**
- Sanctum auth (client / admin / employee roles)
- Services, subcategories, appointments, contact messages
- Payment confirmation flow and email notifications

---

## Environment notes

| App | Config file | Key variable |
|-----|-------------|--------------|
| Client | `Front/Client_interface/.env` | `VITE_API_BASE_URL` |
| Admin | `Front/Admin_interface/.env` | API URL (see `api.js`) |
| API | `Back/.env` | `APP_URL`, `DB_*`, `MAIL_*`, `FRONTEND_URL` |

Do **not** commit `.env` files. Use `.env.example` as a template.

For CORS in local dev, keep `APP_ENV=local` or `APP_DEBUG=true` on the API so frontend origins are allowed.

---

## Production build

**Front (each interface):**

```powershell
npm run build
```

Deploy the generated `dist/` folder to your static host or subdirectory.

**Back:**

```powershell
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Point the web server document root to `Back/public/`.

---

## Git

`Front/` and `Back/` are **independent Git repositories**. Commit and push from each folder separately:

```powershell
cd Front
git status
git add .
git commit -m "Your message"

cd ..\Back
git status
git add .
git commit -m "Your message"
```

---

## Further reading

- [Front/README.md](Front/README.md) — frontend apps overview
- [Back/README.md](Back/README.md) — Laravel installation and tests
- [Front/Client_interface/src/assets/images/README.txt](Front/Client_interface/src/assets/images/README.txt) — image asset usage

---

## License

MIT (unless otherwise specified in subprojects).
