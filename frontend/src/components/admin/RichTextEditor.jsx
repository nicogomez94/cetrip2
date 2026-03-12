import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeToHtml = (value) => {
  if (!value) return '';
  if (HTML_TAG_REGEX.test(value)) return value;
  return `<p>${escapeHtml(value).replace(/\n/g, '<br />')}</p>`;
};

function ToolbarButton({ editor, title, active = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      className={`rte-toolbar__btn${active ? ' is-active' : ''}`}
      disabled={disabled || !editor}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: normalizeToHtml(value),
    editorProps: {
      attributes: {
        class: 'rte-content',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = normalizeToHtml(value);
    const currentContent = editor.getHTML();
    if (nextContent !== currentContent) {
      editor.commands.setContent(nextContent, false);
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Ingresá la URL del enlace', previousUrl);
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const setImage = () => {
    if (!editor) return;
    const src = window.prompt('Ingresá la URL de la imagen');
    if (!src || !src.trim()) return;
    editor.chain().focus().setImage({ src: src.trim() }).run();
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <ToolbarButton
          editor={editor}
          title="Negrita"
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Cursiva"
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Subrayado"
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          U
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="H1"
          active={editor?.isActive('heading', { level: 1 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="H2"
          active={editor?.isActive('heading', { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="H3"
          active={editor?.isActive('heading', { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Lista con viñetas"
          active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          UL
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Lista numerada"
          active={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          OL
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Enlace"
          active={editor?.isActive('link')}
          onClick={setLink}
        >
          Link
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Imagen" onClick={setImage}>
          Img
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Alinear izquierda"
          active={editor?.isActive({ textAlign: 'left' })}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        >
          Izq
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Alinear centro"
          active={editor?.isActive({ textAlign: 'center' })}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        >
          Cen
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Alinear derecha"
          active={editor?.isActive({ textAlign: 'right' })}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        >
          Der
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Justificar"
          active={editor?.isActive({ textAlign: 'justify' })}
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
        >
          Jus
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Deshacer"
          disabled={!editor?.can().chain().focus().undo().run()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          title="Rehacer"
          disabled={!editor?.can().chain().focus().redo().run()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          Redo
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
