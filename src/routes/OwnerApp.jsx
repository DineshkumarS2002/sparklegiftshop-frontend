// Owner Admin Dashboard
import { useEffect, useMemo, useState } from 'react';
import logo from '../assets/sparkle_logo.jpg';
import {
  ownerCreateProduct,
  ownerDeleteProduct,
  ownerFetchOrders,
  ownerFetchProducts,
  ownerFetchReportPdf,
  ownerFetchReportSummary,
  ownerFetchSettings,
  ownerUpdateProduct,
  ownerUpdateSettings,
  ownerFetchCoupons,
  ownerCreateCoupon,
  ownerDeleteCoupon,
  ownerDeleteOrder,
  ownerToggleDispatch,
  ownerTogglePayment,
  API_BASE_URL
} from '../api/ownerApi';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const emptyProduct = { name: '', price: '', originalPrice: '', category: '', image: '', description: '', isFlashSale: false, variants: [] };

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

// Hook to update favicon
function useFavicon(url) {
  useEffect(() => {
    if (url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    }
  }, [url]);
}

// Hook to update title
function useStoreTitle(name) {
  useEffect(() => {
    if (name) {
      document.title = `${name} | Admin Dashboard`;
    }
  }, [name]);
}

function ProductForm({ form, setForm, onSubmit, editing, onCancel }) {
  // Preview helper
  const previewImage = form.image || 'https://via.placeholder.com/200?text=No+Image';

  return (
    <div className="card border-0 shadow-sm mb-5">
      <div className="card-header bg-white py-4 border-0 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-extrabold text-dark tracking-tight">{editing ? 'Edit Product' : 'New Arrival'}</h4>
          <p className="text-muted small mb-0 fw-medium">Curate your inventory with style.</p>
        </div>
        {editing && (
          <button className="btn btn-light text-danger fw-bold btn-sm shadow-sm border px-3 rounded-pill" onClick={onCancel}>
            <i className="bi bi-x-lg me-1"></i> Cancel
          </button>
        )}
      </div>
      <div className="card-body p-4 p-lg-5">
        <form onSubmit={onSubmit}>
          <div className="row g-3 g-lg-5">
            {/* Left Column: Form Inputs */}
            <div className="col-lg-8 border-lg-end pb-3 pb-lg-0">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold text-muted small text-uppercase">Product Name</label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="e.g. Personalized Magic Mug"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small text-uppercase">Offer Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small text-uppercase">Actual Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={form.originalPrice}
                      onChange={(e) => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    />
                  </div>
                  <small className="text-muted smallest">Leave empty if no discount.</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small text-uppercase">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Select or Type...</option>
                    <option value="Mugs">Mugs</option>
                    <option value="Frames">Frames</option>
                    <option value="Pillows">Pillows</option>
                    <option value="Lamps">Lamps</option>
                    <option value="Keychains">Keychains</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-muted small text-uppercase">Description</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    placeholder="Describe the product features, size, and customization options..."
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Variants/Sizes Section */}
                <div className="col-12">
                  <label className="form-label fw-bold text-muted small text-uppercase">Product Variants/Sizes (Optional)</label>
                  <p className="text-muted smallest mb-2">Add different sizes with their own prices (e.g., Frame 12x8, 10x15)</p>

                  {form.variants && form.variants.length > 0 && (
                    <div className="mb-3">
                      {form.variants.map((variant, index) => (
                        <div key={index} className="d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded">
                          {variant.image && (
                            <img src={variant.image} alt="v" className="rounded" style={{ width: 30, height: 30, objectFit: 'cover' }} />
                          )}
                          <span className="badge bg-primary">{variant.size}</span>
                          <span className="small">₹{variant.price}</span>
                          {variant.originalPrice && <span className="small text-muted text-decoration-line-through">₹{variant.originalPrice}</span>}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={() => {
                              const newVariants = form.variants.filter((_, i) => i !== index);
                              setForm(f => ({ ...f, variants: newVariants }));
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="card bg-light border-0 p-3">
                    <div className="row g-2">
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Size (e.g., 12x8)"
                          id="variantSize"
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Offer Price"
                          id="variantPrice"
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Actual Price"
                          id="variantOriginalPrice"
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Image URL (Optional)"
                          id="variantImage"
                        />
                      </div>
                      <div className="col-12 mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary w-100"
                          onClick={() => {
                            const size = document.getElementById('variantSize').value;
                            const price = document.getElementById('variantPrice').value;
                            const originalPrice = document.getElementById('variantOriginalPrice').value;
                            const image = document.getElementById('variantImage').value;

                            if (size && price) {
                              const newVariant = {
                                size,
                                price: parseFloat(price),
                                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                                image: image || ''
                              };
                              setForm(f => ({ ...f, variants: [...(f.variants || []), newVariant] }));
                              document.getElementById('variantSize').value = '';
                              document.getElementById('variantPrice').value = '';
                              document.getElementById('variantOriginalPrice').value = '';
                              document.getElementById('variantImage').value = '';
                            }
                          }}
                        >
                          <i className="bi bi-plus-lg"></i> Add Variant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media & Preview */}
            <div className="col-lg-4">
              <h6 className="fw-bold text-muted small text-uppercase mb-3">Media & Preview</h6>

              <div className="mb-3">
                <label className="form-label small fw-bold">Image URL</label>
                <input
                  className="form-control p-2 small"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                />
              </div>

              <div className="card product-card border shadow-sm mx-auto" style={{ maxWidth: '280px' }}>
                <div style={{ height: '200px', backgroundColor: '#f8f9fa', overflow: 'hidden' }} className="d-flex align-items-center justify-content-center border-bottom">
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=No+Image'}
                  />
                </div>
                <div className="card-body">
                  <p className="small text-uppercase text-muted mb-1">{form.category || 'Category'}</p>
                  <h5 className="card-title fw-bold mb-1 text-truncate">{form.name || 'Product Name'}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="text-primary fw-bold mb-0">₹{form.price || '0'}</h5>
                    {form.originalPrice && (
                      <span className="text-muted text-decoration-line-through small">₹{form.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 text-end d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-light border fw-bold px-4 rounded-3" onClick={onCancel}>Discard</button>
            <button type="submit" className="btn btn-dark px-5 fw-bold btn-lg rounded-3 shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-check2-circle"></i>
              {editing ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, setSettings, onSave, saving }) {
  return (
    <div className="row justify-content-center pb-5">
      <div className="col-12 col-md-10 col-lg-8 col-xl-7">

        <div className="card border-0 shadow-sm overflow-hidden mb-4" style={{ borderRadius: '1rem' }}>
          <div className="card-header bg-white py-3 px-4 border-bottom">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-shop text-primary"></i> Store Profile
            </h6>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-md-12">
                <div className="d-flex align-items-center gap-4">
                  <div className="position-relative group" style={{ width: 100, height: 100 }}>
                    <div className="w-100 h-100 rounded-circle overflow-hidden position-relative border border-2 border-dashed border-secondary">
                      <img
                        src={settings.logoUrl || 'https://via.placeholder.com/100?text=Logo'}
                        alt="Logo"
                        className="w-100 h-100 object-fit-cover bg-light"
                      />
                      <label
                        className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center transition-all"
                        style={{ cursor: 'pointer' }}
                        title="Upload Logo"
                      >
                        <i className="bi bi-camera-fill text-white fs-4"></i>
                        <input
                          type="file"
                          className="d-none"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSettings(s => ({ ...s, logoUrl: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">Store Name</label>
                    <input
                      className="form-control form-control-lg fw-bold text-dark bg-light border-0"
                      value={settings.storeName || 'Sparkle Gift Shop'}
                      onChange={(e) => setSettings(s => ({ ...s, storeName: e.target.value }))}
                    />
                    <p className="text-muted smallest mt-1 mb-0">This name will appear across your app and invoices.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm overflow-hidden mb-4" style={{ borderRadius: '1rem' }}>
          <div className="card-header bg-white py-3 px-4 border-bottom">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-credit-card text-success"></i> Payment & Contact
            </h6>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">WhatsApp Number</label>
                <div className="input-group input-group-lg border rounded-3 overflow-hidden">
                  <span className="input-group-text bg-white border-0 text-success"><i className="bi bi-whatsapp"></i></span>
                  <input
                    className="form-control border-0 shadow-none ps-1"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
                    placeholder="919876543210"
                  />
                </div>
                <small className="text-muted smallest mt-1 d-block">This number will receive order alerts.</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">UPI ID</label>
                <div className="input-group input-group-lg border rounded-3 overflow-hidden">
                  <span className="input-group-text bg-white border-0 text-primary"><i className="bi bi-qr-code"></i></span>
                  <input
                    className="form-control border-0 shadow-none ps-1"
                    value={settings.upiId || ''}
                    onChange={(e) => setSettings(s => ({ ...s, upiId: e.target.value }))}
                    placeholder="username@upi"
                  />
                </div>
                <small className="text-muted smallest mt-1 d-block">Used for generating payment QR codes.</small>
              </div>

              <div className="col-12">
                <div className="alert alert-light border-0 d-flex gap-3 align-items-start rounded-3">
                  <i className="bi bi-shield-check text-primary fs-4"></i>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Secure Configuration</h6>
                    <p className="mb-0 small text-muted">Your payment details are stored securely and only used to generate QR codes for customers. No transactions are processed directly on this server.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="d-flex justify-content-end pt-2">
          <button
            className="btn btn-dark px-5 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2"
            onClick={onSave}
            disabled={saving}
            style={{ minWidth: '200px', justifyContent: 'center' }}
          >
            {saving ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="bi bi-check2-circle"></i>}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}

function OrdersList({ orders, onWhatsApp, onDeleteOrder, onToggleDispatch, onTogglePayment, onPreview }) {
  if (orders.length === 0) return <div className="text-center p-5 text-muted">No orders found.</div>;
  return (
    <div className="row g-3">
      {orders.map((o) => {
        const subtotal = o.subtotal || 0;
        const discount = o.discount || 0;
        const deliveryFee = o.deliveryFee || 0;

        return (
          <div key={o.id} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100 border-0 shadow-sm transition-all hover-shadow">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-dark border">Invoice No: {o.invoiceId}</span>
                  <button className="btn btn-sm btn-link text-danger p-0 shadow-none border-0" onClick={() => onDeleteOrder(o.id)} title="Delete Invoice">
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm py-1 px-2 rounded-pill fw-bold border ${o.dispatched ? 'btn-success' : 'btn-warning text-dark'}`}
                    onClick={() => onToggleDispatch(o.id, o.dispatched)}
                    style={{ fontSize: '10px' }}
                  >
                    {o.dispatched ? <><i className="bi bi-truck"></i> DISPATCHED</> : <><i className="bi bi-clock"></i> PENDING</>}
                  </button>
                  <button
                    className={`btn btn-sm py-1 px-2 rounded-pill fw-bold border ${o.isPaid ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => onTogglePayment(o.id, o.isPaid)}
                    style={{ fontSize: '10px' }}
                  >
                    {o.isPaid ? <><i className="bi bi-cash-stack"></i> PAID</> : <><i className="bi bi-x-circle"></i> UNPAID</>}
                  </button>
                  <span
                    className={`btn btn-sm py-1 px-2 rounded-pill fw-bold border bg-light text-dark`}
                    style={{ fontSize: '10px', cursor: 'default' }}
                  >
                    {o.paymentMethod === 'cod' ? <><i className="bi bi-cash me-1"></i> COD</> : <><i className="bi bi-qr-code-scan me-1"></i> UPI</>}
                  </span>
                </div>

              </div>
              <div className="card-body d-flex flex-column" style={{ minHeight: '360px' }}>
                {o.paymentScreenshot ? (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                        <i className="bi bi-image me-1"></i> Payment Proof
                      </span>
                      <span className="badge bg-success-subtle text-success border border-success border-opacity-10 rounded-pill" style={{ fontSize: '9px' }}>Uploaded</span>
                    </div>
                    <div
                      className="position-relative overflow-hidden rounded border border-2 border-primary border-opacity-10 shadow-sm hover-grow"
                      style={{ cursor: 'pointer', height: '80px', width: '80px' }}
                      onClick={() => onPreview(o.paymentScreenshot)}
                    >
                      <img
                        src={o.paymentScreenshot}
                        alt="Proof"
                        className="w-100 h-100 object-fit-cover transition-all"
                      />
                      <div className="position-absolute bottom-0 end-0 bg-dark bg-opacity-50 text-white p-1 rounded-start px-2" style={{ fontSize: '10px' }}>
                        <i className="bi bi-zoom-in me-1"></i> Zoom
                      </div>
                    </div>
                  </div>
                ) : (
                  o.paymentMethod === 'upi' && (
                    <div className="alert alert-warning py-2 mb-3 small border-0 d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <span>No screenshot uploaded yet</span>
                    </div>
                  )
                )}

                <div className="mb-3">
                  <h5 className="fw-bold mb-1 text-dark">{o.customerName}</h5>
                  <a href={`tel:${o.phone}`} className="text-primary fw-bold small text-decoration-none d-block mb-2">
                    <i className="bi bi-telephone-fill me-1"></i> {o.phone}
                  </a>
                  <div className="text-muted small border rounded p-2 bg-light">
                    <i className="bi bi-geo-alt-fill me-1 text-danger"></i> <strong>Address:</strong> {o.address || 'No address provided'}
                  </div>
                </div>

                {o.note && (
                  <div className="alert alert-warning py-1 px-2 mb-3 small border-0">
                    <i className="bi bi-sticky-fill me-1"></i> <strong>Note:</strong> {o.note}
                  </div>
                )}

                <div className="mb-3 flex-grow-1">
                  <p className="fw-bold text-muted text-uppercase mb-2" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Order Items</p>
                  <div className="order-items-scroll no-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {o.items.map((i, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 mb-2 border-bottom border-light pb-2">
                        <img
                          src={i.product?.image || 'https://via.placeholder.com/40'}
                          alt=""
                          className="rounded border shadow-sm"
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-bold text-dark small" style={{ lineHeight: '1.2' }}>
                            {i.product?.name || `Product ${i.productId}`} {i.variantSize && <span className="text-muted">({i.variantSize})</span>}
                          </div>
                          <div className="text-muted smallest">₹{i.variantPrice || i.product?.price} x {i.quantity}</div>
                        </div>
                        <div className="fw-bold text-dark small text-nowrap">₹{i.lineTotal?.toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-top pt-2 mt-auto">
                  <div className="d-flex justify-content-between small text-muted mb-1 font-monospace">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between small text-success mb-1 font-monospace">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between small text-muted mb-2 font-monospace">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded border border-primary border-opacity-10 mt-1">
                    <span className="h5 fw-bold mb-0 text-primary">₹{o.total?.toFixed(2)}</span>
                    <div className="d-flex gap-1">
                      <Link to={`/client/order/${o.invoiceId}/label`} target="_blank" className="btn btn-primary btn-sm rounded shadow-sm py-1 px-3 fw-bold" style={{ fontSize: '11px' }}>
                        <i className="bi bi-printer-fill me-1"></i> PRINT
                      </Link>
                      <button className="btn btn-success btn-sm rounded shadow-sm py-1 px-2 fw-bold" onClick={() => onWhatsApp(o)} style={{ fontSize: '11px' }}>
                        <i className="bi bi-whatsapp me-1"></i> WA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsPanel({ range, setRange, data, onDownload, productData, reportUrl }) {
  // Calculate aggregate stats for the current view
  const { totalRevenue, totalOrders } = useMemo(() => {
    return data.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + (curr.total || 0),
      totalOrders: acc.totalOrders + (curr.orders || 0)
    }), { totalRevenue: 0, totalOrders: 0 });
  }, [data]);

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.label),
    datasets: [{
      label: 'Sales (₹)',
      data: data.map((d) => d.total),
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#d946ef');
        gradient.addColorStop(1, '#8b5cf6');
        return gradient;
      },
      borderRadius: 8,
      barThickness: 24
    }],
  }), [data]);

  const productChartData = useMemo(() => {
    const labels = Object.keys(productData);
    const values = Object.values(productData);
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#d946ef', '#8b5cf6', '#f472b6', '#a78bfa', '#e879f9', '#c084fc'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    };
  }, [productData]);

  return (
    <div className="animate-fade-in pb-5">
      {/* Header & Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h3 className="fw-extrabold text-dark mb-1 tracking-tight">Business Insights</h3>
          <p className="text-muted small fw-medium mb-0">Track your growth and performance.</p>
        </div>

        <div className="d-flex align-items-center gap-2 bg-white p-1 rounded-pill shadow-sm border">
          {['daily', 'monthly', 'yearly'].map(id => (
            <button
              key={id}
              className={`btn btn-sm rounded-pill fw-bold px-3 transition-all ${range === id ? 'btn-dark' : 'btn-white text-muted hover-bg-light'}`}
              onClick={() => setRange(id)}
              style={{ textTransform: 'capitalize' }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm overflow-hidden h-100 position-relative group">
            <div className="position-absolute top-0 end-0 p-3 opacity-10">
              <i className="bi bi-currency-rupee display-1 text-primary"></i>
            </div>
            <div className="card-body p-4 position-relative z-1">
              <h6 className="text-uppercase fw-bold text-muted small tracking-wider mb-2">Total Revenue</h6>
              <h2 className="fw-extrabold text-dark mb-0">₹{totalRevenue.toLocaleString()}</h2>
              <span className="badge bg-success-subtle text-success border border-success border-opacity-10 mt-2">
                <i className="bi bi-graph-up-arrow me-1"></i> {range} view
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm overflow-hidden h-100 position-relative group">
            <div className="position-absolute top-0 end-0 p-3 opacity-10">
              <i className="bi bi-bag-check display-1 text-info"></i>
            </div>
            <div className="card-body p-4 position-relative z-1">
              <h6 className="text-uppercase fw-bold text-muted small tracking-wider mb-2">Total Orders</h6>
              <h2 className="fw-extrabold text-dark mb-0">{totalOrders}</h2>
              <span className="badge bg-info-subtle text-info border border-info border-opacity-10 mt-2">
                <i className="bi bi-people me-1"></i> {range} view
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100 bg-primary text-white overflow-hidden position-relative">
            {/* Decoration */}
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-opacity"></div>

            <div className="card-body p-4 d-flex flex-column justify-content-center align-items-start position-relative z-1">
              <h5 className="fw-bold mb-3">Downloads & Exports</h5>
              <div className="d-flex flex-wrap gap-2 w-100">
                <button className="btn bg-white text-primary fw-bold flex-grow-1 shadow-sm" onClick={onDownload}>
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>PDF Report
                </button>
                <a href={`${API_BASE_URL}/reports/export?format=xlsx`} target="_blank" className="btn btn-outline-light fw-bold flex-grow-1">
                  <i className="bi bi-file-earmark-spreadsheet-fill me-2"></i>Excel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-extrabold text-dark mb-0">Sales Trend</h5>
              <i className="bi bi-bar-chart-fill text-muted"></i>
            </div>
            <div className="card-body px-4 pb-4">
              <div style={{ height: 350 }}>
                <Bar
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#000',
                        padding: 12,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 8,
                        displayColors: false
                      }
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 11 } } },
                      y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { family: 'Outfit', size: 11 } } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-extrabold text-dark mb-0">Top Categories</h5>
              <p className="text-muted smallest mb-0">Revenue distribution</p>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center position-relative">
              <div style={{ width: '100%', maxWidth: 280, height: 280 }}>
                <Doughnut
                  data={productChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, font: { size: 10, family: 'Outfit' } } }
                    },
                    cutout: '70%'
                  }}
                />
                {/* Center Text */}
                <div className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none">
                  <span className="d-block text-muted smallest fw-bold text-uppercase">Total</span>
                  <span className="d-block h4 fw-extrabold text-dark mb-0">{Object.keys(productData).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CouponsPanel({ coupons, setCoupons, products }) {
  const [form, setForm] = useState({ code: '', value: '', type: 'percent', applicableTo: 'all', productIds: [] });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.applicableTo === 'specific' && form.productIds.length === 0) {
      alert("Please select at least one product for this specific coupon.");
      return;
    }
    setLoading(true);
    try {
      const newCoupon = await ownerCreateCoupon(form);
      setCoupons([...coupons, newCoupon]);
      setForm({ code: '', value: '', type: 'percent', applicableTo: 'all', productIds: [] });
      alert('Coupon created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    await ownerDeleteCoupon(id);
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const toggleProduct = (pid) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(pid)
        ? f.productIds.filter(id => id !== pid)
        : [...f.productIds, pid]
    }));
  };

  return (
    <div className="row g-4 pb-5">
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm animate-fade-in sticky-top" style={{ top: '160px', borderRadius: '1.25rem' }}>
          <div className="card-header bg-white pt-4 pb-2 border-0 px-4">
            <h4 className="fw-extrabold mb-1 text-dark">Create Coupon</h4>
            <p className="text-muted small mb-0">Launch a new discount campaign</p>
          </div>
          <div className="card-body px-4 pb-4">
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="small fw-bold text-muted text-uppercase mb-2 d-block tracking-wider">Coupon Code</label>
                <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden border">
                  <span className="input-group-text bg-light border-0"><i className="bi bi-tag-fill text-primary"></i></span>
                  <input
                    className="form-control border-0 shadow-none text-uppercase fw-extrabold text-primary"
                    placeholder="E.G. FESTIVE50"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    style={{ letterSpacing: '2px' }}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="small fw-bold text-muted text-uppercase mb-2 d-block tracking-wider">Type</label>
                  <select className="form-select border shadow-none" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Fixed (₹)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="small fw-bold text-muted text-uppercase mb-2 d-block tracking-wider">Value</label>
                  <div className="input-group border rounded shadow-none">
                    <span className="input-group-text bg-white border-0 text-muted px-2">{form.type === 'percent' ? '%' : '₹'}</span>
                    <input type="number" className="form-control border-0 shadow-none ps-0" placeholder="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
                  </div>
                </div>
              </div>

              <div className="mb-1">
                <label className="small fw-bold text-muted text-uppercase mb-3 d-block tracking-wider">Target Audience</label>
                <div className="d-flex gap-2 mb-4">
                  <button
                    type="button"
                    className={`btn btn-sm flex-grow-1 py-2 rounded-pill fw-bold transition-all ${form.applicableTo === 'all' ? 'btn-primary' : 'btn-light border'}`}
                    onClick={() => setForm(f => ({ ...f, applicableTo: 'all', productIds: [] }))}
                  >
                    <i className="bi bi-globe2 me-2"></i>All Store
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-grow-1 py-2 rounded-pill fw-bold transition-all ${form.applicableTo === 'specific' ? 'btn-primary' : 'btn-light border'}`}
                    onClick={() => setForm(f => ({ ...f, applicableTo: 'specific' }))}
                  >
                    <i className="bi bi-list-stars me-2"></i>Selective
                  </button>
                </div>

                {form.applicableTo === 'specific' && (
                  <div className="border-0 rounded-4 p-3 bg-light shadow-inner mb-4 animate-fade-in" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <p className="smallest fw-bold text-muted text-uppercase mb-2">Select Products</p>
                    {products.map(p => (
                      <div key={p.id} className="d-flex align-items-center justify-content-between py-2 border-bottom border-white last-border-0">
                        <div className="form-check m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="button"
                            id={`p-${p.id}`}
                            checked={form.productIds.includes(p.id)}
                            onChange={() => toggleProduct(p.id)}
                          />
                          <label className="form-check-label small fw-medium text-dark ms-2" htmlFor={`p-${p.id}`} role="button">
                            {p.name}
                          </label>
                        </div>
                        <span className="smallest text-primary fw-bold">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary w-100 py-3 fw-extrabold shadow-lg rounded-pill mt-2" type="submit" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</> : 'ACTIVATE COUPON'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="card border-0 shadow-sm overflow-hidden h-100" style={{ borderRadius: '1.25rem' }}>
          <div className="card-header bg-white pt-4 pb-3 border-0 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-extrabold mb-1 text-dark">Active Campaigns</h4>
              <p className="text-muted small mb-0">{coupons.length} coupons currently running</p>
            </div>
            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
              <i className="bi bi-ticket-perforated-fill fs-4"></i>
            </div>
          </div>

          <div className="px-4 pb-4">
            {coupons.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4 border-dashed border-2">
                <i className="bi bi-ticket-detailed display-3 opacity-10 d-block mb-3"></i>
                <h5 className="fw-bold text-muted">No Coupons Found</h5>
                <p className="small text-muted mb-0">Create your first discount to get started!</p>
              </div>
            ) : (
              <div className="row g-3">
                {coupons.map(c => (
                  <div key={c.id} className="col-12">
                    <div className="card border shadow-none hover-shadow transition-all" style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-3">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <div className="bg-primary text-white fw-extrabold p-3 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 65, fontSize: '0.9rem' }}>
                              {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}
                            </div>
                          </div>
                          <div className="col">
                            <h5 className="fw-extrabold text-primary mb-1 tracking-wider">{c.code}</h5>
                            <div className="d-flex gap-2">
                              {c.applicableTo === 'all' ? (
                                <span className="smallest badge bg-success-subtle text-success border border-success border-opacity-10 rounded-pill px-2">Universal Coupon</span>
                              ) : (
                                <span className="smallest badge bg-info-subtle text-info border border-info border-opacity-10 rounded-pill px-2">{c.productIds?.length || 0} Products Selected</span>
                              )}
                              <span className="smallest text-muted"><i className="bi bi-lightning-charge-fill me-1 text-warning"></i>Active</span>
                            </div>
                          </div>
                          <div className="col-auto">
                            <button className="btn btn-light-danger border-0 rounded-circle p-2" onClick={() => onDelete(c.id)} title="Delete Coupon">
                              <i className="bi bi-trash3 text-danger fs-5"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function OwnerApp() {
  const [tab, setTab] = useState(() => localStorage.getItem('ownerTab') || 'orders');

  // Save tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ownerTab', tab);
  }, [tab]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useStatus('');
  const [settings, setSettings] = useState({ upiQrUrl: '', upiId: '', whatsappNumber: '', logoUrl: '', reportUrl: '', storeName: '' });
  useFavicon(settings.logoUrl);
  useStoreTitle(settings.storeName);
  const [savingSettings, setSavingSettings] = useState(false);
  const [range, setRange] = useState('daily');
  const [report, setReport] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [orderFilterDate, setOrderFilterDate] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAll();

    // Auto-refresh orders every 15 seconds
    const interval = setInterval(() => {
      refreshOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (tab === 'reports') loadReport(range); }, [range, tab]);

  const loadAll = async () => {
    // Quick load from cache for better UX
    const cached = localStorage.getItem('sparkle_owner_settings');
    if (cached) setSettings(JSON.parse(cached));

    setLoading(true);
    try {
      const [p, o, s, c] = await Promise.all([
        ownerFetchProducts(),
        ownerFetchOrders(),
        ownerFetchSettings(),
        ownerFetchCoupons()
      ]);
      setProducts(p);
      setOrders(o);
      if (s) {
        setSettings(s);
        localStorage.setItem('sparkle_owner_settings', JSON.stringify(s));
      }
      setCoupons(c);
    } catch (err) {
      console.error(err);
      setStatus('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setIsRefreshing(true);
    try {
      const o = await ownerFetchOrders();
      setOrders(o);
    } catch (err) {
      console.error("BG Refresh failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadReport = async (r) => {
    const data = await ownerFetchReportSummary(r);
    setReport(data);
  };


  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => {
        if (!orderFilterDate) return true;
        const oDate = new Date(o.createdAt).toDateString();
        const fDate = new Date(orderFilterDate).toDateString();
        return oDate === fDate;
      })

      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, orderFilterDate]);


  const productSales = useMemo(() => {
    const stats = {};
    filteredOrders.forEach(o => {
      o.items.forEach(i => {
        const pName = i.product?.name || `ID:${i.productId}`;
        stats[pName] = (stats[pName] || 0) + (i.lineTotal || 0);
      });
    });
    return stats;
  }, [filteredOrders]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await ownerUpdateProduct(editingId, { ...form, price: Number(form.price) });
        setStatus('Updated');
      } else {
        await ownerCreateProduct({ ...form, price: Number(form.price) });
        setStatus('Added');
      }
      setForm(emptyProduct);
      setEditingId(null);
      setShowProductForm(false);
      setProducts(await ownerFetchProducts());
    } catch {
      setStatus('Error');
    }
  };

  const onEdit = (p) => {
    setEditingId(p.id);
    setForm({ ...p, price: String(p.price) });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onToggleDispatch = async (id, currentStatus) => {
    // Optimistic Update: Update local state immediately
    setOrders(prev => prev.map(o => o.id === id ? { ...o, dispatched: !currentStatus } : o));

    try {
      await ownerToggleDispatch(id, !currentStatus);
      // No need to fetch all orders again, local state is already correct
      setStatus(`Order ${!currentStatus ? 'marked as Dispatched' : 'moved to Pending'}`);
    } catch {
      // Rollback on error
      setOrders(prev => prev.map(o => o.id === id ? { ...o, dispatched: currentStatus } : o));
      setStatus('Error updating dispatch status');
    }
  };

  const onTogglePayment = async (id, currentStatus) => {
    // Optimistic Update: Update local state immediately
    setOrders(prev => prev.map(o => o.id === id ? { ...o, isPaid: !currentStatus } : o));

    try {
      await ownerTogglePayment(id, !currentStatus);
      // No need to fetch all orders again
      setStatus(`Order marked as ${!currentStatus ? 'Paid' : 'Unpaid'}`);
    } catch {
      // Rollback on error
      setOrders(prev => prev.map(o => o.id === id ? { ...o, isPaid: currentStatus } : o));
      setStatus('Error updating payment status');
    }
  };

  const onDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await ownerDeleteOrder(id);
      setOrders(await ownerFetchOrders());
      setStatus('Invoice deleted successfully');
    } catch {
      setStatus('Error deleting Invoice');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await ownerDeleteProduct(id);
    setProducts(await ownerFetchProducts());
  };

  const onSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const next = await ownerUpdateSettings(settings);
      setSettings(next);
      setStatus('Saved');
    } catch {
      setStatus('Error');
    } finally {
      setSavingSettings(false);
    }
  };

  const downloadPdf = async () => {
    const blob = await ownerFetchReportPdf(range);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${range}.pdf`;
    a.click();
  };

  const onWhatsAppCustomer = (order) => {
    const phone = order.phone?.replace(/\D/g, '');
    const subtotal = order.items.reduce((acc, i) => acc + (i.lineTotal || 0), 0);
    const deliveryFee = 0; // subtotal < 500 ? 50 : 0;
    const itemsList = order.items.map(i => `*${i.quantity} x ${i.product?.name || `Product ${i.productId}`}* = ₹${i.lineTotal || 0}`).join('\n');

    const greeting = `Hello ${order.customerName},\n\nThank you for your order from *Sparkle Gift Shop*! 🎁\n\n`;
    const orderDetails = `*Invoice No:* ${order.invoiceId}\n*Customer:* ${order.customerName}\n*Phone:* ${order.phone}\n*Address:* ${order.address || 'N/A'}\n\n`;
    const items = `*Order Items:*\n${itemsList}\n\n`;
    const totals = `*Subtotal:* ₹${subtotal.toFixed(2)}\n*Delivery:* ₹${deliveryFee.toFixed(2)}\n*Total:* ₹${order.total?.toFixed(2)}\n*Payment:* ${order.paymentMethod?.toUpperCase()}\n*Status:* ${order.isPaid ? 'PAID ✅' : 'PENDING ⏳'}\n\n`;
    const footer = `We will deliver your order soon! 🚚\n\n*Sparkle Gift Shop*`;

    const msg = greeting + orderDetails + items + totals + footer;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column bg-light p-0">
      {status && <div className="alert alert-success status-toast shadow">{status}</div>}

      <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom px-3 px-md-5 sticky-top" style={{ zIndex: 1030 }}>
        <div className="container-fluid p-0">
          <div className="d-flex align-items-center gap-2 text-decoration-none" style={{ cursor: 'pointer' }} onClick={() => setTab('orders')}>
            <img src={settings.logoUrl || logo} alt="Logo" className="rounded-circle" style={{ width: 62, height: 62, objectFit: 'cover' }} />
            <div>
              <h1 className="h4 fw-bold mb-0 text-dark">{settings.storeName || 'Sparkle Gift Shop'}</h1>
              <small className="text-primary fw-bold  h5" >Admin Dashboard</small>
            </div>
          </div>
          <div className="ms-auto">
            <Link to="/" className="btn btn-sm btn-outline-primary rounded-pill px-3">
              <i className="bi bi-shop"></i> <span className="d-none d-sm-inline">View Shop</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="bg-white border-bottom shadow-sm sticky-top" style={{ top: '65px', zIndex: 1020 }}>
        <div className="container-fluid px-3 px-md-5">
          <div className="d-flex align-items-center justify-content-start justify-content-md-center gap-2 overflow-auto py-3 mt-3 no-scrollbar">
            {[
              { id: 'orders', icon: 'bi-cart-check', label: 'Orders' },
              { id: 'products', icon: 'bi-box-seam', label: 'Products' },
              { id: 'coupons', icon: 'bi-ticket-perforated', label: 'Coupons' },
              { id: 'reports', icon: 'bi-graph-up', label: 'Reports' },
              { id: 'settings', icon: 'bi-gear', label: 'Settings' }
            ].map(t => (
              <button key={t.id} className={`btn btn-sm d-flex align-items-center gap-2 py-2 px-3 border-0 rounded-pill ${tab === t.id ? 'btn-primary' : 'btn-light text-secondary'}`} onClick={() => setTab(t.id)} style={{ whiteSpace: 'nowrap' }}>
                <i className={`bi ${t.icon}`}></i><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow-1 p-0 bg-light overflow-y-auto overflow-x-hidden">
        <div className="d-flex justify-content-between align-items-center px-3 px-md-5 py-3">
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold mb-0 text-dark text-capitalize">{tab}</h3>
            {tab === 'orders' && (
              <span className="badge bg-white shadow-sm border text-success rounded-pill d-flex align-items-center px-2 py-1" style={{ fontSize: '10px' }}>
                <span className="live-indicator"></span> LIVE
              </span>
            )}
            {isRefreshing && <div className="spinner-border spinner-border-sm text-primary opacity-50 ms-2" role="status"></div>}
          </div>
          {tab === 'products' && !showProductForm && (
            <button className="btn btn-primary rounded-pill px-4" onClick={() => { setForm(emptyProduct); setShowProductForm(true); setEditingId(null); }}>
              Add New
            </button>
          )}
        </div>


        <div className="container-fluid px-3 px-md-5">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading your store data...</p>
            </div>
          ) : tab === 'products' && (
            <>
              {showProductForm && <ProductForm form={form} setForm={setForm} onSubmit={onSubmit} editing={!!editingId} onCancel={() => { setShowProductForm(false); setEditingId(null); }} />}

              <div className="card shadow-sm border-0 mb-4 bg-white">
                <div className="card-body p-3">
                  <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                    <span className="input-group-text bg-white border-0 ps-3">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      className="form-control border-0 shadow-none ps-2 py-2"
                      placeholder="Search your product catalog..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3 mb-5">
                {products.filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase())).map(p => (
                  <div className="col" key={p.id}>
                    <div className="card h-100 border-0 shadow-sm product-admin-card overflow-hidden group" style={{ borderRadius: '1rem', backgroundColor: '#fff' }}>
                      <div className="position-relative overflow-hidden bg-light" style={{ aspectRatio: '3/4' }}>
                        <img
                          src={p.image || 'https://via.placeholder.com/200?text=No+Image'}
                          className="w-100 h-100 object-fit-cover transition-transform duration-500"
                          alt={p.name}
                          style={{ transition: 'transform 0.5s ease' }}
                        />
                        {/* Overlay Actions */}
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex align-items-center justify-content-center gap-2 opacity-0 hover-opacity-100 transition-opacity duration-300">
                          <button className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center hover-scale" style={{ width: 40, height: 40 }} onClick={() => onEdit(p)} title="Edit">
                            <i className="bi bi-pencil-fill text-dark"></i>
                          </button>
                          <button className="btn btn-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center hover-scale" style={{ width: 40, height: 40 }} onClick={() => onDelete(p.id)} title="Delete">
                            <i className="bi bi-trash3-fill text-white"></i>
                          </button>
                        </div>
                        {/* Badges */}
                        <div className="position-absolute top-0 start-0 p-2">
                          <span className="badge bg-white text-dark shadow-sm fw-bold border" style={{ fontSize: '0.65rem', backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.9)' }}>
                            {p.category}
                          </span>
                        </div>
                        {p.variants && p.variants.length > 0 && (
                          <div className="position-absolute bottom-0 end-0 p-2">
                            <span className="badge bg-dark convex-shadow text-white border border-white border-opacity-25" style={{ fontSize: '0.65rem' }}>
                              {p.variants.length} Sizes
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="card-body p-3 d-flex flex-column">
                        <h6 className="fw-extrabold text-dark mb-1 text-truncate tracking-tight" title={p.name}>{p.name}</h6>
                        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top border-light">
                          <div className="d-flex flex-column">
                            <span className="smallest text-muted text-uppercase fw-bold opacity-75">Price</span>
                            <span className="fw-bold text-primary">₹{p.price}</span>
                          </div>
                          <div className="d-flex flex-column text-end">
                            <span className="smallest text-muted text-uppercase fw-bold opacity-75">ID</span>
                            <span className="font-monospace smallest text-dark bg-light px-1 rounded">{p.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-12 text-center py-5">
                    <div className="bg-white rounded-4 shadow-sm p-5 d-inline-block border border-dashed">
                      <i className="bi bi-box-seam display-1 text-light mb-3"></i>
                      <h4 className="fw-bold text-muted">Zero Inventory</h4>
                      <p className="text-muted small">Ready to start selling? Add your first product.</p>
                      <button className="btn btn-primary rounded-pill px-4 mt-2 fw-bold" onClick={() => { setForm(emptyProduct); setShowProductForm(true); }}>Add Product</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'orders' && (
            <>
              <div className="card shadow-sm border-0 mb-4 bg-white">
                <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3 py-3 px-4">
                  <div className="d-flex align-items-center gap-4">
                    <div>
                      <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '11px' }}>Total Invoices</small>
                      <h4 className="fw-bold mb-0 text-dark">{filteredOrders.length}</h4>
                    </div>
                    <div className="border-start ps-4">
                      <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '11px' }}>Collection (with Delivery)</small>
                      <h4 className="fw-bold mb-0 text-primary">₹{filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}</h4>
                    </div>
                  </div>
                  <div className="ms-auto d-flex align-items-center gap-2">
                    <span className="small fw-bold text-muted text-uppercase">Filter by Date:</span>
                    <input type="date" className="form-control form-control-sm w-auto shadow-none border" value={orderFilterDate} onChange={e => setOrderFilterDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <OrdersList
                orders={filteredOrders}
                onWhatsApp={onWhatsAppCustomer}
                onDeleteOrder={onDeleteOrder}
                onToggleDispatch={onToggleDispatch}
                onTogglePayment={onTogglePayment}
                onPreview={setPreviewImg}
              />
            </>
          )}

          {tab === 'coupons' && <CouponsPanel coupons={coupons} setCoupons={setCoupons} products={products} />}
          {tab === 'reports' && <ReportsPanel range={range} setRange={setRange} data={report} onDownload={downloadPdf} productData={productSales} reportUrl={settings.reportUrl} />}
          {tab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} onSave={onSaveSettings} saving={savingSettings} />}
        </div>
      </main>

      {/* Image Preview Modal */}
      {previewImg && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 p-md-4"
          style={{ zIndex: 2000, background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setPreviewImg(null)}
        >
          <div className="position-relative" onClick={e => e.stopPropagation()}>
            <button
              className="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
              onClick={() => setPreviewImg(null)}
              style={{ width: '36px', height: '36px', zIndex: 10 }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <img
              src={previewImg}
              alt="Preview"
              className="rounded shadow-lg"
              style={{
                maxWidth: '95vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerApp;
