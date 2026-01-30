import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clientGetOrder, clientFetchOrdersByPhone } from '../api/clientApi';

export default function TrackOrder() {
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const onTrack = async (e) => {
        if (e) e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setOrders([]);
        setSearched(true);
        try {
            // First try to check if it looks like an invoice ID (e.g. has hyphen)
            if (searchTerm.includes('-')) {
                const data = await clientGetOrder(searchTerm.trim());
                setOrders([data]);
            } else {
                // Assume it might be a phone number
                const data = await clientFetchOrdersByPhone(searchTerm.trim());
                if (data && data.length > 0) {
                    setOrders(data);
                } else {
                    // If no phone results, try as ID fallback just in case
                    try {
                        const direct = await clientGetOrder(searchTerm.trim());
                        setOrders([direct]);
                    } catch {
                        setError('No orders found for this Phone Number or Invoice ID.');
                    }
                }
            }
        } catch (err) {
            setError('No orders found. Please check the details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 min-vh-100 d-flex flex-column align-items-center">
            <div className="text-center mb-5">
                <h1 className="fw-bold text-primary mb-2">Order Details</h1>
                <p className="text-muted">Enter your registered Phone Number or Invoice ID</p>
            </div>

            <div className="w-100" style={{ maxWidth: '600px' }}>
                <form onSubmit={onTrack} className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-muted">Phone Number / Bill No</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg border-primary shadow-none"
                                    placeholder="e.g. 9876543210 or 300126-001"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-primary px-4" type="submit" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-search me-1"></i> Track</>}
                                </button>
                            </div>
                        </div>
                        <div className="small text-muted text-center">
                            Track by registered mobile number for best results.
                        </div>
                    </div>
                </form>

                {error && (
                    <div className="alert alert-danger text-center shadow-sm border-0 animate__animated animate__shakeX">
                        <i className="bi bi-exclamation-triangle me-2"></i> {error}
                    </div>
                )}

                {searched && orders.length === 0 && !error && !loading && (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                        No orders found.
                    </div>
                )}

                {orders.map((order) => (
                    <div key={order.id} className="card border-0 shadow-sm border-start border-4 border-primary mb-3 animate__animated animate__fadeIn">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="fw-bold mb-0 text-primary">{order.invoiceId}</h5>
                                    <small className="text-muted">{new Date(order.createdAt).toLocaleString()}</small>
                                </div>
                                <span className={`badge rounded-pill px-3 py-2 ${order.dispatched ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {order.dispatched ? 'DISPATCHED' : 'PENDING'}
                                </span>
                            </div>

                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <small className="text-muted d-block uppercase" style={{ fontSize: '0.7rem' }}>CUSTOMER</small>
                                    <span className="fw-medium">{order.customerName}</span>
                                </div>
                                <div className="col-6 text-end">
                                    <small className="text-muted d-block uppercase" style={{ fontSize: '0.7rem' }}>AMOUNT</small>
                                    <span className="fw-bold text-dark">₹{order.total?.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-light p-3 rounded mb-3">
                                <div className="d-flex align-items-center">
                                    <i className={`fs-4 me-3 bi ${order.dispatched ? 'bi-truck text-success' : 'bi-hourglass-split text-warning'}`}></i>
                                    <div>
                                        <strong>{order.dispatched ? 'Out for Delivery' : 'Processing Order'}</strong>
                                        <div className="small text-muted">{order.dispatched ? 'Your order is on the way!' : 'We are preparing your package.'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-grid">
                                <Link to={`/order-details/${order.invoiceId}`} className="btn btn-outline-primary btn-sm rounded-pill fw-bold">
                                    View Full Details <i className="bi bi-arrow-right ms-1"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5">
                <Link to="/" className="btn btn-link link-secondary text-decoration-none border-0">
                    <i className="bi bi-arrow-left me-1"></i> Back to Shop
                </Link>
            </div>
        </div>
    );
}
