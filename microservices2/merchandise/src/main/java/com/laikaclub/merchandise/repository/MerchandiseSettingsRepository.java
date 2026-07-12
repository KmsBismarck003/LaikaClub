package com.laikaclub.merchandise.repository;

import com.laikaclub.merchandise.domain.MerchandiseSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MerchandiseSettingsRepository extends JpaRepository<MerchandiseSettings, Long> {
}
