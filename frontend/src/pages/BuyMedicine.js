import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const BuyMedicine = ({ translations }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample medicine data with more pesticides
  const medicines = [
    {
      id: 1,
      name: 'Fungicide X',
      description: 'Effective against common fungal diseases in crops',
      price: 29.99,
      image: '/images/pesticide-3.jpg',
      category: 'Fungicide'
    },
    {
      id: 2,
      name: 'Pesticide Y',
      description: 'Broad-spectrum pesticide for various crop pests',
      price: 39.99,
      image: '/images/pesticide-2.jpg',
      category: 'Pesticide'
    },
    {
      id: 3,
      name: 'Growth Enhancer Z',
      description: 'Promotes healthy plant growth and development',
      price: 24.99,
      image: '/images/pesticide-7.jpg',
      category: 'Growth Enhancer'
    },
    {
      id: 4,
      name: 'Nutrient Mix A',
      description: 'Complete nutrient solution for optimal plant health',
      price: 34.99,
      image: '/images/pesticide-8.jpg',
      category: 'Nutrient'
    },
    {
      id: 5,
      name: 'Organic Pesticide Spray',
      description: 'Natural pest control solution for organic farming',
      price: 19.99,
      image: '/images/pesticide-1.jpg',
      category: 'Organic'
    },
    {
      id: 6,
      name: 'Herbicide Pro',
      description: 'Effective weed control for large agricultural areas',
      price: 44.99,
      image: '/images/pesticide-4.jpg',
      category: 'Herbicide'
    },
    {
      id: 7,
      name: 'Insecticide Granules',
      description: 'Long-lasting protection against soil-dwelling insects',
      price: 32.99,
      image: '/images/pesticide-5.jpg',
      category: 'Insecticide'
    },
    {
      id: 8,
      name: 'Biological Pest Control',
      description: 'Beneficial insects for natural pest management',
      price: 49.99,
      image: '/images/pesticide-6.jpg',
      category: 'Biological'
    },
    {
      id: 9,
      name: 'Soil Treatment Plus',
      description: 'Comprehensive soil treatment for disease prevention',
      price: 37.99,
      image: '/images/pesticide-8.jpg',
      category: 'Soil Treatment'
    }
  ];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = 
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(medicineId);
      return;
    }
    setCart(cart.map(item =>
      item.id === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Here you would typically handle the checkout process
    alert('Checkout functionality will be implemented here');
    setCartOpen(false);
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  // Get unique categories for tabs
  const categories = ['all', ...new Set(medicines.map(medicine => medicine.category))];

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Buy Medicine
          </Typography>
          <IconButton color="primary" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search medicines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            variant="scrollable" 
            scrollButtons="auto"
            aria-label="medicine categories"
          >
            {categories.map((category) => (
              <Tab 
                key={category} 
                label={category.charAt(0).toUpperCase() + category.slice(1)} 
                value={category} 
              />
            ))}
          </Tabs>
        </Box>

        <Grid container spacing={4}>
          {filteredMedicines.map((medicine) => (
            <Grid item xs={12} sm={6} md={4} key={medicine.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={medicine.image}
                    alt={medicine.name}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {medicine.name}
                      </Typography>
                      <Chip 
                        label={medicine.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {medicine.description}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      ${medicine.price}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => addToCart(medicine)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Shopping Cart</DialogTitle>
          <DialogContent>
            {cart.length === 0 ? (
              <Typography>Your cart is empty</Typography>
            ) : (
              <List>
                {cart.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={`$${item.price} x ${item.quantity}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography component="span" sx={{ mx: 1 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Box sx={{ width: '100%', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Total: ${getTotalPrice().toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Checkout
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default BuyMedicine; 