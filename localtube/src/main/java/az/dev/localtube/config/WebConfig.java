package az.dev.localtube.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration
 * ONLY handles static resource mapping
 * CORS is handled by CorsConfig.java (don't duplicate!)
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/")
                .setCachePeriod(3600);

        // Serve HLS directory
        registry.addResourceHandler("/hls/**")
                .addResourceLocations("file:hls/")
                .setCachePeriod(0); // Don't cache HLS files
    }

    // REMOVED: addCorsMappings() - causes conflicts with CorsFilter
    // CORS is now handled by CorsConfig.java using CorsFilter
}