// Owner Admin Dashboard
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ownerToggleDelivered,
  ownerUpdateOrderTracking,
  API_BASE_URL,
  adminFetchAdmins,
  adminFetchCustomers,
  adminGenerateCustomerResetToken,
  adminCreateAdmin,
  adminDeleteAdmin
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

const emptyProduct = { name: '', price: '', originalPrice: '', category: '', image: '', description: '', isFlashSale: false, isCombo: false, variants: [], comboItems: [] };

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

function ProductForm({ form, setForm, onSubmit, editing, onCancel, products }) {
  // Preview helper
  const previewImage = form.image || 'https://placehold.co/200?text=No+Image';

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
                  <label className="form-label">Product Name</label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="e.g. Personalized Magic Mug"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Offer Price (₹)</label>
                  <div className="input-group premium-input-group">
                    <span className="btn text-muted">₹</span>
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
                  <label className="form-label">Actual Price (₹)</label>
                  <div className="input-group premium-input-group">
                    <span className="btn text-muted">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={form.originalPrice}
                      onChange={(e) => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    />
                  </div>
                  <small className="text-muted smallest ms-3">Leave empty if no discount.</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Category</label>
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
                    <option value="Combos">Combos</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check form-switch p-3 bg-light rounded-pill border w-100 d-flex align-items-center justify-content-between px-4">
                    <label className="form-check-label fw-bold text-primary mb-0" htmlFor="isCombo">
                      <i className="bi bi-gift-fill me-2"></i> Combo Pack?
                    </label>
                    <input
                      className="form-check-input ms-0"
                      type="checkbox"
                      id="isCombo"
                      checked={form.isCombo}
                      onChange={(e) => setForm(f => ({ ...f, isCombo: e.target.checked }))}
                      style={{ width: '45px', height: '22px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    style={{ borderRadius: '1.25rem' }}
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
                          <div className="d-flex flex-column" style={{ minWidth: '60px' }}>
                            {variant.size && <span className="badge bg-primary mb-1" style={{ fontSize: '10px' }}>{variant.size}</span>}
                            {variant.color && (
                              <div className="d-flex align-items-center gap-1">
                                <span className="rounded-circle border" style={{ width: 14, height: 14, backgroundColor: variant.color }}></span>
                                <span className="smallest text-muted" style={{ fontSize: '9px' }}>{variant.color}</span>
                              </div>
                            )}
                          </div>
                          <span className="small fw-bold ms-2">₹{variant.price}</span>
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
                          placeholder="Color (e.g., #ff0000)"
                          id="variantColor"
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
                            const color = document.getElementById('variantColor').value;
                            const price = document.getElementById('variantPrice').value;
                            const originalPrice = document.getElementById('variantOriginalPrice').value;
                            const image = document.getElementById('variantImage').value;

                            if (!price) {
                              alert('Please enter a price for the variant');
                              return;
                            }
                            if (!size && !color) {
                              alert('Please entering at least a Size or a Color');
                              return;
                            }

                            const newVariant = {
                              size: size || '',
                              color: color || '',
                              price: parseFloat(price),
                              originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                              image: image || ''
                            };
                            setForm(f => ({ ...f, variants: [...(f.variants || []), newVariant] }));

                            // Reset inputs
                            document.getElementById('variantSize').value = '';
                            document.getElementById('variantColor').value = '';
                            document.getElementById('variantPrice').value = '';
                            document.getElementById('variantOriginalPrice').value = '';
                            document.getElementById('variantImage').value = '';
                          }}
                        >
                          <i className="bi bi-plus-lg"></i> Add Variant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Combo Items Section */}
                {form.isCombo && (
                  <div className="col-12 mt-4">
                    <div className="card border-primary border-opacity-25 bg-primary bg-opacity-10 p-4 rounded-4">
                      <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-box-fill"></i> Combo Package Items (Products Included)
                      </h6>

                      {form.comboItems && form.comboItems.length > 0 && (
                        <div className="row g-2 mb-3">
                          {form.comboItems.map((item, idx) => (
                            <div key={idx} className="col-md-6">
                              <div className="bg-white p-2 rounded-3 border d-flex align-items-center gap-2">
                                {item.image && <img src={item.image} className="rounded" style={{ width: 40, height: 40, objectFit: 'cover' }} />}
                                <div className="flex-grow-1">
                                  <div className="fw-bold smallest text-truncate">{item.name}</div>
                                  <div className="smallest text-muted d-flex align-items-center gap-1">
                                    Qty: {item.quantity} | ₹{item.price || 0}
                                    {item.variantColor && (
                                      <span
                                        className="d-inline-block rounded-circle border ml-1"
                                        title={item.variantColor}
                                        style={{ width: '12px', height: '12px', backgroundColor: item.variantColor }}
                                      ></span>
                                    )}
                                    {item.variantSize && <span className="badge bg-light text-dark border ms-1">{item.variantSize}</span>}
                                  </div>
                                </div>
                                <button type="button" className="btn btn-sm text-danger" onClick={() => setForm(f => ({ ...f, comboItems: f.comboItems.filter((_, i) => i !== idx) }))}>
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mb-4 bg-white p-3 rounded-4 border position-relative shadow-sm">
                        <label className="smallest text-muted text-uppercase fw-bold mb-2 d-block">Search & Add Existing Product</label>
                        <div className="input-group input-group-sm mb-2">
                          <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light"
                            placeholder="Type product name to search..."
                            autoComplete="off"
                            onInput={(e) => {
                              const q = e.target.value.toLowerCase();
                              const list = document.getElementById('searchResultList');
                              list.innerHTML = '';
                              if (q.length > 1) {
                                const results = products.filter(p => !p.isCombo && p.name.toLowerCase().includes(q));
                                if (results.length > 0) {
                                  list.style.display = 'block';
                                  results.slice(0, 5).forEach(p => {
                                    const li = document.createElement('div');
                                    li.className = 'p-2 border-bottom d-flex flex-column gap-2 small hover-bg-light';

                                    // Main Product Row
                                    const mainRow = document.createElement('div');
                                    mainRow.className = 'd-flex align-items-center gap-2 cursor-pointer';
                                    mainRow.style.cursor = 'pointer';
                                    mainRow.innerHTML = `<img src="${p.image || 'https://placehold.co/30'}" style="width:30px;height:30px;object-fit:cover" class="rounded border"/> 
                                        <div class="flex-grow-1">
                                          <div class="fw-bold text-dark">${p.name}</div>
                                          <div class="smallest text-muted">₹${p.price}</div>
                                        </div>`;

                                    // Variant Selection Container
                                    const variantContainer = document.createElement('div');
                                    variantContainer.className = 'd-flex flex-wrap gap-1 ps-4';
                                    variantContainer.style.display = 'none';

                                    if (p.variants && p.variants.length > 0) {
                                      mainRow.onclick = (e) => {
                                        e.stopPropagation();
                                        // Toggle variants
                                        variantContainer.style.display = variantContainer.style.display === 'none' ? 'flex' : 'none';
                                      };

                                      p.variants.forEach(v => {
                                        const btn = document.createElement('button');
                                        btn.className = 'btn btn-sm btn-outline-secondary py-1 px-2 smallest d-flex align-items-center gap-1';
                                        btn.style.fontSize = '10px';

                                        // Color indicator
                                        let colorHtml = '';
                                        if (v.color) {
                                          colorHtml = `<span style="width:10px;height:10px;border-radius:50%;background-color:${v.color};border:1px solid #ddd;display:inline-block;"></span>`;
                                        }

                                        btn.innerHTML = `${v.size || ''} ${colorHtml} - ₹${v.price}`;
                                        btn.onclick = (e) => {
                                          e.stopPropagation();
                                          const newItem = {
                                            name: `${p.name}`, // Clean name, we show variant details separately
                                            quantity: 1,
                                            price: v.price,
                                            image: v.image || p.image,
                                            variantSize: v.size,
                                            variantColor: v.color
                                          };
                                          setForm(f => ({ ...f, comboItems: [...(f.comboItems || []), newItem] }));
                                          list.style.display = 'none';
                                          document.querySelector('input[placeholder="Type product name to search..."]').value = '';
                                        };
                                        variantContainer.appendChild(btn);
                                      });
                                    } else {
                                      mainRow.onclick = () => {
                                        const newItem = { name: p.name, quantity: 1, price: p.price, image: p.image };
                                        setForm(f => ({ ...f, comboItems: [...(f.comboItems || []), newItem] }));
                                        list.style.display = 'none';
                                        document.querySelector('input[placeholder="Type product name to search..."]').value = '';
                                      };
                                    }

                                    li.appendChild(mainRow);
                                    if (p.variants && p.variants.length > 0) {
                                      const hint = document.createElement('div');
                                      hint.className = 'smallest text-primary ps-5 pb-1';
                                      hint.innerText = 'Click to see variants';
                                      li.appendChild(hint);
                                      li.appendChild(variantContainer);
                                    } else {
                                      // Auto add hint
                                    }

                                    list.appendChild(li);
                                  });
                                } else { list.style.display = 'none'; }
                              } else { list.style.display = 'none'; }
                            }}
                          />
                        </div>
                        <div id="searchResultList" className="position-absolute w-100 bg-white shadow-lg border rounded-3 overflow-hidden" style={{ zIndex: 10, display: 'none', top: '100%' }}></div>
                      </div>

                      <div className="row g-2 bg-white p-3 rounded-4 shadow-sm border mb-3">
                        <div className="col-12"><small className="text-muted fw-bold smallest text-uppercase">Manual Entry (Or select from search above)</small></div>
                        <div className="col-md-5">
                          <input type="text" id="comboItemName" className="form-control form-control-sm" placeholder="Product Name" />
                        </div>
                        <div className="col-md-2">
                          <input type="number" id="comboItemQty" className="form-control form-control-sm" placeholder="Qty" defaultValue="1" />
                        </div>
                        <div className="col-md-5">
                          <input type="number" id="comboItemPrice" className="form-control form-control-sm" placeholder="Price (₹)" />
                        </div>
                        <div className="col-md-12">
                          <input type="text" id="comboItemImg" className="form-control form-control-sm" placeholder="Image URL (Optional)" />
                        </div>
                        <div className="col-12 mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary w-100 rounded-pill"
                            onClick={() => {
                              const name = document.getElementById('comboItemName').value;
                              const qty = document.getElementById('comboItemQty').value;
                              const price = document.getElementById('comboItemPrice').value;
                              const img = document.getElementById('comboItemImg').value;
                              if (!name) return alert('Enter product name');
                              const newItem = { name, quantity: Number(qty) || 1, price: Number(price) || 0, image: img || '' };
                              setForm(f => ({ ...f, comboItems: [...(f.comboItems || []), newItem] }));
                              document.getElementById('comboItemName').value = '';
                              document.getElementById('comboItemQty').value = '1';
                              document.getElementById('comboItemPrice').value = '';
                              document.getElementById('comboItemImg').value = '';
                            }}
                          >
                            <i className="bi bi-plus-lg me-1"></i> Add Manual Item
                          </button>
                        </div>
                      </div>

                      {form.comboItems?.length > 0 && (
                        <div className="mt-2 p-3 bg-white rounded-4 border dashed shadow-sm">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small text-muted fw-bold">Combined Items Total:</span>
                            <span className="h5 mb-0 fw-extrabold text-dark">₹{form.comboItems.reduce((acc, ci) => acc + (ci.price * ci.quantity), 0)}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary w-100 rounded-pill fw-bold"
                            onClick={() => {
                              const total = form.comboItems.reduce((acc, ci) => acc + (ci.price * ci.quantity), 0);
                              setForm(f => ({ ...f, originalPrice: total }));
                            }}
                          >
                            <i className="bi bi-magic me-1"></i> Use Sum as Original Price
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                    onError={(e) => e.target.src = 'https://placehold.co/200?text=No+Image'}
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

          <div className="pt-4 mt-4 d-flex flex-column flex-sm-row justify-content-end gap-2 px-1">
            <button type="button" className="btn btn-light border px-4 h-pill" style={{ minHeight: '52px' }} onClick={onCancel}>Discard</button>
            <button type="submit" className="btn btn-primary px-5 d-flex align-items-center justify-content-center gap-3 h-pill shadow-lg border-0" style={{ minHeight: '52px', fontSize: '16px' }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: '18px' }}></i>
              <span>{editing ? 'Save Changes' : 'Publish Product'}</span>
            </button>
          </div>
        </form >
      </div >
    </div >
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
                        src={settings.logoUrl || 'https://placehold.co/100?text=Logo'}
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
                    <label className="form-label">Store Name</label>
                    <input
                      className="form-control form-control-lg fw-bold text-dark"
                      value={settings.storeName || 'Sparkle Gift Shop'}
                      onChange={(e) => setSettings(s => ({ ...s, storeName: e.target.value }))}
                    />
                    <p className="text-muted smallest mt-1 mb-0 ms-3">This name will appear across your app and invoices.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm overflow-hidden mb-4" style={{ borderRadius: '1rem' }}>
          <div className="card-header bg-white py-3 px-4 border-bottom">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-stars text-warning"></i> Home Page Combo Banner
            </h6>
          </div>
          <div className="card-body p-4 text-start">
            <div className="row g-4">
              <div className="col-12">
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="bannerActive"
                    checked={settings.comboBannerActive}
                    onChange={(e) => setSettings(s => ({ ...s, comboBannerActive: e.target.checked }))}
                  />
                  <label className="form-check-label fw-bold" htmlFor="bannerActive">Show Offer Banner on Home Page</label>
                </div>
              </div>
              <div className="col-md-12">
                <label className="form-label">Banner Main Title</label>
                <input
                  className="form-control"
                  value={settings.comboBannerTitle || ''}
                  onChange={(e) => setSettings(s => ({ ...s, comboBannerTitle: e.target.value }))}
                  placeholder="e.g. Exclusive Combo Stores"
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Banner Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={settings.comboBannerSub || ''}
                  onChange={(e) => setSettings(s => ({ ...s, comboBannerSub: e.target.value }))}
                  placeholder="Small text below title..."
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Discount Text Badge</label>
                <input
                  className="form-control"
                  value={settings.comboBannerDiscount || ''}
                  onChange={(e) => setSettings(s => ({ ...s, comboBannerDiscount: e.target.value }))}
                  placeholder="e.g. Up to 30% OFF"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top">
              <label className="smallest text-muted text-uppercase fw-bold mb-2 d-block">Live Preview</label>
              <div className="rounded-4 overflow-hidden position-relative shadow-sm" style={{ height: '140px' }}>
                <div className="position-absolute w-100 h-100" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)' }}></div>
                <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-3">
                  <h5 className="fw-extrabold text-white mb-1 small">{settings.comboBannerTitle}</h5>
                  <p className="text-white opacity-75 smallest mb-2">{settings.comboBannerSub}</p>
                  <span className="badge bg-warning text-dark smallest rounded-pill fw-bold">{settings.comboBannerDiscount}</span>
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
            <div className="row g-4 text-start">
              <div className="col-md-6">
                <label className="form-label">WhatsApp Number</label>
                <div className="input-group input-group-lg premium-input-group">
                  <span className="btn text-success"><i className="bi bi-whatsapp"></i></span>
                  <input
                    className="form-control"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
                    placeholder="919876543210"
                  />
                </div>
                <small className="text-muted smallest mt-1 d-block ms-3">This number will receive order alerts.</small>
              </div>

              <div className="col-md-6">
                <label className="form-label">UPI ID</label>
                <div className="input-group input-group-lg premium-input-group">
                  <span className="btn text-primary"><i className="bi bi-qr-code"></i></span>
                  <input
                    className="form-control"
                    value={settings.upiId || ''}
                    onChange={(e) => setSettings(s => ({ ...s, upiId: e.target.value }))}
                    placeholder="username@upi"
                  />
                </div>
                <small className="text-muted smallest mt-1 d-block ms-3">Used for generating payment QR codes.</small>
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
            className="btn btn-primary px-5 py-3 shadow-lg d-flex align-items-center gap-2 h-pill"
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

function OrdersList({ orders, products = [], onWhatsApp, onDeleteOrder, onToggleDispatch, onTogglePayment, onToggleDelivered, onPreview }) {
  const navigate = useNavigate();
  if (!orders || orders.length === 0) return <div className="text-center p-5 text-muted">No orders found.</div>;
  return (
    <div className="row g-3">
      {orders.map((o) => {
        const subtotal = o.subtotal || 0;
        const discount = o.discount || 0;
        const deliveryFee = o.deliveryFee || 0;

        return (
          <div key={o.id} className="col-12 col-lg-6 col-xl-4 ">
            <div className="card h-100 border-0 shadow-sm transition-all hover-shadow p-3" style={{ borderRadius: '12px' }}>
              {/* Header Section */}
              <div className="card-header bg-gradient bg-opacity-10 border-0 pt-3 pb-2">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark text-white px-3 py-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                      <i className="bi bi-receipt me-1"></i> {o.invoiceId}
                    </span>
                    <span className="badge bg-light text-muted border" style={{ fontSize: '10px' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <button className="btn btn-sm btn-link text-danger p-0 shadow-none border-0" onClick={() => onDeleteOrder(o.id)} title="Delete Invoice">
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>

                {/* Status Badges Row */}
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm py-2 px-3 rounded-pill fw-bold border-0 ${o.dispatched ? 'bg-success text-white' : 'bg-warning text-dark'}`}
                    onClick={() => onToggleDispatch(o.id, o.dispatched)}
                    style={{ fontSize: '11px' }}
                    title="Toggle Dispatch Status"
                  >
                    <i className={`bi ${o.dispatched ? 'bi-truck' : 'bi-clock-history'} me-1`}></i>
                    {o.dispatched ? 'DISPATCHED' : 'PENDING'}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm py-2 px-3 rounded-pill fw-bold border-0 ${o.isPaid ? 'bg-success text-white' : 'bg-success bg-opacity-75 text-white'}`}
                    onClick={() => onTogglePayment(o.id, o.isPaid)}
                    style={{ fontSize: '11px' }}
                    title="Toggle Payment Status"
                  >
                    <i className={`bi ${o.isPaid ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                    {o.isPaid ? 'PAID' : 'UNPAID'}
                  </button>
                  <span
                    className="badge bg-light text-dark border px-3 py-2"
                    style={{ fontSize: '11px' }}
                  >
                    <i className={`bi ${o.paymentMethod === 'cod' ? 'bi-cash' : 'bi-qr-code-scan'} me-1`}></i>
                    {o.paymentMethod === 'cod' ? 'COD' : 'UPI'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm py-2 px-3 rounded-pill fw-bold border-0 bg-info text-white"
                    onClick={() => navigate(`/admin/tracking/${o.id}`)}
                    style={{ fontSize: '11px' }}
                    title="Update Tracking Details"
                  >
                    <i className="bi bi-geo-alt-fill me-1"></i> TRACK
                  </button>
                </div>

              </div>
              {/* Card Body */}
              <div className="card-body d-flex flex-column p-3">
                {/* Payment Screenshot Section */}
                {o.paymentScreenshot ? (
                  <div className="mb-3 p-2 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-dark" style={{ fontSize: '11px' }}>
                        <i className="bi bi-image-fill me-1 text-primary"></i> Payment Proof
                      </span>
                      <span className="badge bg-success text-white rounded-pill" style={{ fontSize: '9px' }}>
                        <i className="bi bi-check-circle-fill me-1"></i>Verified
                      </span>
                    </div>
                    <div
                      className="position-relative overflow-hidden rounded border border-2 border-success shadow-sm"
                      style={{ cursor: 'pointer', height: '100px', width: '100px' }}
                      onClick={() => onPreview(o.paymentScreenshot)}
                    >
                      <img
                        src={o.paymentScreenshot}
                        alt="Payment Proof"
                        className="w-100 h-100 object-fit-cover"
                      />
                      <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white text-center py-1" style={{ fontSize: '10px' }}>
                        <i className="bi bi-zoom-in me-1"></i> Click to Zoom
                      </div>
                    </div>
                  </div>
                ) : (
                  o.paymentMethod === 'upi' && (
                    <div className="alert alert-warning py-2 mb-3 small border-0 d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <span>Awaiting payment screenshot</span>
                    </div>
                  )
                )}

                {/* Customer Info Section - Chat Style */}
                <div className="mb-3 p-3 bg-light rounded-4 border-0">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="bg-white p-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                      <i className="bi bi-person-fill text-primary"></i>
                    </div>
                    <h6 className="fw-bold mb-0 text-dark small">{o.customerName}</h6>
                  </div>
                  <a href={`tel:${o.phone}`} className="text-primary fw-bold text-decoration-none d-flex align-items-center small ms-1 mb-2">
                    <i className="bi bi-telephone-fill me-2 bg-white rounded-circle p-1 shadow-sm fs-6"></i> {o.phone}
                  </a>
                  <div className="text-muted small ps-1 lh-sm bg-white p-2 rounded-3 border border-light shadow-sm">
                    <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                    {o.address || 'No address provided'}
                  </div>
                </div>

                {/* Card Body Continued... */}

                {/* ... (skipping some unchanged parts if manageable, but replace block is safer) ... */}
                {/* Actually, I need to target specific chunks or a larger block. I'll target the Customer Info first. */}
              </div>

              {/* Customer Note */}
              {o.note && (
                <div className="alert alert-info py-2 px-3 mb-3 border-0 border-start border-4 border-info" style={{ fontSize: '12px' }}>
                  <i className="bi bi-sticky-fill me-2"></i>
                  <strong>Note:</strong> {o.note}
                </div>
              )}

              {/* Order Items Section */}
              <div className="mb-3 flex-grow-1">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <p className="fw-bold text-dark mb-0" style={{ fontSize: '12px' }}>
                    <i className="bi bi-bag-check-fill me-1 text-primary"></i> Order Items
                  </p>
                  <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '10px' }}>
                    {o.items.length} {o.items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <div className="order-items-scroll" style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden' }}>
                  {o.items.map((i, idx) => {
                    // Resolve display image
                    let displayImg = i.product?.image;
                    if (i.product?.variants?.length > 0) {
                      const v = i.product.variants.find(v =>
                        (v.size == i.variantSize || (!v.size && !i.variantSize)) &&
                        (v.color == i.variantColor || (!v.color && !i.variantColor))
                      );
                      if (v && v.image) displayImg = v.image;
                    }

                    // Resolve combo product details from the full products list
                    const comboProduct = products.find(p => p.id === i.productId) || i.product;

                    return (
                      <div className="card border shadow-sm mb-2 p-2 rounded-3" key={idx}>
                        <div className="d-flex gap-3 align-items-center">
                          {/* Image */}
                          <div className="flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                            <img src={displayImg || 'https://placehold.co/50'} alt="" className="w-100 h-100 object-fit-cover rounded-3" />
                          </div>

                          {/* Content */}
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="mb-1 text-truncate fw-bold text-dark" style={{ fontSize: '13px' }}>
                              {i.product?.name || `Product ${i.productId}`}
                            </h6>

                            {/* Variants */}
                            <div className="d-flex align-items-center gap-2 mb-1">
                              {i.variantSize && (
                                <span className="badge bg-secondary bg-opacity-10 text-dark border px-2 py-0" style={{ fontSize: '9px', borderRadius: '4px' }}>
                                  {i.variantSize}
                                </span>
                              )}
                              {i.variantColor && (
                                <span
                                  className="border rounded-circle d-inline-block"
                                  style={{ width: '14px', height: '14px', backgroundColor: i.variantColor, flexShrink: 0 }}
                                ></span>
                              )}
                            </div>

                            <div className="text-muted fw-medium" style={{ fontSize: '11px' }}>
                              ₹{i.variantPrice || i.product?.price} × {i.quantity}
                            </div>

                            {/* Combo Items Display */}
                            {comboProduct?.isCombo && comboProduct?.comboItems?.length > 0 && (
                              <div className="mt-2 pt-2 border-top border-dashed">
                                <div className="smallest text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Includes:</div>
                                {comboProduct.comboItems.map((ci, cidx) => (
                                  <div key={cidx} className="d-flex align-items-start mb-1" style={{ fontSize: '11px' }}>
                                    <span className="text-secondary me-2">•</span>
                                    <span className="text-dark opacity-75 flex-grow-1 lh-sm">{ci.name}</span>
                                    <span className="badge bg-light text-secondary border ms-2" style={{ fontSize: '9px', fontWeight: '600' }}>x{ci.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Total */}
                          <div className="fw-bold text-primary text-end" style={{ fontSize: '13px' }}>
                            ₹{i.lineTotal?.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-top pt-3 mt-auto">
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '12px' }}>
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-semibold text-dark">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '12px' }}>
                    <span className="text-success"><i className="bi bi-tag-fill me-1"></i>Discount</span>
                    <span className="fw-semibold text-success">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-3" style={{ fontSize: '12px' }}>
                  <span className="text-muted">Delivery Fee</span>
                  <span className="fw-semibold text-dark">{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : <span className="badge bg-success text-white" style={{ fontSize: '10px' }}>FREE</span>}</span>
                </div>

                {/* Total & Actions */}
                <div className="bg-primary bg-opacity-10 p-3 rounded border border-primary border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-dark fw-semibold" style={{ fontSize: '13px' }}>Total Amount</span>
                    <span className="h4 fw-bold mb-0 text-primary">₹{o.total?.toFixed(2)}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/client/order/${o.invoiceId}/label`}
                      target="_blank"
                      className="btn btn-primary btn-sm rounded-pill shadow-sm flex-grow-1 fw-bold"
                      style={{ fontSize: '11px' }}
                    >
                      <i className="bi bi-printer-fill me-1"></i> PRINT LABEL
                    </Link>
                    <button
                      className="btn btn-success btn-sm rounded-pill shadow-sm fw-bold"
                      onClick={() => onWhatsApp(o)}
                      style={{ fontSize: '11px', minWidth: '80px' }}
                    >
                      <i className="bi bi-whatsapp me-1"></i> WhatsApp
                    </button>
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
                <a href={`${API_BASE_URL}/admin/reports/export?format=xlsx`} target="_blank" className="btn btn-outline-light fw-bold flex-grow-1">
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
              <div className="mb-4 text-start">
                <label className="form-label">Coupon Code</label>
                <div className="input-group input-group-lg premium-input-group">
                  <span className="btn text-primary"><i className="bi bi-tag-fill"></i></span>
                  <input
                    className="form-control text-uppercase fw-extrabold text-primary"
                    placeholder="E.G. FESTIVE50"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    style={{ letterSpacing: '2px' }}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-4 text-start">
                <div className="col-6">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Fixed (₹)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Value</label>
                  <div className="input-group premium-input-group">
                    <span className="btn text-muted px-2">{form.type === 'percent' ? '%' : '₹'}</span>
                    <input type="number" className="form-control ps-0" placeholder="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
                  </div>
                </div>
              </div>

              <div className="mb-1 text-start">
                <label className="form-label">Target Audience</label>
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
function TeamsPanel({ admins, setAdmins }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminLevel: 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminCreateAdmin(form);
      setForm({ name: '', email: '', password: '', adminLevel: 'admin' });
      const updated = await adminFetchAdmins();
      setAdmins(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      await adminDeleteAdmin(id);
      setAdmins(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="row g-4 mb-5">
      <div className="col-lg-4">
        <div className="card shadow-sm border-0 sticky-top" style={{ top: '160px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">Add New Team Member</h5>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Password</label>
                <div className="premium-input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Access Level</label>
                <select
                  className="form-select text-capitalize"
                  value={form.adminLevel}
                  onChange={e => setForm({ ...form, adminLevel: e.target.value })}
                >
                  <option value="admin">Standard Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <button className="btn btn-primary w-100 py-3 fw-bold h-pill shadow-lg mt-2" disabled={loading}>
                {loading ? 'Adding...' : 'Add Team Member'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Team Member</th>
                    <th className="py-3 text-center">Level</th>
                    <th className="py-3">Joined</th>
                    <th className="px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins && admins.map(admin => (
                    <tr key={admin._id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: 40, height: 40 }}>
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold">{admin.name}</div>
                            <div className="smallest text-muted">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`badge rounded-pill ${admin.adminLevel === 'super_admin' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                          {admin.adminLevel === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="py-3 text-muted small">{new Date(admin.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-sm btn-outline-danger border-0 rounded-circle" onClick={() => onDelete(admin._id)} title="Delete Admin">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomersPanel({ customers, setCustomers, setStatus }) {
  const onReset = async (user) => {
    if (!window.confirm(`Generate a secure password reset link for ${user.name}? This will be sent via WhatsApp.`)) return;

    try {
      const { token } = await adminGenerateCustomerResetToken(user._id);
      const resetLink = `${window.location.origin}/reset-password?token=${token}`;

      const msg = `Hello ${user.name},

        We received a request to reset your Sparkle Gift Shop account password.

        Please use the link below to set a new password:
        ${resetLink}

        This link is valid for 24 hours only.

        If you did not request this, please ignore this message.

        Thank you,
        Sparkle Gift Shop Team`;

      // Find the user's phone number from their orders if possible, or we might need it in user model
      // For now, if we don't have user phone in model, let's try to get it if they have orders
      // or just open WhatsApp and let admin pick the contact.
      // But ideally we want wa.me link. Let's assume user might not have phone in User model yet.
      // Let's check User model again.
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      setStatus('Reset link generated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate reset link');
    }
  };

  return (
    <div className="card shadow-sm border-0 bg-white" style={{ borderRadius: '16px' }}>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="py-3">Email</th>
                <th className="py-3 text-center">Status</th>
                <th className="px-4 py-3 text-end">Reset</th>
              </tr>
            </thead>
            <tbody>
              {customers && customers.length > 0 ? customers.map(user => (
                <tr key={user._id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: 40, height: 40 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="fw-bold">{user.name}</div>
                    </div>
                  </td>
                  <td className="py-3 text-muted small">{user.email}</td>
                  <td className="py-3 text-center">
                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success">Active</span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => onReset(user)}>
                      <i className="bi bi-key me-1"></i> New Password
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function OwnerApp() {
  const navigate = useNavigate();
  const [status, setStatus] = useStatus('');
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('sparkle_owner_products') || '[]'));
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('sparkle_owner_orders') || '[]'));
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('sparkle_owner_settings') || '{"upiQrUrl": "", "upiId": "", "whatsappNumber": "", "logoUrl": "", "reportUrl": "", "storeName": ""}'));
  useFavicon(settings.logoUrl);
  useStoreTitle(settings.storeName);
  const [savingSettings, setSavingSettings] = useState(false);
  const [range, setRange] = useState('daily');
  const [report, setReport] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [orderFilterDate, setOrderFilterDate] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(() => {
    // If we have products and orders cached, we don't need a full-page loader
    return !localStorage.getItem('sparkle_owner_products') || !localStorage.getItem('sparkle_owner_orders');
  });
  const [tab, setTab] = useState(() => localStorage.getItem('ownerTab') || 'orders');
  const [previewImg, setPreviewImg] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Save tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ownerTab', tab);
  }, [tab]);

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
    try {
      // 1. Fetch data for the ACTIVE tab first (Prioritization)
      if (tab === 'orders') {
        const o = await ownerFetchOrders();
        setOrders(o);
        localStorage.setItem('sparkle_owner_orders', JSON.stringify(o));
      } else if (tab === 'products') {
        const p = await ownerFetchProducts();
        setProducts(p);
        localStorage.setItem('sparkle_owner_products', JSON.stringify(p));
      }

      setLoading(false); // UI is now prioritized for the user

      // 2. Fetch all other essential data in parallel
      const [p, o, s] = await Promise.all([
        ownerFetchProducts(),
        ownerFetchOrders(),
        ownerFetchSettings()
      ]);

      setProducts(p);
      localStorage.setItem('sparkle_owner_products', JSON.stringify(p));
      setOrders(o);
      localStorage.setItem('sparkle_owner_orders', JSON.stringify(o));
      if (s) {
        setSettings(s);
        localStorage.setItem('sparkle_owner_settings', JSON.stringify(s));
      }

      // 3. Background fetch secondary data
      const [c, a, cust] = await Promise.all([
        ownerFetchCoupons(),
        adminFetchAdmins(),
        adminFetchCustomers()
      ]);
      setCoupons(c);
      setAdmins(a);
      setCustomers(cust);

      // Check for permission update
      const currentUserStr = localStorage.getItem('sparkle_user');
      if (currentUserStr && a) {
        const currentUser = JSON.parse(currentUserStr);
        const dbUser = a.find(user => user._id === currentUser.id);
        if (dbUser && dbUser.adminLevel === 'super_admin' && currentUser.adminLevel !== 'super_admin') {
          if (window.confirm("Your account has been promoted to Super Admin!\n\nPlease log in again to activate your new privileges.")) {
            localStorage.removeItem('sparkle_token');
            localStorage.removeItem('sparkle_user');
            window.location.href = '/admin/login';
            return;
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('sparkle_token');
        navigate('/admin/login');
      } else {
        setStatus('Failed to load dashboard data');
      }
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
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('sparkle_token');
        navigate('/admin/login');
      }
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
        // HIDE UPI orders if no screenshot is uploaded
        // This effectively "drafts" them until the customer completes the flow
        if (o.paymentMethod === 'upi' && !o.paymentScreenshot && !o.isPaid) {
          return false;
        }

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
    const payload = { ...form, price: Number(form.price) };

    // Close form immediately for better UX
    setShowProductForm(false);
    setStatus('Saving...');
    setForm(emptyProduct); // Clear form early, can restore if error

    try {
      let updatedProduct;
      if (editingId) {
        // Optimistic Update for Edit
        setProducts(prev => {
          const next = prev.map(p => p.id === editingId ? { ...p, ...payload } : p);
          localStorage.setItem('sparkle_owner_products', JSON.stringify(next));
          return next;
        });

        updatedProduct = await ownerUpdateProduct(editingId, payload);
        setStatus('Updated successfully');
        setEditingId(null);

        // Confirm with server response (optional consistency check could go here)
      } else {
        // For add, we must wait for ID, but form is already closed so it feels faster
        updatedProduct = await ownerCreateProduct(payload);
        setStatus('Added new product');

        setProducts(prev => {
          const next = [updatedProduct, ...prev];
          localStorage.setItem('sparkle_owner_products', JSON.stringify(next));
          return next;
        });
      }
    } catch {
      setStatus('Error saving product');
      // Ideally reopen form or show error alert here
      if (editingId) setEditingId(null); // Reset
    }
  };

  const onEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...p,
      price: String(p.price),
      comboItems: p.comboItems || []
    });
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

  const onToggleDelivered = async (id, currentStatus) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, delivered: !currentStatus } : o));

    try {
      await ownerToggleDelivered(id, !currentStatus);
      setStatus(`Order marked as ${!currentStatus ? 'Delivered' : 'Not Delivered'}`);
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, delivered: currentStatus } : o));
      setStatus('Error updating delivery status');
    }
  };

  const onDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    // Optimistic Delete
    const prevOrders = orders;
    setOrders(prev => prev.filter(o => o.id !== id));
    setStatus('Deleting Invoice...');

    try {
      await ownerDeleteOrder(id);
      setStatus('Invoice deleted successfully');
    } catch {
      setOrders(prevOrders); // Rollback
      setStatus('Error deleting Invoice');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete?")) return;

    // Optimistic Update
    const previousProducts = products;
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('sparkle_owner_products', JSON.stringify(next));
      return next;
    });

    try {
      await ownerDeleteProduct(id);
      setStatus('Deleted');
    } catch {
      setStatus('Failed to delete product');
      setProducts(previousProducts); // Revert on failure
      localStorage.setItem('sparkle_owner_products', JSON.stringify(previousProducts));
    }
  };

  const onSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const next = await ownerUpdateSettings(settings);
      setSettings(next);
      localStorage.setItem('sparkle_owner_settings', JSON.stringify(next));
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
    const targetPhone = phone?.length === 10 ? '91' + phone : phone;

    const itemsList = order.items.map(i => {
      const details = [i.variantSize, i.variantColor].filter(Boolean).join(' | ');
      return `- ${i.product?.name || `Product ${i.productId}`}${details ? ` (${details})` : ''} x${i.quantity} = Rs.${i.lineTotal?.toFixed(0) || 0}`;
    }).join('\n');

    const deliveryFee = order.deliveryFee || 0;
    const deliveryStr = deliveryFee > 0 ? `Rs.${deliveryFee}` : 'FREE';
    const paymentStatus = order.isPaid ? 'CONFIRMED' : 'PENDING';

    const msg = `*SPARKLE GIFT SHOP*
        -----------------
        Order Confirmation

        Hello *${order.customerName}*,

        ${order.isPaid ? 'Your payment has been received and your order is confirmed!' : 'Thank you for your order. Please complete payment to confirm.'}

        *Order Details:*
        -----------------
        Invoice: ${order.invoiceId}
        Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}

        *Delivery Address:*
        -----------------
        ${order.customerName}
        ${order.phone}
        ${order.address || 'N/A'}

        *Items Ordered:*
        -----------------
        ${itemsList}

        *Payment Summary:*
        -----------------
        Subtotal: Rs.${order.subtotal?.toFixed(2) || order.total?.toFixed(2)}
        ${order.discount > 0 ? `Discount: -Rs.${order.discount}\n` : ''}Delivery: ${deliveryStr}
        *Total: Rs.${order.total?.toFixed(2)}*

        Payment Method: ${order.paymentMethod?.toUpperCase()}
        Payment Status: *${paymentStatus}*

        ${order.isPaid ? 'Your order will be dispatched soon. We will update you with tracking details.' : 'Please complete payment to process your order.'}

        Track your order:
        ${window.location.origin}/order-details/${order.invoiceId}

        For any queries, reply to this message.

        Thank you for shopping with us!
        *Sparkle Gift Shop*`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
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
            <Link to="/" target="_blank" className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2">
              <i className="bi bi-shop"></i> <span className="d-none d-sm-inline">View Shop</span>
            </Link>
            <button
              className="btn btn-sm btn-danger rounded-pill px-3"
              onClick={() => {
                localStorage.removeItem('sparkle_token');
                localStorage.removeItem('sparkle_user');
                window.location.href = '/admin/login';
              }}
            >
              <i className="bi bi-box-arrow-right"></i> <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-white border-bottom shadow-sm sticky-top" style={{ top: '65px', zIndex: 1020 }}>
        <div className="container-fluid px-3 px-md-5">
          <div className="d-flex align-items-center justify-content-start justify-content-md-center gap-2 overflow-auto py-3 mt-3 no-scrollbar">
            {[
              { id: 'orders', icon: 'bi-cart-check', label: 'Orders' },
              { id: 'products', icon: 'bi-box-seam', label: 'Products' },
              { id: 'combos', icon: 'bi-gift', label: 'Combo Store' },
              { id: 'customers', icon: 'bi-person-badge', label: 'Customers' },
              { id: 'coupons', icon: 'bi-ticket-perforated', label: 'Coupons' },
              { id: 'teams', icon: 'bi-people', label: 'Teams' },
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
          {(tab === 'products' || tab === 'combos') && !showProductForm && (
            <button className="btn btn-primary rounded-pill px-4" onClick={() => {
              setForm({ ...emptyProduct, isCombo: tab === 'combos', category: tab === 'combos' ? 'Combos' : '' });
              setShowProductForm(true);
              setEditingId(null);
            }}>
              Add {tab === 'combos' ? 'Combo' : 'Product'}
            </button>
          )}
        </div>


        <div className="container-fluid px-3 px-md-5">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading your store data...</p>
            </div>
          ) : (tab === 'products' || tab === 'combos') && (
            <>
              {showProductForm && <ProductForm form={form} setForm={setForm} onSubmit={onSubmit} editing={!!editingId} products={products} onCancel={() => { setShowProductForm(false); setEditingId(null); }} />}

              <div className="card shadow-sm border-0 mb-4 bg-white" style={{ borderRadius: '16px' }}>
                <div className="card-body p-2">
                  <div className="d-flex align-items-center rounded-pill px-3 py-1" style={{ backgroundColor: '#fcfaff', border: '1px solid #f0e8ff' }}>
                    <i className="bi bi-search text-muted me-2" style={{ fontSize: '14px' }}></i>
                    <input
                      className="form-control border-0 shadow-none bg-transparent py-2"
                      placeholder="Search your product catalog..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      style={{ fontSize: '15px', color: '#4b5563' }}
                    />
                  </div>
                </div>
              </div>

              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-xl-6 g-3 mb-5">
                {products.filter(p => {
                  const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase());
                  if (tab === 'combos') return matchQuery && (p.isCombo || p.category === 'Combos');
                  if (tab === 'products') return matchQuery && !p.isCombo && p.category !== 'Combos';
                  return false;
                }).slice(0, query ? 200 : 50).map(p => (
                  <div className="col" key={p.id}>
                    <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                      <div className="position-relative bg-light" style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                        <img
                          src={p.image || logo}
                          alt={p.name}
                          loading="lazy"
                          className="w-100 h-100 object-fit-contain"
                          style={{ backgroundColor: '#f8f9fa' }}
                        />
                        <div className="position-absolute top-0 end-0 m-2 d-flex flex-column gap-1">
                          <button
                            type="button"
                            className="btn bg-transparent btn-sm rounded-circle border-0"
                            style={{ width: '36px', height: '36px' }}
                            onClick={() => onEdit(p)}
                          >
                            <i className="bi bi-pencil-fill text-primary" style={{ fontSize: '12px' }}></i>
                          </button>
                          <button
                            type="button"
                            className="btn bg-transparent btn-sm rounded-circle border-0"
                            style={{ width: '36px', height: '36px' }}
                            onClick={() => onDelete(p.id)}
                          >
                            <i className="bi bi-trash3-fill text-danger" style={{ fontSize: '12px' }}></i>
                          </button>
                        </div>
                        <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                          <span className="badge bg-white text-dark shadow-sm border fw-bold" style={{ fontSize: '10px' }}>
                            {p.category}
                          </span>
                          {p.isCombo && (
                            <span className="badge bg-warning text-dark shadow-sm border-0 fw-bold" style={{ fontSize: '9px' }}>
                              <i className="bi bi-stars me-1"></i>COMBO
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold text-dark mb-0 text-truncate pe-2" title={p.name}>{p.name}</h6>
                          <div className="text-end">
                            <span className="d-block fw-extrabold text-primary" style={{ fontSize: '14px' }}>₹{p.price}</span>
                            <span className="smallest text-muted font-monospace" style={{ fontSize: '10px' }}>{p.id}</span>
                          </div>
                        </div>
                        {p.isCombo && p.comboItems && p.comboItems.length > 0 && (
                          <div className="mt-2 p-1 bg-light rounded border">
                            <div className="smallest fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '7px' }}>Items:</div>
                            {p.comboItems.map((ci, idx) => (
                              <div key={idx} className="smallest text-muted text-truncate d-flex justify-content-between" style={{ fontSize: '9px' }}>
                                <span>• {ci.name} x{ci.quantity}</span>
                                <span className="fw-bold">₹{ci.price || 0}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {p.variants && p.variants.length > 0 && (
                          <div className="d-flex align-items-center gap-1 mt-2">
                            <i className="bi bi-layers text-muted smallest"></i>
                            <span className="smallest text-muted fw-bold">{p.variants.length} Variants</span>
                          </div>
                        )}
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
                      <button type="button" className="btn btn-primary rounded-pill px-4 mt-2 fw-bold" onClick={() => {
                        setForm({ ...emptyProduct, isCombo: tab === 'combos', category: tab === 'combos' ? 'Combos' : '' });
                        setShowProductForm(true);
                      }}>Add {tab === 'combos' ? 'Combo' : 'Product'}</button>
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
                    <span className="small fw-bold text-muted text-uppercase">Page Size:</span>
                    <select
                      className="form-select form-select-sm w-auto shadow-none border"
                      onChange={(e) => {
                        // Placeholder for page size logic
                      }}
                      defaultValue="50"
                    >
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span className="small fw-bold text-muted text-uppercase ms-2">Filter by Date:</span>
                    <input type="date" className="form-control form-control-sm w-auto shadow-none border" value={orderFilterDate} onChange={e => setOrderFilterDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <OrdersList
                orders={filteredOrders.slice(0, 50)}
                products={products}
                onWhatsApp={onWhatsAppCustomer}
                onDeleteOrder={onDeleteOrder}
                onToggleDispatch={onToggleDispatch}
                onTogglePayment={onTogglePayment}
                onToggleDelivered={onToggleDelivered}
                onPreview={setPreviewImg}
              />
              {filteredOrders.length > 50 && (
                <div className="text-center mt-3 mb-5">
                  <p className="text-muted small">Showing recent 50 of {filteredOrders.length} orders. Use date filter to see specific days.</p>
                </div>
              )}
            </>
          )}

          {tab === 'coupons' && <CouponsPanel coupons={coupons} setCoupons={setCoupons} products={products} />}
          {tab === 'reports' && <ReportsPanel range={range} setRange={setRange} data={report} onDownload={downloadPdf} productData={productSales} reportUrl={settings.reportUrl} />}
          {tab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} onSave={onSaveSettings} saving={savingSettings} />}
          {tab === 'teams' && <TeamsPanel admins={admins} setAdmins={setAdmins} />}
          {tab === 'customers' && <CustomersPanel customers={customers} setCustomers={setCustomers} setStatus={setStatus} />}
        </div>
      </main >

      {/* Image Preview Modal */}
      {
        previewImg && (
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
        )
      }
    </div >
  );
}

export default OwnerApp;
