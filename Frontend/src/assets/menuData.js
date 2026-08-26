import { cakeImages } from './cakeimages/Menus_Image';
import { partyEssentials as partyItems } from './partyEssentials';

// 1. Customized Cakes Categories & Data
export const customizedCakesCategories = [
  { id: 'custom-1', name: 'Photo Print Cake', category: 'Photo Cakes', price: '₹899', isEggless: true, isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80', description: 'HD edible photo print on rich vanilla cream cake.' },
  { id: 'custom-2', name: 'Superhero Theme Cake', category: 'Theme Cakes', price: '₹1,299', isEggless: false, isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=500&auto=format&fit=crop&q=80', description: '3D Fondant superhero sculpted celebration cake.' },
  { id: 'custom-3', name: 'Golden Monogram Name Cake', category: 'Name Cakes', price: '₹1,099', isEggless: true, isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=80', description: 'Personalized letter/number cake decorated with macarons and flowers.' },
  { id: 'custom-4', name: 'Cute Cartoon Character Cake', category: 'Character Cakes', price: '₹1,199', isEggless: true, isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=80', description: 'Custom hand-piped cartoon theme birthday cake.' },
  { id: 'custom-5', name: 'Tiered Floral Wedding Cake', category: 'Wedding Custom Cakes', price: '₹2,499', isEggless: true, isVeg: true, rating: 5.0, image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500&auto=format&fit=crop&q=80', description: '2-Tier elegant wedding cake with edible gold leaf and fresh roses.' }
];

// 2. Desserts & Bakery Section
export const dessertsBakery = [
  { id: 'dessert-1', name: 'Velvet Chocolate Cupcake', category: 'Cupcakes', price: '₹89', isEggless: true, isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=80', description: 'Fluffy Belgian chocolate cupcake with swirl frosting.' },
  { id: 'dessert-2', name: 'Fudge Walnut Brownie', category: 'Brownies', price: '₹119', isEggless: false, isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80', description: 'Gooey dark chocolate brownie loaded with roasted walnuts.' },
  { id: 'dessert-3', name: 'Choco Chip Chunk Cookies (3 Pcs)', category: 'Cookies', price: '₹129', isEggless: true, isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=80', description: 'Warm baked butter cookies with rich chocolate chunks.' },
  { id: 'dessert-4', name: 'Glazed Strawberry Donut', category: 'Donuts', price: '₹99', isEggless: true, isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80', description: 'Soft fried ring donut dipped in strawberry glaze and sprinkles.' },
  { id: 'dessert-5', name: 'Blueberry Cheesecake Pastry', category: 'Pastries', price: '₹149', isEggless: true, isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80', description: 'Creamy New York style cheesecake slice topped with wild blueberry compote.' },
  { id: 'dessert-6', name: 'Blueberry Vanilla Muffin', category: 'Muffins', price: '₹85', isEggless: true, isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500&auto=format&fit=crop&q=80', description: 'Moist baked muffin bursting with fresh blueberries.' },
  { id: 'dessert-7', name: 'Rainbow Sprinkles Cake Pop (2 Pcs)', category: 'Cake Pops', price: '₹79', isEggless: true, isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80', description: 'Chocolate cake bites dipped in white chocolate and sprinkles.' }
];

// 3. Snacks & Fast Food Section
export const snacksFastFood = [
  { 
    id: 'snack-1', 
    name: 'Gourmet Cheese Burst Pizza', 
    category: 'Pizza', 
    price: '₹299', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.9, 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', 
    description: 'Loaded mozzarella cheese, bell peppers, corn, and olives on herb crust.',
    variants: ['Small 8"', 'Medium 10"', 'Large 12"']
  },
  { 
    id: 'snack-2', 
    name: 'Crispy Veggie Supreme Burger', 
    category: 'Burgers', 
    price: '₹149', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.8, 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', 
    description: 'Crispy herb patty with melted cheddar, lettuce, tomato & mayo in brioche bun.',
    variants: ['Single Patty', 'Double Cheese Burst']
  },
  { 
    id: 'snack-3', 
    name: 'Peri Peri Seasoned Fries', 
    category: 'French Fries', 
    price: '₹119', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.7, 
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80', 
    description: 'Golden crispy potato fries tossed in spicy peri-peri seasoning.',
    variants: ['Regular', 'Large', 'Cheesy Loaded']
  },
  { 
    id: 'snack-4', 
    name: 'Paneer Tikka Grilled Sandwich', 
    category: 'Sandwiches', 
    price: '₹169', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.8, 
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80', 
    description: 'Smoky grilled paneer cubes, mint chutney, and cheese in jumbo brown bread.',
    variants: ['Regular', 'With Fries']
  },
  { 
    id: 'snack-5', 
    name: 'Mexican Bean & Cheese Wrap', 
    category: 'Wraps', 
    price: '₹159', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.8, 
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80', 
    description: 'Soft tortilla rolled with Mexican spiced veggies, salsa, and melted cheese.',
    variants: ['Veggie Wrap', 'Paneer Wrap']
  }
];

// 4. Tea & Coffee / Beverages Section
export const beverages = [
  { 
    id: 'bev-1', 
    name: 'Special Masala Chai', 
    category: 'Tea', 
    price: '₹49', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.9, 
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80', 
    description: 'Aromatic Indian tea brewed with ginger, cardamom, and whole spices.',
    variants: ['Regular', 'Kulhad Special']
  },
  { 
    id: 'bev-2', 
    name: 'Classic Hot Espresso Coffee', 
    category: 'Hot Coffee', 
    price: '₹99', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.8, 
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80', 
    description: 'Rich dark espresso shot steamed with creamy whole milk and foam.',
    variants: ['Cappuccino', 'Latte', 'Mocha']
  },
  { 
    id: 'bev-3', 
    name: 'Iced Hazelnut Cold Coffee', 
    category: 'Cold Coffee', 
    price: '₹149', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.9, 
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80', 
    description: 'Chilled espresso blended with ice cream, hazelnut syrup, and chocolate drizzle.',
    variants: ['Regular', 'With Vanilla Ice Cream']
  },
  { 
    id: 'bev-4', 
    name: 'Belgian Chocolate Milkshake', 
    category: 'Milkshakes', 
    price: '₹169', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.9, 
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80', 
    description: 'Thick creamy milkshake made with rich Belgian dark chocolate ice cream.',
    variants: ['Medium', 'Large']
  },
  { 
    id: 'bev-5', 
    name: 'Fresh Orange Sunshine Juice', 
    category: 'Fresh Juices', 
    price: '₹119', 
    isVeg: true, 
    isEggless: true, 
    rating: 4.7, 
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80', 
    description: '100% freshly pressed orange juice with no added preservatives.',
    variants: ['300ml Glass', '500ml Bottle']
  }
];

// Export Party Essentials dataset from partyEssentials.js
export const partyEssentials = partyItems;
