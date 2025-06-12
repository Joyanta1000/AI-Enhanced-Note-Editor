import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';

function debounce<Func extends (...args: any[]) => void>(func: Func, wait: number): Func {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), wait);
    } as Func;
}

type Note = {
    id: number;
    title: string;
    content: string;
    slug: string;
};


type Props = {
    note: Note;
};


export default function Edit({ note }: Props) {


    const { flash = {} } = usePage().props as { flash?: { success?: string; error?: string } };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Modify Note',
            href: '/notes/{slug}/edit',
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        title: note.title,
        content: note.content,
        slug: note.slug,
    });

    const [aiErrors, setAiErrors] = useState<{ [key: string]: string[] }>({});

    const [loadingAI, setLoadingAI] = useState(false);

    const [saving, setSaving] = useState(false);

    const autoSave = debounce(() => {
        setSaving(true);
        put(route('notes.update', note.slug), {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }, 2000);


    useEffect(() => {
        if (data.title !== note.title || data.content !== note.content) {
            autoSave();
        }
    }, [data.title, data.content]);

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
        put(route('notes.update', note.slug));
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
            setSaving(true);
            autoSave();
        } catch (error) {
            console.error('Streaming error:', error);
            setAiErrors({ content: ['Failed to get AI summary.'] });
        }

        
        setLoadingAI(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className=' shadow-gray-400 rounded-xl p-4 overflow-x-auto'>
                <div className=" p-4 min-h-[100vh] rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* {flash.success && !saving && (
                        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && !saving && (
                        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
                            {flash.error}
                        </div>
                    )} */}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Title</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Content</label>
                            {/* <textarea
                                rows={10}
                                className="w-full border rounded px-3 py-2"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                            /> */}
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
                            {(errors.content || aiErrors.content) && <div className="text-red-600 text-sm">{errors.content ?? aiErrors.content}</div>}
                        </div>



                        <div className="md:flex md:justify-between gap-4">
                            {/* <button
                                type="submit"
                                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer ${processing ? ' cursor-not-allowed' : ''}`}
                                disabled={processing}
                            >
                                {processing ? 'Saving...' : 'Save'}
                            </button> */}

                            <button
                                type="submit"
                                className="bg-black text-white px-4 py-2 rounded  cursor-pointer"
                                onClick={handleEnhanceWithAI}
                                disabled={loadingAI}
                            >
                                {loadingAI ? 'Enhancing...' : 'Summarize Content with AI'}
                            </button>
                            <div className='flex gap-3 mt-2 md:mt-0'>
                                {!saving && (
                                    <span className="flex items-center gap-1 text-sm italic text-gray-500">
                                        <Loader2 className="w-4 h-4 " />
                                        Auto-saving is activated
                                    </span>
                                )}

                                {saving && (
                                    <span className="flex items-center gap-1 text-sm italic text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Auto-saving...
                                    </span>
                                )}

                                {!saving && flash.success && (
                                    <span className="flex items-center gap-1 text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                                        <CheckCircle className="w-4 h-4" />
                                        {flash.success}
                                    </span>
                                )}

                                {!saving && flash.error && (
                                    <span className="flex items-center gap-1 text-sm text-red-700 bg-red-100 px-2 py-1 rounded">
                                        <AlertCircle className="w-4 h-4" />
                                        {flash.error}
                                    </span>
                                )}
                            </div>


                        </div>
                    </form>
                </div>
            </div>

        </AppLayout>
    );
}
