import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode } from 'lucide-react';
import { copyText } from '../services/clipboard';

export default function QRCodeModal({ isOpen, onClose, member, cardUrl }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && cardUrl) {
      QRCode.toCanvas(canvasRef.current, cardUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#171717',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error('Error generating QR code:', error);
      });
    }
  }, [isOpen, cardUrl]);

  if (!isOpen || !member) return null;

  const handleCopyLink = async () => {
    const ok = await copyText(cardUrl);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QR_${member.slug || member.name}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-narrow" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-heading">
            <QrCode size={20} aria-hidden="true" />
            <h3 className="modal-title">Scan Digital Card</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="qr-body">
          <p className="qr-intro">
            Point a smartphone camera at this QR code to view <strong>{member.name}</strong>'s business card.
          </p>

          <div className="qr-frame">
            <canvas ref={canvasRef} className="qr-canvas" />
          </div>

          <p className="qr-url">{cardUrl}</p>

          <div className="qr-actions">
            <button type="button" className="btn-secondary" onClick={handleCopyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
            <button type="button" className="btn-primary" onClick={handleDownloadQR}>
              <Download size={16} />
              <span>Save PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
