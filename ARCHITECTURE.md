# SOIL IQ — System Architecture Specification

## 1. Executive Summary

**SOIL IQ** ("Know Your Soil. Control Your Inputs. Protect Your Future.") is a precision-agriculture SaaS platform that closes the physical-to-digital operational loop:

$$\text{SOIL SENSORS} \longrightarrow \text{SPATIAL GRIDS} \longrightarrow \text{PRESCRIPTION} \longrightarrow \text{RTK-GNSS} \longrightarrow \text{FLOW TOTALIZATION} \longrightarrow \text{CONTROL ENGINE} \longrightarrow \text{ACTUATOR} \longrightarrow \text{IMPACT}$$

SOIL IQ connects what the soil needs with what the machine actually applies. Rather than generating a static recommendation, SOIL IQ continuously monitors machine location and flow telemetry, compares actual application against the grid's prescription, and executes real-time control actions (`CONTINUE`, `REDUCE`, `DEFER`, `STOP`).

---

## 2. Three-Layer Architecture

```
+-------------------------------------------------------------------------------+
|                             EXPERIENCE LAYER                                  |
|  * Executive SaaS Dashboard (/dashboard)     * Judge Presentation (/judge)    |
|  * Field Operator PWA (/mobile)             * Red-Team Claims (/validation)   |
|  * Hardware Diagnostics (/devices/diag)     * User Trust Center (/trust)      |
+-------------------------------------------------------------------------------+
                                      |
                                HTTPS / SSE
                                      v
+-------------------------------------------------------------------------------+
|                         PLATFORM DECISION LAYER                               |
|  * Spatial Grid Resolution (Point-in-polygon)                                 |
|  * Agronomic Prescription & N-P-K Budget Engine                               |
|  * Environmental Weather Risk & Riparian Lockouts                             |
|  * Deterministic 10-Tier Safety Precedence Control Engine                     |
|  * Audit Logging, Idempotency & Cryptographic Ledger                          |
+-------------------------------------------------------------------------------+
                                      |
                             MQTT (TLS) / REST
                                      v
+-------------------------------------------------------------------------------+
|                            LOCAL FIELD LAYER                                  |
|  * In-situ soil probes & microclimate nodes (LoRaWAN 868/915 MHz)             |
|  * Dual-frequency RTK-GNSS receivers (±2.4 cm accuracy)                      |
|  * Electromagnetic pulse flow meters & chemical totalizers                    |
|  * Hydrostatic chemical tank sensors (4-20mA analog)                          |
|  * Machine Edge Gateway with active prescription offline cache                |
|  * Solenoid boom section valves & PWM pump throttles                          |
+-------------------------------------------------------------------------------+
```

---

## 3. Closed-Loop Control Precedence

Safety is strictly deterministic. The control engine enforces an unambiguous 10-tier safety hierarchy:

1. `EMERGENCY_STOP` &bull; Physical E-stop or operator panic button engaged.
2. `MANUAL_OVERRIDE` &bull; Operator manual toggle active.
3. `INVALID_POSITION` &bull; GNSS position lost (`NO_FIX`) or machine outside mapped fields.
4. `MACHINE_FAULT` &bull; Flow meter offline or nozzle pressure anomaly.
5. `ENVIRONMENTAL_BLOCK` &bull; Imminent rainfall (&ge;75%) or high wind chemical drift.
6. `NO_ACTIVE_PRESCRIPTION` &bull; Target grid has no approved prescription.
7. `NUTRIENT_BUDGET_EXCEEDED` &bull; Consumed nitrogen &ge; 100% of seasonal budget limit.
8. `TANK_CONDITION` &bull; Chemical tank empty (&le;3% &rarr; STOP; &le;20% &rarr; REDUCE).
9. `RATE_CONTROL` &bull; Flow exceeds prescription target by &gt;15% or budget caution &gt;80%.
10. `CONTINUE` &bull; Nominal application within &plusmn;5% tolerance.

---

## 4. Edge vs. Cloud Allocation

| Subsystem / Function | Execution Location | Rationale |
| :--- | :--- | :--- |
| **Millisecond Valve Actuation** | Edge Controller (`EdgeGateway`) | Zero dependence on internet latency during high-speed spraying. |
| **Active Prescription Caching** | Local Edge Flash Memory | Sprayer operates autonomously even in total rural cellular deadzones. |
| **Offline Telemetry Buffering** | Local Edge FIFO Buffer | Prevents loss of continuous flow data during cellular outages. |
| **Spatial Grid Boundary Creation** | Cloud Platform | Complex polygon calculations, satellite imagery overlay, and farm planning. |
| **Agronomic Budget Generation** | Cloud Decision Engine | Multi-season soil tests, crop rotation schedules, and historical ledgers. |
| **AI Decision Explanation** | Cloud LLM Pipeline | Explainable audit logs, chat assistance, and What-If scenario simulations. |
