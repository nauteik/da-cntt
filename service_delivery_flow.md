Optimized flow from schedule to service authorization:

## Why is UnitConsumption needed?

UnitConsumption provides granular tracking of actual service units used against each ServiceAuthorization. It enables:

- Accurate audit trails for compliance and billing.
- Prevention of over-utilization by enforcing authorization limits.
- Traceability of unit usage by source (e.g., service delivery, schedule shift).

## Flow Overview

1. **Schedule Creation (ScheduleEvent):**

   - Office staff create a ScheduleEvent for a patient, specifying date, time, service type, and planned units.
   - The event references the relevant ServiceType and optionally a ServiceAuthorization.

2. **Service Delivery (ServiceDelivery):**

   - When staff complete the scheduled shift, a ServiceDelivery record is created, referencing the ScheduleEvent, patient, staff, and actual units delivered.
   - The ServiceDelivery links to the correct ServiceAuthorization (based on patient, payer, service type, and date).

3. **Unit Consumption (UnitConsumption):**

   - For each completed ServiceDelivery, a UnitConsumption record is created.
   - This record logs the units used, the source (`service_delivery`), and the associated ServiceAuthorization.
   - The system aggregates UnitConsumption to update ServiceAuthorization's totalUsed, totalRemaining, etc.

4. **Authorization Enforcement:**

   - Before confirming a ServiceDelivery, the system checks the associated ServiceAuthorization for available units.
   - If units are exceeded, the delivery is flagged or rejected.

5. **Billing & Compliance:**
   - Billing logic aggregates UnitConsumption for claims.
   - Compliance/audit reporting uses UnitConsumption for traceability.

## Summary

UnitConsumption is essential for fine-grained tracking and auditability.  
The optimized flow is:  
**ScheduleEvent → ServiceDelivery → UnitConsumption → ServiceAuthorization (update) → Billing/Compliance**
