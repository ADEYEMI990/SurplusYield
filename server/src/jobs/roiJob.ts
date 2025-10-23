// server/src/jobs/roiJob.ts
import cron from "node-cron";
import mongoose from "mongoose";
import chalk from "chalk";
import { Transaction } from "../models/Transaction";
import User from "../models/User";
import connectDB from "../config/db";
import { sendNotification } from "../utils/notify";

console.log(
  chalk.greenBright("✅ ROI Cron Job Initialized (Verbose Debug Mode)")
);

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

    const eligibleInvestments: any[] = [];

    // --- Filtering ---
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

      if (txn.status === "completed")
        reasons.push("🏁 Investment already completed.");
      else if (txn.nextPayoutAt && txn.nextPayoutAt > endDate)
        reasons.push("🏁 Fully matured (past all payout cycles).");

      if (!txn.nextPayoutAt) reasons.push("⚠️ nextPayoutAt missing.");
      else if (txn.nextPayoutAt.getTime() - now.getTime() > 5000)
        // 5 sec grace
        reasons.push(
          `🕒 ROI not due yet (next payout at ${txn.nextPayoutAt.toISOString()})`
        );

      if (reasons.length === 0) {
        eligibleInvestments.push(txn);
      } else {
        console.log(
          chalk.gray(
            `⏩ Skipping ${user?.email || "unknown user"} (${
              txn._id
            }):\n  - ${reasons.join("\n  - ")}`
          )
        );
      }
    }

    if (eligibleInvestments.length === 0) {
      console.log(
        chalk.gray("ℹ️ No eligible investments found for ROI processing.")
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

        const totalPossibleCycles =
          plan.returnPeriod === "hour"
            ? plan.durationInDays * 24
            : plan.returnPeriod === "daily"
            ? plan.durationInDays
            : plan.returnPeriod === "weekly"
            ? Math.ceil(plan.durationInDays / 7)
            : 1;

        const roiValue = plan.roiValue || 0;
        const profitPerCycle =
          plan.roiUnit === "%" ? (txn.amount * roiValue) / 100 : roiValue;
        const timeDiff = now.getTime() - txn.nextPayoutAt.getTime();
        let rawCycles = Math.floor(timeDiff / intervalMs);

        // // ✅ If payout is exactly due or slightly after, count as 1 cycle
        // if (rawCycles < 1 && now >= txn.nextPayoutAt) rawCycles = 1;

        // // Automatically catch up all overdue cycles until now
        // const elapsedSinceStart = now.getTime() - txn.createdAt.getTime();
        // const totalElapsedCycles = Math.floor(elapsedSinceStart / intervalMs);
        // const expectedCyclesPaid = Math.floor(txn.roiEarned / profitPerCycle);
        // rawCycles = totalElapsedCycles - expectedCyclesPaid;

        // // Clamp within valid range
        // if (rawCycles < 0) rawCycles = 0;
        // if (rawCycles > totalPossibleCycles - expectedCyclesPaid)
        //   rawCycles = totalPossibleCycles - expectedCyclesPaid;

        // // ✅ Ensure missedCycles never exceeds totalPossibleCycles
        // const missedCycles = Math.min(rawCycles, totalPossibleCycles - expectedCyclesPaid);

        // ✅ Gracefully catch up missed ROI cycles even if cron ran late
        const elapsedSinceStart =
          now.getTime() - new Date(txn.createdAt).getTime();
        const totalElapsedCycles = Math.floor(elapsedSinceStart / intervalMs);
        const expectedCyclesPaid = Math.floor(txn.roiEarned / profitPerCycle);

        let missedCycles = totalElapsedCycles - expectedCyclesPaid;

        // Clamp missedCycles within valid range
        if (missedCycles < 0) missedCycles = 0;
        if (missedCycles > totalPossibleCycles - expectedCyclesPaid)
          missedCycles = totalPossibleCycles - expectedCyclesPaid;

        if (missedCycles > 0) {
          console.log(
            chalk.yellowBright(
              `⚠️ Catching up ${missedCycles} missed ROI cycle(s) for ${txn.user?.email}`
            )
          );
        }

        const expectedTotalROI = profitPerCycle * totalPossibleCycles;

        // Calculate ROI that will be earned now
        const totalProfit = profitPerCycle * missedCycles;

        // Calculate updated ROI after credit
        const updatedRoiEarned = txn.roiEarned + totalProfit;

        // ✅ Correct remaining ROI and progress
        const totalRemainingROI = Math.max(
          expectedTotalROI - updatedRoiEarned,
          0
        );
        const progressPercent = (
          (updatedRoiEarned / expectedTotalROI) *
          100
        ).toFixed(2);

        // --- Skip if fully paid ---
        if (txn.roiEarned >= expectedTotalROI) {
          console.log(
            chalk.gray(
              `⏩ Skipping ${
                user.email
              }: fully earned ROI ($${txn.roiEarned.toFixed(
                2
              )} / $${expectedTotalROI.toFixed(2)})`
            )
          );
          txn.status = "completed";
          await txn.save({ session });
          await session.commitTransaction();
          session.endSession();
          continue;
        }

        // const totalProfit = profitPerCycle * missedCycles;

        // 👛 Update profit wallet
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

        // 📬 Notify user
        await sendNotification(
          String(user._id),
          "ROI Credited",
          `You just earned $${totalProfit.toFixed(2)} in ROI.`,
          "investment"
        );

        // --- Update investment fields ---
        txn.roiEarned += totalProfit;
        // Calculate remaining cycles
        const remainingCycles = Math.max(
          totalPossibleCycles - (txn.roiEarned / profitPerCycle || 0),
          0
        ).toFixed(2);
        txn.lastRoiAt = now;
        txn.nextPayoutAt = new Date(now.getTime() + intervalMs);

        const endDate = new Date(txn.createdAt);
        endDate.setDate(
          endDate.getDate() + (txn.durationInDays || plan.durationInDays || 0)
        );

        // --- Detailed ROI log ---
        console.log(chalk.magentaBright("\n📘 ROI DETAILS"));
        console.log(chalk.white(`Investor: ${user.email}`));
        console.log(chalk.white(`Plan: ${plan.name || plan._id}`));
        console.log(
          chalk.white(`Investment Amount: $${txn.amount.toFixed(2)}`)
        );
        console.log(
          chalk.white(`ROI Value per cycle: $${profitPerCycle.toFixed(2)}`)
        );
        console.log(chalk.white(`Cycles Credited Now: ${missedCycles}`));
        console.log(
          chalk.white(`Total Possible Cycles: ${totalPossibleCycles}`)
        );
        console.log(chalk.white(`Remaining Cycles: ${remainingCycles}`));
        console.log(chalk.white(`missed Cycles: ${missedCycles}`));
        console.log(
          chalk.white(`ROI Earned So Far: $${txn.roiEarned.toFixed(2)}`)
        );
        console.log(
          chalk.white(`Expected Total ROI: $${expectedTotalROI.toFixed(2)}`)
        );
        console.log(
          chalk.white(`Remaining ROI: $${totalRemainingROI.toFixed(2)}`)
        );
        console.log(chalk.white(`Progress: ${progressPercent}%`));
        console.log(
          chalk.white(`Next Payout At: ${txn.nextPayoutAt.toISOString()}`)
        );
        console.log(
          chalk.white(`Investment Ends At: ${endDate.toISOString()}`)
        );
        console.log(
          chalk.gray("-------------------------------------------------------")
        );
        console.log({
          now,
          createdAt: txn.createdAt,
          nextPayoutAt: txn.nextPayoutAt,
          totalPossibleCycles,
          roiEarned: txn.roiEarned,
          profitPerCycle,
          expectedCyclesPaid: txn.roiEarned / profitPerCycle,
        });

        // --- Handle completion and capital return ---
        if (now >= endDate || updatedRoiEarned >= expectedTotalROI) {
          txn.status = "completed";
          txn.isCompleted = true;

          const expectedTotalRoi =
            plan.roiUnit === "%"
              ? (txn.amount * plan.roiValue * plan.durationInDays) / 100
              : plan.roiValue * plan.durationInDays;

          const roiCappedEarly = txn.roiEarned >= expectedTotalRoi * 0.99;
          const alreadyReturned = await Transaction.exists({
            user: user._id,
            plan: plan._id,
            type: "capitalReturn",
          });

          if (!alreadyReturned) {
            if (plan.capitalBack) {
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

              console.log(
                chalk.greenBright(
                  `💸 Capital Returned: $${txn.amount} | User: ${user.email}`
                )
              );

              console.log(
                chalk.gray(
                  `📅 Returned At: ${new Date().toISOString()} | ROI capped early: ${roiCappedEarly}`
                )
              );

              await sendNotification(
                String(user._id),
                "Capital Returned",
                `Your investment of $${txn.amount} has matured, and your capital has been returned.`,
                "investment"
              );
            } else {
              console.log(
                chalk.gray(
                  `🚫 No capital return — plan.capitalBack = false for ${user.email}`
                )
              );
            }
          } else {
            console.log(
              chalk.gray(
                `🔁 Capital already returned previously for ${user.email}`
              )
            );
          }
        }

        await txn.save({ session });
        await session.commitTransaction();
        session.endSession();

        console.log(
          chalk.greenBright(
            `✅ ROI Credited Successfully: $${totalProfit.toFixed(2)} | ${
              user.email
            }`
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

    console.log(chalk.cyanBright("\n🏁 ROI Job completed successfully.\n"));
  } catch (err) {
    console.error(chalk.redBright("❌ ROI Cron Error:"), err);
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
