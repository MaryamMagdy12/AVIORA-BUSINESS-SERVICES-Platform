<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    // public function run(): void
    // {
    //     $adminRole = Role::where('name', 'admin')->first();
        
    //     if (!$adminRole) {
    //         $this->command->error('Admin role not found. Please run RoleSeeder first.');
    //         return;
    //     }

    //     // Get super admin details from config (not hardcoded)
    //     $superAdminEmail = config('admin.super_admin_email', 'admin@cbsremotly.com');
    //     $superAdminName = config('admin.super_admin_name', 'Super Admin');
    //     $superAdminPassword = config('admin.super_admin_password', 'password');

    //     // Use updateOrCreate to ensure super admin exists and is always verified
    //     // This creates REAL admin data (not fake seeder data)
    //     // The email comes from config file, so it's constant and configurable
    //     $superAdmin = User::updateOrCreate(
    //         ['email' => $superAdminEmail],
    //         [
    //             'name' => $superAdminName,
    //             'password' => Hash::make($superAdminPassword),
    //             'phone' => config('admin.super_admin_phone', ''),
    //             'address' => config('admin.super_admin_address', ''),
    //             'role_id' => $adminRole->id,
    //             'email_verified_at' => now(), // Auto-verify super admin email - always verified
    //         ]
    //     );
        
    //     $this->command->info("Super Admin ({$superAdminEmail}) created/updated and auto-verified!");
    //     $this->command->info("Name: {$superAdminName}");
    //     $this->command->warn("Password: {$superAdminPassword} (Change SUPER_ADMIN_PASSWORD in .env file)");
    // }
}
