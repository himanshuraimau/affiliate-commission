#### Create Test Payee
const options = {
  method: 'POST',
  headers: {
    'x-payman-api-secret': '<api-key>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: "TEST_RAILS",
    name: "<string>",
    tags: ["<string>"],
    contactDetails: {
      email: "<string>",
      phoneNumber: "<string>",
      address: {
        addressLine1: "<string>",
        addressLine2: "<string>",
        addressLine3: "<string>",
        addressLine4: "<string>",
        locality: "<string>",
        region: "<string>",
        postcode: "<string>",
        country: "<string>"
      },
      taxId: "<string>"
    }
  })
};

fetch('https://agent.payman.ai/api/payments/payees', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));



resonse 200 
{
  "id": "<string>",   // payeeId
  "createdAt": "2025-03-27T05:20:24.452876342Z",  
  "updatedAt": "2025-03-27T05:20:24.452876342Z",  
  "version": 0,  
  "createdBy": "<string>",  
  "updatedBy": "<string>",  
  "name": "<string>",  
  "organizationId": "<string>",  
  "type": "TEST_RAILS",  
  "payeeDetails": {},  
  "status": "ACTIVE",  
  "tags": ["<string>"],  
  "providerInfo": {},  
  "contactDetails": {  
    "email": "<string>",  
    "phoneNumber": "<string>",  
    "address": {  
      "addressLine1": "<string>",  
      "addressLine2": "<string>",  
      "addressLine3": "<string>",  
      "addressLine4": "<string>",  
      "locality": "<string>",  
      "region": "<string>",  
      "postcode": "<string>",  
      "country": "<string>"  
    },  
    "taxId": "<string>"  
  },  
  "searchHashes": {},  
  "replacesId": "<string>"  
}



##### SEND PAYMAN
const options = {
  method: 'POST',
  headers: {
    'x-payman-api-secret': '<api-key>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    walletId: "<string>",  // Optional: Wallet ID if multiple wallets exist
    amountDecimal: 10.00,  // Replace with the actual amount
    payeeId: "<string>",   // Replace with the valid payee ID from /payments/payees
    memo: "Payment for services",  // Optional: Add any payment note
    metadata: {}  // Optional: Additional metadata if required
  })
};

fetch('https://agent.payman.ai/api/payments/send-payment', options)
  .then(response => response.json())
  .then(response => {
    console.log("Payment Response:", response);
  })
  .catch(err => console.error("Error:", err));



{
  "reference": "<string>",  // Unique Payman reference for the transaction
  "externalReference": "<string>",  // Blockchain transaction hash (if applicable)
  "status": "INITIATED"  // Payment status: INITIATED, AWAITING_APPROVAL, REJECTED
}
