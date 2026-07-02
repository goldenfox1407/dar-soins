<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    public static function remember(string $key, int $ttl, \Closure $callback)
    {
        return Cache::remember($key, $ttl, $callback);
    }

    public static function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    public static function flush(): bool
    {
        return Cache::flush();
    }

    public static function tags(array $tags)
    {
        return Cache::tags($tags);
    }
}