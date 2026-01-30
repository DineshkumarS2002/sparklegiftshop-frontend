import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

  return (
    <div className="container-fluid px-3 px-md-5 py-4 py-md-5">
      {/* ... (Existing Header) */}
      <div className="text-center mb-5">
        <div className={`d-inline-flex align-items-center justify-content-center ${(order.isPaid || order.paymentScreenshot) ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} rounded-circle mb-3`} style={{ width: '80px', height: '80px' }}>
          <i className={`bi ${(order.isPaid || order.paymentScreenshot) ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} fs-1`}></i>
        </div>
        <h1 className="fw-extrabold text-dark h2">
          {(order.isPaid || order.paymentScreenshot) ? 'Order Confirmed!' : 'Order Pending...'}
        </h1>
        <p className="text-muted lead">
          {(order.isPaid || order.paymentScreenshot)
            ? 'Thank you for shopping with Sparkle Gift Shop'
            : 'Please complete your payment to confirm the order'}
        </p>
        <div className="d-inline-block bg-white shadow-sm border rounded-pill px-4 py-2 fw-bold text-primary mt-2">
          Invoice No: {order.invoiceId}
        </div>
      </div>

      <div className="row g-4 justify-content-center align-items-start">
        {/* Left Column (Items summary) - no changes here, just for context */}
        <div className="col-12 col-lg-7 order-2 order-lg-1">
          {/* ... existing card content ... */}
          <div className="card shadow-sm border-0 overflow-hidden mb-4">
            {/* [Existing content of Invoice Summary card, omitted for brevity but should be preserved] */}
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold"><i className="bi bi-receipt me-2 text-primary"></i>Invoice Summary</h5>
            </div>
            <div className="card-body p-3 p-md-4">
              {/* ... (Existing table rows) ... */}
              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={item.productId} className="row align-items-center border-bottom border-light py-3 gx-2">
                    <div className="col-7">
                      <div className="fw-bold text-dark mb-1">{item.product?.name}</div>
                    </div>
                    <div className="col-2 text-center">{item.quantity}</div>
                    <div className="col-3 text-end">₹{item.lineTotal?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-light border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 fw-bold mb-0 text-dark">Grand Total</span>
                  <div className="text-end">
                    <span className="h4 fw-extrabold mb-0 text-primary d-block">₹{order.total?.toFixed(2)}</span>
                    <span className={`smallest fw-bold p-1 rounded ${(order.isPaid || order.paymentScreenshot) ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                      {(order.isPaid || order.paymentScreenshot) ? 'PAID' : 'PAYMENT PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4 bg-white border-start border-primary border-5">
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-sm-6">
                  <h6 className="fw-bold text-uppercase smallest text-muted mb-2">Delivery Address</h6>
                  <p className="fw-bold mb-1 fs-5 text-dark">{order.customerName}</p>
                  <p className="mb-0 text-muted small">{order.address || 'No address provided'}</p>
                </div>
                <div className="col-sm-6">
                  <h6 className="fw-bold text-uppercase smallest text-muted mb-2">Contact Details</h6>
                  <p className="fw-bold mb-1 text-primary"><i className="bi bi-telephone-fill me-2"></i>{order.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-3">
            <Link to="/" className="btn btn-light shadow-sm flex-grow-1 py-3 fw-bold rounded-pill border">
              <i className="bi bi-shop me-2"></i>Continue Shopping
            </Link>
            <a href={`${API_BASE_URL}/orders/${order.invoiceId}/pdf`} download className="btn btn-primary shadow flex-grow-1 py-3 fw-bold rounded-pill">
              <i className="bi bi-cloud-arrow-down-fill me-2"></i>Download Link
            </a>
          </div>
        </div>

        {/* Right Column: Payment (Now Dynamic) */}
        {isUpi ? (
          <div className="col-12 col-lg-5 order-1 order-lg-2">
            <div className="card border-0 shadow-lg text-center h-100 overflow-hidden" style={{ minHeight: '380px', borderRadius: '20px' }}>
              <div className="bg-primary py-4 text-white">
                <h4 className="mb-1 fw-extrabold">Complete Payment</h4>
                <p className="mb-0 opacity-75 small">Pay securely via UPI</p>
              </div>
              <div className="card-body p-4 d-flex flex-column justify-content-center align-items-center">
                <div className="mb-3">
                  <p className="mb-1 text-muted fw-bold text-uppercase smallest">Pay Exactly</p>
                  <div className="h1 fw-extrabold text-primary mb-0">₹{order.total?.toFixed(2)}</div>
                </div>

                <div className="bg-white p-3 rounded-4 shadow border mb-3" style={{ width: '240px' }}>
                  <img src={dynamicQrUrl} alt="Payment QR" className="w-100 rounded-3" />
                  <div className="mt-3 small fw-bold text-primary text-break">
                    <i className="bi bi-wallet2 me-1"></i> {settings.upiId}
                  </div>
                </div>

                {/* Direct Pay Button for Mobile Users */}
                {upiLink && (
                  <div className="w-100 mb-3 d-md-none">
                    <a href={upiLink} className="btn btn-success btn-lg w-100 rounded-pill fw-bold py-3 shadow">
                      <i className="bi bi-phone-vibrate me-2"></i> OPEN UPI APPS
                    </a>
                  </div>
                )}

                <div className="d-flex gap-2 mb-3">
                  <div className="px-2 py-1 bg-light border rounded small fw-bold">GPay</div>
                  <div className="px-2 py-1 bg-light border rounded small fw-bold">PhonePe</div>
                  <div className="px-2 py-1 bg-light border rounded small fw-bold">Paytm</div>
                </div>

                <div className="alert alert-info py-2 px-3 small border-0 w-100 mb-3">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  {upiLink ? 'Amount & Invoice auto-filled!' : 'Scan QR and pay exactly the total amount'}
                </div>

                <div className="w-100 border-top pt-3">
                  {uploadSuccess || order.paymentScreenshot ? (
                    <div className="text-success fw-bold small">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Payment Proof Uploaded!
                    </div>
                  ) : (
                    <>
                      <label className="form-label small fw-bold text-muted text-uppercase mb-2">Upload Payment Screenshot</label>
                      <input
                        type="file"
                        className="form-control form-control-sm mb-2"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                      />
                      {screenshot && (
                        <button
                          className="btn btn-primary d-flex align-items-center justify-content-center w-100 py-2 rounded-pill fw-bold"
                          onClick={uploadProof}
                          disabled={uploading}
                        >
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
        ) : order.paymentMethod === 'upi' && (
          <div className="col-12 col-lg-5 order-1 order-lg-2">
            <div className="card border-0 shadow-sm p-4 text-center">
              <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3"></i>
              <h5 className="fw-bold">Payment Info Missing</h5>
              <p className="text-muted small">Please contact the shop owner on WhatsApp to complete your payment.</p>
              <a href={`https://wa.me/916381830479?text=Order%20${order.invoiceId}%20payment%20details`} className="btn btn-success rounded-pill fw-bold">
                <i className="bi bi-whatsapp me-2"></i>Message Owner
              </a>
            </div>
          </div>
        )}
      </div>


      <div className="text-center mt-5">
        <p className="text-muted small">
          Need help? WhatsApp us at <strong>+91 6381830479</strong>
        </p>
      </div>
    </div>
  );
}

