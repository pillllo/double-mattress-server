import { Request, Response } from "express";
const environment = process.env.ENVIRONMENT || "development";
require("custom-env").env(environment);

// Set your secret key. Remember to switch to your live secret key in production.
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY_TEST);
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
      // success_url: `${DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      success_url: `${DOMAIN}/projections`,
      cancel_url: `${DOMAIN}/subscription`,
    });
    console.log("🎯 checkOut session", session.id);
    console.log("🎯 checkOut created");
    res.redirect(303, session.url);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create the checkout session");
  }
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

async function webhook(req: Request, res: Response) {
  let event = req.body;
  // Replace this endpoint secret with your endpoint's unique secret
  // If you are testing with the CLI, find the secret by running 'stripe listen'
  // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
  // at https://dashboard.stripe.com/webhooks
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
  // "whsec_12345";
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  // if (endpointSecret) {
  //   // Get the signature sent by Stripe
  //   const signature = req.headers["stripe-signature"];
  //   try {
  //     event = stripe.webhooks.constructEvent(
  //       req.body,
  //       signature,
  //       endpointSecret
  //     );
  //   } catch (error) {
  //     console.log(`⚠️  Webhook signature verification failed.`);
  //     return res.sendStatus(400);
  //   }
  // }
  console.log("🎯 event", event);
  let subscription;
  let status;
  // Handle the event
  switch (event.type) {
    case "customer.subscription.trial_will_end":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;
    case "customer.subscription.deleted":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      break;
    case "customer.subscription.created":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`, subscription.id);
      // Then define and call a method to handle the subscription created.
      // handleSubscriptionCreated(subscription);
      break;
    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send("Event received");
}

const subscriptionController = {
  testStripe,
  createCheckoutSession,
  createCustomerPortal,
  webhook,
};

export default subscriptionController;
