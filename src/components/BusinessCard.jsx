import React, { useState } from 'react';
import {
  Phone, Mail, Globe, MapPin, Linkedin, Instagram, Youtube,
  Calendar, QrCode, Download, Share2, MessageSquare,
  Check, ArrowLeft, Building
} from 'lucide-react';
import { downloadVCard } from '../services/vcard';
import { copyText } from '../services/clipboard';
import { initialsAvatar } from '../services/avatar';

export default function BusinessCard({ member, onBack, onOpenQR, cardUrl }) {
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  const officeAddr = member.officeAddress || member.address || '';

  const handleCopyLink = async () => {
    const ok = await copyText(cardUrl);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-container">
      <div className="card-topbar">
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} />
          <span>All Team Members</span>
        </button>

        <button className="btn-secondary" onClick={handleCopyLink}>
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          <span>{copied ? 'Link Copied!' : 'Share Card'}</span>
        </button>
      </div>

      <div className="card-wrapper">
        <div className="card-cover">
          <div className="card-cover-pattern" />
        </div>

        <div className="card-avatar-wrapper">
          <img
            src={member.avatar}
            alt={member.name}
            className="card-avatar"
            onError={(e) => { e.target.src = initialsAvatar(member.name); }}
          />
          <div className="card-status-dot" title="Active Profile" />
        </div>

        <div className="card-body">
          <h1 className="card-name">{member.name}</h1>
          <p className="card-title">{member.title}</p>

          <div className="card-company">
            <Building size={15} />
            <span>{member.company}</span>
            {member.department && (
              <span className="badge-pill">{member.department}</span>
            )}
          </div>

          <div className="quick-actions">
            <button
              className="action-btn primary"
              onClick={() => downloadVCard(member)}
            >
              <Download size={18} />
              <span>Save Contact</span>
            </button>

            <button className="action-btn" onClick={() => onOpenQR(member)}>
              <QrCode size={18} />
              <span>QR Code</span>
            </button>
          </div>

          {member.bio && (
            <div className="card-bio">
              {member.bio}
            </div>
          )}

          <div className="section-title">Direct Contact</div>

          <div className="contact-list">
            {member.email && (
              <a href={`mailto:${member.email}`} className="contact-item">
                <div className="contact-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="contact-text-label">Email</div>
                  <div className="contact-text-val">{member.email}</div>
                </div>
              </a>
            )}

            {member.phone && (
              <a href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`} className="contact-item">
                <div className="contact-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="contact-text-label">Phone</div>
                  <div className="contact-text-val">{member.phone}</div>
                </div>
              </a>
            )}

            {member.whatsapp && (
              <a
                href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="contact-item"
              >
                <div className="contact-icon">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="contact-text-label">WhatsApp</div>
                  <div className="contact-text-val">Chat on WhatsApp</div>
                </div>
              </a>
            )}

            {member.website && (
              <a href={member.website} target="_blank" rel="noreferrer" className="contact-item">
                <div className="contact-icon">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="contact-text-label">Website</div>
                  <div className="contact-text-val">{member.website.replace(/^https?:\/\//, '')}</div>
                </div>
              </a>
            )}

            {officeAddr && (
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="contact-text-label">Office Address</div>
                  <div className="contact-text-val">{officeAddr}</div>
                </div>
              </div>
            )}
          </div>

          {(member.instagram || member.linkedin || member.youtube || member.calendly) && (
            <>
              <div className="section-title">Channels</div>
              <div className="contact-list">
                {member.instagram && (
                  <a href={member.instagram} target="_blank" rel="noreferrer" className="contact-item">
                    <div className="contact-icon">
                      <Instagram size={18} />
                    </div>
                    <div>
                      <div className="contact-text-label">Instagram</div>
                      <div className="contact-text-val">Follow on Instagram</div>
                    </div>
                  </a>
                )}

                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="contact-item">
                    <div className="contact-icon">
                      <Linkedin size={18} />
                    </div>
                    <div>
                      <div className="contact-text-label">LinkedIn</div>
                      <div className="contact-text-val">Connect on LinkedIn</div>
                    </div>
                  </a>
                )}

                {member.youtube && (
                  <a href={member.youtube} target="_blank" rel="noreferrer" className="contact-item">
                    <div className="contact-icon">
                      <Youtube size={18} />
                    </div>
                    <div>
                      <div className="contact-text-label">YouTube</div>
                      <div className="contact-text-val">Watch on YouTube</div>
                    </div>
                  </a>
                )}

                {member.calendly && (
                  <a href={member.calendly} target="_blank" rel="noreferrer" className="contact-item">
                    <div className="contact-icon">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="contact-text-label">Book a Meeting</div>
                      <div className="contact-text-val">Schedule on Calendly</div>
                    </div>
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
