"use client";

import * as React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export interface ScatterDataPoint {
  x: number;
  y: number;
  name?: string;
}

export interface ScatterSeries {
  data: ScatterDataPoint[];
  name: string;
  color: string;
}

interface ScatterplotProps {
  series: ScatterSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    payload: ScatterDataPoint;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {payload[0].name}
            </span>
            <span className="font-bold text-muted-foreground">
              X: {data.x.toFixed(2)}
            </span>
            <span className="font-bold text-muted-foreground">
              Y: {data.y.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function Scatterplot({
  series,
  xAxisLabel = "X Axis",
  yAxisLabel = "Y Axis",
  className,
  height = 300,
}: ScatterplotProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisLabel}
            label={{ value: xAxisLabel, position: "insideBottom", offset: -10 }}
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisLabel}
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {series.map((s, index) => (
            <Scatter
              key={index}
              name={s.name}
              data={s.data}
              fill={s.color}
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

