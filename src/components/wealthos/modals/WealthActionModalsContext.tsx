"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  QuickInteractionModal,
  ClientTarget,
  InteractionChannel,
} from "./QuickInteractionModal";
import {
  PortfolioReviewModal,
  ReviewType,
} from "./PortfolioReviewModal";
import {
  SendReportModal,
  ReportTemplate,
} from "./SendReportModal";
import {
  DeployCashModal,
} from "./DeployCashModal";

interface WealthActionModalsContextType {
  openInteractionModal: (
    client?: ClientTarget | null,
    channel?: InteractionChannel,
    context?: string
  ) => void;
  openReviewModal: (
    client?: ClientTarget | null,
    reviewType?: ReviewType
  ) => void;
  openReportModal: (
    client?: ClientTarget | null,
    reportType?: ReportTemplate
  ) => void;
  openDeployCashModal: (client?: ClientTarget | null) => void;
  closeAll: () => void;
}

const WealthActionModalsContext = createContext<WealthActionModalsContextType | null>(null);

export function WealthActionModalsProvider({ children }: { children: ReactNode }) {
  // 1. Interaction Modal State
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [interactionClient, setInteractionClient] = useState<ClientTarget | null>(null);
  const [interactionChannel, setInteractionChannel] = useState<InteractionChannel>("call");
  const [interactionContext, setInteractionContext] = useState<string>("");

  // 2. Portfolio Review Modal State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewClient, setReviewClient] = useState<ClientTarget | null>(null);
  const [reviewType, setReviewType] = useState<ReviewType>("rebalance");

  // 3. Send Report Modal State
  const [reportOpen, setReportOpen] = useState(false);
  const [reportClient, setReportClient] = useState<ClientTarget | null>(null);
  const [reportType, setReportType] = useState<ReportTemplate>("thematic_ev");

  // 4. Deploy Cash Modal State
  const [deployCashOpen, setDeployCashOpen] = useState(false);
  const [deployCashClient, setDeployCashClient] = useState<ClientTarget | null>(null);

  const openInteractionModal = useCallback(
    (client?: ClientTarget | null, channel: InteractionChannel = "call", context: string = "") => {
      setInteractionClient(client || null);
      setInteractionChannel(channel);
      setInteractionContext(context);
      setInteractionOpen(true);
    },
    []
  );

  const openReviewModal = useCallback(
    (client?: ClientTarget | null, type: ReviewType = "rebalance") => {
      setReviewClient(client || null);
      setReviewType(type);
      setReviewOpen(true);
    },
    []
  );

  const openReportModal = useCallback(
    (client?: ClientTarget | null, template: ReportTemplate = "thematic_ev") => {
      setReportClient(client || null);
      setReportType(template);
      setReportOpen(true);
    },
    []
  );

  const openDeployCashModal = useCallback((client?: ClientTarget | null) => {
    setDeployCashClient(client || null);
    setDeployCashOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setInteractionOpen(false);
    setReviewOpen(false);
    setReportOpen(false);
    setDeployCashOpen(false);
  }, []);

  return (
    <WealthActionModalsContext.Provider
      value={{
        openInteractionModal,
        openReviewModal,
        openReportModal,
        openDeployCashModal,
        closeAll,
      }}
    >
      {children}

      {/* Render Shared Modals */}
      <QuickInteractionModal
        isOpen={interactionOpen}
        onClose={() => setInteractionOpen(false)}
        client={interactionClient}
        initialChannel={interactionChannel}
        initialContext={interactionContext}
      />

      <PortfolioReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        client={reviewClient}
        initialReviewType={reviewType}
      />

      <SendReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        client={reportClient}
        initialReportType={reportType}
      />

      <DeployCashModal
        isOpen={deployCashOpen}
        onClose={() => setDeployCashOpen(false)}
        client={deployCashClient}
      />
    </WealthActionModalsContext.Provider>
  );
}

export function useWealthActionModals() {
  const context = useContext(WealthActionModalsContext);
  if (!context) {
    throw new Error(
      "useWealthActionModals must be used within a WealthActionModalsProvider"
    );
  }
  return context;
}
