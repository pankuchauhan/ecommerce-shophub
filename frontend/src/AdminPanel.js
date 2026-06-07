import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge, Navbar, Nav, Alert } from 'react-bootstrap';

function AdminPanel({ onBack }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [productForm, setProductForm] = useState({
    name: '', price: '', description: '', category: 'Electronics', image: '', stock: 10, brand: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
    const defaultProducts = [
      { id: 1, name: "Apple AirPods Pro", price: 24999, category: "Electronics", stock: 25, brand: "Apple", image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400", description: "Active Noise Cancellation" },
      { id: 2, name: "Sony WH-1000XM5", price: 29999, category: "Electronics", stock: 15, brand: "Sony", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", description: "Noise cancellation" },
      { id: 3, name: "iPhone 15 Pro", price: 134900, category: "Electronics", stock: 10, brand: "Apple", image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400", description: "A17 Pro chip" }
    ];
    
    if (savedProducts.length === 0) {
      localStorage.setItem('admin_products', JSON.stringify(defaultProducts));
      setProducts(defaultProducts);
    } else {
      setProducts(savedProducts);
    }
    
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  };

  const saveProducts = (newProducts) => {
    localStorage.setItem('admin_products', JSON.stringify(newProducts));
    setProducts(newProducts);
    window.dispatchEvent(new Event('productsUpdated'));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProductForm({ ...productForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = (e) => {
    const url = e.target.value;
    setImagePreview(url);
    setProductForm({ ...productForm, image: url });
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? { ...productForm, id: editingProduct.id } : p);
      saveProducts(updated);
    } else {
      const newProduct = { ...productForm, id: Date.now() };
      saveProducts([...products, newProduct]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
    setImagePreview('');
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
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map(order => 
      order.orderId === orderId ? { ...order, status: status } : order
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

  return (
    <div>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Admin Dashboard</Navbar.Brand>
          <Nav>
            <Button variant="outline-light" onClick={onBack}>
              Back to Store
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center bg-primary text-white">
              <Card.Body>
                <h3>{products.length}</h3>
                <p>Products</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-success text-white">
              <Card.Body>
                <h3>{orders.length}</h3>
                <p>Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-warning text-white">
              <Card.Body>
                <h3>5</h3>
                <p>Users</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>Products Management</h5>
            <Button variant="primary" size="sm" onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', description: '', category: 'Electronics', image: '', stock: 10, brand: '' }); setImagePreview(''); setShowProductModal(true); }}>
              Add Product
            </Button>
          </Card.Header>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr><th>ID</th><th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} /></td>
                    <td>{p.name}</td>
                    <td>{formatIndianRupee(p.price)}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-2" onClick={() => { setEditingProduct(p); setProductForm(p); setImagePreview(p.image); setShowProductModal(true); }}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => deleteProduct(p.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Accessories</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  {imagePreview && (
                    <div className="mb-3 text-center">
                      <img src={imagePreview} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px' }} />
                    </div>
                  )}
                  <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                  <Form.Text className="text-muted">Upload from computer</Form.Text>
                  <hr />
                  <Form.Control type="text" placeholder="Or paste image URL" value={productForm.image && !productForm.image.startsWith('data:') ? productForm.image : ''} onChange={handleImageUrl} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveProduct}>Save Product</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Order Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Delete Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this order?</p>
          {orderToDelete && (
            <Alert variant="danger">
              <strong>Order ID:</strong> {orderToDelete.orderId}<br />
              <strong>Customer:</strong> {orderToDelete.customerName || 'Guest'}<br />
              <strong>Total:</strong> {formatIndianRupee(orderToDelete.total)}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteOrder(orderToDelete?.orderId)}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminPanel;