package org.orderingsystem.grocerryorderingsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = Paths.get(uploadDir).toAbsolutePath();
        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + root.toString() + "/");

        // keep static resources
        registry
                .addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");

        // Serve files from uploads directory
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:uploads/");
    }
}