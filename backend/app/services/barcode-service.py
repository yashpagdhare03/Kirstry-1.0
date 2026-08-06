"""
Barcode lookup service fetching product metadata from Open Food Facts API.
"""

from typing import Dict, Any, Optional
import httpx

OPEN_FOOD_FACTS_API_URL = "https://world.openfoodfacts.org/api/v2/product/{barcode}.json"


def lookup_barcode(barcode: str) -> Dict[str, Any]:
    """
    Looks up a product by barcode using Open Food Facts API.
    Returns parsed dictionary of product metadata or default values if not found.
    """
    clean_barcode = barcode.strip()
    url = OPEN_FOOD_FACTS_API_URL.format(barcode=clean_barcode)

    headers = {
        "User-Agent": "KirstryKiranaApp/1.0 (contact@kirstry.local)"
    }

    try:
        response = httpx.get(url, headers=headers, timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == 1 and "product" in data:
                product_data = data["product"]

                name = (
                    product_data.get("product_name")
                    or product_data.get("product_name_en")
                    or product_data.get("abbreviated_product_name")
                    or f"Product {clean_barcode}"
                )

                brand = product_data.get("brands") or product_data.get("brand_owner") or ""

                unit = product_data.get("quantity") or product_data.get("unit") or "pcs"

                image_url = (
                    product_data.get("image_front_url")
                    or product_data.get("image_url")
                    or product_data.get("image_small_url")
                    or ""
                )

                return {
                    "found": True,
                    "barcode": clean_barcode,
                    "name": name,
                    "brand": brand,
                    "unit": unit,
                    "image_url": image_url,
                }
    except Exception as err:
        # Fallback graceful response if network fail or API unavailable
        pass

    return {
        "found": False,
        "barcode": clean_barcode,
        "name": f"Product {clean_barcode}",
        "brand": "",
        "unit": "pcs",
        "image_url": "",
    }
