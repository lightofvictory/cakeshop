# 📱 MSG91 Mobile OTP Verification Setup Guide

This guide documents how to configure **MSG91 SMS OTP** for customer profile verification in the **Mr. Pastry Cakeshop** application.

---

## Security Architecture

```text
React Frontend (http://localhost:5173)
           ↓
Backend API (http://localhost:3000/api/users/*)
           ↓  (Headers: authkey: MSG91_AUTH_KEY)
MSG91 REST API (https://control.msg91.com/api/v5/otp)
```

The MSG91 Authkey is stored **ONLY** on the backend server in `Backend/.env` and is **NEVER** exposed to the frontend.

---

## 1. MSG91 Dashboard Setup

1. Log into your [MSG91 Dashboard](https://control.msg91.com/).
2. Go to **OTP Services** -> **Templates**.
3. Create an OTP Template (e.g., `Your Mr. Pastry OTP is ##OTP##`).
4. Copy your **OTP Template ID**.
5. Copy your **Authkey** from **API Keys** section.

---

## 2. Environment Variables Setup (`Backend/.env`)

Edit `Backend/.env`:

```env
# MSG91 SMS & OTP Verification Credentials
MSG91_AUTH_KEY="565384TMMyM7uL6GeX6a91d828P1"
MSG91_OTP_TEMPLATE_ID="YOUR_MSG91_OTP_TEMPLATE_ID"
```

---

## 3. Development Testing (Without Burning SMS Credits)

For development testing, a built-in test fallback is enabled:
- **Test Mobile Number**: `9876543210`
- **Test OTP Code**: `123456`

### Testing Steps:
1. Log in to your customer profile (`http://localhost:5173/profile`).
2. Click **Verify Mobile via MSG91 OTP**.
3. Enter mobile number `9876543210`.
4. Click **Send Verification OTP**.
5. Enter OTP code `123456`.
6. Click **Verify OTP**.
7. Profile instantly updates to **`Verified ✓`** with a server timestamp stored in MongoDB.
