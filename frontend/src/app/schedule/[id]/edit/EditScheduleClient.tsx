"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Input,
  Button,
  Table,
} from "antd";
import type { PatientSelectDTO, StaffSelectDTO, PatientProgramDTO, AuthorizationDTO } from "@/types/patient";
import type {
  ScheduleEventDTO,
  UpdateScheduleEventDTO,
  AuthorizationSelectDTO,
} from "@/types/schedule";
import { useScheduleEvent, useUpdateScheduleEvent } from "@/hooks/useSchedules";
import EditScheduleHeader from "@/components/schedule/EditScheduleHeader";
import buttonStyles from "@/styles/buttons.module.css";
import formStyles from "@/styles/form.module.css";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

interface EditScheduleClientProps {
  initialEvent: ScheduleEventDTO;
  patients: PatientSelectDTO[];
  staff: StaffSelectDTO[];
}

export default function EditScheduleClient({
  initialEvent,
  patients,
  staff,
}: EditScheduleClientProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  
  // Fetch latest event data (in case it was updated)
  const { data: eventData, isLoading } = useScheduleEvent(initialEvent.id);
  const updateMutation = useUpdateScheduleEvent();
  
  // Watch eventCode to sync with billing section
  const eventCode = Form.useWatch("eventCode", form);
  
  // State for dropdowns
  const [authorizations, setAuthorizations] = useState<AuthorizationSelectDTO[]>([]);
  const [selectedAuthorization, setSelectedAuthorization] = useState<AuthorizationSelectDTO | null>(null);
  const [fullAuthorization, setFullAuthorization] = useState<AuthorizationDTO | null>(null);
  
  // State for error display
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Get current event data (use fetched data if available, otherwise initial)
  const currentEvent = eventData || initialEvent;
  
  // Load full authorization details for the card
  const loadFullAuthorization = useCallback(async (patientId: string, authorizationId: string) => {
    try {
      const programResponse: ApiResponse<PatientProgramDTO> = await apiClient<PatientProgramDTO>(
        `/patients/${patientId}/program`
      );
      
      if (programResponse.success && programResponse.data) {
        const fullAuth = programResponse.data.authorizations?.find(
          (a) => a.authorizationId === authorizationId
        );
        if (fullAuth) {
          setFullAuthorization(fullAuth);
        }
      }
    } catch (error) {
      console.error("Failed to load authorization details:", error);
    }
  }, []);
  
  // Load authorizations for patient
  const loadAuthorizations = useCallback(async (patientId: string) => {
    try {
      const response: ApiResponse<AuthorizationSelectDTO[]> = await apiClient<AuthorizationSelectDTO[]>(
        `/patients/${patientId}/schedule/authorizations/select`
      );
      
      if (response.success && response.data) {
        setAuthorizations(response.data);
        
        // Set selected authorization if event has one
        if (currentEvent.authorizationId) {
          const auth = response.data.find((a) => a.id === currentEvent.authorizationId);
          if (auth) {
            setSelectedAuthorization(auth);
            // Load full authorization details
            loadFullAuthorization(patientId, auth.id);
          }
        }
      } else {
        setAuthorizations([]);
      }
    } catch (error) {
      console.error("Failed to load authorizations:", error);
      setAuthorizations([]);
    }
  }, [currentEvent.authorizationId, loadFullAuthorization]);
  
  // Initialize form and load data
  useEffect(() => {
    if (currentEvent) {
      // Set form values
      form.setFieldsValue({
        serviceId: currentEvent.authorizationId,
        eventDate: dayjs(currentEvent.eventDate),
        eventCode: currentEvent.eventCode || "NONE",
        status: currentEvent.status,
        proposedStartTime: dayjs(currentEvent.startAt),
        proposedEndTime: dayjs(currentEvent.endAt),
        actualStartTime: currentEvent.actualStartAt ? dayjs(currentEvent.actualStartAt) : null,
        actualEndTime: currentEvent.actualEndAt ? dayjs(currentEvent.actualEndAt) : null,
        employeeId: currentEvent.employeeId,
        comments: currentEvent.comments || "",
      });
      
      // Load authorizations
      if (currentEvent.patientId) {
        loadAuthorizations(currentEvent.patientId);
      }
    }
  }, [currentEvent, form, loadAuthorizations]);
  
  const handleServiceChange = useCallback(async (authorizationId: string) => {
    const auth = authorizations.find((a) => a.id === authorizationId);
    setSelectedAuthorization(auth || null);
    
    if (auth && currentEvent.patientId) {
      form.setFieldValue("eventCode", auth.eventCode || "NONE");
      
      // Load full authorization details
      await loadFullAuthorization(currentEvent.patientId, authorizationId);
    }
  }, [authorizations, currentEvent.patientId, form, loadFullAuthorization]);
  
  const handleSave = async () => {
    setErrorMessage(null);
    setShowSuccess(false);
    
    try {
      const values = await form.validateFields();
      
      const updateDTO: UpdateScheduleEventDTO = {
        authorizationId: values.serviceId,
        eventDate: values.eventDate.format("YYYY-MM-DD"),
        startTime: values.proposedStartTime.format("HH:mm"),
        endTime: values.proposedEndTime.format("HH:mm"),
        staffId: values.employeeId,
        eventCode: values.eventCode || "NONE",
        status: values.status,
        plannedUnits: values.plannedUnits || currentEvent.plannedUnits,
        // Actual times are disabled - don't send them
        comments: values.comments,
      };
      
      await updateMutation.mutateAsync({ eventId: currentEvent.id, data: updateDTO });
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/schedule");
      }, 1500);
    } catch (error: unknown) {
      console.error("Failed to update schedule event:", error);
      
      // Handle Ant Design form validation errors
      if (
        error &&
        typeof error === "object" &&
        "errorFields" in error &&
        Array.isArray((error as { errorFields: Array<{ errors?: string[] }> }).errorFields) &&
        (error as { errorFields: Array<{ errors?: string[] }> }).errorFields.length > 0
      ) {
        const firstError = (error as { errorFields: Array<{ errors?: string[] }> }).errorFields[0];
        if (firstError.errors && firstError.errors.length > 0) {
          setErrorMessage(firstError.errors[0]);
          return;
        }
      }
      
      // Handle API errors
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to update schedule event. Please try again.");
      }
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const patient = patients.find((p) => p.id === currentEvent.patientId);
  const selectedStaff = staff.find((s) => s.id === currentEvent.employeeId);
  
  // Calculate hours
  // Note: 1 unit = 15 minutes. To calculate units from duration in minutes: units = minutes / 15
  const calculateHours = (start: string | undefined, end: string | undefined): string => {
    if (!start || !end) return "0.00";
    try {
      const startDate = dayjs(start);
      const endDate = dayjs(end);
      const hours = endDate.diff(startDate, "hour", true);
      return hours.toFixed(2);
    } catch {
      return "0.00";
    }
  };
  
  const proposedHours = calculateHours(currentEvent.startAt, currentEvent.endAt);
  const actualHours = calculateHours(currentEvent.actualStartAt, currentEvent.actualEndAt);
  
  // Billing table data - only fields from backend
  const billingTableData = [
    {
      key: "1",
      type: "Unit",
      quantity: currentEvent.plannedUnits || 0,
      actualUnits: currentEvent.actualUnits,
      status: currentEvent.status,
    },
  ];
  
  return (
    <div className="w-full mx-auto p-0 min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      {!isLoading && currentEvent && (
        <EditScheduleHeader
          event={currentEvent}
          patient={patient}
          staff={selectedStaff}
          onBack={handleCancel}
        />
      )}
      
      {/* Main Content */}
      <div className="bg-[var(--bg-surface)] p-6 flex-1">
        {isLoading ? (
          <Card loading={true} />
        ) : (
          <div className="flex gap-6">
            {/* Left Panel */}
            <div className="w-1/2">
              <Card className="mb-6">
                <Form form={form} layout="vertical">
                  {/* Schedule Details */}
                  <div className="text-sm font-semibold mb-4">Schedule Details</div>
                  
                  {/* Service */}
                  <Form.Item
                    label="Service"
                    name="serviceId"
                    rules={[{ required: true, message: "Please select a service" }]}
                  >
                    <Select
                      placeholder="Select Service"
                      className={formStyles.formSelect}
                      onChange={handleServiceChange}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={authorizations.map((auth) => ({
                        label: `${auth.serviceCode || ""} - ${auth.serviceName || ""}`.trim(),
                        value: auth.id,
                      }))}
                    />
                  </Form.Item>
                  
                  {/* Date and Event Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label="Date"
                      name="eventDate"
                      rules={[{ required: true, message: "Please select date" }]}
                    >
                      <DatePicker
                        className={formStyles.formDatePicker}
                        format="MM/DD/YYYY"
                        style={{ width: "100%" }}
                        onChange={(date) => {
                          if (date) {
                            form.setFieldValue("eventDate", date);
                          }
                        }}
                      />
                    </Form.Item>
                    
                    <Form.Item
                      label="Event Code"
                      name="eventCode"
                      rules={[{ required: true, message: "Please enter event code" }]}
                    >
                      <Input className={formStyles.formInput} />
                    </Form.Item>
                  </div>
                  
                  {/* Status */}
                  <Form.Item
                    label="Status"
                    name="status"
                    rules={[{ required: true }]}
                  >
                    <Select className={formStyles.formSelect}>
                      <Option value="PLANNED">Planned</Option>
                      <Option value="CONFIRMED">Confirmed</Option>
                      <Option value="IN_PROGRESS">In Progress</Option>
                      <Option value="COMPLETED">Completed</Option>
                      <Option value="CANCELLED">Cancelled</Option>
                    </Select>
                  </Form.Item>
                  
                  {/* Times Section */}
                  <div className="text-sm font-semibold mt-6 mb-4">Times</div>
                  <div className="text-xs text-[var(--text-secondary)] mb-4">Times Shown Are In Eastern</div>
                  
                  {/* Proposed */}
                  <div className="mb-4">
                    <div className="font-medium mb-2">Proposed</div>
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item label="In Time" name="proposedStartTime">
                        <TimePicker
                          className={formStyles.formInput}
                          format="h:mm A"
                          style={{ width: "100%" }}
                          minuteStep={15}
                        />
                      </Form.Item>
                      <Form.Item label="Out Time" name="proposedEndTime">
                        <TimePicker
                          className={formStyles.formInput}
                          format="h:mm A"
                          style={{ width: "100%" }}
                          minuteStep={15}
                        />
                      </Form.Item>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      - {proposedHours} hrs
                    </div>
                  </div>
                  
                  {/* Actual - Disabled */}
                  <div className="mb-4">
                    <div className="font-medium mb-2">Actual</div>
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item label="In Time" name="actualStartTime">
                        <TimePicker
                          className={formStyles.formInputDisabled}
                          format="h:mm A"
                          style={{ width: "100%" }}
                          disabled
                          value={currentEvent.actualStartAt ? dayjs(currentEvent.actualStartAt) : null}
                        />
                      </Form.Item>
                      <Form.Item label="Out Time" name="actualEndTime">
                        <TimePicker
                          className={formStyles.formInputDisabled}
                          format="h:mm A"
                          style={{ width: "100%" }}
                          disabled
                          value={currentEvent.actualEndAt ? dayjs(currentEvent.actualEndAt) : null}
                        />
                      </Form.Item>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[var(--text-secondary)]">
                        - {actualHours} hrs
                      </span>
                      {currentEvent.actualUnits !== undefined && (
                        <span className="text-sm text-[var(--text-secondary)]">
                          Units: {currentEvent.actualUnits.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Authorizations Card */}
                  {selectedAuthorization && fullAuthorization && (
                    <>
                      <div className="text-sm font-semibold mt-6 mb-4">Authorizations</div>
                      <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                        <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-xs">
                          {/* Column 1 */}
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[100px]">PAYER:</span>
                              <span className="text-gray-900">{fullAuthorization.payerIdentifier || "—"}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[100px]">AUTHORIZATION NUMBER:</span>
                              <span className="text-gray-900">{fullAuthorization.authorizationNo || "—"}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[100px]">SERVICE:</span>
                              <span className="text-gray-900">{selectedAuthorization.serviceCode || "—"}</span>
                            </div>
                          </div>
                          
                          {/* Column 2 */}
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[100px]">EVENT CODE:</span>
                              <span className="text-gray-900">{fullAuthorization.eventCode || selectedAuthorization.eventCode || "-"}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[100px]">FORMAT:</span>
                              <span className="text-gray-900">{fullAuthorization.format || selectedAuthorization.billType || "—"}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[100px]">Units:</span>
                              <span className="text-gray-900">{fullAuthorization.totalUsed?.toFixed(2) || "-"}</span>
                            </div>
                          </div>
                          
                          {/* Column 3 */}
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[120px]">MAXIMUM (TOTAL LIMITATION):</span>
                              <span className="text-gray-900">{fullAuthorization.maxUnits?.toFixed(2) || "-"}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[120px]">REMAINING:</span>
                              <span className="text-gray-900">
                                {fullAuthorization.totalRemaining !== undefined 
                                  ? fullAuthorization.totalRemaining.toFixed(2) 
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[120px]">START DATE:</span>
                              <span className="text-gray-900">
                                {fullAuthorization.startDate 
                                  ? dayjs(fullAuthorization.startDate).format("MM/DD/YYYY")
                                  : "—"}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[120px]">END DATE:</span>
                              <span className="text-gray-900">
                                {fullAuthorization.endDate 
                                  ? dayjs(fullAuthorization.endDate).format("MM/DD/YYYY")
                                  : "—"}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[120px]">LIMIT BY:</span>
                              <span className="text-gray-900">None</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Comments */}
                  <div className="text-sm font-semibold mt-6 mb-4">Comments</div>
                  <Form.Item name="comments">
                    <TextArea
                      rows={3}
                      placeholder="Type in a note.."
                      className={formStyles.formInput}
                    />
                  </Form.Item>
                  
                  {/* Error Message */}
                  {errorMessage && !showSuccess && (
                    <div className="mt-4 px-4 py-3">
                      <p className="text-sm text-red-600 m-0">{errorMessage}</p>
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {showSuccess && (
                    <div className="mt-4 px-4 py-3">
                      <p className="text-sm text-green-600 font-[550] m-0">
                        Schedule event updated successfully!
                      </p>
                    </div>
                  )}
                </Form>
              </Card>
            </div>
            
            {/* Right Panel */}
            <div className="w-1/2">
              {/* Billing */}
              <Card className="mb-6">
                <div className="text-sm font-semibold mb-4">Billing</div>
                <Form form={form} layout="vertical">
                  {/* Client | Program */}
                  <Form.Item label="Client | Program">
                    <Input
                      className={formStyles.formInputDisabled}
                      disabled
                      value={patient ? `${patient.displayName} | ${currentEvent.programIdentifier || "ODP"} (${patient.medicaidId || ""})` : "-"}
                      readOnly
                    />
                  </Form.Item>
                  
                  {/* Event Code - synced with left panel */}
                  <Form.Item label="Event Code">
                    <Input 
                      className={formStyles.formInputDisabled}
                      disabled
                      value={eventCode || currentEvent.eventCode || "NONE"}
                    />
                  </Form.Item>
                  
                  {/* Billing Table */}
                  <div className="overflow-x-auto">
                    <Table
                      dataSource={billingTableData}
                      pagination={false}
                      size="small"
                      scroll={{ x: "max-content" }}
                      columns={[
                        { title: "Type", dataIndex: "type", key: "type", width: 100 },
                        { 
                          title: "Planned Units", 
                          dataIndex: "quantity", 
                          key: "quantity", 
                          align: "center", 
                          width: 120,
                          render: (value: number) => value?.toFixed(2) || "0.00"
                        },
                        { 
                          title: "Actual Units", 
                          dataIndex: "actualUnits", 
                          key: "actualUnits", 
                          align: "center", 
                          width: 120,
                          render: (value: number | undefined) => value !== undefined ? value.toFixed(2) : "—"
                        },
                        {
                          title: "Status",
                          dataIndex: "status",
                          key: "status",
                          width: 120,
                          render: (status: string) => (
                            <Select
                              value={status}
                              className={formStyles.formSelect}
                              style={{ width: "100%" }}
                            >
                              <Option value="PLANNED">Planned</Option>
                              <Option value="CONFIRMED">Confirmed</Option>
                              <Option value="CANCELLED">Cancelled</Option>
                            </Select>
                          ),
                        },
                      ]}
                    />
                  </div>
                </Form>
              </Card>
              
              {/* Employee */}
              <Card>
                <div className="text-sm font-semibold mb-4">Employee</div>
                <Form form={form} layout="vertical">
                  <Form.Item label="Employee" name="employeeId">
                    <Select
                      placeholder="Type 2 letters of the Employee's name"
                      className={formStyles.formSelect}
                      showSearch
                      allowClear
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={staff.map((s) => ({
                        label: s.displayName,
                        value: s.id,
                      }))}
                    />
                  </Form.Item>
                </Form>
              </Card>
              
              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleCancel}
                  className={buttonStyles.btnCancel}
                >
                  CANCEL
                </Button>
                <Button
                  type="primary"
                  onClick={handleSave}
                  className={buttonStyles.btnPrimary}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "SAVE CHANGES"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

