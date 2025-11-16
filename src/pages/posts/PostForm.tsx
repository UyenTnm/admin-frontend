import { useEffect, useState } from "react";
import { rest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";

/* -----------------------------------
   Upload helper
----------------------------------- */
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/api/upload/posts", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();

  // Fix đường dẫn tương đối
  const url = data.url.startsWith("http")
    ? data.url
    : `http://localhost:3000${data.url}`;

  return url;
}

/* -----------------------------------
   PostForm Component
----------------------------------- */
export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false); // Mobile preview toggle

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    summary: "",
    slug: "",
    content: "",
    coverImage: "",
    published: false,
  });

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* -----------------------------------
     Load dữ liệu khi Edit
  ----------------------------------- */
  useEffect(() => {
    (async () => {
      if (!isEdit) return setLoading(false);
      try {
        const data = await rest.get(`/posts/${id}`);
        setForm(data);
      } catch {
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  /* -----------------------------------
     Theo dõi theme tự động
  ----------------------------------- */
  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => {
      setTheme(html.classList.contains("light") ? "light" : "dark");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  /* -----------------------------------
     WYSIWYG (Tiptap)
  ----------------------------------- */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Image,
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[250px] rounded-xl p-4 focus:outline-none text-[var(--fg)] prose prose-sm dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => {
      handleChange("content", editor.getHTML());
    },
  });

  // Chỉ setContent 1 lần khi edit bài cũ
  useEffect(() => {
    if (editor && form.content && isEdit && !loading) {
      editor.commands.setContent(form.content);
    }
  }, [editor, form.content, isEdit, loading]);

  /* -----------------------------------
     Upload ảnh trong nội dung
  ----------------------------------- */
  const handleInsertImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        toast.loading("Uploading image...");
        const url = await uploadFile(file);
        editor?.chain().focus().setImage({ src: url }).run();
        toast.dismiss();
        toast.success("Image inserted!");
      } catch {
        toast.dismiss();
        toast.error("Failed to upload image");
      }
    };
  };

  /* -----------------------------------
    Upload ảnh bìa
  ----------------------------------- */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, coverImage: url }));
      toast.success("Cover image uploaded!");
    } catch {
      toast.error("Failed to upload image");
    }
  };

  /* -----------------------------------
    Submit form
  ----------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!editor?.getText().trim()) return toast.error("Content is required");

    const generatedSlug = form.slug?.trim()
      ? form.slug.trim().toLowerCase().replace(/\s+/g, "-")
      : form.title.trim().toLowerCase().replace(/\s+/g, "-");

    const payload = {
      ...form,
      slug: generatedSlug,
      published: Boolean(form.published),
      publishedAt: form.published ? new Date().toISOString() : null,
    };

    try {
      if (isEdit) {
        await rest.patch(`/posts/${id}`, payload);
        toast.success("Post updated!");
      } else {
        await rest.post("/posts", payload);
        toast.success("Post created!");
      }
      navigate("/posts");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save post");
    }
  };

  /* -----------------------------------
    Mobile Tab Switch (Edit / Preview)
  ----------------------------------- */
  const renderTabs = (
    <div className="lg:hidden flex justify-center mb-4">
      <button
        type="button"
        onClick={() => setIsPreview(false)}
        className={`px-4 py-2 rounded-l-lg ${
          !isPreview
            ? "bg-blue-600 text-white"
            : "bg-[var(--card)] text-[var(--fg)]"
        }`}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => setIsPreview(true)}
        className={`px-4 py-2 rounded-r-lg ${
          isPreview
            ? "bg-blue-600 text-white"
            : "bg-[var(--card)] text-[var(--fg)]"
        }`}
      >
        Preview
      </button>
    </div>
  );

  /* -----------------------------------
    UI Layout
  ----------------------------------- */
  if (loading) return <div className="p-6 text-[var(--fg)]">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4">
      {renderTabs}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT: FORM */}
        <Card
          className={`p-6 glass border border-[var(--card-border)] rounded-2xl backdrop-blur-xl shadow-lg ${
            isPreview ? "hidden lg:block" : ""
          }`}
        >
          <h1 className="text-2xl font-semibold mb-6 text-[var(--fg)]">
            {isEdit ? "Edit Post" : "Create New Post"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Title"
              value={form.title}
              onChange={(v) => handleChange("title", v)}
              placeholder="Enter post title"
            />

            <FormInput
              label="Subtitle"
              value={form.subtitle}
              onChange={(v) => handleChange("subtitle", v)}
              placeholder="Short descriptive line below title"
            />

            <FormTextarea
              label="Summary"
              value={form.summary}
              onChange={(v) => handleChange("summary", v)}
              placeholder="Short summary for preview or meta description..."
            />

            <FormInput
              label="Slug"
              value={form.slug}
              onChange={(v) => handleChange("slug", v)}
              placeholder="auto-generated if left blank"
            />

            {/* WYSIWYG */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]/80">
                Content
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <ToolbarButton
                  active={editor?.isActive("bold")}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <b>B</b>
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive("italic")}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <i>I</i>
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive("bulletList")}
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                >
                  • List
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive("blockquote")}
                  onClick={() =>
                    editor?.chain().focus().toggleBlockquote().run()
                  }
                >
                  ❝ Quote
                </ToolbarButton>
                <ToolbarButton onClick={handleInsertImage}>Image</ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    const url = prompt("Enter link URL");
                    if (url)
                      editor
                        ?.chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: url })
                        .run();
                  }}
                >
                  Link
                </ToolbarButton>
              </div>

              <div
                className="border border-[var(--card-border)] rounded-xl bg-[var(--card)] p-2 min-h-[250px]"
                data-theme={theme}
              >
                <EditorContent editor={editor} />
              </div>
            </div>

            <FormFile
              label="Cover Image"
              onChange={handleCoverUpload}
              preview={form.coverImage}
            />

            <div className="flex items-center gap-3 mt-2">
              <input
                id="published"
                type="checkbox"
                checked={form.published}
                onChange={(e) => handleChange("published", e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="published" className="text-[var(--fg)]/80">
                Published
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/posts")}
                className="px-5 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--card-border)] text-[var(--fg)] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
              >
                {isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Card>

        {/* RIGHT: LIVE PREVIEW */}
        <div className={`${!isPreview && "hidden lg:block"}`}>
          <div className="sticky top-10">
            <Card className="p-5 glass border border-[var(--card-border)] rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold mb-3 text-[var(--fg)]/90">
                Live Preview
              </h2>

              {form.coverImage ? (
                <img
                  src={form.coverImage}
                  alt="preview cover"
                  className="rounded-xl w-full h-48 object-cover mb-4 border border-[var(--card-border)]"
                />
              ) : (
                <div className="w-full h-48 mb-4 bg-[var(--card)] border border-[var(--card-border)] rounded-xl flex items-center justify-center text-[var(--fg)]/50">
                  No cover image
                </div>
              )}

              <h3 className="text-2xl font-bold text-[var(--fg)]">
                {form.title || "Post title..."}
              </h3>
              {form.subtitle && (
                <p className="text-[var(--fg)]/70 mt-1 italic">
                  {form.subtitle}
                </p>
              )}
              {form.summary && (
                <p className="text-[var(--fg)]/80 mt-3 text-sm leading-relaxed">
                  {form.summary}
                </p>
              )}

              <div
                className="prose prose-sm dark:prose-invert mt-4 border-t border-[var(--card-border)] pt-3"
                dangerouslySetInnerHTML={{
                  __html: editor?.getHTML() || "<p>Start writing...</p>",
                }}
              ></div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */
function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-md border text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-gray-200 dark:bg-gray-700 text-[var(--fg)] border-gray-400/20"
      } hover:opacity-90`}
    >
      {children}
    </button>
  );
}

function FormInput({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-[var(--fg)]/80">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--fg)] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-[var(--fg)]/80">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 h-24 rounded-xl resize-none bg-[var(--card)] border border-[var(--card-border)] text-[var(--fg)] placeholder-[var(--muted)] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
    </div>
  );
}

function FormFile({ label, onChange, preview }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-[var(--fg)]/80">
        {label}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="block w-full text-sm text-[var(--fg)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
      />
      {preview && (
        <div className="mt-4 relative group">
          <img
            src={preview}
            alt="cover preview"
            className="rounded-xl w-full h-48 object-cover border border-[var(--card-border)] transition group-hover:scale-[1.02]"
          />
        </div>
      )}
    </div>
  );
}
