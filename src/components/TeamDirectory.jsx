import React, { useState } from 'react';
import { Search, QrCode, Copy, Check, ArrowRight } from 'lucide-react';
import { copyText } from '../services/clipboard';
import { initialsAvatar } from '../services/avatar';

export default function TeamDirectory({ teamMembers, onSelectMember, onOpenQR, baseUrl }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const departments = ['All', ...new Set(teamMembers.map(m => m.department).filter(Boolean))];

  const query = searchTerm.trim().toLowerCase();
  const filteredMembers = teamMembers.filter(m => {
    const matchesSearch =
      !query ||
      m.name.toLowerCase().includes(query) ||
      m.title.toLowerCase().includes(query) ||
      (m.email || '').toLowerCase().includes(query) ||
      (m.department || '').toLowerCase().includes(query);

    const matchesDept = selectedDept === 'All' || m.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleCopyLink = async (e, slug) => {
    e.stopPropagation();
    const ok = await copyText(`${baseUrl}#/card/${slug}`);
    if (!ok) return;
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="directory-container">
      <div className="directory-banner">
        <h1>Team Digital Business Cards</h1>
        <p>
          Pick a person to open their card, save their contact, or share their profile link.
        </p>
      </div>

      <div className="directory-toolbar">
        <div className="directory-search">
          <Search size={18} className="directory-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by name, role, or department..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search team members"
          />
        </div>

        <div className="department-filters">
          {departments.map(dept => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`department-filter ${selectedDept === dept ? 'is-selected' : ''}`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <p className="directory-empty">No team members match your search.</p>
      ) : (
        <div className="directory-grid">
          {filteredMembers.map((member) => (
            <div key={member.id} className="member-card" onClick={() => onSelectMember(member)}>
              <div className="member-card-top">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="member-avatar"
                  onError={(e) => { e.target.src = initialsAvatar(member.name); }}
                />
                <div className="member-id">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-title">{member.title}</p>
                  {member.department && (
                    <span className="badge-pill">{member.department}</span>
                  )}
                </div>
              </div>

              <p className="member-bio">{member.bio}</p>

              <div className="member-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={(e) => { e.stopPropagation(); onSelectMember(member); }}
                >
                  <span>View Card</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  title="Show QR Code"
                  aria-label={`Show QR code for ${member.name}`}
                  onClick={(e) => { e.stopPropagation(); onOpenQR(member); }}
                >
                  <QrCode size={16} />
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  title="Copy Card Link"
                  aria-label={`Copy card link for ${member.name}`}
                  onClick={(e) => handleCopyLink(e, member.slug)}
                >
                  {copiedId === member.slug ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
