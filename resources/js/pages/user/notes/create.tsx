import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';

export default function Create() {
    const { flash = {} } = usePage().props as { flash?: { success?: string; error?: string } };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'New Note', href: '/notes/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
    });

    const [aiErrors, setAiErrors] = useState<{ [key: string]: string[] }>({});
    const [loadingAI, setLoadingAI] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false,
                strike: false,
                code: false,
            }),
            Bold,
            Italic,
            Underline,
            Strike,
            Code,
        ],
        content: data.content,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert min-h-[300px] focus:outline-none p-4',
            },
        },
        onUpdate: ({ editor }) => {
            setData('content', editor.getHTML());
        },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('notes.store'));
    };

    const handleEnhanceWithAI = async () => {
        setLoadingAI(true);
        setAiErrors({});
        editor?.commands.setContent('');

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/notes/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'X-CSRF-TOKEN': csrf || '',
                },
                body: JSON.stringify({ content: data.content }),
            });

            if (!response.body) throw new Error('ReadableStream not supported.');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            let accumulatedContent = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value);
                    accumulatedContent += chunk;
                    editor?.commands.setContent(accumulatedContent, false);
                    
                }
            }

            setData('content', accumulatedContent);
           
        } catch (error) {
            console.error('Streaming error:', error);
            setAiErrors({ content: ['Failed to get AI summary.'] });
        }

        setLoadingAI(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Note" />
            <div className="p-4">
                <Card className="w-full">
                    <CardContent className="space-y-6">
                        {flash.success && <div className="bg-green-100 p-2 rounded text-green-800">{flash.success}</div>}
                        {flash.error && <div className="bg-red-100 p-2 rounded text-red-800">{flash.error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Content</label>
                                <div className="border rounded min-h-[200px] p-2">
                                    <div className="flex gap-2 mb-2">
                                        <Button className='cursor-pointer' type="button" onClick={() => editor?.chain().focus().toggleBold().run()} variant={editor?.isActive('bold') ? 'default' : 'outline'}>Bold</Button>
                                        <Button className='cursor-pointer' type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} variant={editor?.isActive('italic') ? 'default' : 'outline'}>Italic</Button>
                                        <Button className='cursor-pointer' type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} variant={editor?.isActive('underline') ? 'default' : 'outline'}>Underline</Button>
                                        <Button className='cursor-pointer' type="button" onClick={() => editor?.chain().focus().toggleStrike().run()} variant={editor?.isActive('strike') ? 'default' : 'outline'}>Strike</Button>
                                        <Button className='cursor-pointer' type="button" onClick={() => editor?.chain().focus().toggleCode().run()} variant={editor?.isActive('code') ? 'default' : 'outline'}>Code</Button>
                                    </div>
                                    <EditorContent editor={editor} />
                                </div>
                                {(errors.content || aiErrors.content) && <p className="text-red-600 text-sm">{errors.content ?? aiErrors.content}</p>}
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" className='cursor-pointer' disabled={processing}>
                                    {processing ? 'Saving...' : 'Save'}
                                </Button>
                                <Button type="button" variant="secondary" className='cursor-pointer' onClick={handleEnhanceWithAI} disabled={loadingAI}>
                                    {loadingAI ? 'Enhancing...' : 'Summarize content with AI'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
