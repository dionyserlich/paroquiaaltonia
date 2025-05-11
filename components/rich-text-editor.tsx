"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Undo,
  Redo,
  X,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = "Comece a escrever..." }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [showLinkMenu, setShowLinkMenu] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [showImageMenu, setShowImageMenu] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // Update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()

    setShowLinkMenu(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  const addImage = useCallback(async () => {
    if (!editor) return

    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setShowImageMenu(false)
      setImageUrl("")
    }
  }, [editor, imageUrl])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files || e.target.files.length === 0) return

    try {
      setIsUploading(true)
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem")
      }

      const data = await response.json()
      editor.chain().focus().setImage({ src: data.url }).run()
      setShowImageMenu(false)
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      alert("Erro ao fazer upload da imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  if (!isMounted) {
    return null
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-2 border-b border-gray-300 flex flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
          title="Negrito"
          type="button"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
          title="Itálico"
          type="button"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}`}
          title="Título 1"
          type="button"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}`}
          title="Título 2"
          type="button"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
          title="Lista com marcadores"
          type="button"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
          title="Lista numerada"
          type="button"
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => setShowLinkMenu(!showLinkMenu)}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
          title="Link"
          type="button"
        >
          <LinkIcon size={18} />
        </button>
        <button
          onClick={() => setShowImageMenu(!showImageMenu)}
          className={`p-2 rounded hover:bg-gray-200`}
          title="Imagem"
          type="button"
        >
          <ImageIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}`}
          title="Alinhar à esquerda"
          type="button"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}`}
          title="Centralizar"
          type="button"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}`}
          title="Alinhar à direita"
          type="button"
        >
          <AlignRight size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 ml-auto"
          title="Desfazer"
          type="button"
          disabled={!editor.can().undo()}
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Refazer"
          type="button"
          disabled={!editor.can().redo()}
        >
          <Redo size={18} />
        </button>
      </div>

      {showLinkMenu && (
        <div className="p-2 bg-gray-50 border-b border-gray-300 flex items-center">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="flex-1 p-2 border border-gray-300 rounded mr-2"
          />
          <button
            onClick={setLink}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            type="button"
          >
            Salvar
          </button>
          <button onClick={() => setShowLinkMenu(false)} className="ml-2 p-2 rounded hover:bg-gray-200" type="button">
            <X size={18} />
          </button>
        </div>
      )}

      {showImageMenu && (
        <div className="p-2 bg-gray-50 border-b border-gray-300">
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 p-2 border border-gray-300 rounded mr-2"
            />
            <button
              onClick={addImage}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              type="button"
            >
              Inserir
            </button>
            <button
              onClick={() => setShowImageMenu(false)}
              className="ml-2 p-2 rounded hover:bg-gray-200"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">ou</span>
            <label className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading ? "Enviando..." : "Fazer upload de imagem"}
            </label>
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  )
}
