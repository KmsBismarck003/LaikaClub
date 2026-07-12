package com.laikaclub.admin.dto;

public class EmailRequest {
    private String email;
    private String subject;
    private String htmlContent;

    public EmailRequest() {}

    public EmailRequest(String email, String subject, String htmlContent) {
        this.email = email;
        this.subject = subject;
        this.htmlContent = htmlContent;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getHtmlContent() {
        return htmlContent;
    }

    public void setHtmlContent(String htmlContent) {
        this.htmlContent = htmlContent;
    }
}
