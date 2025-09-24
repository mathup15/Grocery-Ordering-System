package org.orderingsystem.grocerryorderingsystem.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartDto {
    private Long id;
    private Long userId;
    private List<CartItemDto> items;
    private BigDecimal totalAmount;
    private Integer totalItems;

    public CartDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
}