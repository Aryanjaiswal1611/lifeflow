import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { BiCalendar, BiUser, BiTime, BiCategory, BiArrowBack, BiShareAlt, BiLink, BiMessageDetail } from 'react-icons/bi';

const CATEGORY_ICONS = {
  'Blood Donation': '🩸', 'Health Tips': '💪', 'Nutrition': '🥗', 'Medical News': '🔬',
  'Awareness': '💡', 'Success Stories': '🌟', 'Blood Camps': '🏕️', 'Emergency Care': '🚨'
};

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    blogAPI.getBySlug(slug)
      .then(res => {
        setBlog(res.data.blog);
        setRelated(res.data.related || []);
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: blog.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center pt-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>;
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="text-6xl mb-4 block">📭</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h2>
        <p className="text-gray-500 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog" className="btn-primary gap-2"><BiArrowBack size={18} /> Back to Blogs</Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"><BiArrowBack size={18} /> Back to Blogs</Link>

      <div className="mb-8 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 via-red-50 to-orange-50 p-10 text-center dark:from-red-900/30 dark:via-red-800/20 dark:to-orange-900/20">
        <span className="mb-4 text-7xl">{CATEGORY_ICONS[blog.category] || '📝'}</span>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">{blog.title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><BiUser size={16} /> {blog.author}</span>
          <span className="flex items-center gap-1.5"><BiCalendar size={16} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="flex items-center gap-1.5"><BiTime size={16} /> {blog.readingTime} min read</span>
          <span className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"><BiCategory size={14} /> {blog.category}</span>
        </div>
      </div>

      <div className="prose prose-gray mx-auto max-w-none dark:prose-invert lg:prose-lg" dangerouslySetInnerHTML={{ __html: blog.content }} />

      {blog.tags?.length > 0 && (
        <div className="mx-auto mt-8 max-w-none">
          <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map(tag => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-8 flex items-center gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button onClick={handleShare} className="btn-secondary gap-2 text-sm">
          {copied ? '✓ Link Copied!' : <><BiShareAlt size={18} /> Share</>}
        </button>
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => (
              <Link key={r._id} to={`/blog/${r.slug}`} className="card-hover group">
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 text-4xl dark:from-red-900/20 dark:to-orange-900/20">
                  {CATEGORY_ICONS[r.category] || '📝'}
                </div>
                <div className="p-4">
                  <span className="mb-1 inline-block text-xs font-semibold text-primary-600 dark:text-primary-400">{r.category}</span>
                  <h3 className="text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white line-clamp-2">{r.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">{r.readingTime} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogDetails;
