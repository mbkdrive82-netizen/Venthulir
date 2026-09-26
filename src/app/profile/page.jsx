'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  User, 
  Heart, 
  ShoppingCart, 
  Package, 
  HelpCircle, 
  Wrench, 
  ArrowLeft, 
  LogOut,
  MapPin,
  Mail,
  Phone,
  Edit3,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  Award,
  Plus,
  ChevronRight,
  ExternalLink,
  Trash2,
  Clock,
  MessageCircle,
  Send,
  ShoppingBag,
  Truck,
  Leaf
} from 'lucide-react';

function ProfileContent() {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { cartItems, updateQty, removeFromCart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab: 'profile' | 'cart' | 'orders' | 'wishlist' | 'help' | 'custom'
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Address Edit State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: ''
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState('');
  const [addressErrorMsg, setAddressErrorMsg] = useState('');

  // Custom Order Inquiry State
  const [customForm, setCustomForm] = useState({ name: '', phone: '', quantity: '', notes: '' });

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('venthulir_token')) {
      router.push('/login?redirect=/profile');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || ''
      });
      setAddressForm({
        address: user.deliveryAddress?.address || '',
        city: user.deliveryAddress?.city || '',
        state: user.deliveryAddress?.state || 'Tamil Nadu',
        zipCode: user.deliveryAddress?.zipCode || ''
      });
      setCustomForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Fetch orders when orders tab becomes active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchUserOrders();
    }
  }, [activeTab]);

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

  // Handle Profile Update
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
        body: JSON.stringify(profileForm)
      });

      const data = await res.json();
      if (res.ok) {
        updateUser({ name: profileForm.name, phone: profileForm.phone });
        setProfileSuccessMsg('Profile updated successfully!');
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileSuccessMsg('');
        }, 1200);
      } else {
        setProfileErrorMsg(data.msg || 'Failed to update profile');
      }
    } catch {
      setProfileErrorMsg('Server connection failed. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Address Update
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressSuccessMsg('');
    setAddressErrorMsg('');

    try {
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/auth/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });

      const data = await res.json();
      if (res.ok) {
        updateUser({ deliveryAddress: addressForm });
        setAddressSuccessMsg('Address saved successfully!');
        setTimeout(() => {
          setIsEditingAddress(false);
          setAddressSuccessMsg('');
        }, 1200);
      } else {
        setAddressErrorMsg(data.msg || 'Failed to update address');
      }
    } catch {
      setAddressErrorMsg('Server connection failed. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Send Custom Order WhatsApp message
  const handleCustomOrderSubmit = (e) => {
    e.preventDefault();
    const text = `Hello Venthulir! I would like to make a Custom / Bulk Order:\n\nName: ${customForm.name}\nPhone: ${customForm.phone}\nQuantity: ${customForm.quantity}\nRequirements: ${customForm.notes}`;
    const url = `https://wa.me/918778476414?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#1A4B3A] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-[#1A4B3A]">Loading your account...</span>
        </div>
      </div>
    );
  }

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* ── DESKTOP LUXURY LEFT SIDEBAR (STICKY, FULL HEIGHT, COHESIVE DEEP FOREST) ── */}
      <aside className="hidden md:flex md:w-[280px] lg:w-[300px] shrink-0 bg-gradient-to-b from-[#092217] via-[#0C2B1D] to-[#071911] text-white border-r border-[#123823] flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto z-20 shadow-xl select-none">
        
        {/* Brand Header - Height h-20 (80px) Aligned with Right Content Header */}
        <div className="h-20 px-6 border-b border-white/10 flex items-center shrink-0">
          <Link href="/home" className="inline-flex items-center gap-2.5 text-[#E6C98A] hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-[#1A4B3A] text-[#E6C98A] flex items-center justify-center border border-[#E6C98A]/30 group-hover:scale-105 transition-transform">
              <Leaf size={16} />
            </div>
            <div>
              <span className="font-brand font-bold text-sm tracking-widest block text-white leading-tight">VENTHULIR</span>
              <span className="text-[10px] text-emerald-200/70 tracking-wider uppercase block leading-tight">Organic Harvests</span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 flex flex-col justify-between space-y-5 overflow-y-auto">
          <div className="space-y-4">
            {/* User Profile Identity Card */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E6C98A] to-[#FFF3DC] text-[#092217] font-extrabold text-base flex items-center justify-center shadow-sm ring-2 ring-[#E6C98A]/40 shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-xs font-bold truncate m-0 capitalize leading-tight">
                  {user?.name || 'Customer'}
                </h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span className="text-emerald-300 text-[10px] font-semibold tracking-wide">Verified Customer</span>
                </div>
                {user?.email && (
                  <p className="text-emerald-200/60 text-[10px] truncate m-0 mt-0.5" title={user.email}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            {/* Group 1: Main Menu */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#E6C98A]/80 px-3 mb-2">
                Account Menu
              </div>
              <div className="space-y-1">
                {/* 1. Profile Tab */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-none text-left ${
                    activeTab === 'profile'
                      ? 'bg-[#1A4B3A] text-white shadow-sm border-l-4 border-[#E6C98A]'
                      : 'text-[#B4C7BC] hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User size={17} className={activeTab === 'profile' ? 'text-[#E6C98A]' : 'text-[#7E998B]'} />
                    <span>Personal Details</span>
                  </div>
                  <ChevronRight size={15} className={activeTab === 'profile' ? 'text-[#E6C98A]' : 'text-white/20'} />
                </button>

                {/* 2. My Orders Tab */}
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-none text-left ${
                    activeTab === 'orders'
                      ? 'bg-[#1A4B3A] text-white shadow-sm border-l-4 border-[#E6C98A]'
                      : 'text-[#B4C7BC] hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={17} className={activeTab === 'orders' ? 'text-[#E6C98A]' : 'text-[#7E998B]'} />
                    <span>My Orders</span>
                  </div>
                  {orders.length > 0 ? (
                    <span className="text-[10px] bg-[#E6C98A] text-[#092217] px-2 py-0.5 rounded-full font-extrabold">
                      {orders.length}
                    </span>
                  ) : (
                    <ChevronRight size={15} className={activeTab === 'orders' ? 'text-[#E6C98A]' : 'text-white/20'} />
                  )}
                </button>

                {/* 3. Cart Dashboard Tab */}
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-none text-left ${
                    activeTab === 'cart'
                      ? 'bg-[#1A4B3A] text-white shadow-sm border-l-4 border-[#E6C98A]'
                      : 'text-[#B4C7BC] hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={17} className={activeTab === 'cart' ? 'text-[#E6C98A]' : 'text-[#7E998B]'} />
                    <span>Shopping Basket</span>
                  </div>
                  {cartItems.length > 0 ? (
                    <span className="text-[10px] bg-[#E6C98A] text-[#092217] px-2 py-0.5 rounded-full font-extrabold">
                      {cartItems.length}
                    </span>
                  ) : (
                    <ChevronRight size={15} className={activeTab === 'cart' ? 'text-[#E6C98A]' : 'text-white/20'} />
                  )}
                </button>

                {/* 4. Wishlist Tab */}
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-none text-left ${
                    activeTab === 'wishlist'
                      ? 'bg-[#1A4B3A] text-white shadow-sm border-l-4 border-[#E6C98A]'
                      : 'text-[#B4C7BC] hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart size={17} className={activeTab === 'wishlist' ? 'text-[#E6C98A]' : 'text-[#7E998B]'} />
                    <span>Wishlist</span>
                  </div>
                  <ChevronRight size={15} className={activeTab === 'wishlist' ? 'text-[#E6C98A]' : 'text-white/20'} />
                </button>
              </div>
            </div>

            {/* Group 2: Support & Services */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#E6C98A]/80 px-3 mb-2">
                Services & Support
              </div>
              <div className="space-y-1">
                {/* 5. Help & Queries */}
                <button
                  onClick={() => setActiveTab('help')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-none text-left ${
                    activeTab === 'help'
                      ? 'bg-[#1A4B3A] text-white shadow-sm border-l-4 border-[#E6C98A]'
                      : 'text-[#B4C7BC] hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={17} className={activeTab === 'help' ? 'text-[#E6C98A]' : 'text-[#7E998B]'} />
                    <span>Help & Support</span>
                  </div>
                  <ChevronRight size={15} className={activeTab === 'help' ? 'text-[#E6C98A]' : 'text-white/20'} />
                </button>

                {/* 6. Custom Orders */}
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-none text-left ${
                    activeTab === 'custom'
                      ? 'bg-[#1A4B3A] text-white shadow-sm border-l-4 border-[#E6C98A]'
                      : 'text-[#B4C7BC] hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wrench size={17} className={activeTab === 'custom' ? 'text-[#E6C98A]' : 'text-[#7E998B]'} />
                    <span>Custom & Bulk</span>
                  </div>
                  <ChevronRight size={15} className={activeTab === 'custom' ? 'text-[#E6C98A]' : 'text-white/20'} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-white/10 space-y-1.5">
            <Link
              href="/home"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#E6C98A] hover:bg-white/10 font-semibold text-xs transition-all"
            >
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </Link>

            <button
              onClick={() => { logout(); router.push('/home'); }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-white font-semibold text-xs transition-all w-full text-left bg-transparent border-none cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ── MOBILE COMPACT HEADER & SCROLLABLE TABS (< 768px ONLY) ── */}
      <div className="block md:hidden bg-white text-gray-900 sticky top-0 z-30 border-b border-gray-200 shadow-xs">
        {/* Compact User Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 bg-[#F8FAF8]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#092217] text-[#E6C98A] font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0 border border-[#E6C98A]/30">
              {userInitial}
            </div>
            <div className="min-w-0">
              <h2 className="text-gray-900 text-xs font-bold truncate m-0 capitalize leading-tight">
                {user?.name || 'Customer'}
              </h2>
              <span className="text-emerald-700 text-[10px] font-semibold block leading-tight">
                🌿 Verified Customer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => { logout(); router.push('/home'); }}
              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-red-200/60"
              title="Sign Out"
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Scrollable Horizontal Pill Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar bg-white">
          <button
            onClick={() => setActiveTab('profile')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-[#092217] text-white border-[#092217] shadow-xs' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <User size={13} />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-[#092217] text-white border-[#092217] shadow-xs' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Package size={13} />
            <span>Orders</span>
            {orders.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-[#E6C98A] text-[#092217]' : 'bg-[#092217] text-white'
              }`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              activeTab === 'cart' 
                ? 'bg-[#092217] text-white border-[#092217] shadow-xs' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <ShoppingCart size={13} />
            <span>Cart</span>
            {cartItems.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'cart' ? 'bg-[#E6C98A] text-[#092217]' : 'bg-[#092217] text-white'
              }`}>
                {cartItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              activeTab === 'wishlist' 
                ? 'bg-[#092217] text-white border-[#092217] shadow-xs' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Heart size={13} />
            <span>Wishlist</span>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              activeTab === 'help' 
                ? 'bg-[#092217] text-white border-[#092217] shadow-xs' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <HelpCircle size={13} />
            <span>Help</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              activeTab === 'custom' 
                ? 'bg-[#092217] text-white border-[#092217] shadow-xs' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Wrench size={13} />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* ── RIGHT MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAF8]">
        
        {/* Top Header Bar (Desktop Only, Clean Breadcrumb & Context) */}
        <div className="hidden md:flex h-20 bg-white border-b border-gray-200/90 px-6 lg:px-8 items-center justify-between gap-4 shadow-2xs shrink-0">
          <div>
            <div className="text-emerald-700 text-[11px] font-bold tracking-wider uppercase mb-0.5 flex items-center gap-1.5">
              <span>Account</span>
              <span className="text-gray-300">/</span>
              <span>
                {activeTab === 'profile' && 'Personal Details'}
                {activeTab === 'orders' && 'Order History'}
                {activeTab === 'cart' && 'Cart Dashboard'}
                {activeTab === 'wishlist' && 'Wishlist'}
                {activeTab === 'help' && 'Customer Support'}
                {activeTab === 'custom' && 'Custom & Bulk'}
              </span>
            </div>
            <h1 className="text-gray-900 text-2xl font-extrabold tracking-tight m-0">
              {activeTab === 'profile' && 'Personal Details & Address'}
              {activeTab === 'orders' && `My Order History (${orders.length})`}
              {activeTab === 'cart' && `Shopping Basket (${cartItems.length})`}
              {activeTab === 'wishlist' && 'My Saved Wishlist'}
              {activeTab === 'help' && 'Help & Customer Support'}
              {activeTab === 'custom' && 'Custom & Bulk Farm Orders'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl font-semibold">
              <Truck size={15} className="text-[#1A4B3A]" />
              <span>Free Delivery Above ₹499</span>
            </div>
            <Link
              href="/home"
              className="px-4 py-2 rounded-xl bg-[#1A4B3A] hover:bg-[#143d2f] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Explore Store</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6 flex-1">
          
          {/* ======================================================== */}
          {/* TAB 1: PROFILE TAB (SIDE-BY-SIDE EXECUTIVE DASHBOARD)    */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <>
              {/* Executive Mini Metric Strip */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 px-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="text-gray-500 font-medium">Status:</span>
                    <span className="font-bold text-gray-800">Verified Customer</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs border-l border-gray-200 pl-6">
                    <Truck size={16} className="text-[#1A4B3A]" />
                    <span className="text-gray-500 font-medium">Delivery:</span>
                    <span className="font-bold text-emerald-700">Free Above ₹499</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => setActiveTab('cart')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F0F7F4] hover:bg-[#1A4B3A] hover:text-white text-[#1A4B3A] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#E2EFE7]"
                  >
                    <ShoppingCart size={13} />
                    <span>Cart ({cartItems.length})</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-[#1A4B3A] hover:text-white text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-gray-200"
                  >
                    <Package size={13} />
                    <span>My Orders</span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side 2-Column Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
                {/* ── CARD 1: PERSONAL INFORMATION ── */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 sm:pb-4 mb-3.5 sm:mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F0F7F4] text-[#1A4B3A] flex items-center justify-center font-bold shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-sm sm:text-base m-0 tracking-tight">Personal Information</h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">Your identity & contact credentials</p>
                      </div>
                    </div>

                    {!isEditingProfile ? (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold text-xs hover:border-[#1A4B3A] hover:text-[#1A4B3A] hover:bg-[#F0F7F4] transition-all cursor-pointer shadow-2xs"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-semibold text-xs hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        <X size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  {profileSuccessMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                      <Check size={16} className="text-emerald-600" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}
                  {profileErrorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                      <X size={16} className="text-red-600" />
                      <span>{profileErrorMsg}</span>
                    </div>
                  )}

                  {!isEditingProfile ? (
                    <div className="divide-y divide-gray-100">
                      {/* Full Name */}
                      <div className="py-3 flex items-center justify-between first:pt-0">
                        <div>
                          <span className="text-xs text-gray-400 font-medium block mb-0.5">Full Name</span>
                          <span className="text-sm font-semibold text-gray-900">{user?.name || '-'}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Verified
                        </span>
                      </div>

                      {/* Email Address */}
                      <div className="py-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="text-xs text-gray-400 font-medium block mb-0.5">Email Address</span>
                          <span className="text-sm font-semibold text-gray-900 truncate block">{user?.email || '-'}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          Primary
                        </span>
                      </div>

                      {/* Phone Number */}
                      <div className="py-3 flex items-center justify-between last:pb-0">
                        <div>
                          <span className="text-xs text-gray-400 font-medium block mb-0.5">Mobile Number</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {user?.phone ? `+91 ${user.phone}` : 'Not provided'}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          SMS Alerts
                        </span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Full Name
                        </label>
                        <input 
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-sm text-gray-900 font-medium"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Mobile Number
                        </label>
                        <input 
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-sm text-gray-900 font-medium"
                          placeholder="e.g. 9876543210"
                        />
                      </div>

                      <div className="flex items-center gap-2.5 pt-2">
                        <button 
                          type="submit"
                          disabled={savingProfile}
                          className="px-5 py-2.5 bg-[#1A4B3A] text-white rounded-lg font-semibold text-xs hover:bg-[#143d2f] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-semibold text-xs hover:bg-gray-200 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* ── CARD 2: DELIVERY ADDRESS ── */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between pb-3.5 sm:pb-4 mb-3.5 sm:mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center font-bold shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-sm sm:text-base m-0 tracking-tight">Delivery Address</h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">Saved for 1-click checkout</p>
                      </div>
                    </div>

                    {!isEditingAddress ? (
                      <button 
                        onClick={() => setIsEditingAddress(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold text-xs hover:border-[#D97706] hover:text-[#D97706] hover:bg-amber-50/50 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} />
                        <span>{user?.deliveryAddress?.address ? 'Edit' : 'Add'}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditingAddress(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-semibold text-xs hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        <X size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  {addressSuccessMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                      <Check size={16} className="text-emerald-600" />
                      <span>{addressSuccessMsg}</span>
                    </div>
                  )}
                  {addressErrorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                      <X size={16} className="text-red-600" />
                      <span>{addressErrorMsg}</span>
                    </div>
                  )}

                  {!isEditingAddress ? (
                    user?.deliveryAddress?.address ? (
                      <div className="space-y-3">
                        <div className="p-3.5 sm:p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#1A4B3A] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Default Shipping
                            </span>
                            <button 
                              onClick={() => setIsEditingAddress(true)}
                              className="text-xs font-semibold text-[#1A4B3A] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-900 text-sm m-0">{user?.name}</h4>
                            <p className="text-gray-600 text-xs leading-relaxed m-0 mt-1">{user.deliveryAddress.address}</p>
                            <p className="text-gray-600 text-xs font-medium m-0 mt-0.5">
                              {user.deliveryAddress.city}, {user.deliveryAddress.state} - <span className="font-bold text-gray-900">{user.deliveryAddress.zipCode}</span>
                            </p>
                          </div>

                          {user?.phone && (
                            <p className="text-gray-500 text-xs m-0 pt-2 border-t border-gray-200/60 flex items-center gap-1">
                              <Phone size={11} /> Contact: +91 {user.phone}
                            </p>
                          )}
                        </div>

                        {/* Delivery Assurance */}
                        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                          <Truck size={14} className="text-emerald-600 shrink-0" />
                          <span>Express delivery available to this address</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 px-4 border-2 border-dashed border-gray-200 rounded-xl text-center bg-gray-50/50 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center mb-2">
                          <MapPin size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">No Address Added Yet</h4>
                        <p className="text-gray-500 text-xs max-w-xs mb-3">
                          Add your shipping address for fast, 1-click checkout.
                        </p>
                        <button 
                          onClick={() => setIsEditingAddress(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A4B3A] text-white rounded-lg font-semibold text-xs hover:bg-[#143d2f] transition-all shadow-xs cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add Address</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <form onSubmit={handleSaveAddress} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Street / Door No
                        </label>
                        <input 
                          type="text"
                          required
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-xs text-gray-900 font-medium"
                          placeholder="e.g. 12, Anna Nagar 2nd Street"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            City
                          </label>
                          <input 
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-xs text-gray-900 font-medium"
                            placeholder="City"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            State
                          </label>
                          <input 
                            type="text"
                            required
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-xs text-gray-900 font-medium"
                            placeholder="State"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            PIN Code
                          </label>
                          <input 
                            type="text"
                            required
                            value={addressForm.zipCode}
                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-xs text-gray-900 font-medium"
                            placeholder="600028"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-2">
                        <button 
                          type="submit"
                          disabled={savingAddress}
                          className="px-5 py-2.5 bg-[#1A4B3A] text-white rounded-lg font-semibold text-xs hover:bg-[#143d2f] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {savingAddress ? 'Saving...' : 'Save Address'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-semibold text-xs hover:bg-gray-200 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CART DASHBOARD TAB                                */}
          {/* ======================================================== */}
          {activeTab === 'cart' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-gray-100">
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-[#1A4B3A] flex items-center justify-center font-bold shrink-0">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h3 className="text-[#1A4B3A] text-lg sm:text-xl font-bold m-0">Your Shopping Basket</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your harvest cart
                    </p>
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <button 
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                )}
              </div>

              {cartItems.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Cart Items List */}
                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div key={item.key} className="py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <img 
                            src={item.image || '/assets/hero/turmeric.png'} 
                            alt={item.name} 
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain bg-[#F8FAF8] border border-gray-100 p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm m-0 truncate">{item.name}</h4>
                            {item.variant && (
                              <span className="text-[11px] sm:text-xs text-gray-500 block">{item.variant.label || item.variant.weight}</span>
                            )}
                            <div className="text-xs sm:text-sm font-bold text-[#1A4B3A] mt-0.5">₹{item.price}</div>
                          </div>
                        </div>

                        {/* Qty & Total Controls */}
                        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQty(item.key, item.quantity - 1)}
                              className="px-2.5 sm:px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs sm:text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 sm:px-3 py-1 text-xs font-bold text-gray-800 min-w-[24px] sm:min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQty(item.key, item.quantity + 1)}
                              className="px-2.5 sm:px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs sm:text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-sm sm:text-base font-bold text-gray-900 min-w-[65px] sm:min-w-[80px] text-right">
                            ₹{item.price * item.quantity}
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.key)}
                            className="text-gray-400 hover:text-red-600 p-1.5 cursor-pointer transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Checkout Button */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-100 bg-[#F8FAF8] p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto text-left">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold block">Total Cart Value</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#1A4B3A]">₹{cartTotal}</span>
                      <span className="text-[11px] sm:text-xs text-emerald-600 block mt-0.5">Free Delivery on Orders Above ₹499</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Link 
                        href="/checkout"
                        className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-[#1A4B3A] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#143d2f] transition-all shadow-md text-center"
                      >
                        Proceed to Checkout →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Cart State */
                <div className="py-12 sm:py-14 px-4 sm:px-6 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex items-center justify-center mb-4 text-[#1A4B3A]">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1A4B3A] mb-2">Your Basket is Empty</h3>
                  <p className="text-gray-500 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                    Looks like you haven&apos;t added any single-origin stone ground spices, wooden chekku oils, or heirloom staples to your cart yet.
                  </p>
                  <Link 
                    href="/home"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#1A4B3A] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#143d2f] transition-all shadow-sm"
                  >
                    <span>Explore Organic Catalog</span>
                    <ArrowLeft size={16} className="rotate-180" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: MY ORDERS TAB                                     */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-gray-100">
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-[#1A4B3A] flex items-center justify-center font-bold shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-[#1A4B3A] text-lg sm:text-xl font-bold m-0">My Order History</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">Track your shipments and view past receipts</p>
                  </div>
                </div>
                <button 
                  onClick={fetchUserOrders}
                  className="text-xs font-bold text-[#1A4B3A] hover:underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-3 border-[#1A4B3A] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3.5 sm:space-y-4">
                  {orders.map((ord) => (
                    <div key={ord._id || ord.id} className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-[#FAFCFA] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-semibold uppercase">Order ID</span>
                          <span className="font-bold text-gray-800 text-xs sm:text-sm font-mono">#{ord._id?.slice(-8) || ord.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-semibold uppercase">Date</span>
                          <span className="text-[11px] sm:text-xs text-gray-700 font-medium">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-semibold uppercase">Total</span>
                          <span className="font-bold text-[#1A4B3A] text-sm sm:text-base">₹{ord.totalAmount}</span>
                        </div>
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {ord.orderStatus || ord.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="text-xs text-gray-600 space-y-1">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate pr-2">{item.name || item.product?.name} x {item.quantity}</span>
                            <span className="font-semibold text-gray-800 shrink-0">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 sm:px-6 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3">
                    <Package size={26} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">No Orders Found</h4>
                  <p className="text-gray-500 text-xs max-w-sm mb-5">
                    You haven&apos;t placed any orders yet with this account. Start exploring our traditional wood cold-pressed oils and heritage spices!
                  </p>
                  <Link 
                    href="/home"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A4B3A] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#143d2f] transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: WISHLIST TAB                                      */}
          {/* ======================================================== */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 sm:gap-3.5 pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-gray-100">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="text-[#1A4B3A] text-lg sm:text-xl font-bold m-0">My Wishlist</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">Save your favorite organic staples for later</p>
                </div>
              </div>

              <div className="py-12 px-4 sm:px-6 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-pink-50 text-pink-400 flex items-center justify-center mb-3">
                  <Heart size={26} />
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-1">Your Wishlist is Empty</h4>
                <p className="text-gray-500 text-xs max-w-sm mb-5">
                  Save your favorite items here while browsing so you can easily purchase them whenever you&apos;re ready.
                </p>
                <Link 
                  href="/home"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A4B3A] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#143d2f] transition-all"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: HELP & QUERIES TAB                                */}
          {/* ======================================================== */}
          {activeTab === 'help' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-3.5 pb-4 sm:pb-6 border-b border-gray-100">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-[#1A4B3A] flex items-center justify-center font-bold shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-[#1A4B3A] text-lg sm:text-xl font-bold m-0">Customer Support & Queries</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">We are here to assist you with your orders and products</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                <a 
                  href="https://wa.me/918778476414?text=Hello%20Venthulir%20Team,%20I%20need%20help%20with%20my%20order" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center text-center hover:shadow-md transition-all group"
                >
                  <MessageCircle size={26} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-gray-900 text-sm">WhatsApp Support</span>
                  <span className="text-xs text-gray-500 mt-1">Instant chat with our farm team</span>
                  <span className="mt-3 text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-full shadow-xs">
                    +91 87784 76414
                  </span>
                </a>

                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col items-center text-center">
                  <Mail size={26} className="text-blue-600 mb-2" />
                  <span className="font-bold text-gray-900 text-sm">Email Inquiries</span>
                  <span className="text-xs text-gray-500 mt-1">Response within 24 hours</span>
                  <span className="mt-3 text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-full shadow-xs">
                    theventhulir@gmail.com
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col items-center text-center sm:col-span-2 md:col-span-1">
                  <Phone size={26} className="text-amber-600 mb-2" />
                  <span className="font-bold text-gray-900 text-sm">Direct Hotline</span>
                  <span className="text-xs text-gray-500 mt-1">Mon - Sat: 9 AM to 7 PM</span>
                  <span className="mt-3 text-xs font-bold text-amber-700 bg-white px-3 py-1 rounded-full shadow-xs">
                    +91 87784 76414
                  </span>
                </div>
              </div>

              {/* FAQ Accordions */}
              <div className="pt-2 sm:pt-4 space-y-3">
                <h4 className="font-bold text-gray-800 text-sm sm:text-base">Frequently Asked Questions</h4>
                
                <div className="p-3.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h5 className="font-bold text-xs text-[#1A4B3A] uppercase tracking-wide mb-1">
                    How are Venthulir oils extracted?
                  </h5>
                  <p className="text-xs text-gray-600 m-0 leading-relaxed">
                    Our oils are 100% cold-pressed in traditional wooden churns (Mara Chekku) below 40°C, ensuring zero chemical refining, no additives, and full nutrient preservation.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h5 className="font-bold text-xs text-[#1A4B3A] uppercase tracking-wide mb-1">
                    What is the delivery time across India?
                  </h5>
                  <p className="text-xs text-gray-600 m-0 leading-relaxed">
                    Orders in Tamil Nadu are delivered within 24–48 hours. Across other states in India, delivery typically takes 3–5 business days via express courier.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: CUSTOM & BULK ORDERS TAB                          */}
          {/* ======================================================== */}
          {activeTab === 'custom' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-3.5 pb-4 sm:pb-6 border-b border-gray-100">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center font-bold shrink-0">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="text-[#1A4B3A] text-lg sm:text-xl font-bold m-0">Custom & Heritage Bulk Orders</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">Special packaging, wedding gifts, and wholesale farm orders</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                Looking for cold-pressed oils in bulk tins (5L / 15L), custom spice gift boxes for weddings and festivals, or institutional supply? Fill in your request below and our team will get in touch instantly.
              </p>

              <form onSubmit={handleCustomOrderSubmit} className="space-y-3.5 sm:space-y-4 pt-1 sm:pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Your Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={customForm.name}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-sm text-gray-900"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Phone Number
                    </label>
                    <input 
                      type="tel"
                      required
                      value={customForm.phone}
                      onChange={(e) => setCustomForm({ ...customForm, phone: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-sm text-gray-900"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Estimated Quantity / Tin Size
                  </label>
                  <input 
                    type="text"
                    required
                    value={customForm.quantity}
                    onChange={(e) => setCustomForm({ ...customForm, quantity: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-sm text-gray-900"
                    placeholder="e.g. 5 Tins of 5L Gingelly Oil / 50 Spice gift boxes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Additional Requirements / Delivery Location
                  </label>
                  <textarea 
                    rows={3}
                    value={customForm.notes}
                    onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4B3A] text-sm text-gray-900"
                    placeholder="Provide any specific requests or delivery address..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#1A4B3A] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#143d2f] transition-all shadow-sm cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send Inquiry via WhatsApp</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
