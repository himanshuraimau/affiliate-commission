# Settings API

The Settings API allows for management of system-wide configuration settings.

## Get Settings

Retrieves the current system settings.

- **URL**: `/api/settings`
- **Method**: `GET`
- **Authentication Required**: Yes

### Success Response

```json
{
  "_id": "60d21b4667d0d8992e610c89",
  "payoutSettings": {
    "minimumPayoutAmount": 50,
    "payoutFrequency": "monthly",
    "payoutDay": 1,
    "automaticPayouts": true
  },
  "apiKeys": {
    "paymanApiKey": "sk_test_********"
  },
  "commissionDefaults": {
    "defaultRate": 10,
    "minimumOrderAmount": 0
  },
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Update Settings

Updates the system settings.

- **URL**: `/api/settings`
- **Method**: `PATCH`
- **Authentication Required**: Yes

### Request Body

```json
{
  "payoutSettings": {
    "minimumPayoutAmount": 100,
    "payoutFrequency": "weekly"
  },
  "apiKeys": {
    "paymanApiKey": "sk_test_new_key"
  },
  "commissionDefaults": {
    "defaultRate": 15
  }
}
```

Note: You only need to include the settings you want to update.

### Success Response

```json
{
  "_id": "60d21b4667d0d8992e610c89",
  "payoutSettings": {
    "minimumPayoutAmount": 100,
    "payoutFrequency": "weekly",
    "payoutDay": 1,
    "automaticPayouts": true
  },
  "apiKeys": {
    "paymanApiKey": "sk_test_new_key"
  },
  "commissionDefaults": {
    "defaultRate": 15,
    "minimumOrderAmount": 0
  },
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Implementation Notes

- The settings collection typically contains a single document that stores all system-wide settings.
- If no settings document exists when the GET endpoint is called, a default settings document will be created.
- The API keys are returned in responses but in a production environment should be masked for security.
- Available payout frequencies are "daily", "weekly", and "monthly".
- When the payout frequency is "weekly", the payoutDay represents the day of the week (0-6, where 0 is Sunday).
- When the payout frequency is "monthly", the payoutDay represents the day of the month (1-31).
