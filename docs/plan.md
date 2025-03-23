### **🚀 Updated Plan: AI-Powered Affiliate Management & Payment Automation**  

This plan reflects your decision to use **promo codes for conversion tracking** and implement **monthly payouts by default**, with an option for **daily payouts for trusted affiliates**.  

---

## **🔹 Key Features & Flow**  

### **1️⃣ Affiliate Onboarding & Promo Code Generation**
- Admin registers affiliates & assigns a **unique promo code** (e.g., `ECO10`).
- Promo code is stored in the **Affiliates Table**.
- Affiliates receive their promo code & can start promoting.

### **2️⃣ Conversion Tracking (Promo Code-Based)**
- Customer applies an **affiliate promo code** at checkout.
- Backend validates the promo code, links the sale to the affiliate, and stores it in the **Conversions Table**.
- Commission is calculated automatically based on the sale amount.

### **3️⃣ Commission Calculation & Payout Processing**
- System calculates **commission % based on predefined rates**.
- Payout requests are **batched monthly by default**.
- Trusted affiliates (earning consistently) can **opt for daily payouts**.
- Payman API automates **ACH/USDC payouts**.

### **4️⃣ Admin Dashboard (Next.js)**
- View affiliate performance (sales, top earners, conversion rates).
- Manage payouts (approve, track status, automate via Payman API).
- AI-driven fraud detection (flag suspicious promo code usage).

### **5️⃣ Affiliate Dashboard (Next.js)**
- Track earnings & commissions in real-time.
- View payout history & request withdrawals (if eligible for daily payouts).
- See insights on best-performing promo codes.

---

## **🔹 Tech Stack & Integrations**
| **Component**   | **Tech/Service**       |  
|---------------|---------------------|  
| **Frontend**  | Next.js + Tailwind   |  
| **Backend**   | Node.js (Express) / FastAPI  |  
| **Database**  | PostgreSQL / Firebase  |  
| **Tracking**  | Promo Code System  |  
| **Payments**  | Payman API (US ACH & USDC)  |  
| **AI Features**  | Fraud detection for promo codes  |  

---

## ** Next Steps**
1️⃣ **Set up the database** → Affiliates, conversions, and payouts tables.  
2️⃣ **Implement promo code validation** → At checkout to track conversions.  
3️⃣ **Build the dashboard UI** → For tracking affiliates, sales, and payouts.  
4️⃣ **Integrate Payman API** → Automate commission payments.  

Would you like help with **database schema setup or backend architecture** next? 🚀