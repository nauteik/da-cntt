package com.example.backend.service.impl;

import com.example.backend.model.dto.PayerSelectDTO;
import com.example.backend.model.entity.Payer;
import com.example.backend.repository.PayerRepository;
import com.example.backend.service.PayerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of PayerService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayerServiceImpl implements PayerService {

    private final PayerRepository payerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PayerSelectDTO> getPayersForSelect() {
        log.debug("Fetching active payers for select dropdown");
        
        List<Payer> payers = payerRepository.findAllByIsActiveTrueOrderByPayerNameAsc();
        
        List<PayerSelectDTO> result = payers.stream()
            .map(payer -> new PayerSelectDTO(
                payer.getId(),
                payer.getPayerIdentifier(),
                payer.getPayerName()
            ))
            .collect(Collectors.toList());
        
        log.debug("Found {} active payers", result.size());
        return result;
    }
}

