const express = require('express');
const app = express();
require('dotenv').config();
const stripe = require('stripe')(process.env.SECRET_KEY);
const port = process.env.PORT;


app.set('view engine', 'ejs');


app.get('/', (req, res, next) => {
  res.render('index');
})

app.post('/checkout', async (req, res, next) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Node.js and Express Book',
        },
        unit_amount: 5000,
      },
      quantity: 1,
    }, {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'JavaScript T-Shirt',
        },
        unit_amount: 2000,
      },
      quantity: 2,
    }],
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    mode: 'payment',
    success_url: `http://localhost:${port}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:${port}/cancel`,
  })
  res.redirect(session.url);
})

app.get('/success', async (req, res, next) => {
  const result = await Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id),
    stripe.checkout.sessions.listLineItems(req.query.session_id)
  ])
  console.log(JSON.stringify(result));
  res.render('success')
})
app.get('/cancel', (req, res, next) => {
  res.render('cancel')
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})