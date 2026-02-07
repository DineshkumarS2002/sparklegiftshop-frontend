import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/ownerApi';
import logo from '../assets/sparkle_logo.jpg';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
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
            const data = await adminLogin(email, password);
            localStorage.setItem('sparkle_token', data.token);
            localStorage.setItem('sparkle_user', JSON.stringify(data.user));

            navigate('/admin');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Admin login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark p-3">
            <div className="card border-0 shadow-lg" style={{ maxWidth: '400px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="card-body p-4 p-md-5 text-center">
                    <img src={logo} alt="Logo" className="rounded-circle mb-4 shadow" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <h2 className="fw-extrabold mb-2 text-dark">Admin Dashboard</h2>
                    <p className="text-muted small mb-4">Secure Access Only</p>

                    {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

                    <form onSubmit={onSubmit}>
                        <div className="mb-3 text-start">
                            <label className="form-label">Admin Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="admin@sparkle.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
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
                        {/* The following elements are added as per instruction, though typically logout is on a dashboard, not login page */}
                        <button type="submit" className="btn btn-primary rounded-pill w-100 py-2 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Login to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-4 small">
                        <span className="text-muted">Don't have an account? </span>
                        <Link to="/admin/signup" className="text-primary fw-bold text-decoration-none">Create Admin Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
