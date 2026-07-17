import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BiMenu, BiX, BiLogOut, BiUser, BiBell, BiMessageDetail, BiSun, BiMoon, BiSearch, BiMap, BiBot, BiTrophy, BiDroplet, BiCalendar, BiBuilding, BiHeart } from 'react-icons/bi';
import { notificationAPI } from '../../services/api';

const Navbar = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      notificationAPI.getUnreadCount().then(r => setUnread(r.data.count)).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = 'px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400';
  const iconBtnClass = 'p-2 rounded-lg text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400';

  return (
    <nav className="bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 shadow-sm border-b border-gray-200 dark:border-gray-800 fixed top-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="text-2xl">🩸</span>
            <span className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">LifeFlow</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-1">
            <Link to="/faq" className={linkClass}>FAQ</Link>
            <Link to="/blog" className={linkClass}>Blog</Link>
            {user ? (
              <>
                <Link to="/search" className={iconBtnClass} title="Search Donors"><BiSearch size={20} /></Link>
                <Link to="/compatibility" className={iconBtnClass} title="Compatibility"><BiHeart size={20} /></Link>
                <Link to="/camps" className={iconBtnClass} title="Camps"><BiCalendar size={20} /></Link>
                <Link to="/blood-availability" className={iconBtnClass} title="Blood Availability"><BiDroplet size={20} /></Link>
                <Link to="/hospital-finder" className={iconBtnClass} title="Hospitals"><BiBuilding size={20} /></Link>
                <Link to="/nearby" className={iconBtnClass} title="Nearby Donors"><BiMap size={20} /></Link>
                <Link to="/leaderboard" className={iconBtnClass} title="Leaderboard"><BiTrophy size={20} /></Link>
                <Link to="/ai-chat" className={iconBtnClass} title="AI Assistant"><BiBot size={20} /></Link>
                <Link to="/chat" className={iconBtnClass} title="Messages"><BiMessageDetail size={20} /></Link>
                <Link to="/notifications" className={`relative ${iconBtnClass}`} title="Notifications">
                  <BiBell size={20} />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold leading-none text-white">{unread}</span>
                  )}
                </Link>
                <Link to="/dashboard" className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400">
                  <BiUser size={18} />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/contact" className={linkClass}>Contact</Link>
                <Link to="/testimonials" className={linkClass}>Testimonials</Link>
              </>
            )}
            <button onClick={toggleDarkMode} className={iconBtnClass} title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? <BiSun size={20} /> : <BiMoon size={20} />}
            </button>
            {user ? (
              <button onClick={handleLogout} className="btn-secondary ml-1 flex items-center gap-1.5 px-3 py-1.5 text-sm">
                <BiLogOut size={16} /> Logout
              </button>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </div>
            )}
          </div>

          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <BiX size={24} /> : <BiMenu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-1 px-4 py-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-2 dark:border-gray-700">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                    <BiUser size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <MobileNavLink to="/dashboard" icon={<BiUser size={18} />} label="Dashboard" onClick={() => setOpen(false)} />
                <MobileNavLink to="/search" icon={<BiSearch size={18} />} label="Search Donors" onClick={() => setOpen(false)} />
                <MobileNavLink to="/compatibility" icon={<BiHeart size={18} />} label="Blood Compatibility" onClick={() => setOpen(false)} />
                <MobileNavLink to="/camps" icon={<BiCalendar size={18} />} label="Donation Camps" onClick={() => setOpen(false)} />
                <MobileNavLink to="/blood-availability" icon={<BiDroplet size={18} />} label="Blood Availability" onClick={() => setOpen(false)} />
                <MobileNavLink to="/hospital-finder" icon={<BiBuilding size={18} />} label="Hospitals & Blood Banks" onClick={() => setOpen(false)} />
                <MobileNavLink to="/nearby" icon={<BiMap size={18} />} label="Nearby Donors" onClick={() => setOpen(false)} />
                <MobileNavLink to="/ai-chat" icon={<BiBot size={18} />} label="AI Assistant" onClick={() => setOpen(false)} />
                <MobileNavLink to="/leaderboard" icon={<BiTrophy size={18} />} label="Leaderboard" onClick={() => setOpen(false)} />
                <MobileNavLink to="/chat" icon={<BiMessageDetail size={18} />} label="Messages" onClick={() => setOpen(false)} />
                <MobileNavLink to="/notifications" icon={<BiBell size={18} />} label={`Notifications${unread > 0 ? ` (${unread})` : ''}`} onClick={() => setOpen(false)} />
                <div className="border-t border-gray-100 pt-2 mt-2 dark:border-gray-700" />
                <MobileNavLink to="/faq" label="FAQ" onClick={() => setOpen(false)} />
                <MobileNavLink to="/blog" label="Blog" onClick={() => setOpen(false)} />
                <MobileNavLink to="/contact" label="Contact" onClick={() => setOpen(false)} />
                <div className="border-t border-gray-100 pt-2 mt-2 dark:border-gray-700" />
                <button onClick={() => { toggleDarkMode(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
                  {darkMode ? <BiSun size={18} /> : <BiMoon size={18} />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                  <BiLogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20" onClick={() => setOpen(false)}>Register</Link>
                <div className="border-t border-gray-100 pt-2 mt-2 dark:border-gray-700" />
                <MobileNavLink to="/faq" label="FAQ" onClick={() => setOpen(false)} />
                <MobileNavLink to="/blog" label="Blog" onClick={() => setOpen(false)} />
                <MobileNavLink to="/contact" label="Contact" onClick={() => setOpen(false)} />
                <MobileNavLink to="/testimonials" label="Testimonials" onClick={() => setOpen(false)} />
                <div className="border-t border-gray-100 pt-2 mt-2 dark:border-gray-700" />
                <button onClick={() => { toggleDarkMode(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
                  {darkMode ? <BiSun size={18} /> : <BiMoon size={18} />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const MobileNavLink = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
    {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
    {label}
  </Link>
);

export default Navbar;
