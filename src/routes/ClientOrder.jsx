import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clientFetchSettings, clientGetOrder } from '../api/clientApi';

export default function ClientOrder() {
  const { invoiceId } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({ upiQrUrl: '' });
  const [status, setStatus] = useState('');

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

  const isUpi = order.paymentMethod === 'upi' && settings.upiQrUrl;

  return (
    <div className="container-fluid px-3 px-md-5 py-4 py-md-5">
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
          <i className="bi bi-check-circle-fill fs-1"></i>
        </div>
        <h1 className="fw-extrabold text-dark h2">Order Confirmed!</h1>
        <p className="text-muted lead">Thank you for shopping with Sparkle Gift Shop</p>
        <div className="d-inline-block bg-white shadow-sm border rounded-pill px-4 py-2 fw-bold text-primary mt-2">
          Invoice No: {order.invoiceId}
        </div>
      </div>

      <div className="row g-4 justify-content-center align-items-start">
        {/* Left Column: Summary & Actions */}
        <div className="col-12 col-lg-7 order-2 order-lg-1">
          <div className="card shadow-sm border-0 overflow-hidden mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold"><i className="bi bi-receipt me-2 text-primary"></i>Invoice Summary</h5>
            </div>
            <div className="card-body p-3 p-md-4">
              <div className="mb-3">
                <div className="row text-muted small text-uppercase fw-bold border-bottom pb-2 mb-0">
                  <div className="col-7">Item Description</div>
                  <div className="col-2 text-center">Qty</div>
                  <div className="col-3 text-end">Total</div>
                </div>
              </div>

              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={item.productId} className="row align-items-center border-bottom border-light py-3 gx-2">
                    <div className="col-7">
                      <div className="fw-bold text-dark mb-1">{item.product?.name}</div>
                      <div className="smallest text-muted text-uppercase">{item.product?.category}</div>
                    </div>
                    <div className="col-2 text-center">
                      <span className="fw-bold text-dark">{item.quantity}</span>
                    </div>
                    <div className="col-3 text-end">
                      <span className="fw-bold text-dark">₹{item.lineTotal?.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-light border-top">
                <div className="row justify-content-end">
                  <div className="col-md-7 col-lg-6">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-medium">₹{order.subtotal?.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span className="fw-medium">Discount Applied</span>
                        <span className="fw-bold">-₹{order.discount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                      <span className="text-muted">Delivery Fee</span>
                      <span className="fw-medium text-success">{order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : 'FREE'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 fw-bold mb-0 text-dark">Grand Total</span>
                      <span className="h4 fw-extrabold mb-0 text-primary">₹{order.total?.toFixed(2)}</span>
                    </div>
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
                  <p className="mb-0 text-muted small">Payment: <span className="badge bg-light text-dark border text-uppercase">{order.paymentMethod}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-3">
            <Link to="/" className="btn btn-light shadow-sm flex-grow-1 py-3 fw-bold rounded-pill border">
              <i className="bi bi-shop me-2"></i>Continue Shopping
            </Link>
            <a
              href={`http://localhost:4000/api/orders/${order.invoiceId}/pdf`}
              download
              className="btn btn-primary shadow flex-grow-1 py-3 fw-bold rounded-pill"
            >
              <i className="bi bi-cloud-arrow-down-fill me-2"></i>Direct Download
            </a>
          </div>
        </div>

        {/* Right Column: Payment (If UPI) */}
        {isUpi && (
          <div className="col-12 col-lg-5 order-1 order-lg-2">
            <div className="card border-0 shadow-lg text-center h-100 overflow-hidden" style={{ minHeight: '380px', borderRadius: '20px' }}>
              <div className="bg-primary py-4 text-white">
                <h4 className="mb-1 fw-extrabold">Complete Payment</h4>
                <p className="mb-0 opacity-75 small">Scan QR with your favorite app</p>
              </div>
              <div className="card-body p-5 d-flex flex-column justify-content-center align-items-center">
                <div className="mb-4">
                  <p className="mb-1 text-muted fw-bold text-uppercase smallest">Pay Exactly</p>
                  <div className="h1 fw-extrabold text-primary mb-0">₹{order.total?.toFixed(2)}</div>
                </div>

                <div className="bg-white p-3 rounded-4 shadow border mb-4" style={{ width: '260px' }}>
                  <img src={settings.upiQrUrl} alt="UPI QR" className="w-100 rounded-3" />
                </div>

                <div className="d-flex gap-2 mb-4">
                  <div className="px-2 py-1 bg-light border rounded small fw-bold">GPay</div>
                  <div className="px-2 py-1 bg-light border rounded small fw-bold">PhonePe</div>
                  <div className="px-2 py-1 bg-light border rounded small fw-bold">Paytm</div>
                </div>

                <div className="alert alert-info py-2 px-3 small border-0 w-100">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Please take a screenshot after payment
                </div>
              </div>
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

