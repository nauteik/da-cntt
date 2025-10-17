package com.example.backend.service.impl;

import com.example.backend.model.dto.ServiceTypeSelectDTO;
import com.example.backend.model.entity.ServiceType;
import com.example.backend.repository.ServiceTypeRepository;
import com.example.backend.service.ServiceTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ServiceTypeService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceTypeServiceImpl implements ServiceTypeService {

    private final ServiceTypeRepository serviceTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ServiceTypeSelectDTO> getServiceTypesForSelect() {
        log.info("Fetching all service types for select dropdown");

        List<ServiceType> serviceTypes = serviceTypeRepository.findAll();

        List<ServiceTypeSelectDTO> result = serviceTypes.stream()
            .map(st -> new ServiceTypeSelectDTO(
                st.getId(),
                st.getCode(),
                st.getName()
            ))
            .collect(Collectors.toList());

        log.info("Found {} service types for select", result.size());
        return result;
    }
}

