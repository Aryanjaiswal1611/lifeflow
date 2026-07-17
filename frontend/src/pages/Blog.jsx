import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { BiSearch, BiCalendar, BiUser, BiTime, BiCategory, BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi';

const CATEGORIES = ['all', 'Blood Donation', 'Health Tips', 'Nutrition', 'Medical News', 'Awareness', 'Success Stories', 'Blood Camps', 'Emergency Care'];

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'all') params.category = category;
    if (sort !== 'newest') params.sort = sort;
    if (page > 1) params.page = page;
    params.limit = 9;
    setSearchParams(params, { replace: true });

    setLoading(true);
    blogAPI.getAll(params)
      .then(res => {
        setBlogs(res.data.blogs);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="text-5xl">📝</span>
        <h1 className="section-title mt-4">LifeFlow Blog</h1>
        <p className="section-subtitle mb-0">Stories, guides, and insights about blood donation</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <BiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search blog posts..." />
        </form>
        <div className="flex gap-3">
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="input-field text-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>
      ) : blogs.length === 0 ? (
        <div className="card py-16 text-center">
          <span className="text-5xl mb-4 block">📭</span>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No blog posts found</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">Showing {blogs.length} of {total} posts</div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map(blog => (
              <Link key={blog._id} to={`/blog/${blog.slug}`} className="card-hover group flex flex-col overflow-hidden">
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-red-100 to-red-50 text-6xl dark:from-red-900/30 dark:to-red-800/20">
                  {blog.category === 'Blood Donation' ? '🩸' : blog.category === 'Health Tips' ? '💪' : blog.category === 'Nutrition' ? '🥗' : blog.category === 'Medical News' ? '🔬' : blog.category === 'Awareness' ? '💡' : blog.category === 'Success Stories' ? '🌟' : blog.category === 'Blood Camps' ? '🏕️' : '🚨'}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-2 inline-block w-fit rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{blog.category}</span>
                  <h3 className="mb-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 line-clamp-2">{blog.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">{blog.excerpt}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-700">
                    <span className="flex items-center gap-1"><BiUser size={14} /> {blog.author}</span>
                    <span className="flex items-center gap-1"><BiCalendar size={14} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><BiTime size={14} /> {blog.readingTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary gap-1 text-sm disabled:opacity-40"><BiLeftArrowAlt size={16} /> Previous</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                let p;
                if (pages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= pages - 2) p = pages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{p}</button>
                );
              })}
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-secondary gap-1 text-sm disabled:opacity-40">Next <BiRightArrowAlt size={16} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blog;
