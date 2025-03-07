<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class RegisteredClientController extends Controller
{
    /**
     * Register a new client
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:clients',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create the client
            $client = Client::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                // Optional fields if submitted
                'phone' => $request->phone ?? null,
                'address' => $request->address ?? null,
                'city' => $request->city ?? null,
                'state' => $request->state ?? null,
                'postal_code' => $request->postal_code ?? null,
            ]);

            // Generate token for the client
            $token = $client->createToken('auth_token')->plainTextToken;

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'token' => $token,
                'user' => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle user login request
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by email
        $client = Client::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$client || !Hash::check($request->password, $client->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // Create token
        $token = $client->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email
            ]
        ]);
    }

    /**
     * Logout user - revoke token
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Revoke all tokens
            $request->user()->tokens()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
