package com.laikaclub.auth.exception;

public class AccountLockedException extends RuntimeException {

    private final int retryAfter;

    public AccountLockedException(String message, int retryAfter) {
        super(message);
        this.retryAfter = retryAfter;
    }

    public int getRetryAfter() {
        return retryAfter;
    }
}
