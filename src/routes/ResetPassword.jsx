import { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { clientResetPassword } from '../api/clientApi';
import { adminResetPassword } from '../api/ownerApi';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        try {
            if (isAdmin) {
                await adminResetPassword({ token, password });
            } else {
                await clientResetPassword({ token, password });
            }
            setSuccess(true);
            setTimeout(() => navigate(isAdmin ? '/admin/login' : '/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) return (
        <div className="container py-5 text-center">
            <div className="alert alert-danger">Invalid reset link. Please request a new one.</div>
            <Link to={isAdmin ? "/admin/forgot-password" : "/forgot-password"} className="btn btn-primary">Go Back</Link>
        </div>
    );

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
            <div className="card border-0 shadow-lg" style={{ maxWidth: '400px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="card-body p-4 p-md-5">
                    <h2 className="fw-bold mb-2 text-center">Create New Password</h2>
                    <p className="text-muted small mb-4 text-center">Secure your account with a strong password.</p>

                    {error && <div className="alert alert-danger small py-2 mb-4">{error}</div>}
                    {success && <div className="alert alert-success small py-2 mb-4">Password reset successful! Redirecting to login...</div>}

                    {!success && (
                        <form onSubmit={onSubmit}>
                            <div className="mb-3">
                                <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">New Password</label>
                                <input
                                    type="password"
                                    className="form-control rounded-pill px-3 shadow-none border"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="smallest text-muted text-uppercase fw-bold mb-1 ms-1">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-control rounded-pill px-3 shadow-none border"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary rounded-pill w-100 py-2 fw-bold" disabled={loading}>
                                {loading ? 'Resetting...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
