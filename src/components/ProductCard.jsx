'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUIModal } from '@/components/Providers';
import { 
  ShoppingBag, Eye, Star, Check, Heart, ArrowRight, 
  Flame, Camera, Tag, Zap, ShieldCheck, Leaf, Sparkles,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import './ProductCard.css';

// Helper to get realistic, unique review count and rating per product
const getProductReviewCount = (p) => {
  if (p?.reviewsCount && p.reviewsCount !== 245 && p.reviewsCount !== 120) return p.reviewsCount;
  if (p?.numReviews && p.numReviews !== 245 && p.numReviews !== 120) return p.numReviews;
  const str = String(p?._id || p?.id || p?.name || 'prod');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const counts = [348, 512, 289, 417, 194, 628, 381, 275, 463, 580, 219, 395, 482, 310, 645];
  return counts[Math.abs(hash) % counts.length];
};

const getProductRating = (p) => {
  if (p?.rating && typeof p.rating === 'number') return Number(p.rating).toFixed(1);
  const str = String(p?._id || p?.id || p?.name || 'prod');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const ratings = ['4.9', '4.8', '5.0', '4.9', '4.8', '4.7', '4.9', '4.8'];
  return ratings[Math.abs(hash) % ratings.length];
};

export default function ProductCard({ product, onQuickView, onBuyNow }) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { t, isTamil, getProductName, getCategory } = useLanguage();
  const uiModal = useUIModal?.() || null;
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!product) return null;

  const price = selectedVariant?.price ?? product.price ?? 0;
  let originalPrice = selectedVariant?.originalPrice;
  if (!originalPrice) {
    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      const ratio = product.originalPrice / product.price;
      originalPrice = Math.round(price * ratio);
    } else {
      originalPrice = Math.round(price * 1.25);
    }
  }

  const savings = Math.max(0, originalPrice - price);
  const discountPercent = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const ratingVal = getProductRating(product);
  const reviewCount = getProductReviewCount(product);

  const getFallbackImg = (p) => {
    const name = (p?.name || '').toLowerCase();
    const cat = (p?.category || '').toLowerCase();
    if (name.includes('turmeric') || name.includes('manjal') || name.includes('yellow') || name.includes('turm')) return '/assets/hero/turmeric.png';
    if (name.includes('chilli') || name.includes('chili') || name.includes('red')) return '/assets/hero/chilli.png';
    if (name.includes('coriander') || name.includes('mallie')) return '/assets/hero/coriander.png';
    if (name.includes('sambar') || name.includes('masala') || name.includes('garam')) return '/assets/hero/sambar.png';
    if (name.includes('coconut')) return '/assets/hero/oil_coconut.png';
    if (name.includes('groundnut')) return '/assets/hero/oil_groundnut.png';
    if (name.includes('gingelly') || name.includes('sesame')) return '/assets/hero/oil_gingelly.png';
    if (name.includes('oil') || cat.includes('oil')) return '/assets/hero/oil_sunflower.png';
    return '/assets/hero/turmeric.png';
  };

  const rawImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);
  const imagesList = rawImages.length > 0 ? rawImages : [getFallbackImg(product)];
  const safeIndex = currentImgIndex % imagesList.length;
  const currentImage = imagesList[safeIndex] || getFallbackImg(product);
  const hasMultipleImages = imagesList.length > 1;
  const hasVariants = product.variants?.length > 0;

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || !hasMultipleImages) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // Swiped Left -> Next
        setCurrentImgIndex((prev) => (prev + 1) % imagesList.length);
      } else {
        // Swiped Right -> Prev
        setCurrentImgIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
      }
    }
    setTouchStartX(null);
  };

  // Dynamic 3-spec value proposition items
  const getProductSpecs = (p) => {
    const cat = (p?.category || '').toLowerCase();
    const name = (p?.name || '').toLowerCase();
    if (cat.includes('oil') || name.includes('oil')) {
      return [
        { icon: Zap, label: isTamil ? 'மரச்செக்கு' : 'Wood Pressed' },
        { icon: ShieldCheck, label: isTamil ? '100% தூயது' : '100% Virgin' },
        { icon: Leaf, label: isTamil ? 'குளிர்ந்த பிழிதல்' : 'Zero Heat' }
      ];
    }
    if (cat.includes('spice') || cat.includes('masala') || name.includes('powder')) {
      return [
        { icon: Zap, label: isTamil ? 'கல் அரைப்பு' : 'Stone Ground' },
        { icon: ShieldCheck, label: isTamil ? 'அசல் தரம்' : 'Single Origin' },
        { icon: Leaf, label: isTamil ? 'கலப்படமற்றது' : 'No Additives' }
      ];
    }
    return [
      { icon: Zap, label: isTamil ? 'பண்ணை நேரடி' : 'Farm Fresh' },
      { icon: ShieldCheck, label: isTamil ? '100% இயற்கை' : '100% Pure' },
      { icon: Leaf, label: isTamil ? 'பூஜ்ஜிய ரசாயனம்' : 'Zero Chemicals' }
    ];
  };

  const specs = getProductSpecs(product);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    const itemKey = addToCart(product, selectedVariant);
    setIsCartOpen(false);
    if (onBuyNow) {
      onBuyNow(product, selectedVariant, itemKey);
    } else {
      router.push(`/checkout?buyNow=${encodeURIComponent(itemKey)}`);
    }
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const handleCardNavigate = () => {
    router.push(`/products/${product._id || product.slug}`);
  };

  // Badge determination: Best Seller, Top Rated, or Custom
  const badgeType = (product.badge || '').toLowerCase();
  const isTopRated = badgeType.includes('top') || badgeType.includes('rated');

  const getBadgeLabel = () => {
    if (isTopRated) return isTamil ? 'உயர்தரம்' : 'Top Rated';
    if (isTamil) {
      if (product.tamilBadge) return product.tamilBadge;
      const b = (product.badge || '').toLowerCase();
      if (b.includes('signature') || b.includes('blend')) return 'கைமுறை கூட்டு';
      if (b.includes('traditional') || b.includes('recipe')) return 'பாரம்பரியம்';
      if (b.includes('stone') || b.includes('milled')) return 'கல் அரைப்பு';
      if (b.includes('natural') || b.includes('color')) return 'இயற்கை நிறம்';
      if (b.includes('curcumin')) return 'குர்குமின் 5.2%';
      if (b.includes('heart') || b.includes('healthy')) return 'ஆரோக்கியம்';
      if (b.includes('cold') || b.includes('wood')) return 'மரச்செக்கு';
      if (b.includes('best') || b.includes('seller')) return 'அதிக விற்பனை';
      return '100% இயற்கை';
    }
    return product.badge || 'Best Seller';
  };

  const badgeText = getBadgeLabel();
  const localizedTitle = getProductName ? getProductName(product) : product.name;
  const localizedCategory = getCategory ? getCategory(product.category) : (product.category || 'Farm Harvest');

  return (
    <div className="product-card" onClick={handleCardNavigate} style={{ cursor: 'pointer' }}>
      
      {/* ── Top Media Showcase Stage ── */}
      <div 
        className="product-card-media"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Top-Left Badge (Best Seller or Top Rated) */}
        <div className="product-top-badge">
          {isTopRated ? (
            <span className="badge-top-rated" title={badgeText}>
              <Star size={11} fill="#ffffff" color="#ffffff" />
              <span>{badgeText}</span>
            </span>
          ) : (
            <span className="badge-best-seller" title={badgeText}>
              <Flame size={12} className="flame-icon" fill="#ffffff" color="#ffffff" />
              <span>{badgeText}</span>
            </span>
          )}
        </div>

        {/* Wishlist Floating Button (Top-Right) */}
        <button 
          className={`wishlist-toggle-btn ${liked ? 'is-liked' : ''}`}
          onClick={toggleWishlist}
          title={t('wishlist', 'Save to Wishlist')}
          type="button"
          aria-label="Wishlist"
        >
          <Heart size={16} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#64748b'} />
        </button>

        {/* Product Image */}
        <div className="product-img-box">
          <img 
            key={currentImage}
            src={currentImage} 
            alt={localizedTitle} 
            className="product-img card-img-fade" 
            loading="lazy" 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getFallbackImg(product);
            }}
          />
        </div>

        {/* Image Switcher Navigation Arrows (Visible when multiple images) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="card-img-arrow left"
              onClick={handlePrevImg}
              aria-label="Previous image"
              title="Previous photo"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="card-img-arrow right"
              onClick={handleNextImg}
              aria-label="Next image"
              title="Next photo"
            >
              <ChevronRight size={16} />
            </button>

            {/* Pagination Dots */}
            <div className="card-img-dots-bar" onClick={(e) => e.stopPropagation()}>
              {imagesList.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`card-img-dot ${dotIdx === safeIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIndex(dotIdx);
                  }}
                  title={`Photo ${dotIdx + 1} of ${imagesList.length}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom-Right Photo Count Interactive Badge */}
        {hasMultipleImages && (
          <button 
            type="button"
            className="product-photo-count clickable"
            onClick={handleNextImg}
            title="Click to view next photo"
          >
            <Camera size={11} />
            <span>{safeIndex + 1}/{imagesList.length}</span>
          </button>
        )}

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button 
            className="quick-view-action" 
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            aria-label="Quick View"
            type="button"
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* ── Product Card Body ── */}
      <div className="product-card-info">
        
        {/* Product Title */}
        <h3 className="product-title-heading" title={localizedTitle}>
          {localizedTitle}
        </h3>

        {/* Category & Rating Row (Combined for compact sleek card height) */}
        <div className="product-meta-row">
          <span className="product-category-text" title={localizedCategory}>
            {localizedCategory}
          </span>
          <div className="product-rating-row">
            <div className="rating-green-pill">
              <span className="rating-val">{ratingVal}</span>
              <Star size={9} fill="#ffffff" color="#ffffff" />
            </div>
            <span className="rating-review-count">({reviewCount})</span>
          </div>
        </div>

        {/* Pricing Row: Current Price + M.R.P. + Discount Tag */}
        <div className="product-pricing-row">
          <div className="price-main-group">
            <span className="price-current">₹{price.toLocaleString()}</span>
            {originalPrice > price && (
              <span className="price-mrp">
                M.R.P.: <span className="mrp-strike">₹{originalPrice.toLocaleString()}</span>
              </span>
            )}
          </div>

          {discountPercent > 0 && (
            <span className="discount-tag-pill">
              <Tag size={10} />
              <span>{discountPercent}% off</span>
            </span>
          )}
        </div>

        {/* Save Money Pill */}
        {savings > 0 && (
          <div className="savings-highlight-pill">
            <span className="savings-dot">●</span>
            <span>Save ₹{savings.toLocaleString()}</span>
          </div>
        )}

        {/* Variant Weight Selector (if available) */}
        {hasVariants && (
          <div className="product-variant-group">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.label === v.label;
              return (
                <button
                  key={v.label}
                  className={`variant-option-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedVariant(v); 
                  }}
                  type="button"
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 3-Feature Specification Micro-Badges */}
        <div className="product-specs-row">
          {specs.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className={`spec-item spec-item-${idx + 1}`}>
                <IconComponent size={14} className="spec-icon" />
                <span className="spec-label">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Action Button Cluster (Add to Cart + High-Converting Buy Now) */}
        <div className="product-button-cluster">
          <button 
            className={`btn-add-cart ${added ? 'added-state' : ''}`} 
            onClick={handleAdd}
            type="button"
            title={t('addToCart', 'Add to Cart')}
          >
            {added ? (
              <>
                <Check size={14} />
                <span className="btn-cart-text">{t('addedToCart', 'Added')}</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span className="btn-cart-text">{t('addToCart', 'Add')}</span>
              </>
            )}
          </button>

          <button 
            className="btn-buy-instant" 
            onClick={handleBuyNow}
            type="button"
          >
            <div className="buy-btn-content">
              <Zap size={14} className="bolt-icon" fill="#facc15" color="#facc15" />
              <span>{t('buyNow', 'Buy Now')}</span>
            </div>
            <div className="buy-arrow-circle">
              <ArrowRight size={12} />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
