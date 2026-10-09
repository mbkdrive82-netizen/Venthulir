'use client';

import React, { useState, useEffect } from 'react';
import './Admin.css';
import AdminGuard from './components/AdminGuard';
import AdminSidebar from './components/AdminSidebar';
import AdminTopNav from './components/AdminTopNav';

let globalStatsCache = null;
let lastStatsFetchTime = 0;

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(globalStatsCache);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (typeof window === 'undefined') return;
        const now = Date.now();
        // If cached within last 45 seconds, avoid redundant network calls
        if (globalStatsCache && (now - lastStatsFetchTime < 45000)) {
          setStats(globalStatsCache);
          return;
        }

        const token = localStorage.getItem('venthulir_token');
        const savedUserStr = localStorage.getItem('venthulir_user');
        if (!token || !savedUserStr) return;

        const savedUser = JSON.parse(savedUserStr);
        if (!savedUser?.isAdmin || savedUser?.email?.toLowerCase() !== 'admin@venthulir.com') return;

        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data) {
            globalStatsCache = data;
            lastStatsFetchTime = Date.now();
            setStats(data);
          }
        }
      } catch (err) {
        console.warn('Admin layout stats sync will retry in background');
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminGuard>
      <div className="admin-app-container">
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          pendingOrdersCount={stats?.statusCounts?.pending || 0}
          pendingMessagesCount={stats?.messageCount || 0}
          lowStockCount={stats?.lowStockCount || 0}
        />

        <div className="admin-main">
          <AdminTopNav
            onMobileToggle={() => setMobileOpen(!mobileOpen)}
            stats={stats}
          />

          <main className="admin-page-content">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
