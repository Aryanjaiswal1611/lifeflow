import { useState } from 'react';
import { BiChevronDown, BiChevronUp, BiSearch } from 'react-icons/bi';

const faqs = [
  { q: 'Who can donate blood?', a: 'Anyone aged 18-65, weighing at least 45kg, and in good health can donate blood.' },
  { q: 'How often can I donate blood?', a: 'You can donate whole blood every 56 days (about 2 months). Platelet donors can donate more frequently.' },
  { q: 'Is blood donation safe?', a: 'Yes, blood donation is completely safe. Sterile, single-use equipment is used for each donor and discarded after use.' },
  { q: 'How long does it take?', a: 'The entire process takes about 1 hour from registration to refreshments. The actual donation takes only 10-15 minutes.' },
  { q: 'Can I donate if I have a medical condition?', a: 'It depends on the condition. Common conditions like high blood pressure (controlled) may be acceptable. Check eligibility on your dashboard.' },
  { q: 'What should I eat before donating?', a: 'Eat a healthy meal and drink plenty of fluids before donating. Avoid fatty foods as they can affect blood tests.' },
  { q: 'How much blood is taken?', a: 'About 450ml of blood is collected, which is less than 10% of your total blood volume and is safely replenished.' },
  { q: 'Will it hurt?', a: 'You may feel a slight pinch when the needle is inserted, but most donors report minimal discomfort.' },
  { q: 'Can I donate blood during pregnancy?', a: 'No, pregnant women cannot donate blood. You must wait at least 6 months after delivery.' },
  { q: 'What happens after I donate?', a: 'Your blood is tested for infectious diseases, processed into components, and distributed to hospitals for patients in need.' }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="text-5xl">❓</span>
        <h1 className="section-title mt-4">Frequently Asked Questions</h1>
        <p className="section-subtitle mb-0">Everything you need to know about blood donation</p>
      </div>

      <div className="relative mb-6">
        <BiSearch className="absolute left-3.5 top-3 text-gray-400" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search FAQ..." />
      </div>

      <div className="space-y-3">
        {filtered.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="flex w-full items-center justify-between text-left">
              <span className="pr-4 text-sm font-medium text-gray-900 dark:text-white">{faq.q}</span>
              {openIndex === i ? <BiChevronUp size={20} className="shrink-0 text-gray-400" /> : <BiChevronDown size={20} className="shrink-0 text-gray-400" />}
            </button>
            {openIndex === i && (
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No results found. Try a different search term.</p>
        )}
      </div>
    </div>
  );
};

export default FAQ;
