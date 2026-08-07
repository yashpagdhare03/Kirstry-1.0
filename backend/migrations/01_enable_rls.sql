-- Supabase Row Level Security (RLS) Migration for Kirstry POS
-- Executed automatically via Supabase MCP tool on project cssmoybkdzoxbntcrzfj.

DO $$
BEGIN
  -- 1. Enable RLS on stores and store_members
  ALTER TABLE IF EXISTS public.stores ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.store_members ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can view their own store member records" ON public.store_members;
  CREATE POLICY "Users can view their own store member records"
  ON public.store_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view stores they belong to" ON public.stores;
  CREATE POLICY "Users can view stores they belong to"
  ON public.stores FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  -- 2. Enable RLS on products
  ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Tenant isolation for products select" ON public.products;
  CREATE POLICY "Tenant isolation for products select"
  ON public.products FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Tenant isolation for products insert" ON public.products;
  CREATE POLICY "Tenant isolation for products insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Tenant isolation for products update" ON public.products;
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
  ALTER TABLE IF EXISTS public.sales ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.sale_items ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Tenant isolation for sales" ON public.sales;
  CREATE POLICY "Tenant isolation for sales"
  ON public.sales FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Tenant isolation for sale_items" ON public.sale_items;
  CREATE POLICY "Tenant isolation for sale_items"
  ON public.sale_items FOR ALL
  TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM public.sales WHERE store_id IN (
        SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
      )
    )
  );

  -- 4. Enable RLS on customers and credit_transactions
  ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.credit_transactions ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Tenant isolation for customers" ON public.customers;
  CREATE POLICY "Tenant isolation for customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Tenant isolation for credit_transactions" ON public.credit_transactions;
  CREATE POLICY "Tenant isolation for credit_transactions"
  ON public.credit_transactions FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  -- 5. Enable RLS on suppliers and purchase_orders
  ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.purchase_orders ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Tenant isolation for suppliers" ON public.suppliers;
  CREATE POLICY "Tenant isolation for suppliers"
  ON public.suppliers FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Tenant isolation for purchase_orders" ON public.purchase_orders;
  CREATE POLICY "Tenant isolation for purchase_orders"
  ON public.purchase_orders FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  -- 6. Enable RLS on alerts and stock_batches
  ALTER TABLE IF EXISTS public.alerts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.stock_batches ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Tenant isolation for alerts" ON public.alerts;
  CREATE POLICY "Tenant isolation for alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Tenant isolation for stock_batches" ON public.stock_batches;
  CREATE POLICY "Tenant isolation for stock_batches"
  ON public.stock_batches FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
  );
END $$;
