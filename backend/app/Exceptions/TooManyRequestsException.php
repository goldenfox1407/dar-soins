<?php

namespace App\Exceptions;

use Illuminate\Http\Response;
use Exception;

class TooManyRequestsException extends Exception
{
    public function render($request)
    {
        return response()->json(['message' => 'Too many requests'], Response::HTTP_TOO_MANY_REQUESTS);
    }
}