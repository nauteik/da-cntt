"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Input,
  Checkbox,
  Button,
  Table,
  Space,
} from "antd";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import type { PatientSelectDTO, StaffSelectDTO, PatientProgramDTO } from "@/types/patient";
import type {
  CreateScheduleEventDTO,
  RepeatConfigDTO,
  CreateSchedulePreviewRequestDTO,
  CreateSchedulePreviewResponseDTO,
  AuthorizationSelectDTO,
} from "@/types/schedule";
import { useCreateSchedulePreview, useCreateScheduleEvents } from "@/hooks/useSchedules";
import RepeatEventModal from "./RepeatEventModal";
import buttonStyles from "@/styles/buttons.module.css";
import formStyles from "@/styles/form.module.css";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import dayjs from "dayjs";
import type { AuthorizationDTO } from "@/types/patient";

const { TextArea } = Input;
const { Option } = Select;

interface CreateScheduleFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  preselectedPatientId?: string;
  preselectedStaffId?: string;
}

export default function CreateScheduleForm({
  open,
  onCancel,
  onSuccess,
  preselectedPatientId,
  preselectedStaffId,
}: CreateScheduleFormProps) {
  const [form] = Form.useForm();
  
  // State for dropdowns
  const [patients, setPatients] = useState<PatientSelectDTO[]>([]);
  const [authorizations, setAuthorizations] = useState<AuthorizationSelectDTO[]>([]);
  const [staff, setStaff] = useState<StaffSelectDTO[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSelectDTO | null>(null);
  const [selectedAuthorization, setSelectedAuthorization] = useState<AuthorizationSelectDTO | null>(null);
  const [fullAuthorization, setFullAuthorization] = useState<AuthorizationDTO | null>(null);
  
  // State for repeat modal
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfigDTO | undefined>();
  const [isRepeatEvent, setIsRepeatEvent] = useState(false);
  
  // State for preview
  const [previewData, setPreviewData] = useState<CreateSchedulePreviewResponseDTO | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [showConflictsForEvent, setShowConflictsForEvent] = useState<string | null>(null);
  
  // State for change employee modal
  const [changeEmployeeModalOpen, setChangeEmployeeModalOpen] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState<string | undefined>(undefined);
  const [changeEmployeeForm] = Form.useForm();
  
  // State for error display
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Mutations
  const previewMutation = useCreateSchedulePreview();
  const createMutation = useCreateScheduleEvents();

  const loadPatients = async () => {
    try {
      // Simplified - in real app, might need pagination or search
      const response = await apiClient<PatientSelectDTO[]>("/patients/select");
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await apiClient<StaffSelectDTO[]>("/staff/select");
      if (response.success && response.data) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error("Failed to load staff:", error);
    }
  };

  const handlePatientChange = useCallback(async (patientId: string) => {
    if (!patientId) {
      setSelectedPatient(null);
      setAuthorizations([]);
      setSelectedAuthorization(null);
      return;
    }

    // Find patient from current patients list or wait for it to load
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      form.setFieldValue("medicaidId", patient.medicaidId);
    } else {
      // If patient not found in list, still set the ID for form
      setSelectedPatient({ id: patientId, displayName: "" } as PatientSelectDTO);
    }
    
    // Load authorizations for this patient
    try {
      const response: ApiResponse<AuthorizationSelectDTO[]> = await apiClient<AuthorizationSelectDTO[]>(
        `/patients/${patientId}/schedule/authorizations/select`
      );
      
      if (response.success && response.data) {
        setAuthorizations(response.data);
      } else {
        setAuthorizations([]);
      }
    } catch (error) {
      console.error("Failed to load authorizations:", error);
      setAuthorizations([]);
    }
    
    // Reset dependent fields
    form.setFieldValue("authorizationId", undefined);
    form.setFieldValue("authorizationNo", undefined);
    form.setFieldValue("eventCode", undefined);
    form.setFieldValue("billUnitType", undefined);
    setSelectedAuthorization(null);
    setFullAuthorization(null);
  }, [patients, form]);

  // Load initial data and reset state when modal opens
  useEffect(() => {
    if (open) {
      loadPatients();
      loadStaff();
      setErrorMessage(null);
      setShowSuccess(false);
      previewMutation.reset();
      createMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Handle preselected patient after patients are loaded
  useEffect(() => {
    if (open && preselectedPatientId && patients.length > 0) {
      const patient = patients.find((p) => p.id === preselectedPatientId);
      if (patient) {
        form.setFieldValue("patientId", preselectedPatientId);
        handlePatientChange(preselectedPatientId);
      }
    }
  }, [open, preselectedPatientId, patients, form, handlePatientChange]);

  // Handle preselected staff
  useEffect(() => {
    if (open && preselectedStaffId) {
      form.setFieldValue("staffId", preselectedStaffId);
    }
  }, [open, preselectedStaffId, form]);

  const handleAuthorizationChange = useCallback(async (authorizationId: string) => {
    const auth = authorizations.find((a) => a.id === authorizationId);
    setSelectedAuthorization(auth || null);
    
    if (auth) {
      // Auto-fill authorization fields
      form.setFieldValue("eventCode", auth.eventCode || "");
      form.setFieldValue("billUnitType", auth.billType || "");
      
      // Load full authorization details for the card
      if (selectedPatient) {
        try {
          const programResponse: ApiResponse<PatientProgramDTO> = await apiClient<PatientProgramDTO>(
            `/patients/${selectedPatient.id}/program`
          );
          
          if (programResponse.success && programResponse.data) {
            const fullAuth = programResponse.data.authorizations?.find(
              (a) => a.authorizationId === authorizationId
            );
            if (fullAuth) {
              form.setFieldValue("authorizationNo", fullAuth.authorizationNo || "");
              setFullAuthorization(fullAuth);
            }
          }
        } catch (error) {
          console.error("Failed to load authorization details:", error);
        }
      }
    }
  }, [authorizations, selectedPatient, form]);

  const handleCreatePreview = async () => {
    setErrorMessage(null);
    setShowSuccess(false);
    
    try {
      const values = await form.validateFields();
      
      const scheduleEvent: CreateScheduleEventDTO = {
        patientId: values.patientId,
        eventDate: values.eventDate.format("YYYY-MM-DD"),
        startTime: dayjs(values.startTime).format("HH:mm"),
        endTime: dayjs(values.endTime).format("HH:mm"),
        authorizationId: values.authorizationId || "",
        staffId: values.staffId,
        eventCode: values.eventCode || selectedAuthorization?.eventCode || "",
        status: values.status,
        plannedUnits: values.plannedUnits || 1,
        comments: values.comments,
      };
      
      const request: CreateSchedulePreviewRequestDTO = {
        scheduleEvent,
        repeatConfig: isRepeatEvent ? repeatConfig : undefined,
      };
      
      const result = await previewMutation.mutateAsync(request);
      setPreviewData(result);
      setShowSuccess(true);
    } catch (error: unknown) {
      console.error("Failed to create preview:", error);
      
      // Handle Ant Design form validation errors
      if (
        error &&
        typeof error === "object" &&
        "errorFields" in error &&
        Array.isArray((error as { errorFields: Array<{ errors?: string[] }> }).errorFields) &&
        (error as { errorFields: Array<{ errors?: string[] }> }).errorFields.length > 0
      ) {
        // Extract first validation error message
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
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        setErrorMessage(error.response.data.message);
      } else if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to create preview. Please try again.");
      }
    }
  };

  const handleSave = async () => {
    if (!previewData) {
      setErrorMessage("No preview data available");
      return;
    }
    
    // Check if any events are selected
    if (selectedEventIds.size === 0) {
      setErrorMessage("Please select at least one event to save");
      return;
    }
    
    // Check if there are unresolved conflicts
    const unresolvedConflicts = previewData.conflicts.filter((c) => !c.resolved);
    if (unresolvedConflicts.length > 0) {
      setErrorMessage(`Please resolve all conflicts before saving. ${unresolvedConflicts.length} conflict(s) remaining.`);
      return;
    }
    
    if (!previewData.canSave) {
      setErrorMessage("Please resolve all conflicts before saving");
      return;
    }
    
    setErrorMessage(null);
    setShowSuccess(false);
    
    try {
      // Only save selected events
      // Use the same key generation logic as rowKey to match selected events
      const eventsToSave = previewData.scheduleEvents.filter((event) => {
        const eventKey = event.id || `event-${event.eventDate}-${event.startAt}`;
        return selectedEventIds.has(eventKey);
      });
      
      if (eventsToSave.length === 0) {
        setErrorMessage("Please select at least one event to save");
        return;
      }
      
      await createMutation.mutateAsync({
        scheduleEvents: eventsToSave.map((event) => {
          // Extract HH:mm directly from the ISO string to avoid timezone shifts by the browser
          // This ensures we send back exactly the time that was returned in the preview (e.g. "15:00")
          // instead of converting 15:00 UTC to 22:00 Local (UTC+7)
          const startTimeStr = typeof event.startAt === 'string' 
            ? event.startAt.split('T')[1].substring(0, 5) 
            : dayjs(event.startAt).format("HH:mm");
            
          const endTimeStr = typeof event.endAt === 'string'
            ? event.endAt.split('T')[1].substring(0, 5)
            : dayjs(event.endAt).format("HH:mm");

          return {
            patientId: event.patientId,
            eventDate: dayjs(event.eventDate).format("YYYY-MM-DD"),
            startTime: startTimeStr,
            endTime: endTimeStr,
            authorizationId: event.authorizationId || "",
            staffId: event.employeeId,
            eventCode: event.eventCode,
            status: event.status,
            plannedUnits: event.plannedUnits,
            comments: "",
          };
        }),
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
        handleClose();
      }, 3000);
    } catch (error: unknown) {
      console.error("Failed to create schedule events:", error);
      
      // Handle API errors
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        setErrorMessage(error.response.data.message);
      } else if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to create schedule events. Please try again.");
      }
    }
  };

  const handleClose = () => {
    form.resetFields();
    setPreviewData(null);
    setRepeatConfig(undefined);
    setIsRepeatEvent(false);
    setSelectedPatient(null);
    setSelectedAuthorization(null);
    setFullAuthorization(null);
    setAuthorizations([]);
    setErrorMessage(null);
    setShowSuccess(false);
    setSelectedEventIds(new Set());
    setShowConflictsForEvent(null);
    setChangeEmployeeModalOpen(false);
    setNewEmployeeId(undefined);
    changeEmployeeForm.resetFields();
    previewMutation.reset();
    createMutation.reset();
    onCancel();
  };

  const handleRepeatConfigSave = (config: RepeatConfigDTO) => {
    setRepeatConfig(config);
    setRepeatModalOpen(false);
  };

  return (
    <>
      <Modal
        title="Create Schedule"
        open={open}
        onCancel={handleClose}
        width={1200}
        footer={null}
        styles={{ body: { padding: 0, height: "70vh", overflow: "hidden" } }}
      >
        <div className="flex h-full">
          {/* Left: Form */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200">
            <Form form={form} layout="vertical">
              {/* Client | Program + Medicaid ID */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Client | Program"
                  name="patientId"
                  rules={[{ required: true, message: "Please select a client" }]}
                >
                  <Select
                    placeholder="Start typing Client's name..."
                    className={formStyles.formSelect}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value) => {
                      if (value) {
                        form.setFieldValue("patientId", value);
                        handlePatientChange(value);
                      } else {
                        form.setFieldValue("patientId", undefined);
                        setSelectedPatient(null);
                        setAuthorizations([]);
                        setSelectedAuthorization(null);
                        setFullAuthorization(null);
                      }
                    }}
                    disabled={!!preselectedPatientId}
                    options={patients.map((p) => ({
                      label: p.displayName,
                      value: p.id,
                    }))}
                  />
                </Form.Item>
                
                <Form.Item label="Medicaid ID" name="medicaidId">
                  <Input
                    className={formStyles.formInputDisabled}
                    disabled
                    placeholder="Auto-filled"
                  />
                </Form.Item>
              </div>

              <div className="text-sm font-semibold mt-4 mb-2">Patient Service Information</div>

              {/* Authorization + Service */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item label="Authorization" name="authorizationNo">
                  <Input
                    className={formStyles.formInputDisabled}
                    disabled
                    placeholder="Authorization Number"
                  />
                </Form.Item>
                
                <Form.Item
                  label="Service"
                  name="authorizationId"
                  rules={[{ required: true, message: "Please select a service" }]}
                >
                  <Select
                    placeholder="Select Service"
                    className={formStyles.formSelect}
                    onChange={(value) => {
                      form.setFieldValue("authorizationId", value);
                      handleAuthorizationChange(value);
                    }}
                    disabled={!selectedPatient}
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
              </div>

              {/* Event Code + Bill Unit Type */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item label="Event Code" name="eventCode">
                  <Input className={formStyles.formInputDisabled} disabled />
                </Form.Item>
                
                <Form.Item label="Authorization Bill Unit Type" name="billUnitType">
                  <Input className={formStyles.formInputDisabled} disabled />
                </Form.Item>
              </div>

              {/* Authorization Card */}
              {selectedAuthorization && fullAuthorization && (
                <>
                  <div className="text-sm font-semibold mt-4 mb-2">Authorizations</div>
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

              <div className="text-sm font-semibold mt-4 mb-2">Schedule Event(s)</div>

              {/* Event Status + Event Date */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Event Status"
                  name="status"
                  initialValue="PLANNED"
                  rules={[{ required: true }]}
                >
                  <Select className={formStyles.formSelect}>
                    <Option value="PLANNED">Planned</Option>
                    <Option value="CONFIRMED">Confirmed</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Event Date"
                  name="eventDate"
                  rules={[{ required: true, message: "Please select event date" }]}
                  getValueFromEvent={(date) => date}
                  normalize={(value) => value}
                >
                  <DatePicker
                    className={formStyles.formDatePicker}
                    format="MM/DD/YYYY"
                    style={{ width: "100%" }}
                    allowClear={false}
                    onChange={(date) => {
                      // Form.Item will handle the value automatically
                      // This ensures the value is set when date is selected
                      form.setFieldValue("eventDate", date);
                    }}
                  />
                </Form.Item>
              </div>

              {/* Start Time + End Time */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Start Time"
                  name="startTime"
                  rules={[{ required: true, message: "Please select start time" }]}
                >
                  <TimePicker
                    className={formStyles.formInput}
                    format="h:mm A"
                    style={{ width: "100%" }}
                    minuteStep={15}
                    needConfirm={false}
                    onChange={(time) => {
                      if (time) {
                        form.setFieldValue("startTime", time);
                      }
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  label="End Time"
                  name="endTime"
                  rules={[{ required: true, message: "Please select end time" }]}
                >
                  <TimePicker
                    className={formStyles.formInput}
                    format="h:mm A"
                    style={{ width: "100%" }}
                    minuteStep={15}
                    needConfirm={false}
                    onChange={(time) => {
                      if (time) {
                        form.setFieldValue("endTime", time);
                      }
                    }}
                  />
                </Form.Item>
              </div>

              <div className="text-sm font-semibold mt-4 mb-2">Select Employee</div>

              {/* Employee */}
              <Form.Item label="Employee" name="staffId">
                <Select
                  placeholder="Start typing Employee's name..."
                  className={formStyles.formSelect}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  disabled={!!preselectedStaffId}
                  onChange={(value) => {
                    form.setFieldValue("staffId", value);
                  }}
                  options={staff.map((s) => ({
                    label: s.displayName,
                    value: s.id,
                  }))}
                />
              </Form.Item>

              {/* Repeat Event Checkbox */}
              <Form.Item>
                <Checkbox
                  checked={isRepeatEvent}
                  onChange={(e) => {
                    setIsRepeatEvent(e.target.checked);
                    if (e.target.checked) {
                      setRepeatModalOpen(true);
                    } else {
                      setRepeatConfig(undefined);
                    }
                  }}
                >
                  Repeat Event
                </Checkbox>
                {repeatConfig && (
                  <span className="ml-2 text-sm text-gray-600">
                    (Every {repeatConfig.interval} {repeatConfig.frequency.toLowerCase()}
                    {repeatConfig.endDate && `, until ${repeatConfig.endDate}`}
                    {repeatConfig.occurrences && `, ${repeatConfig.occurrences} times`})
                  </span>
                )}
              </Form.Item>

              {/* Comments */}
              <Form.Item label="Comments" name="comments">
                <TextArea
                  rows={3}
                  placeholder="Type in a comment"
                  className={formStyles.formInput}
                />
              </Form.Item>

              {/* Error Message */}
              {errorMessage && !showSuccess && (
                <div className="mt-4 px-4 py-3">
                  <p className="text-sm text-red-600 m-0">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="mt-4 px-4 py-3">
                  <p className="text-sm text-green-600 font-[550] m-0">
                    {previewData ? "Preview created successfully!" : "Schedule events created successfully!"}
                  </p>
                </div>
              )}

                {/* Create Preview Button */}
                <div className="mt-6 flex justify-end">
                <Button
                  type="primary"
                  onClick={handleCreatePreview}
                  className={`${buttonStyles.btnPrimary}`}
                  disabled={previewMutation.isPending}
                >
                  {previewMutation.isPending ? "Creating Preview..." : "CREATE PREVIEW"}
                </Button>
              </div>
            </Form>
          </div>

          {/* Right: Preview Panel */}
          <div className="w-1/3 p-6 bg-gray-50 overflow-y-auto">
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="text-lg font-semibold">Schedule Preview</h3>
              <p className="text-sm text-gray-600">
                Check the events in Preview to proceed with schedule creation.
              </p>
            </div>

            {previewData && (
              <>
                {/* Schedule Details */}
                <div className="mb-4 p-3 bg-white rounded border">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Details</div>
                    {previewData.scheduleEvents.length > 0 && (
                      <>
                        <div className="text-gray-600">
                          {dayjs(previewData.scheduleEvents[0].eventDate).format("dddd, MMMM DD, YYYY")}
                          {previewData.scheduleEvents.length > 1 && (
                            <> - {dayjs(previewData.scheduleEvents[previewData.scheduleEvents.length - 1].eventDate).format("dddd, MMMM DD, YYYY")}</>
                          )}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {dayjs(previewData.scheduleEvents[0].startAt).format("h:mm A")} -{" "}
                          {dayjs(previewData.scheduleEvents[0].endAt).format("h:mm A")}{" "}
                          ({Math.round(dayjs(previewData.scheduleEvents[0].endAt).diff(dayjs(previewData.scheduleEvents[0].startAt), 'hour', true))}h)
                        </div>
                        {isRepeatEvent && (
                          <div className="text-gray-600 mt-1">
                            Repeating event(s): {previewData.scheduleEvents.length}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Scheduled Events */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">Scheduled events</div>
                    {selectedEventIds.size > 0 && (
                      <Space>
                        <Button
                          type="link"
                          size="small"
                          icon={<UserOutlined />}
                          onClick={() => setChangeEmployeeModalOpen(true)}
                          className="p-0 h-auto"
                        >
                          CHANGE EMPLOYEE
                        </Button>
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            // Remove selected events
                            setPreviewData((prev) => {
                              if (!prev) return prev;
                              const newEvents = prev.scheduleEvents.filter(
                                (e) => {
                                  const eventKey = e.id || `event-${e.eventDate}-${e.startAt}`;
                                  return !selectedEventIds.has(eventKey);
                                }
                              );
                              return {
                                ...prev,
                                scheduleEvents: newEvents,
                              };
                            });
                            setSelectedEventIds(new Set());
                          }}
                          className="p-0 h-auto"
                        />
                      </Space>
                    )}
                  </div>
                  <div className="bg-white rounded border">
                    <Table
                      dataSource={previewData.scheduleEvents}
                      pagination={false}
                      size="small"
                      rowKey={(record) => record.id || `event-${record.eventDate}-${record.startAt}`}
                      rowSelection={{
                        selectedRowKeys: Array.from(selectedEventIds),
                        onChange: (selectedRowKeys) => {
                          setSelectedEventIds(new Set(selectedRowKeys as string[]));
                        },
                      }}
                      columns={[
                        {
                          title: (
                            <Checkbox
                              checked={
                                previewData.scheduleEvents.length > 0 &&
                                previewData.scheduleEvents.every((e) =>
                                  selectedEventIds.has(e.id || "")
                                )
                              }
                              indeterminate={
                                selectedEventIds.size > 0 &&
                                selectedEventIds.size < previewData.scheduleEvents.length
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEventIds(
                                    new Set(
                                      previewData.scheduleEvents.map((ev) => 
                                        ev.id || `event-${ev.eventDate}-${ev.startAt}`
                                      )
                                    )
                                  );
                                } else {
                                  setSelectedEventIds(new Set());
                                }
                              }}
                            />
                          ),
                          width: 50,
                          render: () => null, // Checkbox is handled by rowSelection
                        },
                        {
                          title: "Events",
                          key: "event",
                          render: (_, record) => {
                            const eventKey = record.id || `event-${record.eventDate}-${record.startAt}`;
                            // Match conflicts by event date and time
                            const eventConflicts = previewData.conflicts.filter(
                              (c) => {
                                const conflictDate = dayjs(c.eventDate).format("YYYY-MM-DD");
                                const eventDateStr = dayjs(record.eventDate).format("YYYY-MM-DD");
                                return conflictDate === eventDateStr && 
                                       c.startTime === dayjs(record.startAt).format("HH:mm") &&
                                       !c.resolved;
                              }
                            );
                            const hasConflicts = eventConflicts.length > 0;
                            
                            return (
                              <div className={hasConflicts ? "bg-red-50 p-2 rounded" : ""}>
                                <div className={hasConflicts ? "text-red-700" : ""}>
                                  {dayjs(record.eventDate).format("dddd, MMMM DD, YYYY")}
                                </div>
                                {eventConflicts.length > 0 && (
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => {
                                      setShowConflictsForEvent(
                                        showConflictsForEvent === eventKey ? null : eventKey
                                      );
                                    }}
                                    className="p-0 h-auto text-red-600"
                                  >
                                    Show conflicts ({eventConflicts.length})
                                  </Button>
                                )}
                                {showConflictsForEvent === eventKey && eventConflicts.length > 0 && (
                                  <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                                    {eventConflicts.map((conflict, idx) => (
                                      <div key={idx} className="text-red-700 mb-1">
                                        • {conflict.message}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Conflicts Summary */}
                {previewData.conflicts.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded border border-red-300">
                    <div className="font-medium text-sm text-red-700 mb-2">
                      ⚠️ Conflicts ({previewData.conflicts.filter((c) => !c.resolved).length})
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <Button
                  type="primary"
                  onClick={handleSave}
                  className={`${buttonStyles.btnPrimary} w-full`}
                  disabled={
                    !previewData.canSave || 
                    createMutation.isPending ||
                    selectedEventIds.size === 0 ||
                    previewData.conflicts.some((c) => !c.resolved)
                  }
                  block
                >
                  {createMutation.isPending ? "Saving..." : "SAVE"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Repeat Event Modal */}
      <RepeatEventModal
        open={repeatModalOpen}
        onOk={handleRepeatConfigSave}
        onCancel={() => setRepeatModalOpen(false)}
        initialValue={repeatConfig}
      />

      {/* Change Employee Modal */}
      <Modal
        title={`Edit Events (${selectedEventIds.size})`}
        open={changeEmployeeModalOpen}
        onCancel={() => {
          setChangeEmployeeModalOpen(false);
          changeEmployeeForm.resetFields();
          setNewEmployeeId(undefined);
        }}
        footer={null}
        width={500}
      >
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Edit information for selected ({selectedEventIds.size}) events.
          </p>
          
          <Form
            form={changeEmployeeForm}
            layout="vertical"
            onFinish={(values) => {
              if (!previewData) return;
              
              // Update employee for selected events
              const updatedEvents = previewData.scheduleEvents.map((event) => {
                const eventKey = event.id || `event-${event.eventDate}-${event.startAt}`;
                if (selectedEventIds.has(eventKey)) {
                  return {
                    ...event,
                    employeeId: values.employeeId === "none" ? undefined : values.employeeId,
                    employeeName: values.employeeId === "none" 
                      ? undefined 
                      : staff.find((s) => s.id === values.employeeId)?.displayName,
                  };
                }
                return event;
              });
              
              setPreviewData({
                ...previewData,
                scheduleEvents: updatedEvents,
              });
              
              setChangeEmployeeModalOpen(false);
              changeEmployeeForm.resetFields();
              setNewEmployeeId(undefined);
            }}
          >
            <Form.Item 
              label="Replace Employee With"
              name="employeeId"
            >
              <Select
                placeholder="Type 2 letters of the Employee's name"
                showSearch
                allowClear
                value={newEmployeeId}
                onChange={(value) => setNewEmployeeId(value)}
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
            
            <Form.Item>
              <Checkbox
                checked={newEmployeeId === "none"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setNewEmployeeId("none");
                    changeEmployeeForm.setFieldValue("employeeId", "none");
                  } else {
                    setNewEmployeeId(undefined);
                    changeEmployeeForm.setFieldValue("employeeId", undefined);
                  }
                }}
              >
                None
              </Checkbox>
            </Form.Item>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setChangeEmployeeModalOpen(false);
                  changeEmployeeForm.resetFields();
                  setNewEmployeeId(undefined);
                }}
              >
                CANCEL
              </Button>
              <Button
                type="primary"
                htmlType="submit"
              >
                SAVE CHANGES
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
}

