import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clientGetOrder, API_BASE_URL } from '../api/clientApi';

export default function OrderDetails() {
    const { invoiceId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const data = await clientGetOrder(invoiceId);
                setOrder(data);
            } catch (err) {
                setError('Order not found');
            } finally {
                setLoading(false);
            }
        })();
    }, [invoiceId]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger">{error || 'Something went wrong'}</div>
                <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Order Details</h2>
                    <p className="text-muted mb-0">Invoice #{order.invoiceId}</p>
                </div>
                <Link to="/track" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-arrow-left me-1"></i> Back
                </Link>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <span className="text-muted small text-uppercase d-block">Status</span>
                            <span className={`badge rounded-pill px-3 py-2 mt-1 ${order.dispatched ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {order.dispatched ? 'DISPATCHED' : 'PENDING'}
                            </span>
                        </div>
                        <div className="text-end">
                            <span className="text-muted small text-uppercase d-block">Order Date</span>
                            <span className="fw-medium">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Items Ordered</h6>
                        {order.items.map((item) => (
                            <div key={item.productId} className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-light rounded p-2 me-3 text-center" style={{ width: '50px', height: '50px' }}>
                                        {item.product?.image ? (
                                            <img src={item.product?.image} alt="" className="w-100 h-100 object-fit-cover rounded" />
                                        ) : (
                                            <i className="bi bi-gift text-secondary"></i>
                                        )}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-semibold">{item.product?.name}</h6>
                                        <small className="text-muted">{item.product?.category}</small>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold">₹{item.lineTotal?.toFixed(2)}</div>
                                    <small className="text-muted">Qty: {item.quantity}</small>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Subtotal</span>
                            <span className="fw-medium">₹{order.subtotal?.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="d-flex justify-content-between mb-2 text-success">
                                <span>Discount</span>
                                <span>-₹{order.discount?.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Delivery Fee</span>
                            <span>{order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : 'Free'}</span>
                        </div>
                        <div className="d-flex justify-content-between pt-2 border-top">
                            <span className="fw-bold fs-5">Total</span>
                            <span className="fw-bold fs-5 text-primary">₹{order.total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold text-uppercase text-muted small mb-3">Delivery Address</h6>
                            <p className="fw-bold mb-1">{order.customerName}</p>
                            <p className="text-muted mb-0">{order.address}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold text-uppercase text-muted small mb-3">Contact Info</h6>
                            <p className="mb-2"><i className="bi bi-telephone me-2 text-primary"></i>{order.phone}</p>
                            <p className="mb-0 text-muted small">Payment via {order.paymentMethod?.toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-center">
                <a
                    href={`${API_BASE_URL}/orders/${order.invoiceId}/pdf`}
                    download
                    className="btn btn-outline-primary rounded-pill px-4"
                >
                    <i className="bi bi-download me-2"></i> Download Invoice
                </a>
            </div>
        </div>
    );
}
