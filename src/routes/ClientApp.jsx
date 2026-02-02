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
  clientFetchCoupons,
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
  const [adding, setAdding] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const hasVariants = product.variants && product.variants.length > 0;

  // Current display price
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;

  // Current display image
  const displayImage = selectedVariant && selectedVariant.image ? selectedVariant.image : (product.image || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=500&q=80');

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (hasVariants && !selectedVariant) {

      alert('Please select an option');
      return;
    }

    setAdding(true);
    await onAdd(product.id, selectedVariant);
    setTimeout(() => setAdding(false), 1500);
  };

  return (
    <div className="card h-100 border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '20px', transition: 'none' }}>
      {/* Pro Square Image Header */}
      <div className="position-relative overflow-hidden" style={{
        aspectRatio: '1/1',
        borderRadius: '20px 20px 0 0'
      }}>
        <img
          src={displayImage}
          alt={product.name}
          className="w-100 h-100 object-fit-cover"
        />
        <button type="button" className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow-sm border-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', opacity: 0.9 }}>
          <i className="bi bi-heart text-muted"></i>
        </button>
      </div>

      <div className="card-body p-3 d-flex flex-column">
        <h5 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '18px' }}>{product.name}</h5>

        {/* Short Description */}
        <p className="smallest text-muted mb-2 opacity-75 line-clamp-2" style={{ fontSize: '11px', minHeight: '32px' }}>
          {product.description || 'Premium quality handcrafted product designed for your special moments.'}
        </p>

        {/* Premium Variant Selector: Choice Pills */}
        {hasVariants && (
          <div className="mb-3">
            <div className="smallest fw-bold text-muted text-uppercase mb-2" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Select Choice</div>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {product.variants.map((v, i) => (
                <div
                  key={i}
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
                  style={{ cursor: 'pointer' }}
                >
                  {v.color ? (
                    <div
                      className="rounded-circle shadow-sm"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: v.color,
                        border: selectedVariant === v ? '2px solid #6d28d9' : '1px solid rgba(0,0,0,0.15)',
                        outline: selectedVariant === v ? '2px solid #6d28d9' : 'none',
                        outlineOffset: '2px',
                        padding: '1px'
                      }}
                    ></div>
                  ) : (
                    <div
                      className={`px-3 py-1 rounded-pill fw-bold border ${selectedVariant === v ? 'text-white' : 'text-dark'}`}
                      style={{
                        fontSize: '11px',
                        backgroundColor: selectedVariant === v ? '#6d28d9' : '#fff',
                        borderColor: selectedVariant === v ? '#6d28d9' : '#dee2e6'
                      }}
                    >
                      {v.size}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Price & Add to Cart Button */}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top gap-2">
          <div className="d-flex flex-column">
            <span className="smallest text-muted fw-bold text-uppercase opacity-50" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>Price</span>
            <div className="d-flex align-items-center gap-1">
              <span className="fw-extrabold text-dark mb-0" style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>₹{displayPrice}</span>
              {displayOriginalPrice && (
                <span className="smallest text-muted text-decoration-line-through opacity-50" style={{ fontSize: '11px' }}>₹{displayOriginalPrice}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn fw-bold transition-none d-flex align-items-center justify-content-center border-0 shadow-sm"
            style={{
              height: '40px',
              minWidth: '40px',
              fontSize: '13px',
              backgroundColor: adding ? '#10b981' : '#6d28d9',
              color: '#fff',
              borderRadius: '12px',
              padding: '0 12px'
            }}
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? (
              <i className="bi bi-check-lg" style={{ fontSize: '20px' }}></i>
            ) : (
              <>
                <i className="bi bi-cart-plus-fill" style={{ fontSize: '18px' }}></i>
                <span className="d-none d-md-inline ms-2">Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


function TrustBadges() {
  return (
    <div className="row g-3 mb-5">
      <div className="col-6 col-md-3">
        <div className="trust-card shadow-sm py-4">
          <i className="bi bi-truck trust-icon fs-2"></i>
          <div className="fw-extrabold text-dark mt-2" style={{ fontSize: '1.1rem' }}>Fast Delivery</div>
          <div className="text-muted fw-bold small">Across Tamilnadu</div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="trust-card shadow-sm py-4">
          <i className="bi bi-patch-check trust-icon fs-2"></i>
          <div className="fw-extrabold text-dark mt-2" style={{ fontSize: '1.1rem' }}>Premium Quality</div>
          <div className="text-muted fw-bold small">Handpicked Items</div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="trust-card shadow-sm py-4">
          <i className="bi bi-shield-lock trust-icon fs-2"></i>
          <div className="fw-extrabold text-dark mt-2" style={{ fontSize: '1.1rem' }}>Secure Payment</div>
          <div className="text-muted fw-bold small">UPI & COD</div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="trust-card shadow-sm py-4">
          <i className="bi bi-chat-heart trust-icon fs-2"></i>
          <div className="fw-extrabold text-dark mt-2" style={{ fontSize: '1.1rem' }}>Best Support</div>
          <div className="text-muted fw-bold small">WhatsApp Ready</div>
        </div>
      </div>
    </div>
  );
}


function OffersCarousel({ coupons }) {
  const [timeLeft, setTimeLeft] = useState({ hrs: '02', mins: '45', secs: '10' });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeLeft({
        hrs: String(23 - now.getHours()).padStart(2, '0'),
        mins: String(59 - now.getMinutes()).padStart(2, '0'),
        secs: String(59 - now.getSeconds()).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const universalCoupon = coupons?.filter(c => c.applicableTo === 'all')
    .sort((a, b) => (b.type === 'percent' ? b.value : b.value / 10) - (a.type === 'percent' ? a.value : a.value / 10))[0];

  const code = universalCoupon?.code || 'SPARKLE20';
  const label = universalCoupon ? (universalCoupon.type === 'percent' ? `Flat ${universalCoupon.value}% OFF!` : `Flat ₹${universalCoupon.value} OFF!`) : 'Flat 20% OFF!';

  return (
    <div className="card border-0 mt-3 mb-5 text-white overflow-hidden shadow-lg" style={{
      borderRadius: '24px',
      background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="card-body p-4 p-md-5 text-center position-relative">
        <div className="position-relative z-1 py-2">
          <div className="d-flex justify-content-center gap-2 mb-4">
            <div className="bg-dark bg-opacity-50 backdrop-blur rounded p-1" style={{ width: '45px' }}>
              <div className="fw-bold h6 mb-0">{timeLeft.hrs}</div>
              <div style={{ fontSize: '8px' }} className="text-uppercase opacity-75">Hrs</div>
            </div>
            <div className="bg-dark bg-opacity-50 backdrop-blur rounded p-1" style={{ width: '45px' }}>
              <div className="fw-bold h6 mb-0">{timeLeft.mins}</div>
              <div style={{ fontSize: '8px' }} className="text-uppercase opacity-75">Min</div>
            </div>
            <div className="bg-dark bg-opacity-50 backdrop-blur rounded p-1" style={{ width: '45px' }}>
              <div className="fw-bold h6 mb-0">{timeLeft.secs}</div>
              <div style={{ fontSize: '8px' }} className="text-uppercase opacity-75">Sec</div>
            </div>
          </div>
          <h2 className="fw-extrabold mb-3 display-5">✨ {label} ✨</h2>
          <p className="lead mb-4 opacity-90 mx-auto fw-medium" style={{ maxWidth: '600px' }}>Add magic to your gifts. Flash sale ends soon! Use this code:</p>
          <div className="d-inline-flex align-items-center bg-white rounded-pill p-1 ps-3 ps-md-4 border border-white shadow-sm">
            <span className="fw-extrabold me-3 me-md-4 text-dark tracking-widest mb-0" style={{ fontSize: 'clamp(16px, 5vw, 24px)' }}>{code}</span>
            <button className="btn btn-primary rounded-pill px-3 px-md-5 py-2 py-md-3 fw-extrabold shadow-lg" style={{ fontSize: 'clamp(12px, 3.5vw, 16px)' }} onClick={() => { navigator.clipboard.writeText(code); alert(`Code ${code} Copied!`); }}>COPY CODE</button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ClientApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [settings, setSettings] = useState({ upiQrUrl: '', whatsappNumber: '' });
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useStatus('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [step, setStep] = useState('shop'); // shop | checkout
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    // Check if we have cached settings to show something quickly
    const cachedSettings = localStorage.getItem('sparkle_settings');
    if (cachedSettings) setSettings(JSON.parse(cachedSettings));

    setLoading(true);
    try {
      const hasToken = !!localStorage.getItem('sparkle_token');
      const promises = [
        clientFetchProducts(),
        hasToken ? clientFetchCart() : Promise.resolve({ items: [], total: 0 }),
        clientFetchSettings(),
        clientFetchCoupons()
      ];

      const responses = await Promise.allSettled(promises);

      const [p, c, s, cp] = responses.map((res, index) => {
        if (res.status === 'fulfilled') return res.value;
        return (index === 0 ? [] : (index === 1 ? { items: [], total: 0 } : (index === 2 ? {} : [])));
      });

      setProducts(p || []);
      setCart(c || { items: [], total: 0 });
      if (s) {
        setSettings(s);
        localStorage.setItem('sparkle_settings', JSON.stringify(s));
      }
      setCoupons(cp || []);

      // Check for pending add-to-cart from before login
      const pendingAdd = localStorage.getItem('sparkle_pending_add');
      if (pendingAdd) {
        const { id, variant } = JSON.parse(pendingAdd);
        localStorage.removeItem('sparkle_pending_add');
        await onAdd(id, variant);
      }
    } catch (err) {
      console.error("Load failed completely", err);
    } finally {
      setLoading(false);
    }
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

  const onAdd = async (id, variant = null) => {
    if (!localStorage.getItem('sparkle_token')) {
      localStorage.setItem('sparkle_pending_add', JSON.stringify({ id, variant }));
      navigate('/login');
      return;
    }
    // Optimistic Update: Calculate the new cart state locally
    const product = products.find(p => p.id === id);
    if (product) {
      setCart(prev => {
        const newItems = [...prev.items];
        const variantSize = variant ? variant.size : null;
        const variantPrice = variant ? variant.price : product.price;
        const existingIdx = newItems.findIndex(i => i.productId === id && i.variantSize === variantSize);

        if (existingIdx > -1) {
          const item = { ...newItems[existingIdx] };
          item.quantity += 1;
          item.lineTotal = +(item.quantity * variantPrice).toFixed(2);
          newItems[existingIdx] = item;
        } else {
          newItems.push({
            productId: id,
            product,
            quantity: 1,
            variantSize,
            variantPrice,
            lineTotal: variantPrice
          });
        }
        const subtotal = +newItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2);
        return { items: newItems, subtotal, total: subtotal };
      });
    }

    try {
      const next = await clientAddToCart(id, variant);
      setCart(next); // Re-sync with actual server data
      setStatus(variant ? `Added: ${variant.size}` : 'Added to cart');
    } catch {
      setStatus('Could not add to cart');
      // Re-fetch to fix local state if failed
      const c = await clientFetchCart();
      setCart(c);
    }
  };


  const onQty = async (productId, qty, variantSize, variantColor) => {
    // Optimistic Update
    setCart(prev => {
      const newItems = prev.items.map(item => {
        if (item.productId === productId && item.variantSize === variantSize && item.variantColor === variantColor) {
          const newQty = Math.max(0, qty);
          return { ...item, quantity: newQty, lineTotal: +(newQty * (item.variantPrice || item.product?.price || 0)).toFixed(2) };
        }
        return item;
      }).filter(item => item.quantity > 0);
      const subtotal = +newItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2);
      return { items: newItems, subtotal, total: subtotal };
    });

    try {
      const next = await clientUpdateCartItem(productId, qty, variantSize, variantColor);
      setCart(next);
    } catch {
      const c = await clientFetchCart();
      setCart(c);
    }
  };

  const onClear = async () => {
    const next = await clientClearCart();
    setCart(next);
    setCoupon('');
    setDiscount(0);
    setAppliedCouponData(null);
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

  /* Delivery Fee Logic: (Testing: set to 0) */
  const deliveryFee = 0; // cart.total < 500 && cart.items.length > 0 ? 50 : 0;
  const finalTotal = Math.max(0, (cart.total - discount) + deliveryFee);

  const onCheckout = () => {
    if (!localStorage.getItem('sparkle_token')) {
      navigate('/login');
      return;
    }
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
    if (orderForm.phone.length !== 10) return setStatus('Phone number must be exactly 10 digits');

    setLoading(true);
    try {
      // 1. Create the order first
      const order = await clientCreateOrder({
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantSize: i.variantSize,
          variantPrice: i.variantPrice
        })),
        customerName: orderForm.customerName,
        phone: orderForm.phone,
        address: orderForm.address,
        paymentMethod: orderForm.paymentMethod,
        couponCode: appliedCouponData?.code,
      });

      setCreatedOrder(order);

      // Handle Redirect
      if (orderForm.paymentMethod === 'cod') {
        redirectToWhatsApp(order);
      }
      navigate(`/client/order/${order.invoiceId}`);
    } catch {
      setStatus('Could not create order');
      setLoading(false);
    }
  };

  const redirectToWhatsApp = (order) => {
    const itemsList = cart.items.map(i => `- ${i.product.name} ${i.variantSize ? `(${i.variantSize})` : ''} x${i.quantity}`).join('\n');
    const deliveryStr = deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE';

    const msg = `*--- Sparkle Gift Shop ---*\n\nI have just placed an order. Please confirm it.\n\n*Order Details:*\n----------------\n*Invoice:* ${order.invoiceId}\n*Items:*\n${itemsList}\n\n*Bill Summary:*\n----------------\nSubtotal: ₹${cart.total}\nDiscount: ₹${discount.toFixed(2)}\nDelivery: ${deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}\n*Total Amount: ₹${finalTotal.toFixed(2)}*\n\n*Customer Info:*\n----------------\nName: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.address}\n\nTrack Link: ${window.location.origin}/order-details/${order.invoiceId}`;

    const ownerPhone = settings.whatsappNumber ? settings.whatsappNumber.replace(/\D/g, '') : '';
    // Use 91 prefix if it's a 10 digit number
    const targetPhone = ownerPhone.length === 10 ? '91' + ownerPhone : ownerPhone;

    if (targetPhone) {
      window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const onPaymentDone = () => {
    if (createdOrder) {
      redirectToWhatsApp(createdOrder);
      navigate(`/client/order/${createdOrder.invoiceId}`);
    }
  };

  return (
    <div className="container-fluid p-0 pb-3">
      {/* Fixed Header Wrapper */}
      <div className="fixed-top shadow-sm" style={{ zIndex: 3050 }}>
        {/* Announcement Bar */}
        <div className="announcement-bar shadow-sm" style={{
          position: 'relative',
          padding: '3px 12px',
          fontSize: 'clamp(10px, 3vw, 14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          🚚 FREE Delivery on all orders above ₹999!
        </div>

        {/* Header & Cart Toggle */}
        <header className="navbar navbar-expand-lg border-bottom px-2 px-sm-4 px-md-5" style={{
          height: 'auto',
          minHeight: 'clamp(60px, 12vh, 120px)',
          padding: '8px 0',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div className="container-fluid d-flex justify-content-between align-items-center px-0 flex-nowrap">
            <Link to="/" className="d-flex align-items-center text-decoration-none" onClick={() => { setStep('shop'); setPaymentStep(false); }}>
              <img src={settings.logoUrl || logo} alt="Logo" className="rounded-circle me-1 me-md-3 border border-1 border-white header-logo" style={{ width: 'clamp(40px, 10vw, 80px)', height: 'clamp(40px, 10vw, 80px)', objectFit: 'cover', flexShrink: 0 }} />
              <div className="header-title-container" style={{ minWidth: 0, flexShrink: 1 }}>
                <h1 className="fw-extrabold mb-0 text-dark header-title" style={{
                  fontSize: 'clamp(1rem, 5.5vw, 2.5rem)',
                  letterSpacing: '-1px',
                  lineHeight: '1.1',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.05)',
                  wordBreak: 'keep-all'
                }}>{settings.storeName || 'Sparkle Gift Shop'}</h1>
                <p className="text-primary mb-0 fw-bold opacity-75 text-uppercase d-none d-sm-block" style={{ letterSpacing: '3px', fontSize: '10px', marginTop: '4px' }}>Premium Gifts</p>
              </div>
            </Link>

            <div className="d-flex align-items-center gap-1 gap-md-2 flex-shrink-0 ms-2">
              <button
                className="btn btn-primary position-relative rounded-pill px-3 px-sm-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                onClick={() => setShowCart(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontSize: '14px'
                }}
              >
                <i className="bi bi-bag-heart fs-6"></i>
                <span className="fw-bold d-none d-sm-inline">Cart</span>
                {cart.items.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px', padding: '3px 6px' }}>
                    {cart.items.length}
                  </span>
                )}
              </button>

              <div className="position-relative">
                <button
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 border-2 dropdown-toggle ${menuOpen ? 'btn-primary' : 'btn-outline-primary'}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                  style={{ fontSize: '12px', zIndex: 3060, position: 'relative' }}
                >
                  <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} fs-6`}></i>
                  <span className="d-none d-sm-inline">{menuOpen ? 'Close' : 'More'}</span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="position-fixed top-0 start-0 w-100 h-100"
                      style={{ zIndex: 3055, background: 'transparent' }}
                      onClick={() => setMenuOpen(false)}
                    ></div>
                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 show" style={{
                      borderRadius: '16px',
                      minWidth: '220px',
                      overflow: 'hidden',
                      position: 'absolute',
                      right: 0,
                      zIndex: 3060,
                      animation: 'slideDown 0.3s ease'
                    }}>
                      <li>
                        <Link
                          to="/track"
                          className="dropdown-item py-3 px-4 d-flex align-items-center gap-3"
                          style={{ fontSize: '14px' }}
                          onClick={() => setMenuOpen(false)}
                        >
                          <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                          <span className="fw-semibold">Track Order</span>
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider my-0" /></li>
                      {!localStorage.getItem('sparkle_token') ? (
                        <li>
                          <Link
                            to="/login"
                            className="dropdown-item py-3 px-4 d-flex align-items-center gap-3"
                            style={{ fontSize: '14px' }}
                            onClick={() => setMenuOpen(false)}
                          >
                            <i className="bi bi-person-check-fill text-primary fs-5"></i>
                            <span className="fw-semibold">Sign In</span>
                          </Link>
                        </li>
                      ) : (
                        <li>
                          <button
                            className="dropdown-item py-3 px-4 d-flex align-items-center gap-3 w-100 text-start"
                            style={{ fontSize: '14px' }}
                            onClick={() => {
                              setMenuOpen(false);
                              localStorage.removeItem('sparkle_token');
                              localStorage.removeItem('sparkle_user');
                              localStorage.removeItem('sparkle_pending_add');
                              window.location.reload();
                            }}
                          >
                            <i className="bi bi-box-arrow-right text-danger fs-5"></i>
                            <span className="fw-semibold text-danger">Logout</span>
                          </button>
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Toast Notification */}
      {status && (
        <div className="alert alert-success status-toast shadow-lg border-0 rounded-pill px-4" style={{ top: '80px' }}>
          <i className="bi bi-check-circle-fill me-2"></i> {status}
        </div>
      )}


      <div className="container-fluid p-0 py-4" style={{ marginTop: 'clamp(90px, 18vh, 150px)' }}>

        {/* Cart Offcanvas (Sidebar) */}
        <div className={`offcanvas offcanvas-end ${showCart ? 'show' : ''}`} tabIndex="-1" style={{ visibility: showCart ? 'visible' : 'hidden', zIndex: 4000, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
          <div className="offcanvas-header bg-white border-bottom py-3">
            <h5 className="offcanvas-title fw-bold text-dark mb-0"><i className="bi bi-bag-heart me-2 text-primary"></i>Your Shopping Bag</h5>
            <button type="button" className="btn-close shadow-none" onClick={() => setShowCart(false)} aria-label="Close"></button>
          </div>
          <div className="offcanvas-body d-flex flex-column bg-light bg-opacity-50">
            {cart.items.length === 0 ? (
              <div className="text-center text-muted py-5 mt-5">
                <div className="bg-white rounded-circle p-4 d-inline-block shadow-sm mb-3">
                  <i className="bi bi-cart-x text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5>Your bag is empty</h5>
                <p className="small opacity-75">Looks like you haven't added anything yet.</p>
                <button className="btn btn-primary rounded-pill px-4 mt-3 fw-bold" onClick={() => setShowCart(false)}>Start Shopping</button>
              </div>
            ) : (
              <>
                <div className="flex-grow-1 overflow-auto">
                  {cart.items.map((item) => (
                    <div className="card border-0 shadow-sm mb-3 overflow-hidden p-2" key={item.productId}>
                      <div className="d-flex align-items-center">
                        <div className="position-relative bg-light rounded me-3 border" style={{ width: 60, height: 60, aspectRatio: '1/1', overflow: 'hidden' }}>
                          <img
                            src={item.product?.image || 'https://via.placeholder.com/60'}
                            alt={item.product?.name}
                            className="w-100 h-100 object-fit-contain"
                            style={{ backgroundColor: '#f8f9fa' }}
                          />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="fw-bold small text-truncate">
                            {item.product?.name} {item.variantSize && <span className="text-muted">({item.variantSize})</span>}
                          </div>
                          <div className="text-muted smallest fw-medium">Unit Price: ₹{item.variantPrice || item.product?.price}</div>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <div className="input-group input-group-sm" style={{ width: '80px' }}>
                              <button className="btn btn-light border-0 px-2" onClick={() => onQty(item.productId, item.quantity - 1, item.variantSize, item.variantColor)}>-</button>
                              <span className="form-control text-center border-0 bg-white small p-0 d-flex align-items-center justify-content-center fw-bold">{item.quantity}</span>
                              <button className="btn btn-light border-0 px-2" onClick={() => onQty(item.productId, item.quantity + 1, item.variantSize, item.variantColor)}>+</button>
                            </div>
                            <div className="ms-auto fw-bold text-primary small">₹{item.lineTotal?.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-4 shadow-sm p-3 mt-auto border">
                  {/* Coupon Section inside Cart */}
                  <form className="input-group input-group-sm mb-3 border rounded-pill overflow-hidden bg-light" onSubmit={(e) => { e.preventDefault(); applyCoupon(); }}>
                    <input
                      type="text"
                      className="form-control border-0 bg-transparent ps-3"
                      placeholder="Apply Promo Code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary border-0 px-3 fw-bold">Apply</button>
                  </form>

                  <div className="smallest text-muted mb-3 border-bottom pb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Subtotal</span>
                      <span className="fw-bold">₹{cart.total?.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="d-flex justify-content-between mb-1 text-success">
                        <span>Bag Discount</span>
                        <span className="fw-bold">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-1 text-success">
                      <span>Delivery Fee</span>
                      <span className="fw-bold">FREE</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                    <span className="fw-bold text-dark">Total Payable</span>
                    <span className="h4 mb-0 text-primary fw-extrabold">₹{finalTotal.toFixed(2)}</span>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="button" className="btn btn-primary py-2 rounded-pill fw-bold shadow-sm" onClick={() => { setShowCart(false); onCheckout(); }}>
                      Secure Checkout <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                    <button type="button" className="btn btn-link text-danger btn-sm text-decoration-none fw-bold opacity-75" onClick={onClear}>
                      <i className="bi bi-trash3 me-1"></i> Clear My Bag
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Backdrop for Offcanvas */}
        {showCart && (
          <div
            className="offcanvas-backdrop fade show"
            style={{ zIndex: 3900, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCart(false)}
          ></div>
        )}

        {step === 'shop' && (
          <div className="row g-4 mx-0">
            {/* Main Content: Offers + Products */}
            <div className="col-12">
              <OffersCarousel coupons={coupons} />

              <TrustBadges />

              <div className="sticky-top py-2 py-md-3 bg-white border-bottom shadow-sm" style={{
                top: 'calc(clamp(65px, 12vh, 125px) + clamp(15px, 3vh, 30px))',
                zIndex: 1010,
                marginLeft: '-12px',
                marginRight: '-12px',
                paddingLeft: '12px',
                paddingRight: '12px',
                marginTop: 'clamp(15px, 3vh, 20px)'
              }}>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="d-flex align-items-center rounded-pill px-3 mx-auto transition-all"
                  style={{
                    maxWidth: '700px',
                    backgroundColor: '#fcfaff',
                    border: searchFocus ? '1px solid #6d28d9' : '1px solid #f0e8ff',
                    boxShadow: searchFocus ? '0 4px 20px rgba(109, 40, 217, 0.1)' : '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                >
                  <i className={`bi bi-search ${searchFocus ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '18px' }}></i>
                  <input
                    className="form-control border-0 shadow-none ps-3 py-2 fw-medium bg-transparent"
                    placeholder="Search for gifts, cakes, decor..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchFocus(true)}
                    onBlur={() => setSearchFocus(false)}
                    style={{ fontSize: '16px', color: '#4b5563' }}
                  />
                </form>
              </div>

              <div className="container-fluid px-3 px-md-4 mt-4">
                <div className="row g-4">
                  {/* Desktop Sidebar Filter */}
                  <div className="col-md-3 d-none d-md-block">
                    <div className="card border-0 shadow-sm p-3 sticky-top no-scrollbar" style={{
                      top: 'calc(clamp(65px, 12vh, 125px) + 100px)',
                      borderRadius: '24px',
                      maxHeight: 'calc(100vh - (clamp(65px, 12vh, 125px) + 130px))',
                      overflowY: 'auto',
                      zIndex: 1005
                    }}>
                      <h6 className="fw-extrabold text-uppercase text-muted mb-3 tracking-widest">Categories</h6>
                      <div className="d-flex flex-column gap-1">
                        {categories.map((c) => {
                          const iconMap = {
                            'All': 'bi-grid-fill',
                            'Cakes': 'bi-cake2',
                            'Flowers': 'bi-flower1',
                            'Coffee Mugs': 'bi-cup-hot',
                            'Frames': 'bi-image',
                            'Keychains': 'bi-key',
                            'Lamps': 'bi-lamp',
                            'Personalized': 'bi-person-heart',
                            'Decor': 'bi-house-heart',
                            'Gift Boxes': 'bi-gift',
                            'Clocks': 'bi-clock'
                          };
                          const icon = iconMap[c] || 'bi-bag-heart';
                          return (
                            <button
                              key={c}
                              type="button"
                              className={`btn text-start py-2 px-3 fw-bold rounded-3 d-flex align-items-center gap-3 ${category === c ? 'btn-primary shadow-sm' : 'btn-light bg-transparent text-dark border-0 hover-bg-light'}`}
                              onClick={() => setCategory(c)}
                              style={{ fontSize: '18px' }}
                            >
                              <i className={`bi ${icon} fs-5`}></i>
                              {c}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-top">
                        <div className="alert alert-primary bg-primary bg-opacity-10 border-0 p-3 rounded-4 mb-0">
                          <i className="bi bi-stars text-primary mb-2 d-block fs-4"></i>
                          <div className="fw-bold smallest text-dark mb-1">New Arrivals Soon!</div>
                          <div className="text-muted smallest" style={{ lineHeight: '1.4' }}>Stay tuned for our upcoming Valentines collection.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Content Area */}
                  <div className="col-12 col-md-9">
                    {/* Mobile Category Scroll (Visible only on mobile) */}
                    <div className="d-md-none mb-4 overflow-hidden">
                      <div className="d-flex gap-2 overflow-auto pb-2 no-scrollbar flex-nowrap align-items-center">
                        {categories.map((c) => {
                          const iconMap = {
                            'All': 'bi-grid-fill',
                            'Cakes': 'bi-cake2',
                            'Flowers': 'bi-flower1',
                            'Coffee Mugs': 'bi-cup-hot',
                            'Frames': 'bi-image',
                            'Keychains': 'bi-key',
                            'Lamps': 'bi-lamp',
                            'Personalized': 'bi-person-heart',
                            'Decor': 'bi-house-heart',
                            'Gift Boxes': 'bi-gift'
                          };
                          const icon = iconMap[c] || 'bi-bag-heart';
                          return (
                            <button
                              key={c}
                              type="button"
                              className={`btn rounded-pill px-4 fw-bold border-0 shadow-sm d-flex align-items-center gap-2 ${category === c ? 'btn-primary' : 'bg-white text-dark'}`}
                              onClick={() => setCategory(c)}
                              style={{ whiteSpace: 'nowrap', height: '44px', fontSize: '16px' }}
                            >
                              <i className={`bi ${icon} fs-5`}></i>
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Results Count & Product Grid */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <span className="fw-extrabold h4 mb-0">{category}</span>
                        <span className="text-muted ms-2 smallest fw-bold">{filtered.length} Items</span>
                      </div>
                    </div>

                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-2 g-md-4 mb-5">
                      {filtered.map((p) => (
                        <div className="col" key={p.id}>
                          <ProductCard product={p} onAdd={onAdd} />
                        </div>
                      ))}
                    </div>

                    {/* Footer inside Content Area */}
                    <footer className="mt-5 pt-5 border-top text-center pb-5">
                      <img src={logo} alt="Logo" className="rounded-circle mb-3 border shadow-sm" style={{ width: 60, height: 60, objectFit: 'cover' }} />
                      <h5 className="fw-bold">Sparkle Gift Shop</h5>
                      <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '400px' }}>Providing premium personalized gifts to make your special moments even more memorable. Handcrafted with love.</p>
                      <div className="smallest text-muted fw-bold text-uppercase opacity-50">© 2026 Sparkle Gift Shop. All Rights Reserved.</div>
                    </footer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'checkout' && !paymentStep && (
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg p-3 pt-4">
                <div className="card-header bg-white border-0 pt-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mb-3">
                  <h3 className="mb-0 fw-extrabold h4">Shipping Details</h3>
                  <button type="button" className="btn btn-link text-decoration-none fw-bold small d-flex align-items-center gap-1 p-0" onClick={() => setStep('shop')}>
                    <i className="bi bi-arrow-left"></i> Change Items
                  </button>
                </div>
                <div className="card-body">
                  <div className="bg-light p-3 p-md-4 rounded-4 mb-4 border shadow-sm">
                    <div className="fw-extrabold mb-3 small text-uppercase text-muted tracking-widest text-center" style={{ fontSize: '10px' }}>Order Summary</div>

                    {/* Items Detail List */}
                    <div className="mb-3 border-bottom pb-2">
                      {cart.items.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-3 mb-3">
                          <img src={item.product?.image || logo} alt="" className="rounded-3 border shadow-sm" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                          <div className="flex-grow-1 min-w-0">
                            <div className="small fw-bold text-dark text-truncate" style={{ fontSize: '13px' }}>{item.product?.name} {item.variantSize && `(${item.variantSize})`}</div>
                            <div className="smallest text-muted fw-medium">Qty: {item.quantity} x ₹{item.variantPrice || item.product?.price}</div>
                          </div>
                          <div className="small fw-extrabold text-dark px-2 py-1 rounded-2 bg-white border">₹{item.lineTotal?.toFixed(0)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex flex-column gap-2 mb-3">
                      <div className="d-flex justify-content-between align-items-center px-1">
                        <span className="small text-muted fw-medium">Subtotal</span>
                        <span className="small fw-bold text-dark">₹{cart.total?.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 p-2 rounded-3">
                          <span className="small text-success fw-bold">Coupon Discount</span>
                          <span className="small fw-extrabold text-success">-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center px-1">
                        <span className="small text-muted fw-medium">Delivery</span>
                        <span className="small fw-extrabold text-success text-uppercase">Free</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top px-1">
                      <span className="fw-extrabold text-dark h4 mb-0">Total Amount</span>
                      <span className="h3 mb-0 text-primary fw-extrabold">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted opacity-75">Customer Full Name</label>
                    <input className="form-control bg-light border-0 shadow-none ps-3 py-2 fw-medium rounded-pill" value={orderForm.customerName} onChange={(e) => setOrderForm(f => ({ ...f, customerName: e.target.value }))} placeholder="e.g. John Doe" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted opacity-75">Phone Number (WhatsApp No.)</label>
                    <input
                      className="form-control bg-light border-0 shadow-none ps-3 py-2 fw-medium rounded-pill"
                      type="tel"
                      maxLength={10}
                      value={orderForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) {
                          setOrderForm(f => ({ ...f, phone: val }));
                        }
                      }}
                      placeholder="e.g. 9876543210"
                    />
                    <div className="smallest text-muted mt-2 ps-2">We will share order updates on this number.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted opacity-75">Delivery Address</label>
                    <textarea className="form-control bg-light border-0 shadow-none ps-3 py-2 fw-medium rounded-4" rows={3} value={orderForm.address} onChange={(e) => setOrderForm(f => ({ ...f, address: e.target.value }))} placeholder="House No, Street Name, Area, Landmark" />
                  </div>

                  <div className="mb-4 pt-2">
                    <label className="form-label small fw-bold text-uppercase text-muted opacity-75 mb-3">Choose Payment Method</label>
                    <div className="d-flex flex-column gap-2">
                      <button
                        className={`btn py-3 rounded-pill fw-bold border-2 d-flex align-items-center justify-content-between px-4 ${orderForm.paymentMethod === 'upi' ? 'btn-primary border-primary shadow-sm' : 'btn-light border-transparent grayscale op-70'}`}
                        onClick={() => setOrderForm(f => ({ ...f, paymentMethod: 'upi' }))}
                      >
                        <span><i className="bi bi-qr-code-scan me-2"></i> Pay Online (UPI)</span>
                        {orderForm.paymentMethod === 'upi' && <i className="bi bi-check-circle-fill"></i>}
                      </button>
                      <button
                        className={`btn py-3 rounded-pill fw-bold border-2 d-flex align-items-center justify-content-between px-4 ${orderForm.paymentMethod === 'cod' ? 'btn-primary border-primary shadow-sm' : 'btn-light border-transparent grayscale op-70'}`}
                        onClick={() => setOrderForm(f => ({ ...f, paymentMethod: 'cod' }))}
                      >
                        <span><i className="bi bi-cash me-2"></i> Cash on Delivery</span>
                        {orderForm.paymentMethod === 'cod' && <i className="bi bi-check-circle-fill"></i>}
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 py-3 rounded-pill fw-extrabold shadow-lg hover-grow mt-2" onClick={onPlaceOrder} disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                    ) : (
                      `Complete Order - ₹${finalTotal.toFixed(2)}`
                    )}
                  </button>
                  <p className="text-center smallest text-muted mt-3 fw-medium">By clicking complete, you agree to our terms and conditions.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
