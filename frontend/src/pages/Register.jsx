import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BiShow, BiHide, BiCheck } from 'react-icons/bi';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', city: '', address: '', role: 'donor'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'donor', label: 'Donor', desc: 'I want to donate blood', icon: '🩸' },
    { value: 'receiver', label: 'Receiver', desc: 'I need blood for someone', icon: '❤️' },
    { value: 'hospital', label: 'Hospital', desc: 'I represent a hospital', icon: '🏥' }
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-8 text-center">
            <span className="text-5xl">🩸</span>
            <h2 className="section-title mt-5">Join LifeFlow</h2>
            <p className="text-gray-500 dark:text-gray-400">Create your account</p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step === s ? 'bg-primary-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                  {step > s ? <BiCheck size={18} /> : s}
                </div>
                {s < 2 && <div className={`h-0.5 w-10 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="label mb-2">I am a...</label>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map(r => (
                      <button type="button" key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                        className={`rounded-xl border-2 p-3 text-center transition-all duration-150 ${form.role === r.value ? 'border-primary-500 bg-primary-50 shadow-sm dark:border-primary-400 dark:bg-primary-900/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'}`}>
                        <div className="mb-1 text-2xl">{r.icon}</div>
                        <div className="text-sm font-medium">{r.label}</div>
                        <div className="mt-0.5 text-[10px] leading-tight text-gray-500 dark:text-gray-400">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="your@email.com" required />
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">Next</button>
              </>
            ) : (
              <>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-field pr-10" placeholder="At least 6 characters" minLength={6} required />
                    <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => setShow(!show)}>
                      {show ? <BiHide size={20} /> : <BiShow size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91 9876543210" required />
                </div>
                <div>
                  <label className="label">City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} className="input-field" placeholder="Mathura" required />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="Your address" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account? <Link to="/login" className="link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
