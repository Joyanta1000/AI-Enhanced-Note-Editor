<?php

namespace App\Http\Requests\Notes;

use Illuminate\Foundation\Http\FormRequest;

class NoteStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|min:2',
            'content' => 'required|string|min:10',
        ];
    }
}
