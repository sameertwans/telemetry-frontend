import { DatePicker, Drawer, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RangePickerProps } from "antd/es/date-picker";
import type { RangeValue, TelemetrySample, Vehicle } from "./types";

const { RangePicker } = DatePicker;

type TelemetryHistoryDrawerProps = {
  vehicle: Vehicle | null;
  open: boolean;
  telemetryRange: RangeValue;
  telemetry: TelemetrySample[];
  telemetryLoading: boolean;
  columns: ColumnsType<TelemetrySample>;
  onClose: () => void;
  onRangeChange: (range: RangeValue) => void;
};

function telemetryRowKey(sample: TelemetrySample) {
  return `${sample.timestamp}-${sample.lat ?? "lat"}-${
    sample.lon ?? "lon"
  }-${sample.speed ?? "speed"}`;
}

export function TelemetryHistoryDrawer({
  vehicle,
  open,
  telemetryRange,
  telemetry,
  telemetryLoading,
  columns,
  onClose,
  onRangeChange,
}: TelemetryHistoryDrawerProps) {
    // console.log(telemetryRange);
    // console.log('******************');
  const handleRangeChange: RangePickerProps["onChange"] = (value) => {
    if (!value || !value[0] || !value[1]) return;
    onRangeChange([value[0], value[1]]);
  };

  return (
    <Drawer
      size="large"
      open={open}
      onClose={onClose}
      title={vehicle ? `${vehicle.name} telemetry` : "Vehicle telemetry"}
    >
      {vehicle && (
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            {vehicle.code || vehicle.id}
          </Typography.Text>
          <RangePicker
            allowClear={false}
            showTime
            value={telemetryRange}
            onChange={handleRangeChange}
            style={{ width: "100%" }}
          />
          <Table
            size="small"
            dataSource={telemetry}
            columns={columns}
            loading={telemetryLoading}
            rowKey={telemetryRowKey}
            pagination={false}
          />
        </Space>
      )}
    </Drawer>
  );
}

