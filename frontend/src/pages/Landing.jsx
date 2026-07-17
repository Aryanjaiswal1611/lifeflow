import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiHeart, BiSearch, BiMap, BiBell, BiDroplet, BiBot, BiShield, BiTrophy } from 'react-icons/bi';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    { icon: <BiSearch size={28} />, title: 'Find Donors', desc: 'Search for blood donors by group, location, and availability instantly.' },
    { icon: <BiHeart size={28} />, title: 'Save Lives', desc: 'Connect patients with willing donors in their area for quick blood donations.' },
    { icon: <BiMap size={28} />, title: 'Location Based', desc: 'Smart matching system finds the nearest compatible donors for emergencies.' },
    { icon: <BiBell size={28} />, title: 'Instant Alerts', desc: 'Get notified immediately when someone needs your blood type nearby.' },
    { icon: <BiBot size={28} />, title: 'AI Assistant', desc: 'Get instant answers about eligibility, compatibility, and donation tips.' },
    { icon: <BiTrophy size={28} />, title: 'Rewards & Badges', desc: 'Earn points, badges, and climb the leaderboard with every donation.' },
    { icon: <BiShield size={28} />, title: 'Secure & Verified', desc: 'Verified donors and hospitals ensure a safe donation experience.' },
    { icon: <BiDroplet size={28} />, title: 'Emergency SOS', desc: 'One-tap emergency blood request that alerts nearby donors immediately.' }
  ];

  const stats = [
    { value: '10K+', label: 'Donors' },
    { value: '5K+', label: 'Lives Saved' },
    { value: '500+', label: 'Hospitals' },
    { value: '50+', label: 'Cities' }
  ];

  const testimonials = [
    { text: 'LifeFlow saved my father\'s life when he needed blood urgently. Donors arrived within 30 minutes!', name: 'Priya S.', role: 'Patient Family' },
    { text: 'I\'ve donated 12 times through LifeFlow. The app makes it incredibly easy to find opportunities.', name: 'Rahul K.', role: 'Regular Donor' },
    { text: 'As a hospital administrator, LifeFlow has revolutionized our blood inventory management.', name: 'Dr. Mehta', role: 'Hospital Admin' }
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-red-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-6 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">#1 Blood Donation Platform</div>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                Every Drop <span className="text-red-300">Counts</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-red-100 sm:text-xl">
                LifeFlow connects blood donors with patients in need. Join our mission to save lives through the power of community donation.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {user ? (
                  <Link to="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-lg font-bold text-primary-700 shadow-sm transition-all duration-150 hover:bg-red-50 active:scale-[0.97]">Go to Dashboard</Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-lg font-bold text-primary-700 shadow-sm transition-all duration-150 hover:bg-red-50 active:scale-[0.97]">Register as Donor</Link>
                    <Link to="/register" className="inline-flex items-center justify-center rounded-xl border-2 border-white px-8 py-3 text-lg font-bold text-white transition-all duration-150 hover:bg-white hover:text-primary-700 active:scale-[0.97]">Request Blood</Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden justify-center md:flex">
              <div className="relative">
                <div className="text-[200px] leading-none animate-pulse">🩸</div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/20 px-6 py-2 backdrop-blur-sm">
                  <span className="text-lg font-semibold">Be a Hero. Donate Blood.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white py-16 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">A complete platform for blood donation management with real-time features</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={i} className="card-hover text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">{f.icon}</div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-50 py-20 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">Real stories from our community of donors and recipients</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <div className="mb-3 flex gap-1 text-yellow-400">{[...Array(5)].map((_, j) => <span key={j}>★</span>)}</div>
                <p className="prose-content mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Ready to Make a Difference?</h2>
          <p className="section-subtitle mx-auto mb-10 max-w-2xl">Join thousands of donors and save lives today. Every donation can save up to three lives.</p>
          {!user && (
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="btn-primary px-10 py-3 text-base">Get Started Now</Link>
              <Link to="/faq" className="btn-outline px-10 py-3 text-base">Learn More</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;
