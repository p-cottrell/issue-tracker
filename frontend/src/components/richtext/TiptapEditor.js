import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import OrderedList from '@tiptap/extension-ordered-list';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';
import './tiptap.css';
import TiptapToolbar from './TiptapToolbar';

const TiptapEditor = ({ content, setContent }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Bold,
            Italic,
            BulletList,
            OrderedList,
            Link,
            Heading.configure({
                levels: [1, 2, 3],
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    return (
        <div className="tiptap-editor">
            {editor && <TiptapToolbar editor={editor} />}
            <EditorContent editor={editor} className="tiptap-content" />
        </div>
    );
};

export default TiptapEditor;
