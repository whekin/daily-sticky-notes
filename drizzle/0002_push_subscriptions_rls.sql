ALTER TABLE public.gift_push_subscriptions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON public.gift_push_subscriptions FROM anon, authenticated;
