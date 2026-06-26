import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  MdFormatBold, MdFormatItalic, MdCode, MdLink, MdImage,
  MdFormatUnderlined, MdFormatQuote, MdFormatListBulleted,
  MdFormatListNumbered, MdTableChart, MdUndo, MdRedo,
  MdHorizontalRule
} from 'react-icons/md';
import { blogService } from '../services';

const MenuButton = ({ onClick, isActive, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all duration-150 text-sm ${
      isActive
        ? 'bg-white/15 text-white shadow-inner'
        : 'text-zinc-400 hover:text-white hover:bg-white/08'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-white/10 mx-1" />;

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false }),
      Image.configure({ resizable: true, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-zinc-300 underline underline-offset-4' } }),
      Placeholder.configure({ placeholder: 'Start writing your story...' }),
      Underline,
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content || '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: { class: 'tiptap-editor-content focus:outline-none' },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false);
    }
  }, [content]);

  if (!editor) return null;

  const addImage = async () => {
    const url = window.prompt('Enter image URL (or leave blank to upload):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
          const { data } = await blogService.uploadImage(formData);
          editor.chain().focus().setImage({ src: data.url }).run();
        } catch {
          alert('Image upload failed');
        }
      };
      input.click();
    }
  };

  const addLink = () => {
    const url = window.prompt('URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="neo-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-4 py-3 border-b border-white/06 bg-[#111111]">
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1">
          <span className="font-clash font-bold text-xs">H1</span>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2">
          <span className="font-clash font-bold text-xs">H2</span>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3">
          <span className="font-clash font-bold text-xs">H3</span>
        </MenuButton>
        <Divider />
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><MdFormatBold size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><MdFormatItalic size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><MdFormatUnderlined size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code"><MdCode size={18} /></MenuButton>
        <Divider />
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><MdFormatListBulleted size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><MdFormatListNumbered size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote"><MdFormatQuote size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block"><MdCode size={18} /></MenuButton>
        <Divider />
        <MenuButton onClick={addLink} isActive={editor.isActive('link')} title="Link"><MdLink size={18} /></MenuButton>
        <MenuButton onClick={addImage} title="Image"><MdImage size={18} /></MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Table"
        ><MdTableChart size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><MdHorizontalRule size={18} /></MenuButton>
        <Divider />
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><MdUndo size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><MdRedo size={18} /></MenuButton>
      </div>

      {/* Editor */}
      <div className="tiptap-editor blog-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
