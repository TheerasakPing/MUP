import React from "react";
import { predictTokenUsage, type TokenPrediction } from "@/common/utils/tokens/tokenPredictor";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";

interface TokenPredictionBannerProps {
  messageContent: string;
  attachedFiles: string[];
  currentContext: number;
  model: string;
  historicalAvgOutput?: number;
}

/**
 * Token Prediction Banner
 * Shows estimated token usage and cost before sending a message
 */
export function TokenPredictionBanner({
  messageContent,
  attachedFiles,
  currentContext,
  model,
  historicalAvgOutput,
}: TokenPredictionBannerProps) {
  const prediction = React.useMemo(
    () =>
      predictTokenUsage({
        messageContent,
        attachedFiles,
        currentContext,
        model,
        historicalAvgOutput,
      }),
    [messageContent, attachedFiles, currentContext, model, historicalAvgOutput]
  );

  if (!messageContent && attachedFiles.length === 0) {
    return null; // Don't show banner when input is empty
  }

  const getWarningColor = (level: TokenPrediction["warningLevel"]) => {
    switch (level) {
      case "critical":
        return "bg-danger/10 border-danger/30 text-danger";
      case "high":
        return "bg-warning/10 border-warning/30 text-warning";
      default:
        return "bg-secondary/30 border-border text-foreground";
    }
  };

  const getWarningIcon = (level: TokenPrediction["warningLevel"]) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4 shrink-0" />;
      default:
        return <Info className="h-4 w-4 shrink-0" />;
    }
  };

  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${getWarningColor(
        prediction.warningLevel
      )}`}
    >
      {getWarningIcon(prediction.warningLevel)}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            ~{prediction.estimatedTotalTokens.toLocaleString()} tokens
          </span>
          <span className="opacity-70">•</span>
          <span className="font-medium">${prediction.estimatedCostUsd.toFixed(4)} estimated</span>
        </div>

        {prediction.suggestions.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {prediction.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs opacity-80">
                <Lightbulb className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
