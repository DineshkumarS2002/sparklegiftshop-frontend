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

  // If variants exist, default to the first one? No, force selection? 
  // Let's default to null to make user choose, OR default to first for easy clicking.
  // Better to default to null if we want them to actively confusing, but for "Select Button" request
  // let's show buttons.

  // Actually, if variants exist, show the price range or "Starts from".
  // But simplistic approach: Default to base product if no variant selected? 
  // Or if variants exist, hide base product add button until variant selected?
  // Let's go with: Buttons are displayed. 

  const hasVariants = product.variants && product.variants.length > 0;

  // Current display price
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;

  // Current display image
  const displayImage = selectedVariant && selectedVariant.image ? selectedVariant.image : (product.image || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=500&q=80');

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (hasVariants && !selectedVariant) {
      // If variants exist but none selected, maybe shake the variant container or alert?
      // Let's Select the first one automatically or just alert?
      // "select option vachu kudu" -> give select option.
      alert('Please select an option');
      return;
    }

    setAdding(true);
    await onAdd(product.id, selectedVariant);
    setTimeout(() => setAdding(false), 1500);
  };

  return (
    <div className="card h-100 product-card border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
      <div className="position-relative overflow-hidden" style={{ aspectRatio: '1/1', borderRadius: '16px 16px 0 0' }}>
        <img
          src={displayImage}
          alt={product.name}
          className="product-image w-100 h-100 object-fit-cover transition-all"
        />
        {product.price > 500 && (
          <span className="position-absolute top-0 start-0 m-2 badge bg-danger rounded-pill px-2 py-1 smallest fw-bold shadow-sm">Hot Seller</span>
        )}
      </div>
      <div className="card-body p-3 d-flex flex-column">
        <div className="text-primary fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{product.category}</div>
        <h6 className="card-title fw-bold mb-2 text-dark text-truncate" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{product.name}</h6>

        {/* Dynamic Variant Selector: Buttons */}
        {hasVariants && (
          <div className="mb-3">
            <label className="d-block w-100 text-muted smallest mb-1">Select Size</label>
            <div className="d-flex flex-wrap gap-1">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  className={`btn btn-sm flex-grow-1 py-1 px-2 border rounded-1 ${selectedVariant === v ? 'btn-primary' : 'btn-outline-secondary text-dark border-secondary-subtle'}`}
                  style={{ fontSize: '10px' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div>
            <span className="fw-extrabold text-dark h5 mb-0">₹{displayPrice}</span>
            {displayOriginalPrice && (
              <div className="d-flex align-items-center gap-1">
                <span className="smallest text-muted text-decoration-line-through">₹{displayOriginalPrice}</span>
                <span className="text-success smallest fw-bold">{Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}% OFF</span>
              </div>
            )}
          </div>
          <button
            className={`btn ${adding ? 'btn-success' : 'btn-primary'} rounded-circle d-flex align-items-center justify-content-center shadow-sm p-0`}
            style={{ width: '36px', height: '36px', transition: 'all 0.3s' }}
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? <i className="bi bi-check-lg fs-5"></i> : <i className="bi bi-cart-plus fs-5"></i>}
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
        <div className="trust-card shadow-sm">
          <i className="bi bi-truck trust-icon"></i>
          <div className="fw-bold small">Fast Delivery</div>
          <div className="text-muted smallest">Across Tamilnadu</div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="trust-card shadow-sm">
          <i className="bi bi-patch-check trust-icon"></i>
          <div className="fw-bold small">Premium Quality</div>
          <div className="text-muted smallest">Handpicked Items</div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="trust-card shadow-sm">
          <i className="bi bi-shield-lock trust-icon"></i>
          <div className="fw-bold small">Secure Payment</div>
          <div className="text-muted smallest">UPI & COD</div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="trust-card shadow-sm">
          <i className="bi bi-chat-heart trust-icon"></i>
          <div className="fw-bold small">Best Support</div>
          <div className="text-muted smallest">WhatsApp Ready</div>
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
    <div className="card border-0 mt-3 mb-5 text-white overflow-hidden shadow-lg hover-shadow" style={{
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
          <div className="d-inline-flex align-items-center bg-white bg-opacity-20 rounded-pill p-1 ps-3 border border-white border-opacity-30 backdrop-blur">
            <span className="fw-extrabold me-3 text-white tracking-widest h5 mb-0">{code}</span>
            <button className="btn btn-primary rounded-pill px-4 fw-extrabold shadow-sm" onClick={() => { navigator.clipboard.writeText(code); alert(`Code ${code} Copied!`); }}>COPY CODE</button>
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
      const responses = await Promise.allSettled([
        clientFetchProducts(),
        clientFetchCart(),
        clientFetchSettings(),
        clientFetchCoupons()
      ]);

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


  const onQty = async (productId, qty, variantSize) => {
    // Optimistic Update
    setCart(prev => {
      const newItems = prev.items.map(item => {
        if (item.productId === productId && item.variantSize === variantSize) {
          const newQty = Math.max(0, qty);
          return { ...item, quantity: newQty, lineTotal: +(newQty * (item.variantPrice || item.product?.price || 0)).toFixed(2) };
        }
        return item;
      }).filter(item => item.quantity > 0);
      const subtotal = +newItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2);
      return { items: newItems, subtotal, total: subtotal };
    });

    try {
      const next = await clientUpdateCartItem(productId, qty, variantSize);
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
      {/* Announcement Bar */}
      <div className="announcement-bar shadow-sm">
        🚚 FREE Delivery on all orders above ₹999!
      </div>



      {/* Toast Notification */}
      {status && (
        <div className="alert alert-success status-toast shadow-lg border-0 rounded-pill px-4">
          <i className="bi bi-check-circle-fill me-2"></i> {status}
        </div>
      )}

      {/* Header & Cart Toggle */}
      <header className="navbar navbar-expand-lg bg-white shadow-sm border-bottom fixed-top px-3 px-sm-4 px-md-6 px-lg-8 py-3" style={{ zIndex: 3050, top: '28px', height: '75px' }}>
        <div className="container-fluid p-0 d-flex justify-content-between align-items-center h-100">
          <Link to="/" className="d-flex align-items-center text-decoration-none" onClick={() => { setStep('shop'); setPaymentStep(false); }}>
            <img src={settings.logoUrl || logo} alt="Logo" className="rounded-circle me-2 me-lg-3 shadow-sm header-logo border" style={{ width: 62, height: 62, objectFit: 'cover' }} />
            <div className="header-title-container">
              <h1 className="h4 fw-bold mb-0 text-dark header-title">{settings.storeName || 'Sparkle Gift Shop'}</h1>
              <p className="text-muted mb-0 d-none d-sm-block smallest fw-bold  opacity-75">Personalized Gifts for Every Occasion</p>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link to="/track" className="btn btn-sm btn-light border rounded-pill px-3 fw-bold text-primary d-flex align-items-center">
              <i className="bi bi-geo-alt"></i> <span className="d-none d-md-inline ms-1 small">Track Order</span>
            </Link>

            <button className="btn btn-primary position-relative rounded-pill px-3 py-1 d-flex align-items-center shadow-sm" onClick={() => setShowCart(true)}>
              <i className="bi bi-bag-heart fs-6 me-2"></i>
              <span className="small fw-bold">Cart</span>
              {cart.items.length > 0 && (
                <span className="ms-2 badge rounded-pill bg-white text-primary" style={{ fontSize: '10px' }}>
                  {cart.items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>


      <div className="container-fluid px-3 px-md-5 py-4 mt-5 pt-5">

        {/* Cart Offcanvas (Sidebar) */}
        <div className={`offcanvas offcanvas-end ${showCart ? 'show' : ''}`} tabIndex="-1" style={{ visibility: showCart ? 'visible' : 'hidden', zIndex: 4000, borderLeft: 'none', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', transition: 'none' }}>
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
                        <img
                          src={item.product?.image || 'https://via.placeholder.com/60'}
                          alt={item.product?.name}
                          className="rounded me-3 border"
                          style={{ width: 60, height: 60, objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1 min-w-0">
                          <div className="fw-bold small text-truncate">
                            {item.product?.name} {item.variantSize && <span className="text-muted">({item.variantSize})</span>}
                          </div>
                          <div className="text-muted smallest fw-medium">Unit Price: ₹{item.variantPrice || item.product?.price}</div>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <div className="input-group input-group-sm" style={{ width: '80px' }}>
                              <button className="btn btn-light border-0 px-2" onClick={() => onQty(item.productId, item.quantity - 1, item.variantSize)}>-</button>
                              <span className="form-control text-center border-0 bg-white small p-0 d-flex align-items-center justify-content-center fw-bold">{item.quantity}</span>
                              <button className="btn btn-light border-0 px-2" onClick={() => onQty(item.productId, item.quantity + 1, item.variantSize)}>+</button>
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
                    <button className="btn btn-primary py-2 rounded-pill fw-bold shadow-sm" onClick={() => { setShowCart(false); onCheckout(); }}>
                      Secure Checkout <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                    <button className="btn btn-link text-danger btn-sm text-decoration-none fw-bold opacity-75" onClick={onClear}>
                      <i className="bi bi-trash3 me-1"></i> Clear My Bag
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Backdrop for Offcanvas */}
        {showCart && <div className="offcanvas-backdrop fade show" style={{ zIndex: 3900 }} onClick={() => setShowCart(false)}></div>}

        {step === 'shop' && (
          <div className="row g-4">
            {/* Main Content: Offers + Products */}
            <div className="col-12">
              <OffersCarousel coupons={coupons} />

              <TrustBadges />

              {/* Search & Filter */}
              <div className="mb-4 sticky-top bg-light bg-opacity-75 backdrop-blur py-2 mt-3" style={{ top: '90px', zIndex: 1000 }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                    <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white ps-2">
                      <span className="input-group-text bg-transparent border-0 p-0 ps-2">
                        <i className="bi bi-search text-primary small"></i>
                      </span>
                      <input
                        className="form-control border-0 shadow-none ps-2 py-1 fw-medium small"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ height: '36px' }}
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex gap-1 overflow-auto pb-1 no-scrollbar flex-nowrap align-items-center" style={{ height: '40px' }}>
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 fw-bold transition-all border-0 shadow-sm smallest ${category === c ? 'btn-primary' : 'bg-white text-muted'}`}
                          onClick={() => setCategory(c)}
                          style={{ whiteSpace: 'nowrap', height: '32px' }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-md-3 mb-5">
                {filtered.map((p) => (
                  <div className="col" key={p.id}>
                    <ProductCard product={p} onAdd={onAdd} />
                  </div>
                ))}
              </div>

              {/* Footer Section */}
              <footer className="mt-4 pt-4 border-top text-center pb-4">
                <img src={logo} alt="Logo" className="rounded-circle mb-3 border shadow-sm" style={{ width: 60, height: 60, objectFit: 'cover' }} />
                <h5 className="fw-bold">Sparkle Gift Shop</h5>
                <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '400px' }}>Providing premium personalized gifts to make your special moments even more memorable. Handcrafted with love. Delivering happiness Across Tamilnadu.</p>
                <div className="smallest text-muted fw-bold text-uppercase opacity-50">© 2024 Sparkle Gift Shop. All Rights Reserved.</div>
              </footer>
            </div>
          </div>
        )}

        {step === 'checkout' && !paymentStep && (
          <div className="row justify-content-center animate-slide-up">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg p-3 pt-4">
                <div className="card-header bg-white border-0 pt-0 d-flex justify-content-between align-items-center">
                  <h3 className="mb-0 fw-extrabold">Shipping Details</h3>
                  <button className="btn btn-link text-decoration-none fw-bold" onClick={() => setStep('shop')}><i className="bi bi-arrow-left"></i> Change Items</button>
                </div>
                <div className="card-body">
                  <div className="bg-light bg-opacity-75 p-3 rounded-4 mb-4 border border-white">
                    <div className="fw-bold mb-2 small text-uppercase text-muted tracking-wide">Order Summary</div>
                    <table className="table table-sm mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <td className="small text-muted py-1">Items ({cart.items.length})</td>
                          <td className="text-end small fw-bold py-1">₹{cart.total?.toFixed(2)}</td>
                        </tr>
                        {discount > 0 && (
                          <tr>
                            <td className="small text-success py-1">Coupon Discount</td>
                            <td className="text-end small fw-bold text-success py-1">-₹{discount.toFixed(2)}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="small text-muted py-1">Delivery Charge</td>
                          <td className="text-end small fw-bold text-success py-1">FREE</td>
                        </tr>
                      </tbody>
                      <tfoot className="border-top mt-2">
                        <tr className="fw-extrabold fs-4">
                          <td className="text-start pt-2">Total</td>
                          <td className="text-end text-primary pt-2">₹{finalTotal.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
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
    </div>
  );
}
