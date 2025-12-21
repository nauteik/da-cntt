export enum DrugForm {
  TABLET = "TABLET",
  CAPSULE = "CAPSULE",
  LIQUID = "LIQUID",
  INJECTION = "INJECTION",
  TOPICAL = "TOPICAL",
  INHALER = "INHALER",
  PATCH = "PATCH",
  DROPS = "DROPS",
  SUPPOSITORY = "SUPPOSITORY",
  OTHER = "OTHER",
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  prescribingProvider?: string;
  pharmacyInfo?: string;
  drugName: string;
  drugForm?: DrugForm;
  dosage: string;
  route: string;
  frequency: string;
  indication?: string;
  isPrn: boolean;
  isControlled: boolean;
  startAt: string;
  endAt?: string;
  status: string;
  currentStock?: number;
  reorderLevel?: number;
  unitOfMeasure?: string;
}

export interface MedicationAdministration {
  id: string;
  medicationOrderId: string;
  medicationOrder?: MedicationOrder;
  patientId: string;
  staffId?: string;
  witnessStaffId?: string;
  serviceDeliveryId?: string;
  administeredAt: string;
  doseGiven?: string;
  status: string;
  isPrn: boolean;
  prnReason?: string;
  prnFollowUp?: string;
  systolicBP?: number;
  diastolicBP?: number;
  pulse?: number;
  glucose?: number;
  temperature?: number;
  respirationRate?: number;
  oxygenSaturation?: number;
  isError: boolean;
  errorDescription?: string;
  adverseEventNotes?: string;
  notes?: string;
}

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string;
  severity?: string;
  isActive: boolean;
}
