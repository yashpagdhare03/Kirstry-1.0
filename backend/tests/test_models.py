"""
Unit tests for database model classes.
"""

from app.models import (
    User, Store, StoreMember, Category, Product,
    StockBatch, StockTransaction, Sale, SaleItem,
    Customer, CreditTransaction, Supplier, PurchaseOrder, Alert
)


def test_models_instantiation():
    """Verify all 14 database models instantiate correctly."""
    user = User(id="u1", email="test@kirstry.com", full_name="Test Owner")
    assert user.email == "test@kirstry.com"

    store = Store(id="s1", owner_id=user.id, name="Kirana Store")
    assert store.name == "Kirana Store"

    member = StoreMember(id="m1", store_id=store.id, user_id=user.id, role="owner")
    assert member.role == "owner"

    category = Category(id="c1", store_id=store.id, name="Groceries")
    assert category.name == "Groceries"

    product = Product(id="p1", store_id=store.id, name="Atta 5kg", unit="pack", selling_price=250.0)
    assert product.name == "Atta 5kg"

    supplier = Supplier(id="sup1", store_id=store.id, name="ABC Wholesalers")
    assert supplier.name == "ABC Wholesalers"

    customer = Customer(id="cust1", store_id=store.id, name="Rahul Sharma")
    assert customer.name == "Rahul Sharma"

    batch = StockBatch(id="b1", product_id=product.id, store_id=store.id, quantity_remaining=20, initial_quantity=20)
    assert batch.quantity_remaining == 20

    tx = StockTransaction(id="t1", store_id=store.id, product_id=product.id, type="stock_in", quantity=20)
    assert tx.type == "stock_in"

    sale = Sale(id="sale1", store_id=store.id, invoice_number="INV-001", total_amount=250.0, payment_mode="cash")
    assert sale.invoice_number == "INV-001"

    item = SaleItem(id="si1", sale_id=sale.id, product_id=product.id, quantity=1, unit_price=250.0, total_price=250.0)
    assert item.total_price == 250.0

    credit = CreditTransaction(id="ct1", store_id=store.id, customer_id=customer.id, type="credit", amount=250.0)
    assert credit.amount == 250.0

    po = PurchaseOrder(id="po1", store_id=store.id, supplier_id=supplier.id, items=[{"name": "Atta", "qty": 10}])
    assert len(po.items) == 1

    alert = Alert(id="a1", store_id=store.id, type="low_stock", message="Stock low", severity="warning")
    assert alert.severity == "warning"
