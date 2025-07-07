export const generateMockItems = (count = 1000) => {
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Home & Garden', 'Automotive', 'Health', 'Beauty', 'Toys'];

  const itemNames = [
    'Laptop Pro',
    'Wireless Headphones',
    'Gaming Chair',
    'Smart Watch',
    'Bluetooth Speaker',
    'Office Desk',
    'Running Shoes',
    'Coffee Maker',
    'Tablet',
    'Smartphone',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Webcam',
    'Backpack',
    'Water Bottle',
    'Notebook',
    'Pen Set',
    'Calculator',
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `${itemNames[index % itemNames.length]} ${Math.floor(index / itemNames.length) + 1}`,
    category: categories[index % categories.length],
    price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};
