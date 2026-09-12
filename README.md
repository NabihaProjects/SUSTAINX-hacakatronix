# 🌱 SOIL IQ

### **Grid-Level Precision Fertilizer Management**

> **Every grid gets a prescription. Every application gets measured. Every decision gets explained.**

SOIL IQ is a precision-agriculture platform designed to help farmers reduce unnecessary fertilizer application while maintaining responsible nutrient management.

Instead of treating an entire farm as one homogeneous area, SOIL IQ divides farmland into intelligent spatial grids and builds a digital understanding of each grid using **soil data, crop information, fertilizer history, environmental conditions, and machine telemetry**.

The system then creates a **field-specific nutrient/application budget**, monitors fertilizer application against that recommendation, evaluates environmental conditions, and provides an explainable decision:

**CONTINUE → REDUCE → DEFER → STOP**

The result is a closed-loop approach to fertilizer management:

```text
SENSE
  ↓
LOCATE
  ↓
UNDERSTAND
  ↓
PRESCRIBE
  ↓
APPLY
  ↓
MEASURE
  ↓
COMPARE
  ↓
CONTROL
  ↓
LEARN
```

---

# 🌍 The Problem

Modern agriculture depends heavily on fertilizers to maintain productivity. The problem is not fertilizer itself — it is **inefficient, excessive, poorly timed, or non-spatial application**.

A conventional field may be treated as:

```text
Entire field
      ↓
One generalized recommendation
      ↓
Uniform application
```

But real fields are heterogeneous.

Different areas can have different:

* soil characteristics
* nutrient availability
* moisture
* crop conditions
* growth stages
* fertilizer histories
* environmental risks

This creates a major gap between:

> **What the soil actually needs**

and

> **What the machine actually applies.**

Excessive or poorly managed fertilizer use can contribute to nutrient imbalance, unnecessary input costs, nutrient losses, and long-term soil and environmental concerns.

SOIL IQ addresses this gap by connecting **field intelligence directly with fertilizer application**.

---

# 💡 Our Solution

## SOIL IQ — A Closed-Loop Precision Fertilizer Management System

SOIL IQ transforms a farm into a spatially intelligent digital environment.

### 1. 🗺️ Divide the farm into intelligent grids

A farm is divided into spatial grids.

Each grid stores its own contextual state:

* Crop
* Growth stage
* Soil type
* Soil-test data
* Soil sensor measurements
* Moisture
* pH
* EC
* N/P/K information where available
* Previous fertilizer applications
* Environmental conditions
* Nutrient budget
* Prescription status

Instead of:

> “This 10-acre farm needs X fertilizer”

SOIL IQ can reason:

> “Grid G047 requires a different application strategy from G048 because their field conditions and nutrient states differ.”

---

# 🧪 2. Soil Intelligence

SOIL IQ separates different kinds of agricultural data rather than pretending everything comes from one sensor.

### Data Sources

**Laboratory / Soil Tests**

* N
* P
* K
* pH
* EC
* Organic carbon
* Other available nutrients

**Continuous Sensors**

* Soil moisture
* Soil temperature
* pH/EC where supported
* Environmental measurements

**Historical Data**

* Previous fertilizer applications
* Crop history
* Grid history

Every measurement can be classified as:

`MEASURED` · `ESTIMATED` · `IMPORTED` · `SIMULATED` · `PROJECTED`

This makes the platform transparent about **what it knows and how it knows it**.

---

# 📊 3. Grid-Level Nutrient Budget

Each grid maintains its own nutrient/application state.

Example:

```text
GRID G047

Nitrogen
████████░░  82%

Phosphorus
██████░░░░  61%

Potassium
████░░░░░░  39%
```

The system tracks:

* recommended nutrient budget
* consumed nutrient quantity
* remaining budget
* excess application
* historical applications

Importantly, SOIL IQ does **not** use a universal “safe fertilizer limit”.

It uses:

> **Field-specific recommended nutrient budgets and application ranges**

based on the available agronomic inputs.

---

# 📐 4. Prescription Engine

SOIL IQ combines:

```text
Crop
+
Growth Stage
+
Soil State
+
Previous Applications
+
Fertilizer Formulation
+
Environmental Conditions
```

to create a **grid-specific prescription**.

A prescription contains:

* recommended fertilizer
* recommended application range
* target application
* nutrient contribution
* confidence
* environmental status
* explanation

Example:

```text
RECOMMENDED APPLICATION

NPK 19-19-19

38–44 kg/ha
TARGET: 41 kg/ha

CONFIDENCE: MEDIUM
```

Every recommendation includes an explanation of **why** it was generated.

---

# 🚜 5. Smart Sprayer Simulation

The SOIL IQ prototype includes a simulated smart sprayer.

The sprayer has a digital representation of:

* position
* speed
* heading
* fertilizer
* flow rate
* tank level
* current grid
* application rate
* machine status

As the sprayer moves across the farm:

```text
Position
   ↓
Current Grid
   ↓
Active Prescription
   ↓
Target Application
   ↓
Actual Flow
   ↓
Control Decision
```

This demonstrates how a future real machine could integrate with the system.

---

# 🎯 6. Spatial Application Control

SOIL IQ supports variable-rate application.

Different grids can have different target rates:

```text
G041 → 100%

G042 → 70%

G043 → 40%

G044 → 0%
```

The system therefore moves beyond:

> ON / OFF

toward:

> **Apply only what the current grid requires.**

The prototype simulates the entire control loop.

---

# 🌧️ 7. Environmental Intelligence

A fertilizer recommendation should not depend only on nutrient availability.

SOIL IQ also considers environmental conditions such as:

* rainfall probability
* expected rainfall
* soil moisture
* temperature
* wind
* environmental risk

Example:

```text
Prescription:
ALLOW

Environmental Risk:
HIGH

Rain probability:
87%

Expected rainfall:
31 mm

Soil moisture:
81%

FINAL DECISION:
DEFER
```

This creates an important distinction:

> **“The grid needs fertilizer” does not necessarily mean “apply fertilizer right now.”**

The system can therefore recommend:

**PROCEED → CAUTION → DEFER → BLOCK**

---

# 🧠 8. Explainable Intelligence

SOIL IQ uses intelligence for:

* anomaly detection
* trend analysis
* soil-health trajectory
* application efficiency
* scenario comparison
* recommendations
* natural-language explanations

The AI layer is deliberately separated from safety-critical control.

### Deterministic systems control:

* nutrient budget
* grid identification
* application calculation
* environmental rules
* machine control decisions

### AI assists with:

* explanation
* prediction
* anomaly interpretation
* scenario analysis
* natural-language interaction

This prevents an AI hallucination from becoming a physical machine-control decision.

---

# 🔎 9. Anomaly Detection

SOIL IQ identifies unusual behaviour in:

* soil moisture
* pH
* EC
* nutrient measurements
* fertilizer application
* flow rate
* tank behaviour
* sensor reporting
* machine performance
* environmental conditions

Example:

```text
Normal moisture:
42–45%

Current:
78%

ANOMALY DETECTED
```

The system then checks supporting context such as:

* rainfall
* irrigation
* sensor health
* recent events

rather than blindly assuming the cause.

---

# 🌱 10. Soil Health Trajectory

Instead of showing only a single score, SOIL IQ tracks change over time.

Example:

```text
Current Soil Health Index
78 / 100

Historical:
78 → 75 → 72

Projected optimized scenario:
78 → 79 → 81
```

Projected values are explicitly classified as:

> **PROJECTED / SIMULATED**

They are not presented as proven field outcomes.

---

# 🔬 11. What-If Simulation

SOIL IQ allows farmers/operators to compare possible decisions before applying them.

Example:

### Baseline

NPK 19-19-19
40 kg/ha
Apply now

### Scenario

NPK 19-19-19
30 kg/ha
Wait 24 hours

The platform compares:

* fertilizer quantity
* nutrient contribution
* budget utilization
* estimated cost
* environmental risk
* application efficiency
* projected soil-health trajectory

This turns SOIL IQ into a **decision-support platform**, not merely a reporting dashboard.

---

# 📡 12. IoT-Ready Architecture

SOIL IQ is designed around hardware abstraction so the same software architecture can eventually support real agricultural devices.

### Soil Side

```text
Soil Sensors
      ↓
LoRa / LoRaWAN
      ↓
Field Gateway
      ↓
MQTT / HTTPS
      ↓
SOIL IQ
```

### Machine Side

```text
RTK-GNSS
Flow Sensor
Tank Sensor
Machine Telemetry
      ↓
Edge Controller
      ↓
MQTT / HTTPS
      ↓
SOIL IQ
```

The current prototype uses **simulated devices**, but the architecture is designed for future hardware integration.

---

# 🔄 The SOIL IQ Closed Loop

This is the heart of the project.

```text
┌──────────────────────────┐
│       SOIL DATA          │
│ Soil Test + Sensors      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│      GRID ENGINE         │
│ Spatial Field Model      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│   PRESCRIPTION ENGINE    │
│ Nutrient Budget + Crop   │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│     SMART SPRAYER        │
│ Location + Application   │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│    ACTUAL APPLICATION    │
│ Flow + Tank + Position   │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│     CONTROL ENGINE       │
│ Continue/Reduce/Defer/   │
│ Stop                     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│       IMPACT             │
│ Fertilizer + Cost + Soil │
└──────────────────────────┘
```

---

# 📈 Measurable Impact

SOIL IQ is designed around measurable outcomes rather than awareness.

### Primary Metrics

**Fertilizer application avoided**

**Fertilizer-use efficiency**

**Application accuracy**

**Input cost impact**

**Excess application events prevented**

**Environmental defer/block events**

**Soil-health trajectory**

### Important distinction

The prototype clearly separates:

🟢 **Measured** — directly recorded
🔵 **Estimated** — calculated from available data
🟣 **Projected** — future/model output
⚪ **Simulated** — generated for demonstration

This prevents simulated hackathon results from being presented as real-world field evidence.

---

# 🌍 UN SDG Alignment

### SDG 2 — Zero Hunger

Supports more sustainable agricultural production by improving nutrient-use decision making.

### SDG 12 — Responsible Consumption and Production

Reduces unnecessary agricultural input usage through more precise application.

### SDG 13 — Climate Action

Supports environmentally responsible fertilizer timing and management.

### SDG 15 — Life on Land

Supports long-term soil management and responsible nutrient application.

> SOIL IQ is **aligned with these SDGs**; it does not claim to independently achieve them.

---

# ✅ The 5 Mandatory SustainX Questions

## 1. What specific sustainability problem are we addressing?

### **Excessive and inefficient fertilizer application leading to nutrient imbalance, unnecessary input costs, nutrient losses, and potential long-term soil and environmental degradation.**

Traditional fertilizer practices often operate at a field-wide level and may fail to account for spatial differences in soil conditions, crop requirements, application history, and environmental conditions.

SOIL IQ addresses this through **grid-level, context-aware fertilizer management**.

---

## 2. Who is the clearly identified user/community?

### Primary Users

* **Farmers**
* **Agricultural cooperatives**
* **Agricultural operators**
* **Agritech businesses**

### Secondary Users

* Agronomists
* Agricultural advisors
* Farm managers
* Agricultural equipment/service providers

The primary beneficiary is the farmer, who needs to manage fertilizer efficiently while maintaining productive agricultural operations.

---

## 3. What is our measurable sustainability impact?

Our primary measurable metric is:

### **Fertilizer Application Reduction / Avoidance**

We compare:

```text
Baseline / planned application
              vs
SOIL IQ-recommended + verified application
```

Additional metrics include:

* fertilizer quantity avoided
* fertilizer cost impact
* nutrient-use efficiency
* application accuracy
* excess-application events prevented
* environmentally deferred applications
* sensor/grid coverage
* long-term soil-health trajectory

For a real deployment, these metrics would be validated through controlled field trials.

---

## 4. What are we improving that doesn't work well enough?

Traditional fertilizer application can rely on:

* generalized recommendations
* uniform field-wide application
* historical habits
* calendar-based timing
* limited real-time verification

SOIL IQ replaces this with:

```text
Generic recommendation
        ↓
Field-specific grid prescription
        ↓
Real-time machine location
        ↓
Measured application
        ↓
Environmental check
        ↓
Dynamic control
        ↓
Verified impact
```

The critical improvement is that SOIL IQ **closes the loop between recommendation and physical application**.

It doesn't merely tell the farmer what to do.

It is designed to verify what actually happened.

---

## 5. What is the realistic path toward real-world use?

SOIL IQ is intentionally designed as a staged deployment system.

### Phase 1 — Software Prototype

* simulated farm
* virtual grids
* simulated sensors
* simulated sprayer
* prescription engine
* control engine

### Phase 2 — Controlled Sensor Pilot

Integrate:

* soil sensors
* environmental sensors
* field gateway

### Phase 3 — Machine Telemetry

Integrate:

* RTK-GNSS
* flow sensors
* tank sensors
* machine telemetry

### Phase 4 — Controlled Field Validation

Compare:

**conventional management**

vs.

**SOIL IQ-assisted management**

Measure:

* fertilizer usage
* application accuracy
* cost
* soil indicators
* environmental events
* crop output

### Phase 5 — Commercial Deployment

Expand toward:

* multiple farms
* multiple machines
* agricultural cooperatives
* agritech service providers
* large-scale SaaS deployment

Physical deployment would require appropriate **agronomic validation, hardware testing, safety engineering, operator procedures, and regulatory compliance**.

---

# 🧑‍🌾 Why SOIL IQ Is Different

SOIL IQ is not simply:

❌ a fertilizer calculator
❌ a soil-health dashboard
❌ a weather application
❌ an AI agriculture chatbot
❌ an awareness platform

It combines:

### 🧪 Soil Intelligence

Understanding the condition of the field.

### 🗺️ Spatial Intelligence

Understanding **where** the machine is.

### 📐 Prescription Intelligence

Understanding **what the grid should receive**.

### 🚜 Machine Intelligence

Understanding **what is actually being applied**.

### 🌧️ Environmental Intelligence

Understanding **whether it is appropriate to apply now**.

### 🔄 Closed-Loop Control

Turning those insights into:

**CONTINUE → REDUCE → DEFER → STOP**

### 📊 Impact Intelligence

Measuring what changed.

---

# 🏗️ Technology Stack

### Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* Mapbox

### Backend

* Next.js API / Server Actions
* TypeScript
* Domain/service architecture

### Database

* PostgreSQL
* Prisma ORM

### Data & Validation

* Zod
* typed domain contracts

### IoT Architecture

* MQTT-ready telemetry layer
* LoRa/LoRaWAN-ready architecture
* device abstraction
* edge-controller abstraction
* sensor simulation

### Intelligence

* deterministic agronomic rule engine
* anomaly detection
* statistical trend analysis
* explainable intelligence
* optional LLM provider

### Analytics

* Recharts
* spatial grid visualization
* real-time operational dashboards
* impact analytics

---

# 🧠 Core Architecture

```text
                 SOIL IQ
                    │
        ┌───────────┴───────────┐
        │                       │
   SOIL LAYER              MACHINE LAYER
        │                       │
  Soil Tests                 RTK-GNSS
  Soil Sensors               Flow Sensor
  Environment                Tank Sensor
        │                       │
        └───────────┬───────────┘
                    ↓
             TELEMETRY LAYER
                    ↓
              GRID ENGINE
                    ↓
          PRESCRIPTION ENGINE
                    ↓
         ENVIRONMENTAL ENGINE
                    ↓
             CONTROL ENGINE
                    ↓
          APPLICATION HISTORY
                    ↓
          INTELLIGENCE ENGINE
                    ↓
             IMPACT ENGINE
                    ↓
          SOIL IQ DASHBOARD
```

---

# 🔐 Trust, Safety & Scientific Integrity

SOIL IQ is designed around a simple principle:

> **The system must never pretend to know something it does not actually know.**

Therefore:

* soil-test data is distinguished from sensor data
* measured values are distinguished from estimates
* projections are distinguished from real outcomes
* simulated results are clearly labelled
* prescriptions are explainable
* control decisions are deterministic
* AI cannot directly override safety-critical machine control
* historical decisions are auditable
* every major recommendation has a traceable data source

### SOIL IQ does not claim to:

* replace laboratory soil testing
* guarantee crop yield
* establish universal fertilizer limits
* guarantee fertilizer savings
* replace qualified agronomic expertise
* certify autonomous agricultural machinery

The prototype demonstrates the **technology architecture and decision loop**. Real-world performance must be validated through controlled field trials.

---

# 🚀 Current Prototype Status

### Implemented / Prototyped

✅ Multi-tenant SaaS architecture
✅ Farm and field management
✅ Spatial grid generation
✅ Grid-level nutrient budgets
✅ Soil data architecture
✅ Fertilizer formulation model
✅ Prescription engine
✅ Explainable recommendations
✅ Sensor simulation
✅ Telemetry architecture
✅ Smart sprayer simulation
✅ Grid-aware application tracking
✅ Variable-rate application logic
✅ Environmental risk engine
✅ Weather-aware defer/block logic
✅ Anomaly detection
✅ Soil-health trajectory
✅ What-If simulation
✅ Impact analytics
✅ Alerts and audit trails
✅ Hardware-ready architecture
✅ PWA/mobile field experience
✅ Soil-test import and validation architecture
✅ Judge/demo mode

### Current limitation

The current hackathon implementation uses **simulated sensors, simulated machine telemetry, and prototype agronomic parameters**.

The next stage is controlled field validation with real soil-test data, sensor hardware, machine telemetry, and qualified agronomic oversight.

---

# 🏆 The SOIL IQ Vision

Agriculture does not need another dashboard that tells farmers:

> “Your soil needs attention.”

It needs systems that can connect:

**what the soil needs**

with

**what the machine applies**

and

**what the environment allows.**

SOIL IQ is built around that connection.

### **Sense. Prescribe. Apply. Verify. Optimize.**

> ## **SOIL IQ**
>
> ### **Every grid gets a prescription. Every application gets measured. Every decision gets explained.**
