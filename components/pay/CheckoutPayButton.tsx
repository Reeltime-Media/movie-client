import { primaryButtonClassName } from "@/lib/ui/surfaces";

type CheckoutPayButtonProps = {
  label: string;
  loadingLabel?: string;
  paying: boolean;
  onClick: () => void;
};

export function CheckoutPayButton({
  label,
  loadingLabel = "Redirecting to checkout…",
  paying,
  onClick,
}: CheckoutPayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={paying}
      className={primaryButtonClassName}
    >
      {paying ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
