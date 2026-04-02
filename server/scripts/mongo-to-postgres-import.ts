// Run this script after exporting your MongoDB collections to JSON files.
// It reads each JSON file, transforms the data to match your Prisma/PostgreSQL schema, and inserts it using Prisma Client.


import { PrismaClient, User, Plan, Investment, Transaction, Admin, KycForm, KycSubmission, Wallet, WithdrawWallet, Notification, Reward, Setting, Spotlight, Template } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

type ModelName = 'user' | 'plan' | 'investment' | 'transaction' | 'admin' | 'kycForm' | 'kycSubmission' | 'wallet' | 'withdrawWallet' | 'notification' | 'reward' | 'setting' | 'spotlight' | 'template';

type TransformFn<T> = (doc: any) => T;

const modelMap = {
  user: prisma.user,
  plan: prisma.plan,
  investment: prisma.investment,
  transaction: prisma.transaction,
  admin: prisma.admin,
  kycForm: prisma.kycForm,
  kycSubmission: prisma.kycSubmission,
  wallet: prisma.wallet,
  withdrawWallet: prisma.withdrawWallet,
  notification: prisma.notification,
  reward: prisma.reward,
  setting: prisma.setting,
  spotlight: prisma.spotlight,
  template: prisma.template,
};

async function importCollection<T>(file: string, model: ModelName, transform: TransformFn<T>) {
  const data: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'));
  for (const doc of data) {
    try {
      // @ts-expect-error: dynamic model access
      await modelMap[model].create({ data: transform(doc) });
    } catch (e) {
      console.error(`Error importing ${model}:`, e, doc);
    }
  }
}


function transformUser(doc: any): User {
  return {
    id: doc._id || doc.id,
    name: doc.name,
    email: doc.email,
    password: doc.password,
    role: doc.role || 'user',
    status: doc.status || 'active',
    kycStatus: doc.kycStatus || 'pending',
    referralCode: doc.referralCode,
    referredBy: doc.referredBy,
    mainWallet: doc.mainWallet || '0',
    profitWallet: doc.profitWallet || '0',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformPlan(doc: any): Plan {
  return {
    id: doc._id || doc.id,
    icon: doc.icon,
    name: doc.name,
    badge: doc.badge,
    planType: doc.planType || 'range',
    minAmount: doc.minAmount,
    maxAmount: doc.maxAmount,
    amount: doc.amount,
    roiType: doc.roiType || 'range',
    roiValue: doc.roiValue,
    minRoi: doc.minRoi,
    maxRoi: doc.maxRoi,
    roiUnit: doc.roiUnit || '%',
    returnPeriod: doc.returnPeriod || 'daily',
    returnType: doc.returnType || 'period',
    numOfPeriods: doc.numOfPeriods,
    holidays: doc.holidays || [],
    capitalBack: doc.capitalBack !== undefined ? doc.capitalBack : true,
    featured: doc.featured !== undefined ? doc.featured : true,
    canCancel: doc.canCancel !== undefined ? doc.canCancel : false,
    trending: doc.trending !== undefined ? doc.trending : false,
    status: doc.status || 'active',
    durationInDays: doc.durationInDays,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformInvestment(doc: any): Investment {
  return {
    id: doc._id || doc.id,
    userId: doc.userId,
    planId: doc.planId,
    amount: doc.amount,
    initialAmount: doc.initialAmount,
    roiRate: doc.roiRate,
    roiInterval: doc.roiInterval || 'daily',
    roiType: doc.roiType || 'flat',
    startDate: doc.startDate ? new Date(doc.startDate) : new Date(),
    endDate: doc.endDate ? new Date(doc.endDate) : null,
    lastCredited: doc.lastCredited ? new Date(doc.lastCredited) : null,
    status: doc.status || 'active',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformTransaction(doc: any): Transaction {
  return {
    id: doc._id || doc.id,
    userId: doc.userId,
    planId: doc.planId,
    type: doc.type,
    amount: doc.amount,
    status: doc.status || 'pending',
    reference: doc.reference,
    bonusType: doc.bonusType,
    receipt: doc.receipt,
    currency: doc.currency || 'USD',
    roiEarned: doc.roiEarned || '0',
    nextPayoutAt: doc.nextPayoutAt ? new Date(doc.nextPayoutAt) : null,
    lastRoiAt: doc.lastRoiAt ? new Date(doc.lastRoiAt) : null,
    roiLock: doc.roiLock !== undefined ? doc.roiLock : false,
    roiLockUntil: doc.roiLockUntil ? new Date(doc.roiLockUntil) : null,
    durationInDays: doc.durationInDays,
    isCompleted: doc.isCompleted !== undefined ? doc.isCompleted : false,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformAdmin(doc: any): Admin {
  return {
    id: doc._id || doc.id,
    username: doc.username,
    email: doc.email,
    password: doc.password,
    role: doc.role || 'admin',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformKycForm(doc: any): KycForm {
  return {
    id: doc._id || doc.id,
    name: doc.name,
    fields: doc.fields || [],
    status: doc.status || 'active',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformKycSubmission(doc: any): KycSubmission {
  return {
    id: doc._id || doc.id,
    userId: doc.userId,
    formId: doc.formId,
    fields: doc.fields || [],
    status: doc.status || 'pending',
    reason: doc.reason,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformWallet(doc: any): Wallet {
  return {
    id: doc._id || doc.id,
    address: doc.address,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformWithdrawWallet(doc: any): WithdrawWallet {
  return {
    id: doc._id || doc.id,
    userId: doc.userId,
    btcAddress: doc.btcAddress,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformNotification(doc: any): Notification {
  return {
    id: doc._id || doc.id,
    userId: doc.userId,
    title: doc.title,
    message: doc.message,
    type: doc.type || 'system',
    read: doc.read !== undefined ? doc.read : false,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformReward(doc: any): Reward {
  return {
    id: doc._id || doc.id,
    userId: doc.userId,
    type: doc.type,
    points: doc.points,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformSetting(doc: any): Setting {
  return {
    id: doc._id || doc.id,
    key: doc.key,
    value: doc.value,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformSpotlight(doc: any): Spotlight {
  return {
    id: doc._id || doc.id,
    type: doc.type,
    title: doc.title,
    subtitle: doc.subtitle,
    date: doc.date ? new Date(doc.date) : null,
    status: doc.status,
    net: doc.net,
    total: doc.total,
    amount: doc.amount,
    meta: doc.meta,
    order: doc.order !== undefined ? doc.order : 0,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

function transformTemplate(doc: any): Template {
  return {
    id: doc._id || doc.id,
    type: doc.type,
    name: doc.name,
    subject: doc.subject,
    content: doc.content,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}


async function main() {
  await importCollection('users.json', 'user', transformUser);
  await importCollection('plans.json', 'plan', transformPlan);
  await importCollection('investments.json', 'investment', transformInvestment);
  await importCollection('transactions.json', 'transaction', transformTransaction);
  await importCollection('admins.json', 'admin', transformAdmin);
  await importCollection('kycforms.json', 'kycForm', transformKycForm);
  await importCollection('kycsubmissions.json', 'kycSubmission', transformKycSubmission);
  await importCollection('wallets.json', 'wallet', transformWallet);
  await importCollection('withdrawwallets.json', 'withdrawWallet', transformWithdrawWallet);
  await importCollection('notifications.json', 'notification', transformNotification);
  await importCollection('rewards.json', 'reward', transformReward);
  await importCollection('settings.json', 'setting', transformSetting);
  await importCollection('spotlights.json', 'spotlight', transformSpotlight);
  await importCollection('templates.json', 'template', transformTemplate);
}

main().then(() => {
  console.log('Import complete');
  prisma.$disconnect();
});
