<?php

$options = [

    /*
    |--------------------------------------------------------------------------
    | Server Host
    |--------------------------------------------------------------------------
    |
    | This is the host the Reverb server will listen on. You may either use
    | "localhost", any IP address, or "0.0.0.0" to listen on all interfaces.
    |
    */

    'server' => [
        'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
        'port' => env('REVERB_SERVER_PORT', 8080),
        'hostname' => env('REVERB_HOST'),
        'options' => [
            'tls' => [
                'local_cert' => env('REVERB_TLS_CERT', null),
                'local_pk' => env('REVERB_TLS_PK', null),
                'passphrase' => env('REVERB_TLS_PASSPHRASE', null),
            ],
        ],
        'max_request_size' => env('REVERB_MAX_REQUEST_SIZE', 10_000),
        'scaling' => [
            'enabled' => env('REVERB_SCALING_ENABLED', false),
            'channel' => env('REVERB_SCALING_CHANNEL', 'reverb'),
            'servers' => [
                'host' => env('REDIS_HOST', '127.0.0.1'),
                'port' => env('REDIS_PORT', '6379'),
                'password' => env('REDIS_PASSWORD', null),
                'username' => env('REDIS_USERNAME', null),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Applications
    |--------------------------------------------------------------------------
    |
    | Here you may define how the Reverb server should handle the incoming
    | connections for your application.
    |
    */

    'apps' => [
        [
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_HOST'),
                'port' => env('REVERB_PORT', 443),
                'scheme' => env('REVERB_SCHEME', 'https'),
                'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
            ],
            'max_connections' => env('REVERB_MAX_CONNECTIONS', 200),
            'allowed_origins' => ['*'],
            'ping_interval' => env('REVERB_PING_INTERVAL', 60),
            'max_payload_size' => env('REVERB_MAX_PAYLOAD_SIZE', 10_000),
        ],
    ],
];

return $options;
