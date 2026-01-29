import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clientGetOrder } from '../api/clientApi';

export default function ClientBill() {
  const { invoiceId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const o = await clientGetOrder(invoiceId);
        setOrder(o);
        // Ensure render before print
        setTimeout(() => window.print(), 500);
      } catch {
        setStatus('Order not found');
      }
    })();
  }, [invoiceId]);

  if (!order) {
    return (
      <div className="container py-5 text-center">
        {status ? <div className="alert alert-danger">{status}</div> : <div className="spinner-border text-primary" role="status"></div>}
      </div>
    );
  }

  return (
    <div className="container-fluid px-5 py-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-print-none d-flex justify-content-between mb-4">
        <Link className="btn btn-outline-secondary" to={`/client/order/${order.invoiceId}`}>
          &larr; Back
        </Link>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print Bill
        </button>
      </div>

      <div className="card shadow border-0 p-0 overflow-hidden bg-white" id="invoice" style={{ borderRadius: '15px' }}>
        <div className="bg-primary p-4 text-white d-flex justify-content-between align-items-start">
          <div>
            <h2 className="fw-bold mb-0">Sparkle Gift Shop</h2>
            <p className="mb-0 opacity-75 small">Premium Personalized Gifts</p>
          </div>
          <div className="text-end">
            <h3 className="fw-bold mb-0 text-uppercase">Invoice</h3>
            <p className="mb-0 small opacity-75">#{order.invoiceId}</p>
          </div>
        </div>

        <div className="card-body p-4 p-md-5">
          <div className="row mb-5 g-4">
            <div className="col-sm-6 border-start border-primary border-3 ms-3">
              <h6 className="fw-bold text-uppercase text-muted small mb-1">Issued By:</h6>
              <p className="fw-extrabold mb-1 text-primary h5">Sparkle Gift Shop</p>
              <p className="mb-0 small">DGL-624005</p>
              <p className="mb-0 small">Ph: +91 6381830479</p>
              <p className="mb-0 small text-muted">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="col-sm-6 text-sm-end pe-3">
              <h6 className="fw-bold text-uppercase text-muted small mb-1">Invoice To:</h6>
              <p className="fw-extrabold mb-1 h5 text-dark">{order.customerName}</p>
              <p className="mb-1 small fw-bold text-primary">{order.phone}</p>
              <div className="d-flex justify-content-sm-end">
                <p className="text-muted small mb-0 w-75 text-sm-end lh-sm">{order.address || 'No address provided'}</p>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                <span className="small fw-bold text-muted text-uppercase">Payment Method</span>
                <span className="badge bg-white text-dark border px-3 py-1 text-uppercase fw-bold">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-3">
              <div className="row text-muted small text-uppercase fw-bold border-bottom pb-2 mb-0">
                <div className="col-5">Item Description</div>
                <div className="col-2 text-center">Qty</div>
                <div className="col-2 text-end">Price</div>
                <div className="col-3 text-end">Total</div>
              </div>
            </div>

            <div className="order-items-list">
              {order.items.map((it) => (
                <div key={it.productId} className="row align-items-center border-bottom border-light py-3 gx-2">
                  <div className="col-5">
                    <div className="fw-bold text-dark mb-1">{it.product?.name}</div>
                    <div className="text-muted smallest text-uppercase">{it.product?.category}</div>
                  </div>
                  <div className="col-2 text-center">
                    <span className="fw-bold text-dark">{it.quantity}</span>
                  </div>
                  <div className="col-2 text-end">
                    <span className="text-muted small">₹{it.product?.price}</span>
                  </div>
                  <div className="col-3 text-end">
                    <span className="fw-bold text-dark">₹{it.lineTotal?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-top mt-4 pt-4">
            <div className="row justify-content-end">
              <div className="col-12 col-sm-8 col-md-6 col-lg-5">
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold text-dark">₹{order.subtotal?.toFixed(2)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-success">Discount</span>
                    <span className="fw-bold text-success">-₹{order.discount?.toFixed(2)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span className="text-muted">Delivery Fee</span>
                  <span className="fw-bold text-success">{order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : 'FREE'}</span>
                </div>

                <div className="bg-primary text-white rounded p-3 mt-3 d-flex justify-content-between align-items-center">
                  <h4 className="fw-extrabold mb-0">Grand Total</h4>
                  <h3 className="fw-extrabold mb-0">₹{order.total?.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-5 pt-4 border-top">
            <p className="fw-bold mb-1 text-dark">Thank you for your order!</p>
            <p className="text-muted small">This is a system generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
