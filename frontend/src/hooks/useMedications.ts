"use client";

import { useApiQuery, useApiMutation } from "./useApi";
import { MedicationOrder, MedicationAdministration, PatientAllergy, DrugForm } from "@/types/medication";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { ApiError } from "../types/api";

export function useDrugForms() {
  return useApiQuery<DrugForm[]>(["medication", "forms"], "/medications/forms");
}

export function usePatientAllergies(patientId: string) {
  return useApiQuery<PatientAllergy[]>(
    ["medication", "allergies", patientId],
    `/medications/patients/${patientId}/allergies`
  );
}

export function useAddAllergy() {
  const queryClient = useQueryClient();
  return useApiMutation<PatientAllergy, Partial<PatientAllergy>>(
    "/medications/allergies",
    "POST",
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["medication", "allergies", variables.patientId] });
      },
    }
  );
}

export function useActiveOrders(patientId: string) {
  return useApiQuery<MedicationOrder[]>(
    ["medication", "orders", "active", patientId],
    `/medications/patients/${patientId}/orders/active`
  );
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useApiMutation<MedicationOrder, Partial<MedicationOrder>>(
    "/medications/orders",
    "POST",
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["medication", "orders", "active", variables.patientId] });
      },
    }
  );
}

export function useDiscontinueOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, { orderId: string; patientId: string }>({
    mutationFn: async ({ orderId }) => {
      const response = await apiClient<void>(`/medications/orders/${orderId}/discontinue`, {
        method: "PUT",
      });
      if (!response.success) {
        throw new ApiError(response);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medication", "orders", "active", variables.patientId] });
    },
  });
}

export function useRecordAdministration() {
  const queryClient = useQueryClient();
  return useApiMutation<MedicationAdministration, Partial<MedicationAdministration>>(
    "/medications/administrations",
    "POST",
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["medication", "mar", variables.patientId] });
        queryClient.invalidateQueries({ queryKey: ["medication", "orders", "active", variables.patientId] });
      },
    }
  );
}

export function usePatientMAR(patientId: string, date: string) {
  return useApiQuery<MedicationAdministration[]>(
    ["medication", "mar", patientId, date],
    `/medications/patients/${patientId}/mar?date=${date}`
  );
}

export function useLowStockAlerts() {
  return useApiQuery<MedicationOrder[]>(
    ["medication", "alerts", "low-stock"],
    "/medications/alerts/low-stock"
  );
}
