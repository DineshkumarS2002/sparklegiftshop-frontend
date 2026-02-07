import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientSignup } from '../api/clientApi';
import logo from '../assets/sparkle_logo.jpg';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('sparkle_token');
        const userString = localStorage.getItem('sparkle_user');
        if (token && userString) {
            const user = JSON.parse(userString);
            if (user.role === 'user') {
                navigate('/');
            }
        }
    }, [navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await clientSignup(form);
            setSuccess(data.message);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Signup failed';

            // If email already exists, redirect to login
            if (errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('already exists')) {
                setError('This email is already registered. Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
                <div className="card border-0 shadow-lg text-center p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '1.5rem' }}>
                    <div className="card-body">
                        <div className="display-1 text-success mb-4">
                            <i className="bi bi-check2-circle"></i>
                        </div>
                        <h2 className="fw-bold">Account Created!</h2>
                        <p className="text-muted mb-4">{success}</p>
                        <Link to="/login" className="btn btn-success rounded-pill px-5 fw-bold py-2">
                            Login Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
            <div className="card border-0 shadow-lg" style={{ maxWidth: '400px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="card-body p-4 p-md-5 text-center">
                    <img src={logo} alt="Logo" className="rounded-circle mb-4 shadow" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <h2 className="fw-extrabold mb-2">Create Account</h2>
                    <p className="text-muted small mb-4">Join us to start shopping personalized gifts</p>

                    {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

                    <form onSubmit={onSubmit}>
                        <div className="mb-3 text-start">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4 text-start position-relative">
                            <label className="form-label">Password</label>
                            <div className="premium-input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary rounded-pill w-100 py-2 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-4 small">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
