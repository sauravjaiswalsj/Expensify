package com.tracker.expenses.money.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
@Slf4j
@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration}")
    private Long expiration;

    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Returns the signing key used for JWT operations, derived from the configured secret key.
     *
     * If the secret key is not set or is empty, an informational log message is generated.
     *
     * @return the HMAC SHA key for signing and verifying JWTs
     */
    protected Key getSignInKey() {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            log.info("JWT Secret Key is not set");
        }
//        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
//        return Keys.hmacShaKeyFor(keyBytes);
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /**
     * Generates a JWT token for the specified username with the default expiration time and no additional claims.
     *
     * @param username the username to set as the subject of the token
     * @return a signed JWT token string
     */
    public String generateToken(String username){
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username, expiration);
    }

    /****
     * Builds and signs a JWT token with the specified claims, subject, and expiration.
     *
     * @param claims additional claims to include in the token
     * @param username the subject for whom the token is issued
     * @param expiration the token's validity duration in milliseconds
     * @return the generated JWT token as a string
     * @throws JwtException if token creation fails
     */
    private String createToken(Map<String, Object> claims, String username, long expiration){
        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(username)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + expiration))
                    .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                    .compact();
        }catch (Exception ex){
            throw new JwtException("Invalid JWT token", ex);
        }
    }

    /**
     * Determines whether the provided JWT token has expired.
     *
     * @param token the JWT token to check
     * @return true if the token's expiration date is before the current date; false otherwise
     */
    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Validates a JWT token by ensuring the username in the token matches the provided user details and the token is not expired.
     *
     * @param token the JWT token to validate
     * @param userDetails the user details to compare against the token's subject
     * @return true if the token is valid and not expired; false otherwise
     */
    public boolean validateToken(String token, UserDetails userDetails){
        final String username = extractUsername(token);
        return (username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Returns the configured expiration duration for JWT tokens in milliseconds.
     *
     * @return the token expiration time in milliseconds
     */
    public long getExpirationTime() {
        return expiration;
    }

}
