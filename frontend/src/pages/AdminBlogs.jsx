import { useState, useEffect } from 'react';
import { blogAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiPlus, BiEdit, BiTrash, BiX, BiSearch, BiShow } from 'react-icons/bi';

const CATEGORIES = ['Blood Donation', 'Health Tips', 'Nutrition', 'Medical News', 'Awareness', 'Success Stories', 'Blood Camps', 'Emergency Care'];

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '', category: 'Blood Donation',
    coverImage: '', author: '', tags: '', readingTime: 5, published: false
  });

  useEffect(() => { loadBlogs(); }, []);

  const loadBlogs = async () => {
    try {
      const res = await blogAPI.getAll({ limit: 100 });
      setBlogs(res.data.blogs);
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (title) => {
    setForm(prev => ({ ...prev, title, slug: editing ? prev.slug : generateSlug(title) }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', content: '', excerpt: '', category: 'Blood Donation', coverImage: '', author: '', tags: '', readingTime: 5, published: false });
    setShowForm(true);
  };

  const openEdit = async (blog) => {
    setEditing(blog);
    setForm({
      title: blog.title, slug: blog.slug, content: blog.content, excerpt: blog.excerpt,
      category: blog.category, coverImage: blog.coverImage || '', author: blog.author,
      tags: blog.tags?.join(', ') || '', readingTime: blog.readingTime, published: blog.published
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) {
        await blogAPI.update(editing._id, data);
        toast.success('Blog updated');
      } else {
        await blogAPI.create(data);
        toast.success('Blog created');
      }
      setShowForm(false);
      loadBlogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save blog');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await blogAPI.delete(id);
      toast.success('Blog deleted');
      loadBlogs();
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      await blogAPI.update(blog._id, { published: !blog.published });
      toast.success(blog.published ? 'Unpublished' : 'Published');
      loadBlogs();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const filtered = blogs.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title mb-0">Blog Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Create, edit, and manage blog posts</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2"><BiPlus size={20} /> New Blog Post</button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <BiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search blogs..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center"><p className="text-gray-500">No blog posts found</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(blog => (
                <tr key={blog._id} className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{blog.title}</p>
                    <p className="text-xs text-gray-400">/{blog.slug}</p>
                  </td>
                  <td className="px-4 py-3"><span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{blog.category}</span></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{blog.author}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(blog)} className={`badge cursor-pointer ${blog.published ? 'badge-green' : 'badge-yellow'}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700" title="View"><BiShow size={16} /></a>
                      <button onClick={() => openEdit(blog)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700" title="Edit"><BiEdit size={16} /></button>
                      <button onClick={() => handleDelete(blog._id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700" title="Delete"><BiTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="my-8 w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><BiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="label">Title</label><input value={form.title} onChange={e => handleTitleChange(e.target.value)} className="input-field" required /></div>
                <div><label className="label">Slug</label><input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Author</label><input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="input-field" required /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="label">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">Reading Time (min)</label><input type="number" min={1} value={form.readingTime} onChange={e => setForm({...form, readingTime: Number(e.target.value)})} className="input-field" /></div>
                <div><label className="label">Published</label>
                  <select value={form.published} onChange={e => setForm({...form, published: e.target.value === 'true'})} className="input-field">
                    <option value={false}>Draft</option><option value={true}>Published</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Excerpt</label><textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} className="input-field" rows={2} maxLength={300} required /></div>
              <div><label className="label">Content (HTML)</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="input-field font-mono text-sm" rows={12} required /></div>
              <div><label className="label">Tags (comma-separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="input-field" placeholder="e.g. blood donation, health, tips" /></div>
              <button type="submit" className="btn-primary w-full">{editing ? 'Update Blog Post' : 'Create Blog Post'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
