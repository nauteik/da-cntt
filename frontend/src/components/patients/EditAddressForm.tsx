"use client";

import React from "react";
import { Modal, Input, Select, Checkbox, Button, App, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/hooks/useApi";
import { addressSchema, type AddressFormData } from "@/lib/validation/patientSchemas";
import { ADDRESS_TYPES, US_STATES } from "@/lib/validation/validation";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { AddressDTO, PatientPersonalDTO } from "@/types/patient";
import { geocodeAddressWithFallback } from "@/lib/geocoding";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues
const DynamicAddressMap = dynamic(() => import("@/components/common/AddressMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
      <Spin size="large" />
    </div>
  ),
});

interface EditAddressFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  initialData?: AddressDTO | null;
  onUpdateSuccess?: () => void;
}

export default function EditAddressForm({
  open,
  onClose,
  patientId,
  initialData,
  onUpdateSuccess,
}: EditAddressFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);
  const { modal } = App.useApp();
  const [isGeocoding, setIsGeocoding] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: initialData || {
      label: "",
      type: undefined,
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      county: "",
      phone: "",
      email: "",
      isMain: false,
      latitude: null,
      longitude: null,
    },
  });

  // Watch address fields
  const line1 = useWatch({ control, name: "line1" });
  const line2 = useWatch({ control, name: "line2" });
  const city = useWatch({ control, name: "city" });
  const state = useWatch({ control, name: "state" });
  const postalCode = useWatch({ control, name: "postalCode" });
  const county = useWatch({ control, name: "county" });
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });

  // Determine if creating or updating based on initialData.id
  const isCreating = !initialData?.id;
  const endpoint = isCreating
    ? `/patients/${patientId}/addresses`
    : `/patients/${patientId}/addresses/${initialData.id}`;
  const method = isCreating ? "POST" : "PATCH";

  const mutation = useApiMutation<PatientPersonalDTO, AddressFormData>(
    endpoint,
    method,
    {
      onSuccess: () => {
        setShowSuccess(true);
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      },
    }
  );

  const deleteMutation = useApiMutation<PatientPersonalDTO, void>(
    `/patients/${patientId}/addresses/${initialData?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        setShowSuccess(true);
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      },
    }
  );

  // Manual geocoding function - called when user clicks sync button
  const handleSyncCoordinates = async () => {
    const hasAddressInfo = line1 && city && state;
    
    if (!hasAddressInfo) {
      modal.warning({
        title: "Incomplete Address",
        content: "Please fill in at least Address Line 1, City, and State before syncing coordinates.",
        centered: true,
      });
      return;
    }

    setIsGeocoding(true);
    try {
      // Use fallback geocoding with multiple strategies
      const result = await geocodeAddressWithFallback(
        line1,
        line2,
        city,
        state,
        postalCode,
        county
      );
      
      if (result) {
        setValue("latitude", result.latitude);
        setValue("longitude", result.longitude);
        modal.success({
          title: "Coordinates Synced",
          content: (
            <div>
              <p>Found coordinates: {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}</p>
              <p className="text-xs text-gray-500 mt-2">Location: {result.displayName}</p>
            </div>
          ),
          centered: true,
        });
      } else {
        modal.error({
          title: "Geocoding Failed",
          content: (
            <div>
              <p>Could not find coordinates for this address.</p>
              <p className="text-xs mt-2">Please check that:</p>
              <ul className="text-xs list-disc list-inside mt-1">
                <li>Address Line 1, City, and State are correct</li>
                <li>Or set coordinates manually using the map below</li>
              </ul>
            </div>
          ),
          centered: true,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      modal.error({
        title: "Geocoding Error",
        content: "An error occurred while fetching coordinates. Please try again or set coordinates manually.",
        centered: true,
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      // Transform incoming data to match form's expected enum values (uppercase)
      const formValues = initialData
        ? {
            ...initialData,
            type: initialData.type?.toUpperCase() as "HOME" | "COMMUNITY" | "SENIOR" | "BUSINESS" | undefined,
            latitude: initialData.latitude ?? null,
            longitude: initialData.longitude ?? null,
          }
        : {
            label: "",
            type: undefined,
            line1: "",
            line2: "",
            city: "",
            state: "",
            postalCode: "",
            county: "",
            phone: "",
            email: "",
            isMain: false,
            latitude: null,
            longitude: null,
          };

      reset(formValues);
      setShowSuccess(false);
      mutation.reset();
    }
    previousOpenRef.current = open;
  }, [open, initialData, reset, mutation]);

  const onSubmit = async (data: AddressFormData) => {
    // Include coordinates in submission
    const submitData = {
      ...data,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
    };
    await mutation.mutateAsync(submitData);
  };

  const handleCoordinateChange = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    mutation.reset();
    deleteMutation.reset();
    onClose();
  };

  const handleDelete = () => {
    if (!initialData?.id) return;

    modal.confirm({
      title: "Remove Address",
      content: "Are you sure you want to remove this address? This action cannot be undone.",
      okText: "REMOVE",
      okType: "danger",
      cancelText: "CANCEL",
      centered: true,
      okButtonProps: {
        className: buttonStyles.btnDanger,
      },
      cancelButtonProps: {
        className: buttonStyles.btnCancel,
      },
      onOk: () => {
        deleteMutation.mutate();
      },
    });
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closeIcon={null}
      width={700}
      className={formStyles.formModal}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            {initialData ? "Edit Address" : "Add Address"}
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-[500px]"
        >
          <div className="flex-1 px-8 py-8 bg-theme-surface flex flex-col gap-6">
            {/* Address Label & Address Type (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Address Label
                </label>
                <Controller
                  name="label"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g., Home, Work"
                      className={formStyles.formInput}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Address Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select address type"
                      className={formStyles.formSelect}
                      options={ADDRESS_TYPES}
                    />
                  )}
                />
              </div>
            </div>

            {/* Address Line 1 & Line 2 (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="line1"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter street address"
                      status={errors.line1 ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.line1 && (
                  <span className="text-sm text-red-500">
                    {errors.line1.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Address Line 2
                </label>
                <Controller
                  name="line2"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Apt, Suite, Unit, etc."
                      className={formStyles.formInput}
                    />
                  )}
                />
              </div>
            </div>

            {/* City & State (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  City <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter city"
                      status={errors.city ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.city && (
                  <span className="text-sm text-red-500">
                    {errors.city.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  State <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select state"
                      status={errors.state ? "error" : ""}
                      className={formStyles.formSelect}
                      options={US_STATES}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
                {errors.state && (
                  <span className="text-sm text-red-500">
                    {errors.state.message}
                  </span>
                )}
              </div>
            </div>

            {/* ZIP Code & County (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="XXXXX or XXXXX-XXXX"
                      status={errors.postalCode ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.postalCode && (
                  <span className="text-sm text-red-500">
                    {errors.postalCode.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  County <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="county"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter county"
                      status={errors.county ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.county && (
                  <span className="text-sm text-red-500">
                    {errors.county.message}
                  </span>
                )}
              </div>
            </div>

            {/* Phone Number & Email (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="XXX-XXX-XXXX"
                      status={errors.phone ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.phone && (
                  <span className="text-sm text-red-500">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Email
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                      status={errors.email ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.email && (
                  <span className="text-sm text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            {/* Is Main Address Checkbox */}
            <div className="flex items-center gap-2">
              <Controller
                name="isMain"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    <span className="text-sm text-theme-primary">
                      Set as main address
                    </span>
                  </Checkbox>
                )}
              />
            </div>

            {/* GPS Coordinates Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-theme-primary">
                  GPS Coordinates
                </label>
                <Button
                  type="default"
                  onClick={handleSyncCoordinates}
                  loading={isGeocoding}
                  disabled={!line1 || !city || !state}
                  size="small"
                  className={buttonStyles.btnSecondary}
                >
                  {isGeocoding ? "Syncing..." : "Sync Coordinates"}
                </Button>
              </div>
              <p className="text-xs text-theme-secondary">
                Click &quot;Sync Coordinates&quot; to automatically find coordinates from the address. You can also adjust them by clicking or dragging the marker on the map, or edit them directly below.
              </p>
              
              {/* Map */}
              <div className="w-full border border-theme rounded overflow-hidden">
                <DynamicAddressMap
                  latitude={latitude ?? undefined}
                  longitude={longitude ?? undefined}
                  onCoordinateChange={handleCoordinateChange}
                  height="300px"
                />
              </div>

              {/* Coordinate Input Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Latitude
                  </label>
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : parseFloat(value));
                        }}
                        placeholder="e.g., 40.7128"
                        className={formStyles.formInput}
                      />
                    )}
                  />
                  {errors.latitude && (
                    <span className="text-sm text-red-500">
                      {errors.latitude.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Longitude
                  </label>
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : parseFloat(value));
                        }}
                        placeholder="e.g., -74.0060"
                        className={formStyles.formInput}
                      />
                    )}
                  />
                  {errors.longitude && (
                    <span className="text-sm text-red-500">
                      {errors.longitude.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {(mutation.error || deleteMutation.error) && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface">
              <p className="text-sm text-red-600 m-0">
                {mutation.error?.message || deleteMutation.error?.message ||
                  "Failed to update address. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Address {deleteMutation.isSuccess ? "removed" : isCreating ? "created" : "updated"} successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={mutation.isPending || deleteMutation.isPending}
            >
              CANCEL
            </Button>
            <div className="flex gap-3">
              {!isCreating && (
                <Button
                  onClick={handleDelete}
                  className={buttonStyles.btnDanger}
                  disabled={mutation.isPending || deleteMutation.isPending}
                  loading={deleteMutation.isPending}
                >
                  REMOVE
                </Button>
              )}
              <Button
                type="primary"
                htmlType="submit"
                className={buttonStyles.btnPrimary}
                disabled={!isDirty || mutation.isPending || deleteMutation.isPending}
                loading={mutation.isPending}
              >
                {isCreating ? "CREATE" : "SAVE CHANGES"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
