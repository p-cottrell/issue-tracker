import { BoldIcon, H1Icon, H2Icon, ItalicIcon, LinkIcon, ListBulletIcon, NumberedListIcon } from '@heroicons/react/24/outline';
import React from 'react';

const TiptapToolbar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="tiptap-toolbar flex space-x-2 bg-gray-100 p-2 rounded">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`btn ${editor.isActive('bold') ? 'btn-active' : ''}`}
                title="Bold"
            >
                {/* <strong>B</strong> */}
                <BoldIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`btn ${editor.isActive('italic') ? 'btn-active' : ''}`}
                title="Italic"
            >
                {/* <em>I</em> */}
                <ItalicIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`btn ${editor.isActive('bulletList') ? 'btn-active' : ''}`}
                title="Bullet List"
            >
                {/* • List */}
                <ListBulletIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`btn ${editor.isActive('orderedList') ? 'btn-active' : ''}`}
                title="Ordered List"
            >
                {/* 1. List */}
                <NumberedListIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`btn ${editor.isActive('heading', { level: 1 }) ? 'btn-active' : ''}`}
                title="Heading 1"
            >
                {/* H1 */}
                <H1Icon className="w-6 h-6" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`btn ${editor.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`}
                title="Heading 2"
            >
                {/* H2 */}
                <H2Icon className="w-6 h-6" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleLink({ href: prompt('Enter the URL') }).run()}
                className={`btn ${editor.isActive('link') ? 'btn-active' : ''}`}
                title="Link"
            >
                {/* 🔗 */}
                <LinkIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default TiptapToolbar;
