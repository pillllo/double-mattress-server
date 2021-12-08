import { Request, Response } from "express";
import UserModel from "../models/user.model";
const environment = process.env.ENVIRONMENT || "development";
require("custom-env").env(environment);

// Set your secret key. Remember to switch to your live secret key in production.
const Stripe = require("stripe");
export const stripe = Stripe(process.env.STRIPE_SECRET_KEY_TEST);
const DOMAIN = process.env.DOMAIN;

async function testStripe(req: Request, res: Response) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: "eur",
      payment_method_types: ["card"],
      receipt_email: "jenny.rosen@example.com",
    });
    console.log("🎯 paymentIntent", paymentIntent);
    res.status(200).send("Payment intent created");
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create payment intent");
  }
}

async function createCheckoutSession(req: Request, res: Response) {
  try {
    const { lookup_key } = req.body;
    console.log("🎯 lookupKey", lookup_key);
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ["data.product"],
    });
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: prices.data[0].id,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      payment_method_types: ["card"],
      mode: "subscription",
      // success_url: `${DOMAIN}/projections`,
      // success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      // success_url: `${DOMAIN}/projections?session_id={CHECKOUT_SESSION_ID}`,
      success_url: `${DOMAIN}/projections/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/subscription`,
    });
    console.log("🎯 checkOut session", session.id);
    console.log("🎯 checkOut session", session);
    console.log("🎯 checkOut created");
    res.redirect(303, session.url);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create the checkout session");
  }
}

async function getSuccessPage(req: Request, res: Response) {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const stripeCustomerId = session.customer;
    const stripeCustomer = await stripe.customers.retrieve(session.customer);
    console.log("🎯 updatedUser - stripeCusId", stripeCustomerId);
    res.send(
      `<html><body><h1>Thanks for your order, ${stripeCustomer.name}! ${stripeCustomerId}</h1></body></html>`
    );
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get success page");
  }
}

async function webhook(req: Request, res: Response) {
  let event = req.body;
  let subscription;
  let status;
  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      status = paymentIntent.status;
      console.log(`paymentIntent status is ${status}.`);
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;
    case "customer.subscription.created":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`, subscription.id);
      // Then define and call a method to handle the subscription created.
      // handleSubscriptionCreated(subscription);
      break;
    case "customer.subscription.deleted":
      subscription = event.data.object;
      status = subscription.status;
      console.log(
        `Subscription status for customer ${subscription.customer} with subscritpion ${subscription.id} is ${status}.`
      );
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      break;
    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      console.log(
        `Subscription status for customer ${subscription.customer} with subscritpion ${subscription.id} is ${status}.`
      );
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;
    case "invoice.paid":
      subscription = event.data.object;
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send("Event received");
}

async function createCustomerPortal(req: Request, res: Response) {
  try {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = process.env.DOMAIN;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    res.redirect(303, portalSession.url);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create customer portal");
  }
}

const subscriptionController = {
  testStripe,
  createCheckoutSession,
  getSuccessPage,
  createCustomerPortal,
  webhook,
};

export default subscriptionController;
