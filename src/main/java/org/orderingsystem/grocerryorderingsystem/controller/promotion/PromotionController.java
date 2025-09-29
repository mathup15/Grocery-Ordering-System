package org.orderingsystem.grocerryorderingsystem.controller.promotion;

import org.orderingsystem.grocerryorderingsystem.model.promotion.Promotion;
import org.orderingsystem.grocerryorderingsystem.controller.promotion.PromotionDTO;
import org.orderingsystem.grocerryorderingsystem.service.promotion.PromotionService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;

@Controller
@RequestMapping("/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    // Serve static Add Promotion page
    @GetMapping("/add")
    public String showAddPromotionForm() {
        return "redirect:/promotion/add-promotion.html";
    }

    // Handle POST from the add-promotion form
    @PostMapping("/add")
    public String addPromotion(@ModelAttribute Promotion promotion,
                               @RequestParam Long productId) {
        promotionService.addPromotion(promotion, productId);
        return "redirect:/promotion/list-promotions.html";
    }

    // Serve static List Promotions page
    @GetMapping("/list")
    public String showListPromotionsPage() {
        return "redirect:/promotion/list-promotions.html";
    }

    // REST endpoint to return promotions as JSON for list page
    @ResponseBody
    @GetMapping("/all")
    public List<PromotionDTO> getAllPromotions() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<PromotionDTO> dtos = promotionService.getAllPromotions().stream().map(promo -> {
            Product product = promo.getProduct();
            return new PromotionDTO(
                promo.getId(),
                promo.getTitle(),
                promo.getType(),
                promo.getValue(),
                promo.getStartDate() != null ? promo.getStartDate().format(fmt) : "",
                promo.getEndDate() != null ? promo.getEndDate().format(fmt) : "",
                product != null ? product.getId() : null,
                product != null ? product.getName() : null,
                product != null ? product.getImageUrl() : null,
                product != null ? product.getPrice() : null,
                promo.getFinalPrice()
            );
        }).collect(Collectors.toList());
        System.out.println("PROMOTION DTOs: " + dtos);
        return dtos;
    }

    // REST endpoint to get a single promotion by ID
    @ResponseBody
    @GetMapping("/get/{id}")
    public PromotionDTO getPromotion(@PathVariable Long id) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return promotionService.getPromotionById(id).map(promo -> {
            Product product = promo.getProduct();
            return new PromotionDTO(
                promo.getId(),
                promo.getTitle(),
                promo.getType(),
                promo.getValue(),
                promo.getStartDate() != null ? promo.getStartDate().format(fmt) : "",
                promo.getEndDate() != null ? promo.getEndDate().format(fmt) : "",
                product != null ? product.getId() : null,
                product != null ? product.getName() : null,
                product != null ? product.getImageUrl() : null,
                product != null ? product.getPrice() : null,
                promo.getFinalPrice()
            );
        }).orElse(null);
    }

    // Delete promotion by ID
    @PostMapping("/delete")
    @ResponseBody
    public String deletePromotion(@RequestParam Long id) {
        promotionService.deletePromotion(id);
        return "{\"status\":\"success\"}";
    }

    // **Update promotion**
    @PostMapping("/update")
    @ResponseBody
    public String updatePromotion(
            @RequestParam Long id,
            @RequestParam String title,
            @RequestParam String type,
            @RequestParam Double value,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam Long productId
    ) {
        try {
            Promotion updatedPromo = new Promotion();
            updatedPromo.setTitle(title);
            updatedPromo.setType(type);
            updatedPromo.setValue(value);

            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
            if (startDate != null && !startDate.isEmpty()) {
                updatedPromo.setStartDate(LocalDate.parse(startDate, formatter));
            }
            if (endDate != null && !endDate.isEmpty()) {
                updatedPromo.setEndDate(LocalDate.parse(endDate, formatter));
            }

            promotionService.updatePromotion(id, updatedPromo, productId);

            return "{\"status\":\"success\"}";
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    // TEMP endpoint to recalculate all final prices (call once, then remove for security)
    @PostMapping("/recalculate-final-prices")
    @ResponseBody
    public String recalculateAllFinalPrices() {
        promotionService.recalculateAllFinalPrices();
        return "{\"status\":\"success\"}";
    }
}
