import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge, Navbar, Nav, Alert } from 'react-bootstrap';

function AdminPanel({ onBack }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', description: '', category: 'Electronics', image: '', stock: 10, brand: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load products from localStorage (this is the source of truth)
    const savedProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
    const defaultProducts = [
      { id: 1, name: "Apple AirPods Pro", price: 24999, category: "Electronics", stock: 25, brand: "Apple", image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400", description: "Active Noise Cancellation", rating: 4.8 },
      { id: 2, name: "Sony WH-1000XM5", price: 29999, category: "Electronics", stock: 15, brand: "Sony", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", description: "Noise cancellation", rating: 4.9 },
      { id: 3, name: "iPhone 15 Pro", price: 134900, category: "Electronics", stock: 10, brand: "Apple", image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400", description: "A17 Pro chip", rating: 4.9 },
      { id: 4, name: "Nike Air Max", price: 12999, category: "Clothing", stock: 40, brand: "Nike", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", description: "Running shoes", rating: 4.6 },
      { id: 5, name: "Levi's Jeans", price: 3999, category: "Clothing", stock: 50, brand: "Levi's", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", description: "Premium jeans", rating: 4.5 },
      { id: 6, name: "Fossil Gen 6 Watch", price: 22999, category: "Accessories", stock: 20, brand: "Fossil", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400", description: "Smart watch", rating: 4.7 },
      { id: 7, name: "Titan Analog Watch", price: 8999, category: "Accessories", stock: 30, brand: "Titan", image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400", description: "Analog watch", rating: 4.5 },
      { id: 8, name: "MacBook Pro M3", price: 169900, category: "Electronics", stock: 8, brand: "Apple", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", description: "M3 chip", rating: 4.9 }
    ];
    
    if (savedProducts.length === 0) {
      localStorage.setItem('admin_products', JSON.stringify(defaultProducts));
      setProducts(defaultProducts);
    } else {
      setProducts(savedProducts);
    }
    
    // Load orders
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
    
    // Calculate stats
    const totalRevenue = savedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    setStats({
      totalProducts: products.length,
      totalOrders: savedOrders.length,
      totalRevenue: totalRevenue,
      totalUsers: 5
    });
  };

  const saveProducts = (newProducts) => {
    localStorage.setItem('admin_products', JSON.stringify(newProducts));
    setProducts(newProducts);
    setStats({ ...stats, totalProducts: newProducts.length });
    // Trigger a custom event to notify App.js that products have changed
    window.dispatchEvent(new Event('productsUpdated'));
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? { ...productForm, id: editingProduct.id } : p);
      saveProducts(updated);
    } else {
      const newProduct = { ...productForm, id: Date.now(), rating: 4.0 };
      saveProducts([...products, newProduct]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({ name: '', price: '', description: '', category: 'Electronics', image: '', stock: 10, brand: '' });
  };

  const deleteProduct = (id) => {
    if (window.confirm('Delete product?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const deleteOrder = (orderId) => {
    const updatedOrders = orders.filter(order => order.orderId !== orderId);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    setStats({ ...stats, totalOrders: updatedOrders.length, totalRevenue: updatedOrders.reduce((sum, o) => sum + (o.total || 0), 0) });
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map(order => 
      order.orderId === orderId ? { ...order, status: status, orderStatus: status } : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const formatIndianRupee = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'danger',
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return statusColors[status] || 'secondary';
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand><i className="bi bi-speedometer2"></i> Admin Dashboard</Navbar.Brand>
          <Nav>
            <Button variant="outline-light" onClick={onBack}>
              <i className="bi bi-arrow-left"></i> Back to Store
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center bg-primary text-white">
              <Card.Body>
                <h3>{products.length}</h3>
                <p>Products</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-success text-white">
              <Card.Body>
                <h3>{orders.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-warning text-white">
              <Card.Body>
                <h3>{stats.totalUsers || 5}</h3>
                <p>Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-info text-white">
              <Card.Body>
                <h3>{formatIndianRupee(stats.totalRevenue)}</h3>
                <p>Revenue</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Products Management */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><i className="bi bi-box-seam"></i> Products Management</h5>
            <Button variant="primary" size="sm" onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', description: '', category: 'Electronics', image: '', stock: 10, brand: '' }); setShowProductModal(true); }}>
              <i className="bi bi-plus-circle"></i> Add Product
            </Button>
          </Card.Header>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{formatIndianRupee(p.price)}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-2" onClick={() => { setEditingProduct(p); setProductForm(p); setShowProductModal(true); }}>
                        <i className="bi bi-pencil"></i> Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteProduct(p.id)}>
                        <i className="bi bi-trash"></i> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Orders Management */}
        <Card>
          <Card.Header>
            <h5 className="mb-0"><i className="bi bi-truck"></i> Orders Management</h5>
          </Card.Header>
          <Card.Body>
            {orders.length === 0 ? (
              <Alert variant="info">No orders yet.</Alert>
            ) : (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.orderId}>
                      <td><code>{order.orderId}</code></td>
                      <td>{order.customerName || order.shipping?.fullName || 'Guest'}</td>
                      <td>{formatIndianRupee(order.total || order.totalAmount)}</td>
                      <td>
                        <Form.Select 
                          size="sm" 
                          style={{ width: '120px' }} 
                          value={order.status || order.orderStatus || 'pending'}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </Form.Select>
                      </td>
                      <td className="small">{order.date}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => {
                            setOrderToDelete(order);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Add/Edit Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
            <Form.Control className="mb-2" type="number" placeholder="Price (₹)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} />
            <Form.Control className="mb-2" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            <Form.Select className="mb-2" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Accessories</option>
              <option>Sports</option>
              <option>Home</option>
              <option>Beauty</option>
            </Form.Select>
            <Form.Control className="mb-2" placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />
            <Form.Control className="mb-2" type="number" placeholder="Stock Quantity" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} />
            <Form.Control className="mb-2" placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveProduct}>Save Product</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Order Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><i className="bi bi-exclamation-triangle"></i> Delete Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this order?</p>
          {orderToDelete && (
            <Alert variant="danger" className="small">
              <strong>Order ID:</strong> {orderToDelete.orderId}<br />
              <strong>Customer:</strong> {orderToDelete.customerName || orderToDelete.shipping?.fullName || 'Guest'}<br />
              <strong>Total:</strong> {formatIndianRupee(orderToDelete.total || orderToDelete.totalAmount)}<br />
              <strong>Date:</strong> {orderToDelete.date}
            </Alert>
          )}
          <p className="text-muted small mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteOrder(orderToDelete?.orderId)}>
            <i className="bi bi-trash"></i> Yes, Delete Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminPanel;