package com.infosys.springboard.ecobazaar.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"seller", "category"})
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Price at the time of order

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal carbonImpact; // Carbon impact at the time of order

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCarbon;

    // Constructors
    public OrderItem() {
    }

    public OrderItem(Product product, Integer quantity, BigDecimal price, BigDecimal carbonImpact) {
        this.product = product;
        this.quantity = quantity;
        this.price = price;
        this.carbonImpact = carbonImpact;
        this.subtotal = price.multiply(new BigDecimal(quantity));
        this.totalCarbon = carbonImpact.multiply(new BigDecimal(quantity));
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getCarbonImpact() {
        return carbonImpact;
    }

    public void setCarbonImpact(BigDecimal carbonImpact) {
        this.carbonImpact = carbonImpact;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTotalCarbon() {
        return totalCarbon;
    }

    public void setTotalCarbon(BigDecimal totalCarbon) {
        this.totalCarbon = totalCarbon;
    }
}
