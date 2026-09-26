'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingBag, Tag, Truck, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { PRESET_COUPONS } from '@/data/constants';
import './CartDrawer.css';

const SHIPPING_FREE_THRESHOLD = 499;
const SHIPPING_FEE = 60;

const getFallbackImage = (name = '', category = '') => {
  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  if (lowerName.includes('turmeric') || lowerName.includes('manjal') || lowerName.includes('yellow') || lowerName.includes('turm')) return '/assets/hero/turmeric.png';
  if (lowerName.includes('chilli') || lowerName.includes('chili') || lowerName.includes('red') || lowerName.includes('milagai')) return '/assets/hero/chilli.png';
  if (lowerName.includes('coriander') || lowerName.includes('mallie') || lowerName.includes('dhaniya') || lowerName.includes('kothamalli')) return '/assets/hero/coriander.png';
  if (lowerName.includes('sambar') || lowerName.includes('masala') || lowerName.includes('garam') || lowerName.includes('rasam')) return '/assets/hero/sambar.png';
  if (lowerName.includes('coconut') || lowerName.includes('thengai')) return '/assets/hero/oil_coconut.png';
  if (lowerName.includes('groundnut') || lowerName.includes('kadalai')) return '/assets/hero/oil_groundnut.png';
  if (lowerName.includes('gingelly') || lowerName.includes('sesame') || lowerName.includes('nallennai') || lowerName.includes('til')) return '/assets/hero/oil_gingelly.png';
  if (lowerName.includes('oil') || lowerCat.includes('oil')) return '/assets/hero/oil_sunflower.png';
  return '/assets/hero/turmeric.png';
};

export default function CartDrawer({ onCheckout }) {
  const { cartItems, updateQty, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError]   = useState('');

  // Lock background body scroll while CartDrawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const applyCouponCode = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    if (PRESET_COUPONS[code]) {
      setAppliedCoupon({ code, ...PRESET_COUPONS[code] });
      setCouponError('');
      setCouponInput(code);
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(cartTotal * appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, cartTotal)
    : 0;

  const afterDiscount = Math.max(cartTotal - discount, 0);
  const shippingFee   = afterDiscount >= SHIPPING_FREE_THRESHOLD || cartItems.length === 0 ? 0 : SHIPPING_FEE;
  const grandTotal    = afterDiscount + shippingFee;
  const freeShipRemaining = Math.max(0, SHIPPING_FREE_THRESHOLD - afterDiscount);
  const freeShipPercent = Math.min(100, Math.round((afterDiscount / SHIPPING_FREE_THRESHOLD) * 100));
  const totalItemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer animate-slide-right" data-lenis-prevent>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-top">
            <div className="cart-header-title">
              <div className="cart-title-icon-wrap">
                <ShoppingBag size={18} />
              </div>
              <span>Your Basket</span>
              {totalItemCount > 0 && (
                <span className="cart-count-pill">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
              )}
            </div>
            <button className="cart-close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
              <X size={18} />
            </button>
          </div>

          {/* Free Shipping Gamification Bar */}
          {cartItems.length > 0 && (
            <div className="cart-shipping-progress-wrap">
              <div className="cart-shipping-progress-text">
                {freeShipRemaining === 0 ? (
                  <span className="free-ship-unlocked">
                    <Sparkles size={13} />
                    <span><strong>Congratulations!</strong> Free Delivery Unlocked!</span>
                  </span>
                ) : (
                  <span>
                    Add <strong>₹{freeShipRemaining}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
                <span className="free-ship-threshold-tag">Goal: ₹{SHIPPING_FREE_THRESHOLD}</span>
              </div>
              <div className="cart-progress-track">
                <div 
                  className={`cart-progress-bar ${freeShipRemaining === 0 ? 'is-complete' : ''}`}
                  style={{ width: `${freeShipPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div 
          className="cart-items" 
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={42} strokeWidth={1.5} />
              </div>
              <h4>Your basket is empty</h4>
              <p>Explore our organic stone-ground spices, wood cold-pressed oils, and traditional staples.</p>
              <button className="btn-empty-shop" onClick={() => setIsCartOpen(false)}>
                <span>Start Shopping</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.key} className="cart-item">
                <div className="cart-item-img">
                  <img 
                    src={item.image || getFallbackImage(item.name, item.category)} 
                    alt={item.name} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(item.name, item.category);
                    }}
                  />
                </div>

                <div className="cart-item-info">
                  <div className="cart-item-title-row">
                    <h5 className="cart-item-name" title={item.name}>{item.name}</h5>
                    <button 
                      className="remove-btn" 
                      onClick={() => removeFromCart(item.key)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="cart-item-submeta">
                    {item.variant && (
                      <span className="cart-item-variant">🌿 {item.variant.label}</span>
                    )}
                    {item.quantity > 1 && (
                      <span className="cart-item-unit-price">₹{item.price} each</span>
                    )}
                  </div>

                  <div className="cart-item-bottom-row">
                    <span className="cart-item-total-price">₹{item.price * item.quantity}</span>
                    <div className="qty-control">
                      <button 
                        onClick={() => updateQty(item.key, item.quantity - 1)}
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQty(item.key, item.quantity + 1)}
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Coupon Box */}
            <div className="coupon-section">
              <div className="coupon-row">
                <Tag size={15} className="coupon-icon" />
                <input
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value); setCouponError(''); }}
                  onKeyDown={e => e.key === 'Enter' && applyCouponCode()}
                />
                <button type="button" onClick={() => applyCouponCode()}>Apply</button>
              </div>

              {!appliedCoupon && !couponError && (
                <div className="coupon-suggestion-row">
                  <span className="coupon-suggestion-label">Available:</span>
                  <button 
                    type="button" 
                    className="coupon-chip"
                    onClick={() => applyCouponCode('VENTHULIR')}
                  >
                    🏷️ VENTHULIR
                  </button>
                  <button 
                    type="button" 
                    className="coupon-chip"
                    onClick={() => applyCouponCode('WELCOME10')}
                  >
                    🏷️ WELCOME10
                  </button>
                </div>
              )}

              {couponError && <p className="coupon-error">{couponError}</p>}
              {appliedCoupon && (
                <div className="coupon-success-badge">
                  <span>✓ {appliedCoupon.label} applied!</span>
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(''); }}>Remove</button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="cart-totals">
              <div className="total-row">
                <span>Subtotal ({totalItemCount} items)</span>
                <span>₹{cartTotal}</span>
              </div>
              {discount > 0 && (
                <div className="total-row discount">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>−₹{discount}</span>
                </div>
              )}
              <div className="total-row">
                <span>Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="free-ship-badge">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="total-row grand">
                <div>
                  <span className="grand-label">Total Payable</span>
                  <span className="tax-included-note">Inclusive of all taxes</span>
                </div>
                <span className="grand-amount">₹{grandTotal}</span>
              </div>
            </div>

            {/* Primary CTA */}
            <button 
              className="checkout-cta" 
              onClick={() => onCheckout({ grandTotal, discount, appliedCoupon, shippingFee })}
            >
              <span>Proceed to Checkout • ₹{grandTotal}</span>
              <ArrowRight size={17} />
            </button>

            {/* Secondary Navigation */}
            <div className="cart-footer-sublinks">
              <a
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="btn-detailed-cart-link"
              >
                <span>View Detailed Cart &amp; Save for Later</span>
                <ArrowRight size={13} />
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="cart-trust-row">
              <div className="trust-item">
                <ShieldCheck size={13} />
                <span>100% Authentic</span>
              </div>
              <span>•</span>
              <div className="trust-item">
                <Truck size={13} />
                <span>Fast Dispatch</span>
              </div>
              <span>•</span>
              <div className="trust-item">
                <Sparkles size={13} />
                <span>Farm Direct</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
