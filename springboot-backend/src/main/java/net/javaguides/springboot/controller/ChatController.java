package net.javaguides.springboot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.model.ChatRequest;
import net.javaguides.springboot.model.ChatResponse;
import net.javaguides.springboot.service.ChatService;

import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        String userEmail = authentication != null ? authentication.getName() : "Anonymous";
        String userRoles = authentication != null ? authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", ")) : "None";

        // Using userEmail as the chatId for in-memory session persistence per user
        String chatId = userEmail;
        
        String aiResponse = chatService.getChatResponse(chatId, request.getMessage(), userEmail, userRoles);
        
        return ResponseEntity.ok(new ChatResponse(aiResponse));
    }
}
