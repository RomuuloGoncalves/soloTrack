<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function success($data = null, $message = 'Sucesso', $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }

    protected function error($message = 'Erro', $status = 400, $errors = [])
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }

}
