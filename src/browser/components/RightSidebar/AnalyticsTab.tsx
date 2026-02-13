import React, { useState } from "react";
import { usePersistedState } from "@/browser/hooks/usePersistedState";
import { BarChart, TrendingUp, Clock, DollarSign } from "lucide-react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

interface AnalyticsTabProps {
  workspaceId: string;
}

/**
 * Analytics Tab Component
 * Displays agent performance metrics, model comparison, and cost analytics
 */
export function AnalyticsTab({ workspaceId }: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = usePersistedState<string>(
    `analytics:timeRange:${workspaceId}`,
    "all"
  );

  // Mock data - actual implementation would aggregate from workspace stats
  const mockAgentMetrics = [
    { agentId: "frontend-specialist", successRate: 95, avgTime: 3200, requests: 45 },
    { agentId: "backend-specialist", successRate: 92, avgTime: 2800, requests: 38 },
    { agentId: "mobile-developer", successRate: 88, avgTime: 4100, requests: 22 },
  ];

  const mockModelMetrics = [
    { model: "claude-3.5-sonnet", avgTtft: 850, avgTps: 45, requests: 105, cost: 2.45 },
    { model: "gpt-4-turbo", avgTtft: 1200, avgTps: 38, requests: 42, cost: 1.82 },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b p-4">
        <h2 className="mb-3 text-lg font-semibold">Performance Analytics</h2>

        <ToggleGroup.Root
          type="single"
          value={timeRange}
          onValueChange={(val) => val && setTimeRange(val)}
          className="border-border bg-secondary/30 inline-flex rounded-lg border p-0.5"
        >
          <ToggleGroup.Item
            value="all"
            className="data-[state=on]:bg-background rounded-md px-3 py-1.5 text-xs data-[state=on]:shadow-sm"
          >
            All Time
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="30d"
            className="data-[state=on]:bg-background rounded-md px-3 py-1.5 text-xs data-[state=on]:shadow-sm"
          >
            30 Days
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="7d"
            className="data-[state=on]:bg-background rounded-md px-3 py-1.5 text-xs data-[state=on]:shadow-sm"
          >
            7 Days
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Agent Performance */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <BarChart className="h-4 w-4" />
            Agent Success Rates
          </h3>
          <div className="space-y-2">
            {mockAgentMetrics.map((agent) => (
              <div
                key={agent.agentId}
                className="bg-secondary/20 border-border rounded-md border p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{agent.agentId}</span>
                  <span className="text-success text-sm">{agent.successRate}%</span>
                </div>
                <div className="bg-secondary h-2 w-full rounded-full">
                  <div
                    className="bg-success h-2 rounded-full"
                    style={{ width: `${agent.successRate}%` }}
                  />
                </div>
                <div className="text-muted-foreground mt-2 flex gap-4 text-xs">
                  <span>{agent.requests} requests</span>
                  <span>{agent.avgTime}ms avg</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Model Performance */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Model Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border border-b">
                <tr className="text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 font-medium">TTFT</th>
                  <th className="pb-2 font-medium">TPS</th>
                  <th className="pb-2 font-medium">Requests</th>
                  <th className="pb-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {mockModelMetrics.map((model) => (
                  <tr key={model.model}>
                    <td className="py-2">{model.model}</td>
                    <td className="py-2">{model.avgTtft}ms</td>
                    <td className="py-2">{model.avgTps} tok/s</td>
                    <td className="py-2">{model.requests}</td>
                    <td className="py-2">${model.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Export */}
        <div className="border-border border-t pt-4">
          <button className="border-border hover:bg-secondary/50 w-full rounded-md border px-4 py-2 text-sm">
            Export Analytics CSV
          </button>
        </div>
      </div>
    </div>
  );
}
