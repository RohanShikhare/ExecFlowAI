package com.execflow.service.ai;

import com.execflow.dto.ai.AiAnalysisResult;
import com.execflow.exception.ApiException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class GroqAiProviderService implements AiProviderService {

    private static final String SYSTEM_PROMPT = """
            You are an executive analysis assistant. Given a transcript or
            note from a business leader, extract a structured summary.

            Rules you must follow strictly:
            - Stay grounded in the source content. Never invent facts, names,
              numbers, owners, or deadlines that are not present or clearly
              implied in the text.
            - If no owner is stated for an action item, set "owner" to null.
              Do not guess a plausible-sounding name.
            - If no deadline is stated, set "deadline" to null. If one is
              stated, output it as an ISO-8601 date (YYYY-MM-DD). If only a
              relative date is given (e.g. "next Friday") and today's date
              isn't known to you, set it to null rather than guessing a date.
            - Only extract a "decision" if the text describes something that
              was explicitly decided or agreed - not something merely
              suggested, proposed, or discussed as an option.
            - "risks" and "opportunities" may include reasonable inference
              from the material, but keep them clearly tied to what's in the
              text - do not introduce unrelated speculation.
            - priority must be one of: LOW, MEDIUM, HIGH, URGENT.
            - Respond with ONLY a single JSON object, no prose before or
              after it, matching exactly this shape:

            {
              "executiveSummary": "string",
              "keyPoints": ["string", ...],
              "decisions": ["string", ...],
              "actionItems": [
                {
                  "title": "string",
                  "description": "string",
                  "owner": "string or null",
                  "deadline": "YYYY-MM-DD or null",
                  "priority": "LOW | MEDIUM | HIGH | URGENT"
                }
              ],
              "risks": ["string", ...],
              "opportunities": ["string", ...],
              "followUps": ["string", ...],
              "importantInformation": ["string", ...]
            }

            If a section has nothing relevant in the source text, return an
            empty array for it rather than omitting the key.
            """;

    private final WebClient groqWebClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public GroqAiProviderService(
            WebClient groqWebClient,
            ObjectMapper objectMapper,
            @Value("${execflow.ai.groq.model}") String model
    ) {
        this.groqWebClient = groqWebClient;
        this.objectMapper = objectMapper;
        this.model = model;
    }

    @Override
    public AiAnalysisResult analyze(String sourceText) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", sourceText)
                )
        );

        try {
            GroqChatResponse response = groqWebClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(GroqChatResponse.class)
                    .block();

            String content = extractContent(response);
            return objectMapper.readValue(content, AiAnalysisResult.class);

        } catch (WebClientResponseException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "AI analysis provider error (" + e.getStatusCode() + "). "
                            + "Check GROQ_API_KEY is set and valid.");
        } catch (WebClientRequestException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reach the AI analysis provider. Check your network connection.");
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "The AI analysis provider returned a response that couldn't be parsed. Try again.");
        }
    }

    private String extractContent(GroqChatResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI analysis provider returned no result");
        }
        String content = response.choices().get(0).message().content();
        if (content == null || content.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI analysis provider returned an empty result");
        }
        return content;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GroqChatResponse(List<Choice> choices) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        private record Choice(Message message) {
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record Message(String content) {
        }
    }
}
