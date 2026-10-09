import React from 'react';

export default function GlobalLoading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF9F6',
        padding: '40px 20px',
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '3px solid #E8F5EC',
          borderTopColor: '#1B5E2F',
          borderRightColor: '#4CAF50',
          animation: 'spinLoader 0.75s linear infinite',
          boxShadow: '0 4px 14px rgba(27, 94, 47, 0.15)',
        }}
      />
      <div
        style={{
          marginTop: '18px',
          fontFamily: "'Cinzel', serif",
          fontSize: '0.95rem',
          fontWeight: '700',
          letterSpacing: '0.12em',
          color: '#134522',
        }}
      >
        VENTHULIR
      </div>
      <div
        style={{
          marginTop: '4px',
          fontSize: '0.8rem',
          color: '#666666',
          letterSpacing: '0.04em',
        }}
      >
        Loading pure harvest...
      </div>

      <style>{`
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
