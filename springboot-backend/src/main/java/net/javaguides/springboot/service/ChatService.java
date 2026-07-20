package net.javaguides.springboot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url}")
    private String baseUrl;

    @Value("${spring.ai.openai.chat.completions.path}")
    private String path;

    @Value("${spring.ai.openai.chat.options.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    // In-memory chat history: ChatId -> List of Messages
    private final Map<String, List<Map<String, String>>> chatMemory = new ConcurrentHashMap<>();

    private final String systemPrompt = "You are a helpful HR Assistant for the Employee Management System. " +
            "You help users manage employees, departments, and general HR tasks. Provide concise, friendly answers. " +
            "If the user wants to navigate to a page or perform an action, you MUST suggest it by embedding one or more navigation buttons in your response using this format: [Button Label|/route-path] (for example: [Add Employee|/create-employee], [View Employees|/employees], [View Departments|/departments], or [View Users|/users]). Do not use markdown links for internal application routes.";

    public String getChatResponse(String chatId, String message, String userEmail, String userRoles) {
        // Retrieve or initialize chat history for this user
        List<Map<String, String>> history = chatMemory.computeIfAbsent(chatId, k -> {
            List<Map<String, String>> init = new ArrayList<>();
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            init.add(sysMsg);
            return init;
        });

        // Add context to the current message
        String contextualMessage = String.format(
            "User Email: %s\nUser Roles: %s\n\nUser Message: %s",
            userEmail, userRoles, message
        );

        // Add user message to history
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", contextualMessage);
        history.add(userMsg);

        // Build the request payload
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", history);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        String endpoint = baseUrl + path;

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, request, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> responseMessage = (Map<String, String>) choice.get("message");
                    
                    String aiText = responseMessage.get("content");

                    // Add AI response to history
                    Map<String, String> aiMsg = new HashMap<>();
                    aiMsg.put("role", "assistant");
                    aiMsg.put("content", aiText);
                    history.add(aiMsg);

                    return aiText;
                }
            }
            return "Sorry, I could not generate a response.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, I encountered an error while communicating with the AI service: " + e.getMessage();
        }
    }
}
