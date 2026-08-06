> ⛔ **MANDATORY**: This is the authoritative product definition for Kirstry. Every goal, feature, flow, and scope boundary listed here is a hard constraint. You MUST NOT add, remove, or modify any feature beyond what is defined in this file. If a feature is not listed here, it does not exist. If a feature is listed as out of scope, you MUST NOT implement it under any circumstance.

# Kirstry

## Overview

Kirstry eases the work of kirana store owners to manage their inventory as a whole. It primarily serves kirana shopkeepers who currently rely on pen-and-paper stock tracking, helping them gain real-time visibility into their products, reduce expiry waste, and manage each product's details with ease.

## Goals

You MUST achieve all of the following goals:

1. Shopkeepers MUST be able to track inventory and manage them in real-time
2. The system MUST reduce the expiry product rate so products do not get wasted and shopkeepers avoid loss
3. Shopkeepers MUST be able to track each product's details with ease

## Core User Flow

1. Shopkeeper signs in via email/password or Google sign-in
2. Shopkeeper lands on the dashboard showing today's stock summary, alerts, and quick stats
3. Shopkeeper adds a product manually or by scanning/uploading a photo of the barcode to auto-fetch product details
4. Shopkeeper performs stock-in (adds purchased stock with batch and expiry info) or stock-out (records sales/damage/returns)
5. Shopkeeper views expiry alerts and low-stock alerts on the dashboard
6. Shopkeeper checks analytics — fast-moving items, slow-moving items, sales trends

## Features

### Authentication & Onboarding

- Email + password login
- Google sign-in (instant)
- Store setup wizard (store name, address, GSTIN optional)

### Inventory Management

- Add product manually (name, category, brand, unit, MRP, selling price, purchase price)
- Auto-fetch product details by uploading/scanning barcode photo
- Stock-in entry (purchase from supplier with batch and expiry date)
- Stock-out entry (sale, damage, return)
- Stock adjustment (physical count reconciliation)
- Real-time stock level dashboard
- Low-stock alerts with configurable thresholds
- Expiry date tracking with 7-day, 3-day, 1-day warnings

### Dashboard & Analytics

- Today's stock summary (total products, low stock count, expiring count)
- Fast-moving items (top sellers)
- Slow-moving / dead stock items
- Sales trend charts
- Expiry alert feed
- Low-stock alert feed

### Billing (Basic)

- Quick billing with barcode scan
- Cash/UPI/credit payment mode selection
- Invoice generation with WhatsApp sharing
- Daily sales summary

### Digital Khata (Customer Credit)

- Customer management (name, phone)
- Credit (udhari) entry with due date
- Payment collection recording
- Outstanding balance tracking

### Supplier Management

- Supplier directory (name, phone, items supplied)
- Purchase order creation
- WhatsApp order sharing to supplier

> ⛔ **HARD CONSTRAINT**: No feature outside the list above may be implemented. If you believe a feature is needed that is not listed here, you MUST raise it as an open question and get explicit approval before implementing. You MUST NEVER invent or assume features.

## Scope

### In Scope

- Email and Google authentication only (via Supabase Auth)
- Product CRUD with manual entry and barcode photo upload
- Batch-based inventory tracking (stock-in, stock-out, adjustment)
- Expiry tracking with alerts (7/3/1 day)
- Low-stock alerts with thresholds
- Dashboard with stock summary and analytics
- Basic billing (POS-style) with invoice generation
- Digital khata (customer credit tracking)
- Supplier directory and purchase orders
- Only English language support
- PWA with offline billing support

### Out of Scope

> ⛔ **HARD CONSTRAINT**: The following items MUST NOT be implemented under any circumstance. No exceptions.

- AI-powered reorder suggestions and demand forecasting
- Customer-facing ordering portal / app
- Loan/credit access integration with fintech lenders
- Multi-language beyond Hindi and English
- IoT/hardware integrations (smart shelves, weighing scales)
- Delivery management system
- Advanced GST filing and reconciliation
- Multi-store chain management (single store only for MVP)
- Mobile number + OTP authentication

## Success Criteria

You MUST verify every one of these criteria before considering any milestone complete:

1. A shopkeeper can authenticate via email/password or Google sign-in and reach the dashboard
2. A shopkeeper can add a product manually or auto-fetch product details by uploading a photo of the barcode
3. A shopkeeper can record stock-in with batch and expiry date information and see the stock level update in real-time
4. A shopkeeper receives expiry alerts 7 days, 3 days, and 1 day before a product expires
5. A shopkeeper can create a bill with multiple items, select payment mode, and generate a shareable invoice
6. A shopkeeper can add customer credit (udhari) and view outstanding balances
7. The dashboard displays today's stock summary, low-stock alerts, and expiry alerts accurately

---

> ⛔ **REMINDER**: This file is the single source of truth for product scope. No feature outside this file exists. No out-of-scope item may be implemented.