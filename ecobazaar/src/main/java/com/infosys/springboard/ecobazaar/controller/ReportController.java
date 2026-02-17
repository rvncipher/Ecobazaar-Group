package com.infosys.springboard.ecobazaar.controller;

import com.infosys.springboard.ecobazaar.dto.SellerSalesReportDTO;
import com.infosys.springboard.ecobazaar.dto.UserPurchaseReportDTO;
import com.infosys.springboard.ecobazaar.service.GeminiAIService;
import com.infosys.springboard.ecobazaar.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private GeminiAIService geminiAIService;

    /**
     * Get user purchase report - items BOUGHT by user
     */
    @GetMapping("/user/{userId}/purchases")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPurchaseReportDTO> getUserPurchaseReport(
            @PathVariable Long userId,
            @RequestParam(required = false) String month) {

        if (month == null || month.trim().isEmpty()) {
            month = getCurrentMonth();
        }

        UserPurchaseReportDTO report = reportService.generateUserPurchaseReport(userId, month);
        return ResponseEntity.ok(report);
    }

    /**
     * Get seller sales report - items SOLD by seller
     */
    @GetMapping("/seller/{sellerId}/sales")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerSalesReportDTO> getSellerSalesReport(
            @PathVariable Long sellerId,
            @RequestParam(required = false) String month) {

        if (month == null || month.trim().isEmpty()) {
            month = getCurrentMonth();
        }

        SellerSalesReportDTO report = reportService.generateSellerSalesReport(sellerId, month);
        return ResponseEntity.ok(report);
    }

    /**
     * Get current month in format "YYYY-MM"
     */
    private String getCurrentMonth() {
        return YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }

    /**
     * Generate AI-powered summary for user purchase report
     */
    @PostMapping("/user/{userId}/ai-summary")
    public ResponseEntity<Map<String, String>> generateAISummary(
            @PathVariable Long userId,
            @RequestParam(required = false) String month) {
        
        try {
            if (month == null || month.trim().isEmpty()) {
                month = getCurrentMonth();
            }

            // Get the user's purchase report
            UserPurchaseReportDTO report = reportService.generateUserPurchaseReport(userId, month);
            
            // Generate AI summary
            String aiSummary = geminiAIService.generatePurchaseReportSummary(report);
            
            Map<String, String> response = new HashMap<>();
            response.put("summary", aiSummary);
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("summary", "Unable to generate AI summary at this time. Please try again later.");
            errorResponse.put("status", "error");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Health check endpoint for reports service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Reports service is running");
    }
}
