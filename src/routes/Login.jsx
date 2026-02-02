import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientLogin } from '../api/clientApi';
import logo from '../assets/sparkle_logo.jpg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
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
            const data = await clientLogin(email, password);
            localStorage.setItem('sparkle_token', data.token);
            localStorage.setItem('sparkle_user', JSON.stringify(data.user));

            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
            <div className="card border-0 shadow-lg" style={{ maxWidth: '400px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="card-body p-4 p-md-5 text-center">
                    <img src={logo} alt="Logo" className="rounded-circle mb-4 shadow" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <h2 className="fw-extrabold mb-2">Welcome Back</h2>
                    <p className="text-muted small mb-4">Please enter your details to sign in</p>

                    {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

                    <form onSubmit={onSubmit}>
                        <div className="mb-3 text-start">
                            <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Email Address</label>
                            <input
                                type="email"
                                className="form-control rounded-pill px-3 shadow-none"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4 text-start position-relative">
                            <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Password</label>
                            <div
                                className={`d-flex align-items-center border rounded-pill bg-white px-2 transition-all ${passwordFocus ? 'border-primary' : ''}`}
                                style={passwordFocus ? { boxShadow: '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' } : {}}
                            >
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control border-0 shadow-none bg-transparent"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setPasswordFocus(true)}
                                    onBlur={() => setPasswordFocus(false)}
                                    required
                                />
                                <button
                                    className="btn border-0 p-2 d-flex align-items-center text-muted"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary rounded-pill w-100 py-2 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>


                    <div className="mt-2 small">
                        <span className="text-muted">Don't have an account? </span>
                        <Link to="/signup" className="text-primary fw-bold text-decoration-none">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
