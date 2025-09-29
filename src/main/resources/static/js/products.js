const products = [
    {
        id: 'veg-001',
        name: 'Organic Mixed Vegetables',
        description: 'Farm fresh organic vegetables, 500g. Locally sourced from certified organic farms.',
        price: 1250,
        category: 'vegetables',
        brand: 'FreshFarm',
        stock: 25,
        dietary: ['organic', 'vegan', 'gluten-free'],
        availability: 'in-stock',
        images: [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
        ],
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'
    },
    {
        id: 'veg-002',
        name: 'Mukunuwenna',
        description: 'Fresh leafy greens, 250g. Rich in vitamins and minerals.',
        price: 180,
        category: 'vegetables',
        brand: 'LocalFresh',
        stock: 15,
        dietary: ['vegan', 'gluten-free'],
        availability: 'in-stock',
        images: ['https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400'],
        image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400'
    },
    {
        id: 'veg-003',
        name: 'Gotukola',
        description: 'Centella asiatica, 200g. Traditional medicinal herb with brain-boosting properties.',
        price: 220,
        category: 'vegetables',
        brand: 'HerbGarden',
        stock: 8,
        dietary: ['organic', 'vegan', 'gluten-free'],
        availability: 'low-stock',
        images: ['https://images.unsplash.com/photo-1553978297-833d24758ba5?w=400'],
        image: 'https://images.unsplash.com/photo-1553978297-833d24758ba5?w=400'
    },
    {
        id: 'veg-004',
        name: 'Kankun',
        description: 'Water spinach, 300g. High in iron and vitamins A, C.',
        price: 150,
        category: 'vegetables',
        brand: 'LocalFresh',
        stock: 0,
        dietary: ['vegan', 'gluten-free'],
        availability: 'out-of-stock',
        images: ['https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400'],
        image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400'
    },
    {
        id: 'fruit-001',
        name: 'Tropical Fruit Basket',
        description: 'Assorted tropical fruits, 1.5kg. Premium selection of seasonal fruits.',
        price: 2350,
        category: 'fruits',
        brand: 'TropicalDelight',
        stock: 12,
        dietary: ['organic', 'vegan', 'gluten-free'],
        availability: 'in-stock',
        images: [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
        ],
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    {
        id: 'fruit-002',
        name: 'Rambutan',
        description: 'Fresh tropical fruit, 500g',
        price: 480,
        category: 'fruits',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
    },
    {
        id: 'fruit-003',
        name: 'Mangosteen',
        description: 'Queen of fruits, 400g',
        price: 850,
        category: 'fruits',
        image: 'https://images.unsplash.com/photo-1605027990121-3b2c6c8cb5fb?w=400'
    },
    {
        id: 'fruit-004',
        name: 'Wood Apple (Divul)',
        description: 'Traditional Sri Lankan fruit, 1 piece',
        price: 120,
        category: 'fruits',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
    },
    {
        id: 'dairy-001',
        name: 'Fresh Whole Milk',
        description: 'Pure cow milk, 1 liter. From grass-fed cows, rich in calcium and protein.',
        price: 450,
        category: 'dairy',
        brand: 'PureDairy',
        stock: 30,
        dietary: ['vegetarian'],
        availability: 'in-stock',
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'
    },
    {
        id: 'dairy-002',
        name: 'Buffalo Curd (Meekiri)',
        description: 'Traditional clay pot curd, 400g',
        price: 380,
        category: 'dairy',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'
    },
    {
        id: 'dairy-003',
        name: 'Kithul Treacle (Pani)',
        description: 'Pure palm syrup, 250ml',
        price: 450,
        category: 'dairy',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'
    },
    {
        id: 'meat-001',
        name: 'Fresh Chicken Breast',
        description: 'Premium quality, 1kg',
        price: 1800,
        category: 'meat',
        image: 'https://images.unsplash.com/photo-1588347818481-c7c1b8b8e8b8?w=400'
    },
    {
        id: 'seafood-001',
        name: 'Dried Fish (Karawala)',
        description: 'Traditional preserved fish, 250g',
        price: 680,
        category: 'seafood',
        image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400'
    },
    {
        id: 'seafood-002',
        name: 'Sprats (Halmasso)',
        description: 'Fresh small fish, 500g',
        price: 420,
        category: 'seafood',
        image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400'
    },
    {
        id: 'bakery-001',
        name: 'Whole Wheat Bread',
        description: 'Fresh baked daily, 500g. Made with 100% whole wheat flour.',
        price: 320,
        category: 'bakery',
        brand: 'ArtisanBakery',
        stock: 18,
        dietary: ['vegetarian'],
        availability: 'in-stock',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
    },
    {
        id: 'bakery-002',
        name: 'Gluten-Free Bread',
        description: 'Artisan gluten-free bread, 400g. Made with rice and almond flour.',
        price: 580,
        category: 'bakery',
        brand: 'HealthyBake',
        stock: 6,
        dietary: ['gluten-free', 'vegetarian'],
        availability: 'low-stock',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
    },
    {
        id: 'grains-001',
        name: 'Red Rice (Rathu Hal)',
        description: 'Traditional Sri Lankan rice, 1kg',
        price: 380,
        category: 'grains',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
    },
    {
        id: 'grains-002',
        name: 'Samba Rice',
        description: 'Premium quality, 2kg',
        price: 520,
        category: 'grains',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
    },
    {
        id: 'spices-001',
        name: 'Ceylon Cinnamon',
        description: 'Premium grade, 100g',
        price: 650,
        category: 'spices',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
    },
    {
        id: 'spices-002',
        name: 'Curry Leaves (Karapincha)',
        description: 'Fresh aromatic leaves, 50g',
        price: 80,
        category: 'spices',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
    },
    {
        id: 'spices-003',
        name: 'Pandan Leaves (Rampe)',
        description: 'Natural flavoring, 10 leaves',
        price: 60,
        category: 'spices',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
    },
    {
        id: 'spices-004',
        name: 'Roasted Curry Powder',
        description: 'Traditional blend, 200g',
        price: 320,
        category: 'spices',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
    },
    {
        id: 'beverages-001',
        name: 'King Coconut (Thambili)',
        description: 'Fresh natural drink, 1 piece. Natural electrolytes and minerals.',
        price: 180,
        category: 'beverages',
        brand: 'NaturalDrinks',
        stock: 20,
        dietary: ['organic', 'vegan', 'gluten-free'],
        availability: 'in-stock',
        images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'],
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'
    },
    {
        id: 'beverages-002',
        name: 'Ceylon Black Tea',
        description: 'Premium grade BOPF, 200g. Single estate tea from Nuwara Eliya.',
        price: 580,
        category: 'beverages',
        brand: 'CeylonTea Co.',
        stock: 45,
        dietary: ['organic', 'vegan', 'gluten-free'],
        availability: 'in-stock',
        images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'],
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'
    },
    {
        id: 'snacks-001',
        name: 'Kokis',
        description: 'Traditional Sri Lankan snack, 200g. Crispy and delicious festival treat.',
        price: 280,
        category: 'snacks',
        brand: 'TraditionalTreats',
        stock: 22,
        dietary: ['vegetarian'],
        availability: 'in-stock',
        images: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400'],
        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400'
    },
    {
        id: 'snacks-002',
        name: 'Murukku',
        description: 'Crispy spiral snack, 150g. Made with rice flour and traditional spices.',
        price: 240,
        category: 'snacks',
        brand: 'SpiceSnacks',
        stock: 16,
        dietary: ['vegetarian', 'gluten-free'],
        availability: 'in-stock',
        images: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400'],
        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400'
    }
];

window.products = products;