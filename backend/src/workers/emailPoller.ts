import EmailCredential from "../models/EmailCredential";
import { EmailPollingService } from "../services/emailPolling";

let pollingInterval: NodeJS.Timeout | null = null;
const CHECK_INTERVAL_MS = 60000; // Check every 60 seconds

export const startEmailPoller = () => {
  if (pollingInterval) {
    console.log("ℹ️ Email Poller already running.");
    return;
  }

  console.log("🚀 Starting background email poller worker...");

  pollingInterval = setInterval(async () => {
    try {
      // Find all active configurations with polling enabled
      const activeCredentials = await EmailCredential.find({
        isActive: true,
        pollingEnabled: true,
      });

      console.log(
        `[EmailPoller] Found ${activeCredentials.length} active email configuration(s) to check.`
      );

      for (const cred of activeCredentials) {
        const now = new Date();
        let shouldPoll = false;

        if (!cred.lastPollTime) {
          shouldPoll = true;
        } else {
          const nextPollTime = new Date(
            cred.lastPollTime.getTime() + cred.pollingIntervalMinutes * 60000
          );
          shouldPoll = now >= nextPollTime;
        }

        if (shouldPoll) {
          console.log(
            `[EmailPoller] Polling emails for user ${cred.userId} (${cred.emailAddress})...`
          );

          // Run polling in the background without blocking the check loop
          const poller = new EmailPollingService(cred.userId.toString());
          poller
            .pollEmails()
            .then((stats) => {
              console.log(
                `[EmailPoller] Completed for user ${cred.userId}: ` +
                  `Checked ${stats.emails_checked} email(s), ` +
                  `Created ${stats.invoices_created} invoice(s), Status: ${stats.status}`
              );
            })
            .catch((err) => {
              console.error(`[EmailPoller] Polling error for user ${cred.userId}:`, err.message);
            });
        }
      }
    } catch (error) {
      console.error("[EmailPoller] Error in polling cycle:", (error as Error).message);
    }
  }, CHECK_INTERVAL_MS);
};

export const stopEmailPoller = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log("🛑 Background email poller worker stopped.");
  }
};