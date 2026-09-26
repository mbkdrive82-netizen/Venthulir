'use client';

import React, { useId } from 'react';

/**
 * Luxury Authentic Botanical Leaf Corner Component
 * 100% Pure Organic Leaf Artwork with realistic pointed leaf blades, 
 * natural midribs, secondary lateral veins, and fresh botanical gradients.
 * Completely free of any circles, beads, nuts, or geometric brackets.
 */
export function BotanicalCorner({
  position = 'top-left',
  variant = 'tea',
  size = 100,
  opacity = 0.95,
  className = '',
  style = {}
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '_');

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: 0, left: 0, transform: 'none' };
      case 'top-right':
        return { top: 0, right: 0, transform: 'scaleX(-1)' };
      case 'bottom-left':
        return { bottom: 0, left: 0, transform: 'scaleY(-1)' };
      case 'bottom-right':
        return { bottom: 0, right: 0, transform: 'scale(-1, -1)' };
      default:
        return { top: 0, left: 0, transform: 'none' };
    }
  };

  return (
    <div
      className={`botanical-corner-leaves ${className}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        ...getPositionStyles(),
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        zIndex: 2,
        opacity: opacity,
        userSelect: 'none',
        overflow: 'visible',
        filter: 'drop-shadow(0 2px 4px rgba(15, 61, 42, 0.08))',
        ...style
      }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Fresh Spring Sunlit Leaf Gradient */}
          <linearGradient id={`leafSun-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="35%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Deep Forest Emerald Leaf Gradient */}
          <linearGradient id={`leafEmerald-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="45%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#0F3D2A" />
          </linearGradient>

          {/* Dark Shadow Accent Leaf Gradient */}
          <linearGradient id={`leafShadow-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="60%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#0B2B1D" />
          </linearGradient>

          {/* Natural Organic Green Stem Gradient */}
          <linearGradient id={`stemGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="30%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>

          {/* Golden Warm Leaf Tip Shimmer */}
          <linearGradient id={`leafGold-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="30%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>

        {/* ═════════════════════════════════════════════════════════════
            VARIANT 1: FRESH ORGANIC TEA & HERB SPRIG (Hero, CTA, General)
        ═════════════════════════════════════════════════════════════ */}
        {(variant === 'tea' || variant === 'royal' || variant === 'leaves') && (
          <g className="botanical-tea-cluster">
            {/* Elegant Main Arching Botanical Stems */}
            <path
              d="M 4 4 C 18 16, 42 30, 88 36"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 4 4 C 16 18, 30 42, 36 88"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 4 4 C 18 18, 38 38, 58 58"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* 🌿 Leaf 1: Terminal Horizontal Leaf */}
            <g transform="translate(60, 32) rotate(-10)">
              <path
                d="M 0 0 C 10 -16, 32 -18, 44 -4 C 32 14, 10 12, 0 0 Z"
                fill={`url(#leafSun-${id})`}
                stroke="#15803D"
                strokeWidth="1"
              />
              {/* Primary Midrib */}
              <path d="M 0 0 C 15 -4, 30 -4, 44 -4" stroke="#0F3D2A" strokeWidth="0.9" />
              {/* Lateral Veins */}
              <path d="M 12 -3 C 16 -8, 24 -9, 28 -9" stroke="#166534" strokeWidth="0.6" />
              <path d="M 22 -3 C 26 -7, 32 -7, 36 -6" stroke="#166534" strokeWidth="0.6" />
              <path d="M 16 -1 C 20 4, 26 5, 30 5" stroke="#166534" strokeWidth="0.6" />
              <path d="M 26 -2 C 30 3, 35 3, 39 2" stroke="#166534" strokeWidth="0.6" />
            </g>

            {/* 🌿 Leaf 2: Mid-Upper Leaf */}
            <g transform="translate(28, 20) rotate(-38)">
              <path
                d="M 0 0 C 8 -14, 26 -16, 36 -2 C 26 12, 8 10, 0 0 Z"
                fill={`url(#leafEmerald-${id})`}
                stroke="#15803D"
                strokeWidth="0.9"
              />
              <path d="M 0 0 C 12 -3, 24 -3, 36 -2" stroke="#0F3D2A" strokeWidth="0.8" />
              <path d="M 10 -2 C 14 -6, 20 -7, 24 -7" stroke="#166534" strokeWidth="0.5" />
              <path d="M 14 -1 C 18 3, 22 4, 26 4" stroke="#166534" strokeWidth="0.5" />
            </g>

            {/* 🌿 Leaf 3: Terminal Vertical Leaf */}
            <g transform="translate(32, 60) rotate(80)">
              <path
                d="M 0 0 C 10 -16, 32 -18, 44 -4 C 32 14, 10 12, 0 0 Z"
                fill={`url(#leafSun-${id})`}
                stroke="#15803D"
                strokeWidth="1"
              />
              <path d="M 0 0 C 15 -4, 30 -4, 44 -4" stroke="#0F3D2A" strokeWidth="0.9" />
              <path d="M 12 -3 C 16 -8, 24 -9, 28 -9" stroke="#166534" strokeWidth="0.6" />
              <path d="M 22 -3 C 26 -7, 32 -7, 36 -6" stroke="#166534" strokeWidth="0.6" />
              <path d="M 16 -1 C 20 4, 26 5, 30 5" stroke="#166534" strokeWidth="0.6" />
            </g>

            {/* 🌿 Leaf 4: Mid-Lower Leaf */}
            <g transform="translate(20, 28) rotate(58)">
              <path
                d="M 0 0 C 8 -14, 26 -16, 36 -2 C 26 12, 8 10, 0 0 Z"
                fill={`url(#leafShadow-${id})`}
                stroke="#15803D"
                strokeWidth="0.9"
              />
              <path d="M 0 0 C 12 -3, 24 -3, 36 -2" stroke="#0F3D2A" strokeWidth="0.8" />
              <path d="M 10 -2 C 14 -6, 20 -7, 24 -7" stroke="#166534" strokeWidth="0.5" />
              <path d="M 14 -1 C 18 3, 22 4, 26 4" stroke="#166534" strokeWidth="0.5" />
            </g>

            {/* 🌿 Leaf 5: Diagonal Central Leaf */}
            <g transform="translate(40, 40) rotate(25)">
              <path
                d="M 0 0 C 7 -12, 22 -14, 30 -2 C 22 10, 7 8, 0 0 Z"
                fill={`url(#leafGold-${id})`}
                stroke="#15803D"
                strokeWidth="0.85"
              />
              <path d="M 0 0 L 30 -2" stroke="#0F3D2A" strokeWidth="0.75" />
              <path d="M 8 -2 C 12 -5, 16 -5, 20 -5" stroke="#166534" strokeWidth="0.5" />
              <path d="M 12 0 C 15 3, 18 3, 22 3" stroke="#166534" strokeWidth="0.5" />
            </g>

            {/* 🌿 Leaf 6 & 7: Tender Apex Corner Sprout */}
            <g transform="translate(8, 8) rotate(5)">
              <path
                d="M 0 0 C 6 -10, 18 -10, 24 -1 C 18 8, 6 6, 0 0 Z"
                fill={`url(#leafSun-${id})`}
                stroke="#16A34A"
                strokeWidth="0.75"
              />
              <path d="M 0 0 L 24 -1" stroke="#0F3D2A" strokeWidth="0.6" />
            </g>
            <g transform="translate(8, 8) rotate(40)">
              <path
                d="M 0 0 C 5 -8, 15 -8, 20 -1 C 15 6, 5 5, 0 0 Z"
                fill={`url(#leafEmerald-${id})`}
                stroke="#16A34A"
                strokeWidth="0.7"
              />
            </g>
          </g>
        )}

        {/* ═════════════════════════════════════════════════════════════
            VARIANT 2: SLENDER LUSH OLIVE & VAAGAI LEAVES (Products, Story)
        ═════════════════════════════════════════════════════════════ */}
        {(variant === 'olive' || variant === 'chekku') && (
          <g className="botanical-olive-cluster">
            {/* Arching Graceful Twin Stems */}
            <path
              d="M 4 4 C 24 20, 50 34, 96 38"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M 4 4 C 20 24, 34 50, 38 96"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Lanceolate Slender Pointed Leaves */}
            {[
              { x: 18, y: 12, angle: -30, scale: 0.9, grad: `leafEmerald-${id}` },
              { x: 42, y: 26, angle: -15, scale: 1.05, grad: `leafSun-${id}` },
              { x: 68, y: 34, angle: -2, scale: 1.15, grad: `leafGold-${id}` },
              { x: 12, y: 18, angle: 60, scale: 0.9, grad: `leafShadow-${id}` },
              { x: 26, y: 42, angle: 75, scale: 1.05, grad: `leafSun-${id}` },
              { x: 34, y: 68, angle: 88, scale: 1.15, grad: `leafEmerald-${id}` },
              { x: 20, y: 20, angle: 18, scale: 0.95, grad: `leafSun-${id}` },
              { x: 44, y: 44, angle: 35, scale: 0.9, grad: `leafEmerald-${id}` }
            ].map((leaf, idx) => (
              <g key={idx} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}>
                <path
                  d="M 0 0 C 10 -9, 30 -9, 40 0 C 30 9, 10 9, 0 0 Z"
                  fill={`url(#${leaf.grad})`}
                  stroke="#15803D"
                  strokeWidth="0.9"
                />
                <line x1="0" y1="0" x2="40" y2="0" stroke="#0F3D2A" strokeWidth="0.8" />
                <path d="M 10 0 C 14 -5, 20 -5, 25 -5" stroke="#166534" strokeWidth="0.5" />
                <path d="M 22 0 C 26 -4, 31 -4, 35 -3" stroke="#166534" strokeWidth="0.5" />
                <path d="M 14 0 C 18 5, 24 5, 29 5" stroke="#166534" strokeWidth="0.5" />
                <path d="M 25 0 C 29 4, 34 4, 37 3" stroke="#166534" strokeWidth="0.5" />
              </g>
            ))}
          </g>
        )}

        {/* ═════════════════════════════════════════════════════════════
            VARIANT 3: AYURVEDIC NEEM & CURRY LEAF PINNATE SPRIG (Categories)
        ═════════════════════════════════════════════════════════════ */}
        {(variant === 'wheat' || variant === 'grain' || variant === 'neem') && (
          <g className="botanical-neem-cluster">
            {/* Long Sweeping Curved Rachis Stems */}
            <path
              d="M 4 4 C 24 16, 52 26, 94 32"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M 4 4 C 16 24, 26 52, 32 94"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Pointed Leaflet Pairs */}
            {[
              { x: 20, y: 14, angle: -50, scale: 0.85, grad: `leafEmerald-${id}` },
              { x: 36, y: 20, angle: -35, scale: 0.95, grad: `leafSun-${id}` },
              { x: 54, y: 25, angle: -20, scale: 1.05, grad: `leafSun-${id}` },
              { x: 74, y: 29, angle: -5, scale: 1.1, grad: `leafGold-${id}` },
              { x: 14, y: 20, angle: 40, scale: 0.85, grad: `leafShadow-${id}` },
              { x: 20, y: 36, angle: 55, scale: 0.95, grad: `leafSun-${id}` },
              { x: 25, y: 54, angle: 70, scale: 1.05, grad: `leafEmerald-${id}` },
              { x: 29, y: 74, angle: 85, scale: 1.1, grad: `leafGold-${id}` },
              { x: 10, y: 10, angle: -5, scale: 0.8, grad: `leafSun-${id}` }
            ].map((item, idx) => (
              <g key={idx} transform={`translate(${item.x}, ${item.y}) rotate(${item.angle}) scale(${item.scale})`}>
                <path
                  d="M 0 0 C 8 -11, 24 -11, 32 0 C 24 11, 8 11, 0 0 Z"
                  fill={`url(#${item.grad})`}
                  stroke="#15803D"
                  strokeWidth="0.85"
                />
                <line x1="0" y1="0" x2="32" y2="0" stroke="#0F3D2A" strokeWidth="0.75" />
                <path d="M 8 0 C 12 -5, 17 -5, 21 -5" stroke="#166534" strokeWidth="0.5" />
                <path d="M 12 0 C 16 5, 21 5, 25 5" stroke="#166534" strokeWidth="0.5" />
              </g>
            ))}
          </g>
        )}

        {/* ═════════════════════════════════════════════════════════════
            VARIANT 4: BROAD AROMATIC BAY & CARDAMOM LEAF (Why Us, FAQ)
        ═════════════════════════════════════════════════════════════ */}
        {(variant === 'spice' || variant === 'spices' || variant === 'cardamom') && (
          <g className="botanical-cardamom-cluster">
            <path
              d="M 4 4 C 26 18, 50 32, 90 38"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 4 4 C 18 26, 32 50, 38 90"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Broad Glossy Emerald Leaves */}
            <g transform="translate(24, 18) rotate(-40) scale(1.05)">
              <path
                d="M 0 0 C 12 -18, 34 -16, 46 0 C 34 16, 12 18, 0 0 Z"
                fill={`url(#leafSun-${id})`}
                stroke="#15803D"
                strokeWidth="1"
              />
              <path d="M 0 0 L 46 0" stroke="#0F3D2A" strokeWidth="0.9" />
              <path d="M 12 0 C 16 -8, 26 -8, 34 -7" stroke="#166534" strokeWidth="0.6" />
              <path d="M 22 0 C 26 -6, 34 -6, 40 -4" stroke="#166534" strokeWidth="0.6" />
              <path d="M 16 0 C 20 8, 28 8, 36 7" stroke="#166534" strokeWidth="0.6" />
            </g>

            <g transform="translate(56, 32) rotate(-12) scale(1.1)">
              <path
                d="M 0 0 C 12 -17, 32 -15, 42 0 C 32 15, 12 17, 0 0 Z"
                fill={`url(#leafEmerald-${id})`}
                stroke="#15803D"
                strokeWidth="1"
              />
              <path d="M 0 0 L 42 0" stroke="#0F3D2A" strokeWidth="0.85" />
              <path d="M 12 0 C 16 -7, 24 -7, 30 -6" stroke="#166534" strokeWidth="0.55" />
              <path d="M 16 0 C 20 7, 28 7, 34 6" stroke="#166534" strokeWidth="0.55" />
            </g>

            <g transform="translate(18, 24) rotate(50) scale(1.05)">
              <path
                d="M 0 0 C 12 -18, 34 -16, 46 0 C 34 16, 12 18, 0 0 Z"
                fill={`url(#leafShadow-${id})`}
                stroke="#15803D"
                strokeWidth="1"
              />
              <path d="M 0 0 L 46 0" stroke="#0F3D2A" strokeWidth="0.9" />
              <path d="M 12 0 C 16 -8, 26 -8, 34 -7" stroke="#166534" strokeWidth="0.6" />
              <path d="M 16 0 C 20 8, 28 8, 36 7" stroke="#166534" strokeWidth="0.6" />
            </g>

            <g transform="translate(32, 56) rotate(78) scale(1.1)">
              <path
                d="M 0 0 C 12 -17, 32 -15, 42 0 C 32 15, 12 17, 0 0 Z"
                fill={`url(#leafSun-${id})`}
                stroke="#15803D"
                strokeWidth="1"
              />
              <path d="M 0 0 L 42 0" stroke="#0F3D2A" strokeWidth="0.85" />
              <path d="M 12 0 C 16 -7, 24 -7, 30 -6" stroke="#166534" strokeWidth="0.55" />
              <path d="M 16 0 C 20 7, 28 7, 34 6" stroke="#166534" strokeWidth="0.55" />
            </g>

            <g transform="translate(10, 10) rotate(15) scale(0.85)">
              <path
                d="M 0 0 C 8 -12, 22 -12, 30 0 C 22 12, 8 12, 0 0 Z"
                fill={`url(#leafGold-${id})`}
                stroke="#15803D"
                strokeWidth="0.8"
              />
            </g>
          </g>
        )}

        {/* ═════════════════════════════════════════════════════════════
            VARIANT 5: SACRED TULSI / BASIL HERBAL FOLIAGE (Reviews, Trust)
        ═════════════════════════════════════════════════════════════ */}
        {(variant === 'eucalyptus' || variant === 'tulsi' || variant === 'reviews') && (
          <g className="botanical-tulsi-cluster">
            <path
              d="M 4 4 C 22 20, 44 32, 88 36"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M 4 4 C 20 22, 32 44, 36 88"
              stroke={`url(#stemGrad-${id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Serrated/Pointed Natural Tulsi Pairs */}
            {[
              { x: 16, y: 14, angle: -42, scale: 0.9, grad: `leafEmerald-${id}` },
              { x: 34, y: 22, angle: -24, scale: 1.05, grad: `leafSun-${id}` },
              { x: 56, y: 28, angle: -8, scale: 1.15, grad: `leafGold-${id}` },
              { x: 14, y: 16, angle: 48, scale: 0.9, grad: `leafShadow-${id}` },
              { x: 22, y: 34, angle: 66, scale: 1.05, grad: `leafSun-${id}` },
              { x: 28, y: 56, angle: 82, scale: 1.15, grad: `leafEmerald-${id}` },
              { x: 30, y: 30, angle: 22, scale: 0.95, grad: `leafSun-${id}` },
              { x: 8, y: 8, angle: 3, scale: 0.75, grad: `leafSun-${id}` }
            ].map((leaf, idx) => (
              <g key={idx} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}>
                <path
                  d="M 0 0 C 9 -13, 27 -13, 35 0 C 27 13, 9 13, 0 0 Z"
                  fill={`url(#${leaf.grad})`}
                  stroke="#15803D"
                  strokeWidth="0.9"
                />
                <line x1="0" y1="0" x2="35" y2="0" stroke="#0F3D2A" strokeWidth="0.8" />
                <path d="M 10 0 C 13 -5, 18 -5, 23 -5" stroke="#166534" strokeWidth="0.5" />
                <path d="M 13 0 C 16 5, 21 5, 26 5" stroke="#166534" strokeWidth="0.5" />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Section Header Crest / Divider Motif
 */
export function SectionCrest({ color = '#15803D', title, subtitle }) {
  return (
    <div className="section-botanical-crest" aria-hidden="true">
      <div className="crest-line left" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <div className="crest-emblem" style={{ color: color }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" fillOpacity="0.2" />
        </svg>
      </div>
      <div className="crest-line right" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

export default BotanicalCorner;
