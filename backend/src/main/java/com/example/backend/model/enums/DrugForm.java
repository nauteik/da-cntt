package com.example.backend.model.enums;

import lombok.Getter;

/**
 * Enum for medication forms
 */
@Getter
public enum DrugForm {
    TABLET("Tablet"),
    CAPSULE("Capsule"),
    LIQUID("Liquid/Syrup"),
    INJECTION("Injection"),
    TOPICAL("Topical (Cream/Ointment)"),
    INHALER("Inhaler"),
    PATCH("Transdermal Patch"),
    DROPS("Drops (Eye/Ear/Nose)"),
    SUPPOSITORY("Suppository"),
    POWDER("Powder");

    private final String displayName;

    DrugForm(String displayName) {
        this.displayName = displayName;
    }
}
