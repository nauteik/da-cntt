"use client";

import React from "react";
import { Modal, Input, Select, Checkbox, Button } from "antd";
import { CloseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { AddressDTO } from "@/types/patient";
import { AddressType } from "@/types/patient";

// Validation schema
const addressSchema = z.object({
  label: z.string().optional(),
  type: z.enum(AddressType).optional(),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  county: z.string().min(1, "County is required"),
  phone: z
    .string()
    .regex(
      /^((\(\d{3}\)\s?)|\d{3}-)\d{3}-\d{4}$/,
      "Phone must be in format (XXX) XXX-XXXX"
    ),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  isMain: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
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
    },
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      reset(
        initialData || {
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
        }
      );
      setShowSuccess(false);
    }
    previousOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: AddressFormData) => {
    // TODO: Implement API call
    console.log("Address Form Data:", {
      patientId,
      addressId: initialData?.id,
      ...data,
    });

    // Simulate success
    setShowSuccess(true);
    if (onUpdateSuccess) {
      onUpdateSuccess();
    }

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    onClose();
  };

  const US_STATES = [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
  ];

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
        <div className="flex justify-between items-center px-8 py-6 border-b border-theme bg-theme-surface">
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
                      {...field}
                      placeholder="Select address type"
                      className={formStyles.formSelect}
                      options={[
                        { value: AddressType.HOME, label: "Home" },
                        { value: AddressType.COMMUNITY, label: "Community" },
                        { value: AddressType.SENIOR, label: "Senior" },
                        { value: AddressType.BUSINESS, label: "Business" },
                      ]}
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
                      {...field}
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
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500 text-lg" />
              <span className="text-sm text-green-500 font-medium">
                Address updated successfully!
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button onClick={handleCancel} className={buttonStyles.btnCancel}>
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className={buttonStyles.btnPrimary}
              disabled={!isDirty}
            >
              SAVE CHANGES
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
