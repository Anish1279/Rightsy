"use client";

import type { ReactNode } from "react";
import {
  LearningVideoProvider,
  type LearningVideoProviderProps,
} from "../store/orchestrator-store";
import { LearningVideoModal } from "./LearningVideoModal";

interface LearningVideoOrchestratorProps extends Omit<LearningVideoProviderProps, "children"> {
  children: ReactNode;
}

export function LearningVideoOrchestrator({
  children,
  ...providerProps
}: LearningVideoOrchestratorProps) {
  return (
    <LearningVideoProvider {...providerProps}>
      {children}
      <LearningVideoModal />
    </LearningVideoProvider>
  );
}
