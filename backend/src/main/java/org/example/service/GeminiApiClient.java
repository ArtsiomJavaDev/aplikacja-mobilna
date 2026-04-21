package org.example.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiApiClient {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;
    private final Gson gson;

    public GeminiApiClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com/v1beta/models").build();
        this.gson = new Gson();
    }

    public String summarizeNews(String title, String description) {
        try {
            String prompt = String.format(
                    "Summarize the following news in 2-3 sentences in English:\n\nTitle: %s\n\nDescription: %s",
                    title, description
            );

            String requestBody = gson.toJson(new GeminiRequest(new Content(prompt)));

            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/gemini-1.5-flash:generateContent")
                            .queryParam("key", geminiApiKey)
                            .build())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseGeminiResponse(response);
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return description != null ? description.substring(0, Math.min(200, description.length())) : "No summary available";
        }
    }

    private String parseGeminiResponse(String jsonResponse) {
        try {
            JsonObject json = gson.fromJson(jsonResponse, JsonObject.class);
            if (json.has("candidates")) {
                var candidates = json.getAsJsonArray("candidates");
                if (candidates.size() > 0) {
                    var candidate = candidates.get(0).getAsJsonObject();
                    if (candidate.has("content")) {
                        var content = candidate.getAsJsonObject("content");
                        if (content.has("parts")) {
                            var parts = content.getAsJsonArray("parts");
                            if (parts.size() > 0) {
                                var part = parts.get(0).getAsJsonObject();
                                if (part.has("text")) {
                                    return part.get("text").getAsString();
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
        }
        return "Summary unavailable";
    }

    static class GeminiRequest {
        public Content contents;

        GeminiRequest(Content contents) {
            this.contents = contents;
        }
    }

    static class Content {
        public List<Part> parts;

        Content(String text) {
            this.parts = new ArrayList<>();
            this.parts.add(new Part(text));
        }
    }

    static class Part {
        public String text;

        Part(String text) {
            this.text = text;
        }
    }
}
