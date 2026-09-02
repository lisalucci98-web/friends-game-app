import { logger } from "./logger";

const CARRY_OVER_INTERVAL_MS = 60_000;

class CarryOverRpcError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CarryOverRpcError";
  }
}

function supabaseConfig() {
  const url = process.env["VITE_SUPABASE_URL"]?.replace(/\/$/, "");
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for prediction carry-over.",
    );
  }

  return { url, serviceRoleKey };
}

async function applyCarryOver(
  url: string,
  serviceRoleKey: string,
  rolloutStartedAt: string,
) {
  const response = await fetch(`${url}/rest/v1/rpc/apply_prediction_carry_over`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_rollout_started_at: rolloutStartedAt }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new CarryOverRpcError(
      `Carry-over RPC failed with HTTP ${response.status}: ${message.slice(0, 300)}`,
      response.status,
    );
  }

  const result: unknown = await response.json();
  const inserted = typeof result === "number" ? result : 0;

  if (inserted > 0) {
    logger.info({ inserted }, "Prediction carry-over entries applied");
  }
}

export function startPredictionCarryOverWorker() {
  const { url, serviceRoleKey } = supabaseConfig();
  const rolloutStartedAt = new Date().toISOString();
  let running = false;
  let disabled = false;

  const tick = async () => {
    if (running || disabled) return;
    running = true;
    try {
      await applyCarryOver(url, serviceRoleKey, rolloutStartedAt);
    } catch (error) {
      logger.error({ err: error }, "Prediction carry-over worker failed");
      if (error instanceof CarryOverRpcError && error.status === 404) {
        disabled = true;
        logger.error(
          "Prediction carry-over worker disabled: apply the Supabase migration and restart the API server.",
        );
      }
    } finally {
      running = false;
    }
  };

  void tick();
  const timer = setInterval(() => void tick(), CARRY_OVER_INTERVAL_MS);
  timer.unref();

  return () => clearInterval(timer);
}