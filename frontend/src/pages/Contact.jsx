import { useState } from 'react';
import toast from 'react-hot-toast';
import { BiSend, BiMap, BiPhone, BiEnvelope } from 'react-icons/bi';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactCards = [
    { icon: <BiMap size={28} />, title: 'Address', desc: '123 LifeFlow Street, Healthcare City, India' },
    { icon: <BiPhone size={28} />, title: 'Phone', desc: '+91 1800-123-4567' },
    { icon: <BiEnvelope size={28} />, title: 'Email', desc: 'support@lifeflow.com' }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="text-5xl">📞</span>
        <h1 className="section-title mt-4">Contact Us</h1>
        <p className="section-subtitle mb-0">We'd love to hear from you</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {contactCards.map((c, i) => (
          <div key={i} className="card text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">{c.icon}</div>
            <h3 className="mb-1 text-sm font-semibold">{c.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="card">
          <h3 className="mb-5 text-base font-semibold">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="input-field" rows={4} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
              {loading ? 'Sending...' : <><BiSend size={18} /> Send Message</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
