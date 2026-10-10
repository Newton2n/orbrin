import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Receipt,
} from "lucide-react";

import {
  getSubscriptionHistory,
  type SubscriptionHistory,
  type SubscriptionHistoryQuery,
} from "@/actions/subscription.action";

import { SubscriptionActions } from "@/components/subscriptions/subscription-actions";
import { SubscriptionFilters } from "@/components/subscriptions/subscription-filter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SearchParams = Promise<{
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}>;

export default async function AdminSubscriptionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const validStatuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;

  const status = validStatuses.includes(
    params.status as (typeof validStatuses)[number],
  )
    ? (params.status as (typeof validStatuses)[number])
    : undefined;
  const page = Number(params.page);
  const limit = Number(params.limit);
  const sortBy = params.sortBy === "updatedAt" ? "updatedAt" : "createdAt";
  const sortOrder: SubscriptionHistoryQuery["sortOrder"] =
    params.sortOrder === "asc" ? "asc" : "desc";

  const result = await getSubscriptionHistory({
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 10,
    search: params.search,
    status,
    sortBy,
    sortOrder,
  });

  const subscription: SubscriptionHistory | null = result.success
    ? result.data
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Billing
        </p>

        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Subscription
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your organization subscription and payment history.
        </p>
      </div>

      {subscription ? (
        <ActiveSubscription subscription={subscription} />
      ) : (
        <NoSubscription
          message={
            result.message ?? "Your organization does not have a subscription."
          }
        />
      )}

      {subscription ? (
        <PaymentHistory payments={subscription.payments} />
      ) : null}
    </div>
  );
}

function ActiveSubscription({
  subscription,
}: {
  subscription: SubscriptionHistory;
}) {
  const hasEnded =
    subscription.currentPeriodEnd !== null &&
    new Date(subscription.currentPeriodEnd) < new Date();

  const isActive = subscription.status === "ACTIVE" && !hasEnded;

  return (
    <Card
      className={
        hasEnded
          ? "border-red-500/40 bg-red-50/30 shadow-none dark:border-red-500/30 dark:bg-red-950/10"
          : "border-border/70 shadow-none"
      }
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Current subscription</CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            Your organization&apos;s current billing information.
          </p>
        </div>

        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            hasEnded
              ? "border-red-500/30 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
              : "shrink-0"
          }
        >
          {hasEnded ? (
            <>
              <AlertCircle className="mr-1 size-3.5" />
              Expired
            </>
          ) : (
            formatStatus(subscription.status)
          )}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        <div
          className={
            hasEnded
              ? "rounded-xl border border-red-500/30 bg-red-100/40 p-5 dark:border-red-500/20 dark:bg-red-950/20"
              : "rounded-xl border bg-muted/20 p-5"
          }
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>

              <h2 className="mt-1 text-xl font-semibold">
                {formatPlanName(subscription.planName)}
              </h2>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="size-4" />

                <span>{subscription.gateway}</span>
              </div>
            </div>

            <div
              className={
                hasEnded
                  ? "rounded-lg border border-red-500/30 bg-red-100 p-3 dark:border-red-500/20 dark:bg-red-950/30"
                  : "rounded-lg border bg-background p-3"
              }
            >
              {hasEnded ? (
                <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
              ) : (
                <Receipt className="size-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem
            icon={CalendarDays}
            label="Started"
            value={formatDate(subscription.currentPeriodStart)}
          />

          <InfoItem
            icon={CalendarDays}
            label={isActive ? "Renews" : "Ended"}
            value={formatDate(subscription.currentPeriodEnd)}
            expired={hasEnded}
          />
        </div>

        <div
          className={
            hasEnded
              ? "flex flex-wrap items-center justify-between gap-3 border-t border-red-500/20 pt-5"
              : "flex flex-wrap items-center justify-between gap-3 border-t pt-5"
          }
        >
          <div>
            <p
              className={
                hasEnded
                  ? "text-sm font-medium text-red-700 dark:text-red-400"
                  : "text-sm font-medium"
              }
            >
              {isActive
                ? "Your subscription is active."
                : hasEnded
                  ? "Your subscription has expired."
                  : "Your subscription is not currently active."}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {isActive
                ? "Your organization can continue using the current subscription."
                : hasEnded
                  ? "Renew your subscription to continue using subscription features."
                  : "Start a new subscription to continue billing."}
            </p>
          </div>

          {!isActive ? <SubscriptionActions /> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function NoSubscription({ message }: { message: string }) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <CreditCard className="size-5 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">No active subscription</h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        <SubscriptionActions className="mt-6" />
      </CardContent>
    </Card>
  );
}

function PaymentHistory({
  payments,
}: {
  payments: SubscriptionHistory["payments"];
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Payment history</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Previous payments made by your organization.
            </p>
          </div>

          <Receipt className="size-5 shrink-0 text-muted-foreground" />
        </div>

        <SubscriptionFilters />
      </CardHeader>

      <CardContent>
        {payments.length === 0 ? (
          <EmptyPaymentResults />
        ) : (
          <PaymentTable payments={payments} />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyPaymentResults() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <SearchIcon />
      </div>

      <h3 className="mt-4 text-sm font-semibold">No payments found</h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        No payment matches your current search or status filter. Try a different
        search.
      </p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5 text-muted-foreground"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function PaymentTable({
  payments,
}: {
  payments: SubscriptionHistory["payments"];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground">
          <tr>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Payment ID</th>
            <th className="pb-3 text-right font-medium">Invoice</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="py-4">{formatDate(payment.createdAt)}</td>

              <td className="py-4 font-medium">
                {formatMoney(payment.amount, payment.currency)}
              </td>

              <td className="py-4">
                <PaymentStatusBadge status={payment.status} />
              </td>

              <td className="max-w-[240px] truncate py-4 font-mono text-xs text-muted-foreground">
                {payment.transactionId}
              </td>

              <td className="py-4 text-right">
                {payment.invoiceUrl ? (
                  <a
                    href={payment.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View
                    <ArrowUpRight className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  expired = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  expired?: boolean;
}) {
  return (
    <div
      className={
        expired
          ? "flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-50/40 p-4 dark:border-red-500/20 dark:bg-red-950/10"
          : "flex items-center gap-3 rounded-lg border p-4"
      }
    >
      <div
        className={
          expired
            ? "flex size-9 shrink-0 items-center justify-center rounded-md bg-red-100 dark:bg-red-950/30"
            : "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted"
        }
      >
        <Icon
          className={
            expired
              ? "size-4 text-red-600 dark:text-red-400"
              : "size-4 text-muted-foreground"
          }
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p
          className={
            expired
              ? "mt-1 truncate text-sm font-medium text-red-700 dark:text-red-400"
              : "mt-1 truncate text-sm font-medium"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return (
      <Badge variant="secondary">
        <CheckCircle2 className="mr-1 size-3.5" />
        Paid
      </Badge>
    );
  }

  return <Badge variant="outline">{formatStatus(status)}</Badge>;
}

function formatPlanName(value: string) {
  return value.replace("Orbrin Base One Month", "Orbrin Base");
}

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatMoney(amount: string, currency: string) {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return `${amount} ${currency}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(numericAmount);
}
