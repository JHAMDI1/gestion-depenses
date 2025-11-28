import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cron quotidien : Générer les transactions récurrentes à minuit (UTC)
crons.daily(
    "generate recurring transactions",
    { hourUTC: 0, minuteUTC: 0 },
    internal.recurring_generator.processAllRecurrings
);

export default crons;
