import Header from "../components/Header";
import Image from "next/image";
import { selectItems, selectTotal } from "../slices/basketSlice";
import { useSelector } from "react-redux";
import Currency from "react-currency-formatter";
import CheckoutProduct from "../components/CheckoutProduct";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useSession } from "next-auth/client";

const stripePromise = loadStripe(process.env.stripe_public_key);
// console.log(process.env.stripe_public_key);
// console.log(typeof `${process.env.stripe_public_key}`);
console.log(process.env.FAKE_API_KEY_V3);

const Checkout = () => {
  const items = useSelector(selectItems);
  const total = useSelector(selectTotal);
  const [session] = useSession();

  const createCheckoutSession = async () => {
    // Get Stripe.js instance
    const stripe = await stripePromise;

    // Call your backend to create the Checkout Session
    const checkoutSession = await await axios.post(
      "/api/create-checkout-session",
      {
        items,
        email: session.user.email,
      }
    );

    // Redirect Customer to Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: checkoutSession.data.id,
    });

    if (result.error) {
      alert(result.error.message);
    }
  };

  return (
    <div className="bg-gray-100">
      <Header />

      <main className="lg:flex max-w-screen-2xl mx-auto">
        <div className="flex-grow m-5 shadow-sm">
          <Image
            src="https://www.junglescout.com/wp-content/uploads/2020/05/Prime-day-banner.png"
            width={1020}
            height={250}
            objectFit="contain"
          />
          <div className="flex flex-col p-5 space-y-10 bg-white">
            <h1 className="text-3xl border-b pb-4">
              {items.length === 0
                ? "Your Shopping Basket is empty"
                : "Shopping Basket"}
            </h1>
            {items.map((item, i) => (
              <CheckoutProduct
                key={i}
                id={item.id}
                title={item.title}
                rating={item.rating}
                price={item.price}
                description={item.description}
                category={item.category}
                image={item.image}
                hasPrime={item.hasPrime}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-white shadow-sm p-10">
          {items.length > 0 && (
            <>
              <h2 className="whitespace-nowrap">
                Subtotal ({items.length}) items:{" "}
                <span className="font-bold">
                  <Currency quantity={total} currency="USD" />
                </span>
              </h2>
              <button
                role="link"
                disabled={!session}
                className={`button mt-2 ${
                  !session &&
                  "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
                onClick={createCheckoutSession}
              >
                {!session ? "Sign in to checkout" : "Proceed to checkout"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Checkout;
