import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';

function PaymentModal({ show, onClose, amount, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const formatIndianRupee = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleUPIPayment = () => {
    if (!upiId) {
      alert('Please enter UPI ID');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert(`✅ UPI Payment Initiated!\n\nAmount: ${formatIndianRupee(amount)}\nUPI ID: ${upiId}`);
      onSuccess();
      onClose();
      setLoading(false);
    }, 1000);
  };

  const handleCardPayment = () => {
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert('Please fill all card details');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert(`✅ Payment Successful!\n\nAmount: ${formatIndianRupee(amount)}\nCard: ****${cardNumber.slice(-4)}`);
      onSuccess();
      onClose();
      setLoading(false);
    }, 1000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Payment Gateway - {formatIndianRupee(amount)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={paymentMethod} onSelect={(k) => setPaymentMethod(k)} className="mb-3" fill>
          <Tab eventKey="upi" title="UPI">
            <div className="p-3">
              <Alert variant="info">Pay using Google Pay, PhonePe, Paytm</Alert>
              <Form.Group className="mb-3">
                <Form.Label>UPI ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="username@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </Form.Group>
              <Button variant="success" onClick={handleUPIPayment} disabled={loading} className="w-100">
                {loading ? 'Processing...' : `Pay ${formatIndianRupee(amount)} via UPI`}
              </Button>
            </div>
          </Tab>
          <Tab eventKey="card" title="Card">
            <div className="p-3">
              <Alert variant="info">Secure payment - Test cards accepted</Alert>
              <Form.Group className="mb-3">
                <Form.Label>Card Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CVV</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="123"
                      maxLength="3"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Alert variant="secondary" className="small">
                <strong>Test Cards:</strong><br />
                Visa: 4111 1111 1111 1111 | CVV: 111
              </Alert>
              <Button variant="primary" onClick={handleCardPayment} disabled={loading} className="w-100">
                {loading ? 'Processing...' : `Pay ${formatIndianRupee(amount)} via Card`}
              </Button>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PaymentModal;