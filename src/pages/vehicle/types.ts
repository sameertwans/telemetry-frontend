import type { Dayjs } from "dayjs";

export type RangeValue = [Dayjs, Dayjs];

export type TelemetrySample = {
  timestamp: string;
  speed?: number;
  lat?: number;
  lon?: number;
};

export type LatestVehicleTelemetry = {
  ts?: string;
  lat?: number;
  lon?: number;
  speed?: number;
};

export type Vehicle = {
  id: string;
  name: string;
  code?: string;
  latestTelemetry?: LatestVehicleTelemetry;
};

export type VehicleFormValues = {
  name: string;
  code?: string;
};

