import { useEffect, useState, useRef } from "react";
import Editor from "./Editor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AUTOSAVE_KEY = "notionBlogDraft";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [posts, setPosts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const autosaveTimer = useRef(null);

  // Load draft from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setTags(draft.tags || []);
        setImagePreview(draft.imagePreview || "");
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Debounced autosave after 30s of inactivity
  const scheduleAutosave = () => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = setTimeout(() => {
      try {
        const draft = {
          title,
          content,
          tags,
          imagePreview,
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
        toast.success("Draft auto-saved");
      } catch {
        toast.error("Failed to auto-save draft");
      }
    }, 30000); // 30 seconds
  };

  // Trigger autosave when title/content/tags/image change
  useEffect(() => {
    if (!title && !content && tags.length === 0 && !imagePreview) return;
    scheduleAutosave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, imagePreview]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.warn("Title and content are required");
      return;
    }
    const newPost = {
      id: Date.now(),
      title,
      content,
      tags,
      imagePreview,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setImageFile(null);
    setImagePreview("");
    setUploadProgress(0);
    localStorage.removeItem(AUTOSAVE_KEY);
    toast.success("Post saved successfully");
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);

    // Simulated upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success("Image uploaded (simulated)");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const filteredPosts = posts.filter((post) => {
    const text =
      (post.title || "") +
      " " +
      (post.content || "") +
      " " +
      (post.tags || []).join(" ");
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "16px" }}>
        <h1>Mini Blog Editor</h1>

        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
          />

          <div style={{ marginBottom: "8px" }}>
            <button onClick={() => setShowPreview(false)} disabled={!showPreview}>
              Editor
            </button>
            <button
              onClick={() => setShowPreview(true)}
              disabled={showPreview}
              style={{ marginLeft: "8px" }}
            >
              Preview
            </button>
          </div>

          {!showPreview ? (
            <Editor value={content} onChange={setContent} />
          ) : (
            <div
              style={{
                border: "1px solid #555",
                borderRadius: "4px",
                padding: "8px",
                minHeight: "150px",
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {/* Image upload section */}
          <div style={{ marginTop: "12px" }}>
            <label>
              Cover image:{" "}
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {uploadProgress > 0 && (
              <div
                style={{
                  marginTop: "6px",
                  width: "200px",
                  height: "8px",
                  background: "#eee",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${uploadProgress}%`,
                    background: "#4caf50",
                    transition: "width 0.2s",
                  }}
                />
              </div>
            )}

            {imagePreview && (
              <div style={{ marginTop: "8px" }}>
                <p style={{ marginBottom: "4px" }}>Image preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "200px", borderRadius: "4px" }}
                />
              </div>
            )}
          </div>

          {/* Tags input */}
          <div style={{ marginTop: "8px" }}>
            <input
              type="text"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              style={{ padding: "6px", marginRight: "8px" }}
            />
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  marginRight: "4px",
                  marginTop: "4px",
                  background: "#eee",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <button onClick={handleSave} style={{ marginTop: "8px" }}>
            Save Post
          </button>
        </div>

        <h2>Posts</h2>

        <div style={{ marginBottom: "8px" }}>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "6px" }}
          />
        </div>

        {filteredPosts.length === 0 && <p>No posts yet.</p>}

        {filteredPosts.map((post) => (
          <div
            key={post.id}
            style={{ border: "1px solid #444", padding: "8px", marginBottom: "8px" }}
          >
            <h3>{post.title}</h3>
            {post.tags && post.tags.length > 0 && (
              <p style={{ fontSize: "12px", color: "#555" }}>
                Tags: {post.tags.join(", ")}
              </p>
            )}
            {post.imagePreview && (
              <img
                src={post.imagePreview}
                alt="Post"
                style={{ maxWidth: "200px", borderRadius: "4px", marginBottom: "8px" }}
              />
            )}
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        ))}
      </div>

      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
