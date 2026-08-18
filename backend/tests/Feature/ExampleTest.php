<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_storage_file_access(): void
    {
        \Illuminate\Support\Facades\Storage::disk('public')->put('test_prescription.txt', 'Prescription content');

        $response = $this->get('/storage/test_prescription.txt');
        $response->assertStatus(200);

        \Illuminate\Support\Facades\Storage::disk('public')->delete('test_prescription.txt');
    }
}
