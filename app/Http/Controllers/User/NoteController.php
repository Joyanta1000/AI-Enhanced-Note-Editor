<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\NoteStoreRequest;
use App\Http\Requests\Notes\SummarizeNoteRequest;
use App\Models\Note;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use OpenAI\Laravel\Facades\OpenAI;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('user/notes/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function summarizeNote(SummarizeNoteRequest $request)
    {
        $content = $request->input('content');

        $response = new StreamedResponse(function () use ($content) {
            // $client = OpenAI::client();

            $stream = OpenAI::chat()->createStreamed([
                'model' => 'gpt-4o-mini',
                'temperature' => 0.7,
                'max_tokens' => 300,
                'stream' => true,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an assistant that summarizes user-written notes. Keep it short and clear.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Please summarize this beautifully:\n\n" . $content,
                    ],
                ],
            ]);

            foreach ($stream as $chunk) {
                echo $chunk->choices[0]->delta->content ?? '';
                ob_flush();
                flush();
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Accel-Buffering', 'no');

        return $response;
    }
    public function store(NoteStoreRequest $request)
    {
        try {
            $note = Note::create([
                'title' => $request->title,
                'content' => $request->content,
                'slug' => \Str::slug($request->title) . '-' . uniqid(),
                'user_id' => auth()->id(),
            ]);

            return redirect()->route('notes.create')->with('success', 'Note created successfully.');
        } catch (Exception $e) {
            return redirect()->route('notes.create')->with('error', 'Something went wrong.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $slug)
    {
        return Inertia::render('user/notes/edit', [
            'note' => Note::where('slug', $slug)->first()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NoteStoreRequest $request, string $slug)
    {
        try {
            $note = Note::where('slug', $slug)->first();
            $note->title = $request->title;
            $note->content = $request->content;
            $note->save();
            return redirect()->back()->with('success', 'Note modified successfully.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $slug)
    {
        try {
            Note::where('slug', $slug)->delete();

            return redirect()->route('dashboard')->with('success', 'Note deleted.');
        } catch (Exception $e) {
            return redirect()->route('dashboard')->with('error', 'Something went wrong.');
        }
    }

    public function export(Request $request)
    {
        $_GET['title'] = $request->query('title');
        $_GET['content'] = $request->query('content');

        include public_path('exports/export-note.php');

        exit;
    }
}
