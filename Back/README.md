# Aviora Business Services - Laravel Project

A Laravel-based application for managing appointments, services, and payments.

## Requirements

- PHP ^8.2
- Laravel Framework ^12.0
- Composer
- Node.js & NPM

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CBS
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install NPM dependencies:
```bash
npm install
```

4. Copy environment file:
```bash
cp .env.example .env
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Run migrations:
```bash
php artisan migrate
```

7. Build assets:
```bash
npm run build
```

## Development

Run the development server:
```bash
composer run dev
```

Or run individually:
```bash
php artisan serve
npm run dev
```

## Testing

Run tests:
```bash
composer run test
```

## License

MIT

