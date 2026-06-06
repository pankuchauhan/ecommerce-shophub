import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Table, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';

// Order Tracking Modal Component
const OrderTrackingModal = ({ show, onClose, order, formatIndianRupee }) => {
  const trackingSteps = [
    { status: 'Order Placed', icon: 'bi-check-circle', completed: true },
    { status: 'Processing', icon: 'bi-gear', completed: order?.orderStatus !== 'Pending' && order?.orderStatus !== 'pending' },
    { status: 'Shipped', icon: 'bi-truck', completed: order?.orderStatus === 'Shipped' || order?.orderStatus === 'shipped' || order?.orderStatus === 'Delivered' },
    { status: 'Out for Delivery', icon: 'bi-bicycle', completed: order?.orderStatus === 'Delivered' },
    { status: 'Delivered', icon: 'bi-house-check', completed: order?.orderStatus === 'Delivered' }
  ];

  if (!order) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title><i className="bi bi-map me-2"></i> Track Order - {order.orderId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <div className="tracking-progress">
            {trackingSteps.map((step, index) => (
              <div key={index} className="tracking-step">
                <div className={`tracking-icon ${step.completed ? 'completed' : 'pending'}`}>
                  <i className={`bi ${step.icon}`}></i>
                </div>
                <p className="small mt-2 mb-0">{step.status}</p>
                {index < trackingSteps.length - 1 && <div className="tracking-line"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="order-info mt-4 p-3 bg-light rounded">
          <Row>
            <Col md={6}>
              <p><strong>Order ID:</strong> {order.orderId}</p>
              <p><strong>Order Date:</strong> {order.date}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod || 'Cash on Delivery'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Total Amount:</strong> <span className="text-primary fw-bold">{formatIndianRupee(order.total || order.totalAmount)}</span></p>
              <p><strong>Current Status:</strong> <Badge bg="success">{order.orderStatus || order.status || 'Pending'}</Badge></p>
              <p><strong>Est. Delivery:</strong> {
                new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString()
              }</p>
            </Col>
          </Row>
        </div>

        <Alert variant="info" className="mt-3">
          <i className="bi bi-envelope"></i> Order updates will be sent to your registered email address.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

function CustomerDashboard({ user, onClose }) {
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Load orders
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = savedOrders.filter(order => 
      order.customerEmail === user?.email || 
      order.customerEmail === user?.email ||
      order.userEmail === user?.email
    );
    setOrders(userOrders);

    // Load wishlist
    const savedWishlist = localStorage.getItem(`wishlist_${user?.id}`);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    // Load profile
    setProfile(user);
    setLoading(false);
  };

  const formatIndianRupee = (amount) => {
    if (typeof amount === 'string') amount = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'warning',
      'pending': 'warning',
      'Processing': 'info',
      'processing': 'info',
      'Shipped': 'primary',
      'shipped': 'primary',
      'Delivered': 'success',
      'delivered': 'success',
      'Cancelled': 'danger',
      'cancelled': 'danger',
      'Paid': 'success'
    };
    return colors[status] || 'secondary';
  };

  const cancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const updatedOrders = orders.map(order => 
        order.orderId === orderId ? { ...order, status: 'Cancelled', orderStatus: 'Cancelled' } : order
      );
      setOrders(updatedOrders);
      
      // Update localStorage
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedAllOrders = allOrders.map(order => 
        order.orderId === orderId ? { ...order, status: 'Cancelled', orderStatus: 'Cancelled' } : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
      
      alert('Order cancelled successfully!');
    }
  };

  const removeFromWishlist = (productId) => {
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${user?.id}`, JSON.stringify(newWishlist));
    alert('Item removed from wishlist');
  };

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* Order Tracking Modal */}
      <OrderTrackingModal 
        show={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        order={selectedOrder}
        formatIndianRupee={formatIndianRupee}
      />

      {/* Dashboard Header */}
      <div className="dashboard-header bg-primary text-white py-4 mb-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2><i className="bi bi-person-circle me-2"></i>My Dashboard</h2>
              <p className="mb-0">Welcome back, {profile.name}!</p>
            </div>
            <Button variant="light" onClick={onClose}>
              <i className="bi bi-arrow-left me-2"></i> Back to Shop
            </Button>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Sidebar */}
          <Col md={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                {profile.picture ? (
                  <img src={profile.picture} alt={profile.name} className="rounded-circle mb-3" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                ) : (
                  <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '100px', height: '100px' }}>
                    <i className="bi bi-person-fill text-white" style={{ fontSize: '50px' }}></i>
                  </div>
                )}
                <h5>{profile.name}</h5>
                <p className="text-muted small">{profile.email}</p>
                <hr />
                <div className="text-start">
                  <Button 
                    variant={activeTab === 'orders' ? 'primary' : 'light'} 
                    className="w-100 mb-2 text-start"
                    onClick={() => setActiveTab('orders')}
                  >
                    <i className="bi bi-box-seam me-2"></i> My Orders ({orders.length})
                  </Button>
                  <Button 
                    variant={activeTab === 'wishlist' ? 'primary' : 'light'} 
                    className="w-100 mb-2 text-start"
                    onClick={() => setActiveTab('wishlist')}
                  >
                    <i className="bi bi-heart me-2"></i> Wishlist ({wishlist.length})
                  </Button>
                  <Button 
                    variant={activeTab === 'profile' ? 'primary' : 'light'} 
                    className="w-100 text-start"
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person-gear me-2"></i> Profile Settings
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col md={9}>
            {activeTab === 'orders' && (
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"><i className="bi bi-box-seam me-2"></i>My Orders</h5>
                </Card.Header>
                <Card.Body>
                  {orders.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <p className="mt-3">No orders yet. Start shopping!</p>
                      <Button variant="primary" onClick={onClose}>Continue Shopping</Button>
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.orderId}>
                            <td><code>{order.orderId}</code></td>
                            <td>{order.date}</td>
                            <td>{order.items?.length || 0}</td>
                            <td className="fw-bold text-primary">
                              {order.totalAmount || formatIndianRupee(order.total)}
                            </td>
                            <td>
                              <Badge bg={getStatusBadge(order.orderStatus || order.status)}>
                                {order.orderStatus || order.status || 'Pending'}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline-info"
                                  onClick={() => openTrackingModal(order)}
                                >
                                  <i className="bi bi-map"></i> Track
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-primary"
                                  onClick={() => alert(`Order Details:\n\nOrder ID: ${order.orderId}\nTotal: ${order.totalAmount || formatIndianRupee(order.total)}\nItems: ${order.items?.length || 0}\nPayment: ${order.paymentMethod || 'COD'}\nShipping: ${order.shippingAddress || 'N/A'}`)}
                                >
                                  <i className="bi bi-eye"></i> View
                                </Button>
                                {(order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Cancelled') && (
                                  <Button 
                                    size="sm" 
                                    variant="outline-danger"
                                    onClick={() => cancelOrder(order.orderId)}
                                  >
                                    <i className="bi bi-x-circle"></i> Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}

            {activeTab === 'wishlist' && (
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"><i className="bi bi-heart me-2"></i>My Wishlist</h5>
                </Card.Header>
                <Card.Body>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-heart fs-1 text-muted"></i>
                      <p className="mt-3">Your wishlist is empty!</p>
                      <Button variant="primary" onClick={onClose}>Explore Products</Button>
                    </div>
                  ) : (
                    <Row>
                      {wishlist.map((product) => (
                        <Col md={6} lg={4} key={product.id} className="mb-3">
                          <Card className="h-100">
                            <Card.Img variant="top" src={product.image} style={{ height: '150px', objectFit: 'cover' }} />
                            <Card.Body>
                              <Card.Title className="fs-6">{product.name}</Card.Title>
                              <Card.Text className="text-primary fw-bold">{formatIndianRupee(product.price)}</Card.Text>
                              <div className="d-flex gap-2">
                                <Button size="sm" variant="primary" onClick={onClose}>Buy Now</Button>
                                <Button size="sm" variant="danger" onClick={() => removeFromWishlist(product.id)}>
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            )}

            {activeTab === 'profile' && (
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"><i className="bi bi-person-gear me-2"></i>Profile Settings</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center mb-4">
                    {profile.picture ? (
                      <img src={profile.picture} alt={profile.name} className="rounded-circle" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '120px', height: '120px' }}>
                        <i className="bi bi-person-fill text-white" style={{ fontSize: '60px' }}></i>
                      </div>
                    )}
                  </div>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control type="text" value={profile.name} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control type="email" value={profile.email} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Member Since</Form.Label>
                      <Form.Control type="text" value={new Date().toLocaleDateString()} disabled />
                    </Form.Group>
                    <Alert variant="info" className="mt-3">
                      <i className="bi bi-info-circle me-2"></i> 
                      For security reasons, profile details cannot be edited here. Contact support for changes.
                    </Alert>
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CustomerDashboard;