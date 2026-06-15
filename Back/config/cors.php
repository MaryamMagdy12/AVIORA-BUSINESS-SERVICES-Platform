<?php

$appUrl = (string) env('APP_URL', '');
$isLocalDev = in_array(env('APP_ENV'), ['local', 'testing'], true)
    || filter_var(env('APP_DEBUG', false), FILTER_VALIDATE_BOOLEAN)
    || str_contains($appUrl, 'localhost')
    || str_contains($appUrl, '127.0.0.1');

return [

    'paths' => ['*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(array_unique([
        env('FRONTEND_URL'),
        env('ADMIN_FRONTEND_URL'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'https://cbsremotly.com',
        'https://www.cbsremotly.com',
    ]))),

    // Localhost patterns are safe: browsers only send these origins from local dev, not from attacker sites.
    'allowed_origins_patterns' => [
        '/^http:\/\/localhost:\d+$/',
        '/^http:\/\/127\.0\.0\.1:\d+$/',
        '/^https:\/\/.*\.cbsremotly\.com$/',
    ],

    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'Authorization', 'Accept', 'X-Payment-Token', 'X-Payment-Signature', 'X-Webhook-Signature'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => true,

];
