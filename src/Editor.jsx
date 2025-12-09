import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const run = (command) => {
    editor.chain().focus()[command]().run();
  };

  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <button onClick={() => run("toggleBold")}><b>B</b></button>
        <button onClick={() => run("toggleItalic")} style={{ marginLeft: "4px" }}>
          <i>I</i>
        </button>
        <button onClick={() => run("toggleBulletList")} style={{ marginLeft: "4px" }}>
          • List
        </button>
        <button onClick={() => run("toggleOrderedList")} style={{ marginLeft: "4px" }}>
          1. List
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={{ marginLeft: "4px" }}>
          H1
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={{ marginLeft: "4px" }}>
          H2
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={{ marginLeft: "4px" }}>
          H3
        </button>
      </div>

      <div style={{ 
        border: "1px solid #555", 
        borderRadius: "4px", 
        padding: "8px", 
        minHeight: "150px",
        fontSize: "16px",
        lineHeight: "1.5",
        color: "#333"
      }}>
        <style>{`
          .ProseMirror {
            outline: none;
            min-height: 150px;
          }
          .ProseMirror p {
            margin: 8px 0;
          }
          .ProseMirror ul, .ProseMirror ol {
            margin: 8px 0 8px 16px;
          }
          .ProseMirror h1 {
            font-size: 24px;
            margin: 12px 0 8px 0;
          }
          .ProseMirror h2 {
            font-size: 20px;
            margin: 10px 0 8px 0;
          }
          .ProseMirror h3 {
            font-size: 18px;
            margin: 8px 0 6px 0;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
