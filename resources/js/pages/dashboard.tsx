import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type Note = {
    id: number;
    title: string;
    content: string;
    slug: string;
};

type Links = {
    url: string;
    label: string;
    active: boolean
}

type PaginatedNotes = {
    data: Note[];
    links: Links[];

};

type Props = {
    notes: PaginatedNotes;
};

export default function Dashboard({ notes }: Props) {
    const { flash = {} } = usePage().props as { flash?: { success?: string; error?: string } };

    const handleExportUrl = (note: Note) => {
        return  `/notes/export-raw?title=${encodeURIComponent(note.title)}&content=${encodeURIComponent(note.content)}`;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div> */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border px-2">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                    <div className='flex justify-end items-end px-4 py-4'>
                        <Link
                            href="/notes/create"
                            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                        >
                            Create Note
                        </Link>

                    </div>

                    {flash.success && (
                        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
                            {flash.error}
                        </div>
                    )}

                    <table className="min-w-full divide-y divide-gray-200 rounded-md overflow-hidden shadow-sm">
                        <thead className="">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                            {notes.data.map(note => (
                                <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                        {note.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 flex gap-2">
                                        <Link href={`/notes/${note.slug}/edit`} className="hover:underline">Edit</Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this note?')) {
                                                    router.delete(route('notes.destroy', note.slug));
                                                }
                                            }}
                                            className="text-red-500 hover:underline cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                        <a
                                            href={handleExportUrl(note)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-950 hover:underline"
                                        >
                                            Export as page
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 flex justify-center items-center gap-3 px-2">
                        {notes.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-md text-sm  ${link.active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    } ${!link.url && 'pointer-events-none opacity-50'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
