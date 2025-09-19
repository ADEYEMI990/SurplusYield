// jobs/roiJob.ts
import cron from "node-cron";
import Investment from "../models/Investment";
import Wallet from "../models/Wallet";
import { Transaction } from "../models/Transaction";

async function processROI() {
  console.log("Running ROI distribution job...");

  const now = new Date();
  const investments = await Investment.find({ status: "active" });

  for (const inv of investments) {
    let shouldCredit = false;

    if (!inv.lastCredited) {
      shouldCredit = true;
    } else {
      const last = new Date(inv.lastCredited);
      if (inv.roiInterval === "daily" && now.getDate() !== last.getDate()) shouldCredit = true;
      if (inv.roiInterval === "weekly" && now.getTime() - last.getTime() >= 7 * 24 * 60 * 60 * 1000) shouldCredit = true;
      if (inv.roiInterval === "monthly" && now.getMonth() !== last.getMonth()) shouldCredit = true;
    }

    if (shouldCredit) {
      // ROI is calculated on current amount (compounded)
      const roiAmount = (inv.amount * inv.roiRate) / 100;

      // Update investment principal to include ROI
      inv.amount += roiAmount;

      // Update wallet
      const wallet = await Wallet.findOne({ user: inv.user });
      if (wallet) {
        wallet.balance += roiAmount;
        await wallet.save();
      }

      // Log transaction
      const tx = new Transaction({
        user: inv.user,
        type: "roi",
        amount: roiAmount,
        status: "success",
      });
      await tx.save();

      if (wallet) {
        wallet.transactions.push(tx.id);
        await wallet.save();
      }

      // Update investment
      inv.lastCredited = now;
      if (inv.endDate && now >= inv.endDate) {
        inv.status = "completed";
      }
      await inv.save();

      console.log(`Compounded ROI ${roiAmount} credited to user ${inv.user}`);
    }
  }
}

// Run every day at midnight
cron.schedule("0 0 * * *", processROI);

export default processROI;
