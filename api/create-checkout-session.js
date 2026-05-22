const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const siteUrl = req.headers.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Recharge 50 crédits - TVA Express",
              description: "Recharge de crédits pour utiliser TVA Express",
            },
            unit_amount: 200,
          },
          quantity: 1,
        },
      ],

      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};