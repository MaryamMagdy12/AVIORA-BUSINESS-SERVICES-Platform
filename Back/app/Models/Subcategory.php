<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Service;

class Subcategory extends Model
{
    use HasFactory;
    
    protected $fillable = ['name', 'service_id'];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
