import { useEffect, useMemo, useState } from 'react';
import logo from '../assets/sparkle_logo.jpg';
import {
  clientAddToCart,
  clientClearCart,
  clientCreateOrder,
  clientFetchCart,
  clientFetchProducts,
  clientFetchSettings,
  clientUpdateCartItem,
  clientVerifyCoupon,
} from '../api/clientApi';
import { Link, useNavigate } from 'react-router-dom';

const emptyOrderForm = {
  customerName: '',
  phone: '',
  address: '',
  paymentMethod: 'upi',
};

// Hook for status toast
function useStatus(initial = '') {
  const [msg, setMsg] = useState(initial);
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(''), 2000);
      return () => clearTimeout(t);
    }
  }, [msg]);
  return [msg, setMsg];
}

function ProductCard({ product, onAdd }) {
  return (
    <div className="card h-100 product-card border-0 shadow-sm transition-all bg-white" style={{ borderRadius: '12px' }}>
      <div className="position-relative overflow-hidden" style={{ aspectRatio: '1/1', borderRadius: '12px 12px 0 0' }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=500&q=80'}
          alt={product.name}
          className="product-image w-100 h-100 object-fit-cover"
        />
      </div>
      <div className="card-body p-2 d-flex flex-column">
        <div className="text-primary fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{product.category}</div>
        <h6 className="card-title fw-bold mb-2 text-dark text-truncate" style={{ fontSize: '0.95rem' }}>{product.name}</h6>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="fw-bold text-dark" style={{ fontSize: '1rem' }}>₹{product.price}</span>
          <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-none" style={{ fontSize: '0.75rem', padding: '4px 12px' }} onClick={() => onAdd(product.id)}>
            Add +
          </button>
        </div>
      </div>
    </div>
  );
}

function OffersCarousel() {
  return (
    <div className="card border-0 mt-3 mb-5 text-white overflow-hidden shadow-sm hover-shadow" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)' }}>
      <div className="card-body p-4 text-center">
        <h2 className="fw-bold mb-2">✨ Special Offer! ✨</h2>
        <p className="lead mb-0 opacity-90">Get 20% off on all items this week. Use code <strong className="bg-white text-primary px-2 py-1 rounded">SPARKLE20</strong></p>
      </div>
    </div>
  );
}

export default function ClientApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [settings, setSettings] = useState({ upiQrUrl: '', whatsappNumber: '' });
  const [status, setStatus] = useStatus('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [step, setStep] = useState('shop'); // shop | checkout
  const [orderForm, setOrderForm] = useState(emptyOrderForm);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [p, c, s] = await Promise.all([clientFetchProducts(), clientFetchCart(), clientFetchSettings()]);
    setProducts(p);
    setCart(c);
    setSettings(s);
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = category === 'All' ? true : p.category === category;
      const qOk =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [products, query, category]);

  const onAdd = async (id) => {
    setLoading(true);
    try {
      const next = await clientAddToCart(id);
      setCart(next);
      setStatus('Added to cart');
    } catch {
      setStatus('Could not add to cart');
    } finally {
      setLoading(false);
    }
  };

  const onQty = async (productId, qty) => {
    const next = await clientUpdateCartItem(productId, qty);
    setCart(next);
  };

  const onClear = async () => {
    const next = await clientClearCart();
    setCart(next);
  };

  /* Coupon & Discount Logic */
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [showCart, setShowCart] = useState(false); // Toggle state for cart

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const data = await clientVerifyCoupon(coupon);
      let disc = 0;

      if (data.applicableTo === 'all') {
        disc = data.type === 'percent' ? cart.total * (data.value / 100) : data.value;
      } else {
        // Specific products
        const validIds = data.productIds || [];
        const matchingItems = cart.items.filter(i => validIds.includes(i.productId));

        if (matchingItems.length > 0) {
          if (data.type === 'percent') {
            const matchTotal = matchingItems.reduce((acc, i) => acc + i.lineTotal, 0);
            disc = matchTotal * (data.value / 100);
          } else {
            disc = data.value; // Flat amount if any match found
          }
        } else {
          setStatus('Coupon not applicable to items in cart');
          setDiscount(0);
          setAppliedCouponData(null);
          return;
        }
      }

      setDiscount(Math.min(disc, cart.total));
      setAppliedCouponData(data);
      setStatus(`Coupon Applied: ${data.code}`);
    } catch (err) {
      setDiscount(0);
      setStatus('Invalid or Expired Coupon');
    }
  };

  /* Delivery Fee Logic: Below ₹500 = ₹50, Above ₹500 = Free (Based on original items total) */
  const deliveryFee = cart.total < 500 && cart.items.length > 0 ? 50 : 0;
  const finalTotal = Math.max(0, (cart.total - discount) + deliveryFee);

  const onCheckout = () => {
    if (!cart.items.length) {
      setStatus('Cart is empty');
      return;
    }
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Checkout Flow State */
  const [paymentStep, setPaymentStep] = useState(false); // If true, show UPI QR
  const [createdOrder, setCreatedOrder] = useState(null);

  const onPlaceOrder = async () => {
    if (!cart.items.length) return setStatus('Cart is empty');
    if (!orderForm.customerName || !orderForm.phone) return setStatus('Enter customer details');

    setLoading(true);
    try {
      // 1. Create the order first
      const order = await clientCreateOrder({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName: orderForm.customerName,
        phone: orderForm.phone,
        address: orderForm.address,
        paymentMethod: orderForm.paymentMethod,
        couponCode: appliedCouponData?.code,
      });

      setCreatedOrder(order);

      // 2. Handle Payment Flow
      if (orderForm.paymentMethod === 'upi') {
        // Show Payment Screen (QR)
        setPaymentStep(true);
        setLoading(false);
        // Simulate "2 minutes wait" by just keeping them here. 
        // Realistically, we provide a button to proceed after paying.
      } else {
        // COD: Direct Redirect
        redirectToWhatsApp(order);
        navigate(`/client/order/${order.invoiceId}`);
      }
    } catch {
      setStatus('Could not create order');
      setLoading(false);
    }
  };

  const redirectToWhatsApp = (order) => {
    const itemsList = cart.items.map(i => `- ${i.product.name} x${i.quantity} (₹${i.lineTotal})`).join('\n');
    const deliveryStr = deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE';
    const msg = `*Invoice No: ${order.invoiceId}*\n\nCustomer: ${orderForm.customerName}\nPhone: ${orderForm.phone}\nAddress: ${orderForm.address}\n\n*Items:*\n${itemsList}\n\nSubtotal: ₹${cart.total}\nDiscount Applied: ₹${discount.toFixed(2)}\nDelivery Fee: ${deliveryStr}\n*Final Amount: ₹${finalTotal.toFixed(2)}*\nPayment: ${orderForm.paymentMethod.toUpperCase()}`;

    const phone = settings.whatsappNumber ? settings.whatsappNumber.replace(/\D/g, '') : '';
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const onPaymentDone = () => {
    if (createdOrder) {
      redirectToWhatsApp(createdOrder);
      navigate(`/client/order/${createdOrder.invoiceId}`);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Toast Notification */}
      {status && (
        <div className="alert alert-success status-toast shadow">
          {status}
        </div>
      )}

      {/* Header & Cart Toggle */}
      <header className="navbar navbar-expand-lg bg-white shadow-sm border-bottom fixed-top px-3 px-md-5 py-3" style={{ zIndex: 1050 }}>
        <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
          <Link to="/" className="d-flex align-items-center text-decoration-none">
            <img src={logo} alt="Logo" className="rounded-circle me-2 shadow-sm" style={{ width: 62, height: 62, objectFit: 'cover' }} />
            <div>
              <h1 className="h2 fw-bold mb-0 text-dark">Sparkle Gift Shop</h1>
              <p className="text-muted mb-0 d-none h5 d-sm-block">Personalized gifts </p>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link to="/track" className="btn btn-sm btn-light border rounded-pill px-3 fw-bold text-primary text-decoration-none d-none d-md-inline-block">
              <i className="bi bi-search me-1"></i> Track Invoice
            </Link>

            {/* Burger Button for Cart */}
            <button className="btn btn-outline-primary position-relative rounded-circle p-2 border-0 shadow-none hover-bg-light" onClick={() => setShowCart(true)} style={{ width: 42, height: 42 }}>
              <i className="bi bi-cart fs-5" ></i>
              {cart.items.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary border border-white" style={{ fontSize: '10px' }}>
                  {cart.items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container-fluid px-3 px-md-5 py-4 mt-5 pt-5">

        {/* Cart Offcanvas (Sidebar) */}
        <div className={`offcanvas offcanvas-end ${showCart ? 'show' : ''}`} tabIndex="-1" style={{ visibility: showCart ? 'visible' : 'hidden', zIndex: 1100 }}>
          <div className="offcanvas-header bg-primary py-3">
            <h5 className="offcanvas-title fw-bold text-white mb-0">Your Cart</h5>
            <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowCart(false)} aria-label="Close"></button>
          </div>
          <div className="offcanvas-body d-flex flex-column">
            {cart.items.length === 0 ? (
              <div className="text-center text-muted py-5 mt-5">
                <i className="bi bi-cart-x display-1 mb-3"></i>
                <p>Your cart is empty 🛍️</p>
                <button className="btn btn-primary mt-3" onClick={() => setShowCart(false)}>Start Shopping</button>
              </div>
            ) : (
              <>
                <div className="flex-grow-1 overflow-auto">
                  {cart.items.map((item) => (
                    <div className="d-flex align-items-center mb-3 pb-3 border-bottom position-relative" key={item.productId}>
                      <img
                        src={item.product?.image || 'https://via.placeholder.com/50'}
                        alt={item.product?.name}
                        className="rounded border me-3"
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold small text-truncate" style={{ maxWidth: '120px' }}>{item.product?.name}</div>
                        <div className="text-muted small">₹{item.product?.price} x {item.quantity}</div>
                        {appliedCouponData && (appliedCouponData.applicableTo === 'all' || appliedCouponData.productIds.includes(item.productId)) && (
                          <div className="text-success" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                            <i className="bi bi-tag-fill me-1"></i> Discount Applied
                          </div>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-1 mx-2">
                        <button className="btn btn-xs btn-light border py-0 px-2" onClick={() => onQty(item.productId, item.quantity - 1)}>-</button>
                        <span className="small px-1">{item.quantity}</span>
                        <button className="btn btn-xs btn-light border py-0 px-2" onClick={() => onQty(item.productId, item.quantity + 1)}>+</button>
                      </div>
                      <div className="fw-bold small">₹{item.lineTotal?.toFixed(0)}</div>
                    </div>
                  ))}
                </div>

                <div className="border-top pt-3 mt-auto">
                  {/* Coupon Section inside Cart */}
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Coupon Code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary btn-sm" onClick={applyCoupon}>Apply</button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-bold">₹{cart.total?.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                      <span>Discount</span>
                      <span className="fw-bold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Delivery</span>
                    <span className={`fw-bold ${deliveryFee === 0 ? 'text-success' : ''}`}>
                      {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="h5 mb-0 fw-bold">Total</span>
                    <span className="h4 mb-0 text-primary fw-bold">₹{finalTotal.toFixed(2)}</span>
                  </div>

                  <div className="d-grid gap-2 mt-3">
                    <button className="btn btn-primary py-2 fw-bold" onClick={() => { setShowCart(false); onCheckout(); }}>
                      Proceed to Checkout
                    </button>
                    <button className="btn btn-link link-secondary btn-sm text-decoration-none" onClick={onClear}>
                      <i className="bi bi-trash3 me-1"></i> Clear Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Backdrop for Offcanvas */}
        {showCart && <div className="offcanvas-backdrop fade show" style={{ zIndex: 1090 }} onClick={() => setShowCart(false)}></div>}

        {step === 'shop' && (
          <div className="row g-4">
            {/* Main Content: Offers + Products */}
            <div className="col-12">
              <OffersCarousel />

              {/* Search & Filter */}
              <div className="mb-4">
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-4">
                    <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                      <span className="input-group-text bg-white border-0 ps-3">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        className="form-control border-0 shadow-none ps-2 py-2"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-8">
                    <div className="d-flex gap-2 overflow-auto pb-1 no-scrollbar flex-nowrap">
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${category === c ? 'btn-primary shadow' : 'btn-light border text-secondary'}`}
                          onClick={() => setCategory(c)}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {filtered.map((p) => (
                  <div className="col" key={p.id}>
                    <ProductCard product={p} onAdd={onAdd} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'checkout' && !paymentStep && (
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                  <h3 className="mb-0 fw-bold">Checkout</h3>
                  <button className="btn btn-link text-decoration-none" onClick={() => setStep('shop')}>Back</button>
                </div>
                <div className="card-body">
                  <div className="bg-light p-3 rounded mb-4 border">
                    <table className="table table-sm mb-0">
                      <tbody>
                        <tr>
                          <td className="small text-muted border-0">Items ({cart.items.length})</td>
                          <td className="text-end small fw-medium border-0">₹{cart.total?.toFixed(2)}</td>
                        </tr>
                        {discount > 0 && (
                          <tr>
                            <td className="small text-success border-0">Discount</td>
                            <td className="text-end small fw-medium text-success border-0">-₹{discount.toFixed(2)}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="small text-muted border-0">Delivery Fee</td>
                          <td className="text-end small fw-medium border-0">{deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}</td>
                        </tr>
                      </tbody>
                      <tfoot className="border-top">
                        <tr className="fw-bold fs-5">
                          <td className="text-end border-0">Total</td>
                          <td className="text-end text-primary border-0">₹{finalTotal.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">Full Name</label>
                    <input className="form-control" value={orderForm.customerName} onChange={(e) => setOrderForm(f => ({ ...f, customerName: e.target.value }))} placeholder="e.g. John Doe" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">Phone Number</label>
                    <input className="form-control" value={orderForm.phone} onChange={(e) => setOrderForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">Delivery Address</label>
                    <textarea className="form-control" rows={3} value={orderForm.address} onChange={(e) => setOrderForm(f => ({ ...f, address: e.target.value }))} />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted mb-2">Payment Method</label>
                    <div className="d-flex gap-2">
                      <button
                        className={`btn flex-grow-1 ${orderForm.paymentMethod === 'upi' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setOrderForm(f => ({ ...f, paymentMethod: 'upi' }))}
                      >
                        UPI (Scan & Pay)
                      </button>
                      <button
                        className={`btn flex-grow-1 ${orderForm.paymentMethod === 'cod' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setOrderForm(f => ({ ...f, paymentMethod: 'cod' }))}
                      >
                        Cash on Delivery
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 py-2 fw-bold" onClick={onPlaceOrder} disabled={loading}>
                    {loading ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPI Payment Overlay / Step */}
        {step === 'checkout' && paymentStep && (
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg text-center border-primary border-2">
                <div className="card-header bg-primary text-white py-3">
                  <h4 className="mb-0 fw-bold">Scan to Pay</h4>
                </div>
                <div className="card-body p-5">
                  <div className="mb-4">
                    <p className="lead fw-bold mb-1">Total Amount: ₹{finalTotal.toFixed(2)}</p>
                    <p className="text-muted small">Invoice No: {createdOrder?.invoiceId}</p>
                  </div>

                  {settings.upiQrUrl ? (
                    <div className="bg-light p-3 rounded d-inline-block border mb-4">
                      <img src={settings.upiQrUrl} alt="UPI QR" style={{ width: '100%', maxWidth: '280px' }} />
                    </div>
                  ) : (
                    <div className="alert alert-warning">No QR Code available. Ask owner for details.</div>
                  )}

                  <div className="alert alert-info small">
                    Please pay using any UPI App (GPay, PhonePe, Paytm).<br />
                    <strong>Do not verify manually, click below after paying.</strong>
                  </div>

                  <button className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm" onClick={onPaymentDone}>
                    I Have Paid (Confirm Order)
                  </button>
                  <p className="text-muted small mt-3 fst-italic">Redirecting to WhatsApp for confirmation...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
