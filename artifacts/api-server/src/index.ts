import app from "./app";
import { logger } from "./lib/logger";
import { startPredictionCarryOverWorker } from "./lib/prediction-carry-over";
import { startSessionScoringWorker } from "./lib/session-scoring-worker";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const stopPredictionCarryOverWorker = startPredictionCarryOverWorker();
const stopSessionScoringWorker = startSessionScoringWorker();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

process.once("SIGTERM", stopPredictionCarryOverWorker);
process.once("SIGINT", stopPredictionCarryOverWorker);
process.once("SIGTERM", stopSessionScoringWorker);
process.once("SIGINT", stopSessionScoringWorker);
