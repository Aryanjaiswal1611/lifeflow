import { BiStar } from 'react-icons/bi';

const testimonials = [
  { name: 'Rahul K.', role: 'Blood Donor', text: 'LifeFlow made it so easy to find donation opportunities nearby. I\'ve been able to donate regularly and save lives.', rating: 5, avatar: '🩸' },
  { name: 'Priya S.', role: 'Patient', text: 'When my father needed blood urgently, LifeFlow connected us with a donor within minutes. Forever grateful!', rating: 5, avatar: '❤️' },
  { name: 'Dr. Mehta', role: 'Hospital Admin', text: 'LifeFlow has transformed how we manage blood inventory and connect with donors. An essential tool for any hospital.', rating: 5, avatar: '🏥' },
  { name: 'Amit P.', role: 'Regular Donor', text: 'The gamification features keep me motivated. I love seeing my badges and ranking on the leaderboard!', rating: 4, avatar: '🏆' },
  { name: 'Sneha G.', role: 'Blood Donor', text: 'The app is incredibly user-friendly. From registration to donation tracking, everything is seamless.', rating: 5, avatar: '⭐' },
  { name: 'Vijay M.', role: 'Emergency Patient', text: 'The SOS feature saved my sister\'s life. Donors arrived at the hospital within 30 minutes of our request.', rating: 5, avatar: '🚨' }
];

const Testimonials = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="text-5xl">💬</span>
        <h1 className="section-title mt-4">What Our Users Say</h1>
        <p className="section-subtitle mb-0">Real stories from our community</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <div key={i} className="card-hover">
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <BiStar key={j} size={18} className={j < t.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'} />
              ))}
            </div>
            <p className="prose-content mb-5 text-sm">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg dark:bg-gray-700">{t.avatar}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
