<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Super Admin Configuration
    |--------------------------------------------------------------------------
    |
    | The super admin email is the primary admin account.
    | This will be created automatically with real admin data.
    | Change this to your actual super admin email address.
    |
    */

    'super_admin_email' => env('SUPER_ADMIN_EMAIL', 'admin@cbsremotly.com'),
    'super_admin_name' => env('SUPER_ADMIN_NAME', 'Super Admin'),
    'super_admin_password' => env('SUPER_ADMIN_PASSWORD', 'password'), // Change this in .env file
    'super_admin_phone' => env('SUPER_ADMIN_PHONE', ''),
    'super_admin_address' => env('SUPER_ADMIN_ADDRESS', ''),

    /*
    |--------------------------------------------------------------------------
    | Admin Email Addresses
    |--------------------------------------------------------------------------
    |
    | List of email addresses that are considered admin users.
    | Users with these emails will have admin access.
    | Super admin email is automatically included.
    |
    */

    'emails' => [
        env('SUPER_ADMIN_EMAIL', 'admin@cbsremotly.com'), // Super admin (from config)
        // Add more admin emails here
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Email Pattern
    |--------------------------------------------------------------------------
    |
    | If you want to use email patterns instead of specific emails,
    | set 'use_pattern' to true and define patterns below.
    |
    */

    'use_pattern' => false,

    'email_patterns' => [
        '%@admin.%',      // emails ending with @admin.com, @admin.org, etc.
        '%admin@%',       // emails containing 'admin@'
        // Add more patterns here
    ],
];

