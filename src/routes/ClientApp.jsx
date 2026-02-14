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
  getSocketURL
} from '../api/clientApi';
import { io } from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';

const emptyOrderForm = {
  customerName: '',
  phone: '',
  address: '',
  pincode: '',
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

function ProductCard({ product, onAdd, isWishlisted, onWishlistToggle, setStatus }) {
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
      setStatus('Please select an option');
      return;
    }

    setAdding(true);
    // onAdd handles optimistic update and API call internally
    // We don't await it here to ensure the button reverts quickly even on slow networks
    onAdd(product.id, selectedVariant);
    setTimeout(() => setAdding(false), 1000);
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
          loading="lazy"
        />
        {product.isCombo && (
          <div className="position-absolute top-0 start-0 m-3 shadow-lg" style={{ zIndex: 2 }}>
            <span className="badge rounded-pill px-3 py-2 fw-extrabold border-0 d-flex align-items-center gap-1 shadow-sm"
              style={{
                background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
                color: '#451a03',
                fontSize: '11px',
                letterSpacing: '0.5px'
              }}>
              <i className="bi bi-stars"></i> COMBO PACK
            </span>
          </div>
        )}
        <button
          type="button"
          className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow-sm border-0 d-flex align-items-center justify-content-center"
          style={{ width: '32px', height: '32px', opacity: 0.9, zIndex: 2 }}
          onClick={(e) => { e.stopPropagation(); onWishlistToggle(product.id); }}
        >
          <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`}></i>
        </button>
      </div>

      <div className="card-body p-3 d-flex flex-column">
        <h5 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '18px' }}>{product.name}</h5>

        {/* Short Description */}
        <p className="smallest text-muted mb-2 opacity-75 line-clamp-2" style={{ fontSize: '11px', minHeight: '32px' }}>
          {product.description || 'Premium quality handcrafted product designed for your special moments.'}
        </p>

        {/* Combo Items List */}
        {product.isCombo && product.comboItems && product.comboItems.length > 0 && (
          <div className="mb-3 p-2 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-10">
            <div className="smallest fw-bold text-primary text-uppercase mb-2" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>What's Included</div>
            <div className="d-flex flex-column gap-1">
              {product.comboItems.map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-2">
                  {item.image ? (
                    <img src={item.image} className="rounded-circle border" style={{ width: '20px', height: '20px', objectFit: 'cover' }} alt="" />
                  ) : (
                    <i className="bi bi-check2-circle text-primary" style={{ fontSize: '12px' }}></i>
                  )}
                  <div className="flex-grow-1 d-flex flex-column" style={{ lineHeight: '1.2' }}>
                    <span className="fw-bold text-dark text-truncate" style={{ fontSize: '11px' }}>{item.name}</span>
                    <div className="d-flex align-items-center gap-1 opacity-75">
                      <span className="smallest text-primary" style={{ fontSize: '9px' }}>x{item.quantity}</span>
                      {item.variantColor && (
                        <span className="rounded-circle border d-inline-block"
                          style={{ width: '8px', height: '8px', backgroundColor: item.variantColor }}
                          title="Color Variant"
                        ></span>
                      )}
                      {item.variantSize && (
                        <span className="smallest text-muted fw-bold border px-1 rounded" style={{ fontSize: '8px' }}>{item.variantSize}</span>
                      )}
                    </div>
                  </div>
                  <span className="fw-extrabold text-primary" style={{ fontSize: '11px' }}>₹{item.price || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <div className="text-muted fw-bold small">UPI</div>
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


function OffersCarousel({ coupons, setStatus }) {
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

  if (!universalCoupon) return null;

  const code = universalCoupon.code;
  const label = universalCoupon.type === 'percent' ? `Flat ${universalCoupon.value}% OFF!` : `Flat ₹${universalCoupon.value} OFF!`;

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
          <div className="d-inline-flex align-items-center bg-white rounded-pill p-1 ps-3 ps-md-3 border border-white shadow-sm">
            <span className="fw-extrabold me-2 me-md-3 text-dark tracking-widest mb-0" style={{ fontSize: 'clamp(14px, 4vw, 18px)' }}>{code}</span>
            <button className="btn btn-primary rounded-pill px-3 px-md-4 py-1 py-md-2 fw-extrabold shadow-sm" style={{ fontSize: 'clamp(10px, 3vw, 13px)' }} onClick={() => { navigator.clipboard.writeText(code); setStatus(`Code ${code} Copied!`); }}>COPY CODE</button>
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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sparkle_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(() => {
    // If we have products and settings cached, we don't need a full-page loader
    return !localStorage.getItem('sparkle_products') || !localStorage.getItem('sparkle_settings');
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [step, setStep] = useState('shop'); // shop | checkout
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('sparkle_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistOnly, setWishlistOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem('sparkle_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
    const isAdding = !wishlist.includes(id);
    setStatus(isAdding ? 'Added to Wishlist' : 'Removed from Wishlist');
  };

  const navigate = useNavigate();

  useEffect(() => {
    load();

    // Real-time Product Updates
    const socket = io(getSocketURL());
    socket.on('products_updated', async () => {
      console.log("Real-time update received: Refreshing products...");
      try {
        const p = await clientFetchProducts();
        if (p) {
          setProducts(p); // React handles diffing, so this is fine
          localStorage.setItem('sparkle_products', JSON.stringify(p));
        }
      } catch (e) {
        console.error("Failed to refresh products via socket", e);
      }
    });

    socket.on('settings_updated', (newSettings) => {
      console.log("Real-time Settings Update:", newSettings);
      setSettings(newSettings);
      localStorage.setItem('sparkle_settings', JSON.stringify(newSettings));
    });

    return () => socket.disconnect();
  }, []);

  const load = async () => {
    // 1. Quick reveal: Load cached data immediately
    const cachedSettings = localStorage.getItem('sparkle_settings');
    const cachedProducts = localStorage.getItem('sparkle_products');

    if (cachedSettings) setSettings(JSON.parse(cachedSettings));
    if (cachedProducts) {
      setProducts(JSON.parse(cachedProducts));
      setLoading(false); // Don't show full-page loader if we have cache
    } else {
      setLoading(true); // Only show loader if no cache exists
    }

    try {
      const hasToken = !!localStorage.getItem('sparkle_token');

      // 2. Fetch fresh essential data
      // 2. Fetch fresh essential data - Parallel but independent updates

      // Fetch Settings first (usually fast and critical for UI/Layout)
      clientFetchSettings().then(s => {
        if (s) {
          setSettings(s);
          localStorage.setItem('sparkle_settings', JSON.stringify(s));
        }
      }).catch(console.error);

      // Fetch Products (might be large/slow)
      const p = await clientFetchProducts();
      if (p) {
        setProducts(p);
        localStorage.setItem('sparkle_products', JSON.stringify(p));
      }
      setLoading(false); // Hide loader regardless of cache

      // 3. Background fetch secondary data (Cart and Coupons)
      const [c, cp] = await Promise.all([
        hasToken ? clientFetchCart() : Promise.resolve({ items: [], total: 0 }),
        clientFetchCoupons()
      ]);

      setCart(c || { items: [], total: 0 });
      setCoupons(cp || []);

      const pendingAdd = localStorage.getItem('sparkle_pending_add');
      if (pendingAdd) {
        const { id, variant } = JSON.parse(pendingAdd);
        localStorage.removeItem('sparkle_pending_add');
        await onAdd(id, variant);
      }
    } catch (err) {
      console.error("Load failed", err);
    } finally {
      setLoading(false);
    }
  };


  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    const list = Array.from(set).sort();
    if (!list.includes('Combos')) list.push('Combos');
    return ['All', ...list];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = category === 'All' ? true : (category === 'Combos' ? (p.category === 'Combos' || p.isCombo) : p.category === category);
      const wishlistOk = wishlistOnly ? wishlist.includes(p.id) : true;
      const qOk =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      return catOk && qOk && wishlistOk;
    });
  }, [products, query, category, wishlistOnly, wishlist]);

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
        const variantColor = variant ? variant.color : null;
        const variantPrice = variant ? variant.price : product.price;

        // Find existing based on BOTH size and color
        const existingIdx = newItems.findIndex(i =>
          i.productId === id &&
          (i.variantSize || null) === (variantSize || null) &&
          (i.variantColor || null) === (variantColor || null)
        );

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
            variantColor,
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

  /* Delivery Fee Logic */
  const deliveryFee =
    cart.total === 0 ? 0 :
      cart.total < 100 ? 99 : 0;
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
    if (!orderForm.customerName) return setStatus('Enter your full name');
    if (!orderForm.phone || orderForm.phone.length !== 10) return setStatus('Enter valid 10-digit phone number');
    if (!orderForm.address) return setStatus('Enter delivery address');
    if (!orderForm.pincode || orderForm.pincode.length !== 6) return setStatus('Enter valid 6-digit pincode');

    setLoading(true);
    try {
      // 1. Create the order first
      const fullAddress = orderForm.address ? `${orderForm.address} - ${orderForm.pincode}` : orderForm.pincode;
      const order = await clientCreateOrder({
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantSize: i.variantSize,
          variantColor: i.variantColor,
          variantPrice: i.variantPrice
        })),
        customerName: orderForm.customerName,
        phone: orderForm.phone,
        address: fullAddress,
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
    const itemsList = cart.items.map(i => {
      // Resolve full product for combo check
      const fullProd = products.find(p => p.id === i.productId) || i.product;

      const details = [i.variantSize, i.variantColor].filter(Boolean).join(' | ');
      let line = `- ${fullProd?.name || i.product.name} ${details ? `[${details}]` : ''} x${i.quantity}`;
      if (fullProd?.isCombo && fullProd?.comboItems?.length) {
        line += '\n  ' + fullProd.comboItems.map(ci => `  • ${ci.name} x${ci.quantity}`).join('\n  ');
      }
      return line;
    }).join('\n');
    const deliveryStr = deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE';

    const msg = `*--- Sparkle Gift Shop ---*\n\nI have just placed an order. Please confirm it.\n\n*Order Details:*\n----------------\n*Invoice:* ${order.invoiceId}\n*Items:*\n${itemsList}\n\n*Bill Summary:*\n----------------\nSubtotal: ₹${cart.total}\nDiscount: ₹${discount.toFixed(2)}\nDelivery: ${deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}\n*Total Amount: ₹${finalTotal.toFixed(2)}*\n\n*Customer Info:*\n----------------\nName: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.address}\n\nTrack Link: ${window.location.host}/order-details/${order.invoiceId}`;

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
          🚚 {deliveryFee === 0 ? 'FREE Delivery on your order!' : `Add ₹${100 - cart.total} more for FREE delivery!`}
        </div>

        {/* Header & Cart Toggle */}
        <header className="navbar navbar-expand-lg px-2 px-sm-4 px-md-5" style={{
          height: 'auto',
          minHeight: 'clamp(60px, 12vh, 80px)', // Slightly reduced max height
          padding: '8px 0',
          background: '#fff',
          borderBottom: 'none'
        }}>
          <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between px-0">

            {/* 1. LOGO (Order 1) */}
            <Link to="/" className="d-flex align-items-center text-decoration-none order-1 me-auto" onClick={() => { setStep('shop'); setPaymentStep(false); }}>
              <img src={settings.logoUrl || logo} alt="Logo" className="rounded-circle me-1 me-md-3 border border-1 border-white header-logo" style={{ width: 'clamp(35px, 9vw, 60px)', height: 'clamp(35px, 9vw, 60px)', objectFit: 'cover', flexShrink: 0 }} />
              <div className="header-title-container" style={{ minWidth: 0, flexShrink: 1 }}>
                <h1 className="fw-extrabold mb-0 text-dark header-title" style={{
                  fontSize: 'clamp(1rem, 5vw, 1.8rem)',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.1',
                  wordBreak: 'keep-all'
                }}>{settings.storeName || 'Sparkle Gift Shop'}</h1>
                <p className="text-primary mb-0 fw-bold opacity-75 text-uppercase d-block" style={{ letterSpacing: '2px', fontSize: '9px', marginTop: '2px' }}>Premium Gifts</p>
              </div>
            </Link>

            {/* 3. SEARCH BAR (Order 3 Mobile / Order 2 Desktop) */}
            <div className="order-3 order-lg-2 mt-2 mt-lg-0 w-100 w-lg-auto mx-auto px-1 px-md-3 flex-grow-1" style={{ maxWidth: '600px' }}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="d-flex align-items-center rounded-pill px-3 transition-all w-100"
                style={{
                  backgroundColor: '#f8f9fa',
                  border: searchFocus ? '1px solid #6d28d9' : '1px solid #eee',
                  boxShadow: searchFocus ? '0 0 0 3px rgba(109, 40, 217, 0.1)' : 'none',
                  height: '42px'
                }}
              >
                <i className={`bi bi-search ${searchFocus ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '15px' }}></i>
                <input
                  className="form-control border-0 shadow-none ps-2 py-1 fw-medium bg-transparent"
                  placeholder="Search for gifts..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setStep('shop'); }}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  style={{ fontSize: '15px', color: '#4b5563' }}
                />
              </form>
            </div>

            {/* 2. BUTTONS (Order 2 Mobile / Order 3 Desktop) */}
            <div className="d-flex align-items-center gap-2 order-2 order-lg-3 ms-2">
              <button
                className="btn btn-primary position-relative rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                onClick={() => setShowCart(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: 'none',
                  height: '40px'
                }}
              >
                <i className="bi bi-bag-heart fs-6"></i>
                <span className="fw-bold d-none d-sm-inline" style={{ fontSize: '13px' }}>Cart</span>
                {cart.items.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm" style={{ fontSize: '9px', padding: '4px 6px', border: '2px solid white' }}>
                    {cart.items.length}
                  </span>
                )}
              </button>

              {user && (
                <div className="d-none d-md-flex align-items-center gap-2 px-2 py-1 bg-light rounded-pill border shadow-sm">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              <div className="position-relative">
                <style>{`
                  @media (max-width: 991px) {
                    .nav-menu-btn { background: transparent !important; border: none !important; box-shadow: none !important; }
                  }
                  @media (min-width: 992px) {
                    .nav-menu-btn { background: white; border: 1px solid #dee2e6; }
                  }
                `}</style>
                <button
                  className={`btn nav-menu-btn rounded-pill px-0 px-lg-3 py-0 d-flex align-items-center justify-content-center text-dark`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                  style={{ height: '40px', fontSize: '12px', zIndex: 3060, minWidth: '40px' }}
                >
                  <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} fs-5`}></i>
                  <span className="d-none d-lg-inline fw-bold ms-2">Menu</span>
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
                      zIndex: 3060
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
                      <li>
                        <button
                          className="dropdown-item py-3 px-4 d-flex align-items-center gap-3 w-100 text-start"
                          style={{ fontSize: '14px' }}
                          onClick={() => {
                            setWishlistOnly(!wishlistOnly);
                            setMenuOpen(false);
                            setStep('shop');
                          }}
                        >
                          <i className={`bi ${wishlistOnly ? 'bi-heart-fill text-danger' : 'bi-heart text-primary'} fs-5`}></i>
                          <span className="fw-semibold">{wishlistOnly ? 'Show All Products' : 'My Wishlist'}</span>
                        </button>
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
      </div >

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
                  {cart.items.map((item) => {
                    // Resolve display image from variant if possible
                    let displayImg = item.product?.image;
                    if (item.product?.variants?.length > 0) {
                      const v = item.product.variants.find(v =>
                        (v.size == item.variantSize || (!v.size && !item.variantSize)) &&
                        (v.color == item.variantColor || (!v.color && !item.variantColor))
                      );
                      if (v && v.image) displayImg = v.image;
                    }

                    return (
                      <div className="card border shadow-sm mb-2 p-2 rounded-3" key={`${item.productId}-${item.variantSize}-${item.variantColor}`}>
                        <div className="d-flex gap-3 align-items-center">
                          {/* Image */}
                          <div className="flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                            <img
                              src={displayImg || 'https://placehold.co/60'}
                              alt={item.product?.name}
                              className="w-100 h-100 object-fit-cover rounded-3"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="mb-1 text-truncate fw-bold text-dark" style={{ fontSize: '14px' }}>
                              {item.product?.name}
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
                                  className="border rounded-circle d-inline-block position-relative"
                                  style={{ width: '18px', height: '18px', backgroundColor: item.variantColor, flexShrink: 0 }}
                                >
                                  {/* Tooltip-ish or just visual */}
                                </span>
                              )}
                            </div>

                            {/* Combo Items in Cart */}
                            {(products.find(p => p.id === item.productId) || item.product)?.isCombo && (products.find(p => p.id === item.productId) || item.product)?.comboItems?.length > 0 && (
                              <div className="mt-2 p-2 bg-primary bg-opacity-10 rounded-2 border border-primary border-opacity-10">
                                <div className="smallest fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '8px' }}>Combo Includes:</div>
                                {(products.find(p => p.id === item.productId) || item.product).comboItems.map((ci, idx) => (
                                  <div key={idx} className="smallest text-dark d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                    <i className="bi bi-check2 text-primary"></i>
                                    <span className="flex-grow-1">{ci.name} x{ci.quantity}</span>
                                    {/* <span className="fw-bold text-primary">₹{ci.price || 0}</span> */}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Price x Qty & Controls */}
                            <div className="d-flex align-items-center justify-content-between mt-2">
                              <div className="text-muted fw-medium" style={{ fontSize: '13px' }}>
                                ₹{item.variantPrice || item.product?.price} × {item.quantity}
                              </div>

                              {/* Small Qty Controls */}
                              <div className="d-flex align-items-center border rounded-pill px-1 bg-light" style={{ height: '24px' }}>
                                <button className="btn btn-sm btn-link text-decoration-none text-dark p-0 px-2" onClick={() => onQty(item.productId, item.quantity - 1, item.variantSize, item.variantColor)}>−</button>
                                <span className="small fw-bold px-1" style={{ minWidth: '15px', textAlign: 'center' }}>{item.quantity}</span>
                                <button className="btn btn-sm btn-link text-decoration-none text-dark p-0 px-2" onClick={() => onQty(item.productId, item.quantity + 1, item.variantSize, item.variantColor)}>+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-4 shadow-sm p-3 mt-auto border">
                  {/* Coupon Section inside Cart */}
                  {coupons.length > 0 && (
                    <form className="input-group input-group-sm mb-3 border rounded-pill overflow-hidden bg-light" onSubmit={(e) => { e.preventDefault(); applyCoupon(); }}>
                      <input
                        type="text"
                        className="form-control border-0 bg-transparent ps-3"
                        placeholder="Apply Promo Code"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        style={{ boxShadow: 'none' }}
                      />
                      <button type="submit" className="btn btn-primary border-0 px-3 fw-bold">Apply</button>
                    </form>
                  )}

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
                    <div className="d-flex justify-content-between mb-1">
                      <span>Delivery Fee</span>
                      <span className={deliveryFee > 0 ? "fw-bold text-dark" : "fw-bold text-success"}>
                        {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
                      </span>
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
            style={{ zIndex: 3900, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'none' }}
            onClick={() => setShowCart(false)}
          ></div>
        )}

        {step === 'shop' && (
          <div className="row g-4 mx-0">
            {/* Main Content: Offers + Products */}
            <div className="col-12">
              <OffersCarousel coupons={coupons} setStatus={setStatus} />

              <TrustBadges />

              <div className="mt-4"></div>

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
                            'Combos': 'bi-gift-fill',
                            'Cakes': 'bi-cake2',
                            'Flowers': 'bi-flower1',
                            'Coffee Mugs': 'bi-cup-hot',
                            'Frames': 'bi-image',
                            'Keychains': 'bi-key',
                            'Lamps': 'bi-lamp',
                            'Personalized': 'bi-person-heart',
                            'Gift Boxes': 'bi-gift',
                            'Clocks': 'bi-clock'
                          };
                          const icon = iconMap[c] || 'bi-bag-heart';
                          return (
                            <button
                              key={c}
                              type="button"
                              className={`btn text-start py-2 px-3 fw-bold rounded-3 d-flex align-items-center gap-3 ${category === c ? 'btn-primary shadow-sm' : 'btn-light bg-transparent text-dark border-0 hover-bg-light'}`}
                              onClick={() => { setCategory(c); setWishlistOnly(false); }}
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
                            'Combos': 'bi-gift-fill',
                            'Cakes': 'bi-cake2',
                            'Flowers': 'bi-flower1',
                            'Coffee Mugs': 'bi-cup-hot',
                            'Frames': 'bi-image',
                            'Keychains': 'bi-key',
                            'Lamps': 'bi-lamp',
                            'Personalized': 'bi-person-heart',
                            'Gift Boxes': 'bi-gift'
                          };
                          const icon = iconMap[c] || 'bi-bag-heart';
                          return (
                            <button
                              key={c}
                              type="button"
                              className={`btn rounded-pill px-4 fw-bold border-0 shadow-sm d-flex align-items-center gap-2 ${category === c ? 'btn-primary' : 'bg-white text-dark'}`}
                              onClick={() => { setCategory(c); setWishlistOnly(false); }}
                              style={{ whiteSpace: 'nowrap', height: '44px', fontSize: '16px' }}
                            >
                              <i className={`bi ${icon} fs-5`}></i>
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* High-Impact Combo Store Banner on Home - Fully Responsive */}
                    {category === 'All' && !query && settings.comboBannerActive !== false && (
                      <div className="mb-4 mb-md-5">
                        <div
                          className="rounded-4 rounded-md-5 overflow-hidden position-relative shadow-lg cursor-pointer transition-transform hover-scale-sm"
                          onClick={() => setCategory('Combos')}
                        >
                          <div className="position-absolute w-100 h-100" style={{
                            background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                          }}></div>
                          {/* Decorative circles */}
                          <div className="position-absolute top-0 end-0 bg-white bg-opacity-10 rounded-circle" style={{ width: 'clamp(150px, 30vw, 300px)', height: 'clamp(150px, 30vw, 300px)', marginRight: '-15%', marginTop: '-15%' }}></div>

                          <div className="position-relative w-100 d-flex align-items-center p-3 p-sm-4 p-md-5" style={{ minHeight: 'clamp(180px, 25vw, 220px)' }}>
                            <div className="row w-100 align-items-center m-0">
                              <div className="col-8 col-md-7 text-start ps-0">
                                <span className="badge bg-warning text-dark mb-2 px-2 px-md-3 py-1 py-md-2 rounded-pill fw-extrabold" style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>
                                  {settings.comboBannerDiscount || 'SPECIAL OFFER'}
                                </span>
                                <h1 className="fw-extrabold text-white mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: '1.2', wordBreak: 'break-word' }}>
                                  {settings.comboBannerTitle || 'Exclusive Combo Stores'}
                                </h1>
                                <p className="text-white opacity-75 mb-3 d-none d-md-block" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}>
                                  {settings.comboBannerSub || 'Save big with our exclusive handpicked gift combinations. Perfect for every occasion!'}
                                </p>
                                <button className="btn btn-light rounded-pill px-3 px-md-4 py-1 py-md-2 fw-bold text-primary shadow-sm" style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>
                                  Explore Combos <i className="bi bi-arrow-right ms-1"></i>
                                </button>
                              </div>
                              <div className="col-4 col-md-5 text-end pe-0 d-flex justify-content-end align-items-center">
                                <i className="bi bi-gift-fill text-white opacity-25" style={{ fontSize: 'clamp(60px, 15vw, 120px)' }}></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dedicated Combo Page Banner - Fully Responsive */}
                    {category === 'Combos' && settings.comboBannerActive !== false && (
                      <div className="mb-4 rounded-4 rounded-md-5 overflow-hidden position-relative shadow-lg">
                        <div className="position-absolute w-100 h-100" style={{
                          background: 'linear-gradient(45deg, #1e1b4b, #4338ca)',
                          opacity: 1
                        }}></div>
                        <div className="position-relative w-100 d-flex flex-column align-items-center justify-content-center text-center p-4 p-md-5" style={{ minHeight: 'clamp(200px, 30vw, 260px)' }}>

                          <h2 className="fw-extrabold text-white mb-2" style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', lineHeight: '1.2', wordBreak: 'break-word' }}>
                            {settings.comboBannerTitle || 'Exclusive Combo Stores'}
                          </h2>
                          <p className="text-white opacity-75 lead mb-0" style={{ maxWidth: '600px', fontSize: 'clamp(0.9rem, 2vw, 1.25rem)' }}>
                            {settings.comboBannerSub || 'Save more with our curated gift sets. Handpicked combinations for your loved ones.'}
                          </p>
                          <div className="mt-3 mt-md-4 badge bg-warning text-dark px-3 px-md-4 py-2 rounded-pill fw-bold shadow-sm" style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}>
                            {settings.comboBannerDiscount || 'Up to 30% OFF'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Results Count & Product Grid */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <span className="fw-extrabold h4 mb-0">{category === 'Combos' ? '✨ Combo Offers' : (wishlistOnly ? 'My Wishlist' : category)}</span>
                        <span className="text-muted ms-2 smallest fw-bold">{filtered.length} Items</span>
                      </div>
                    </div>

                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-2 g-md-4 mb-5">
                      {filtered.length > 0 ? (
                        filtered.map((p) => (
                          <div className="col" key={p.id}>
                            <ProductCard
                              product={p}
                              onAdd={onAdd}
                              isWishlisted={wishlist.includes(p.id)}
                              onWishlistToggle={toggleWishlist}
                              setStatus={setStatus}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-12 text-center py-5">
                          <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                            <i className={`bi ${wishlistOnly ? 'bi-heart' : 'bi-search'} text-muted fs-1`}></i>
                          </div>
                          <h5 className="fw-bold">{wishlistOnly ? 'Your Wishlist is Empty' : 'No Products Found'}</h5>
                          <p className="text-muted small">
                            {wishlistOnly ? "Start adding your favorite items to see them here." : "Try adjusting your search or category."}
                          </p>
                          {wishlistOnly && (
                            <button className="btn btn-primary rounded-pill px-4 mt-2" onClick={() => setWishlistOnly(false)}>
                              Go Shopping
                            </button>
                          )}
                        </div>
                      )}
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
                      {cart.items.map((item, idx) => {
                        // Resolve display image from variant if possible
                        let displayImg = item.product?.image;
                        if (item.product?.variants?.length > 0) {
                          const v = item.product.variants.find(v =>
                            (v.size == item.variantSize || (!v.size && !item.variantSize)) &&
                            (v.color == item.variantColor || (!v.color && !item.variantColor))
                          );
                          if (v && v.image) displayImg = v.image;
                        }

                        return (
                          <div key={idx} className="card border shadow-sm mb-2 p-2 rounded-3">
                            <div className="d-flex gap-3 align-items-center">
                              {/* Image */}
                              <div className="flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                <img src={displayImg || logo} alt="" className="w-100 h-100 object-fit-cover rounded-3" />
                              </div>

                              {/* Content */}
                              <div className="flex-grow-1 min-w-0">
                                <h6 className="mb-1 text-truncate fw-bold text-dark" style={{ fontSize: '14px' }}>
                                  {item.product?.name}
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

                                {/* Combo Items in Checkout */}
                                {(products.find(p => p.id === item.productId) || item.product)?.isCombo && (products.find(p => p.id === item.productId) || item.product)?.comboItems?.length > 0 && (
                                  <div className="mt-2 p-2 bg-primary bg-opacity-10 rounded-2 border border-primary border-opacity-10">
                                    <div className="smallest fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '8px' }}>Combo Includes:</div>
                                    {(products.find(p => p.id === item.productId) || item.product).comboItems.map((ci, idx) => (
                                      <div key={idx} className="smallest text-dark d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                        <i className="bi bi-check2 text-primary"></i>
                                        <span className="flex-grow-1">{ci.name} x{ci.quantity}</span>
                                        {/* <span className="fw-bold text-primary">₹{ci.price || 0}</span> */}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Total */}
                              <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>
                                ₹{item.lineTotal?.toFixed(0)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                        <span className={`small fw-extrabold ${deliveryFee > 0 ? 'text-dark' : 'text-success'}`}>
                          {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top px-1">
                      <span className="fw-extrabold text-dark h4 mb-0">Total Amount</span>
                      <span className="h3 mb-0 text-primary fw-extrabold">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Customer Full Name <span className="text-danger">*</span></label>
                    <input className="form-control" value={orderForm.customerName} onChange={(e) => setOrderForm(f => ({ ...f, customerName: e.target.value }))} placeholder="e.g. John Doe" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number (WhatsApp No.) <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
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
                    <div className="smallest text-muted mt-2 ps-3">We will share order updates on this number.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Delivery Address <span className="text-danger">*</span></label>
                    <textarea className="form-control rounded-4" rows={3} value={orderForm.address} onChange={(e) => setOrderForm(f => ({ ...f, address: e.target.value }))} placeholder="House No, Street Name, Area, Landmark" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pincode <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      type="tel"
                      maxLength={6}
                      value={orderForm.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 6) {
                          setOrderForm(f => ({ ...f, pincode: val }));
                        }
                      }}
                      placeholder="e.g. 600001"
                    />
                    <div className="smallest text-muted mt-2 ps-3">Enter 6-digit delivery area pincode.</div>
                  </div>

                  <div className="mb-4 pt-2">
                    <label className="form-label small fw-bold text-uppercase text-muted opacity-75 mb-3">Payment Method</label>
                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn py-3 rounded-pill fw-bold border-2 d-flex align-items-center justify-content-between px-4 btn-primary border-primary shadow-sm"
                        onClick={() => setOrderForm(f => ({ ...f, paymentMethod: 'upi' }))}
                      >
                        <span><i className="bi bi-qr-code-scan me-2"></i> Pay Online (UPI)</span>
                        <i className="bi bi-check-circle-fill"></i>
                      </button>
                      <div className="alert alert-success border-0 rounded-3 py-2 px-3 mb-0 d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
                        <i className="bi bi-shield-check"></i>
                        <span>100% Secure Payment • Instant Confirmation</span>
                      </div>
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
