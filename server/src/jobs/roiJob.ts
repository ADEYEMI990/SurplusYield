// server/src/jobs/roiJob.ts
import cron from "node-cron";
import chalk from "chalk";
import prisma from "../lib/prisma";
import { sendNotification } from "../utils/notify";
import { getReference } from "../utils/getReference";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";

console.log(
  chalk.greenBright("✅ ROI Cron Job Initialized (Verbose Debug Mode)")
);

let retrying = false;

// async function processROICredit() {
//   const now = new Date();
//   console.log(
//     chalk.cyanBright(`\n🔁 ROI Credit Check Triggered — ${now.toISOString()}`)
//   );

//   try {
//     // Fetch investments due for ROI
//     const allInvestments = await prisma.transaction.findMany({
//       where: { type: "investment" },
//       include: {
//         plan: true,
//         user: true,
//       },
//     });
//     if (allInvestments.length === 0) {
//       console.log(chalk.gray("ℹ️ No investments found at all."));
//       return;
//     }

//     console.log(
//       chalk.blueBright(`📦 Found ${allInvestments.length} total investment(s).`)
//     );

//     const eligibleInvestments: any[] = [];

//     // --- Filtering ---
//     for (const txn of allInvestments) {
//       const plan: any = txn.plan;
//       const user: any = txn.user;
//       const reasons: string[] = [];

//       if (!plan || !user) reasons.push("❌ Missing plan or user reference.");
//       if (txn.roiLock) reasons.push("🔒 ROI lock enabled.");
//       if (!["success", "pending"].includes(txn.status))
//         reasons.push(`🚫 Invalid status: ${txn.status}`);

//       const endDate = new Date(txn.createdAt);
//       endDate.setDate(
//         endDate.getDate() + (txn.durationInDays || plan?.durationInDays || 0)
//       );

//       if (txn.status === "completed")
//         reasons.push("🏁 Investment already completed.");
//       else {
//         // Convert Prisma Decimals to numbers for arithmetic
//         const roiValueNum = Number(plan.roiValue) || 0;
//         const txnAmountNum = Number(txn.amount) || 0;
//         const txnRoiEarnedNum = Number(txn.roiEarned) || 0;
//         const roiValue =
//           plan.roiUnit === "%"
//             ? (txnAmountNum * roiValueNum) / 100
//             : roiValueNum;
//         const totalPossibleCycles =
//           plan.returnPeriod === "hour"
//             ? plan.durationInDays * 24
//             : plan.returnPeriod === "daily"
//             ? plan.durationInDays
//             : plan.returnPeriod === "weekly"
//             ? Math.ceil(plan.durationInDays / 7)
//             : 1;

//         // Avoid division by zero
//         const expectedCyclesPaid = roiValue > 0 ? Math.floor(txnRoiEarnedNum / roiValue) : 0;

//         if (expectedCyclesPaid >= totalPossibleCycles) {
//           reasons.push(
//             "🏁 Fully matured and fully credited (past all payout cycles)."
//           );
//         }
//       }

//       if (!txn.nextPayoutAt) reasons.push("⚠️ nextPayoutAt missing.");
//       else if (txn.nextPayoutAt.getTime() - now.getTime() > 5000)
//         // 5 sec grace
//         reasons.push(
//           `🕒 ROI not due yet (next payout at ${txn.nextPayoutAt.toISOString()})`
//         );


//       if (reasons.length === 0) {
//         eligibleInvestments.push(txn);
//       } else {
//         console.log(
//           chalk.gray(
//             `⏩ Skipping ${user?.email || "unknown user"} (${txn.id}):\n  - ${reasons.join("\n  - ")}`
//           )
//         );
//       }
//     }

//     if (eligibleInvestments.length === 0) {
//       console.log(
//         chalk.gray("ℹ️ No eligible investments found for ROI processing.")
//       );
//       return;
//     }

//     console.log(
//       chalk.yellowBright(
//         `📊 Found ${eligibleInvestments.length} eligible investment(s) for ROI crediting.`
//       )
//     );

//     // --- Process each eligible investment ---
//     for (const txn of eligibleInvestments) {
//       const plan: any = txn.plan;
//       const user: any = txn.user;
//       const intervalMs =
//         plan.returnPeriod === "hour"
//           ? 1000 * 60 * 60
//           : plan.returnPeriod === "weekly"
//           ? 1000 * 60 * 60 * 24 * 7
//           : 1000 * 60 * 60 * 24; // daily default
//       const totalPossibleCycles =
//         plan.returnPeriod === "hour"
//           ? plan.durationInDays * 24
//           : plan.returnPeriod === "daily"
//           ? plan.durationInDays
//           : plan.returnPeriod === "weekly"
//           ? Math.ceil(plan.durationInDays / 7)
//           : 1;
//       const txnAmountNum = Number(txn.amount);
//       const roiValueNum = Number(plan.roiValue);
//       const profitPerCycle = plan.roiUnit === "%" ? (txnAmountNum * roiValueNum) / 100 : roiValueNum  ;
//       const elapsedSinceStart = now.getTime() - new Date(txn.createdAt).getTime();
//       const totalElapsedCycles = Math.floor(elapsedSinceStart / intervalMs);
//       const expectedCyclesPaid = Math.floor(txn.roiEarned / profitPerCycle);
//       let missedCycles = totalElapsedCycles - expectedCyclesPaid;
//       if (missedCycles < 0) missedCycles = 0;
//       if (missedCycles > totalPossibleCycles - expectedCyclesPaid)
//         missedCycles = totalPossibleCycles - expectedCyclesPaid;
//       const endDate = new Date(txn.createdAt);
//       endDate.setDate(endDate.getDate() + plan.durationInDays);
//       const expectedTotalROI = profitPerCycle * totalPossibleCycles;
//       if (now > endDate && txn.roiEarned < expectedTotalROI) {
//         console.log(
//           chalk.yellowBright(
//             `⚠️ Detected late cron: Finalizing last ROI + capital for ${txn.user?.email}`
//           )
//         );
//         missedCycles = Math.max(totalPossibleCycles - expectedCyclesPaid, 1);
//       }
//       if (missedCycles > 0) {
//         console.log(
//           chalk.yellowBright(
//             `⚠️ Catching up ${missedCycles} missed ROI cycle(s) for ${txn.user?.email}`
//           )
//         );
//       }
//       const totalProfit = profitPerCycle * missedCycles;
//       const updatedRoiEarned = txn.roiEarned + totalProfit;
//       const totalRemainingROI = Math.max(expectedTotalROI - updatedRoiEarned, 0);
//       const progressPercent = ((updatedRoiEarned / expectedTotalROI) * 100).toFixed(2);
//       if (txn.roiEarned >= expectedTotalROI) {
//         console.log(
//           chalk.gray(
//             `⏩ Skipping ${user.email}: fully earned ROI ($${txn.roiEarned.toFixed(2)} / $${expectedTotalROI.toFixed(2)})`
//           )
//         );
//         await prisma.transaction.update({ where: { id: txn.id }, data: { status: "completed" } });
//         continue;
//       }
//       // Prisma transaction for atomic updates
//       await prisma.$transaction(async (tx) => {
//         // 1️⃣ Create ROI transaction records (ledger entries)
//         if (missedCycles > 0) {
//           const roiRecords = Array.from({ length: missedCycles }, (_, i) => ({
//             userId: user.id,
//             planId: plan.id,
//             type: "roi",
//             amount: profitPerCycle,
//             status: "success",
//             reference: `${Date.now()}_${i + 1}`,
//           }));

//           await tx.transaction.createMany({
//             data: roiRecords,
//           });
//         }

//         // 2️⃣ Update investment progress (NOT wallet)
//         await tx.transaction.update({
//           where: { id: txn.id },
//           data: {
//             roiEarned: updatedRoiEarned,
//             lastRoiAt: now,
//             nextPayoutAt: new Date(now.getTime() + intervalMs),
//             status:
//               now >= endDate || updatedRoiEarned >= expectedTotalROI
//                 ? "completed"
//                 : txn.status,
//             isCompleted:
//               now >= endDate || updatedRoiEarned >= expectedTotalROI
//                 ? true
//                 : txn.isCompleted,
//           },
//         });

//         // 3️⃣ Handle capital return (ledger only)
//         if (now >= endDate || updatedRoiEarned >= expectedTotalROI) {
//           const alreadyReturned = await tx.transaction.findFirst({
//             where: {
//               userId: user.id,
//               planId: plan.id,
//               type: "capitalReturn",
//             },
//           });

//           if (!alreadyReturned && plan.capitalBack) {
//             await tx.transaction.create({
//               data: {
//                 userId: user.id,
//                 planId: plan.id,
//                 type: "capitalReturn",
//                 amount: txn.amount,
//                 status: "success",
//                 reference: `${Date.now()}`,
//               },
//             });


//             await sendNotification(
//               String(user.id),
//               "Capital Returned",
//               `Your investment of $${txn.amount} has matured, and your capital has been returned.`,
//               "investment"
//             );
//           }
//         }
//       });
//       await sendNotification(
//         String(user.id),
//         "ROI Credited",
//         `You just earned $${totalProfit.toFixed(2)} in ROI.`,
//         "investment"
//       );
//       // --- Detailed ROI log ---
//       const remainingCycles = Math.max(
//         totalPossibleCycles - (updatedRoiEarned / profitPerCycle || 0),
//         0
//       ).toFixed(2);
//       console.log(chalk.magentaBright("\n📘 ROI DETAILS"));
//       console.log(chalk.white(`Investor: ${user.email}`));
//       console.log(chalk.white(`Plan: ${plan.name || plan.id}`));
//       console.log(chalk.white(`Investment Amount: $${txn.amount.toFixed(2)}`));
//       console.log(chalk.white(`ROI Value per cycle: $${profitPerCycle.toFixed(2)}`));
//       console.log(chalk.white(`Cycles Credited Now: ${missedCycles}`));
//       console.log(chalk.white(`Total Possible Cycles: ${totalPossibleCycles}`));
//       console.log(chalk.white(`Remaining Cycles: ${remainingCycles}`));
//       console.log(chalk.white(`missed Cycles: ${missedCycles}`));
//       console.log(chalk.white(`ROI Earned So Far: $${updatedRoiEarned.toFixed(2)}`));
//       console.log(chalk.white(`Expected Total ROI: $${expectedTotalROI.toFixed(2)}`));
//       console.log(chalk.white(`Remaining ROI: $${totalRemainingROI.toFixed(2)}`));
//       console.log(chalk.white(`Progress: ${progressPercent}%`));
//       const nextPayoutAt = new Date(now.getTime() + intervalMs);
//       console.log(chalk.white(`Next Payout At: ${nextPayoutAt.toISOString()}`));
//       console.log(chalk.white(`Investment Ends At: ${endDate.toISOString()}`));
//       console.log(chalk.gray("-------------------------------------------------------"));
//       console.log({
//         now,
//         createdAt: txn.createdAt,
//         nextPayoutAt,
//         totalPossibleCycles,
//         roiEarned: updatedRoiEarned,
//         profitPerCycle,
//         expectedCyclesPaid: updatedRoiEarned / profitPerCycle,
//       });
//       console.log(
//         chalk.greenBright(
//           `✅ ROI Credited Successfully: $${totalProfit.toFixed(2)} | ${user.email}`
//         )
//       );
//     }

//     console.log(chalk.cyanBright("\n🏁 ROI Job completed successfully.\n"));
//   } catch (err) {
//     console.error(chalk.redBright("❌ ROI Cron Error:"), err);
//     if (!retrying) {
//       retrying = true;
//       setTimeout(async () => {
//         console.log(chalk.yellowBright("🔁 Retrying ROI auto-credit..."));
//         retrying = false;
//         await processROICredit();
//       }, 10000);
//     }
//   }
// }


// // Run every hour on the hour
// cron.schedule("0 * * * *", processROICredit);

// export default processROICredit;


async function processROICredit() {
  const now = new Date();
  console.log(`\n🔁 Institutional ROI Engine — ${now.toISOString()}`);

  try {
    /**
     * 1️⃣ Only active investments
     */
    const investments = await prisma.investment.findMany({
      where: { status: "active" },
      include: { plan: true, user: true },
    });

    for (const investment of investments) {
      const { plan, user } = investment;
      if (!plan || plan.status !== "active") continue;

      const amount = Number(investment.amount);
      const roiRate = Number(investment.roiRate);

      /**
       * 2️⃣ Determine interval
       */
      const intervalMs =
        plan.returnPeriod === "hour"
          ? 60 * 60 * 1000
          : plan.returnPeriod === "weekly"
          ? 7 * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;

      /**
       * 3️⃣ Determine MAX CYCLES (Hard Cap)
       */
      let maxCycles = 0;

      if (plan.returnType === "period") {
        if (plan.numOfPeriods) {
          maxCycles = plan.numOfPeriods;
        } else if (plan.durationInDays) {
          if (plan.returnPeriod === "hour")
            maxCycles = plan.durationInDays * 24;
          else if (plan.returnPeriod === "weekly")
            maxCycles = Math.ceil(plan.durationInDays / 7);
          else maxCycles = plan.durationInDays;
        }
      } else {
        // lifetime plan (no cap)
        maxCycles = Infinity;
      }

      /**
       * 4️⃣ Count already credited cycles from ledger
       */
      const creditedCount = await prisma.transaction.count({
        where: {
          userId: user.id,
          planId: plan.id,
          type: "roi",
          status: "success",
        },
      });

      // Debug: log cycles
      console.log(chalk.blueBright(`💰 Investment ID: ${investment.id}`));
      console.log(`Total cycles already credited: ${creditedCount}`);
      console.log(`Max cycles allowed: ${maxCycles}`);

      if (creditedCount >= maxCycles) {
        // Fully matured
        await prisma.investment.update({
          where: { id: investment.id },
          data: { status: "completed" },
        });
        continue;
      }

      /**
       * 5️⃣ Determine cycles elapsed since start
       */
      const startTime = investment.startDate.getTime();
      const elapsedMs = now.getTime() - startTime;

      const totalElapsedCycles = Math.floor(elapsedMs / intervalMs);

      let cyclesToCredit = totalElapsedCycles - creditedCount;

      if (cyclesToCredit <= 0) {
        console.log(`No cycles to credit this run.`);
        continue;
      }

      /**
       * 6️⃣ Enforce HARD CAP
       */
      if (creditedCount + cyclesToCredit > maxCycles) {
        cyclesToCredit = maxCycles - creditedCount;
      }

      if (cyclesToCredit <= 0) continue;

      /**
       * 7️⃣ Calculate profit
       */
      const profitPerCycle =
        plan.roiUnit === "%"
          ? (amount * roiRate) / 100
          : roiRate;

      if (profitPerCycle <= 0) continue;

      const totalProfit = profitPerCycle * cyclesToCredit;

      // Debug: log before transaction
      console.log(`Cycles to credit this run: ${cyclesToCredit}`);
      console.log(`Profit per cycle: ${profitPerCycle.toFixed(2)}`);
      console.log(`Total profit this run: ${totalProfit.toFixed(2)}`);
      console.log(`Cycles remaining after this run: ${maxCycles - creditedCount - cyclesToCredit}`);

      /**
       * 8️⃣ Atomic Ledger Write
       */
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Double-check count inside transaction (idempotency)
        const freshCount = await tx.transaction.count({
          where: {
            userId: user.id,
            planId: plan.id,
            type: "roi",
            status: "success",
          },
        });

        if (freshCount >= maxCycles) return;

        console.log(`🔹 Fresh count inside transaction: ${freshCount}`);

        const allowedCycles = Math.min(
          cyclesToCredit,
          maxCycles - freshCount
        );

        if (allowedCycles <= 0) return;

        const totalNewProfit = profitPerCycle * allowedCycles;

        console.log(`🔹 Allowed cycles in this transaction: ${allowedCycles}`);
        console.log(`🔹 Total new profit in this transaction: ${totalNewProfit.toFixed(2)}`);

        await tx.transaction.createMany({
          data: Array.from({ length: allowedCycles }, () => ({
            userId: user.id,
            planId: plan.id,
            investmentId: investment.id,
            type: "roi",
            amount: profitPerCycle,
            status: "success",
            reference: `ROI-${uuidv4()}`,
            currency: "USD",
          })),
        });

        await tx.investment.update({
          where: { id: investment.id },
          data: {
            roiEarned: {increment: totalNewProfit.toString()},
            lastCredited: now,
          },
        });

        /**
         * Capital return only once
         */
        if (freshCount + allowedCycles >= maxCycles && plan.capitalBack) {
          const alreadyReturned = await tx.transaction.findFirst({
            where: {
              userId: user.id,
              planId: plan.id,
              type: "capitalReturn",
            },
          });

          if (!alreadyReturned) {
            await tx.transaction.create({
              data: {
                userId: user.id,
                planId: plan.id,
                type: "capitalReturn",
                amount: amount,
                status: "success",
                reference: getReference(),
                currency: "USD",
              },
            });
          }

          await tx.investment.update({
            where: { id: investment.id },
            data: { status: "completed" },
          });
        }
      });

      // Debug: log updated ROI
      const updatedInvestment = await prisma.investment.findUnique({
        where: { id: investment.id },
      });

      console.log(`✅ Updated ROI earned: ${updatedInvestment?.roiEarned}`);
      console.log(`🔹 Total cycles credited so far: ${creditedCount + cyclesToCredit}`);
      console.log(`🔹 Cycles remaining: ${Math.max(maxCycles - (creditedCount + cyclesToCredit), 0)}`);

      await sendNotification(
        String(user.id),
        "ROI Credited",
        `You earned $${totalProfit.toFixed(2)} from your investment.`,
        "investment"
      );

      console.log(
        `✅ ${user.email} credited ${cyclesToCredit} cycle(s)`
      );
    }

    console.log("🏁 Institutional ROI Engine Completed.\n");
  } catch (error) {
    console.error("❌ ROI Engine Error:", error);
  }
}

cron.schedule("0 * * * *", processROICredit);

export default processROICredit;