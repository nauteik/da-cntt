"use client";

import React, { useState } from "react";
import {
  Card,
  Empty,
  Button,
  Modal,
  DatePicker,
  InputNumber,
  Upload,
  App,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useISP,
  useCreateISP,
  useUpdateISP,
  useDeleteISP,
} from "@/hooks/useISP";
import { uploadISPFile } from "@/lib/api/ispApi";
import PdfViewer from "@/components/common/PdfViewer";
import { formatDate } from "@/lib/dateUtils";
import type { CreateISPDTO, UpdateISPDTO } from "@/types/isp";
import buttonStyles from "@/styles/buttons.module.css";
import formStyles from "@/styles/form.module.css";
import dayjs from "dayjs";
import type { UploadFile } from "antd";

interface PatientISPProps {
  patientId: string;
}

export default function PatientISP({ patientId }: PatientISPProps) {
  const { data: isp, isLoading, error } = useISP(patientId);
  const { message: antdMessage } = App.useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const createMutation = useCreateISP();
  const updateMutation = useUpdateISP();
  const deleteMutation = useDeleteISP();

  // Form state for create
  const [createForm, setCreateForm] = useState<CreateISPDTO>({
    versionNo: 1,
    effectiveAt: new Date().toISOString().split("T")[0],
    expiresAt: undefined,
    totalUnit: undefined,
    fileId: undefined,
  });

  // Form state for update
  const [updateForm, setUpdateForm] = useState<UpdateISPDTO>({});

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const response = await uploadISPFile(file, undefined, (progress) => {
        setUploadProgress(progress);
      });
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to upload file");
      }
      setUploadedFileId(response.data.id);
      setUploadProgress(100);
      antdMessage.success("File uploaded successfully");
      return response.data.id;
    } catch (error) {
      antdMessage.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
      setUploadProgress(0);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Handle create ISP
  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        patientId,
        data: {
          ...createForm,
          fileId: uploadedFileId || undefined,
        },
      });
      antdMessage.success("ISP created successfully");
      setIsCreateModalOpen(false);
      resetCreateForm();
    } catch (error) {
      antdMessage.error(
        error instanceof Error ? error.message : "Failed to create ISP"
      );
    }
  };

  // Handle update ISP
  const handleUpdate = async () => {
    if (!isp) return;

    try {
      // If a new file was uploaded, use it; otherwise keep existing fileId or undefined
      const fileIdToUse =
        uploadedFileId !== null ? uploadedFileId : updateForm.fileId;

      await updateMutation.mutateAsync({
        ispId: isp.id,
        data: {
          ...updateForm,
          fileId: fileIdToUse,
        },
      });
      antdMessage.success("ISP updated successfully");
      setIsUpdateModalOpen(false);
      resetUpdateForm();
    } catch (error) {
      antdMessage.error(
        error instanceof Error ? error.message : "Failed to update ISP"
      );
    }
  };

  // Handle delete ISP
  const handleDelete = async () => {
    if (!isp) return;

    try {
      await deleteMutation.mutateAsync({
        ispId: isp.id,
        patientId,
      });
      antdMessage.success("ISP deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      antdMessage.error(
        error instanceof Error ? error.message : "Failed to delete ISP"
      );
    }
  };

  // Reset forms
  const resetCreateForm = () => {
    setCreateForm({
      versionNo: 1,
      effectiveAt: new Date().toISOString().split("T")[0],
      expiresAt: undefined,
      totalUnit: undefined,
      fileId: undefined,
    });
    setUploadedFileId(null);
    setFileList([]);
    setUploadProgress(0);
  };

  const resetUpdateForm = () => {
    if (isp) {
      setUpdateForm({
        versionNo: isp.versionNo,
        effectiveAt: isp.effectiveAt.split("T")[0],
        expiresAt: isp.expiresAt ? isp.expiresAt.split("T")[0] : undefined,
        totalUnit: isp.totalUnit,
        fileId: isp.file?.id,
      });
    } else {
      setUpdateForm({});
    }
    setUploadedFileId(null);
    setFileList([]);
    setUploadProgress(0);
  };

  // Open update modal and populate form
  const openUpdateModal = () => {
    if (isp) {
      setUpdateForm({
        versionNo: isp.versionNo,
        effectiveAt: isp.effectiveAt.split("T")[0],
        expiresAt: isp.expiresAt ? isp.expiresAt.split("T")[0] : undefined,
        totalUnit: isp.totalUnit,
        fileId: isp.file?.id,
      });
      setUploadedFileId(null); // Reset uploaded file ID
      setFileList([]); // Reset file list
      setUploadProgress(0); // Reset progress
      setIsUpdateModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-theme-secondary">Loading ISP...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error loading ISP: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar */}
      <div className="flex justify-between items-center px-6">
        <div className="text-lg font-semibold text-theme-primary">
          Individual Service Plan
        </div>
        <div className="flex gap-3">
          {!isp ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className={buttonStyles.btnPrimary}
              onClick={() => setIsCreateModalOpen(true)}
            >
              CREATE ISP
            </Button>
          ) : (
            <>
              <Button
                icon={<EditOutlined />}
                className={buttonStyles.btnSecondary}
                onClick={openUpdateModal}
              >
                UPDATE
              </Button>
              <Button
                icon={<DeleteOutlined />}
                className={buttonStyles.btnDanger}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                REMOVE
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      {!isp ? (
        <Card className="mx-6 rounded-none shadow-sm border border-theme">
          <Empty
            description="No ISP found for this patient"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          ></Empty>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 px-6">
          {/* ISP Metadata Card */}
          <Card
            title="ISP Information"
            className="rounded-none shadow-sm border border-theme"
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                  <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                    Version
                  </span>
                  <span className="text-[13px] font-normal text-theme-primary">
                    {isp.versionNo}
                  </span>
                </div>
                {isp.totalUnit && (
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                    <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                      Total Unit
                    </span>
                    <span className="text-[13px] font-normal text-theme-primary">
                      {isp.totalUnit}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                  <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                    Effective Date
                  </span>
                  <span className="text-[13px] font-normal text-theme-primary">
                    {formatDate(isp.effectiveAt)}
                  </span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                  <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                    Expires Date
                  </span>
                  <span className="text-[13px] font-normal text-theme-primary">
                    {formatDate(isp.expiresAt)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* PDF Preview Card */}
          {isp.file ? (
            <Card
              title={
                <div className="flex justify-between items-center w-full">
                  <span>ISP Document</span>
                  <Button
                    icon={<DownloadOutlined />}
                    href={isp.file.storageUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles.btnSecondary}
                  >
                    Download
                  </Button>
                </div>
              }
              className="rounded-none shadow-sm border border-theme"
            >
              <PdfViewer
                fileUrl={isp.file.storageUri}
                fileName={isp.file.filename}
                className="w-full"
              />
            </Card>
          ) : (
            <Card
              title="ISP Document"
              className="rounded-none shadow-sm border border-theme"
            >
              <Empty
                description="No document attached"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </div>
      )}

      {/* Create ISP Modal */}
      <Modal
        title={null}
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        footer={null}
        width={600}
        className={formStyles.formModal}
        styles={{
          body: { padding: 0 },
        }}
        closeIcon={null}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
            <h2 className="text-xl font-semibold text-theme-primary m-0">
              Create ISP
            </h2>
            <CloseOutlined
              className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
            />
          </div>

          {/* Form Content */}
          <div className="px-8 py-8 bg-theme-surface flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Version Number <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={createForm.versionNo}
                onChange={(value) =>
                  setCreateForm({ ...createForm, versionNo: value || 1 })
                }
                min={1}
                className={`w-full ${formStyles.formInput}`}
                required
              />
            </div>
              <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Total Unit <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={createForm.totalUnit}
                onChange={(value) =>
                  setCreateForm({
                    ...createForm,
                    totalUnit: value || undefined,
                  })
                }
                min={0}
                step={0.01}
                className={`w-full ${formStyles.formInput}`}
              />
            </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Effective Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={
                  createForm.effectiveAt ? dayjs(createForm.effectiveAt) : null
                }
                onChange={(date) =>
                  setCreateForm({
                    ...createForm,
                    effectiveAt: date ? date.format("YYYY-MM-DD") : "",
                  })
                }
                className={`w-full ${formStyles.formDatePicker}`}
                format="YYYY-MM-DD"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Expires Date
              </label>
              <DatePicker
                value={
                  createForm.expiresAt ? dayjs(createForm.expiresAt) : null
                }
                onChange={(date) =>
                  setCreateForm({
                    ...createForm,
                    expiresAt: date ? date.format("YYYY-MM-DD") : undefined,
                  })
                }
                className={`w-full ${formStyles.formDatePicker}`}
                format="YYYY-MM-DD"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                ISP Document (PDF) <span className="text-red-500">*</span>
              </label>
              <Upload
                fileList={fileList}
                beforeUpload={async (file) => {
                  setFileList([
                    { uid: file.name, name: file.name, status: "uploading" },
                  ]);
                  try {
                    const fileId = await handleFileUpload(file);
                    setFileList([
                      { uid: fileId, name: file.name, status: "done" },
                    ]);
                    return false; // Prevent default upload
                  } catch {
                    setFileList([]);
                    return false;
                  }
                }}
                accept=".pdf,application/pdf"
                maxCount={1}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  className={buttonStyles.btnSecondary}
                >
                  Upload PDF
                </Button>
              </Upload>
              {uploading && uploadProgress > 0 && (
                <Progress
                  percent={uploadProgress}
                  status={uploadProgress === 100 ? "success" : "active"}
                  size="small"
                />
              )}
            </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
              className={buttonStyles.btnCancel}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              onClick={handleCreate}
              loading={createMutation.isPending}
              className={buttonStyles.btnPrimary}
              disabled={!createForm.versionNo || !createForm.effectiveAt}
            >
              CREATE
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update ISP Modal */}
      <Modal
        title={null}
        open={isUpdateModalOpen}
        onCancel={() => {
          setIsUpdateModalOpen(false);
          resetUpdateForm();
        }}
        footer={null}
        width={600}
        className={formStyles.formModal}
        styles={{
          body: { padding: 0 },
        }}
        closeIcon={null}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
            <h2 className="text-xl font-semibold text-theme-primary m-0">
              Update ISP 
            </h2>
            <CloseOutlined
              className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
              onClick={() => {
                setIsUpdateModalOpen(false);
                resetUpdateForm();
              }}
            />
          </div>

          {/* Form Content */}
          <div className="px-8 py-8 bg-theme-surface flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Version Number <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={updateForm.versionNo}
                onChange={(value) =>
                  setUpdateForm({
                    ...updateForm,
                    versionNo: value || undefined,
                  })
                }
                min={1}
                className={`w-full ${formStyles.formInput}`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Effective Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={
                  updateForm.effectiveAt ? dayjs(updateForm.effectiveAt) : null
                }
                onChange={(date) =>
                  setUpdateForm({
                    ...updateForm,
                    effectiveAt: date ? date.format("YYYY-MM-DD") : undefined,
                  })
                }
                className={`w-full ${formStyles.formDatePicker}`}
                format="YYYY-MM-DD"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Expires Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={
                  updateForm.expiresAt ? dayjs(updateForm.expiresAt) : null
                }
                onChange={(date) =>
                  setUpdateForm({
                    ...updateForm,
                    expiresAt: date ? date.format("YYYY-MM-DD") : undefined,
                  })
                }
                className={`w-full ${formStyles.formDatePicker}`}
                format="YYYY-MM-DD"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Total Unit <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={updateForm.totalUnit}
                onChange={(value) =>
                  setUpdateForm({
                    ...updateForm,
                    totalUnit: value || undefined,
                  })
                }
                min={0}
                step={0.01}
                className={`w-full ${formStyles.formInput}`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                ISP Document (PDF) <span className="text-red-500">*</span>
              </label>
              {isp?.file && (
                <div className="mb-2 text-sm text-theme-secondary">
                  Current: {isp.file.filename}
                </div>
              )}
              <Upload
                fileList={fileList}
                beforeUpload={async (file) => {
                  setFileList([
                    { uid: file.name, name: file.name, status: "uploading" },
                  ]);
                  try {
                    const fileId = await handleFileUpload(file);
                    setFileList([
                      { uid: fileId, name: file.name, status: "done" },
                    ]);
                    return false;
                  } catch {
                    setFileList([]);
                    return false;
                  }
                }}
                accept=".pdf,application/pdf"
                maxCount={1}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  className={buttonStyles.btnSecondary}
                >
                  {isp?.file ? "Replace PDF" : "Upload PDF"}
                </Button>
              </Upload>
              {uploading && uploadProgress > 0 && (
                <Progress
                  percent={uploadProgress}
                  status={uploadProgress === 100 ? "success" : "active"}
                  size="small"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={() => {
                setIsUpdateModalOpen(false);
                resetUpdateForm();
              }}
              className={buttonStyles.btnCancel}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              onClick={handleUpdate}
              loading={updateMutation.isPending}
              className={buttonStyles.btnPrimary}
            >
              UPDATE
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={null}
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={null}
        width={500}
        className={formStyles.formModal}
        styles={{
          body: { padding: 0 },
        }}
        closeIcon={null}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
            <h2 className="text-xl font-semibold text-theme-primary m-0">
              Delete ISP
            </h2>
            <CloseOutlined
              className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
              onClick={() => setIsDeleteModalOpen(false)}
            />
          </div>

          {/* Content */}
          <div className="px-8 py-8 bg-theme-surface">
            <p className="text-theme-primary mb-0">
              Are you sure you want to delete this ISP? This action cannot be
              undone.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              className={buttonStyles.btnCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              loading={deleteMutation.isPending}
              className={buttonStyles.btnDanger}
            >
              DELETE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
