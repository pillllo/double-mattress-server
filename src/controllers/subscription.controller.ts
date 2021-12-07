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
      // lookup_keys: [req.body.lookup_key],
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
      mode: "subscription",
      success_url: `${DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}?canceled=true`,
    });
    console.log("🎯 checkOut created");
    res.redirect(303, session.url);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create the checkout session");
  }
}

const subscriptionController = {
  testStripe,
  createCheckoutSession,
};

export default subscriptionController;
