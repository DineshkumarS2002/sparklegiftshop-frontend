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

const emptyProduct = { name: '', price: '', category: '', image: '', description: '' };

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

function ProductForm({ form, setForm, onSubmit, editing, onCancel }) {
  // Preview helper
  const previewImage = form.image || 'https://via.placeholder.com/200?text=No+Image';

  return (
    <div className="card border-0 shadow-sm mb-5">
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-1 fw-bold text-dark">{editing ? 'Edit Product Details' : 'Add New Product'}</h5>
          <p className="text-muted small mb-0">Fill in the details to list your product on the store.</p>
        </div>
        {editing && <button className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel Edit</button>}
      </div>
      <div className="card-body p-4">
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
                  <label className="form-label fw-bold text-muted small text-uppercase">Price (₹)</label>
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
                  <h5 className="text-primary fw-bold mb-0">₹{form.price || '0'}</h5>
                </div>
              </div>
            </div>
          </div>

          <div className="border-top pt-3 mt-4 text-end">
            <button type="button" className="btn btn-outline-secondary me-2" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary px-5 fw-bold btn-lg">
              {editing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, setSettings, onSave, saving }) {
  return (
    <div className="card border-0 shadow-sm" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="card-header bg-white pt-3 pb-2">
        <h5 className="mb-0 fw-bold">Business Settings</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted">Store Name</label>
          <input className="form-control" defaultValue="Sparkle Gift Shop" readOnly />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted">WhatsApp Number (Orders)</label>
          <input
            className="form-control"
            value={settings.whatsappNumber || ''}
            onChange={(e) => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
            placeholder="919876543210"
          />
        </div>
        <div className="mb-4">
          <label className="form-label small fw-bold text-muted">UPI QR Code</label>
          <div className="card bg-light border border-secondary border-dashed text-center p-4">
            {settings.upiQrUrl ? (
              <div className="position-relative d-inline-block">
                <div className="bg-white p-2 border rounded shadow-sm mb-3">
                  <img src={settings.upiQrUrl} alt="QR Code" className="img-fluid" style={{ maxHeight: '180px' }} />
                </div>
                <button
                  className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle shadow-sm"
                  style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setSettings(s => ({ ...s, upiQrUrl: '' }))}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
                <div>
                  <label htmlFor="qr-upload" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                    Change Image
                  </label>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <i className="bi bi-qr-code fs-1 d-block mb-3 text-muted"></i>
                <label htmlFor="qr-upload" className="btn btn-sm btn-primary rounded-pill px-4">
                  Upload QR Image
                </label>
              </div>
            )}
            <input
              id="qr-upload"
              type="file"
              className="d-none"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setSettings(s => ({ ...s, upiQrUrl: reader.result }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="form-label small fw-bold text-muted">Update Store Logo</label>
          {settings.logoUrl && (
            <div className="mb-2 text-center">
              <img src={settings.logoUrl} alt="Store Logo" className="rounded-circle border shadow-sm" style={{ width: 80, height: 80, objectFit: 'cover' }} />
            </div>
          )}
          <input
            type="file"
            className="form-control"
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
        </div>
        <button className="btn btn-primary w-100 py-3 fw-bold shadow-sm" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}

function OrdersList({ orders, onWhatsApp, onDeleteOrder, onToggleDispatch }) {
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
                    {o.dispatched ? <><i className="bi bi-check2-circle"></i> DISPATCHED</> : <><i className="bi bi-clock"></i> PENDING</>}
                  </button>
                  <span className={`badge ${o.paymentMethod === 'upi' ? 'bg-primary' : 'bg-success'} fw-bold d-flex align-items-center`}>
                    {o.paymentMethod?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="card-body d-flex flex-column" style={{ minHeight: '380px' }}>
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
                          <div className="fw-bold text-dark small" style={{ lineHeight: '1.2' }}>{i.product?.name || `Product ${i.productId}`}</div>
                          <div className="text-muted smallest">₹{i.product?.price} x {i.quantity}</div>
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
  const chartData = useMemo(() => ({
    labels: data.map((d) => d.label),
    datasets: [{ label: 'Sales (₹)', data: data.map((d) => d.total), backgroundColor: '#d946ef', borderRadius: 4 }],
  }), [data]);

  const productChartData = useMemo(() => {
    const labels = Object.keys(productData);
    const values = Object.values(productData);
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#d946ef', '#8b5cf6', '#f472b6', '#a78bfa', '#e879f9', '#c084fc'],
        borderWidth: 0
      }]
    };
  }, [productData]);

  return (
    <div className="row g-4 ">
      <div className="col-lg-8">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-header bg-white d-flex justify-content-between align-items-center pt-3">
            <h5 className="mb-0 fw-bold">Sales Overview</h5>
            <div className="d-flex gap-2">
              <select className="form-select form-select-sm p-3 fw-bold " value={range} onChange={(e) => setRange(e.target.value)} style={{ width: 100 }}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button className="btn btn-sm btn-outline-primary  p-3 fw-bold " onClick={onDownload}>PDF</button>
              <a href="http://localhost:4000/api/reports/export?format=xlsx" target="_blank" className="btn btn-sm btn-success text-white p-3 fw-bold text-center">
                Excel
              </a>
            </div>
          </div>
          <div className="card-body">
            <div style={{ height: 300 }}>
              <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-header bg-white pt-3">
            <h5 className="mb-0 fw-bold">Product Sales</h5>
          </div>
          <div className="card-body d-flex flex-column justify-content-center align-items-center">
            <div style={{ width: '100%', maxWidth: 250 }}>
              <Doughnut data={productChartData} />
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
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm animate-fade-in">
          <div className="card-header bg-white pt-3 border-bottom-0">
            <h5 className="mb-0 fw-bold">Create New Coupon</h5>
            <p className="text-muted small mb-0">Set up discounts for your customers.</p>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Coupon Code</label>
                <input
                  className="form-control form-control-lg text-uppercase fw-bold text-primary"
                  placeholder="E.G. SAVE50"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Discount (₹)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Value</label>
                  <input type="number" className="form-control" placeholder="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
                </div>
              </div>

              <div className="mb-4">
                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Applicable To</label>
                <div className="btn-group w-100 mb-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${form.applicableTo === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setForm(f => ({ ...f, applicableTo: 'all', productIds: [] }))}
                  >All Products</button>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.applicableTo === 'specific' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setForm(f => ({ ...f, applicableTo: 'specific' }))}
                  >Specific Items</button>
                </div>

                {form.applicableTo === 'specific' && (
                  <div className="border rounded p-2 bg-light shadow-inner" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {products.map(p => (
                      <div key={p.id} className="form-check small py-1 border-bottom last-border-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`p-${p.id}`}
                          checked={form.productIds.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                        />
                        <label className="form-check-label d-flex justify-content-between w-100 pe-2" htmlFor={`p-${p.id}`}>
                          <span>{p.name}</span>
                          <span className="text-muted">₹{p.price}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary w-100 py-3 fw-bold shadow-sm rounded-pill" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Activate Coupon'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white pt-3 border-bottom-0">
            <h5 className="mb-0 fw-bold">Coupon Catalog</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light  text-uppercase text-muted">
                <tr>
                  <th className="px-2 px-lg-5">Code</th>
                  <th className="px-2 px-lg-5">Discount</th>
                  <th className="px-2 px-lg-5">Applies To</th>
                  <th className="text-end px-2 px-lg-5">Manage</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td className="px-2 px-lg-5">
                      <span className="fw-bold text-primary border border-primary border-opacity-25 px-2 py-1 rounded bg-primary bg-opacity-10">{c.code}</span>
                    </td>
                    <td className="px-2 px-lg-5">
                      <div className="fw-bold">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</div>
                      <small className="text-muted">{c.type === 'percent' ? 'Percentage' : 'Fixed Amount'}</small>
                    </td>
                    <td className="px-2 px-lg-5">
                      {c.applicableTo === 'all' ? (
                        <span className="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-pill px-3">Universal</span>
                      ) : (
                        <span className="badge bg-info-subtle text-info border border-info border-opacity-25 rounded-pill px-3">{c.productIds?.length || 0} products</span>
                      )}
                    </td>
                    <td className="text-end px-2 px-lg-5">
                      <button className="btn btn-sm btn-light border text-danger rounded-circle p-2 shadow-sm" onClick={() => onDelete(c.id)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-5">
                      <i className="bi bi-ticket-perforated display-1 opacity-25 d-block mb-3 px-5"></i>
                      No active campaigns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerApp() {
  const [tab, setTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useStatus('');
  const [settings, setSettings] = useState({ upiQrUrl: '', whatsappNumber: '', logoUrl: '', reportUrl: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [range, setRange] = useState('daily');
  const [report, setReport] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [orderFilterDate, setOrderFilterDate] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (tab === 'reports') loadReport(range); }, [range, tab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, o, s, c] = await Promise.all([ownerFetchProducts(), ownerFetchOrders(), ownerFetchSettings(), ownerFetchCoupons()]);
      setProducts(p);
      setOrders(o);
      setSettings(s);
      setCoupons(c);
    } catch (err) {
      console.error(err);
      setStatus('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
    try {
      await ownerToggleDispatch(id, !currentStatus);
      setOrders(await ownerFetchOrders());
    } catch {
      setStatus('Error updating dispatch status');
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
    const deliveryFee = subtotal < 500 ? 50 : 0;
    const itemsList = order.items.map(i => `*${i.quantity} x ${i.product?.name || `Product ${i.productId}`}* = ₹${i.lineTotal || 0}`).join('\n');

    const greeting = `Hello ${order.customerName},\n\nThank you for your order from *Sparkle Gift Shop*! 🎁\n\n`;
    const orderDetails = `*Invoice No:* ${order.invoiceId}\n*Customer:* ${order.customerName}\n*Phone:* ${order.phone}\n*Address:* ${order.address || 'N/A'}\n\n`;
    const items = `*Order Items:*\n${itemsList}\n\n`;
    const totals = `*Subtotal:* ₹${subtotal.toFixed(2)}\n*Delivery Fee:* ₹${deliveryFee.toFixed(2)}\n*Grand Total:* ₹${order.total?.toFixed(2)}\n*Payment Method:* ${order.paymentMethod?.toUpperCase()}\n\n`;
    const footer = `We will deliver your order soon! 🚚\n\nFor any queries, feel free to contact us.\n\n*Sparkle Gift Shop*`;

    const msg = greeting + orderDetails + items + totals + footer;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column bg-light p-0">
      {status && <div className="alert alert-success status-toast shadow">{status}</div>}

      <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom px-3 px-md-5 sticky-top" style={{ zIndex: 1030 }}>
        <div className="container-fluid p-0">
          <div className="d-flex align-items-center gap-2">
            <img src={logo} alt="Logo" className="rounded-circle" style={{ width: 62, height: 62, objectFit: 'cover' }} />
            <div>
              <h1 className="h4 fw-bold mb-0 text-dark">Sparkle Gift Shop</h1>
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
          <h3 className="fw-bold mb-0 text-dark text-capitalize">{tab}</h3>
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

              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-2 mb-5">
                {products.filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase())).map(p => (
                  <div className="col" key={p.id}>
                    <div className="card h-100 border-0 shadow-sm transition-all hover-lift">
                      <div className="position-relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                        <img
                          src={p.image || 'https://via.placeholder.com/200?text=No+Image'}
                          className="w-100 h-100 object-fit-cover"
                          alt={p.name}
                        />
                        <div className="position-absolute top-0 end-0 p-1 d-flex gap-1">
                          <button className="btn btn-xs btn-white shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, padding: 0 }} onClick={() => onEdit(p)}>
                            <i className="bi bi-pencil text-primary" style={{ fontSize: '10px' }}></i>
                          </button>
                          <button className="btn btn-xs btn-white shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, padding: 0 }} onClick={() => onDelete(p.id)}>
                            <i className="bi bi-trash3 text-danger" style={{ fontSize: '10px' }}></i>
                          </button>
                        </div>
                      </div>
                      <div className="card-body p-2">
                        <span className="badge bg-light text-primary border rounded-pill mb-1" style={{ fontSize: '8px' }}>{p.category}</span>
                        <h6 className="fw-bold text-dark mb-1 text-truncate small" title={p.name}>{p.name}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary small">₹{p.price}</span>
                          <small className="text-muted" style={{ fontSize: '8px' }}>..{p.id.slice(-4)}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-12 text-center py-5 text-muted bg-white rounded shadow-sm">
                    <i className="bi bi-box-seam display-4 d-block mb-3 opacity-25"></i>
                    No products found in your catalog.
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
              />
            </>
          )}

          {tab === 'coupons' && <CouponsPanel coupons={coupons} setCoupons={setCoupons} products={products} />}
          {tab === 'reports' && <ReportsPanel range={range} setRange={setRange} data={report} onDownload={downloadPdf} productData={productSales} reportUrl={settings.reportUrl} />}
          {tab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} onSave={onSaveSettings} saving={savingSettings} />}
        </div>
      </main>
    </div>
  );
}

export default OwnerApp;
