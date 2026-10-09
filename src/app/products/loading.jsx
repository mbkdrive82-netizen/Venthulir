import React from 'react';

export default function ProductsLoading() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', width: '100%' }}>
      {/* Category Tabs Skeleton */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '4px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              minWidth: '110px',
              height: '38px',
              borderRadius: '20px',
              background: '#e8f5ec',
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {[1, 2, 3, 4, 6, 7, 8].map((card) => (
          <div
            key={card}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eaeaea',
              overflow: 'hidden',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '190px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #f5f5f5 25%, #ececec 50%, #f5f5f5 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div style={{ width: '70%', height: '18px', background: '#e0e0e0', borderRadius: '4px' }} />
            <div style={{ width: '40%', height: '14px', background: '#f0f0f0', borderRadius: '4px' }} />
            <div style={{ width: '100%', height: '38px', background: '#e8f5ec', borderRadius: '8px', marginTop: 'auto' }} />
          </div>
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
