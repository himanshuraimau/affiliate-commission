# API Routes Quick Reference

This document provides a quick reference for all API routes available in the Affiliate Commission system.

## Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Authenticate a user and create a session |
| POST | `/api/auth/signup` | Create a new user account |
| GET | `/api/auth/me` | Get the currently authenticated user |
| POST | `/api/auth/logout` | End the current user session |

## Affiliates

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/affiliates` | Get all affiliates |
| POST | `/api/affiliates` | Create a new affiliate |

## Conversions

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/conversions` | Get conversions (with optional filtering) |
| POST | `/api/conversions` | Create a new conversion |
| PATCH | `/api/conversions/:id/status` | Update a conversion's status |

## Payouts

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/payouts` | Get payouts (with optional filtering) |
| POST | `/api/payouts` | Process a payout to an affiliate |

## Analytics

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/overview` | Get dashboard overview metrics |
| GET | `/api/analytics/revenue` | Get revenue data over time |
| GET | `/api/analytics/conversion-rate` | Get conversion rate data over time |
| GET | `/api/analytics/commission-breakdown` | Get commission breakdown by payment method |
| GET | `/api/analytics/top-affiliates` | Get top-performing affiliates |

## Dashboard

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stats/dashboard` | Get aggregated statistics for the dashboard |

## Payments

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/create-payee` | Create a payment recipient in the payment system |

## Settings

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/settings` | Get current system settings |
| PATCH | `/api/settings` | Update system settings |
