package com.laikaclub.admin.util;

import com.laikaclub.admin.domain.Contract;
import com.laikaclub.admin.domain.Organization;
import com.laikaclub.admin.repository.ContractRepository;
import com.laikaclub.admin.repository.OrganizationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class B2bLegacySeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(B2bLegacySeeder.class);

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Verificando existencia de Organización Legacy (Migración B2B)...");

        List<Organization> orgs = organizationRepository.findAll();
        if (orgs.isEmpty()) {
            logger.info("No se encontraron organizaciones. Creando Organización Legacy...");
            
            Organization legacyOrg = new Organization();
            legacyOrg.setName("Operaciones Legacy (Auto-servicio)");
            legacyOrg.setContactEmail("admin@laikaclub.com");
            legacyOrg = organizationRepository.save(legacyOrg);

            logger.info("Creando Contrato Ilimitado Legacy...");
            Contract legacyContract = new Contract();
            legacyContract.setOrganization(legacyOrg);
            legacyContract.setName("Contrato Global (Antiguos Eventos)");
            legacyContract.setStatus("ACTIVE");
            legacyContract.setStartDate(LocalDate.now());
            legacyContract.setEndDate(LocalDate.now().plusYears(10)); // Válido por 10 años
            legacyContract.setIsUnlimited(true);
            contractRepository.save(legacyContract);

            logger.info("Migración Legacy B2B completada.");
        } else {
            logger.info("La base de datos ya contiene organizaciones. Saltando seeder.");
        }
    }
}
