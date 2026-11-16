import React, { useCallback, useEffect, useState } from 'react';
import { X, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { COUNTRY_CODES } from '../data/countryCodes';

const TOKEN_URL = '/.netlify/functions/contact-token';
const SUBMIT_URL = '/.netlify/functions/contact';
const TOKEN_MIN_AGE_MS = 3200; // server rejects tokens younger than 3s

const EMPTY = { name: '', email: '', country: 'IN', phone: '', query: '' };

export default function ContactModal({ isOpen, onClose, member }) {
  const [form, setForm] = useState(EMPTY);
  const [token, setToken] = useState('');
  const [tokenReady, setTokenReady] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success
  const [successMsg, setSuccessMsg] = useState('');

  const loadToken = useCallback(async () => {
    setTokenReady(false);
    setToken('');
    try {
      const res = await fetch(TOKEN_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('token request failed');
      const { token: t } = await res.json();
      setToken(t);
      setTimeout(() => setTokenReady(true), TOKEN_MIN_AGE_MS);
    } catch {
      setErrors((e) => ({ ...e, general: 'Could not load security check. Please close and try again.' }));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY);
    setErrors({});
    setStatus('idle');
    loadToken();
  }, [isOpen, loadToken]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const country = COUNTRY_CODES.find((c) => c.code === form.country) || COUNTRY_CODES[0];
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhone = (e) => {
    const val = e.target.value.replace(/[^0-9\s\-()]/g, '');
    if (country.dial_code === '+91' && val.replace(/\D/g, '').length > 10) return;
    setForm((f) => ({ ...f, phone: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = {};
    if (country.dial_code === '+91' && form.phone.replace(/\D/g, '').length !== 10) {
      clientErrors.phone = 'Indian numbers must be exactly 10 digits.';
    }
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setStatus('sending');
    setErrors({});
    const fd = new FormData(e.target);
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          country_code: country.dial_code,
          phone_number: form.phone,
          query: form.query,
          website: fd.get('website') || '', // honeypot
          security_token: token,
          member_name: member.name,
          member_slug: member.slug,
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setSuccessMsg(data.message);
        setStatus('success');
        return;
      }
      setErrors(data?.errors || { general: 'Something went wrong. Please try again.' });
      if (data?.errors?.tokenInvalid) loadToken();
    } catch {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    }
    setStatus('idle');
  };

  const disabled = status === 'sending' || !token || !tokenReady;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-heading">
            <Send size={20} aria-hidden="true" />
            <h3 className="modal-title">Connect with {member.name}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="contact-success">
            <div className="contact-success-icon"><Check size={28} /></div>
            <h4>Message sent!</h4>
            <p>{successMsg}</p>
            <button type="button" className="btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate={false}>
            {/* Honeypot: hidden from people, tempting to bots */}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="cf-website">Website (leave empty)</label>
              <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {errors.general && (
              <div className="form-alert" role="alert">
                <AlertCircle size={16} /> <span>{errors.general}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="cf-name">Name *</label>
              <input id="cf-name" required maxLength={140} value={form.name} onChange={set('name')} placeholder="Jane Doe" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="cf-email">Email *</label>
              <input id="cf-email" type="email" required value={form.email} onChange={set('email')} placeholder="jane@organization.org" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="cf-phone">Phone *</label>
              <div className="phone-row">
                <select aria-label="Country code" value={form.country} onChange={set('country')}>
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} {c.dial_code}</option>
                  ))}
                </select>
                <input id="cf-phone" type="tel" required maxLength={20} value={form.phone} onChange={handlePhone} placeholder="98765 43210" />
              </div>
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="cf-query">Message *</label>
              <textarea id="cf-query" required rows={4} maxLength={2000} value={form.query} onChange={set('query')} placeholder={`How can ${member.name.split(' ')[0]} help you?`} />
              {errors.query && <p className="form-error">{errors.query}</p>}
            </div>

            <button type="submit" className="btn-primary contact-submit" disabled={disabled}>
              {status === 'sending' ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
