<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
  /**
   * @var array<int, string>|string|null
   */
    protected $proxies;

    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;

    public function __construct()
    {
        $trusted = env('TRUSTED_PROXIES');

        if ($trusted === '*' || $trusted === null) {
            $this->proxies = $trusted === '*' ? '*' : null;
        } else {
            $this->proxies = array_filter(array_map('trim', explode(',', $trusted)));
        }
    }
}
