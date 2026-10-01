'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Boxes,
  Eye,
  CheckCircle2,
  Truck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  MessageSquare,
  ShieldCheck,
  Search,
  Check,
  Building2,
  FileText,
  BadgeCheck,
  AlertCircle,
  Phone,
  MapPin,
  CreditCard,
  Percent,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import OrderDetailModal from './components/OrderDetailModal';
import RestockModal from './components/RestockModal';
import ProductFormModal from './components/ProductFormModal';
import ConfirmStatusModal from './components/ConfirmStatusModal';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export default function SimpleAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'prepaid' | 'cod'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState({
    isOpen: false,
    order: null,
    targetStatus: '',
    isCancel: false
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('venthulir_token');
      const savedUserStr = localStorage.getItem('venthulir_user');
      
      let isAdminUser = user?.isAdmin;
      if (!isAdminUser && savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          isAdminUser = parsed?.isAdmin;
        } catch {
          isAdminUser = false;
        }
      }

      if (!token || !isAdminUser) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data) setStats(data);
      }
    } catch {
      // Safe fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAdminOrderStatusUpdate = async (orderId, newStatus, isCancel, extras) => {
    const orderToUpdate = selectedOrder?._id === orderId ? selectedOrder : stats?.recentOrders?.find(o => o._id === orderId || o.orderId === orderId);
    const id = orderToUpdate?._id || orderId;

    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: newStatus,
          action: isCancel ? 'cancel' : undefined,
          trackingNumber: extras?.trackingNumber,
          courierPartner: extras?.courierPartner
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.order || { ...orderToUpdate, status: newStatus };
        if (selectedOrder && (selectedOrder._id === id || selectedOrder.orderId === id)) {
          setSelectedOrder(updated);
        }
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            recentOrders: (prev.recentOrders || []).map(o => (o._id === id || o.orderId === id) ? updated : o)
          };
        });
        toast.success(`Order #${(id || '').toString().slice(-8).toUpperCase()} updated to "${newStatus}"!`);
        fetchStats();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to update status.');
      }
    } catch {
      toast.error('Network error updating status.');
    }
  };

  const promptOrderStatusUpdate = (order, newStatus, isCancel = false) => {
    setConfirmStatusModal({
      isOpen: true,
      order,
      targetStatus: newStatus,
      isCancel
    });
  };

  const executeOrderStatusUpdate = async () => {
    const { order, targetStatus } = confirmStatusModal;
    if (!order || !targetStatus) return;

    const orderId = order._id || order.orderId;
    setUpdatingStatus(true);

    // Optimistic update
    setStats(prev => {
      if (!prev) return prev;
      const updatedOrders = (prev.recentOrders || []).map(o => {
        if (o._id === orderId || o.orderId === orderId) {
          return { ...o, status: targetStatus };
        }
        return o;
      });
      return { ...prev, recentOrders: updatedOrders };
    });

    if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderId === orderId)) {
      setSelectedOrder(prev => ({ ...prev, status: targetStatus }));
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      if (res.ok) {
        toast.success(`Order #${orderId.slice(-8).toUpperCase()} updated to "${targetStatus}"!`);
        await fetchStats();
        setConfirmStatusModal({ isOpen: false, order: null, targetStatus: '', isCancel: false });
      } else {
        toast.error('Failed to update order status.');
        await fetchStats();
      }
    } catch {
      toast.error('Network error updating status.');
      await fetchStats();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRestock = async (productId, newStock) => {
    const token = localStorage.getItem('venthulir_token');
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentStock: newStock })
      });

      if (res.ok) {
        toast.success('Stock updated successfully!');
        fetchStats();
        setRestockProduct(null);
      } else {
        toast.error('Failed to update stock.');
      }
    } catch {
      toast.error('Error updating inventory.');
    }
  };

  const handleSaveNewProduct = async (productData) => {
    const token = localStorage.getItem('venthulir_token');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        toast.success('New product listed in catalog!');
        setShowAddProductModal(false);
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.msg || 'Failed to save product.');
      }
    } catch {
      toast.error('Error creating product.');
    }
  };

  // Filter orders
  const rawOrders = stats?.recentOrders || [];
  
  // Status breakdown counts
  const pendingCount = rawOrders.filter(o => {
    const s = (o.status || o.orderStatus || 'pending').toLowerCase();
    return s === 'pending';
  }).length;

  const confirmedCount = rawOrders.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return s === 'confirmed' || s === 'processing';
  }).length;

  const shippedCount = rawOrders.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return s === 'shipped' || s === 'in_transit';
  }).length;

  const deliveredCount = rawOrders.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return s === 'delivered';
  }).length;

  const filteredOrders = rawOrders.filter(ord => {
    const status = (ord.status || ord.orderStatus || 'pending').toLowerCase();
    const matchesTab = 
      orderFilter === 'all' ? true :
      orderFilter === 'pending' ? (status === 'pending') :
      orderFilter === 'confirmed' ? (status === 'confirmed' || status === 'processing') :
      orderFilter === 'shipped' ? (status === 'shipped' || status === 'in_transit') :
      orderFilter === 'delivered' ? (status === 'delivered') : true;

    const paymentMethod = (ord.paymentMethod || ord.paymentInfo?.method || (ord.paymentMethod === 'cod' ? 'cod' : 'prepaid')).toLowerCase();
    const matchesPayment = 
      paymentFilter === 'all' ? true :
      paymentFilter === 'cod' ? (paymentMethod.includes('cod') || paymentMethod.includes('cash')) :
      paymentFilter === 'prepaid' ? (!paymentMethod.includes('cod') && !paymentMethod.includes('cash')) : true;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === '' ? true :
      (ord.orderId?.toLowerCase().includes(q) ||
       ord._id?.toLowerCase().includes(q) ||
       ord.customer?.name?.toLowerCase().includes(q) ||
       ord.shippingAddress?.fullName?.toLowerCase().includes(q) ||
       ord.shippingAddress?.city?.toLowerCase().includes(q) ||
       ord.shippingAddress?.phone?.toLowerCase().includes(q) ||
       ord.customer?.email?.toLowerCase().includes(q));

    return matchesTab && matchesPayment && matchesSearch;
  });

  const lowStockCount = stats?.lowStockCount || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div style={{ maxWidth: '1520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── 1. SELLER HUB HERO COMMAND BANNER (FLIPKART / AMAZON SELLER STYLE) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0A2F1D 0%, #061e12 100%)',
        borderRadius: '12px',
        padding: '20px 24px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: '#D4AF37',
              color: '#0A2F1D',
              fontWeight: '800',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>
              SELLER HUB
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
              Venthulir Organic Merchant Central
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#4ade80',
              fontSize: '11.5px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '9999px',
              border: '1px solid rgba(74, 222, 128, 0.3)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
              Live Storefront Operational
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Unified Multi-Channel Order Fulfillment • Real-Time Stock Management • Same-Day Dispatch SLA Active
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            style={{
              background: '#2874f0', // Flipkart Brand Blue
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(40, 116, 240, 0.35)',
              transition: 'transform 0.15s'
            }}
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </button>

          <Link
            href="/admin/inventory"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s'
            }}
          >
            <Boxes size={14} />
            <span>Manage Inventory</span>
          </Link>

          <a
            href="/home"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={14} />
            <span>Buyer View</span>
            <ExternalLink size={11} />
          </a>

          <button
            type="button"
            onClick={fetchStats}
            title="Refresh Live Metrics"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '9px 12px',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── 2. FLIPKART & AMAZON HIGH-DENSITY KPI CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px'
      }}>
        
        {/* KPI 1: Total Net Sales */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Gross Sales Revenue
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} />
            <span>{totalOrders} Orders Placed • Avg ₹{avgOrderValue}</span>
          </div>
        </div>

        {/* KPI 2: Action Required / Dispatch SLA (Flipkart Style) */}
        <div style={{
          background: pendingCount > 0 || confirmedCount > 0 ? '#fffbeb' : '#ffffff',
          borderRadius: '10px',
          padding: '18px 20px',
          border: pendingCount > 0 ? '1.5px solid #fbbf24' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: pendingCount > 0 ? '#92400e' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Fulfillment SLA
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: pendingCount > 0 ? '#fef3c7' : '#eff6ff',
              color: pendingCount > 0 ? '#d97706' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: pendingCount > 0 ? '#b45309' : '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {pendingCount + confirmedCount} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>orders</span>
          </div>
          <div style={{ fontSize: '12px', color: pendingCount > 0 ? '#b45309' : '#64748b', fontWeight: '600' }}>
            {pendingCount > 0 ? `⚠️ ${pendingCount} New Unconfirmed • ${confirmedCount} Ready to Ship` : (confirmedCount > 0 ? `📦 ${confirmedCount} Ready for Courier Dispatch` : '✅ All Orders Shipped On Time')}
          </div>
        </div>

        {/* KPI 3: Inventory Health / Low Stock Warning (Amazon Style) */}
        <div style={{
          background: lowStockCount > 0 ? '#fef2f2' : '#ffffff',
          borderRadius: '10px',
          padding: '18px 20px',
          border: lowStockCount > 0 ? '1.5px solid #f87171' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: lowStockCount > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Inventory Health
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: lowStockCount > 0 ? '#fee2e2' : '#f0fdf4',
              color: lowStockCount > 0 ? '#dc2626' : '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: lowStockCount > 0 ? '#b91c1c' : '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {stats?.totalProducts || 0} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Active SKUs</span>
          </div>
          <div style={{ fontSize: '12px', color: lowStockCount > 0 ? '#dc2626' : '#15803d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {lowStockCount > 0 ? (
              <>
                <AlertTriangle size={13} />
                <span>{lowStockCount} Products in Stockout Risk!</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>100% Warehouse Stock Healthy</span>
              </>
            )}
          </div>
        </div>

        {/* KPI 4: Seller Performance / Rating */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Account Health & Rating
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fef9c3', color: '#a16207', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BadgeCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            99.8% <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>Excellent</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            {stats?.totalCustomers || 0} Registered Buyers • 0.0% Defect Rate
          </div>
        </div>

      </div>

      {/* ── 3. MAIN WORKSPACE: FLIPKART SELLER HUB ORDER FULFILLMENT & INVENTORY ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: '20px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: ORDER MANAGEMENT PIPELINE */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)'
        }}>
          
          {/* Header & Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' }}>
                Order Fulfillment Center
              </h2>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Process customer orders, assign shipping couriers, and track deliveries
              </p>
            </div>

            {/* Flipkart-Style Filter Tabs */}
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              gap: '2px',
              flexWrap: 'wrap'
            }}>
              {[
                { key: 'all', label: 'All Orders', count: rawOrders.length },
                { key: 'pending', label: 'New / Pending', count: pendingCount, highlight: pendingCount > 0 },
                { key: 'confirmed', label: 'Ready to Dispatch', count: confirmedCount },
                { key: 'shipped', label: 'In Transit', count: shippedCount },
                { key: 'delivered', label: 'Delivered', count: deliveredCount }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setOrderFilter(tab.key)}
                  style={{
                    background: orderFilter === tab.key ? '#ffffff' : 'transparent',
                    color: orderFilter === tab.key ? '#0f172a' : '#64748b',
                    fontWeight: orderFilter === tab.key ? '700' : '500',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: orderFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span style={{
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      background: tab.highlight ? '#fef3c7' : (orderFilter === tab.key ? '#e2e8f0' : 'rgba(0,0,0,0.06)'),
                      color: tab.highlight ? '#b45309' : '#334155',
                      fontWeight: '700'
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter Controls Ribbon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search Order ID (#VEN-...), Customer, Phone, or City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Payment Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '3px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', padding: '0 6px' }}>Payment:</span>
              {['all', 'prepaid', 'cod'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaymentFilter(p)}
                  style={{
                    background: paymentFilter === p ? '#ffffff' : 'transparent',
                    border: 'none',
                    color: paymentFilter === p ? '#0f172a' : '#64748b',
                    fontSize: '11.5px',
                    fontWeight: paymentFilter === p ? '700' : '500',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: paymentFilter === p ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {p === 'all' ? 'All' : p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* FLIPKART-STYLE HIGH-DENSITY ORDER TABLE */}
          {filteredOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1'
            }}>
              <ShoppingCart size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: '700', color: '#334155', fontSize: '14px' }}>No orders found</div>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>
                {searchQuery ? 'Try modifying your search or filter criteria' : 'All incoming orders from customer checkout will appear here in real time'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredOrders.map(ord => {
                const status = (ord.status || ord.orderStatus || 'pending').toLowerCase();
                const total = ord.totalAmount || ord.amount || ord.pricing?.finalTotal || 0;
                const items = ord.items || ord.orderItems || [];
                const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Just now';

                const buyerName = ord.customer?.name || ord.shippingAddress?.fullName || 'Customer';
                const buyerPhone = ord.shippingAddress?.phone || ord.customer?.phone || '';
                const buyerCity = ord.shippingAddress?.city || ord.shippingAddress?.state || 'India';
                const paymentMethod = (ord.paymentMethod || ord.paymentInfo?.method || 'Prepaid').toLowerCase();
                const isCod = paymentMethod.includes('cod') || paymentMethod.includes('cash');

                return (
                  <div
                    key={ord._id || ord.orderId}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    {/* Left: Order Info & Buyer */}
                    <div style={{ minWidth: '220px', flex: '1 1 240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '13px', color: '#1e293b' }}>
                          #{ord.orderId || ord._id?.slice(-8).toUpperCase()}
                        </span>
                        
                        {/* Payment Method Badge */}
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          letterSpacing: '0.3px',
                          background: isCod ? '#f3e8ff' : '#dcfce7',
                          color: isCod ? '#7e22ce' : '#15803d'
                        }}>
                          {isCod ? 'COD' : 'PREPAID'}
                        </span>

                        {/* Order Status Badge (Flipkart/Amazon style) */}
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: 
                            status === 'delivered' ? '#dcfce7' :
                            status === 'shipped' || status === 'in_transit' ? '#f5f3ff' :
                            status === 'processing' || status === 'confirmed' ? '#eff6ff' : '#fffbeb',
                          color:
                            status === 'delivered' ? '#15803d' :
                            status === 'shipped' || status === 'in_transit' ? '#6d28d9' :
                            status === 'processing' || status === 'confirmed' ? '#1d4ed8' : '#b45309',
                          border: `1px solid ${
                            status === 'delivered' ? '#86efac' :
                            status === 'shipped' || status === 'in_transit' ? '#ddd6fe' :
                            status === 'processing' || status === 'confirmed' ? '#bfdbfe' : '#fde68a'
                          }`
                        }}>
                          {ord.status || 'Pending'}
                        </span>
                      </div>

                      {/* Buyer Details */}
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{buyerName}</span>
                        {buyerPhone && (
                          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={10} /> {buyerPhone}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <MapPin size={10} /> {buyerCity}
                        </span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Middle: Items Thumbnail preview & pricing */}
                    <div style={{ minWidth: '180px', flex: '1 1 200px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '2px' }}>
                        {items.length} {items.length === 1 ? 'Product' : 'Products'} ordered
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                        ₹{total.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                        {items.map(i => `${i.product?.name || i.name || 'Item'} (x${i.quantity || 1})`).join(', ')}
                      </div>
                    </div>

                    {/* Right: Instant Flipkart Seller Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => promptOrderStatusUpdate(ord, 'Confirmed')}
                          style={{
                            background: '#ff9f00', // Flipkart Orange
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 4px rgba(255, 159, 0, 0.35)'
                          }}
                        >
                          <Check size={13} />
                          <span>Accept & Confirm</span>
                        </button>
                      )}

                      {(status === 'confirmed' || status === 'processing') && (
                        <button
                          type="button"
                          onClick={() => promptOrderStatusUpdate(ord, 'Shipped')}
                          style={{
                            background: '#2874f0', // Flipkart Dispatch Blue
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 4px rgba(40, 116, 240, 0.35)'
                          }}
                        >
                          <Truck size={13} />
                          <span>Dispatch Order</span>
                        </button>
                      )}

                      {(status === 'shipped' || status === 'in_transit') && (
                        <button
                          type="button"
                          onClick={() => promptOrderStatusUpdate(ord, 'Delivered')}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 4px rgba(22, 163, 74, 0.35)'
                          }}
                        >
                          <Check size={13} />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FileText size={12} />
                        <span>Invoice / View</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INVENTORY WATCHDOG & AMAZON SELLER SERVICES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Inventory Watchdog Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '18px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Boxes size={16} color={lowStockCount > 0 ? '#dc2626' : '#15803d'} />
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Warehouse Stock Alert
                </h3>
              </div>
              <Link href="/admin/inventory" style={{ fontSize: '11.5px', fontWeight: '700', color: '#2874f0', textDecoration: 'none' }}>
                Catalog Hub →
              </Link>
            </div>

            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.lowStockProducts.slice(0, 5).map(p => (
                  <div
                    key={p._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#fef2f2',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #fee2e2'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#991b1b', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '600' }}>
                        {p.currentStock === 0 ? '❌ OUT OF STOCK' : `⚠️ ${p.currentStock} units left`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRestockProduct(p)}
                      style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      + Restock
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 10px', background: '#f0fdf4', borderRadius: '8px', color: '#15803d', fontSize: '12.5px', fontWeight: '600', border: '1px solid #dcfce7' }}>
                <CheckCircle2 size={22} style={{ margin: '0 auto 6px', color: '#16a34a' }} />
                All {stats?.totalProducts || 0} catalog SKUs are well stocked in warehouse!
              </div>
            )}
          </div>

          {/* Seller Central Quick Operations Grid */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '18px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px' }}>
              Seller Central Services
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link
                href="/admin/products"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={15} color="#0a3322" />
                  <span>Product Catalog & Pricing</span>
                </div>
                <ChevronRight size={13} color="#94a3b8" />
              </Link>

              <Link
                href="/admin/coupons"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={15} color="#d97706" />
                  <span>Discounts & Promo Coupons</span>
                </div>
                <ChevronRight size={13} color="#94a3b8" />
              </Link>

              <Link
                href="/admin/customers"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={15} color="#2563eb" />
                  <span>Customer Directory</span>
                </div>
                <ChevronRight size={13} color="#94a3b8" />
              </Link>

              <Link
                href="/admin/messages"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={15} color="#7c3aed" />
                  <span>Buyer Support Inquiries</span>
                </div>
                {stats?.messageCount > 0 && (
                  <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700' }}>
                    {stats.messageCount} New
                  </span>
                )}
                {!stats?.messageCount && <ChevronRight size={13} color="#94a3b8" />}
              </Link>

              <Link
                href="/admin/analytics"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={15} color="#059669" />
                  <span>Financial & Tax Reports</span>
                </div>
                <ChevronRight size={13} color="#94a3b8" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* ── 4. MODALS & POPUPS ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleAdminOrderStatusUpdate}
        />
      )}

      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onSave={handleRestock}
        />
      )}

      {showAddProductModal && (
        <ProductFormModal
          product={null}
          onClose={() => setShowAddProductModal(false)}
          onSave={handleSaveNewProduct}
        />
      )}

      {confirmStatusModal.isOpen && (
        <ConfirmStatusModal
          isOpen={confirmStatusModal.isOpen}
          order={confirmStatusModal.order}
          targetStatus={confirmStatusModal.targetStatus}
          isCancel={confirmStatusModal.isCancel}
          onConfirm={executeOrderStatusUpdate}
          onClose={() => setConfirmStatusModal({ isOpen: false, order: null, targetStatus: '', isCancel: false })}
          loading={updatingStatus}
        />
      )}

    </div>
  );
}
