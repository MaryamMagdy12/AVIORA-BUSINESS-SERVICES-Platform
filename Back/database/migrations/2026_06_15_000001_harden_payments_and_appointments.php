<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('payments', 'access_token_hash')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->string('access_token_hash', 255)->nullable()->after('transaction_id');
                $table->timestamp('paid_at')->nullable()->after('status');
                $table->string('confirmed_by', 32)->nullable()->after('paid_at');
                $table->foreignId('confirmed_by_user_id')->nullable()->after('confirmed_by')
                    ->constrained('users')->nullOnDelete();
            });
        }

        if (!Schema::hasTable('payment_audit_logs')) {
            Schema::create('payment_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
                $table->string('action');
                $table->string('source');
                $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['payment_id', 'created_at']);
            });
        }

        if ($this->indexExists('appointments', 'appointments_slot_id_unique')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->dropForeign(['slot_id']);
                $table->dropUnique(['slot_id']);
                $table->foreign('slot_id')->references('id')->on('appointments_slots')->cascadeOnDelete();
            });
        }

        if (!$this->indexExists('appointments_slots', 'appointments_slots_date_time_unique')) {
            Schema::table('appointments_slots', function (Blueprint $table) {
                $table->unique(['date', 'time']);
            });
        }

        if (!$this->indexExists('appointment_services', 'appointment_services_appointment_id_service_id_unique')) {
            Schema::table('appointment_services', function (Blueprint $table) {
                $table->unique(['appointment_id', 'service_id']);
            });
        }

        $this->addIndexIfMissing('users', 'users_role_id_index', fn (Blueprint $table) => $table->index('role_id'));
        $this->addIndexIfMissing('appointments', 'appointments_user_id_index', fn (Blueprint $table) => $table->index('user_id'));
        $this->addIndexIfMissing('appointments', 'appointments_slot_id_index', fn (Blueprint $table) => $table->index('slot_id'));
        $this->addIndexIfMissing('appointments', 'appointments_status_index', fn (Blueprint $table) => $table->index('status'));
        $this->addIndexIfMissing('appointments_slots', 'appointments_slots_date_status_index', fn (Blueprint $table) => $table->index(['date', 'status']));
        $this->addIndexIfMissing('payments', 'payments_user_id_index', fn (Blueprint $table) => $table->index('user_id'));
        $this->addIndexIfMissing('payments', 'payments_appointment_id_index', fn (Blueprint $table) => $table->index('appointment_id'));
        $this->addIndexIfMissing('payments', 'payments_status_index', fn (Blueprint $table) => $table->index('status'));
        $this->addIndexIfMissing('contact_messages', 'contact_messages_status_index', fn (Blueprint $table) => $table->index('status'));
        $this->addIndexIfMissing('contact_messages', 'contact_messages_created_at_index', fn (Blueprint $table) => $table->index('created_at'));
    }

    public function down(): void
    {
        // Intentionally minimal — production rollback should be a dedicated migration.
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();

        $result = $connection->select(
            'SELECT COUNT(*) AS count FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$database, $table, $indexName]
        );

        return ($result[0]->count ?? 0) > 0;
    }

    private function addIndexIfMissing(string $table, string $indexName, callable $callback): void
    {
        if (!$this->indexExists($table, $indexName)) {
            Schema::table($table, $callback);
        }
    }
};
