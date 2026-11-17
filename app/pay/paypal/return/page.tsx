import { Suspense } from "react";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { PaypalReturn } from "@/components/pay/PaypalReturn";

// PayPal sends the buyer here after approval (or cancel). PaypalReturn reads the query
// string on the client, so it needs a Suspense boundary.
export default function PaypalReturnPage() {
  return (
    <Suspense fallback={<CheckoutSpinner />}>
      <PaypalReturn />
    </Suspense>
  );
}
