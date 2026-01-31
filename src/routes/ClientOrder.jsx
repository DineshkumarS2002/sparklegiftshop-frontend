import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { clientFetchSettings, clientGetOrder, API_BASE_URL, clientUploadScreenshot } from '../api/clientApi';

export default function ClientOrder() {
  const { invoiceId } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({ upiQrUrl: '' });
  const [status, setStatus] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [o, s] = await Promise.all([clientGetOrder(invoiceId), clientFetchSettings()]);
        setOrder(o);
        setSettings(s);
      } catch {
        setStatus('Order not found');
      }
    })();
  }, [invoiceId]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert('File size too large (max 2MB)');
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const redirectToWhatsApp = (o) => {
    const itemsList = o.items.map(i => `- ${i.product?.name || `Product ${i.productId}`} x${i.quantity}`).join('\n');
    const msg = `*--- Sparkle Gift Shop ---*\n\nI have Paid & Uploaded the Screenshot for my order.\n\n*Order Details:*\n----------------\n*Invoice:* ${o.invoiceId}\n*Total Amount: ₹${o.total?.toFixed(2)}*\n\n*Customer Info:*\n----------------\n*Name:* ${o.customerName}\n*Phone:* ${o.phone}\n*Address:* ${o.address || 'N/A'}\n\n*Items:*\n${itemsList}\n\n*Status:* Payment Proof Uploaded ✅\n\nTrack Link: ${window.location.origin}/order-details/${o.invoiceId}`;

    const ownerPhone = settings.whatsappNumber ? settings.whatsappNumber.replace(/\D/g, '') : '916381830479';
    const targetPhone = ownerPhone.length === 10 ? '91' + ownerPhone : ownerPhone;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const uploadProof = async () => {
    if (!screenshot) return;
    setUploading(true);
    try {
      await clientUploadScreenshot(invoiceId, screenshot);
      setUploadSuccess(true);
      const updatedOrder = { ...order, paymentScreenshot: screenshot };
      setOrder(updatedOrder);
      // Wait a bit then redirect
      setTimeout(() => redirectToWhatsApp(updatedOrder), 1500);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!order) {
    return (
      <div className="container py-5 text-center">
        {status ? <div className="alert alert-danger">{status}</div> : <div className="spinner-border text-primary" role="status"></div>}
        <div className="mt-3">
          <Link to="/" className="btn btn-link">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const isUpi = order.paymentMethod === 'upi' && settings?.upiId;

  const getUpiLink = () => {
    if (!settings?.upiId) return '';
    const pa = settings.upiId.trim();
    const pn = "SparkleGifts"; // Shorter name, no spaces
    const am = order.total.toFixed(2);
    const tn = `Order${order.invoiceId}`; // No spaces or special chars
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
  };

  const upiLink = getUpiLink();
  const dynamicQrUrl = upiLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&ecc=M&margin=1`
    : '';
  const hasUpi = settings?.upiId;
  const isPaid = order.isPaid || order.paymentScreenshot;

  // Show UPI UI if it's a UPI order OR if it's an unpaid COD order (as an option to pay now)
  const showUpiSection = hasUpi && !isPaid;

  return (
    <div className="container-fluid px-3 px-md-5 py-4 py-md-5">
      <div className="text-center mb-5">
        <div className={`d-inline-flex align-items-center justify-content-center ${(order.isPaid || order.paymentScreenshot || order.paymentMethod === 'cod') ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} rounded-circle mb-3`} style={{ width: '80px', height: '80px' }}>
          <i className={`bi ${(order.isPaid || order.paymentScreenshot || order.paymentMethod === 'cod') ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} fs-1`}></i>
        </div>

        <h1 className="fw-extrabold text-dark h2">
          {(order.isPaid || order.paymentScreenshot || order.paymentMethod === 'cod') ? 'Order Confirmed!' : 'Waiting for Payment...'}
        </h1>
        <p className="text-muted small">Thank you for shopping with Sparkle Gift Shop</p>
        <div className="d-inline-block border px-4 py-2 rounded-pill bg-white shadow-sm fw-bold text-primary mt-2">
          Invoice No: {order.invoiceId}
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-7">
          {/* Order Details Card */}
          <div className="card border-0 shadow-lg overflow-hidden h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-success text-white py-3 border-0 text-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <span className="fw-bold text-uppercase tracking-wider">Order Confirmed</span>
            </div>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 border-bottom pb-2">Order Summary</h5>
              <div className="mb-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light rounded p-1" style={{ width: '40px', height: '40px' }}>
                        <img src={item.product?.image || 'https://via.placeholder.com/40'} className="w-100 h-100 object-fit-cover rounded" alt="" />
                      </div>
                      <div>
                        <div className="fw-bold small">{item.product?.name || `Product ${item.productId}`}</div>
                        <div className="text-muted smallest">Qty: {item.quantity} x ₹{item.product?.price}</div>
                      </div>
                    </div>
                    <div className="fw-bold small">₹{item.lineTotal}</div>
                  </div>
                ))}
              </div>

              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Subtotal</span>
                  <span className="small fw-bold">₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-success">
                    <span className="small">Discount</span>
                    <span className="small fw-bold">-₹{order.discount}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Delivery</span>
                  <span className="small fw-bold text-success">FREE</span>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top">
                  <span className="fw-bold">Total Paid</span>
                  <span className="fw-bold text-primary h5 mb-0">₹{order.total}</span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="text-muted smallest fw-bold text-uppercase d-block mb-1">Customer Details</label>
                  <div className="small fw-bold">{order.customerName}</div>
                  <div className="small text-muted">{order.phone}</div>
                </div>
                <div className="col-sm-6 text-sm-end">
                  <label className="text-muted smallest fw-bold text-uppercase d-block mb-1">Payment Method</label>
                  <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-3">
                    {order.paymentMethod?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showUpiSection ? (
          <div className="col-12 col-lg-5 order-1 order-lg-2">
            <div className="card border-0 shadow-lg text-center h-100 overflow-hidden" style={{ borderRadius: '20px' }}>
              <div className="card-header bg-primary text-white py-3 border-0">
                <span className="fw-bold text-uppercase tracking-wider">
                  {order.paymentMethod === 'cod' ? 'Pay Now via UPI (Optional)' : 'Complete Payment'}
                </span>
              </div>
              <div className="card-body p-4 d-flex flex-column align-items-center">
                {order.paymentMethod === 'cod' && (
                  <div className="alert alert-info smallest text-start mb-3 py-2 px-3 border-0 bg-info bg-opacity-10 text-info">
                    <i className="bi bi-lightning-fill me-2"></i>
                    Switch to UPI for faster processing and contact-less delivery!
                  </div>
                )}
                <p className="text-muted small mb-4">Scan the QR code below or use the UPI ID to pay <strong>₹{order.total}</strong></p>
                <div className="bg-white p-3 border rounded-4 shadow-sm mb-4" style={{ width: '220px', height: '220px' }}>
                  {settings.upiId ? (
                    <QRCodeSVG
                      value={`upi://pay?pa=${settings.upiId}&pn=Sparkle%20Gift%20Shop&am=${order.total}&cu=INR`}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center text-muted small">QR Code Unavailable</div>
                  )}
                </div>

                <h5 className="fw-bold text-primary mb-3 user-select-all">{settings.upiId}</h5>

                <div className="w-100 border-top pt-3">
                  {uploadSuccess || order.paymentScreenshot ? (
                    <div className="text-success fw-bold small">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Payment Proof Uploaded!
                    </div>
                  ) : (
                    <>
                      <label className="form-label small fw-bold text-muted text-uppercase mb-2">Upload Payment Screenshot</label>
                      <input type="file" className="form-control form-control-sm mb-2" accept="image/*" onChange={handleScreenshotChange} />
                      {screenshot && (
                        <button className="btn btn-primary d-flex align-items-center justify-content-center w-100 py-2 rounded-pill fw-bold" onClick={uploadProof} disabled={uploading}>
                          {uploading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-upload me-2"></i>}
                          Confirm & Submit Proof
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isPaid ? (
          <div className="col-12 col-lg-5 order-1 order-lg-2">
            <div className="card border-0 shadow-lg text-center h-100 overflow-hidden" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-4 mb-4">
                  <i className="bi bi-shield-check fs-1"></i>
                </div>
                <h4 className="fw-bold">Payment Verified!</h4>
                <p className="text-muted small mb-0">We have received your payment proof. Our team will verify and dispatch your order soon.</p>
              </div>
            </div>
          </div>
        ) : order.paymentMethod === 'cod' ? (
          <div className="col-12 col-lg-5 order-1 order-lg-2">
            <div className="card border-0 shadow-lg text-center h-100 overflow-hidden" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-info bg-opacity-10 text-info rounded-circle p-4 mb-4">
                  <i className="bi bi-truck fs-1"></i>
                </div>
                <h4 className="fw-bold text-dark text-capitalize">Cash on Delivery</h4>
                <p className="text-muted small mb-4">Your order will be processed and you can pay the amount to our delivery executive.</p>
                <div className="alert alert-success smallest py-2 px-3 m-0 rounded-pill">
                  <i className="bi bi-record-circle-fill me-2"></i>
                  Delivery team will contact you soon
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </div>


      <div className="text-center mt-5 mb-5">
        <Link to="/" className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm transition-all hover-grow">
          <i className="bi bi-bag-plus-fill me-2"></i> Continue Shopping
        </Link>
        <p className="text-muted small mt-4">
          Need help? WhatsApp us at <strong>+{settings.whatsappNumber || '91 6381830479'}</strong>
        </p>
      </div>

    </div >
  );
}

