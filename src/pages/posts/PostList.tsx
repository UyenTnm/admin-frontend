import { useEffect, useState } from "react";
import { rest } from "@/lib/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";

export default function PostList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await rest.get("/posts");
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      await rest.delete(`/posts/${id}`);
      toast.success("Deleted");
      fetchPosts();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const togglePublish = async (id: number) => {
    try {
      await rest.patch(`/posts/${id}/toggle`);
      toast.success("Toggled publish state");
      fetchPosts();
    } catch {
      toast.error("Failed to toggle publish");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link
          to="/posts/new"
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-neutral-100 dark:bg-neutral-900">
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Slug</th>
            <th className="text-left p-2">Published</th>
            <th className="text-left p-2">Updated</th>
            <th className="text-right p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr
              key={p.id}
              className="border-b border-neutral-200 dark:border-neutral-800"
            >
              <td className="p-2">{p.title}</td>
              <td className="p-2 text-neutral-500">{p.slug}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded-md text-xs ${
                    p.published
                      ? "bg-green-600/20 text-green-400"
                      : "bg-neutral-700/20 text-neutral-400"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="p-2">
                {new Date(p.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-2 text-right space-x-2">
                <Link
                  to={`/posts/${p.id}`}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => togglePublish(p.id)}
                  className="text-yellow-500 hover:underline"
                >
                  Toggle
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
