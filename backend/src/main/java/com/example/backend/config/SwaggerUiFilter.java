package com.example.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

/**
 * Filter to inject custom JavaScript and CSS into Swagger UI HTML
 */
@Component
public class SwaggerUiFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        // Only process Swagger UI HTML page
        if (requestURI.equals("/swagger-ui.html") || requestURI.equals("/swagger-ui/index.html")) {
            ByteArrayResponseWrapper responseWrapper = new ByteArrayResponseWrapper(response);
            
            filterChain.doFilter(request, responseWrapper);
            
            // Get the HTML content
            byte[] responseBody = responseWrapper.getByteArray();
            if (responseBody.length == 0) {
                return;
            }
            
            String html = new String(responseBody, StandardCharsets.UTF_8);
            
            // Load custom CSS content
            String cssContent = "";
            try {
                ClassPathResource cssResource = new ClassPathResource("static/swagger-ui/custom.css");
                cssContent = new String(cssResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                // CSS file not found, continue without it
            }
            
            // Load custom JS content
            String jsContent = "";
            try {
                ClassPathResource jsResource = new ClassPathResource("static/swagger-ui/custom.js");
                jsContent = new String(jsResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                // JS file not found, continue without it
            }
            
            // Inject custom CSS in head
            if (html.contains("</head>") && !cssContent.isEmpty()) {
                String customCss = "\n<style id=\"swagger-ui-custom-css\">\n" + cssContent + "\n</style>\n";
                html = html.replace("</head>", customCss + "</head>");
            }
            
            // Inject custom script before closing body tag
            if (html.contains("</body>") && !jsContent.isEmpty()) {
                String customScript = "\n<script id=\"swagger-ui-custom-js\">\n" + jsContent + "\n</script>\n";
                html = html.replace("</body>", customScript + "</body>");
            }
            
            // Write modified HTML directly to response
            byte[] modifiedHtml = html.getBytes(StandardCharsets.UTF_8);
            response.setContentLength(modifiedHtml.length);
            response.getOutputStream().write(modifiedHtml);
            response.getOutputStream().flush();
        } else {
            filterChain.doFilter(request, response);
        }
    }
    
    private static class ByteArrayResponseWrapper extends HttpServletResponseWrapper {
        private final ByteArrayOutputStream buffer;
        private ServletOutputStream output;
        private PrintWriter writer;

        public ByteArrayResponseWrapper(HttpServletResponse response) {
            super(response);
            buffer = new ByteArrayOutputStream();
        }

        @Override
        public ServletOutputStream getOutputStream() {
            if (output == null) {
                output = new ServletOutputStream() {
                    @Override
                    public void write(int b) {
                        buffer.write(b);
                    }

                    @Override
                    public boolean isReady() {
                        return true;
                    }

                    @Override
                    public void setWriteListener(WriteListener listener) {
                        // Not needed
                    }
                };
            }
            return output;
        }

        @Override
        public PrintWriter getWriter() throws IOException {
            if (writer == null) {
                writer = new PrintWriter(getOutputStream(), true);
            }
            return writer;
        }

        @Override
        public void flushBuffer() throws IOException {
            if (output != null) {
                output.flush();
            }
            if (writer != null) {
                writer.flush();
            }
        }

        public byte[] getByteArray() throws IOException {
            flushBuffer();
            return buffer.toByteArray();
        }
    }
}

