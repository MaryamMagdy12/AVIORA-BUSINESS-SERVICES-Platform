<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $replacements = [
            'Accounting & Financial Services' => 'Accurate, compliant, and reliable financial management delivered remotely. Aviora handles all accounting tasks so you can focus on growing your business.',
            'Fully Managed Remote Teams' => 'Aviora builds and manages complete remote departments—Finance, HR, and Support—without the cost of in-house staffing.',
        ];

        foreach ($replacements as $name => $description) {
            DB::table('services')
                ->where('name', $name)
                ->update(['description' => $description]);
        }

        Cache::forget('services.public');
        Cache::forget('services.public.v2');
    }

    public function down(): void
    {
        $originals = [
            'Accounting & Financial Services' => 'Accurate, compliant, and reliable financial management delivered remotely. CBS handles all accounting tasks so you can focus on growing your business.',
            'Fully Managed Remote Teams' => 'CBS builds and manages complete remote departments—Finance, HR, and Support—without the cost of in-house staffing.',
        ];

        foreach ($originals as $name => $description) {
            DB::table('services')
                ->where('name', $name)
                ->update(['description' => $description]);
        }
    }
};
