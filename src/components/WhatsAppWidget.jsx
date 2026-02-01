import React from 'react';

export default function WhatsAppWidget({ phone }) {
    if (!phone) return null;
    const target = phone.replace(/\D/g, '');
    const cleanPhone = target.length === 10 ? '91' + target : target;

    return (
        <a
            href={`https://wa.me/${cleanPhone}?text=Hi Sparkle Gift Shop, I have a query about your products!`}
            className="whatsapp-float shadow-lg"
            target="_blank"
            rel="noreferrer"
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                backgroundColor: '#25d366',
                color: '#fff',
                borderRadius: '50px',
                textAlign: 'center',
                fontSize: '30px',
                boxShadow: '2px 2px 3px #999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                zIndex: 10000,
                transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <i className="bi bi-whatsapp"></i>
        </a>
    );
}
