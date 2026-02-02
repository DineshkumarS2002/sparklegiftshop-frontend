import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminSignup } from '../api/ownerApi';
import logo from '../assets/sparkle_logo.jpg';

export default function AdminSignup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', adminLevel: 'admin' });
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
            if (user.role === 'admin') {
                navigate('/admin');
            }
        }
    }, [navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await adminSignup(form);
            setSuccess(data.message || 'Admin account created successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Signup failed';

            // If email already exists, redirect to login
            if (errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('already exists')) {
                setError('This email is already registered. Redirecting to login...');
                setTimeout(() => {
                    navigate('/admin/login');
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
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark p-3">
                <div className="card border-0 shadow-lg text-center p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '1.5rem' }}>
                    <div className="card-body">
                        <div className="display-1 text-success mb-4">
                            <i className="bi bi-check2-circle"></i>
                        </div>
                        <h2 className="fw-bold">Admin Account Created!</h2>
                        <p className="text-muted mb-4">{success}</p>
                        <Link to="/admin/login" className="btn btn-success rounded-pill px-5 fw-bold py-2">
                            Login to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark p-3">
            <div className="card border-0 shadow-lg" style={{ maxWidth: '450px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="card-body p-4 p-md-5 text-center">
                    <img src={logo} alt="Logo" className="rounded-circle mb-4 shadow" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <h2 className="fw-extrabold mb-2 text-dark">Create Admin Account</h2>
                    <p className="text-muted small mb-4">Join the management team</p>

                    {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

                    <form onSubmit={onSubmit}>
                        <div className="mb-3 text-start">
                            <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Full Name</label>
                            <input
                                type="text"
                                className="form-control rounded-pill px-3 shadow-none border"
                                placeholder="Admin Name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Email Address</label>
                            <input
                                type="email"
                                className="form-control rounded-pill px-3 shadow-none border"
                                placeholder="admin@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start position-relative">
                            <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Password</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control rounded-start-pill border-end-0 px-3 shadow-none border"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                                <button
                                    className="btn border border-start-0 rounded-end-pill px-3 d-flex align-items-center bg-white text-muted"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                </button>
                            </div>
                        </div>
                        <div className="mb-4 text-start">
                            <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Access Level</label>
                            <select
                                className="form-select rounded-pill px-3 shadow-none border"
                                value={form.adminLevel}
                                onChange={e => setForm({ ...form, adminLevel: e.target.value })}
                            >
                                <option value="admin">Standard Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-dark rounded-pill w-100 py-2 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Admin Account'}
                        </button>
                    </form>

                    <div className="mt-4 small">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/admin/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
