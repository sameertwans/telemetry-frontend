import { Form, Input, Modal } from "antd";
import { useEffect, useMemo } from "react";
import type { Vehicle } from "./types";
import type { VehicleFormValues } from "./types";

type VehicleFormModalProps = {
  open: boolean;
  vehicle: Vehicle | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: VehicleFormValues) => void;
};

export function VehicleFormModal({
  open,
  vehicle,
  submitting,
  onCancel,
  onSubmit,
}: VehicleFormModalProps) {
  const [form] = Form.useForm<VehicleFormValues>();

  const initialValues = useMemo(
    () => ({
      name: vehicle?.name ?? "",
      code: vehicle?.code ?? "",
    }),
    [vehicle]
  );

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      title={vehicle ? "Edit Vehicle" : "New Vehicle"}
      okText={vehicle ? "Save Changes" : "Create Vehicle"}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={submitting}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form
        key={vehicle?.id ?? "new"}
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={initialValues}
        onFinish={(values) => onSubmit(values)}
      >
        <Form.Item
          name="name"
          label="Vehicle name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Vehicle van-005" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Code"
          rules={[{ required: !vehicle, message: "Code is required" }]}
        >
          <Input placeholder="Vehicle Code" disabled={Boolean(vehicle)} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
