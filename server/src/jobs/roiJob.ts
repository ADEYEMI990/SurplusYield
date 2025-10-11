// server/src/jobs/roiJob.ts
import cron from "node-cron";
import mongoose, { ClientSession } from "mongoose";
import chalk from "chalk";
import { Transaction } from "../models/Transaction";
import User from "../models/User";
import connectDB from "../config/db";

console.log(chalk.greenBright("✅ ROI Cron Job Initialized"));

let retrying = false;

// === MAIN ROI CREDIT FUNCTION ===
async function processROICredit() {
  const now = new Date();
  console.log(
    chalk.cyanBright(`\n🔁 ROI Credit Check Triggered — ${now.toISOString()}`)
  );

  try {
    // --- Ensure DB connected ---
    if (mongoose.connection.readyState !== 1) {
      console.log(chalk.yellow("⚠️  DB disconnected. Attempting reconnect..."));
      await connectDB();
    }

    // --- Find all active investment transactions ---
    const transactions = await Transaction.find({
      type: "investment",
      status: "success",
    });

    if (!transactions.length) {
      console.log(chalk.gray("ℹ️  No active investments found."));
      return;
    }

    console.log(
      chalk.greenBright(
        `📊 Found ${transactions.length} active investment(s) to process.`
      )
    );

    let totalCredited = 0;
    let totalUsersCredited = 0;

    for (const txn of transactions) {
      if (txn.roiLock && txn.roiLockUntil && txn.roiLockUntil > now) {
        console.log(
          chalk.yellow(`🔒 Skipping locked txn ${txn._id} (ROI lock active)`)
        );
        continue;
      }

      const session: ClientSession = await mongoose.startSession();
      session.startTransaction();

      try {
        const lockedTxn = await Transaction.findOneAndUpdate(
          {
            _id: txn._id,
            $or: [{ roiLock: { $ne: true } }, { roiLockUntil: { $lt: now } }],
          },
          {
            $set: {
              roiLock: true,
              roiLockUntil: new Date(now.getTime() + 5 * 60 * 1000),
            },
          },
          { session, new: true }
        );

        if (!lockedTxn) {
          await session.abortTransaction();
          session.endSession();
          continue;
        }

        await lockedTxn.populate("plan");
        await lockedTxn.populate("user");
        const plan: any = lockedTxn.plan;
        const user: any = lockedTxn.user;

        if (!plan || !user) {
          console.log(
            chalk.red(
              `⚠️  Missing plan or user for txn ${lockedTxn._id}. Skipping.`
            )
          );
          await session.abortTransaction();
          session.endSession();
          continue;
        }

        console.log(
          chalk.blueBright(
            `\n🔍 ${user.email} — Plan: ${plan.name} | ROI: ${plan.roiValue}${plan.roiUnit} every ${plan.returnPeriod} | Amount: $${lockedTxn.amount}`
          )
        );

        // --- Skip if credited recently ---
        if (
          lockedTxn.lastRoiAt &&
          now.getTime() - lockedTxn.lastRoiAt.getTime() < 1000 * 60 * 20
        ) {
          console.log(
            chalk.gray(`⏳ Skipping ${user.email} — credited recently.`)
          );
          await Transaction.updateOne(
            { _id: lockedTxn._id },
            { $set: { roiLock: false, roiLockUntil: null } },
            { session }
          );
          await session.commitTransaction();
          session.endSession();
          continue;
        }

        // --- Determine payout interval ---
        let intervalMs = 1000 * 60 * 60 * 24; // default daily
        switch (plan.returnPeriod) {
          case "hour":
            intervalMs = 1000 * 60 * 60;
            break;
          case "weekly":
            intervalMs = 1000 * 60 * 60 * 24 * 7;
            break;
        }

        const nextPayoutAt = lockedTxn.nextPayoutAt ?? lockedTxn.createdAt;
        const timeSinceNext = now.getTime() - nextPayoutAt.getTime();
        const missedCycles = Math.floor(timeSinceNext / intervalMs);

        if (missedCycles <= 0) {
          const nextIn = Math.max(0, intervalMs - timeSinceNext);
          const hrs = Math.floor(nextIn / (1000 * 60 * 60));
          const mins = Math.floor((nextIn % (1000 * 60 * 60)) / (1000 * 60));

          console.log(
            chalk.magentaBright(
              `🕒 ${
                user.email
              } next ROI due in ${hrs}h ${mins}m (${nextPayoutAt.toISOString()})`
            )
          );

          lockedTxn.roiLock = false;
          lockedTxn.roiLockUntil = undefined;
          await lockedTxn.save({ session });
          await session.commitTransaction();
          session.endSession();
          continue;
        }

        // --- Calculate profit ---
        const roiValue = plan.roiValue || 0;
        const profitPerCycle =
          plan.roiUnit === "%" ? (lockedTxn.amount * roiValue) / 100 : roiValue;
        const totalProfit = profitPerCycle * missedCycles;

        console.log(
          chalk.yellowBright(
            `⏰ Missed ${missedCycles} cycle(s) — Each: $${profitPerCycle.toFixed(
              2
            )}, Total: $${totalProfit.toFixed(2)}`
          )
        );

        // --- Update user balances ---
        await User.updateOne(
          { _id: user._id },
          {
            $inc: {
              profitWallet: totalProfit,
              mainWallet: totalProfit,
            },
          },
          { session }
        );

        // --- Log ROI transactions ---
        const roiTxns = Array.from({ length: missedCycles }, (_, i) => ({
          user: user._id,
          type: "roi",
          plan: plan._id,
          amount: profitPerCycle,
          status: "success",
          currency: "USD",
          reference: `roi_${lockedTxn._id}_${Date.now()}_${i + 1}`,
        }));

        await Transaction.insertMany(roiTxns, { session });

        // --- Update main investment ---
        lockedTxn.roiEarned = (lockedTxn.roiEarned || 0) + totalProfit;
        lockedTxn.lastRoiAt = now;
        lockedTxn.nextPayoutAt = new Date(
          nextPayoutAt.getTime() + missedCycles * intervalMs
        );
        lockedTxn.roiLock = false;
        lockedTxn.roiLockUntil = undefined;

        // --- Check completion ---
        const endDate = new Date(lockedTxn.createdAt);
        endDate.setDate(endDate.getDate() + (plan.durationInDays || 0));
        if (now >= endDate) {
          lockedTxn.status = "success";

          // === Return user's invested capital ===
          const capitalBackAmount = lockedTxn.amount;

          console.log(
            `🏁 Investment completed for ${user.email} — Returning capital $${capitalBackAmount}`
          );

          // ✅ Update user's main wallet with capital back
          await User.updateOne(
            { _id: user._id },
            { $inc: { mainWallet: capitalBackAmount } },
            { session }
          );

          // ✅ Log capital return transaction
          await Transaction.create(
            [
              {
                user: user._id,
                plan: plan._id,
                type: "capitalReturn",
                amount: capitalBackAmount,
                status: "success",
                currency: "USD",
                reference: `capital_return_${lockedTxn._id}_${Date.now()}`,
              },
            ],
            { session }
          );

          console.log(
            chalk.greenBright(
              `💸 Capital $${capitalBackAmount} returned to ${user.email}'s main wallet`
            )
          );
        }

        await lockedTxn.save({ session });
        await session.commitTransaction();
        session.endSession();

        totalCredited += totalProfit;
        totalUsersCredited++;

        console.log(
          chalk.greenBright(
            `💰 Credited ${missedCycles} ROI cycle(s) totaling $${totalProfit.toFixed(
              2
            )} to ${user.email}`
          )
        );
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(
          chalk.redBright(`❌ Error processing txn ${txn._id}:`),
          err
        );
      }
    }

    console.log(chalk.whiteBright("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(
      chalk.greenBright(
        `✅ ROI Cycle Complete: ${transactions.length} investment(s) processed`
      )
    );
    console.log(
      chalk.cyanBright(
        `📈 Total Users Credited: ${totalUsersCredited} | Total Amount: $${totalCredited.toFixed(
          2
        )}`
      )
    );
    console.log(chalk.whiteBright("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
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

// --- Schedule hourly (since ROI is hourly) ---
cron.schedule("0 * * * *", processROICredit);
