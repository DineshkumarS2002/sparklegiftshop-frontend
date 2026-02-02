import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ownerGetOrder, ownerUpdateOrderTracking } from '../api/ownerApi';
import logo from '../assets/sparkle_logo.jpg';

export default function AdminTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState('');
    const [form, setForm] = useState({
        courierPartner: '',
        trackingId: '',
        message: '',
        location: ''
    });

    useEffect(() => {
        (async () => {
            try {
                const data = await ownerGetOrder(orderId);
                setOrder(data);
                setForm({
                    courierPartner: data.courierPartner || '',
                    trackingId: data.trackingId || '',
                    message: '',
                    location: ''
                });
            } catch (err) {
                console.error(err);
                setStatus('Order not found');
            } finally {
                setLoading(false);
            }
        })();
    }, [orderId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setStatus('');
        try {
            const updated = await ownerUpdateOrderTracking(order.id, form);
            setOrder(updated);
            setForm(prev => ({ ...prev, message: '', location: '' }));
            setStatus('Tracking updated successfully!');
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setStatus('Failed to update tracking');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    if (!order) return (
        <div className="container py-5 text-center">
            <div className="alert alert-danger">Order not found</div>
            <Link to="/admin" className="btn btn-primary">Back to Dashboard</Link>
        </div>
    );

    return (
        <div className="min-vh-100 bg-light">
            <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom px-3 px-md-5 sticky-top">
                <div className="container-fluid p-0">
                    <Link to="/admin" className="d-flex align-items-center gap-2 text-decoration-none">
                        <img src={logo} alt="Logo" className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                        <h1 className="h5 fw-bold mb-0 text-dark">Tracking Management</h1>
                    </Link>
                    <div className="ms-auto">
                        <Link to="/admin" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <h5 className="fw-extrabold mb-4">Order Info: {order.invoiceId}</h5>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <label className="smallest text-muted text-uppercase fw-bold d-block">Customer</label>
                                        <span className="fw-bold">{order.customerName}</span>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="smallest text-muted text-uppercase fw-bold d-block">Phone</label>
                                        <span>{order.phone}</span>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="smallest text-muted text-uppercase fw-bold d-block">Payment</label>
                                        <span className={`badge ${order.isPaid ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {order.isPaid ? 'PAID' : 'PENDING'}
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={onSubmit}>
                                    <h6 className="fw-bold text-primary text-uppercase mb-3 mt-4">Shipping Details</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="small fw-bold text-muted text-uppercase mb-1">Courier Partner</label>
                                                <input
                                                    className="form-control"
                                                    placeholder="e.g. Professional Courier"
                                                    value={form.courierPartner}
                                                    onChange={e => setForm({ ...form, courierPartner: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="small fw-bold text-muted text-uppercase mb-1">Tracking ID</label>
                                                <input
                                                    className="form-control font-monospace"
                                                    placeholder="e.g. PC123456789"
                                                    value={form.trackingId}
                                                    onChange={e => setForm({ ...form, trackingId: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4 opacity-10" />
                                    <h6 className="fw-bold text-primary text-uppercase mb-3">Add Status Update</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="small fw-bold text-muted text-uppercase mb-1">Message</label>
                                                <input
                                                    className="form-control"
                                                    placeholder="e.g. Package arrived at Chennai Hub"
                                                    value={form.message}
                                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="small fw-bold text-muted text-uppercase mb-1">Location</label>
                                                <input
                                                    className="form-control"
                                                    placeholder="e.g. Chennai, TN"
                                                    value={form.location}
                                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {status && <div className={`alert ${status.includes('fail') ? 'alert-danger' : 'alert-success'} py-2 mt-3`}>{status}</div>}

                                    <div className="mt-4 d-flex gap-3">
                                        <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold" disabled={updating}>
                                            {updating ? 'Saving...' : 'Save & Notify Update'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-success rounded-pill px-4 fw-bold"
                                            disabled={updating}
                                            onClick={async () => {
                                                if (confirm('Mark this order as Delivered and notify the customer?')) {
                                                    setUpdating(true);
                                                    try {
                                                        const updated = await ownerUpdateOrderTracking(order.id, {
                                                            ...form,
                                                            status: 'delivered',
                                                            message: 'Order Delivered Successfully! 🎁',
                                                            location: 'Customer Location'
                                                        });
                                                        setOrder(updated);
                                                        setStatus('Order marked as Delivered!');
                                                    } catch (err) {
                                                        setStatus('Failed to mark delivered');
                                                    } finally {
                                                        setUpdating(false);
                                                    }
                                                }
                                            }}
                                        >
                                            <i className="bi bi-check-circle me-1"></i> Mark Delivered
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-uppercase text-muted small mb-4">Event History</h6>
                                <div className="ms-2 border-start ps-3">
                                    {(order.trackingEvents || []).length > 0 ? (
                                        order.trackingEvents.slice().reverse().map((event, idx) => (
                                            <div key={idx} className="mb-4 position-relative">
                                                <div className="position-absolute translate-middle-x" style={{ left: '-16px', top: '0' }}>
                                                    <div className="rounded-circle bg-primary" style={{ width: '10px', height: '10px' }}></div>
                                                </div>
                                                <div className="fw-bold small">{event.message}</div>
                                                {event.location && <div className="smallest text-muted"><i className="bi bi-geo-alt me-1"></i>{event.location}</div>}
                                                <div className="smallest text-muted opacity-75">{new Date(event.updatedAt).toLocaleString()}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-muted small">No events logged yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
