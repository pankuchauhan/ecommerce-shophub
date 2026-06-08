import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Form, InputGroup, Badge, Modal, Table, Alert, Spinner, Toast } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AdminPanel from './AdminPanel';
import CustomerDashboard from './CustomerDashboard';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { sendOrderConfirmation, sendWelcomeEmail } from './services/emailService';

// ⭐⭐⭐ APNI GOOGLE CLIENT ID YAHAN PASTE KARO ⭐⭐⭐
const GOOGLE_CLIENT_ID = '1060866942072-42gp0tb4lebp01g5g4v0lm22iriied33.apps.googleusercontent.com';

// Default Products
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Apple AirPods Pro", price: 24999, description: "Active Noise Cancellation, Spatial audio", category: "Electronics", image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400", stock: 25, brand: "Apple", rating: 4.8 },
  { id: 2, name: "Sony WH-1000XM5", price: 29999, description: "Industry-leading noise cancellation", category: "Electronics", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", stock: 15, brand: "Sony", rating: 4.9 },
  { id: 3, name: "iPhone 15 Pro", price: 134900, description: "A17 Pro chip, 48MP camera", category: "Electronics", image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400", stock: 10, brand: "Apple", rating: 4.9 },
  { id: 4, name: "Nike Air Max", price: 12999, description: "Comfortable running shoes", category: "Clothing", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", stock: 40, brand: "Nike", rating: 4.6 },
  { id: 5, name: "Levi's Jeans", price: 3999, description: "Premium denim jeans", category: "Clothing", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", stock: 50, brand: "Levi's", rating: 4.5 },
  { id: 6, name: "Fossil Gen 6 Watch", price: 22999, description: "Smart watch with Wear OS", category: "Accessories", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400", stock: 20, brand: "Fossil", rating: 4.7 },
  { id: 7, name: "Titan Analog Watch", price: 8999, description: "Elegant analog watch", category: "Accessories", image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400", stock: 30, brand: "Titan", rating: 4.5 },
  { id: 8, name: "MacBook Pro M3", price: 169900, description: "M3 chip, Liquid Retina XDR", category: "Electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", stock: 8, brand: "Apple", rating: 4.9 }
];

// Function to load products from localStorage
const loadProductsFromStorage = () => {
  const savedProducts = localStorage.getItem('admin_products');
  if (savedProducts && JSON.parse(savedProducts).length > 0) {
    return JSON.parse(savedProducts);
  }
  localStorage.setItem('admin_products', JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
};

// Search Suggestions Component
const SearchSuggestions = ({ searchTerm, onSelect, products, formatIndianRupee }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  if (!showSuggestions || suggestions.length === 0) return null;

  return (
    <div className="search-suggestions">
      {suggestions.map((product) => (
        <div 
          key={product.id} 
          className="suggestion-item"
          onClick={() => onSelect(product)}
        >
          <img src={product.image} alt={product.name} className="suggestion-img" />
          <div className="suggestion-info">
            <div className="suggestion-name">{product.name}</div>
            <div className="suggestion-brand">{product.brand || 'Generic'}</div>
            <div className="suggestion-price">{formatIndianRupee(product.price)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Product Detail Modal Component
const ProductDetailModal = ({ show, onClose, product, onAddToCart, onBuyNow, formatIndianRupee }) => {
  const [quantity, setQuantity] = useState(1);
  if (!show || !product) return null;
  const totalPrice = product.price * quantity;
  
  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="product-detail-content">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
            {product.stock < 20 && <span className="stock-warning">⚠️ Only {product.stock} left!</span>}
          </div>
          <div className="product-detail-info">
            <div className="product-brand-badge">
              <span className="brand-name">{product.brand || 'Generic'}</span>
              <span className="category-tag">{product.category || 'Other'}</span>
            </div>
            <h2 className="product-detail-name">{product.name}</h2>
            <div className="product-detail-rating">
              {'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}
              <span>({product.rating || 0} out of 5)</span>
            </div>
            <p className="product-detail-description">{product.description || 'No description available'}</p>
            <div className="price-section">
              <div className="current-price">{formatIndianRupee(product.price)}</div>
              <div className="tax-info">Inclusive of all taxes</div>
            </div>
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <span className="stock-info">{product.stock} items available</span>
            </div>
            <div className="total-price">
              <span>Total Amount:</span>
              <span>{formatIndianRupee(totalPrice)}</span>
            </div>
            <div className="action-buttons">
              <button className="add-to-cart-btn-detail" onClick={() => { onAddToCart(product, quantity); onClose(); }}><i className="bi bi-cart-plus"></i> Add to Cart</button>
              <button className="buy-now-btn" onClick={() => onBuyNow(product, quantity)}><i className="bi bi-lightning-charge"></i> Buy Now</button>
            </div>
            <div className="delivery-info">
              <div className="info-item"><i className="bi bi-truck"></i><span>Free delivery on orders above ₹500</span></div>
              <div className="info-item"><i className="bi bi-arrow-return-left"></i><span>30 days easy returns</span></div>
              <div className="info-item"><i className="bi bi-shield-check"></i><span>Secure payment</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  const [shippingDetails, setShippingDetails] = useState({
    fullName: '', address: '', city: '', state: '', pincode: '', phone: '', paymentMethod: 'cod'
  });

  // Load data from localStorage on page load
  useEffect(() => {
    const loadedProducts = loadProductsFromStorage();
    setProducts(loadedProducts);
    setLoading(false);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadWishlist(userData.id);
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // ⭐⭐⭐ GOOGLE LOGIN HANDLER ⭐⭐⭐
  const handleGoogleLogin = (userInfo) => {
    const { email, name, picture, sub } = userInfo;
    
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    let existingUser = storedUsers.find(u => u.email === email);
    
    if (!existingUser) {
      const newUser = {
        id: sub,
        name: name,
        email: email,
        picture: picture,
        isAdmin: email === 'pankuchauhan35@gmail.com',
        provider: 'google'
      };
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      existingUser = newUser;
      
      sendWelcomeEmail(email, name);
      showToastMessage(`Welcome ${name}! Check your email for a welcome gift! 🎁`);
    }
    
    const userData = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      picture: existingUser.picture,
      isAdmin: existingUser.isAdmin || email === 'pankuchauhan35@gmail.com'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setShowLogin(false);
    showToastMessage(`Welcome ${name}! 🎉`);
  };

  const loadWishlist = (userId) => {
    const savedWishlist = localStorage.getItem(`wishlist_${userId}`);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  };

  const saveWishlist = (userId, newWishlist) => {
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(newWishlist));
    setWishlist(newWishlist);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      alert('Please login to add items to wishlist');
      setShowLogin(true);
      return;
    }
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      saveWishlist(user.id, wishlist.filter(item => item.id !== product.id));
      showToastMessage(`${product.name} removed from wishlist`);
    } else {
      saveWishlist(user.id, [...wishlist, product]);
      showToastMessage(`${product.name} added to wishlist ❤️`);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const addReview = () => {
    if (!user) {
      alert('Please login to add review');
      setShowLogin(true);
      return;
    }
    const productReviews = JSON.parse(localStorage.getItem(`reviews_${selectedProduct.id}`) || '[]');
    productReviews.push({ id: Date.now(), userName: user.name, rating: reviewRating, comment: reviewText, date: new Date().toISOString() });
    localStorage.setItem(`reviews_${selectedProduct.id}`, JSON.stringify(productReviews));
    showToastMessage('Review added successfully! ⭐');
    setShowReview(false);
    setReviewText('');
    setReviewRating(5);
  };

  const getProductReviews = (productId) => {
    return JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
  };

  const formatIndianRupee = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    
    if (!isLogin) {
      const existingUser = storedUsers.find(u => u.email === email);
      if (existingUser) {
        alert('Email already registered!');
        return;
      }
      const newUser = { id: Date.now(), name, email, password, isAdmin: email === 'pankuchauhan35@gmail.com' };
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      
      const userData = { id: newUser.id, name, email, isAdmin: newUser.isAdmin };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setShowLogin(false);
      
      sendWelcomeEmail(email, name);
      showToastMessage('Registration successful! 🎉 Check your email for welcome gift!');
    } else {
      const foundUser = storedUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        const userData = { id: foundUser.id, name: foundUser.name, email, isAdmin: foundUser.isAdmin };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setShowLogin(false);
        showToastMessage(`Welcome back, ${foundUser.name}! 👋`);
      } else {
        alert('Invalid email or password');
      }
    }
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCart([]);
    setWishlist([]);
    localStorage.removeItem('cart');
    showToastMessage('Logged out successfully 👋');
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    if (existingItem) {
      newCart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
    } else {
      newCart = [...cart, { ...product, quantity }];
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    showToastMessage(`${quantity} x ${product.name} added to cart! 🛒`);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      const updatedCart = cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const handleCheckoutInput = (e) => {
    setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
  };

  const buyNow = (product, quantity = 1) => {
    setCart([{ ...product, quantity }]);
    localStorage.setItem('cart', JSON.stringify([{ ...product, quantity }]));
    setShowProductDetail(false);
    if (!user) {
      alert('Please login to place order');
      setShowLogin(true);
      return;
    }
    setShowCheckout(true);
  };

  const viewProductDetail = (product) => {
    setSelectedProductDetail(product);
    setShowProductDetail(true);
  };

  const saveOrder = (paymentMethod, status = 'Pending') => {
    const orderDetails = {
      id: Date.now(),
      orderId: 'ORD' + Date.now(),
      items: [...cart],
      total: getCartTotal(),
      totalAmount: formatIndianRupee(getCartTotal()),
      customerName: shippingDetails.fullName,
      customerEmail: user?.email,
      customerNameForOrder: user?.name,
      shippingAddress: `${shippingDetails.fullName}, ${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.pincode}, Phone: ${shippingDetails.phone}`,
      paymentMethod: paymentMethod,
      status: status,
      date: new Date().toLocaleString(),
      orderStatus: status === 'Paid' ? 'Processing' : 'Pending'
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(orderDetails);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    setOrders(existingOrders);
    return orderDetails;
  };

  const handlePaymentSuccess = () => {
    const orderDetails = saveOrder('Online Payment', 'Paid');
    setConfirmedOrder(orderDetails);
    setShowOrderConfirmation(true);
    setShowPayment(false);
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
    localStorage.removeItem('cart');
    
    if (user?.email) {
      sendOrderConfirmation(orderDetails, user.email, user.name);
    }
    
    showToastMessage(`Order placed successfully! Order ID: ${orderDetails.orderId}. Check your email for confirmation!`);
  };

  const placeOrder = () => {
    if (!shippingDetails.fullName || !shippingDetails.address || !shippingDetails.city || !shippingDetails.pincode || !shippingDetails.phone) {
      alert('Please fill all shipping details');
      return;
    }
    if (!user) {
      alert('Please login to place order');
      setShowLogin(true);
      return;
    }
    if (shippingDetails.paymentMethod === 'online') {
      setShowCheckout(false);
      setShowPayment(true);
      return;
    }
    
    const orderDetails = saveOrder('Cash on Delivery', 'Pending');
    setConfirmedOrder(orderDetails);
    setShowOrderConfirmation(true);
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
    localStorage.removeItem('cart');
    
    if (user?.email) {
      sendOrderConfirmation(orderDetails, user.email, user.name);
    }
    
    showToastMessage(`Order placed successfully! Order ID: ${orderDetails.orderId}. Check your email for confirmation!`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  if (showDashboard && user) {
    return <CustomerDashboard user={user} onClose={() => setShowDashboard(false)} />;
  }

  if (showAdmin && user?.isAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app">
        <ProductDetailModal show={showProductDetail} onClose={() => setShowProductDetail(false)} product={selectedProductDetail} onAddToCart={addToCart} onBuyNow={buyNow} formatIndianRupee={formatIndianRupee} />

        {/* Toast Notification */}
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="success">
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </div>

        {/* Order Confirmation Modal */}
        <Modal show={showOrderConfirmation} onHide={() => setShowOrderConfirmation(false)} centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>🎉 Order Confirmed!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {confirmedOrder && (
              <>
                <p><strong>Order ID:</strong> {confirmedOrder.orderId}</p>
                <p><strong>Total:</strong> {formatIndianRupee(confirmedOrder.total)}</p>
                <p><strong>Payment:</strong> {confirmedOrder.paymentMethod}</p>
                <p><strong>Shipping Address:</strong> {confirmedOrder.shippingAddress}</p>
                <p><strong>Date:</strong> {confirmedOrder.date}</p>
                <Alert variant="info" className="mt-3">
                  <i className="bi bi-truck"></i> Estimated Delivery: 3-5 business days
                </Alert>
                <Alert variant="success" className="mt-2">
                  <i className="bi bi-envelope"></i> Order confirmation sent to your email!
                </Alert>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => setShowOrderConfirmation(false)}>Continue Shopping</Button>
          </Modal.Footer>
        </Modal>

        {/* Payment Modal */}
        <Modal show={showPayment} onHide={() => setShowPayment(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Payment Gateway - {formatIndianRupee(getCartTotal())}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              <i className="bi bi-info-circle"></i> Demo Payment - Select any option to complete order
            </Alert>
            <div className="text-center p-4">
              <Button variant="success" size="lg" onClick={handlePaymentSuccess} className="me-3">
                <i className="bi bi-credit-card"></i> Pay with Card
              </Button>
              <Button variant="primary" size="lg" onClick={handlePaymentSuccess}>
                <i className="bi bi-phone"></i> Pay with UPI
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPayment(false)}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        {/* Navbar */}
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow">
          <Container>
            <Navbar.Brand href="#" className="d-flex align-items-center">
              <i className="bi bi-shop fs-3 me-2"></i>
              <span className="fw-bold fs-4">ShopHub India</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px', margin: '0 auto' }}>
                <InputGroup>
                  <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <SearchSuggestions 
                  searchTerm={searchTerm}
                  onSelect={(product) => {
                    setSearchTerm(product.name);
                    viewProductDetail(product);
                  }}
                  products={products}
                  formatIndianRupee={formatIndianRupee}
                />
              </div>
              <Nav className="ms-auto align-items-center gap-2">
                <Button variant="outline-light" onClick={() => setShowWishlist(true)} className="position-relative">
                  <i className="bi bi-heart"></i> Wishlist
                  {wishlist.length > 0 && <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">{wishlist.length}</Badge>}
                </Button>
                <Button variant="outline-light" onClick={() => setShowCart(true)} className="position-relative">
                  <i className="bi bi-cart3"></i> Cart
                  {getCartCount() > 0 && <Badge bg="warning" pill className="position-absolute top-0 start-100 translate-middle">{getCartCount()}</Badge>}
                </Button>
                {user ? (
                  <div className="d-flex gap-2 align-items-center">
                    {user.picture && (
                      <img src={user.picture} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    )}
                    <Button variant="outline-light" size="sm" onClick={() => setShowDashboard(true)}>
                      <i className="bi bi-person-circle"></i> {user.name}
                    </Button>
                    {user.isAdmin && <Button variant="info" size="sm" onClick={() => setShowAdmin(true)}><i className="bi bi-speedometer2"></i> Admin</Button>}
                    <Button variant="outline-danger" size="sm" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i></Button>
                  </div>
                ) : (
                  <Button variant="primary" onClick={() => setShowLogin(true)}><i className="bi bi-person"></i> Login</Button>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Category Filter */}
        <div className="category-bar bg-light py-3 border-bottom shadow-sm">
          <Container>
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              {categories.map((category) => (
                <Button key={category} variant={selectedCategory === category ? "primary" : "outline-secondary"} size="sm" onClick={() => setSelectedCategory(category)} className="rounded-pill px-3">
                  {category}
                </Button>
              ))}
            </div>
          </Container>
        </div>

        {/* Promo Banner */}
        {showPromoBanner && (
          <div className="promo-banner py-2" style={{ background: 'linear-gradient(90deg, #ff6b6b, #feca57)' }}>
            <Container>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-dark">
                  <i className="bi bi-megaphone-fill me-2"></i>
                  <strong>🔥 LIMITED TIME OFFER!</strong> Get 10% off on orders above ₹5,000 | Free Shipping on ₹50,000+
                </div>
                <Button variant="link" className="text-dark p-0" onClick={() => setShowPromoBanner(false)}><i className="bi bi-x-lg"></i></Button>
              </div>
            </Container>
          </div>
        )}

        {/* Hero Banner */}
        <div className="hero-banner bg-primary text-white py-5 mb-4">
          <Container className="text-center">
            <h1 className="display-4 fw-bold mb-3">Welcome to ShopHub India</h1>
            <p className="lead mb-0">Amazing products at best prices!</p>
          </Container>
        </div>

        {/* Products Grid */}
        <Container className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3><i className="bi bi-grid-3x3-gap-fill me-2"></i>Featured Products</h3>
            <Badge bg="secondary" pill className="fs-6">{filteredProducts.length} products</Badge>
          </div>
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product.id}>
                <div className="product-card" onClick={() => viewProductDetail(product)}>
                  <div className="image-wrapper position-relative">
                    <Card.Img variant="top" src={product.image} className="product-img" />
                    <Button variant={wishlist.some((item) => item.id === product.id) ? "danger" : "light"} size="sm" className="wishlist-btn position-absolute top-0 end-0 m-2 rounded-circle" onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}>
                      <i className={`bi ${wishlist.some((item) => item.id === product.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </Button>
                    {product.stock < 20 && <Badge bg="warning" className="stock-badge">Only {product.stock} left</Badge>}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="fs-6 fw-bold mb-0">{product.name}</Card.Title>
                      <Badge bg="info" pill>{product.brand || 'Generic'}</Badge>
                    </div>
                    <Card.Text className="small text-muted">
                      {product.description ? product.description.substring(0, 60) : 'No description available'}...
                    </Card.Text>
                    <div className="rating mb-2">
                      {'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}
                      <span className="small text-muted ms-1">({product.rating || 0})</span>
                      <Button variant="link" size="sm" className="p-0 ms-2" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowReview(true); }}>
                        <i className="bi bi-chat-dots"></i> Reviews
                      </Button>
                    </div>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-primary mb-0 fw-bold">{formatIndianRupee(product.price)}</h5>
                        <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="rounded-pill">
                          <i className="bi bi-cart-plus"></i> Add
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </div>
              </Col>
            ))}
          </Row>
        </Container>

        {/* Rest of the modals and footer remain same as before */}
        
        {/* Wishlist Modal */}
        <Modal show={showWishlist} onHide={() => setShowWishlist(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title><i className="bi bi-heart-fill me-2"></i>My Wishlist ({wishlist.length})</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {wishlist.length === 0 ? (
              <div className="text-center py-5"><i className="bi bi-emoji-frown fs-1"></i><p>Your wishlist is empty!</p></div>
            ) : (
              <Row>
                {wishlist.map((product) => (
                  <Col md={6} key={product.id} className="mb-3">
                    <Card>
                      <Row className="g-0">
                        <Col md={4}><Card.Img src={product.image} style={{ height: '100%', objectFit: 'cover' }} /></Col>
                        <Col md={8}>
                          <Card.Body>
                            <Card.Title className="fs-6">{product.name}</Card.Title>
                            <Card.Text className="text-primary fw-bold">{formatIndianRupee(product.price)}</Card.Text>
                            <Button size="sm" variant="primary" onClick={() => addToCart(product)}><i className="bi bi-cart-plus"></i> Add to Cart</Button>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Modal.Body>
        </Modal>

        {/* Review Modal */}
        <Modal show={showReview} onHide={() => setShowReview(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reviews for {selectedProduct?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-4">
              <h6>Write a Review</h6>
              <Form.Group className="mb-2">
                <Form.Select value={reviewRating} onChange={(e) => setReviewRating(parseInt(e.target.value))}>
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4)</option>
                  <option value={3}>★★★☆☆ (3)</option>
                  <option value={2}>★★☆☆☆ (2)</option>
                  <option value={1}>★☆☆☆☆ (1)</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control as="textarea" rows={3} placeholder="Write your review..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              </Form.Group>
              <Button variant="primary" onClick={addReview}>Submit Review</Button>
            </div>
            <hr />
            <h6>Customer Reviews</h6>
            {getProductReviews(selectedProduct?.id).length === 0 ? (
              <p className="text-muted">No reviews yet. Be the first to review!</p>
            ) : (
              getProductReviews(selectedProduct?.id).map((review) => (
                <div key={review.id} className="mb-3 p-2 bg-light rounded">
                  <div className="fw-bold">{review.userName}</div>
                  <div className="text-warning">{'★'.repeat(review.rating)}</div>
                  <div className="small">{review.comment}</div>
                  <div className="small text-muted">{new Date(review.date).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </Modal.Body>
        </Modal>

        {/* Cart Modal */}
        <Modal show={showCart} onHide={() => setShowCart(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title><i className="bi bi-cart3 me-2"></i>Your Cart ({getCartCount()} items)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {cart.length === 0 ? (
              <div className="text-center py-5"><i className="bi bi-emoji-smile fs-1"></i><p>Your cart is empty!</p></div>
            ) : (
              <Table responsive>
                <thead>
                  <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                          <span className="fw-bold">{item.name}</span>
                        </div>
                       </td>
                      <td className="align-middle">{formatIndianRupee(item.price)}</td>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="outline-secondary" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                          <span className="fw-bold">{item.quantity}</span>
                          <Button size="sm" variant="outline-secondary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                        </div>
                       </td>
                      <td className="align-middle fw-bold">{formatIndianRupee(item.price * item.quantity)}</td>
                      <td className="align-middle">
                        <Button variant="link" className="text-danger" onClick={() => removeFromCart(item.id)}><i className="bi bi-trash"></i></Button>
                       </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-active">
                    <td colSpan="3" className="text-end fw-bold">Total:</td>
                    <td colSpan="2" className="fw-bold fs-5 text-primary">{formatIndianRupee(getCartTotal())}</td>
                  </tr>
                </tfoot>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCart(false)}>Continue Shopping</Button>
            {cart.length > 0 && <Button variant="success" onClick={() => { setShowCart(false); setShowCheckout(true); }}><i className="bi bi-credit-card"></i> Checkout</Button>}
          </Modal.Footer>
        </Modal>

        {/* Checkout Modal */}
        <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title><i className="bi bi-clipboard-check me-2"></i>Checkout</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h5>Order Summary</h5>
                <div className="bg-light p-3 rounded">
                  {cart.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between mb-2">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{formatIndianRupee(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span className="text-success">{formatIndianRupee(getCartTotal())}</span>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <h5>Shipping Details</h5>
                <Form>
                  <Form.Control className="mb-2" type="text" name="fullName" placeholder="Full Name" value={shippingDetails.fullName} onChange={handleCheckoutInput} required />
                  <Form.Control className="mb-2" type="text" name="address" placeholder="Address" value={shippingDetails.address} onChange={handleCheckoutInput} required />
                  <Form.Control className="mb-2" type="text" name="city" placeholder="City" value={shippingDetails.city} onChange={handleCheckoutInput} required />
                  <Form.Control className="mb-2" type="text" name="state" placeholder="State" value={shippingDetails.state} onChange={handleCheckoutInput} />
                  <Form.Control className="mb-2" type="text" name="pincode" placeholder="PIN Code" value={shippingDetails.pincode} onChange={handleCheckoutInput} required />
                  <Form.Control className="mb-2" type="tel" name="phone" placeholder="Phone" value={shippingDetails.phone} onChange={handleCheckoutInput} required />
                  <Form.Select name="paymentMethod" value={shippingDetails.paymentMethod} onChange={handleCheckoutInput}>
                    <option value="cod">💰 Cash on Delivery</option>
                    <option value="online">💳 Online Payment (UPI / Card)</option>
                  </Form.Select>
                </Form>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckout(false)}>Back</Button>
            <Button variant="success" onClick={placeOrder}>Place Order</Button>
          </Modal.Footer>
        </Modal>

        {/* Login Modal */}
        <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title><i className="bi bi-person-circle me-2"></i>{isLogin ? 'Login' : 'Register'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleLogin}>
              {!isLogin && <Form.Control className="mb-3" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />}
              <Form.Control className="mb-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Form.Control className="mb-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" variant="primary" className="w-100">{isLogin ? 'Login' : 'Register'}</Button>
            </Form>
            
            <hr className="my-3" />
            <div className="text-center">
              <p className="text-muted small">Or continue with</p>
              <div className="d-flex justify-content-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const decoded = jwtDecode(credentialResponse.credential);
                    handleGoogleLogin(decoded);
                  }}
                  onError={() => {
                    alert('Google login failed. Please try again.');
                  }}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="250"
                />
              </div>
            </div>
            
            <div className="text-center mt-3">
              <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "New user? Register" : "Existing user? Login"}
              </Button>
            </div>
            <Alert variant="info" className="mt-3 small">
              <i className="bi bi-shield-lock me-2"></i> Create account to start shopping!
            </Alert>
          </Modal.Body>
        </Modal>

        {/* Floating WhatsApp Button */}
        <a href="https://wa.me/919876543210?text=Hi%20ShopHub%2C%20I%20need%20help%20with%20my%20order" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000, backgroundColor: '#25D366', color: 'white', borderRadius: '50%', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
          <i className="bi bi-whatsapp" style={{ fontSize: '30px' }}></i>
        </a>

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button onClick={() => setShowCart(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, backgroundColor: '#1a1a2e', color: 'white', borderRadius: '50%', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: 'none', transition: 'transform 0.3s', animation: 'pulse 1.5s infinite' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <i className="bi bi-cart3" style={{ fontSize: '24px' }}></i>
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ff6b6b', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getCartCount()}</span>
          </button>
        )}

        {/* Footer */}
        <footer className="bg-dark text-white mt-5 py-4">
          <Container>
            <Row>
              <Col md={4}>
                <h5><i className="bi bi-shop me-2"></i> ShopHub India</h5>
                <p className="small">Your one-stop destination for quality products.</p>
              </Col>
              <Col md={4}>
                <h5>Quick Links</h5>
                <ul className="list-unstyled small">
                  <li><a href="#" className="text-white-50 text-decoration-none">About Us</a></li>
                  <li><a href="#" className="text-white-50 text-decoration-none">Contact</a></li>
                  <li><a href="#" className="text-white-50 text-decoration-none">Returns</a></li>
                </ul>
              </Col>
              <Col md={4}>
                <h5>Contact</h5>
                <p className="small mb-1"><i className="bi bi-envelope me-2"></i> support@shophub.com</p>
                <p className="small"><i className="bi bi-telephone me-2"></i> +91 98765 43210</p>
              </Col>
            </Row>
            <hr />
            <p className="text-center small mb-0">&copy; 2025 ShopHub India. All rights reserved.</p>
          </Container>
        </footer>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;