<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;

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

/**
     * Get authenticated user profile
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'state' => $user->state,
                'postal_code' => $user->postal_code
            ]
        ]);
    }
    
    /**
     * Update client profile
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        // Validar datos
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:clients,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'current_password' => 'required_with:new_password',
            'new_password' => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verificar contraseña actual si se está actualizando la contraseña
            if ($request->has('new_password') && $request->filled('new_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'La contraseña actual es incorrecta',
                        'errors' => [
                            'current_password' => ['La contraseña actual es incorrecta']
                        ]
                    ], 422);
                }
                
                $user->password = Hash::make($request->new_password);
            }

            // Actualizar otros campos
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            
            if ($request->has('phone')) {
                $user->phone = $request->phone;
            }
            
            if ($request->has('address')) {
                $user->address = $request->address;
            }
            
            if ($request->has('city')) {
                $user->city = $request->city;
            }
            
            if ($request->has('state')) {
                $user->state = $request->state;
            }
            
            if ($request->has('postal_code')) {
                $user->postal_code = $request->postal_code;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'city' => $user->city,
                    'state' => $user->state,
                    'postal_code' => $user->postal_code
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a reset link email to the user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email|exists:clients,email',
    ], [
        'email.exists' => 'No encontramos un usuario con ese correo electrónico.'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validación fallida',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        // Generar un código de 6 dígitos
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $email = $request->email;
        
        // Obtener el nombre del usuario
        $client = Client::where('email', $email)->first();
        $userName = $client ? $client->name : null;
        
        // Generar token para validación
        $token = Str::random(60);
        
        // Almacenar token y código en la tabla password_resets
        DB::table('password_resets')->where('email', $email)->delete();
        DB::table('password_resets')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'code' => $code,
            'created_at' => Carbon::now()
        ]);
        
        try {
            \Log::info("Intentando enviar email a: {$email} con código: {$code}");
            
            // Activa el envío real de email
            Mail::to($email)->send(new ResetPasswordMail($code, $userName));
            
            \Log::info("Email enviado exitosamente");
        } catch (\Exception $e) {
            \Log::error("Error al enviar email: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            // Continuar el flujo aunque falle el email (para desarrollo)
        }
        
        // Para producción, elimina la línea 'code' => $code
        return response()->json([
            'success' => true,
            'message' => 'Hemos enviado un código de verificación a tu correo electrónico.',
            'token' => $token,
            'code' => $code // Solo para desarrollo
        ]);
    } catch (\Exception $e) {
        \Log::error('Error general: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'No se pudo procesar la solicitud de recuperación.',
            'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
        ], 500);
    }
}
    /**
     * Verify reset password code
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validación fallida',
                'errors' => $validator->errors()
            ], 422);
        }

        $resetRecord = DB::table('password_resets')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró solicitud de restablecimiento para este email.'
            ], 404);
        }

        // Verificar expiración (1 hora)
        if (Carbon::parse($resetRecord->created_at)->addHour()->isPast()) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            
            return response()->json([
                'success' => false,
                'message' => 'El código ha expirado. Solicita un nuevo código de restablecimiento.'
            ], 401);
        }

        // Verificar código
        if ($resetRecord->code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Código de verificación incorrecto.'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Código verificado correctamente.',
            'token' => $request->token
        ]);
    }

    /**
     * Reset user password
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validación fallida',
                'errors' => $validator->errors()
            ], 422);
        }

        $resetRecord = DB::table('password_resets')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró solicitud de restablecimiento para este email.'
            ], 404);
        }

        // Verificar expiración (1 hora)
        if (Carbon::parse($resetRecord->created_at)->addHour()->isPast()) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            
            return response()->json([
                'success' => false,
                'message' => 'El enlace ha expirado. Solicita un nuevo restablecimiento.'
            ], 401);
        }

        $client = Client::where('email', $request->email)->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró usuario con ese email.'
            ], 404);
        }

        // Actualizar contraseña
        $client->password = Hash::make($request->password);
        $client->save();

        // Eliminar registro de restablecimiento
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contraseña restablecida correctamente.'
        ]);
    }
}