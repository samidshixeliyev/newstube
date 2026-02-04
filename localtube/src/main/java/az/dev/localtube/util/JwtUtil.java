package az.dev.localtube.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;

@Slf4j
@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        log.info("Initializing JWT utility with secret key");
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String extractUsername(String token) {
        return extractCustomClaim(token, "email", String.class);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)           // ← secret key for verification
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Extract custom claim from token by key name (returns as Object)
     * Use this when you don't know the type or want to handle casting yourself
     *
     * @param token JWT token
     * @param claimName Custom claim key (e.g., "email", "role_id", "name")
     * @return Claim value as Object, or null if not found
     */
    public Object extractCustomClaim(String token, String claimName) {
        final Claims claims = extractAllClaims(token);
        return claims.get(claimName);
    }

    /**
     * Extract custom claim with specific type (recommended for type safety)
     * Use this when you know the expected type
     *
     * @param token JWT token
     * @param claimName Custom claim key
     * @param requiredType Expected type of the claim
     * @return Claim value cast to specified type, or null if not found
     *
     * Example:
     * String email = jwtUtil.extractCustomClaim(token, "email", String.class);
     * Integer roleId = jwtUtil.extractCustomClaim(token, "role_id", Integer.class);
     */
    public <T> T extractCustomClaim(String token, String claimName, Class<T> requiredType) {
        final Claims claims = extractAllClaims(token);
        return claims.get(claimName, requiredType);
    }

    /**
     * Extract all custom claims as Map
     * This returns all claims including both standard (iss, exp, sub) and custom claims
     *
     * @param token JWT token
     * @return Map of all claims
     */
    public Map<String, Object> extractAllCustomClaims(String token) {
        return extractAllClaims(token);
    }

    /**
     * Check if a custom claim exists in the token
     *
     * @param token JWT token
     * @param claimName Claim key to check
     * @return true if claim exists, false otherwise
     */
    public boolean hasCustomClaim(String token, String claimName) {
        final Claims claims = extractAllClaims(token);
        return claims.containsKey(claimName);
    }
}