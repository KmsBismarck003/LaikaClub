package com.laikaclub.auth.service;

import com.laikaclub.auth.domain.AuthLog;
import com.laikaclub.auth.repository.AuthLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final AuthLogRepository authLogRepository;

    @Autowired
    public AuditService(AuthLogRepository authLogRepository) {
        this.authLogRepository = authLogRepository;
    }

    @Transactional
    public void logAuthEvent(String eventType, String email, Long userId, String userName, String role, String ipAddress, String userAgent, String summary) {
        AuthLog log = new AuthLog();
        log.setEventType(eventType);
        log.setEmail(email != null ? email : "");
        log.setUserId(userId);
        log.setUserName(userName != null ? userName : "");
        log.setRole(role != null ? role : "");
        log.setIpAddress(ipAddress != null ? ipAddress : "N/A");
        log.setUserAgent(userAgent != null ? userAgent : "N/A");
        log.setSummary(summary != null ? summary : "");
        
        authLogRepository.save(log);
    }

    public List<AuthLog> getAuthLogs(int limit, String role, String eventType) {
        int limitNum = limit < 1 ? 200 : limit;
        Pageable pageable = PageRequest.of(0, limitNum, Sort.by("id").descending());
        Specification<AuthLog> spec = Specification.where(null);

        if (role != null && !role.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), role));
        }

        if (eventType != null && !eventType.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("eventType"), eventType));
        }

        return authLogRepository.findAll(spec, pageable).getContent();
    }
}
