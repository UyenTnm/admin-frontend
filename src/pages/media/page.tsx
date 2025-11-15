"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminMediaPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const uploadFile = async () => {
    if (!file) return toast.error("Choose a file first");
    const form = new FormData();
    form.append("file", file);
    if (selectedProduct) form.append("productId", String(selectedProduct));

    const res = await fetch("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: form,
    });

    toast[res.ok ? "success" : "error"](
      res.ok ? "Uploaded successfully" : "Failed"
    );
  };

  const addYouTube = async () => {
    if (!youtubeUrl) return toast.error("Enter YouTube URL");
    const res = await fetch("http://localhost:3000/api/media/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtubeUrl, productId: selectedProduct }),
    });
    toast[res.ok ? "success" : "error"](
      res.ok ? "Added YouTube successfully" : "Failed"
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <h1 className="text-2xl font-semibold mb-4">🎥 Upload or Add YouTube</h1>

      {/* Select product */}
      <div>
        <label className="block mb-2 text-sm font-medium">
          Attach to product
        </label>
        <select
          className="w-full border rounded-md px-3 py-2"
          value={selectedProduct ?? ""}
          onChange={(e) =>
            setSelectedProduct(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">— No product —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload file */}
      <div className="glass p-5 rounded-xl space-y-3">
        <h2 className="font-medium text-lg">Upload File (mp4/mp3)</h2>
        <input
          type="file"
          accept="video/*,audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
        <button
          onClick={uploadFile}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Upload File
        </button>
      </div>

      {/* Add YouTube */}
      <div className="glass p-5 rounded-xl space-y-3">
        <h2 className="font-medium text-lg">Add YouTube Link</h2>
        <input
          type="text"
          value={title}
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="text"
          value={youtubeUrl}
          placeholder="https://youtube.com/watch?v=..."
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <button
          onClick={addYouTube}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add YouTube
        </button>
      </div>
    </div>
  );
}
