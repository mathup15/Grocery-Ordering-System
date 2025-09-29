package com.freshchart.delivery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // "uploads/" folder-ல save பண்ண files-ஐ serve பண்ணும்
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
