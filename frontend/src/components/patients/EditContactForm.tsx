"use client";

import React from "react";
import { Modal, Input, Select, Checkbox, Button } from "antd";
import { CloseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { ContactDTO } from "@/types/patient";

// Validation schema
const contactSchema = z.object({
  relation: z.string().min(1, "Relation is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Phone must be XXX-XXX-XXXX"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  isPrimary: z.boolean(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface EditContactFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  initialData?: ContactDTO | null;
  onUpdateSuccess?: () => void;
}

export default function EditContactForm({
  open,
  onClose,
  patientId,
  initialData,
  onUpdateSuccess,
}: EditContactFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {
      relation: "",
      name: "",
      phone: "",
      email: "",
      isPrimary: false,
    },
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      reset(
        initialData || {
          relation: "",
          name: "",
          phone: "",
          email: "",
          isPrimary: false,
        }
      );
      setShowSuccess(false);
    }
    previousOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: ContactFormData) => {
    // TODO: Implement API call
    console.log("Contact Form Data:", {
      patientId,
      contactId: initialData?.id,
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

  const RELATIONSHIP_OPTIONS = [
    { value: "Spouse", label: "Spouse" },
    { value: "Parent", label: "Parent" },
    { value: "Child", label: "Child" },
    { value: "Sibling", label: "Sibling" },
    { value: "Guardian", label: "Guardian" },
    { value: "Friend", label: "Friend" },
    { value: "Caregiver", label: "Caregiver" },
    { value: "Other", label: "Other" },
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
            {initialData ? "Edit Contact" : "Add Contact"}
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-[450px]"
        >
          <div className="flex-1 px-8 py-8 bg-theme-surface flex flex-col gap-6">
            {/* Relation & Name (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Relation <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="relation"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select relationship"
                      status={errors.relation ? "error" : ""}
                      className={formStyles.formSelect}
                      options={RELATIONSHIP_OPTIONS}
                    />
                  )}
                />
                {errors.relation && (
                  <span className="text-sm text-red-500">
                    {errors.relation.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter full name"
                      status={errors.name ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>

            {/* Phone & Email (2 columns) */}
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

            {/* Is Primary Contact Checkbox */}
            <div className="flex items-center gap-2">
              <Controller
                name="isPrimary"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    <span className="text-sm text-theme-primary">
                      Set as primary emergency contact
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
                Contact updated successfully!
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
