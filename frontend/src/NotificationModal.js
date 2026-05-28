import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const NotificationModal = ({ show, onClose, title, message, type = 'success', details = null }) => {
  
  const getIcon = () => {
    switch(type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      default:
        return '✅';
    }
  };

  const getColor = () => {
    switch(type) {
      case 'success':
        return '#28a745';
      case 'error':
        return '#dc3545';
      case 'info':
        return '#17a2b8';
      case 'warning':
        return '#ffc107';
      default:
        return '#28a745';
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <div className="notification-modal" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="notification-header" style={{ 
          background: `linear-gradient(135deg, ${getColor()}, ${getColor()}dd)`,
          padding: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>{getIcon()}</div>
          <h3 style={{ margin: 0, fontWeight: 'bold' }}>{title}</h3>
        </div>
        
        <div className="notification-body" style={{ padding: '24px' }}>
          <p style={{ fontSize: '16px', color: '#333', marginBottom: '16px', lineHeight: '1.5' }}>
            {message}
          </p>
          
          {details && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '12px',
              marginTop: '16px',
              border: '1px solid #e9ecef'
            }}>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <span style={{ fontWeight: '600', color: '#666' }}>{key}:</span>
                  <span style={{ color: '#333', fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="notification-footer" style={{ padding: '16px 24px 24px', borderTop: '1px solid #e9ecef' }}>
          <Button 
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: `linear-gradient(135deg, ${getColor()}, ${getColor()}dd)`,
              border: 'none',
              borderRadius: '40px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            OK, Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;