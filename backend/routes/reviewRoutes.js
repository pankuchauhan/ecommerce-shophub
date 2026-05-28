const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Add review
router.post('/add', async (req, res) => {
  try {
    const { productId, userId, userName, rating, comment } = req.body;
    const product = await Product.findById(productId);
    
    product.ratings.push({
      user: userId,
      userName,
      rating,
      comment
    });
    
    await product.save();
    res.json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    res.json({ success: true, reviews: product.ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;