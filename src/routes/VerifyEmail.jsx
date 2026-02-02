import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { clientVerifyEmail } from '../api/clientApi';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        (async () => {
            try {
                const data = await clientVerifyEmail(token);
                setStatus('success');
                setMessage(data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may be expired.');
            }
        })();
    }, [token]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
            <div className="card border-0 shadow-lg text-center p-4" style={{ maxWidth: '450px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="card-body">
                    {status === 'verifying' && (
                        <>
                            <div className="spinner-border text-primary mb-4" role="status"></div>
                            <h2 className="fw-bold">Verifying your email...</h2>
                            <p className="text-muted">Just a moment while we secure your account.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="display-1 text-success mb-4"><i className="bi bi-patch-check-fill"></i></div>
                            <h2 className="fw-bold">Email Verified!</h2>
                            <p className="text-muted mb-4">{message}</p>
                            <Link to="/login" className="btn btn-primary rounded-pill px-5 fw-bold py-2">Sign In Now</Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="display-1 text-danger mb-4"><i className="bi bi-exclamation-octagon-fill"></i></div>
                            <h2 className="fw-bold">Verification Failed</h2>
                            <p className="text-muted mb-4">{message}</p>
                            <Link to="/signup" className="btn btn-outline-primary rounded-pill px-5 fw-bold py-2">Try Signing Up Again</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
