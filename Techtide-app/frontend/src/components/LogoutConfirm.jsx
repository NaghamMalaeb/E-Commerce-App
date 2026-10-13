import { useEffect, useRef } from 'react';
import './LogoutConfirm.css';

export default function LogoutConfirm({ open, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };

    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Focus the cancel button for accessibility
    setTimeout(() => cancelRef.current?.focus(), 50);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="logout-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="logout-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top accent */}
        <div className="logout-modal-accent" />

        {/* Icon */}
<div className="logout-icon-wrap">
  <div className="logout-icon-ring" />
  <div className="logout-icon-ring-2" />

  <div className="logout-icon">
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Door / panel */}
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />

      {/* Arrow pointing right (out) */}
      <path d="M9 12h11" />
      <path d="M17 8l4 4-4 4" />

      {/* Motion lines on the left — "leaving" */}
      <path d="M3 9h3" opacity="0.55" />
      <path d="M2 12h3" opacity="0.4" />
      <path d="M3 15h3" opacity="0.55" />
    </svg>
  </div>
</div>

        {/* Copy */}
        <div className="logout-content">
          <h3 id="logout-title" className="logout-title">
            Sign out of Kindred?
          </h3>
          <p id="logout-desc" className="logout-desc">
            You'll be returned to the homepage. Your cart and saved items will
            still be here when you sign back in.
          </p>
        </div>

        {/* Actions */}
        <div className="logout-actions">
          <button
            ref={cancelRef}
            type="button"
            className="logout-btn logout-btn-cancel"
            onClick={onCancel}
          >
            <span className="logout-btn-label">Stay signed in</span>
            <span className="logout-kbd">Esc</span>
          </button>

          <button
            type="button"
            className="logout-btn logout-btn-confirm"
            onClick={onConfirm}
          >
            <span className="logout-btn-label">Sign out</span>
            <span className="logout-kbd logout-kbd-dark">↵</span>
          </button>
        </div>

        {/* Footer note */}
        <p className="logout-footer">
          Signed in as <strong>your account</strong>
        </p>
      </div>
    </div>
  );
}