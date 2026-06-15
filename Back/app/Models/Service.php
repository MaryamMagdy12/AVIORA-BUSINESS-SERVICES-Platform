<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function getDescriptionAttribute(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        return preg_replace('/\bCBS\b/i', 'Aviora', $value);
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class);
    }
}
