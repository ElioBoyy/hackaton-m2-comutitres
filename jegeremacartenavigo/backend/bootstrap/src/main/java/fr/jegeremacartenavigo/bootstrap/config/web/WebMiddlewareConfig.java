package fr.jegeremacartenavigo.bootstrap.config.web;

import fr.jegeremacartenavigo.bootstrap.config.web.middleware.CorrelationIdFilter;
import fr.jegeremacartenavigo.bootstrap.config.web.middleware.RequestLoggingInterceptor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Enregistre les middlewares web :
 * <ul>
 *   <li>{@link CorrelationIdFilter} en tout premier (niveau servlet) ;</li>
 *   <li>{@link RequestLoggingInterceptor} au niveau Spring MVC.</li>
 * </ul>
 */
@Configuration
public class WebMiddlewareConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RequestLoggingInterceptor());
    }

    @Bean
    public FilterRegistrationBean<CorrelationIdFilter> correlationIdFilter() {
        FilterRegistrationBean<CorrelationIdFilter> registration =
                new FilterRegistrationBean<>(new CorrelationIdFilter());
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
