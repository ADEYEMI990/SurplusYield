// server/src/jobs/roiJob.ts
import cron from "node-cron";
import mongoose, { ClientSession } from "mongoose";
import chalk from "chalk";
import { Transaction } from "../models/Transaction";
import User from "../models/User";
import connectDB from "../config/db";

console.log(chalk.greenBright("✅ ROI Cron Job Initialized (Debug Mode)"));

let retrying = false;

async function processROICredit() {
  const now = new Date();
  console.log(
    chalk.cyanBright(`\n🔁 ROI Credit Check Triggered — ${now.toISOString()}`)
  );

  try {
    // Ensure DB connection
    if (mongoose.connection.readyState !== 1) {
      console.log(chalk.yellow("⚠️ DB disconnected. Attempting reconnect..."));
      await connectDB();
    }

    // Fetch investments due for ROI
    const allInvestments = await Transaction.find({
      type: "investment",
    })
      .populate("plan")
      .populate("user");

    if (allInvestments.length === 0) {
      console.log(chalk.gray("ℹ️ No investments found at all."));
      return;
    }

    console.log(
      chalk.blueBright(`📦 Found ${allInvestments.length} total investment(s).`)
    );

    const eligibleInvestments = [];

    // --- Debug Filtering Pass ---
    for (const txn of allInvestments) {
      const plan: any = txn.plan;
      const user: any = txn.user;

      const reasons: string[] = [];

      if (!plan || !user) reasons.push("❌ Missing plan or user reference.");

      if (txn.roiLock) reasons.push("🔒 ROI lock enabled.");

      if (!["success", "pending"].includes(txn.status))
        reasons.push(`🚫 Invalid status: ${txn.status}`);

      const endDate = new Date(txn.createdAt);
      endDate.setDate(
        endDate.getDate() + (txn.durationInDays || plan?.durationInDays || 0)
      );

      if (txn.status === "completed" || now >= endDate)
        reasons.push("🏁 Investment matured or completed.");

      if (!txn.nextPayoutAt) reasons.push("⚠️ nextPayoutAt is missing.");
      else if (txn.nextPayoutAt > now)
        reasons.push(
          `🕒 ROI not due yet (next at ${txn.nextPayoutAt.toISOString()})`
        );

      // ✅ If no skip reason, mark eligible
      if (reasons.length === 0) {
        eligibleInvestments.push(txn);
      } else {
        console.log(
          chalk.gray(
            `⏩ Skipping ${user?.email || "unknown user"} (${txn._id}):\n  - ${reasons.join(
              "\n  - "
            )}`
          )
        );
      }
    }

    // --- Process eligible investments ---
    if (eligibleInvestments.length === 0) {
      console.log(
        chalk.gray(
          "ℹ️ No eligible investments found for ROI processing after debug filtering."
        )
      );
      return;
    }

    console.log(
      chalk.yellowBright(
        `📊 Found ${eligibleInvestments.length} eligible investment(s) for ROI crediting.`
      )
    );

    // --- Process each eligible investment ---
    for (const txn of eligibleInvestments) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const plan: any = txn.plan;
        const user: any = txn.user;

        const intervalMs =
          plan.returnPeriod === "hour"
            ? 1000 * 60 * 60
            : plan.returnPeriod === "weekly"
            ? 1000 * 60 * 60 * 24 * 7
            : 1000 * 60 * 60 * 24; // daily default

        const timeDiff = now.getTime() - txn.nextPayoutAt.getTime();
        const missedCycles = Math.max(1, Math.floor(timeDiff / intervalMs));
        const roiValue = plan.roiValue || 0;

        const profitPerCycle =
          plan.roiUnit === "%" ? (txn.amount * roiValue) / 100 : roiValue;

        const totalProfit = profitPerCycle * missedCycles;

        // 👛 Credit user’s profit wallet
        await User.updateOne(
          { _id: user._id },
          { $inc: { profitWallet: totalProfit } },
          { session }
        );

        // 🧾 Record ROI transactions
        const roiRecords = Array.from({ length: missedCycles }, (_, i) => ({
          user: user._id,
          plan: plan._id,
          type: "roi",
          amount: profitPerCycle,
          status: "success",
          reference: `${Date.now()}_${i + 1}`,
        }));

        await Transaction.insertMany(roiRecords, { session });

        // Update investment record
        txn.roiEarned += totalProfit;
        txn.lastRoiAt = now;
        txn.nextPayoutAt = new Date(now.getTime() + intervalMs);

        const endDate = new Date(txn.createdAt);
        endDate.setDate(
          endDate.getDate() + (txn.durationInDays || plan.durationInDays || 0)
        );

        if (txn.nextPayoutAt >= endDate) {
          txn.status = "completed";

          const alreadyReturned = await Transaction.exists({
            user: user._id,
            plan: plan._id,
            type: "capitalReturn",
          });

          if (!alreadyReturned) {
            await User.updateOne(
              { _id: user._id },
              { $inc: { mainWallet: txn.amount } },
              { session }
            );

            await Transaction.create(
              [
                {
                  user: user._id,
                  plan: plan._id,
                  type: "capitalReturn",
                  amount: txn.amount,
                  status: "success",
                  reference: `${Date.now()}`,
                },
              ],
              { session }
            );

            console.log(chalk.greenBright(`💸 Capital returned to ${user.email}`));
          }
        }

        await txn.save({ session });
        await session.commitTransaction();
        session.endSession();

        console.log(
          chalk.greenBright(
            `✅ Credited $${totalProfit.toFixed(2)} ROI to ${
              user.email
            } (${missedCycles}x)`
          )
        );
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(
          chalk.redBright(
            `❌ Error processing ROI for ${txn._id}: ${
              err instanceof Error ? err.message : String(err)
            }`
          )
        );
      }
    }

    console.log(chalk.cyanBright("🏁 ROI Job completed successfully.\n"));
  } catch (err) {
    console.error(chalk.redBright("❌ ROI Cron Error:"), err);

    // Retry once if crash occurs
    if (!retrying) {
      retrying = true;
      setTimeout(async () => {
        console.log(chalk.yellowBright("🔁 Retrying ROI auto-credit..."));
        retrying = false;
        await processROICredit();
      }, 10000);
    }
  }
}

// Run every hour on the hour
cron.schedule("0 * * * *", processROICredit);

export default processROICredit;
