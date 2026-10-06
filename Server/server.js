const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const PAYSTACK_SECRET_KEY =
    process.env.PAYSTACK_SECRET_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==========================================
   SERVE 99STEPS WEBSITE
========================================== */

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


/* ==========================================
   PAYSTACK INITIALIZE
========================================== */

app.post(
    "/api/paystack/initialize",
    async (req, res) => {

        try {

            const {
                email,
                amount,
                customer,
                items,
                paymentMethod
            } = req.body;


            /* ----------------------------------
               BASIC VALIDATION
            ---------------------------------- */

            if (!PAYSTACK_SECRET_KEY) {

                console.error(
                    "PAYSTACK_SECRET_KEY is missing."
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Paystack secret key is not configured on the server."
                });

            }


            if (!email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email is required."
                });

            }


            const numericAmount =
                Number(amount);


            if (
                !Number.isFinite(numericAmount) ||
                numericAmount <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment amount."
                });

            }


            /* ----------------------------------
               CONVERT GH₵ TO PESEWAS
            ---------------------------------- */

            const amountInPesewas =
                Math.round(
                    numericAmount * 100
                );


            /* ----------------------------------
               CREATE UNIQUE REFERENCE
            ---------------------------------- */

            const reference =
                `99STEPS-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase()}`;


            /* ----------------------------------
               PAYMENT CHANNEL
            ---------------------------------- */

            let channels = [
                "card",
                "mobile_money"
            ];


            if (
                paymentMethod === "card"
            ) {

                channels = ["card"];

            }


            if (
                paymentMethod === "mobile-money"
            ) {

                channels = ["mobile_money"];

            }


            /* ----------------------------------
               CALLBACK URL
            ---------------------------------- */

            const callbackUrl =
                `${req.protocol}://${req.get("host")}/checkout.html`;


            /* ----------------------------------
               PAYSTACK REQUEST
            ---------------------------------- */

            const response =
                await fetch(
                    "https://api.paystack.co/transaction/initialize",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${PAYSTACK_SECRET_KEY}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email,

                            amount:
                                String(
                                    amountInPesewas
                                ),

                            currency:
                                "GHS",

                            reference,

                            channels,

                            callback_url:
                                callbackUrl,

                            metadata: {

                                brand:
                                    "99STEPS",

                                customer:
                                    customer || {},

                                items:
                                    items || [],

                                payment_method:
                                    paymentMethod || ""

                            }

                        })
                    }
                );


            const data =
                await response.json();


            /* ----------------------------------
               PAYSTACK ERROR
            ---------------------------------- */

            if (
                !response.ok ||
                !data.status
            ) {

                console.error(
                    "Paystack initialization error:",
                    data
                );


                return res.status(
                    response.status || 400
                ).json({

                    success: false,

                    message:
                        data.message ||
                        "Unable to initialize payment."

                });

            }


            /* ----------------------------------
               SUCCESS
            ---------------------------------- */

            console.log(
                "Paystack transaction initialized:",
                data.data.reference
            );


            return res.json({

                success: true,

                authorization_url:
                    data.data.authorization_url,

                access_code:
                    data.data.access_code,

                reference:
                    data.data.reference

            });

        } catch (error) {

            console.error(
                "Paystack initialization failed:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Payment initialization failed."

            });

        }

    }
);


/* ==========================================
   PAYSTACK VERIFY
========================================== */

app.get(
    "/api/paystack/verify/:reference",
    async (req, res) => {

        try {

            const {
                reference
            } = req.params;


            if (!PAYSTACK_SECRET_KEY) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Paystack secret key is not configured."

                });

            }


            if (!reference) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Transaction reference is required."

                });

            }


            const response =
                await fetch(

                    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
                        reference
                    )}`,

                    {
                        method: "GET",

                        headers: {

                            Authorization:
                                `Bearer ${PAYSTACK_SECRET_KEY}`

                        }

                    }

                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.status
            ) {

                console.error(
                    "Paystack verification error:",
                    data
                );


                return res.status(
                    response.status || 400
                ).json({

                    success: false,

                    message:
                        data.message ||
                        "Payment verification failed."

                });

            }


            const transaction =
                data.data;


            /* ----------------------------------
               RETURN VERIFIED INFORMATION
            ---------------------------------- */

            return res.json({

                success: true,

                status:
                    transaction.status,

                reference:
                    transaction.reference,

                amount:
                    transaction.amount,

                currency:
                    transaction.currency,

                channel:
                    transaction.channel,

                paid_at:
                    transaction.paid_at,

                customer:
                    transaction.customer

            });

        } catch (error) {

            console.error(
                "Paystack verification failed:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify payment."

            });

        }

    }
);


/* ==========================================
   SERVER
========================================== */

app.listen(
    PORT,
    () => {

        console.log(
            `99STEPS server running at http://localhost:${PORT}`
        );

    }
);