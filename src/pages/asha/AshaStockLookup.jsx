import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockInventory } from '../../data/mockData.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  Search,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import './Asha.css';

export default function AshaStockLookup() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = useMemo(() => {
    return mockInventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'medicine' && item.category.startsWith('Medicine')) ||
        (selectedCategory === 'diagnostic' && item.category.startsWith('Diagnostic'));
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="asha-stock-page" role="main">
      <header className="asha-header">
        <div className="asha-header-inner">
          <div className="asha-profile-block">
            <button
              type="button"
              className="back-icon-btn"
              onClick={() => navigate('/asha')}
              aria-label="Back to ASHA Dashboard"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div>
              <h1 className="asha-title">Medicine &amp; Diagnostic Availability Lookup</h1>
              <p className="asha-subtitle">
                Real-time stock indicators across Sub-Centres, PHCs, CHCs, and District Hospital
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="asha-container">
        {/* Search and Filters */}
        <div className="stock-search-card">
          <div className="search-bar-wrapper">
            <Search size={20} className="search-bar-icon" aria-hidden="true" />
            <input
              type="search"
              className="stock-search-input"
              placeholder="Search medicine (e.g. Metformin, Amlodipine, IFA) or diagnostic test (e.g. CBC, Albumin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search medicine or diagnostic test inventory"
            />
          </div>

          <div className="stock-filter-chips" role="group" aria-label="Filter by inventory category">
            <button
              type="button"
              className={`filter-chip ${selectedCategory === 'all' ? 'filter-chip--active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Items
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedCategory === 'medicine' ? 'filter-chip--active' : ''}`}
              onClick={() => setSelectedCategory('medicine')}
            >
              Essential Medicines
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedCategory === 'diagnostic' ? 'filter-chip--active' : ''}`}
              onClick={() => setSelectedCategory('diagnostic')}
            >
              Diagnostic Tests &amp; Kits
            </button>
          </div>
        </div>

        {/* Inventory Results List */}
        <div className="inventory-results-stack">
          {filteredItems.length === 0 ? (
            <div className="empty-stock-card" role="status">
              <Package size={40} aria-hidden="true" />
              <h3>No matching medicines or diagnostic tests found</h3>
              <p>Try searching for common generic names like Paracetamol, Metformin, IFA, or CBC.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="stock-item-card">
                <div className="stock-item-header">
                  <div>
                    <h2 className="stock-item-name">{item.name}</h2>
                    <span className="stock-item-category">{item.category}</span>
                  </div>
                </div>

                <div className="facilities-stock-grid">
                  {item.facilities.map((fac, idx) => {
                    const isAvailable = fac.status === 'available';
                    const isOutOfStock = fac.status === 'out_of_stock';

                    const badgeStatus = isAvailable ? 'success' : isOutOfStock ? 'critical' : 'warning';
                    const badgeLabel = isAvailable ? 'Available' : isOutOfStock ? 'Out of Stock' : 'Unknown';
                    const CustomIcon = isAvailable ? CheckCircle2 : isOutOfStock ? AlertCircle : HelpCircle;

                    return (
                      <div key={idx} className="facility-stock-cell">
                        <div className="cell-top">
                          <span className="cell-fac-name">{fac.facility}</span>
                          <StatusBadge
                            status={badgeStatus}
                            label={badgeLabel}
                            icon={CustomIcon}
                          />
                        </div>
                        <div className="cell-details">
                          <span className="stock-qty-text">{fac.stock}</span>
                          <span className="stock-time-text">
                            <Clock size={12} aria-hidden="true" />
                            {fac.lastUpdated}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
