-- Supabase Row Level Security (RLS) Migration for Kirstry POS
-- Run this script in Supabase SQL Editor to enable 100% database level multi-tenant isolation.

-- 1. Enable RLS on stores and store_members
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own store member records"
ON public.store_members FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view stores they belong to"
ON public.stores FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

-- 2. Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for products select"
ON public.products FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Tenant isolation for products insert"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Tenant isolation for products update"
ON public.products FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

-- 3. Enable RLS on sales and sale_items
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for sales"
ON public.sales FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Tenant isolation for sale_items"
ON public.sale_items FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

-- 4. Enable RLS on customers and credit_transactions
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for customers"
ON public.customers FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Tenant isolation for credit_transactions"
ON public.credit_transactions FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

-- 5. Enable RLS on suppliers and purchase_orders
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for suppliers"
ON public.suppliers FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Tenant isolation for purchase_orders"
ON public.purchase_orders FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

-- 6. Enable RLS on alerts and stock_batches
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for alerts"
ON public.alerts FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Tenant isolation for stock_batches"
ON public.stock_batches FOR ALL
TO authenticated
USING (
  store_id IN (
    SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
  )
);
