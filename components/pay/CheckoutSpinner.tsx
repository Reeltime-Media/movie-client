import { PageShell } from "@/components/layout/PageShell";

type CheckoutSpinnerProps = {
  message?: string;
  fullWidth?: boolean;
};

export function CheckoutSpinner({ message, fullWidth = false }: CheckoutSpinnerProps) {
  return (
    <PageShell fullWidth={fullWidth}>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-brand" />
        {message ? (
          <p className="text-[13px] text-text-muted">{message}</p>
        ) : null}
      </div>
    </PageShell>
  );
}
