import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clientGetOrder, clientFetchOrdersByPhone, clientTrackOrderPublic, clientFetchOrdersByPhonePublic, clientFetchSettings } from '../api/clientApi';
import { useEffect } from 'react';

export default function TrackOrder() {
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        clientFetchSettings().then(setSettings).catch(console.error);
    }, []);

    const onTrack = async (e) => {
        if (e) e.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;

        setLoading(true);
        setError('');
        setOrders([]);
        setSearched(true);

        try {
            const token = localStorage.getItem('sparkle_token');
            let data;

            // If searching by Invoice ID (e.g. 300126-001)
            if (term.includes('-')) {
                try {
                    if (token) {
                        data = await clientGetOrder(term);
                        setOrders([data]);
                        if (data.phone) localStorage.setItem('sparkle_track_phone', data.phone);
                    } else {
                        throw new Error('Fallback to public');
                    }
                } catch (e) {
                    const savedPhone = localStorage.getItem('sparkle_track_phone') || '';
                    if (savedPhone) {
                        data = await clientTrackOrderPublic(term, savedPhone);
                        setOrders([data]);
                        if (data.phone) localStorage.setItem('sparkle_track_phone', data.phone);
                    } else {
                        setError('To view this order securely, please enter your Phone Number in the search box first.');
                    }
                }
            } else if (term.length >= 10 && !isNaN(term.replace(/\s/g, ''))) {
                if (token) {
                    data = await clientFetchOrdersByPhone(term);
                    if (!data || data.length === 0) {
                        data = await clientFetchOrdersByPhonePublic(term);
                    }
                } else {
                    data = await clientFetchOrdersByPhonePublic(term);
                }

                if (data && data.length > 0) {
                    setOrders(data);
                    localStorage.setItem('sparkle_track_phone', term);
                } else {
                    setError('No orders found for this Phone Number. If you are a guest, please use the Bill No.');
                }
            } else {
                setError('Please enter a valid Phone Number or Bill No.');
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 400) {
                setError('Access denied. Please ensure your Bill No and Phone Number are correct.');
            } else {
                setError('No orders found matching your search.');
            }
        } finally {
            setLoading(false);
        }
    };

    const whatsappNumber = settings?.whatsappNumber || '918667634863';

    return (
        <div className="min-vh-100 bg-light">
            {/* Premium Hero Section */}
            <div className="bg-primary text-white py-5 mb-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="container position-relative z-1 text-center py-4">
                    <h1 className="display-5 fw-extrabold mb-3 tracking-tight">Track Your Surprise 🎁</h1>
                    <p className="lead opacity-90 mb-0 mx-auto" style={{ maxWidth: '600px' }}>
                        Enter your Bill No or Phone Number to stay updated on your gift's magical journey.
                    </p>
                </div>

                {/* Decorative Wave */}
                <div className="position-absolute bottom-0 start-0 w-100 overflow-hidden" style={{ lineHeight: 0 }}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: 'relative', display: 'block', width: 'calc(100% + 1.3px)', height: '40px' }}>
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f8f9fa"></path>
                    </svg>
                </div>
            </div>

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        {/* Glassmorphic Search Container */}
                        <div className="card border-0 shadow-lg mb-5" style={{ borderRadius: '24px', marginTop: '-80px' }}>
                            <div className="card-body p-4 p-md-5">
                                <form onSubmit={onTrack}>
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <label className="form-label small fw-bold text-uppercase text-primary tracking-widest">Search Details</label>
                                            <span className="smallest text-muted"><i className="bi bi-info-circle me-1"></i>Mobile or Bill No</span>
                                        </div>
                                        <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border">
                                            <span className="input-group-text bg-white border-0 ps-4">
                                                <i className="bi bi-search text-primary"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-0 shadow-none py-3"
                                                placeholder="9876543210 or 300126-001"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ fontSize: '1rem' }}
                                            />
                                            <button className="btn btn-primary px-4 fw-bold transition-all" type="submit" disabled={loading}>
                                                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'TRACK'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="p-3 bg-light rounded-4 d-flex align-items-center gap-3 border border-dashed">
                                                <div className="bg-white rounded-circle p-2 shadow-xs text-primary"><i className="bi bi-phone"></i></div>
                                                <div className="smallest text-muted fw-medium lh-sm">Track multi-orders using phone</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="p-3 bg-light rounded-4 d-flex align-items-center gap-3 border border-dashed">
                                                <div className="bg-white rounded-circle p-2 shadow-xs text-primary"><i className="bi bi-receipt"></i></div>
                                                <div className="smallest text-muted fw-medium lh-sm">Guest? Use full Bill No.</div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-danger text-center shadow-sm border-0 rounded-4 p-3 mb-4 animate__animated animate__shakeX">
                                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i> {error}
                            </div>
                        )}

                        {searched && orders.length === 0 && !error && !loading && (
                            <div className="text-center py-5">
                                <div className="mb-3">
                                    <div className="bg-white d-inline-block rounded-circle p-4 shadow-sm border">
                                        <i className="bi bi-search-heart text-muted display-4"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold text-dark">No orders found</h5>
                                <p className="text-muted small">We couldn't find anything matching your search. Double check and try again!</p>
                                <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={() => { setSearched(false); setSearchTerm(''); }}>Clear Search</button>
                            </div>
                        )}

                        {/* Results List */}
                        <div className="space-y-4">
                            {orders.map((order, idx) => (
                                <div
                                    key={order.id}
                                    className="card border-0 shadow-sm mb-4 overflow-hidden transition-all hover-translate-y animate__animated animate__fadeInUp"
                                    style={{ borderRadius: '20px', animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-4 p-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                                    <i className="bi bi-box-seam fs-3"></i>
                                                </div>
                                                <div>
                                                    <div className="smallest text-muted text-uppercase fw-bold tracking-widest mb-1">INVOICE ID</div>
                                                    <h5 className="fw-extrabold text-primary mb-0">{order.invoiceId}</h5>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <span className={`badge rounded-pill px-3 py-2 fw-bold shadow-sm ${order.delivered ? 'bg-success' : (order.dispatched ? 'bg-info' : 'bg-warning text-dark')}`}>
                                                    <i className={`bi ${order.delivered ? 'bi-patch-check-fill' : (order.dispatched ? 'bi-truck' : 'bi-hourglass-split')} me-1`}></i>
                                                    {order.delivered ? 'DELIVERED' : (order.dispatched ? 'IN TRANSIT' : 'PREPARING')}
                                                </span>
                                                <div className="smallest text-muted mt-2 fw-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                        </div>

                                        <div className="row g-4 mb-4">
                                            <div className="col-12 col-md-6">
                                                <div className="p-3 bg-light rounded-4 h-100">
                                                    <div className="smallest text-muted text-uppercase fw-bold tracking-tighter mb-2">Recipient</div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className="bi bi-person-circle text-primary opacity-50"></i>
                                                        <span className="fw-bold text-dark">{order.customerName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <div className="p-3 bg-light rounded-4 h-100">
                                                    <div className="smallest text-muted text-uppercase fw-bold tracking-tighter mb-2">Order Value</div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className="bi bi-currency-rupee text-primary opacity-50"></i>
                                                        <span className="fw-bold text-dark fs-5">₹{order.total?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-4 position-relative overflow-hidden mb-4 ${order.delivered ? 'bg-success text-white' : 'bg-primary-subtle border border-primary border-opacity-10 text-primary-emphasis'}`}>
                                            {/* Decorative pattern for status box */}
                                            <div className="position-absolute end-0 top-0 opacity-10 p-2" style={{ transform: 'rotate(15deg)' }}>
                                                <i className={`bi ${order.delivered ? 'bi-check-circle' : 'bi-stars'} display-4`}></i>
                                            </div>

                                            <div className="d-flex align-items-center gap-3 position-relative z-1">
                                                <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm ${order.delivered ? 'bg-white text-success' : 'bg-primary text-white'}`} style={{ width: '40px', height: '40px' }}>
                                                    <i className={`bi ${order.delivered ? 'bi-gift-fill' : (order.dispatched ? 'bi-truck' : 'bi-heart-fill')}`}></i>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-1">{order.delivered ? 'Order Delivered! 🎉' : (order.dispatched ? 'On the way to you!' : 'Preparing for magic...')}</h6>
                                                    <div className={`smallest fw-medium opacity-80`}>
                                                        {order.delivered ? 'Your special gift has been delivered safely.' : (order.dispatched ? 'Your parcel is currently in transit with our partner.' : 'We are carefully packing your surprise right now.')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-grid pt-2">
                                            <Link
                                                to={`/order-details/${order.invoiceId}`}
                                                className={`btn ${order.delivered ? 'btn-success' : 'btn-primary'} rounded-pill fw-bold py-3 shadow border-0 transition-all`}
                                            >
                                                VIEW FULL JOURNEY <i className="bi bi-chevron-right ms-2 mt-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Help Section */}
                        <div className="text-center mt-5">
                            <div className="p-4 bg-white rounded-4 shadow-sm border border-success border-opacity-25 inline-block w-100">
                                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                                    <div className="text-md-start">
                                        <h6 className="fw-bold mb-1"><i className="bi bi-whatsapp text-success me-2"></i>Having trouble tracking?</h6>
                                        <p className="text-muted small mb-0">Our support team is here to help you 24/7.</p>
                                    </div>
                                    <a
                                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Sparkle, I need help tracking my order.')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                                    >
                                        CHAT ON WHATSAPP
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-5">
                            <Link to="/" className="btn btn-link link-secondary text-decoration-none fw-bold small">
                                <i className="bi bi-arrow-left me-2"></i> BACK TO SHOPPING
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-translate-y:hover { transform: translateY(-5px); }
                .tracking-widest { letter-spacing: 0.1em; }
                .tracking-tighter { letter-spacing: -0.02em; }
                .shadow-xs { shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .transition-all { transition: all 0.3s ease; }
                .fw-extrabold { font-weight: 800; }
                .smallest { font-size: 0.7rem; }
            `}</style>
        </div>
    );
}
