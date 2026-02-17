package com.infosys.springboard.ecobazaar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.springboard.ecobazaar.dto.UserPurchaseReportDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api.key}")
    private String apiKey;

    public GeminiAIService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024)) // 16MB buffer for large responses
                .build();
        this.objectMapper = objectMapper;
    }

    /**
     * Generate AI-powered summary for user purchase report
     */
    public String generatePurchaseReportSummary(UserPurchaseReportDTO report) {
        try {
            String prompt = buildPurchaseReportPrompt(report);
            return callGeminiAPI(prompt);
        } catch (Exception e) {
            System.err.println("Error generating AI summary: " + e.getMessage());
            return "Unable to generate AI summary at this time. Please try again later.";
        }
    }

    /**
     * Build detailed prompt for Gemini API based on purchase report data
     */
    private String buildPurchaseReportPrompt(UserPurchaseReportDTO report) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are an eco-conscious shopping analyst for EcoBazaar, an environmentally-focused marketplace. ");
        prompt.append("Generate a personalized, insightful analysis of the user's monthly shopping behavior.\n\n");
        
        prompt.append("**User Purchase Summary for ").append(report.getMonth()).append(":**\n\n");
        
        // Overall metrics
        prompt.append("**Overall Performance:**\n");
        prompt.append("- Total Orders: ").append(report.getTotalOrders()).append("\n");
        prompt.append("- Total Items Purchased: ").append(report.getTotalItemsBought()).append("\n");
        prompt.append("- Total Amount Spent: ₹").append(report.getTotalSpent()).append("\n");
        prompt.append("- Total Carbon Emissions: ").append(report.getTotalCarbonEmitted()).append(" kg CO₂e\n\n");
        
        // Carbon impact details
        if (report.getCarbonImpactDetails() != null) {
            var carbonDetails = report.getCarbonImpactDetails();
            prompt.append("**Environmental Impact Breakdown:**\n");
            prompt.append("- Eco-Friendly Items: ").append(carbonDetails.getEcoFriendlyItemCount()).append("\n");
            prompt.append("- Moderate Impact Items: ").append(carbonDetails.getModerateImpactItemCount()).append("\n");
            prompt.append("- High Impact Items: ").append(carbonDetails.getHighImpactItemCount()).append("\n");
            prompt.append("- Average Carbon per Item: ").append(carbonDetails.getAverageCarbonPerItem()).append(" kg CO₂e\n");
            
            if (carbonDetails.getEstimatedCarbonSaved() != null && carbonDetails.getEstimatedCarbonSaved().compareTo(BigDecimal.ZERO) > 0) {
                prompt.append("- Estimated Carbon Saved: ").append(carbonDetails.getEstimatedCarbonSaved()).append(" kg CO₂e\n");
            }
            prompt.append("\n");
        }
        
        // Category breakdown
        if (report.getCategoryBreakdown() != null && !report.getCategoryBreakdown().isEmpty()) {
            prompt.append("**Shopping by Category:**\n");
            for (var category : report.getCategoryBreakdown()) {
                prompt.append("- ").append(category.getCategory())
                      .append(": ").append(category.getItemCount()).append(" items, ")
                      .append("₹").append(category.getTotalSpent())
                      .append(" (").append(category.getTotalCarbonEmitted()).append(" kg CO₂e)\n");
            }
            prompt.append("\n");
        }
        
        // Top purchases
        if (report.getItemsBought() != null && !report.getItemsBought().isEmpty()) {
            prompt.append("**Notable Purchases:**\n");
            int count = Math.min(5, report.getItemsBought().size());
            for (int i = 0; i < count; i++) {
                var item = report.getItemsBought().get(i);
                prompt.append("- ").append(item.getProductName())
                      .append(" (").append(item.getEcoRating()).append(")")
                      .append(" - ").append(item.getQuantityBought()).append(" units, ")
                      .append("₹").append(item.getTotalCost())
                      .append(", ").append(item.getTotalCarbonEmitted()).append(" kg CO₂e\n");
            }
            prompt.append("\n");
        }
        
        prompt.append("**Instructions:**\n");
        prompt.append("Generate a comprehensive 4-paragraph analysis (400-600 words total):\n\n");
        prompt.append("1. **Shopping Overview**: Summarize their overall shopping behavior, spending patterns, and purchase frequency.\n\n");
        prompt.append("2. **Environmental Impact Analysis**: Analyze their carbon footprint, highlighting the ratio of eco-friendly to high-impact purchases. ");
        prompt.append("If they saved carbon, praise them. If they bought many high-impact items, gently suggest improvements.\n\n");
        prompt.append("3. **Category Insights**: Identify their top spending categories and whether those categories tend to be eco-friendly or not. ");
        prompt.append("Mention any interesting patterns in their category preferences.\n\n");
        prompt.append("4. **Personalized Recommendations**: Provide 2-3 specific, actionable suggestions to improve their eco-score and reduce carbon footprint ");
        prompt.append("while maintaining their shopping preferences. Be encouraging and positive.\n\n");
        prompt.append("IMPORTANT: Complete all 4 paragraphs. Write in a friendly, encouraging tone using specific numbers from the data.");
        
        return prompt.toString();
    }

    /**
     * Call Gemini 2.5 Flash API
     */
    private String callGeminiAPI(String prompt) {
        try {
            // Build request body for Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            
            // Add the prompt
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            
            requestBody.put("contents", List.of(content));
            
            // Add generation config for better resp4096); // Maximum for better completion
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topK", 40);
            generationConfig.put("topP", 0.95);
            generationConfig.put("maxOutputTokens", 3000); // Increased for detailed reports
            requestBody.put("generationConfig", generationConfig);

            // Make API call - Using Gemini 2.5 Flash
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse response
            return parseGeminiResponse(response);
            
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate AI summary: " + e.getMessage());
        }
    }

    /**
     * Parse Gemini API response to extract generated text
     */
    private String parseGeminiResponse(String jsonResponse) {
        try {
            System.out.println("=== GEMINI API RESPONSE ===");
            System.out.println(jsonResponse);
            System.out.println("===========================");
            
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode candidates = root.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                
                // Check finish reason
                JsonNode finishReason = firstCandidate.path("finishReason");
                if (finishReason.asText().equals("MAX_TOKENS")) {
                    System.err.println("WARNING: Response was truncated due to MAX_TOKENS limit");
                }
                
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                
                if (parts.isArray() && parts.size() > 0) {
                    // Concatenate all parts in case response is split
                    StringBuilder fullText = new StringBuilder();
                    for (JsonNode part : parts) {
                        JsonNode text = part.path("text");
                        if (!text.isMissingNode()) {
                            fullText.append(text.asText());
                        }
                    }
                    
                    String result = fullText.toString();
                    System.out.println("=== EXTRACTED TEXT LENGTH: " + result.length() + " ===");
                    return result;
                }
            }
            
            System.err.println("ERROR: No candidates found in response");
            return "Unable to parse AI response.";
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
            e.printStackTrace();
            return "Error processing AI response.";
        }
    }
}
