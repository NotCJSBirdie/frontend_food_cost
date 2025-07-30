import React, { useRef, useEffect } from "react";

const Modal = ({ isOpen, onClose, title, message, type, onConfirm }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="modal-title">
      <div
        className={`modal modal-${type}`}
        ref={modalRef}
        tabIndex={-1}
        aria-modal="true"
      >
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-message">{message}</p>
        {type === "loading" ? (
          <div className="loading-spinner" aria-label="Loading"></div>
        ) : type === "confirm" ? (
          <div className="modal-buttons">
            <button
              className="modal-button modal-button-confirm"
              onClick={onConfirm}
              aria-label="Confirm action"
            >
              Confirm
            </button>
            <button
              className="modal-button modal-button-cancel"
              onClick={onClose}
              aria-label="Cancel action"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="modal-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
