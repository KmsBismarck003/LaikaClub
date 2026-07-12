package com.laikaclub.analytics.controller;

import com.laikaclub.analytics.service.VaultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/vault")
public class VaultController {

    private final VaultService vaultService;

    @Autowired
    public VaultController(VaultService vaultService) {
        this.vaultService = vaultService;
    }

    @PostMapping("/sync")
    public Map<String, Object> sync(
            @RequestParam(value = "backup_type", defaultValue = "completo") String backupType,
            @RequestParam(value = "tables", required = false) List<String> tables) {
        return vaultService.syncMysqlToMongo(backupType, tables);
    }

    @GetMapping("/list")
    public List<Map<String, Object>> listSnapshots() {
        return vaultService.listNosqlSnapshots();
    }

    @DeleteMapping("/delete/{snapshotId}")
    public Map<String, Object> deleteSnapshot(@PathVariable("snapshotId") String snapshotId) {
        return vaultService.deleteNosqlSnapshot(snapshotId);
    }

    @PostMapping("/restore/{snapshotId}")
    public Map<String, Object> restoreSnapshot(@PathVariable("snapshotId") String snapshotId) {
        return vaultService.restoreNosqlSnapshot(snapshotId);
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return vaultService.getVaultStatus();
    }

    @GetMapping("/download/{snapshotId}")
    public ResponseEntity<List<Map<String, Object>>> downloadSnapshot(@PathVariable("snapshotId") String snapshotId) {
        List<Map<String, Object>> data = vaultService.getSnapshotData(snapshotId);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + snapshotId + ".json");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }
}
