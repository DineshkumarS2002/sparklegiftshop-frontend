import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { clientGetOrder } from '../api/clientApi';
import { ownerGetOrder } from '../api/ownerApi';

export default function ShippingLabel() {
    const { invoiceId } = useParams();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const userString = localStorage.getItem('sparkle_user');
                const user = userString ? JSON.parse(userString) : {};
                const isAdmin = user.role === 'admin';

                const o = isAdmin ? await ownerGetOrder(invoiceId) : await clientGetOrder(invoiceId);
                setOrder(o);
                // Prompt print immediately
                setTimeout(() => window.print(), 500);
            } catch (err) {
                console.error(err);
                setStatus('Order not found');
            }
        })();
    }, [invoiceId]);

    if (!order) {
        return status ? <div className="p-3 text-danger">{status}</div> : <div className="p-3">Loading Label...</div>;
    }

    return (
        <div className="label-container" style={{ width: '4in', margin: '0 auto', background: '#fff', border: '2px solid #000', padding: '15px', fontFamily: 'sans-serif' }}>
            <style>{`
        @page { size: auto; margin: 0mm; }
        @media print {
          body * { visibility: hidden; }
          .label-container, .label-container * { visibility: visible; }
          .label-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            border: 2px solid #000 !important; 
          }
        }
      `}</style>

            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '15px' }}>
                <h2 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>Sparkle Gift Shop</h2>
                <p style={{ margin: '3px 0 0', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>Shipping Details</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
                <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: '10px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000' }}>From:</p>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold' }}>Sparkle Gift Shop</p>
                    <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: 'bold' }}>DGL-624005</p>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold' }}>Ph: +91 6381830479</p>
                </div>

                <div style={{ flex: 1.5 }}>
                    <p style={{ margin: '0 0 5px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000' }}>Deliver To:</p>
                    <h3 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 'bold' }}>{order.customerName}</h3>
                    <p style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: 'bold' }}>Ph: {order.phone}</p>
                    <div style={{ margin: '0', fontSize: '13px', lineHeight: '1.2', fontWeight: 'bold' }}>
                        {order.address || 'No address provided'}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666' }}>Order Items:</p>
                <div>
                    {order.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', borderBottom: '1px dashed #f0f0f0', pb: '2px' }}>
                            <div style={{ flex: 1, paddingRight: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>{it.quantity} x </span>
                                <span style={{ fontWeight: 'bold' }}>{it.product?.name || `Product ${it.productId}`}</span>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '10px' }}>
                <div>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold' }}>Bill No:</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>{order.invoiceId}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold' }}>Payment:</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>{order.paymentMethod?.toUpperCase()}</p>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>

                <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Fragile - Handle With Care</p>
            </div>
        </div>
    );
}
