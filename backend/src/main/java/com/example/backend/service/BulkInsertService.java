package com.example.backend.service;

import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.PatientAddress;
import com.example.backend.model.entity.PatientContact;
import com.example.backend.model.entity.PatientProgram;
import com.example.backend.model.entity.PatientPayer;
import com.example.backend.model.entity.PatientService;
import com.example.backend.model.entity.ISP;
import com.example.backend.model.entity.Authorization;
import com.example.backend.model.entity.ISPGoal;
import com.example.backend.model.entity.Permission;
import com.example.backend.model.entity.RolePermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

/**
 * Service for optimized bulk insert operations using JDBC batch processing
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BulkInsertService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Bulk insert patients using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertPatients(List<Patient> patients) {
        if (patients.isEmpty()) return;

        log.info("Bulk inserting {} patients using JDBC batch processing...", patients.size());
        
        String sql = """
            INSERT INTO patient (
                id, first_name, last_name, dob, gender, ssn, client_id, agency_id, 
                medicaid_id, primary_language, status, office_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Patient patient = patients.get(i);
                ps.setObject(1, patient.getId());
                ps.setString(2, patient.getFirstName());
                ps.setString(3, patient.getLastName());
                ps.setObject(4, patient.getDob());
                ps.setString(5, patient.getGender());
                ps.setString(6, patient.getSsn());
                ps.setString(7, patient.getClientId());
                ps.setString(8, patient.getAgencyId());
                ps.setString(9, patient.getMedicaidId());
                ps.setString(10, patient.getPrimaryLanguage());
                ps.setString(11, patient.getStatus().toString());
                ps.setObject(12, patient.getOffice().getId());
            }

            @Override
            public int getBatchSize() {
                return patients.size();
            }
        });

        log.info("Successfully bulk inserted {} patients", patients.size());
    }

    /**
     * Bulk insert addresses using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertAddresses(List<Address> addresses) {
        if (addresses.isEmpty()) return;

        log.info("Bulk inserting {} addresses using JDBC batch processing...", addresses.size());
        
        String sql = """
            INSERT INTO address (
                id, line1, city, state, postal_code, county, type, label, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Address address = addresses.get(i);
                ps.setObject(1, address.getId());
                ps.setString(2, address.getLine1());
                ps.setString(3, address.getCity());
                ps.setString(4, address.getState());
                ps.setString(5, address.getPostalCode());
                ps.setString(6, address.getCounty());
                ps.setString(7, address.getType().name());
                ps.setString(8, address.getLabel());
            }

            @Override
            public int getBatchSize() {
                return addresses.size();
            }
        });

        log.info("Successfully bulk inserted {} addresses", addresses.size());
    }

    /**
     * Bulk insert patient addresses using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertPatientAddresses(List<PatientAddress> patientAddresses) {
        if (patientAddresses.isEmpty()) return;

        log.info("Bulk inserting {} patient addresses using JDBC batch processing...", patientAddresses.size());
        
        String sql = """
            INSERT INTO patient_address (
                id, patient_id, address_id, phone, is_main, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                PatientAddress patientAddress = patientAddresses.get(i);
                ps.setObject(1, patientAddress.getId());
                ps.setObject(2, patientAddress.getPatient().getId());
                ps.setObject(3, patientAddress.getAddress().getId());
                ps.setString(4, patientAddress.getPhone());
                ps.setBoolean(5, patientAddress.getIsMain());
            }

            @Override
            public int getBatchSize() {
                return patientAddresses.size();
            }
        });

        log.info("Successfully bulk inserted {} patient addresses", patientAddresses.size());
    }

    /**
     * Bulk insert patient contacts using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertPatientContacts(List<PatientContact> patientContacts) {
        if (patientContacts.isEmpty()) return;

        log.info("Bulk inserting {} patient contacts using JDBC batch processing...", patientContacts.size());
        
        String sql = """
            INSERT INTO patient_contact (
                id, patient_id, name, relation, phone, email, line1, line2, is_primary, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                PatientContact patientContact = patientContacts.get(i);
                ps.setObject(1, patientContact.getId());
                ps.setObject(2, patientContact.getPatient().getId());
                ps.setString(3, patientContact.getName());
                ps.setString(4, patientContact.getRelation());
                ps.setString(5, patientContact.getPhone());
                ps.setString(6, patientContact.getEmail());
                ps.setString(7, patientContact.getLine1());
                ps.setString(8, patientContact.getLine2());
                ps.setBoolean(9, patientContact.getIsPrimary());
            }

            @Override
            public int getBatchSize() {
                return patientContacts.size();
            }
        });

        log.info("Successfully bulk inserted {} patient contacts", patientContacts.size());
    }

    /**
     * Bulk insert patient programs using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertPatientPrograms(List<PatientProgram> patientPrograms) {
        if (patientPrograms.isEmpty()) return;

        log.info("Bulk inserting {} patient programs using JDBC batch processing...", patientPrograms.size());
        
        String sql = """
            INSERT INTO patient_program (
                id, patient_id, program_id, enrollment_date, status_effective_date, 
                soc_date, eoc_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                PatientProgram patientProgram = patientPrograms.get(i);
                ps.setObject(1, patientProgram.getId());
                ps.setObject(2, patientProgram.getPatient().getId());
                ps.setObject(3, patientProgram.getProgram().getId());
                ps.setObject(4, patientProgram.getEnrollmentDate());
                ps.setObject(5, patientProgram.getStatusEffectiveDate());
                ps.setObject(6, patientProgram.getSocDate());
                ps.setObject(7, patientProgram.getEocDate());
            }

            @Override
            public int getBatchSize() {
                return patientPrograms.size();
            }
        });

        log.info("Successfully bulk inserted {} patient programs", patientPrograms.size());
    }

    /**
     * Bulk insert patient payers using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertPatientPayers(List<PatientPayer> patientPayers) {
        if (patientPayers.isEmpty()) return;

        log.info("Bulk inserting {} patient payers using JDBC batch processing...", patientPayers.size());
        
        String sql = """
            INSERT INTO patient_payer (
                id, patient_id, payer_id, client_payer_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                PatientPayer patientPayer = patientPayers.get(i);
                ps.setObject(1, patientPayer.getId());
                ps.setObject(2, patientPayer.getPatient().getId());
                ps.setObject(3, patientPayer.getPayer().getId());
                ps.setString(4, patientPayer.getClientPayerId());
            }

            @Override
            public int getBatchSize() {
                return patientPayers.size();
            }
        });

        log.info("Successfully bulk inserted {} patient payers", patientPayers.size());
    }

    /**
     * Bulk insert patient services using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertPatientServices(List<PatientService> patientServices) {
        if (patientServices.isEmpty()) return;

        log.info("Bulk inserting {} patient services using JDBC batch processing...", patientServices.size());
        
        String sql = """
            INSERT INTO patient_service (
                id, patient_id, service_type_id, start_date, end_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                PatientService patientService = patientServices.get(i);
                ps.setObject(1, patientService.getId());
                ps.setObject(2, patientService.getPatient().getId());
                ps.setObject(3, patientService.getServiceType().getId());
                ps.setObject(4, patientService.getStartDate());
                ps.setObject(5, patientService.getEndDate());
            }

            @Override
            public int getBatchSize() {
                return patientServices.size();
            }
        });

        log.info("Successfully bulk inserted {} patient services", patientServices.size());
    }

    /**
     * Bulk insert ISPs using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertISPs(List<ISP> isps) {
        if (isps.isEmpty()) return;

        log.info("Bulk inserting {} ISPs using JDBC batch processing...", isps.size());
        
        String sql = """
            INSERT INTO isp (
                id, patient_id, version_no, effective_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                ISP isp = isps.get(i);
                ps.setObject(1, isp.getId());
                ps.setObject(2, isp.getPatient().getId());
                ps.setInt(3, isp.getVersionNo());
                ps.setObject(4, isp.getEffectiveAt());
            }

            @Override
            public int getBatchSize() {
                return isps.size();
            }
        });

        log.info("Successfully bulk inserted {} ISPs", isps.size());
    }

    /**
     * Bulk insert authorizations using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertAuthorizations(List<Authorization> authorizations) {
        if (authorizations.isEmpty()) return;

        log.info("Bulk inserting {} authorizations using JDBC batch processing...", authorizations.size());
        
        String sql = """
            INSERT INTO authorizations (
                id, patient_payer_id, patient_id, patient_service_id, authorization_no, 
                max_units, start_date, end_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Authorization auth = authorizations.get(i);
                ps.setObject(1, auth.getId());
                ps.setObject(2, auth.getPatientPayer().getId());
                ps.setObject(3, auth.getPatient().getId());
                ps.setObject(4, auth.getPatientService().getId());
                ps.setString(5, auth.getAuthorizationNo());
                ps.setBigDecimal(6, auth.getMaxUnits());
                ps.setObject(7, auth.getStartDate());
                ps.setObject(8, auth.getEndDate());
            }

            @Override
            public int getBatchSize() {
                return authorizations.size();
            }
        });

        log.info("Successfully bulk inserted {} authorizations", authorizations.size());
    }

    /**
     * Bulk insert ISP goals using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertISPGoals(List<ISPGoal> ispGoals) {
        if (ispGoals.isEmpty()) return;

        log.info("Bulk inserting {} ISP goals using JDBC batch processing...", ispGoals.size());
        
        String sql = """
            INSERT INTO isp_goal (
                id, isp_id, title, description, created_at, updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                ISPGoal goal = ispGoals.get(i);
                ps.setObject(1, goal.getId());
                ps.setObject(2, goal.getIsp().getId());
                ps.setString(3, goal.getTitle());
                ps.setString(4, goal.getDescription());
            }

            @Override
            public int getBatchSize() {
                return ispGoals.size();
            }
        });

        log.info("Successfully bulk inserted {} ISP goals", ispGoals.size());
    }

    /**
     * Bulk insert permissions using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertPermissions(List<Permission> permissions) {
        if (permissions.isEmpty()) return;

        log.info("Bulk inserting {} permissions using JDBC batch processing...", permissions.size());
        
        String sql = """
            INSERT INTO permission (
                id, resource, action, scope, description, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Permission permission = permissions.get(i);
                ps.setObject(1, permission.getId());
                ps.setString(2, permission.getResource());
                ps.setString(3, permission.getAction());
                ps.setString(4, permission.getScope().toString());
                ps.setString(5, permission.getDescription());
            }

            @Override
            public int getBatchSize() {
                return permissions.size();
            }
        });

        log.info("Successfully bulk inserted {} permissions", permissions.size());
    }

    /**
     * Bulk insert role permissions using JDBC batch processing for maximum performance
     */
    @Transactional
    public void bulkInsertRolePermissions(List<RolePermission> rolePermissions) {
        if (rolePermissions.isEmpty()) return;

        log.info("Bulk inserting {} role permissions using JDBC batch processing...", rolePermissions.size());
        
        String sql = """
            INSERT INTO role_permission (
                id, role_id, permission_id, created_at, updated_at
            ) VALUES (?, ?, ?, NOW(), NOW())
            """;

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                RolePermission rolePermission = rolePermissions.get(i);
                ps.setObject(1, rolePermission.getId());
                ps.setObject(2, rolePermission.getRole().getId());
                ps.setObject(3, rolePermission.getPermission().getId());
            }

            @Override
            public int getBatchSize() {
                return rolePermissions.size();
            }
        });

        log.info("Successfully bulk inserted {} role permissions", rolePermissions.size());
    }
}
