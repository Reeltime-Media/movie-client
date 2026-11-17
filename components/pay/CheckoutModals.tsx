"use client";

import { useState, type ReactNode } from "react";
import {
  BakongCheckoutModal,
  type BakongCheckoutModalProps,
} from "@/components/pay/BakongCheckoutModal";
import { PayMethodModal } from "@/components/pay/PayMethodModal";
import {
  SeriesUnlockBakongCheckoutModal,
  type SeriesUnlockBakongCheckoutModalProps,
} from "@/components/pay/SeriesUnlockBakongCheckoutModal";
import {
  SubscriptionBakongCheckoutModal,
  type SubscriptionBakongCheckoutModalProps,
} from "@/components/pay/SubscriptionBakongCheckoutModal";
import {
  createMoviePaypalIntent,
  createSeriesUnlockPaypalIntent,
  createSubscriptionPaypalIntent,
  type PaypalIntentRead,
} from "@/lib/api/payments";
import { movieWatchHref } from "@/lib/movie-routes";
import { usePaypalEnabled } from "@/lib/pay/paypal-enabled";

type GateProps = {
  title: string;
  priceLabel?: string;
  onClose: () => void;
  /** Where the buyer goes if the API says they already own it. */
  ownedHref: string;
  startPaypal: () => Promise<PaypalIntentRead>;
  renderBakong: () => ReactNode;
};

/** Offers PayPal next to Bakong when the API has PayPal switched on; otherwise it is
 * exactly the old Bakong-only checkout. */
function CheckoutMethodGate({
  title,
  priceLabel,
  onClose,
  ownedHref,
  startPaypal,
  renderBakong,
}: GateProps) {
  const paypalEnabled = usePaypalEnabled();
  const [bakongChosen, setBakongChosen] = useState(false);

  if (paypalEnabled === false || bakongChosen) return <>{renderBakong()}</>;

  return (
    <PayMethodModal
      title={title}
      priceLabel={priceLabel}
      loading={paypalEnabled === null}
      onClose={onClose}
      onChooseBakong={() => setBakongChosen(true)}
      startPaypal={startPaypal}
      onAlreadyOwned={() => window.location.assign(ownedHref)}
    />
  );
}

export function MovieCheckoutModal(props: BakongCheckoutModalProps) {
  const watchHref = movieWatchHref(props.watchSlug);
  return (
    <CheckoutMethodGate
      title={props.title}
      priceLabel={props.priceLabel}
      onClose={props.onClose}
      ownedHref={watchHref}
      startPaypal={() => createMoviePaypalIntent(props.contentId, { returnPath: watchHref })}
      renderBakong={() => <BakongCheckoutModal {...props} />}
    />
  );
}

export function SeriesUnlockCheckoutModal(props: SeriesUnlockBakongCheckoutModalProps) {
  return (
    <CheckoutMethodGate
      title={props.title}
      onClose={props.onClose}
      ownedHref={props.watchHref}
      startPaypal={() =>
        createSeriesUnlockPaypalIntent(props.seriesSlug, { returnPath: props.watchHref })
      }
      renderBakong={() => <SeriesUnlockBakongCheckoutModal {...props} />}
    />
  );
}

export function SubscriptionCheckoutModal(props: SubscriptionBakongCheckoutModalProps) {
  return (
    <CheckoutMethodGate
      title="Subscription"
      onClose={props.onClose}
      ownedHref="/profile"
      startPaypal={() => createSubscriptionPaypalIntent(props.planCode, { returnPath: "/profile" })}
      renderBakong={() => <SubscriptionBakongCheckoutModal {...props} />}
    />
  );
}
