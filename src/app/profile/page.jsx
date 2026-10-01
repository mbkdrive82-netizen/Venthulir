'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  User, 
  Heart, 
  ShoppingCart, 
  Package, 
  HelpCircle, 
  LogOut,
  MapPin,
  Phone,
  Edit3,
  Plus,
  Minus,
  ChevronRight,
  Trash2,
  MessageCircle,
  Truck,
  Leaf,
  Star,
  Bell,
  Search,
  CheckCircle2,
  Check,
  AlertCircle,
  FileText,
  RotateCcw,
  Building2,
  Lock,
  X
} from 'lucide-react';
import './ProfilePage.css';

function ProfileContent() {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { cartItems, updateQty, removeFromCart, cartTotal, addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab from query param (defaults to 'profile')
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // ── Tab 1: Profile Information State ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    gender: 'Male',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // ── Tab 2: Manage Addresses State ──
  const [addresses, setAddresses] = useState([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    locality: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zipCode: '',
    type: 'Home',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState('');

  // ── Tab 3: Orders State (Flipkart Style) ──
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  // ── Tab 4: Wishlist State ──
  const [wishlistProducts, setWishlistProducts] = useState([
    { id: '6aba0cd61452a8680653118f', name: 'Wood Cold-Pressed Gingelly Sesame Oil', price: 340, mrp: 399, rating: 4.8, reviews: 142, image: '/assets/hero/oil_gingelly.png', inStock: true },
    { id: '6aba0cd61452a86806531192', name: 'High-Curcumin Pure Turmeric Powder', price: 140, mrp: 165, rating: 4.9, reviews: 89, image: '/assets/hero/turmeric.png', inStock: true },
    { id: '6aba0cd61452a86806531196', name: 'Royal Chettinad Garam Masala Blend', price: 180, mrp: 210, rating: 4.7, reviews: 64, image: '/assets/hero/garam_masala.png', inStock: true }
  ]);
  const [catalogProducts, setCatalogProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products?nocache=true&limit=100')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.products && Array.isArray(data.products)) {
          setCatalogProducts(data.products);
        } else if (Array.isArray(data)) {
          setCatalogProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  const getProductStock = (item) => {
    const matched = catalogProducts.find(p => 
      (p._id && (p._id === item.productId || p._id === item.product || p._id === item._id || p._id === item.id)) ||
      (p.id && (p.id === item.productId || p.id === item.product || p.id === item._id || p.id === item.id)) ||
      (p.name && item.name && p.name.trim().toLowerCase() === item.name.trim().toLowerCase()) ||
      (p.slug && item.slug && p.slug === item.slug)
    );
    const stock = matched?.currentStock !== undefined 
      ? matched.currentStock 
      : (item.currentStock !== undefined ? item.currentStock : (item.inStock === false ? 0 : 50));
    const isOutOfStock = stock <= 0 || matched?.inStock === false || item.inStock === false;
    const isLowStock = !isOutOfStock && stock > 0 && stock <= 5;
    return { stock, isOutOfStock, isLowStock };
  };

  // ── Tab 5: Support & FAQ State ──
  const [openFaq, setOpenFaq] = useState(0);
  const [callbackRequested, setCallbackRequested] = useState(false);

  // ── Tab 6: Bulk Inquiries State ──
  const [bulkForm, setBulkForm] = useState({ name: '', phone: '', item: 'Wood Cold-Pressed Oils (15L Tins)', qty: '5 Tins', notes: '' });
  const [bulkSubmitted, setBulkSubmitted] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('venthulir_token')) {
      router.push('/login?redirect=/profile');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  // Populate user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
      });

      const userKey = user._id || user.id || user.email || 'guest';
      const localSaved = typeof window !== 'undefined' ? localStorage.getItem(`venthulir_addresses_${userKey}`) : null;
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            setAddresses(parsed);
            return;
          }
        } catch {}
      }

      const initialAddresses = [];
      if (user.deliveryAddress?.address && user.deliveryAddress.address.trim() !== '') {
        initialAddresses.push({
          name: user.name || 'Primary Delivery',
          phone: user.phone || '',
          address: user.deliveryAddress.address || '',
          locality: '',
          city: user.deliveryAddress.city || 'Chennai',
          state: user.deliveryAddress.state || 'Tamil Nadu',
          zipCode: user.deliveryAddress.zipCode || '600001',
          type: 'Home',
          isDefault: true
        });
      } else if (Array.isArray(user.addresses) && user.addresses.length > 0) {
        user.addresses.forEach(addr => initialAddresses.push(addr));
      }

      setAddresses(initialAddresses);
    }
  }, [user]);

  // Fetch orders
  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
      if (!token) return;
      const res = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `/profile?tab=${tabId}`);
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone
        })
      });

      if (res.ok) {
        updateUser({ name: profileForm.name, phone: profileForm.phone });
        setProfileSuccessMsg('Profile details updated successfully!');
        setIsEditingProfile(false);
      } else {
        setProfileErrorMsg('Failed to update profile. Please try again.');
      }
    } catch {
      setProfileErrorMsg('Network error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Address Save
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);

    try {
      let updatedList = [...addresses];
      if (addressForm.isDefault) {
        updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
      }

      if (editingAddressIndex !== null) {
        updatedList[editingAddressIndex] = addressForm;
      } else {
        updatedList.push(addressForm);
      }

      setAddresses(updatedList);

      const userKey = user?._id || user?.id || user?.email || 'guest';
      if (typeof window !== 'undefined') {
        localStorage.setItem(`venthulir_addresses_${userKey}`, JSON.stringify(updatedList));
      }

      const primary = updatedList.find(a => a.isDefault) || updatedList[0];
      if (primary) {
        const token = localStorage.getItem('venthulir_token');
        await fetch('/api/auth/address', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            address: primary.address + (primary.locality ? `, ${primary.locality}` : ''),
            city: primary.city,
            state: primary.state,
            zipCode: primary.zipCode
          })
        });
      }

      setAddressSuccessMsg('Address saved successfully!');
      setIsAddressFormOpen(false);
      setEditingAddressIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = (index) => {
    if (confirm('Are you sure you want to remove this address?')) {
      const updated = addresses.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some(a => a.isDefault)) {
        updated[0].isDefault = true;
      }
      setAddresses(updated);
      const userKey = user?._id || user?.id || user?.email || 'guest';
      if (typeof window !== 'undefined') {
        localStorage.setItem(`venthulir_addresses_${userKey}`, JSON.stringify(updated));
      }
    }
  };

  const handleOpenAddAddress = () => {
    setAddressForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      locality: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '',
      type: 'Home',
      isDefault: addresses.length === 0
    });
    setEditingAddressIndex(null);
    setIsAddressFormOpen(true);
  };

  const handleOpenEditAddress = (addr, index) => {
    setAddressForm(addr);
    setEditingAddressIndex(index);
    setIsAddressFormOpen(true);
  };

  // Buy Again
  const handleBuyAgain = (orderItem) => {
    addToCart({
      _id: orderItem.product || 'prod',
      name: orderItem.name,
      price: orderItem.price,
      imageUrl: orderItem.imageUrl || '/assets/hero/turmeric.png',
      images: [orderItem.imageUrl || '/assets/hero/turmeric.png'],
      inStock: true
    }, { label: orderItem.variant || 'Standard', price: orderItem.price });
    setIsCartOpen(true);
  };

  // Move Wishlist item to Cart
  const handleMoveWishlistToCart = (prod) => {
    addToCart({
      _id: prod.id,
      name: prod.name,
      price: prod.price,
      imageUrl: prod.image,
      images: [prod.image],
      inStock: true
    });
    setWishlistProducts(prev => prev.filter(p => p.id !== prod.id));
    setIsCartOpen(true);
  };

  // Filter Orders
  const filteredOrders = orders.filter(o => {
    const status = (o.orderStatus || o.status || 'Placed').toLowerCase();
    const matchFilter = 
      orderFilter === 'All' ||
      (orderFilter === 'Delivered' && status.includes('deliver')) ||
      (orderFilter === 'In Transit' && (status.includes('transit') || status.includes('ship'))) ||
      (orderFilter === 'Processing' && (status.includes('process') || status.includes('placed'))) ||
      (orderFilter === 'Cancelled' && status.includes('cancel'));

    const search = orderSearch.trim().toLowerCase();
    const matchSearch = !search || 
      (o._id && o._id.toLowerCase().includes(search)) ||
      (o.items && o.items.some(i => i.name?.toLowerCase().includes(search)));

    return matchFilter && matchSearch;
  });

  const userInitial = (user?.name || user?.email || 'V').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="fk-account-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 12px', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#1B5E2F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#555555', fontSize: '0.9rem', fontWeight: 600 }}>Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fk-account-root">
      <div className="fk-account-container">

        {/* ══════════════════════════════════════════════════════
            LEFT SIDEBAR (Flipkart Style)
            ══════════════════════════════════════════════════════ */}
        <aside className="fk-sidebar">
          
          {/* Hello User Card */}
          <div className="fk-user-card">
            <div className="fk-avatar">
              {userInitial}
            </div>
            <div className="fk-user-details">
              <div className="fk-user-hello">Hello,</div>
              <div className="fk-user-name">{user?.name || 'Valued Patron'}</div>
            </div>
          </div>

          {/* Navigation Card */}
          <div className="fk-nav-card">
            
            {/* MY ORDERS Section */}
            <button 
              type="button" 
              onClick={() => handleTabChange('orders')}
              className={`fk-primary-item ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <div className="fk-primary-item-left">
                <Package size={20} />
                <span>MY ORDERS</span>
              </div>
              <ChevronRight size={16} color="#878787" />
            </button>

            {/* ACCOUNT SETTINGS */}
            <div className="fk-nav-section">
              <div className="fk-section-title">
                <User size={18} />
                <span>ACCOUNT SETTINGS</span>
              </div>

              <button 
                type="button" 
                onClick={() => handleTabChange('profile')}
                className={`fk-sub-item ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <span>Profile Information</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleTabChange('addresses')}
                className={`fk-sub-item ${activeTab === 'addresses' ? 'active' : ''}`}
              >
                <span>Manage Addresses</span>
                {addresses.length > 0 && <span className="fk-badge-pill">{addresses.length}</span>}
              </button>

              <button 
                type="button" 
                onClick={() => handleTabChange('pan')}
                className={`fk-sub-item ${activeTab === 'pan' ? 'active' : ''}`}
              >
                <span>PAN Card Information</span>
              </button>
            </div>

            {/* MY STUFF */}
            <div className="fk-nav-section">
              <div className="fk-section-title">
                <Heart size={18} />
                <span>MY STUFF</span>
              </div>

              <button 
                type="button" 
                onClick={() => handleTabChange('cart')}
                className={`fk-sub-item ${activeTab === 'cart' ? 'active' : ''}`}
              >
                <span>My Cart</span>
                <span className="fk-badge-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>{cartItems.length}</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleTabChange('wishlist')}
                className={`fk-sub-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              >
                <span>My Wishlist</span>
                <span className="fk-badge-pill">{wishlistProducts.length}</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleTabChange('reviews')}
                className={`fk-sub-item ${activeTab === 'reviews' ? 'active' : ''}`}
              >
                <span>My Reviews &amp; Ratings</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleTabChange('notifications')}
                className={`fk-sub-item ${activeTab === 'notifications' ? 'active' : ''}`}
              >
                <span>All Notifications</span>
              </button>
            </div>

            {/* CUSTOMER SUPPORT */}
            <div className="fk-nav-section">
              <div className="fk-section-title">
                <HelpCircle size={18} />
                <span>CUSTOMER SUPPORT</span>
              </div>

              <button 
                type="button" 
                onClick={() => handleTabChange('help')}
                className={`fk-sub-item ${activeTab === 'help' ? 'active' : ''}`}
              >
                <span>24x7 Help Center</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleTabChange('bulk')}
                className={`fk-sub-item ${activeTab === 'bulk' ? 'active' : ''}`}
              >
                <span>Bulk &amp; Wholesale</span>
              </button>
            </div>

            {/* Desktop Log Out */}
            <div style={{ borderTop: '1px solid #f0f0f0' }}>
              <button 
                type="button" 
                onClick={() => {
                  if (confirm('Are you sure you want to log out from Venthulir?')) {
                    logout();
                    router.push('/login');
                  }
                }}
                className="fk-logout-btn"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

          </div>

          {/* Quick Assurance Box */}
          <div style={{ background: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08)', borderRadius: '4px', padding: '14px 16px', fontSize: '0.8rem', color: '#555555', lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, color: '#1B5E2F', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={14} />
              <span>100% Pure Organic Guarantee</span>
            </div>
            Direct traditional wood cold-pressed extraction with door express delivery across India.
          </div>

        </aside>

        {/* ══════════════════════════════════════════════════════
            MOBILE ACCOUNT HUB HEADER (Flipkart & Amazon App Style)
            ══════════════════════════════════════════════════════ */}
        <div className="fk-mobile-account-hub">
          {/* User Banner */}
          <div className="fk-mobile-user-card">
            <div className="fk-avatar">
              {userInitial}
            </div>
            <div className="fk-mobile-user-details">
              <div className="fk-user-hello">Hello,</div>
              <div className="fk-user-name">{user?.name || 'Valued Patron'}</div>
              <div className="fk-mobile-user-email">{user?.email || user?.phone || 'customer@venthulir.com'}</div>
            </div>
            <button 
              type="button" 
              onClick={() => {
                if (confirm('Are you sure you want to log out?')) {
                  logout();
                  router.push('/login');
                }
              }}
              className="fk-mobile-logout-btn"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* 4-Card Quick Action Grid (Flipkart / Amazon Mobile Standard) */}
          <div className="fk-mobile-quick-grid">
            <button 
              type="button"
              onClick={() => handleTabChange('orders')}
              className={`fk-quick-tile ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <div className="fk-quick-tile-icon orders">
                <Package size={20} />
              </div>
              <span className="fk-quick-tile-label">Orders</span>
              {orders.length > 0 && <span className="fk-quick-tile-badge">{orders.length}</span>}
            </button>

            <button 
              type="button"
              onClick={() => handleTabChange('cart')}
              className={`fk-quick-tile ${activeTab === 'cart' ? 'active' : ''}`}
            >
              <div className="fk-quick-tile-icon cart">
                <ShoppingCart size={20} />
              </div>
              <span className="fk-quick-tile-label">My Cart</span>
              {cartItems.length > 0 && <span className="fk-quick-tile-badge green">{cartItems.length}</span>}
            </button>

            <button 
              type="button"
              onClick={() => handleTabChange('wishlist')}
              className={`fk-quick-tile ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <div className="fk-quick-tile-icon wishlist">
                <Heart size={20} />
              </div>
              <span className="fk-quick-tile-label">Wishlist</span>
              {wishlistProducts.length > 0 && <span className="fk-quick-tile-badge red">{wishlistProducts.length}</span>}
            </button>

            <button 
              type="button"
              onClick={() => handleTabChange('help')}
              className={`fk-quick-tile ${activeTab === 'help' ? 'active' : ''}`}
            >
              <div className="fk-quick-tile-icon help">
                <HelpCircle size={20} />
              </div>
              <span className="fk-quick-tile-label">24x7 Help</span>
            </button>
          </div>

          {/* Horizontal Scrollable Tabs Strip */}
          <div className="fk-mobile-tabs-strip">
            <button 
              type="button" 
              onClick={() => handleTabChange('profile')} 
              className={`fk-mobile-tab-chip ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={13} />
              <span>Personal Info</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleTabChange('cart')} 
              className={`fk-mobile-tab-chip ${activeTab === 'cart' ? 'active' : ''}`}
            >
              <ShoppingCart size={13} />
              <span>My Cart ({cartItems.length})</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleTabChange('orders')} 
              className={`fk-mobile-tab-chip ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Package size={13} />
              <span>Orders ({orders.length})</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleTabChange('addresses')} 
              className={`fk-mobile-tab-chip ${activeTab === 'addresses' ? 'active' : ''}`}
            >
              <MapPin size={13} />
              <span>Addresses ({addresses.length})</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleTabChange('wishlist')} 
              className={`fk-mobile-tab-chip ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <Heart size={13} />
              <span>Wishlist ({wishlistProducts.length})</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleTabChange('reviews')} 
              className={`fk-mobile-tab-chip ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              <Star size={13} />
              <span>Reviews</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleTabChange('notifications')} 
              className={`fk-mobile-tab-chip ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell size={13} />
              <span>Alerts</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleTabChange('bulk')} 
              className={`fk-mobile-tab-chip ${activeTab === 'bulk' ? 'active' : ''}`}
            >
              <Building2 size={13} />
              <span>Bulk Order</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT MAIN PANEL (Flipkart Style)
            ══════════════════════════════════════════════════════ */}
        <main className="fk-main-panel">

          {/* ── TAB 1: PROFILE INFORMATION ── */}
          {activeTab === 'profile' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">Personal Information</h3>
                {!isEditingProfile && (
                  <button type="button" onClick={() => setIsEditingProfile(true)} className="fk-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {profileSuccessMsg && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '10px 14px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, marginBottom: '16px' }}>
                  ✓ {profileSuccessMsg}
                </div>
              )}
              {profileErrorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, marginBottom: '16px' }}>
                  ⚠️ {profileErrorMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                
                {/* Name & Gender */}
                <div className="fk-section-block">
                  <div className="fk-inputs-row">
                    <div className="fk-input-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        required
                        disabled={!isEditingProfile}
                        className="fk-text-input"
                        value={profileForm.name} 
                        onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Your Gender</label>
                    <div className="fk-gender-group">
                      {['Male', 'Female'].map((g) => (
                        <label key={g} className="fk-radio-label">
                          <input 
                            type="radio" 
                            name="gender" 
                            disabled={!isEditingProfile}
                            value={g} 
                            checked={profileForm.gender === g}
                            onChange={() => setProfileForm(p => ({ ...p, gender: g }))}
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button type="submit" disabled={savingProfile} className="fk-btn-save">
                        {savingProfile ? 'Saving...' : 'SAVE'}
                      </button>
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="fk-btn-cancel">
                        CANCEL
                      </button>
                    </div>
                  )}
                </div>

                {/* Email Address Section */}
                <div className="fk-section-block">
                  <div className="fk-block-title">
                    <span>Email Address</span>
                    <span className="fk-badge-verified">
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
                    </span>
                  </div>
                  <div className="fk-inputs-row">
                    <div className="fk-input-group">
                      <input 
                        type="email" 
                        disabled
                        className="fk-text-input"
                        value={user?.email || 'customer@example.com'} 
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Number Section */}
                <div className="fk-section-block">
                  <div className="fk-block-title">
                    <span>Mobile Number</span>
                    <span className="fk-badge-verified">
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
                    </span>
                  </div>
                  <div className="fk-inputs-row">
                    <div className="fk-input-group">
                      <input 
                        type="tel" 
                        disabled={!isEditingProfile}
                        className="fk-text-input"
                        placeholder="+91 98765 43210"
                        value={profileForm.phone} 
                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

              </form>

              {/* Password & Security Card */}
              <div className="fk-security-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#edf7ee', color: '#1B5E2F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={16} />
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 2px', fontSize: '0.92rem', fontWeight: 800, color: '#0f3d2a' }}>Login &amp; Password</h5>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Keep your account secured with a strong password</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="fk-link-btn"
                  >
                    {showPasswordChange ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {showPasswordChange && (
                  <form style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={(e) => {
                    e.preventDefault();
                    if (passwordForm.newPass !== passwordForm.confirmPass) {
                      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
                      return;
                    }
                    setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
                    setPasswordForm({ current: '', newPass: '', confirmPass: '' });
                    setTimeout(() => setShowPasswordChange(false), 2000);
                  }}>
                    {passwordMsg.text && (
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: passwordMsg.type === 'success' ? '#2e7d32' : '#d32f2f' }}>
                        {passwordMsg.text}
                      </div>
                    )}
                    <div className="fk-inputs-row">
                      <div className="fk-input-group">
                        <label>New Password</label>
                        <input type="password" required className="fk-text-input" placeholder="Min 6 characters" value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} />
                      </div>
                      <div className="fk-input-group">
                        <label>Confirm Password</label>
                        <input type="password" required className="fk-text-input" placeholder="Re-type password" value={passwordForm.confirmPass} onChange={e => setPasswordForm(p => ({ ...p, confirmPass: e.target.value }))} />
                      </div>
                    </div>
                    <button type="submit" className="fk-btn-save" style={{ width: 'fit-content', marginTop: '6px' }}>
                      UPDATE PASSWORD
                    </button>
                  </form>
                )}
              </div>

              {/* Flipkart Standard FAQ Help Block */}
              <div className="fk-faq-section">
                <h4>FAQS</h4>
                <div className="fk-faq-item">
                  <p className="fk-faq-q">What happens when I update my email address (or mobile number)?</p>
                  <p className="fk-faq-a">Your login email id (or mobile number) changes, likewise. You will receive all your transactional and order tracking emails on the updated address.</p>
                </div>
                <div className="fk-faq-item">
                  <p className="fk-faq-q">When will my Venthulir account be updated with the new details?</p>
                  <p className="fk-faq-a">It happens immediately after you save your profile. Future farm shipment notices and invoices will be sent to the updated details.</p>
                </div>
              </div>

            </div>
          )}

          {/* ── TAB 2: MANAGE ADDRESSES ── */}
          {activeTab === 'addresses' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">Manage Addresses</h3>
              </div>

              {addressSuccessMsg && (
                <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', padding: '8px 12px', borderRadius: '3px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '16px' }}>
                  ✓ {addressSuccessMsg}
                </div>
              )}

              {/* Add New Address Bar */}
              {!isAddressFormOpen && (
                <div className="fk-add-address-bar" onClick={handleOpenAddAddress}>
                  <Plus size={16} />
                  <span>ADD A NEW ADDRESS</span>
                </div>
              )}

              {/* Inline Address Form (Flipkart Style) */}
              {isAddressFormOpen && (
                <div className="fk-inline-form-card">
                  <h4 style={{ margin: '0 0 16px', fontSize: '0.92rem', fontWeight: 700, color: '#1B5E2F' }}>
                    {editingAddressIndex !== null ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
                  </h4>

                  <form onSubmit={handleSaveAddress}>
                    <div className="fk-form-grid-2">
                      <div className="fk-input-group">
                        <label>Name *</label>
                        <input type="text" required className="fk-text-input" value={addressForm.name} onChange={e => setAddressForm(a => ({ ...a, name: e.target.value }))} />
                      </div>
                      <div className="fk-input-group">
                        <label>10-digit mobile number *</label>
                        <input type="tel" required className="fk-text-input" placeholder="10-digit number" value={addressForm.phone} onChange={e => setAddressForm(a => ({ ...a, phone: e.target.value }))} />
                      </div>
                    </div>

                    <div className="fk-form-grid-2">
                      <div className="fk-input-group">
                        <label>Pincode *</label>
                        <input 
                          type="text" 
                          required 
                          className="fk-text-input" 
                          placeholder="6-digit pincode" 
                          value={addressForm.zipCode} 
                          onChange={e => {
                            const val = e.target.value;
                            setAddressForm(a => ({ ...a, zipCode: val }));
                            if (val.length === 6 && val.startsWith('60')) setAddressForm(a => ({ ...a, city: 'Chennai', state: 'Tamil Nadu' }));
                            else if (val.length === 6 && val.startsWith('64')) setAddressForm(a => ({ ...a, city: 'Coimbatore', state: 'Tamil Nadu' }));
                            else if (val.length === 6 && val.startsWith('62')) setAddressForm(a => ({ ...a, city: 'Madurai', state: 'Tamil Nadu' }));
                          }} 
                        />
                      </div>
                      <div className="fk-input-group">
                        <label>Locality</label>
                        <input type="text" className="fk-text-input" placeholder="Locality" value={addressForm.locality} onChange={e => setAddressForm(a => ({ ...a, locality: e.target.value }))} />
                      </div>
                    </div>

                    <div className="fk-input-group" style={{ marginBottom: '14px' }}>
                      <label>Address (Area and Street) *</label>
                      <textarea rows={2} required className="fk-text-input" style={{ resize: 'vertical' }} value={addressForm.address} onChange={e => setAddressForm(a => ({ ...a, address: e.target.value }))} />
                    </div>

                    <div className="fk-form-grid-2">
                      <div className="fk-input-group">
                        <label>City / District / Town *</label>
                        <input type="text" required className="fk-text-input" value={addressForm.city} onChange={e => setAddressForm(a => ({ ...a, city: e.target.value }))} />
                      </div>
                      <div className="fk-input-group">
                        <label>State *</label>
                        <select className="fk-text-input" value={addressForm.state} onChange={e => setAddressForm(a => ({ ...a, state: e.target.value }))}>
                          <option>Tamil Nadu</option>
                          <option>Karnataka</option>
                          <option>Kerala</option>
                          <option>Andhra Pradesh</option>
                          <option>Telangana</option>
                          <option>Maharashtra</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.78rem', color: '#878787', fontWeight: 600 }}>Address Type</label>
                      <div className="fk-gender-group">
                        {['Home', 'Work'].map((t) => (
                          <label key={t} className="fk-radio-label">
                            <input 
                              type="radio" 
                              name="addrType" 
                              value={t} 
                              checked={addressForm.type === t}
                              onChange={() => setAddressForm(a => ({ ...a, type: t }))}
                            />
                            <span>{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" disabled={savingAddress} className="fk-btn-save">
                        {savingAddress ? 'SAVING...' : 'SAVE'}
                      </button>
                      <button type="button" onClick={() => setIsAddressFormOpen(false)} className="fk-btn-cancel">
                        CANCEL
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Saved Addresses List */}
              {addresses.length === 0 && !isAddressFormOpen ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: '#fcfcfc', border: '1px dashed #cbd5e1', borderRadius: '4px', margin: '14px 0' }}>
                  <MapPin size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: '14px' }}>No saved addresses yet</div>
                  <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '4px 0 14px' }}>Add your delivery address for fast 1-click order checkout</p>
                  <button type="button" onClick={handleOpenAddAddress} className="fk-btn-save" style={{ width: 'auto', padding: '8px 18px', fontSize: '12px' }}>
                    + ADD YOUR ADDRESS
                  </button>
                </div>
              ) : (
                <div className="fk-address-list">
                  {addresses.map((addr, idx) => (
                    <div key={idx} className={`fk-address-card ${addr.isDefault ? 'is-default' : ''}`}>
                      <div className="fk-addr-header">
                        <span className={`fk-addr-badge ${addr.type.toLowerCase()}`}>
                          {addr.type}
                        </span>
                        <div className="fk-addr-actions">
                          <button type="button" onClick={() => handleOpenEditAddress(addr, idx)} className="fk-link-btn">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteAddress(idx)} className="fk-link-btn" style={{ color: '#d32f2f' }}>
                            Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.94rem', color: '#212121' }}>{addr.name}</strong>
                        <strong style={{ fontSize: '0.9rem', color: '#212121' }}>{addr.phone}</strong>
                      </div>

                      <p className="fk-addr-text">
                        {addr.address}{addr.locality ? `, ${addr.locality}` : ''}, {addr.city}, {addr.state} - <strong style={{ color: '#212121' }}>{addr.zipCode}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: MY ORDERS ── */}
          {activeTab === 'orders' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">My Orders</h3>
              </div>

              {/* Search bar */}
              <div className="fk-orders-search-row">
                <div className="fk-orders-search-box">
                  <Search size={16} color="#878787" />
                  <input 
                    type="text" 
                    placeholder="Search your orders here..." 
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Chips */}
              <div className="fk-orders-filter-chips">
                {['All', 'Delivered', 'In Transit', 'Processing', 'Cancelled'].map(f => (
                  <button 
                    key={f}
                    type="button"
                    onClick={() => setOrderFilter(f)}
                    className={`fk-chip-btn ${orderFilter === f ? 'active' : ''}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ margin: '0 auto 10px', width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: '#1B5E2F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ color: '#878787', fontSize: '0.86rem' }}>Fetching your orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #e0e0e0', borderRadius: '4px' }}>
                  <Package size={42} color="#878787" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#212121' }}>No orders found</h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: '#878787' }}>Looks like you haven&apos;t placed any order in this category.</p>
                  <Link href="/products" className="fk-btn-save" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    EXPLORE FRESH PRODUCTS
                  </Link>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const status = order.orderStatus || order.status || 'Placed';
                  const statusLower = status.toLowerCase();
                  const isDelivered = statusLower.includes('deliver');
                  const isCancelled = statusLower.includes('cancel');
                  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent';

                  return (
                    <div key={order._id || order.id} className="fk-order-row-card">
                      
                      {/* Product Thumbnail */}
                      <img 
                        src={order.items?.[0]?.imageUrl || '/assets/hero/turmeric.png'} 
                        alt={order.items?.[0]?.name || 'Product'} 
                        className="fk-order-thumb"
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/hero/turmeric.png'; }}
                      />

                      {/* Product Info */}
                      <div className="fk-order-info">
                        <h5>{order.items?.[0]?.name || 'Organic Harvest Staple'}</h5>
                        <p>{order.items?.length > 1 ? `+ ${order.items.length - 1} more item(s)` : (order.items?.[0]?.variant || 'Pure Grade')}</p>
                        <div style={{ fontSize: '0.74rem', color: '#878787', marginTop: '4px' }}>
                          Order ID: #{String(order._id || order.id).slice(-8).toUpperCase()}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="fk-order-price">
                        ₹{order.totalAmount || 0}
                      </div>

                      {/* Status & Actions */}
                      <div className="fk-order-status-block">
                        <div className="fk-status-dot-row">
                          <div className={`fk-dot ${isDelivered ? 'green' : isCancelled ? 'red' : 'orange'}`} />
                          <span style={{ color: isDelivered ? '#26a541' : isCancelled ? '#d32f2f' : '#212121' }}>
                            {isDelivered ? `Delivered on ${dateStr}` : isCancelled ? `Cancelled` : `In Transit`}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#878787' }}>
                          Your item has been {isDelivered ? 'delivered' : 'dispatched'}
                        </div>

                        <div className="fk-order-actions-bar">
                          <button 
                            type="button" 
                            onClick={() => setSelectedOrderForTracking(order)}
                            className="fk-link-btn"
                            style={{ fontSize: '0.8rem' }}
                          >
                            Track Package
                          </button>
                          {order.items?.[0] && (
                            <button 
                              type="button" 
                              onClick={() => handleBuyAgain(order.items[0])}
                              className="fk-link-btn"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Buy Again
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TAB 4: MY CART / BASKET ── */}
          {activeTab === 'cart' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">My Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h3>
                {cartItems.length > 0 && (
                  <button type="button" onClick={() => setIsCartOpen(true)} className="fk-link-btn">
                    <ShoppingCart size={14} />
                    <span>Open Cart Drawer</span>
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="fk-empty-box">
                  <div className="fk-empty-icon-circle">
                    <ShoppingCart size={28} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f3d2a' }}>Your Cart is Empty</h4>
                  <p style={{ margin: '0 0 18px', fontSize: '0.86rem', color: '#64748b', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                    Explore our authentic wood cold-pressed oils and organic single-origin spices.
                  </p>
                  <Link href="/products" className="fk-btn-save" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    SHOP FRESH HARVEST
                  </Link>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cartItems.map((item) => {
                      const { isOutOfStock, isLowStock, stock } = getProductStock(item);

                      return (
                        <div key={item.key || item._id} className="fk-cart-item-card">
                          <div className="fk-cart-item-main">
                            <div className="fk-cart-thumb-box">
                              <img 
                                src={item.image || item.imageUrl || '/assets/hero/turmeric.png'} 
                                alt={item.name} 
                                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/hero/turmeric.png'; }}
                              />
                            </div>

                            <div className="fk-cart-item-info">
                              <h5 className="fk-cart-item-title" title={item.name}>
                                {item.name}
                              </h5>
                              <div className="fk-cart-item-meta">
                                <span style={{ fontWeight: 700, color: '#0f3d2a' }}>₹{item.price} each</span>
                                {item.variant?.label && (
                                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 750, padding: '1px 6px', borderRadius: '4px' }}>
                                    {item.variant.label}
                                  </span>
                                )}
                              </div>

                              {/* In-Place Real-World Stock Notification */}
                              {isOutOfStock ? (
                                <div className="fk-stock-pill out-of-stock">
                                  <X size={11} strokeWidth={3} />
                                  <span>Out of Stock</span>
                                </div>
                              ) : isLowStock ? (
                                <div className="fk-stock-pill low-stock">
                                  <AlertCircle size={11} />
                                  <span>Only {stock} left</span>
                                </div>
                              ) : (
                                <div className="fk-stock-pill in-stock">
                                  <Check size={11} strokeWidth={3} />
                                  <span>In Stock</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="fk-cart-item-actions">
                            <div className="fk-cart-item-actions-left">
                              <div className="fk-cart-stepper">
                                <button 
                                  type="button" 
                                  onClick={() => updateQty(item.key, item.quantity - 1)}
                                  disabled={isOutOfStock}
                                  title="Decrease quantity"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span>{item.quantity}</span>
                                <button 
                                  type="button" 
                                  onClick={() => updateQty(item.key, item.quantity + 1)}
                                  disabled={isOutOfStock || (isLowStock && item.quantity >= stock)}
                                  title="Increase quantity"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <button 
                                type="button" 
                                onClick={() => removeFromCart(item.key)}
                                className="fk-cart-remove-btn"
                                title="Remove item"
                                aria-label="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="fk-cart-item-price">
                              <strong>₹{item.price * item.quantity}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cart Total & Checkout Bar */}
                  <div className="fk-cart-bottom-bar">
                    <div className="fk-cart-bottom-info">
                      <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.5px' }}>
                        Total Basket Amount
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1B5E2F' }}>
                        ₹{cartTotal}
                      </div>
                    </div>

                    <Link 
                      href="/checkout"
                      className="fk-btn-save fk-cart-checkout-btn"
                      style={{ textDecoration: 'none', padding: '12px 28px', fontSize: '0.94rem', letterSpacing: '0.3px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>PROCEED TO CHECKOUT</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: MY WISHLIST ── */}
          {activeTab === 'wishlist' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">My Wishlist ({wishlistProducts.length})</h3>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="fk-empty-box">
                  <div className="fk-empty-icon-circle">
                    <Heart size={28} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f3d2a' }}>Your Wishlist is Empty</h4>
                  <p style={{ margin: '0 0 18px', fontSize: '0.86rem', color: '#64748b', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                    Explore our authentic range of cold-pressed oils and single-origin spices.
                  </p>
                  <Link href="/products" className="fk-btn-save" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    BROWSE CATALOG
                  </Link>
                </div>
              ) : (
                <div>
                  {wishlistProducts.map((prod) => {
                    const { isOutOfStock, isLowStock, stock } = getProductStock(prod);

                    return (
                      <div key={prod.id} className="fk-wishlist-item">
                        <div className="fk-wishlist-left">
                          <img src={prod.image} alt={prod.name} className="fk-wishlist-thumb" />
                          <div className="fk-wishlist-details">
                            <h5>{prod.name}</h5>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#878787', marginBottom: '4px' }}>
                              <span style={{ background: '#388e3c', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
                                {prod.rating} ★
                              </span>
                              <span>({prod.reviews} reviews)</span>
                            </div>
                            <div className="fk-wishlist-price-row">
                              <span className="fk-wishlist-price">₹{prod.price}</span>
                              <span className="fk-wishlist-mrp">₹{prod.mrp}</span>
                              <span className="fk-wishlist-discount">15% off</span>
                            </div>

                            {/* In-Place Real-World Stock Notification */}
                            {isOutOfStock ? (
                              <div className="fk-stock-pill out-of-stock">
                                <X size={11} strokeWidth={3} />
                                <span>Out of Stock (0 units left)</span>
                              </div>
                            ) : isLowStock ? (
                              <div className="fk-stock-pill low-stock">
                                <AlertCircle size={11} />
                                <span>Only {stock} units left in stock</span>
                              </div>
                            ) : (
                              <div className="fk-stock-pill in-stock">
                                <Check size={11} strokeWidth={3} />
                                <span>In Stock</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {isOutOfStock ? (
                            <button 
                              type="button" 
                              disabled
                              className="fk-btn-save fk-btn-disabled"
                              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                            >
                              OUT OF STOCK
                            </button>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => handleMoveWishlistToCart(prod)}
                              className="fk-btn-save"
                              style={{ padding: '8px 16px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ShoppingCart size={14} />
                              <span>MOVE TO CART</span>
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => setWishlistProducts(prev => prev.filter(p => p.id !== prod.id))}
                            style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 6: PAN & GST INFO ── */}
          {activeTab === 'pan' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">PAN Card Information</h3>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); alert('PAN Card details updated successfully!'); }} style={{ maxWidth: '440px' }}>
                <div className="fk-input-group" style={{ marginBottom: '14px', maxWidth: '100%' }}>
                  <label>PAN Card Number *</label>
                  <input type="text" required placeholder="e.g. ABCDE1234F" className="fk-text-input" style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="fk-input-group" style={{ marginBottom: '14px', maxWidth: '100%' }}>
                  <label>Full Name on PAN Card *</label>
                  <input type="text" required placeholder="Full Name as in PAN" className="fk-text-input" />
                </div>
                <div className="fk-input-group" style={{ marginBottom: '18px', maxWidth: '100%' }}>
                  <label>GSTIN (Optional for Business Invoice)</label>
                  <input type="text" placeholder="e.g. 33AAAAA0000A1Z5" className="fk-text-input" style={{ textTransform: 'uppercase' }} />
                </div>

                <button type="submit" className="fk-btn-save">
                  SAVE DETAILS
                </button>
              </form>
            </div>
          )}

          {/* ── TAB 7: 24X7 HELP CENTER ── */}
          {activeTab === 'help' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">24x7 Customer Care &amp; Help Desk</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ border: '1.5px solid #e2e8f0', padding: '18px', borderRadius: '12px', background: '#fbfdfc' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.94rem', color: '#1B5E2F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={18} color="#25d366" />
                    <span>WhatsApp Support</span>
                  </h4>
                  <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#555555', lineHeight: 1.4 }}>
                    Get fast assistance with order dispatch, payments, and product inquiries.
                  </p>
                  <a 
                    href="https://wa.me/918778476414?text=Hello%20Venthulir%20Team%2C%20I%20need%20help%20with%20my%20order." 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="fk-btn-save"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '9px 18px' }}
                  >
                    <MessageCircle size={14} />
                    <span>CHAT ON WHATSAPP</span>
                  </a>
                </div>

                <div style={{ border: '1.5px solid #e2e8f0', padding: '18px', borderRadius: '12px', background: '#fbfdfc' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.94rem', color: '#212121', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={18} color="#1B5E2F" />
                    <span>Instant Callback</span>
                  </h4>
                  <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#555555', lineHeight: 1.4 }}>
                    Our customer care team in Tamil Nadu will call you within 30 minutes.
                  </p>
                  {callbackRequested ? (
                    <span style={{ fontSize: '0.84rem', color: '#2e7d32', fontWeight: 750 }}>✓ Callback request recorded!</span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setCallbackRequested(true)}
                      className="fk-btn-save"
                      style={{ fontSize: '0.84rem', padding: '9px 18px' }}
                    >
                      REQUEST CALLBACK
                    </button>
                  )}
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="fk-faq-section">
                <h4>Frequently Asked Questions</h4>
                {[
                  { q: 'How long does delivery take across India?', a: 'Dispatched in 24 hours. Takes 1-2 days across Tamil Nadu & Bangalore, and 3-5 days nationwide.' },
                  { q: 'Are your cold-pressed oils 100% heat-free?', a: 'Yes, cold-pressed in traditional Vaagai wood mortars below 40°C with zero chemicals.' },
                  { q: 'What is your replacement policy?', a: '100% replacement guarantee if any bottle arrives leaked or damaged in transit.' }
                ].map((faq, idx) => (
                  <div key={idx} className="fk-faq-item">
                    <p className="fk-faq-q">{faq.q}</p>
                    <p className="fk-faq-a">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 8: BULK & WHOLESALE ── */}
          {activeTab === 'bulk' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">Bulk &amp; Wholesale Orders</h3>
              </div>

              {bulkSubmitted ? (
                <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', color: '#047857', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                  <CheckCircle2 size={40} style={{ margin: '0 auto 8px', color: '#059669' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800 }}>Inquiry Submitted Successfully!</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem' }}>Our farm production manager will reach out with wholesale pricing within 2 hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setBulkSubmitted(true); }} style={{ maxWidth: '520px' }}>
                  <div className="fk-input-group" style={{ marginBottom: '14px', maxWidth: '100%' }}>
                    <label>Contact Name *</label>
                    <input type="text" required className="fk-text-input" value={bulkForm.name} onChange={e => setBulkForm(b => ({ ...b, name: e.target.value }))} />
                  </div>
                  <div className="fk-input-group" style={{ marginBottom: '14px', maxWidth: '100%' }}>
                    <label>Phone Number *</label>
                    <input type="tel" required className="fk-text-input" value={bulkForm.phone} onChange={e => setBulkForm(b => ({ ...b, phone: e.target.value }))} />
                  </div>
                  <div className="fk-input-group" style={{ marginBottom: '14px', maxWidth: '100%' }}>
                    <label>Product Category Required</label>
                    <select className="fk-text-input" value={bulkForm.item} onChange={e => setBulkForm(b => ({ ...b, item: e.target.value }))}>
                      <option>Wood Cold-Pressed Oils (15L Tins)</option>
                      <option>Stone Ground Turmeric / Chilli (25kg Sacks)</option>
                      <option>Chettinad Masala Blends (Institutional Packs)</option>
                    </select>
                  </div>
                  <div className="fk-input-group" style={{ marginBottom: '14px', maxWidth: '100%' }}>
                    <label>Estimated Quantity</label>
                    <input type="text" placeholder="e.g. 10 Tins or 50kg" className="fk-text-input" value={bulkForm.qty} onChange={e => setBulkForm(b => ({ ...b, qty: e.target.value }))} />
                  </div>
                  <div className="fk-input-group" style={{ marginBottom: '18px', maxWidth: '100%' }}>
                    <label>Special Instructions / Destination City</label>
                    <textarea rows={3} className="fk-text-input" style={{ resize: 'vertical' }} placeholder="Specify delivery city or requirements..." value={bulkForm.notes} onChange={e => setBulkForm(b => ({ ...b, notes: e.target.value }))} />
                  </div>
                  <button type="submit" className="fk-btn-save">
                    SUBMIT INQUIRY
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── TAB 9: REVIEWS & RATINGS ── */}
          {activeTab === 'reviews' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">My Reviews &amp; Ratings</h3>
              </div>
              <div className="fk-empty-box">
                <div className="fk-empty-icon-circle">
                  <Star size={28} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f3d2a' }}>No reviews submitted yet</h4>
                <p style={{ margin: '0 0 18px', fontSize: '0.86rem', color: '#64748b', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                  Share your experience with your delivered farm products directly from your delivered orders.
                </p>
                <button type="button" onClick={() => handleTabChange('orders')} className="fk-btn-save">
                  VIEW DELIVERED ORDERS
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 10: NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div>
              <div className="fk-panel-header">
                <h3 className="fk-panel-heading">All Notifications (2)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ border: '1.5px solid #e2e8f0', padding: '16px 18px', borderRadius: '10px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Bell size={16} color="#1B5E2F" />
                    <strong style={{ fontSize: '0.92rem', color: '#1B5E2F' }}>Harvest Season Dispatch Alert</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
                    New batch of wood-pressed Chekku Gingelly Oil freshly extracted and ready for delivery to your doorstep.
                  </p>
                </div>
                <div style={{ border: '1.5px solid #e2e8f0', padding: '16px 18px', borderRadius: '10px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Leaf size={16} color="#1B5E2F" />
                    <strong style={{ fontSize: '0.92rem', color: '#1B5E2F' }}>Welcome to Venthulir Patron Program</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
                    Thank you for ordering direct farm products. Enjoy free express shipping on all orders over ₹499.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ── Order Tracking Modal ── */}
      {selectedOrderForTracking && (
        <div className="fk-modal-overlay" onClick={() => setSelectedOrderForTracking(null)}>
          <div className="fk-modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#212121' }}>Live Shipment Tracking</h4>
              <button type="button" onClick={() => setSelectedOrderForTracking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#878787' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#555555', marginBottom: '14px' }}>
              <div>Order ID: <strong style={{ color: '#212121' }}>#{String(selectedOrderForTracking._id || selectedOrderForTracking.id).slice(-8).toUpperCase()}</strong></div>
              <div>Courier Partner: <strong style={{ color: '#1B5E2F' }}>Venthulir Direct Express</strong></div>
            </div>

            <div style={{ borderLeft: '2px solid #1B5E2F', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0 20px 6px' }}>
              <div>
                <strong style={{ fontSize: '0.86rem', color: '#212121' }}>📦 Packed &amp; Certified</strong>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#878787' }}>Batch sealed at Tamil Nadu facility.</p>
              </div>
              <div>
                <strong style={{ fontSize: '0.86rem', color: '#212121' }}>🚚 In Transit</strong>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#878787' }}>Dispatched via express logistics hub.</p>
              </div>
              <div>
                <strong style={{ fontSize: '0.86rem', color: '#26a541' }}>🏠 Expected Delivery</strong>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#878787' }}>Within 24 to 48 hours to your doorstep.</p>
              </div>
            </div>

            <button type="button" onClick={() => setSelectedOrderForTracking(null)} className="fk-btn-save" style={{ width: '100%' }}>
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="fk-account-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#1B5E2F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
