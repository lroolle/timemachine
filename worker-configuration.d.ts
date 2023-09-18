export interface Env {
  ACCESS_TOKEN: string;
  MAX_CONVERSATION_ENTRIES: number;
  // Namespaces
  TIMEMACHINE_KV: KVNamespace;
  TIMEMACHINE_LOGS: AnalyticsEngineDataset;
  // Debug only
  DEBUG: string;
}
