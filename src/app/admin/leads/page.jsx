'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Share2,
  ExternalLink
} from 'lucide-react';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');

  const fetchLeads = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('venthulir_token') || localStorage.getItem('token')
          : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch('/api/leads', { headers });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      locationFilter === 'ALL' || lead.location === locationFilter;

    return matchesSearch && matchesLocation;
  });

  // Extract unique locations for filter dropdown
  const uniqueLocations = Array.from(
    new Set(leads.map((l) => l.location).filter(Boolean))
  );

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (!leads.length) return;

    const headers = ['Date', 'Time', 'Customer Name', 'Phone Number', 'Location / District', 'Source', 'Live Sheet Synced'];
    const rows = leads.map((l) => {
      const d = new Date(l.createdAt || Date.now());
      const dateStr = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      const timeStr = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
      return [
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${l.phone || ''}"`,
        `"${(l.location || '').replace(/"/g, '""')}"`,
        `"${(l.source || '').replace(/"/g, '""')}"`,
        `"${l.syncedToSheet ? 'Yes' : 'No'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Venthulir_Visitor_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-page-container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#134522', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users className="w-7 h-7 text-[#1B5E2F]" />
            Visitor Leads
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0 0' }}>
            New visitors captured from website popup modal (Synced to Live Sheet &amp; Database)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchLeads(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #ddd',
              color: '#333',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#1B5E2F',
              border: 'none',
              color: '#ffffff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Download className="w-4 h-4" /> Download Excel/CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Total Leads Captured</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#134522', marginTop: '4px' }}>{leads.length}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Distinct Locations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1B5E2F', marginTop: '4px' }}>{uniqueLocations.length}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#888' }} />
          <input
            type="text"
            placeholder="Search by name, phone, district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            background: '#ffffff',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">All Districts / Locations ({leads.length})</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#666' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ margin: '0 auto 12px', color: '#1B5E2F' }} />
            <p>Loading captured leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888' }}>
            <Users className="w-12 h-12" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: '600' }}>No leads found</p>
            <p style={{ fontSize: '0.85rem' }}>New visitor submissions will show up here automatically.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #e5e5e5', color: '#134522', fontWeight: '700' }}>
                  <th style={{ padding: '14px 18px' }}>Customer Name</th>
                  <th style={{ padding: '14px 18px' }}>Mobile / WhatsApp</th>
                  <th style={{ padding: '14px 18px' }}>Location / District</th>
                  <th style={{ padding: '14px 18px' }}>Date &amp; Time</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const d = new Date(lead.createdAt || Date.now());
                  const dateStr = d.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const timeStr = d.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <tr
                      key={lead._id}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FBF9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: '600', color: '#134522' }}>
                        {lead.name}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#333' }}>
                        <a
                          href={`tel:${lead.phone}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1B5E2F', textDecoration: 'none', fontWeight: '500' }}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {lead.phone}
                        </a>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#555' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E8F5EC', color: '#134522', padding: '4px 10px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600' }}>
                          <MapPin className="w-3.5 h-3.5" />
                          {lead.location}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#777', fontSize: '0.82rem' }}>
                        <div>{dateStr}</div>
                        <div style={{ color: '#999', fontSize: '0.75rem' }}>{timeStr}</div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <a
                          href={`https://wa.me/91${lead.phone}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20Welcome%20to%20Venthulir%20Natural%20Harvests!%20Here%20is%20your%20exclusive%20welcome%20discount%20code%3A%20VENTHULIR10`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#25D366',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textDecoration: 'none'
                          }}
                        >
                          Chat
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
