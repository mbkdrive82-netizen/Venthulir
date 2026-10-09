import React from 'react';

export default function AdminLoading() {
  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div
            style={{
              width: '180px',
              height: '32px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '8px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              width: '260px',
              height: '16px',
              background: '#f5f5f5',
              borderRadius: '4px',
            }}
          />
        </div>
        <div
          style={{
            width: '120px',
            height: '38px',
            background: '#f0f0f0',
            borderRadius: '8px',
          }}
        />
      </div>

      {/* Metric Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #eaeaea',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '40%', height: '14px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '12px' }} />
            <div style={{ width: '60%', height: '28px', background: '#e8f5ec', borderRadius: '6px' }} />
          </div>
        ))}
      </div>

      {/* Content Table Skeleton */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #eaeaea',
          padding: '24px',
          minHeight: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ width: '100%', height: '44px', background: '#f8f8f8', borderRadius: '8px' }} />
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            style={{
              width: '100%',
              height: '52px',
              background: 'linear-gradient(90deg, #fafafa 25%, #f0f0f0 50%, #fafafa 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '8px',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
