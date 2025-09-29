package org.orderingsystem.grocerryorderingsystem.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // <-- added
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // --- Static/public pages ---
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/catalog-advanced.html",   // <-- page to browse products
                                "/favicon.ico",
                                "/assets/**",
                                "/images/**",
                                "/css/**",
                                "/js/**",
                                "/dashboard/**",
                                "/api/auth/**",

                                //promotion ui
                                "/promotion/**"

                        ).permitAll()

                        // --- Public catalog API (optional; if you use /api/catalog/**) ---
                        .requestMatchers("/api/catalog/**").permitAll()

                        // --- Allow unauthenticated GET for product browsing only ---
                        .requestMatchers(HttpMethod.GET,
                                "/api/inventory/products",
                                "/api/inventory/products/**"
                        ).permitAll()


                        // promotion uii
                        .requestMatchers("/promotions/**").permitAll()


                        // --- Everything else requires auth ---
                        .anyRequest().authenticated()
                )
                .exceptionHandling(eh -> eh
                        .authenticationEntryPoint((req, res, ex) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((req, res, ex) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"Forbidden\"}");
                        })
                )
                .httpBasic(hb -> hb.disable())
                .formLogin(fl -> fl.disable());

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
