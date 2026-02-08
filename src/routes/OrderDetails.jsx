import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clientGetOrder, clientTrackOrderPublic, clientFetchSettings, API_BASE_URL, getSocketURL } from '../api/clientApi';
import { io } from 'socket.io-client';

export default function OrderDetails() {
    const { invoiceId } = useParams();
    const [order, setOrder] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let socket;
        (async () => {
            try {
                // Parallel execution:
                const settingsPromise = clientFetchSettings().then(s => {
                    setSettings(s);
                    return s;
                }).catch(err => console.error("Settings error", err));

                const token = localStorage.getItem('sparkle_token');
                let orderPromise;

                // Initialize Socket immediately (non-blocking)
                try {
                    socket = io(getSocketURL(), { auth: { token } });
                    socket.emit('join_order', invoiceId);
                    socket.on('tracking_update', (updated) => {
                        if (updated.invoiceId === invoiceId) {
                            setOrder(updated);
                        }
                    });
                } catch (e) {
                    console.error("Socket error", e);
                }

                if (token) {
                    // Try private route
                    orderPromise = clientGetOrder(invoiceId);
                } else {
                    // Public route fallback
                    const guestPhone = localStorage.getItem('sparkle_track_phone');
                    if (guestPhone) {
                        orderPromise = clientTrackOrderPublic(invoiceId, guestPhone);
                    } else {
                        throw new Error('No auth token or saved phone');
                    }
                }

                // Wait for order data
                try {
                    const orderData = await orderPromise;
                    setOrder(orderData);
                } catch (err) {
                    // If public fallback needed because token invalid or whatever, handle here
                    // But simpler logic:
                    if (!token && !localStorage.getItem('sparkle_track_phone')) {
                        setError('For privacy, please track using your Phone Number first.');
                    } else {
                        console.error(err);
                        if (err.response?.status === 401 || err.response?.status === 403) {
                            setError('Verification failed. Please track by phone number to verify identity.');
                        } else {
                            setError('Order not found.');
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                if (!error) setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            if (socket) socket.disconnect();
        };
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
                <div className="alert alert-danger shadow-sm border-0">{error || 'Something went wrong'}</div>
                <div className="mt-4">
                    <Link to="/track" className="btn btn-primary rounded-pill px-4 me-2">Try Again</Link>
                    <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">Back to Shop</Link>
                </div>
            </div>
        );
    }

    const whatsappNumber = settings?.whatsappNumber || '918667634863';

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Order Details</h2>
                    <p className="text-muted mb-0">Invoice #{order.invoiceId}</p>
                </div>
                <Link to="/track" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    <i className="bi bi-arrow-left me-1"></i> Back
                </Link>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <span className="text-muted small text-uppercase d-block fw-bold">Status</span>
                            <span className={`badge rounded-pill px-3 py-2 mt-1 ${order.delivered ? 'bg-success' : order.dispatched ? 'bg-info' : (order.paymentMethod === 'cod' || order.isPaid || order.paymentScreenshot) ? 'bg-primary' : 'bg-warning text-dark'}`}>
                                {order.delivered ? 'DELIVERED' : order.dispatched ? 'OUT FOR DELIVERY' : (order.paymentMethod === 'cod' || order.isPaid || order.paymentScreenshot) ? 'CONFIRMED' : 'WAITING FOR PAYMENT'}
                            </span>
                        </div>
                        <div className="text-end">
                            <span className="text-muted small text-uppercase d-block fw-bold">Order Date</span>
                            <span className="fw-medium">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Items Ordered</h6>
                        {order.items.map((item, idx) => {
                            // Logic to find specific variant image if available
                            let displayImg = item.product?.image;
                            if (item.product?.variants?.length > 0) {
                                const v = item.product.variants.find(v =>
                                    (v.size == item.variantSize || (!v.size && !item.variantSize)) &&
                                    (v.color == item.variantColor || (!v.color && !item.variantColor))
                                );
                                if (v && v.image) displayImg = v.image;
                            }

                            return (
                                <div className="card border shadow-sm mb-2 p-2 rounded-3" key={`${item.productId}-${idx}`}>
                                    <div className="d-flex gap-3 align-items-center">
                                        {/* Image */}
                                        <div className="flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                            <img src={displayImg || 'https://placehold.co/60'} alt="" className="w-100 h-100 object-fit-cover rounded-3" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow-1 min-w-0">
                                            <h6 className="mb-1 text-truncate fw-bold text-dark" style={{ fontSize: '14px' }}>
                                                {item.product?.name || 'Gift Item'}
                                            </h6>

                                            {/* Variants */}
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                {item.variantSize && (
                                                    <span className="badge bg-secondary bg-opacity-10 text-dark border px-2 py-1" style={{ fontSize: '10px', borderRadius: '6px' }}>
                                                        {item.variantSize}
                                                    </span>
                                                )}
                                                {item.variantColor && (
                                                    <span
                                                        className="border rounded-circle d-inline-block"
                                                        style={{ width: '18px', height: '18px', backgroundColor: item.variantColor, flexShrink: 0 }}
                                                    ></span>
                                                )}
                                            </div>

                                            <div className="text-muted fw-medium" style={{ fontSize: '13px' }}>
                                                ₹{item.variantPrice || item.product?.price} × {item.quantity}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="fw-bold text-dark text-end" style={{ fontSize: '15px' }}>
                                            ₹{item.lineTotal?.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-light p-3 rounded-4 mb-4">
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
                            <span className="fw-bold fs-5">Total Amount</span>
                            <span className="fw-bold fs-5 text-primary">₹{order.total?.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Live Tracking Timeline */}
                    <div className="border-top pt-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="text-uppercase text-muted small fw-bold mb-0">Order Journey</h6>
                            {order.trackingId && (
                                <span className="badge bg-light text-primary border px-2 py-1" style={{ fontSize: '10px' }}>
                                    {order.courierPartner}: {order.trackingId}
                                </span>
                            )}
                        </div>

                        <div className="tracking-timeline-container ps-2">
                            {/* Support Chat Card */}
                            <div className="card border-0 bg-success bg-opacity-10 mb-4 rounded-4 shadow-none">
                                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                                            <i className="bi bi-whatsapp fs-5"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold small">Need help?</div>
                                            <div className="smallest text-muted">Chat with us on WhatsApp</div>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I have a query regarding my Order #${order.invoiceId}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-success btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                    >
                                        Chat Now
                                    </a>
                                </div>
                            </div>

                            <div className="ms-2 border-start ps-4 position-relative" style={{ borderColor: '#e2e8f0' }}>
                                {/* Tracking events - newest at top */}
                                {[...(order.trackingEvents || [])].reverse().map((event, idx) => (
                                    <div key={`event-${idx}`} className="mb-4 position-relative">
                                        <div className="position-absolute translate-middle-x" style={{ left: '-25px', top: '0' }}>
                                            <div className={`rounded-circle ${idx === 0 ? 'bg-primary shadow-sm' : 'bg-secondary opacity-50'}`}
                                                style={{ width: idx === 0 ? '14px' : '10px', height: idx === 0 ? '14px' : '10px', marginTop: '4px', border: '2px solid white' }}></div>
                                        </div>
                                        <div className={`fw-bold small ${idx === 0 ? 'text-primary' : 'text-dark'}`}>{event.message}</div>
                                        {event.location && <div className="smallest text-muted"><i className="bi bi-geo-alt me-1"></i>{event.location}</div>}
                                        <div className="smallest text-muted opacity-75" style={{ fontSize: '10px' }}>{new Date(event.updatedAt).toLocaleString()}</div>
                                    </div>
                                ))}

                                {/* Initial Order Placed Milestone - Always at bottom */}
                                <div className="mb-0 position-relative">
                                    <div className="position-absolute translate-middle-x" style={{ left: '-25px', top: '0' }}>
                                        <div className="rounded-circle bg-secondary opacity-50" style={{ width: '10px', height: '10px', marginTop: '4px', border: '2px solid white' }}></div>
                                    </div>
                                    <div className="fw-bold small text-muted">Order Placed</div>
                                    <div className="smallest text-muted">We have received your order successfully.</div>
                                    <div className="smallest text-muted opacity-75" style={{ fontSize: '10px' }}>{new Date(order.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-uppercase text-muted small mb-3">Delivery Address</h6>
                            <p className="fw-bold mb-1 text-dark">{order.customerName}</p>
                            <p className="text-muted mb-0 small" style={{ lineHeight: '1.6' }}>{order.address}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-uppercase text-muted small mb-3">Contact Info</h6>
                            <p className="mb-2 fw-medium"><i className="bi bi-telephone me-2 text-primary"></i>{order.phone}</p>
                            <p className="mb-0 text-muted small">Payment via <span className="fw-bold text-dark">{order.paymentMethod?.toUpperCase()}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 text-center">
                <a
                    href={`${API_BASE_URL}/orders/${order.invoiceId}/pdf`}
                    download
                    className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm"
                >
                    <i className="bi bi-download me-2"></i> Download Invoice
                </a>
            </div>
        </div>
    );
}
