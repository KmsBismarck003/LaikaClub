package com.laikaclub.auth.exception;

public class InvalidCredentialsException extends RuntimeException {

    private final Integer attempts;
    private final Integer maxAttempts;

    public InvalidCredentialsException(String message) {
        super(message);
        this.attempts = null;
        this.maxAttempts = null;
    }

    public InvalidCredentialsException(String message, int attempts, int maxAttempts) {
        super(message);
        this.attempts = attempts;
        this.maxAttempts = maxAttempts;
    }

    public Integer getAttempts() {
        return attempts;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }
}
