package net.javaguides.springboot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {
	
	@Autowired
	private JwtUtil jwtUtil;

	@Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
		
		System.out.println("=== REQUEST INCOMING ===");
	    System.out.println("URL: " + request.getRequestURI());
	    System.out.println("Method: " + request.getMethod());
	    System.out.println("Auth Header: " + request.getHeader("Authorization"));

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);
                String normalizedRole = role == null ? "" : role.trim().replace("ROLE_", "");
                Long userId = jwtUtil.extractUserId(token);
                Long departmentId = jwtUtil.extractDepartmentId(token);
                
                System.out.println("Role from token: " + role);
                System.out.println("Normalized role: " + normalizedRole);
                
                // store in request for controllers to use
                request.setAttribute("userId", userId);
                request.setAttribute("departmentId", departmentId);

                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (!normalizedRole.isEmpty()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + normalizedRole));
                    authorities.add(new SimpleGrantedAuthority(normalizedRole));
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                authorities
                        );
                System.out.println("Auth authorities: " + auth.getAuthorities());
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }

}
