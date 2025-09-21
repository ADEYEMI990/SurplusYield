// jobs/roiJob.ts
import cron from "node-cron";
import Investment from "../models/Investment";
import Wallet from "../models/Wallet";
import { Transaction } from "../models/Transaction";
import { Plan } from "../models/Plan";

async function processROI() {
  console.log("Running ROI distribution job...");

  const now = new Date();
  const investments = await Investment.find({ status: "active" }).populate("plan");

  for (const inv of investments) {
    const plan: any = inv.plan;
    let shouldCredit = false;

    if (!inv.lastCredited) {
      shouldCredit = true;
    } else {
      const last = new Date(inv.lastCredited);
      if (plan.roiInterval === "daily" && now.getDate() !== last.getDate()) shouldCredit = true;
      if (plan.roiInterval === "weekly" && now.getTime() - last.getTime() >= 7 * 24 * 60 * 60 * 1000) shouldCredit = true;
      if (plan.roiInterval === "monthly" && now.getMonth() !== last.getMonth()) shouldCredit = true;
    }

    if (shouldCredit) {
      let roiAmount = 0;

      if (plan.roiType === "flat") {
        roiAmount = (inv.initialAmount * plan.roiRate) / 100; // always original
      } else {
        roiAmount = (inv.amount * plan.roiRate) / 100; // compounding
        inv.amount += roiAmount; // grow principal
      }

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

      console.log(`${plan.roiType} ROI ${roiAmount} credited to user ${inv.user}`);
    }
  }
}

// Run daily at midnight
cron.schedule("0 0 * * *", processROI);

export default processROI;
