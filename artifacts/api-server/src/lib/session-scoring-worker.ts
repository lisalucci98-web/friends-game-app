import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { logger } from "./logger";

const execFileAsync = promisify(execFile);
const INTERVAL_MS = 120_000;
const API_BASE = "https://api.motogp.pulselive.com/motogp/v1";
const CATEGORY = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942";
type Section = "Q" | "SPR" | "RAC";
type Session = { id: string; type: string; number: number | null; status: string | null };
type Event = { grand_prix_id: string };
type GrandPrix = { id: string; short_name: string };

/**
 * Import verified official PDFs, then score only that section. The explicit
 * database allowlist prevents a new worker from touching historical rounds.
 * Persistent fingerprints in the RPC make retries and multi-instance polling
 * safe. A failed import never calls scoring or closes another session.
 */
export function startSessionScoringWorker() {
  const url = process.env["VITE_SUPABASE_URL"]?.replace(/\/$/, "");
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) {
    logger.error("Automatic session scoring unavailable: Supabase access is not configured.");
    return () => {};
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  let running = false;
  let stopped = false;
  let lastSetupWarning = 0;
  const importer = fileURLToPath(new URL("./jobs/import-motogp-results-2026.mjs", import.meta.url));

  async function rest<T>(path: string, body?: object): Promise<T> {
    const response = await fetch(`${url}/rest/v1${path}`, {
      method: body ? "POST" : "GET", headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      // Log codes, never auth headers, credentials or arbitrary response bodies.
      const details = await response.json().catch(() => ({})) as { code?: string };
      throw new Error(`Supabase ${response.status} (${details.code ?? "unknown"}) for ${path.split("?")[0]}`);
    }
    return await response.json() as T;
  }

  async function tick() {
    if (running || stopped) return;
    running = true;
    try {
      let events: Event[];
      try {
        events = await rest<Event[]>("/automatic_scoring_events?enabled=eq.true&select=grand_prix_id");
      } catch (error) {
        if (Date.now() - lastSetupWarning > 600_000) {
          logger.warn({ err: error }, "Automatic scoring not active: install the session scoring SQL migration. Will retry.");
          lastSetupWarning = Date.now();
        }
        return;
      }
      for (const event of events) {
        if (stopped) break;
        const [gps, sessions] = await Promise.all([
          rest<GrandPrix[]>(`/grand_prix?id=eq.${event.grand_prix_id}&select=id,short_name`),
          rest<Session[]>(`/sessions?grand_prix_id=eq.${event.grand_prix_id}&select=id,type,number,status`),
        ]);
        const gp = gps[0];
        if (!gp || !/^[A-Z0-9_-]+$/.test(gp.short_name)) throw new Error("Invalid enabled GP code");
        const response = await fetch(`${API_BASE}/results/sessions?eventUuid=${gp.id}&categoryUuid=${CATEGORY}`, {
          signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) throw new Error(`Official results feed HTTP ${response.status}`);
        const official = await response.json() as Session[];
        if (!Array.isArray(official)) throw new Error("Unexpected official session feed");
        for (const section of ["Q", "SPR", "RAC"] as Section[]) {
          if (stopped) break;
          const matching = official.filter((s) => section === "RAC"
            ? ["RAC", "RAC2"].includes(s.type) : s.type === section);
          const relevant = section === "Q"
            ? [...matching].sort((a, b) => (b.number ?? 0) - (a.number ?? 0)).slice(0, 1)
            : matching;
          if (!relevant.length || relevant.some((s) =>
            !["FINISHED", "COMPLETED", "CLASSIFIED", "CLOSED"].includes((s.status ?? "").toUpperCase()))) continue;
          const dbRelevant = sessions.filter((s) => section === "RAC"
            ? ["RAC", "RAC2"].includes(s.type) : s.type === section);
          // The importer validates every official part against DB session IDs.
          // Even closed sections are re-read to pick up official corrections.
          try {
            const { stdout } = await execFileAsync(process.execPath, [
              importer, "--gp", gp.short_name, "--section", section, "--require-finished", "--import",
            ], { timeout: 180_000, maxBuffer: 2 * 1024 * 1024, env: process.env });
            if (!stdout.includes("Import risultati completato")) {
              throw new Error("Importer did not confirm verified import completion");
            }
            const score = await rest<{ status: string; predictions_scored?: number }>(
              "/rpc/score_finished_prediction_section",
              { p_grand_prix_id: gp.id, p_section: section },
            );
            if (score.status !== "already_scored") {
              logger.info({ gp: gp.short_name, section, ...score, sessions: dbRelevant.length },
                "Automatic session scoring completed");
            }
          } catch (error) {
            // execFile errors can include process output; no credentials are passed
            // on the command line. Output from the importer contains no secrets.
            logger.error({ err: error, gp: gp.short_name, section },
              "Atomic import/scoring failed; retrying next cycle");
          }
        }
      }
    } catch (error) {
      logger.error({ err: error }, "Automatic scoring cycle failed; retrying next cycle");
    } finally {
      running = false;
    }
  }
  void tick();
  const timer = setInterval(() => void tick(), INTERVAL_MS);
  timer.unref();
  return () => { stopped = true; clearInterval(timer); };
}