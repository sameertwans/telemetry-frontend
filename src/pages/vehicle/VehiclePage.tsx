import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Layout,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { TelemetryHistoryDrawer } from "./TelemetryPage";
import { VehicleFormModal } from "./FormPage";
import type {
  RangeValue,
  TelemetrySample,
  Vehicle,
  VehicleFormValues,
} from "./types";

const { Content } = Layout;
const DEFAULT_RANGE_HOURS = 12;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";
type CreateVehiclePayload = {
  name: string;
  code: string;
};

type UpdateVehiclePayload = {
  name: string;
};

type RawVehicle = {
  id: string;
  name: string;
  vehicle_code?: string;
  code?: string;
  latestTelemetry?: {
    ts?: string;
    lat?: number;
    lon?: number;
    speed?: number;
  };
};

function mapVehicle(record: RawVehicle): Vehicle {
  return {
    id: record.id,
    name: record.name,
    code: record.vehicle_code ?? record.code,
    latestTelemetry: record.latestTelemetry,
  };
}

async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE_URL}/vehicles`);
  if (!response.ok) {
    throw new Error("Unable to load vehicles");
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    return (data as RawVehicle[]).map(mapVehicle);
  }
  if (Array.isArray(data?.items)) {
    return (data.items as RawVehicle[]).map(mapVehicle);
  }
  if (Array.isArray(data?.data)) {
    return (data.data as RawVehicle[]).map(mapVehicle);
  }
  return [];
}

async function createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to create vehicle");
  }
  return (await response.json()) as Vehicle;
}

async function updateVehicle(
  id: string,
  payload: UpdateVehiclePayload
): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to update vehicle");
  }
  return (await response.json()) as Vehicle;
}

function formatTimestamp(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type RawTelemetry = {
  ts?: string;
  timestamp?: string;
  lat?: number;
  lon?: number;
  speed?: number;
};

function mapTelemetrySample(entry: RawTelemetry): TelemetrySample {
  return {
    timestamp: entry.timestamp ?? entry.ts ?? "",
    lat: entry.lat,
    lon: entry.lon,
    speed: entry.speed,
  };
}

function asArray<T>(candidate: unknown): T[] {
  return Array.isArray(candidate) ? candidate : [];
}

async function fetchTelemetryHistory(
  vehicleId: string,
  from?: string,
  to?: string
): Promise<TelemetrySample[]> {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}/telemetry${query ? `?${query}` : ""}`
  );
  if (!response.ok) {
    throw new Error("Unable to load telemetry history");
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    return (data as RawTelemetry[]).map(mapTelemetrySample);
  }
  if (Array.isArray(data?.items)) {
    return (data.items as RawTelemetry[]).map(mapTelemetrySample);
  }
  if (Array.isArray(data?.data)) {
    return (data.data as RawTelemetry[]).map(mapTelemetrySample);
  }
  return [];
}

function defaultRange(): RangeValue {
  const end = dayjs();
  const start = end.subtract(DEFAULT_RANGE_HOURS, "hour");
  return [start, end];
}

export function VehiclePage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerVehicle, setDrawerVehicle] = useState<Vehicle | null>(null);
  const [telemetryRange, setTelemetryRange] = useState<RangeValue>(() =>
    defaultRange()
  );
  const [telemetry, setTelemetry] = useState<TelemetrySample[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchVehicles();
      setVehicles(asArray(payload));
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Unknown error";
      setError(messageText);
      message.error(messageText);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingVehicle(null);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingVehicle(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: VehicleFormValues) => {
      setFormSubmitting(true);
      try {
        if (editingVehicle) {
          await updateVehicle(editingVehicle.id, { name: values.name });
          message.success("Vehicle updated");
        } else {
          if (!values.code) {
            throw new Error("Code is required to create a vehicle");
          }
          await createVehicle({ name: values.name, code: values.code });
          message.success("Vehicle created");
        }
        await loadVehicles();
        handleFormClose();
      } catch (err) {
        const messageText =
          err instanceof Error ? err.message : "Unable to save vehicle";
        message.error(messageText);
      } finally {
        setFormSubmitting(false);
      }
    },
    [editingVehicle, handleFormClose, loadVehicles]
  );

  const columns: ColumnsType<Vehicle> = useMemo(
    () => [
      {
        title: "Vehicle",
        key: "name",
        render: (_, record) => (
          <Space orientation="vertical" size={0}>
            <Typography.Text strong>{record.name}</Typography.Text>
            <Typography.Text type="secondary">
              {record.code || record.id}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: "Speed (km/h)",
          key: "speed",
          render: (_, record) => record.latestTelemetry?.speed ?? "—",
      },
      {
          title: "Last location",
          key: "location",
          render: (_, record) => {
            const lat = record.latestTelemetry?.lat;
            const lon = record.latestTelemetry?.lon;
            if (lat == null || lon == null) return "—";
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          },
      },
      {
        title: "Last updated",
          key: "lastUpdated",
          render: (_, record) => formatTimestamp(record.latestTelemetry?.ts),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              onClick={(event) => {
                event.stopPropagation();
                handleEdit(record);
              }}
            >
              Edit
            </Button>
          </Space>
        ),
      },
    ],
    [handleEdit]
  );

  const telemetryColumns: ColumnsType<TelemetrySample> = useMemo(
    () => [
      {
        title: "Timestamp",
        dataIndex: "timestamp",
        render: (value: string) => formatTimestamp(value),
      },
      {
        title: "Speed (km/h)",
        dataIndex: "speed",
        render: (value?: number) => value ?? "—",
      },
      {
        title: "Location",
        dataIndex: "location",
        render: (_: unknown, record) => {
          if (record.lat == null || record.lon == null) return "—";
          return `${record.lat.toFixed(4)}, ${record.lon.toFixed(4)}`;
        },
      },
    ],
    []
  );

  const loadTelemetryHistory = useCallback(
    async (vehicleId: string, range: RangeValue) => {
      setTelemetryLoading(true);
      try {
        const history = await fetchTelemetryHistory(
          vehicleId,
          range[0].toISOString(),
          range[1].toISOString()
        );
        setTelemetry(asArray(history));
      } catch (err) {
        const messageText =
          err instanceof Error ? err.message : "Unknown error";
        message.error(messageText);
      } finally {
        setTelemetryLoading(false);
      }
    },
    []
  );

  const handleVehicleClick = useCallback(
    (vehicle: Vehicle) => {
      setDrawerVehicle(vehicle);
      setTelemetry([]);
      void loadTelemetryHistory(vehicle.id, telemetryRange);
    },
    [loadTelemetryHistory, telemetryRange]
  );

  const handleDrawerClose = () => {
    setDrawerVehicle(null);
    setTelemetry([]);
  };

  const handleRangeChange = useCallback(
    (nextRange: RangeValue) => {
      setTelemetryRange(nextRange);
      if (drawerVehicle) {
        void loadTelemetryHistory(drawerVehicle.id, nextRange);
      }
    },
    [drawerVehicle, loadTelemetryHistory]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        style={{
          padding: "24px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <Space
            align="center"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <div>
              <Typography.Title level={2} style={{ marginBottom: 0 }}>
                Vehicles
              </Typography.Title>
              <Typography.Text type="secondary">
                Overview of vehicles and their latest telemetry
              </Typography.Text>
            </div>
            <Space>
              <Button onClick={() => navigate("/")}>Back</Button>
              {/* <Button
                icon={<ReloadOutlined />}
                onClick={loadVehicles}
                loading={loading}
              >
                Refresh
              </Button> */}
              <Button type="primary" onClick={handleCreate}>
                New vehicle
              </Button>
            </Space>
          </Space>

          <Card styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={vehicles}
              columns={columns}
              loading={loading}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => handleVehicleClick(record),
                style: { cursor: "pointer" },
              })}
              pagination={{ showSizeChanger: true }}
              locale={{
                emptyText: error
                  ? "Unable to load vehicles"
                  : "No vehicles found",
              }}
            />
          </Card>
        </Space>

        <TelemetryHistoryDrawer
          vehicle={drawerVehicle}
          open={Boolean(drawerVehicle)}
          telemetryRange={telemetryRange}
          telemetry={telemetry}
          telemetryLoading={telemetryLoading}
          columns={telemetryColumns}
          onClose={handleDrawerClose}
          onRangeChange={handleRangeChange}
        />
        <VehicleFormModal
          open={formOpen}
          vehicle={editingVehicle}
          submitting={formSubmitting}
          onCancel={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      </Content>
    </Layout>
  );
}
