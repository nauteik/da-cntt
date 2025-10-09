"use client";

import React from "react";
import { Modal, Form, Input, Button } from "antd";
import styles from "./CreateClientModal.module.css";

interface CreateClientModalProps {
  open: boolean;
  onCancel: () => void;
}

export default function CreateClientModal({
  open,
  onCancel,
}: CreateClientModalProps) {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleCreate = () => {
    // TODO: Implement create client logic
    console.log("Create client clicked");
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={400}
      centered
      className={styles.createClientModal}
      destroyOnHidden
    >
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>New Client</h2>

        <Form
          form={form}
          layout="vertical"
          className={styles.clientForm}
          requiredMark={false}
        >
          <div className={styles.requiredNote}>*Required</div>

          <Form.Item
            label={
              <span className={styles.formLabel}>
                Last Name<span className={styles.required}>*</span>
              </span>
            }
            name="lastName"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input
              placeholder="TRAN"
              className={styles.formInput}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className={styles.formLabel}>
                First Name<span className={styles.required}>*</span>
              </span>
            }
            name="firstName"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input
              placeholder="MINH"
              className={styles.formInput}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className={styles.formLabel}>
                Program<span className={styles.required}>*</span>
              </span>
            }
            name="program"
            rules={[{ required: true, message: "Please enter program" }]}
          >
            <Input
              placeholder="ODP"
              className={styles.formInput}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className={styles.formLabel}>
                Payer<span className={styles.required}>*</span>
              </span>
            }
            name="payer"
            rules={[{ required: true, message: "Please enter payer" }]}
          >
            <Input
              placeholder="PACDP"
              className={styles.formInput}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className={styles.formLabel}>Medicaid ID</span>}
            name="medicaidId"
          >
            <Input
              placeholder="123456789"
              className={styles.formInput}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className={styles.formLabel}>Phone</span>}
            name="phone"
          >
            <Input
              placeholder="(124) 554-5654"
              className={styles.formInput}
              size="large"
            />
          </Form.Item>

          <div className={styles.modalFooter}>
            <Button
              onClick={handleCancel}
              className={styles.cancelButton}
              size="large"
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              onClick={handleCreate}
              className={styles.createButton}
              size="large"
            >
              CREATE CLIENT
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
