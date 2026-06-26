import express from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import {
  createOrUpdateStripeSubscription,
  cancelStripeSubscription,
  getSubscriptionByStripeId,
} from "./db";

export async function handleStripeWebhook(req: express.Request, res: express.Response) {
  const sig = req.headers["stripe-signature"];
  if (!sig || !ENV.stripeSecretKey || !ENV.stripeWebhookSecret) {
    console.error("[Stripe Webhook] Missing signature or Stripe is not configured.");
    return res.status(400).send("Webhook missing signature or Stripe configuration error.");
  }

  const stripe = new Stripe(ENV.stripeSecretKey, {
    apiVersion: "2023-10-16" as any,
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error verifying webhook signature: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = Number(session.metadata?.userId);
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (!userId || !stripeSubscriptionId) {
          console.warn("[Stripe Webhook] Checkout session missing userId or subscriptionId.", session.id);
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const plan = subscription.items.data[0].plan.id === ENV.stripePriceAnnual ? "annual" : "monthly";
        const expiresAt = new Date((subscription as any).current_period_end * 1000);
        const startedAt = new Date((subscription as any).created * 1000);

        await createOrUpdateStripeSubscription(
          userId,
          stripeCustomerId,
          stripeSubscriptionId,
          plan,
          "active",
          expiresAt,
          startedAt
        );
        console.log(`[Stripe Webhook] Activated subscription ${stripeSubscriptionId} for user ${userId}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubscriptionId = (invoice as any).subscription as string;

        if (!stripeSubscriptionId) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const plan = subscription.items.data[0].plan.id === ENV.stripePriceAnnual ? "annual" : "monthly";
        const expiresAt = new Date((subscription as any).current_period_end * 1000);
        const startedAt = new Date((subscription as any).created * 1000);

        const dbSub = await getSubscriptionByStripeId(stripeSubscriptionId);
        if (dbSub) {
          await createOrUpdateStripeSubscription(
            dbSub.userId,
            dbSub.stripeCustomerId ?? "",
            stripeSubscriptionId,
            plan,
            "active",
            expiresAt,
            startedAt
          );
          console.log(`[Stripe Webhook] Renewed subscription ${stripeSubscriptionId} for user ${dbSub.userId}`);
        } else {
          console.warn(`[Stripe Webhook] Subscription ${stripeSubscriptionId} not found in database for renewal.`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await cancelStripeSubscription(subscription.id);
        console.log(`[Stripe Webhook] Terminated subscription ${subscription.id}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;
        const expiresAt = new Date((subscription as any).current_period_end * 1000);
        
        let status: "active" | "cancelled" | "expired" | "past_due";
        if (subscription.status === "active" || subscription.status === "trialing") {
          status = subscription.cancel_at_period_end ? "cancelled" : "active";
        } else if (subscription.status === "past_due") {
          status = "past_due";
        } else {
          status = "expired";
        }

        const plan = subscription.items.data[0].plan.id === ENV.stripePriceAnnual ? "annual" : "monthly";
        const startedAt = new Date((subscription as any).created * 1000);

        const dbSub = await getSubscriptionByStripeId(stripeSubscriptionId);
        if (dbSub) {
          await createOrUpdateStripeSubscription(
            dbSub.userId,
            dbSub.stripeCustomerId ?? "",
            stripeSubscriptionId,
            plan,
            status,
            expiresAt,
            startedAt
          );
          console.log(`[Stripe Webhook] Updated subscription ${stripeSubscriptionId} status to ${status}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error handling webhook event:", error);
    res.status(500).json({ error: "Webhook event handler failed" });
  }
}
