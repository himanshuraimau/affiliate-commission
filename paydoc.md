Create Payee
Create a new payee (aka payee) for future payments to be sent to

POST
/
payments
/
payees

Try it
​
Payment Destination Types
US_ACH - US Bank Account
CRYPTO_ADDRESS - Cryptocurrency Address
PAYMAN_WALLET - Payman Wallet (Coming Soon)
Authorizations
​
x-payman-api-secret
stringheaderrequired
Body
application/json
Option 1
Option 2
Option 3
Option 4
A Test Dollar payee

​
type
enum<string>required
The type of payee

Available options: TEST_RAILS 
​
name
stringrequired
The name you wish to associate with this payee for future lookups.

​
tags
string[]
Any additional labels you wish to assign to this payee

Any additional labels you wish to assign to this payee

Response
200

200
application/vnd.payman.v1+json
The payment was successful.
​
name
stringrequired
The user-assigned name of the payee

​
organizationId
stringrequired
​
type
enum<string>required
The type of payee

Available options: US_ACH, CRYPTO_ADDRESS, PAYMAN_WALLET, TEST_RAILS 
​
id
string
​
createdAt
string
​
updatedAt
string
​
createdBy
string
​
updatedBy
string
​
providerInfo
object
​
tags
string[]
Tags to help categorize the payee

Tags to help categorize the payee

​
payeeDetails
object
​
contactDetails
object
Contact details for this payee


Show child attributes

​
status
enum<string>
The status of the payee

Available options: ACTIVE, ARCHIVED, DELETED 
​
searchHashes
object
​
replacesId
string
The ID of the payee this entity replaces




const options = {
  method: 'POST',
  headers: {'x-payman-api-secret': '<api-key>', 'Content-Type': 'application/json'},
  body: '{"type":"CRYPTO_ADDRESS","address":"<string>","chain":"<string>","currency":"<string>","name":"<string>","tags":["<string>"],"contactDetails":{"email":"<string>","phoneNumber":"<string>","address":{"addressLine1":"<string>","addressLine2":"<string>","addressLine3":"<string>","addressLine4":"<string>","locality":"<string>","region":"<string>","postcode":"<string>","country":"<string>"},"taxId":"<string>"}}'
};

fetch('https://agent.payman.ai/api/payments/payees', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));




  {
  "id": "<string>",
  "createdAt": "2023-11-07T05:31:56Z",
  "updatedAt": "2023-11-07T05:31:56Z",
  "createdBy": "<string>",
  "updatedBy": "<string>",
  "providerInfo": {},
  "name": "<string>",
  "organizationId": "<string>",
  "tags": [
    "<string>"
  ],
  "type": "US_ACH",
  "payeeDetails": {},
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
  "status": "ACTIVE",
  "searchHashes": {},
  "replacesId": "<string>"
}