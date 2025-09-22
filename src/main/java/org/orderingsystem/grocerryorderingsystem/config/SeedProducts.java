package org.orderingsystem.grocerryorderingsystem.config;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.Product;
import org.orderingsystem.grocerryorderingsystem.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
public class SeedProducts {

    @Bean
    CommandLineRunner seedData(ProductRepository productRepo) { // Changed method name to seedData
        return args -> {
            if (productRepo.count() == 0) {
                // Fruits
                productRepo.save(Product.builder()
                        .name("Fresh Bananas")
                        .description("Organic yellow bananas, sweet and nutritious")
                        .price(new BigDecimal("2.99"))
                        .stockQuantity(100)
                        .category("Fruits")
                        .imageUrl("https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(1.0)
                        .unit("lb")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Red Apples")
                        .description("Crisp and sweet red apples, perfect for snacking")
                        .price(new BigDecimal("3.49"))
                        .stockQuantity(75)
                        .category("Fruits")
                        .imageUrl("https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(2.0)
                        .unit("lb")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Fresh Oranges")
                        .description("Juicy Valencia oranges, rich in vitamin C")
                        .price(new BigDecimal("4.99"))
                        .stockQuantity(60)
                        .category("Fruits")
                        .imageUrl("https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300")
                        .isOrganic(false)
                        .isGlutenFree(true)
                        .weight(3.0)
                        .unit("lb")
                        .isActive(true)
                        .build());

                // Vegetables
                productRepo.save(Product.builder()
                        .name("Fresh Broccoli")
                        .description("Fresh green broccoli crowns, perfect for steaming")
                        .price(new BigDecimal("2.49"))
                        .stockQuantity(40)
                        .category("Vegetables")
                        .imageUrl("https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(1.5)
                        .unit("lb")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Baby Carrots")
                        .description("Sweet baby carrots, pre-washed and ready to eat")
                        .price(new BigDecimal("1.99"))
                        .stockQuantity(80)
                        .category("Vegetables")
                        .imageUrl("https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(1.0)
                        .unit("lb")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Fresh Spinach")
                        .description("Organic baby spinach leaves, perfect for salads")
                        .price(new BigDecimal("3.99"))
                        .stockQuantity(35)
                        .category("Vegetables")
                        .imageUrl("https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(0.5)
                        .unit("lb")
                        .isActive(true)
                        .build());

                // Dairy
                productRepo.save(Product.builder()
                        .name("Whole Milk")
                        .description("Fresh whole milk, 1 gallon")
                        .price(new BigDecimal("4.49"))
                        .stockQuantity(50)
                        .category("Dairy")
                        .imageUrl("https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300")
                        .isOrganic(false)
                        .isGlutenFree(true)
                        .weight(8.6)
                        .unit("lb")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Greek Yogurt")
                        .description("Creamy Greek yogurt, plain, 32oz")
                        .price(new BigDecimal("5.99"))
                        .stockQuantity(30)
                        .category("Dairy")
                        .imageUrl("https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(2.0)
                        .unit("lb")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Cheddar Cheese")
                        .description("Sharp cheddar cheese, 8oz block")
                        .price(new BigDecimal("4.99"))
                        .stockQuantity(25)
                        .category("Dairy")
                        .imageUrl("https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300")
                        .isOrganic(false)
                        .isGlutenFree(true)
                        .weight(0.5)
                        .unit("lb")
                        .isActive(true)
                        .build());

                // Bakery
                productRepo.save(Product.builder()
                        .name("Sourdough Bread")
                        .description("Artisan sourdough bread, freshly baked")
                        .price(new BigDecimal("5.99"))
                        .stockQuantity(20)
                        .category("Bakery")
                        .imageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300")
                        .isOrganic(false)
                        .isGlutenFree(false)
                        .weight(1.5)
                        .unit("loaf")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Croissants")
                        .description("Buttery French croissants, 6 pack")
                        .price(new BigDecimal("6.49"))
                        .stockQuantity(15)
                        .category("Bakery")
                        .imageUrl("https://images.unsplash.com/photo-1555507036-ab794f576c93?w=300")
                        .isOrganic(false)
                        .isGlutenFree(false)
                        .weight(1.0)
                        .unit("pack")
                        .isActive(true)
                        .build());

                // Meat & Seafood
                productRepo.save(Product.builder()
                        .name("Chicken Breast")
                        .description("Fresh boneless chicken breast, family pack")
                        .price(new BigDecimal("8.99"))
                        .stockQuantity(40)
                        .category("Meat")
                        .imageUrl("https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300")
                        .isOrganic(false)
                        .isGlutenFree(true)
                        .weight(2.5)
                        .unit("lb")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Salmon Fillet")
                        .description("Fresh Atlantic salmon fillets")
                        .price(new BigDecimal("12.99"))
                        .stockQuantity(25)
                        .category("Seafood")
                        .imageUrl("https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300")
                        .isOrganic(false)
                        .isGlutenFree(true)
                        .weight(1.0)
                        .unit("lb")
                        .isActive(true)
                        .build());

                // Pantry Items
                productRepo.save(Product.builder()
                        .name("Olive Oil")
                        .description("Extra virgin olive oil, 500ml bottle")
                        .price(new BigDecimal("7.99"))
                        .stockQuantity(30)
                        .category("Pantry")
                        .imageUrl("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(1.1)
                        .unit("bottle")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Basmati Rice")
                        .description("Premium basmati rice, 2lb bag")
                        .price(new BigDecimal("4.99"))
                        .stockQuantity(50)
                        .category("Pantry")
                        .imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300")
                        .isOrganic(true)
                        .isGlutenFree(true)
                        .weight(2.0)
                        .unit("bag")
                        .isActive(true)
                        .build());

                productRepo.save(Product.builder()
                        .name("Pasta")
                        .description("Whole wheat penne pasta, 1lb box")
                        .price(new BigDecimal("2.49"))
                        .stockQuantity(60)
                        .category("Pantry")
                        .imageUrl("https://images.unsplash.com/photo-1551892589-865f69869476?w=300")
                        .isOrganic(false)
                        .isGlutenFree(false)
                        .weight(1.0)
                        .unit("box")
                        .isActive(true)
                        .build());

                System.out.println("Sample products have been seeded successfully!");
            }
        };
    }
}