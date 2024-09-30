import { BoldIcon, ChatBubbleBottomCenterTextIcon, EllipsisHorizontalCircleIcon, H1Icon, H2Icon, ItalicIcon, LinkIcon, ListBulletIcon, NumberedListIcon, UnderlineIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';

const TiptapToolbar = ({ editor }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isOverflow, setIsOverflow] = useState(false);
    const toolbarRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (toolbarRef.current) {
                setIsOverflow(toolbarRef.current.scrollWidth > toolbarRef.current.clientWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (!editor) {
        return null;
    }

    const buttons = (
        <>
            <div className="btn-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`btn btn-left ${editor.isActive('bold') ? 'btn-active' : ''}`}
                    title="Bold"
                >
                    <BoldIcon className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`btn btn-middle ${editor.isActive('italic') ? 'btn-active' : ''}`}
                    title="Italic"
                >
                    <ItalicIcon className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`btn btn-right ${editor.isActive('underline') ? 'btn-active' : ''}`}
                    title="Underline"
                >
                    <UnderlineIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="btn-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`btn btn-left ${editor.isActive('blockquote') ? 'btn-active' : ''}`}
                    title="Blockquote"
                >
                    <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`btn btn-middle ${editor.isActive('bulletList') ? 'btn-active' : ''}`}
                    title="Bullet List"
                >
                    <ListBulletIcon className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`btn btn-right ${editor.isActive('orderedList') ? 'btn-active' : ''}`}
                    title="Ordered List"
                >
                    <NumberedListIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="btn-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`btn btn-left ${editor.isActive('heading', { level: 1 }) ? 'btn-active' : ''}`}
                    title="Heading 1"
                >
                    <H1Icon className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`btn btn-right ${editor.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`}
                    title="Heading 2"
                >
                    <H2Icon className="w-6 h-6" />
                </button>
            </div>
            <div className="btn-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleLink({ href: prompt('Enter the URL') }).run()}
                    className={`btn ${editor.isActive('link') ? 'btn-active' : ''}`}
                    title="Link"
                >
                    <LinkIcon className="w-6 h-6" />
                </button>
            </div>
        </>
    );

    return (
        <div className="relative">
            <div ref={toolbarRef} className="tiptap-toolbar flex space-x-2 bg-gray-100 p-2 rounded-tl rounded-tr overflow-hidden">
                {isOverflow ? (
                    <button
                        type="button"
                        onClick={() => setShowMenu(!showMenu)}
                        className="btn"
                        title="More"
                    >
                        <EllipsisHorizontalCircleIcon className="w-6 h-6" />
                    </button>
                ) : (
                    buttons
                )}
            </div>
            {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                    {buttons}
                </div>
            )}
        </div>
    );
};

export default TiptapToolbar;