import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clientGetOrder } from '../api/clientApi';

export default function TrackOrder() {
    const [billNo, setBillNo] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onTrack = async (e) => {
        if (e) e.preventDefault();
        if (!billNo.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);
        try {
            const data = await clientGetOrder(billNo.trim());
            setOrder(data);
        } catch (err) {
            setError('Bill not found. Please check the number and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 min-vh-100 d-flex flex-column align-items-center">
            <div className="text-center mb-5">
                <h1 className="fw-bold text-primary mb-2">Track Your Bill</h1>
                <p className="text-muted">Enter your bill number to see the current status</p>
            </div>

            <div className="w-100" style={{ maxWidth: '500px' }}>
                <form onSubmit={onTrack} className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-muted">Bill Number</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg border-primary shadow-none"
                                    placeholder="e.g. 290126-001"
                                    value={billNo}
                                    onChange={(e) => setBillNo(e.target.value)}
                                />
                                <button className="btn btn-primary px-4" type="submit" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-search me-1"></i> Track</>}
                                </button>
                            </div>
                        </div>
                        <div className="small text-muted text-center">
                            You can find your Bill No on your order confirmation page or WhatsApp message.
                        </div>
                    </div>
                </form>

                {error && (
                    <div className="alert alert-danger text-center shadow-sm border-0 animate__animated animate__shakeX">
                        <i className="bi bi-exclamation-triangle me-2"></i> {error}
                    </div>
                )}

                {order && (
                    <div className="card border-0 shadow border-top border-4 border-primary animate__animated animate__fadeIn">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                                <div>
                                    <h5 className="fw-bold mb-1">Status for {order.invoiceId}</h5>
                                    <p className="small text-muted mb-0">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className={`badge fs-6 px-3 py-2 rounded-pill ${order.dispatched ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {order.dispatched ? <><i className="bi bi-check2-circle me-1"></i> DISPATCHED</> : <><i className="bi bi-clock me-1"></i> PENDING</>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className={`rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-3`} style={{ width: '40px', height: '40px' }}>
                                        <i className="bi bi-bag-check"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Order Received</h6>
                                        <small className="text-muted">We have started preparing your gifts</small>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center mb-0 opacity-100">
                                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${order.dispatched ? 'bg-success' : 'bg-light text-secondary'} me-3`} style={{ width: '40px', height: '40px' }}>
                                        <i className="bi bi-truck"></i>
                                    </div>
                                    <div>
                                        <h6 className={`mb-0 fw-bold ${order.dispatched ? 'text-success' : 'text-muted'}`}>Out for Delivery</h6>
                                        <small className="text-muted">{order.dispatched ? 'Your items have been dispatched' : 'Pending dispatch'}</small>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-light p-3 rounded mb-3">
                                <h6 className="fw-bold small text-uppercase text-muted mb-2">Details</h6>
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted">Customer</span>
                                    <span className="fw-medium">{order.customerName}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Total Amount</span>
                                    <span className="fw-bold text-primary">₹{order.total?.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="d-grid gap-2">
                                <Link to={`/client/order/${order.invoiceId}`} className="btn btn-outline-primary btn-sm rounded-pill">View Full Summary</Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-5">
                <Link to="/" className="btn btn-link link-secondary text-decoration-none border-0">
                    <i className="bi bi-arrow-left me-1"></i> Back to Shop
                </Link>
            </div>
        </div>
    );
}
