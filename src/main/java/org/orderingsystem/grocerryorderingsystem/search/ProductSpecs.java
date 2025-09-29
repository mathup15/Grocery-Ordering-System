package org.orderingsystem.grocerryorderingsystem.search;

import jakarta.persistence.criteria.*;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecs {

    public static Specification<Product> activeTrue() {
        return (root, cq, cb) -> cb.isTrue(root.get("active"));
    }

    public static Specification<Product> q(String q) {
        if (q == null || q.isBlank()) return null;
        String like = "%" + q.trim().toLowerCase() + "%";
        return (root, cq, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("sku")), like),
                cb.like(cb.lower(root.get("category")), like)
        );
    }

    public static Specification<Product> category(String category) {
        if (category == null || category.isBlank()) return null;
        return (root, cq, cb) -> cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase());
    }

    public static Specification<Product> priceMin(Double min) {
        if (min == null) return null;
        return (root, cq, cb) -> cb.ge(root.get("price"), min);
    }

    public static Specification<Product> priceMax(Double max) {
        if (max == null) return null;
        return (root, cq, cb) -> cb.le(root.get("price"), max);
    }

    /** available = stockOnHand - reservedQty > 0 */
    public static Specification<Product> inStockOnly(Boolean flag) {
        if (flag == null || !flag) return null;
        return (root, cq, cb) -> {
            Join<Product, Inventory> inv = root.join("inventory", JoinType.LEFT);
            Expression<Integer> soh = cb.coalesce(inv.get("stockOnHand"), 0);
            Expression<Integer> res = cb.coalesce(inv.get("reservedQty"), 0);
            return cb.greaterThan(cb.diff(soh, res), 0);
        };
    }

    /**
     * NEW METHOD: Always fetch inventory relationship to avoid LazyLoadingException
     */
    public static Specification<Product> fetchInventory() {
        return (root, query, cb) -> {
            if (query.getResultType() == Product.class) {
                root.fetch("inventory", JoinType.LEFT);
            }
            return cb.conjunction();
        };
    }
}