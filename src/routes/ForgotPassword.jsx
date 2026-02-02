import { useState } from 'react';
import { clientForgotPassword } from '../api/clientApi';
import { adminForgotPassword } from '../api/ownerApi';
import { Link, useLocation } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            if (isAdmin) {
                await adminForgotPassword(email);
            } else {
                await clientForgotPassword(email);
            }
            setMessage('A password reset link has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
            <div className="card border-0 shadow-lg" style={{ maxWidth: '400px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="card-body p-4 p-md-5">
                    <h2 className="fw-bold mb-2 text-center text-dark">{isAdmin ? 'Admin' : ''} Reset Password</h2>
                    <p className="text-muted small mb-4 text-center">Enter your email and we'll send you a link to reset your password.</p>

                    {message && <div className="alert alert-success small py-2 mb-4">{message}</div>}
                    {error && <div className="alert alert-danger small py-2 mb-4">{error}</div>}

                    {!message && (
                        <form onSubmit={onSubmit}>
                            <div className="mb-4">
                                <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control rounded-pill px-3 shadow-none border"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary rounded-pill w-100 py-2 fw-bold" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="mt-4 text-center small">
                        <Link to={isAdmin ? "/admin/login" : "/login"} className="text-primary fw-bold text-decoration-none">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
