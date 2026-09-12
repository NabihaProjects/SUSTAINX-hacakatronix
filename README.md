Absolutely. Below is a **complete, GitHub-ready README.md** for SOIL IQ that explains the project, architecture, features, MQTT/mobile simulation, setup, demo flow, safety limitations, and future roadmap.

You can create a file named **`README.md`** in the root of your repository and paste this in.

````markdown
# 🌱 SOIL IQ

### Grid-Level Precision Fertilizer Management

> **Every grid gets a prescription. Every application gets measured. Every decision gets explained.**

SOIL IQ is a precision-agriculture SaaS platform designed to reduce unnecessary fertilizer application by connecting **soil intelligence, spatial grid mapping, crop requirements, environmental conditions, and real-time machine telemetry** into one closed-loop decision system.

Instead of giving a farmer one fertilizer recommendation for an entire field, SOIL IQ divides the field into intelligent grids and determines what each grid needs.

The system then connects those grid-specific recommendations to a simulated or real smart sprayer.

As the sprayer moves through the field:

**Locate → Understand → Prescribe → Apply → Measure → Compare → Control → Learn**

---

# 📌 Table of Contents

- [Problem](#-problem)
- [Solution](#-solution)
- [Core Innovation](#-core-innovation)
- [How SOIL IQ Works](#-how-soil-iq-works)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [IoT Architecture](#-iot-architecture)
- [MQTT + Mobile Demo](#-mqtt--mobile-demo)
- [Grid Intelligence](#-grid-intelligence)
- [Prescription Engine](#-prescription-engine)
- [Smart Sprayer](#-smart-sprayer)
- [Environmental Intelligence](#-environmental-intelligence)
- [AI and Explainability](#-ai-and-explainability)
- [Impact Measurement](#-impact-measurement)
- [SaaS Architecture](#-saas-architecture)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Demo Mode](#-demo-mode)
- [MQTT Demo](#-mqtt-demo)
- [Mobile Simulator](#-mobile-simulator)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Hardware Integration](#-hardware-integration)
- [Scientific Guardrails](#-scientific-guardrails)
- [Limitations](#-limitations)
- [Future Roadmap](#-future-roadmap)
- [Sustainability Alignment](#-sustainability-alignment)
- [Why SOIL IQ](#-why-soil-iq)
- [Team](#-team)
- [License](#-license)

---

# 🌍 Problem

Fertilizer application is often based on generalized recommendations or uniform application practices.

However, a single field can contain significant variation in:

- soil nutrient availability
- soil moisture
- pH
- crop condition
- crop growth stage
- previous fertilizer application
- environmental conditions
- nutrient requirements

At the same time, conventional systems may not continuously verify:

> **Where the machine is, what that part of the field needs, and how much fertilizer is actually being applied.**

This can lead to:

- unnecessary fertilizer application
- nutrient imbalance
- inefficient input use
- avoidable input costs
- nutrient-loss risk
- poor spatial management
- insufficient long-term soil monitoring

The problem is therefore not simply:

> "Farmers need fertilizer recommendations."

The deeper problem is:

> **Farmers need a system that connects field-specific nutrient requirements with the fertilizer actually being applied.**

---

# 💡 Solution

## SOIL IQ

SOIL IQ converts a farm into a **spatially intelligent digital field**.

The farm is divided into grids.

Each grid can have its own:

- crop
- growth stage
- soil condition
- nutrient baseline
- fertilizer history
- environmental state
- recommendation
- nutrient budget
- application history

The platform then synchronizes this grid information with a smart sprayer.

The machine knows:

### WHERE AM I?
RTK-GNSS / positioning

### WHAT DOES THIS GRID NEED?
SOIL IQ prescription engine

### HOW MUCH AM I APPLYING?
Flow/application telemetry

### IS IT APPROPRIATE TO APPLY NOW?
Environmental intelligence

### WHAT SHOULD THE MACHINE DO?
Control engine

The result is a closed-loop fertilizer management system.

---

# 🚀 Core Innovation

SOIL IQ is not simply:

- a fertilizer calculator
- a soil-health dashboard
- an AI chatbot
- a weather application
- a farm-management dashboard

The key innovation is the integration of:

```text
SOIL INTELLIGENCE
        ↓
GRID-SPECIFIC PRESCRIPTION
        ↓
MACHINE LOCATION
        ↓
ACTUAL APPLICATION MEASUREMENT
        ↓
ENVIRONMENTAL VALIDATION
        ↓
REAL-TIME CONTROL
        ↓
IMPACT MEASUREMENT
````

### The central principle

> **SOIL IQ connects what the soil needs with what the machine actually applies — grid by grid, in real time.**

---

# 🔄 How SOIL IQ Works

## 1. Farm Setup

The user creates:

* Organization
* Farm
* Fields
* Crops
* Field boundaries

Example:

```text
Farm:
Green Valley Farm

Area:
10 acres

Fields:
5

Field Area:
2 acres each

Crops:
Rice
Tomato
Maize
Cotton
Groundnut
```

---

## 2. Grid Creation

Each field is divided into smaller spatial grids.

Example:

```text
┌───────┬───────┬───────┬───────┐
│ G001  │ G002  │ G003  │ G004  │
├───────┼───────┼───────┼───────┤
│ G005  │ G006  │ G007  │ G008  │
├───────┼───────┼───────┼───────┤
│ G009  │ G010  │ G011  │ G012  │
└───────┴───────┴───────┴───────┘
```

Every grid becomes a spatial unit for analysis.

---

# 🧪 Grid Intelligence

Every grid can contain:

```text
Grid: G047

Crop:
Rice

Growth Stage:
Tillering

Soil:
Red Soil

pH:
6.4

Moisture:
42%

EC:
1.1

N:
Available / Estimated

P:
Available / Estimated

K:
Available / Estimated

Previous Fertilizer:
NPK + Urea

Nutrient Budget:
N / P / K

Prescription:
Field-specific

Environmental Risk:
Low / Medium / High
```

SOIL IQ distinguishes between:

* measured
* tested
* estimated
* simulated
* projected

data.

---

# 🧾 Soil Data Sources

SOIL IQ supports multiple sources.

### Laboratory / Soil Test

Used to establish nutrient baselines.

### Continuous Sensor Data

Used for environmental/contextual measurements such as:

* soil moisture
* soil temperature
* EC
* pH where supported

### Historical Applications

Used to understand previous nutrient inputs.

### Estimated Spatial Data

Used where direct soil measurements are unavailable.

### Simulation Data

Used for the hackathon demonstration.

This separation is important because a prototype should not pretend that every low-cost sensor directly measures laboratory-grade nutrient availability.

---

# 🧠 Prescription Engine

SOIL IQ calculates a field/grid-specific prescription using:

```text
Crop
+
Growth Stage
+
Soil Baseline
+
Current Sensor State
+
Previous Applications
+
Fertilizer Formulation
+
Environmental Conditions
        ↓
Prescription
```

The prescription may contain:

* recommended product
* minimum application
* target application
* maximum recommended range
* nutrient contribution
* confidence
* explanation

Example:

```text
Grid:
G047

Fertilizer:
NPK 19-19-19

Recommended Range:
38–44 kg/ha

Target:
41 kg/ha

Confidence:
MEDIUM

Status:
READY
```

### Important

SOIL IQ does **not** claim a universal fertilizer "safe limit."

It uses:

* field-specific nutrient budgets
* recommended application ranges
* target application levels

Prototype agronomic values are explicitly treated as configurable and require real-world agronomic validation before deployment.

---

# 📊 Nutrient Ledger

Each grid maintains a nutrient budget.

Example:

```text
G047

N:
Recommended = 100 units
Consumed = 72 units
Remaining = 28 units

P:
Recommended = 60 units
Consumed = 56 units
Remaining = 4 units

K:
Recommended = 80 units
Consumed = 40 units
Remaining = 40 units
```

If additional fertilizer is applied:

```text
Consumed ↑
Remaining ↓
```

If the recommended budget is exceeded:

```text
Remaining = 0
Excess = recorded separately
```

SOIL IQ never hides excess application.

---

# 🚜 Smart Sprayer

SOIL IQ models the fertilizer machine using:

* RTK-GNSS
* flow/application sensor
* tank-level sensor
* speed
* heading
* fertilizer formulation
* application rate
* machine status

The system continuously determines:

```text
Where is the machine?
        ↓
Which grid?
        ↓
Which prescription?
        ↓
How much remains?
        ↓
How much is actually being applied?
        ↓
What should the machine do?
```

---

# 📍 Grid Detection

Machine position is mapped against field/grid geometry.

Conceptually:

```text
RTK Position
      ↓
Latitude + Longitude
      ↓
Field Boundary
      ↓
Grid Polygon
      ↓
Current Grid ID
```

Example:

```text
Machine:
17.12345, 80.54321

Resolved Grid:
G047
```

SOIL IQ uses spatial geometry rather than simply choosing the nearest grid center.

---

# 📡 MQTT Communication

MQTT provides the communication layer between:

* mobile simulator
* simulated soil nodes
* sprayer telemetry
* SOIL IQ backend
* dashboard

Example topic:

```text
soil-iq/demo/sprayer/SPRAYER-01/telemetry
```

Example message:

```json
{
  "version": "1.0",
  "deviceId": "SPRAYER-01",
  "timestamp": "2026-09-12T08:00:00Z",
  "type": "telemetry",
  "payload": {
    "latitude": 17.12345,
    "longitude": 80.54321,
    "speed": 4.2,
    "heading": 90,
    "flowRate": 12.5,
    "tankLevel": 72,
    "fertilizer": "NPK-19-19-19"
  }
}
```

SOIL IQ receives this through the telemetry ingestion layer.

---

# 📱 Mobile MQTT Demonstration

A mobile device can act as a **simulated smart sprayer**.

The mobile publishes:

* location
* speed
* heading
* flow
* tank
* fertilizer
* device ID
* timestamp

via:

**MQTT over WebSockets**

The laptop runs the SOIL IQ dashboard.

Architecture:

```text
📱 MOBILE
Simulated Sprayer
       │
       │ MQTT
       ▼
☁️ MQTT BROKER
       │
       ▼
SOIL IQ MQTT CONSUMER
       │
       ▼
GRID RESOLUTION
       │
       ▼
PRESCRIPTION ENGINE
       │
       ▼
CONTROL ENGINE
       │
       ▼
💻 LAPTOP
SOIL IQ DASHBOARD
```

---

# 🧪 Simulated Soil Nodes

The hackathon prototype can also simulate distributed soil nodes.

Example:

```text
NODE-G01
Moisture = 40%
pH = 6.4

NODE-G02
Moisture = 62%
pH = 6.1

NODE-G03
Moisture = 78%
pH = 5.9
```

These can publish telemetry through MQTT as well.

Example topics:

```text
soil-iq/demo/soil/G01/telemetry
soil-iq/demo/soil/G02/telemetry
soil-iq/demo/soil/G03/telemetry
```

No physical agricultural hardware is required for the prototype.

---

# 🎯 Example Live Scenario

Suppose a field contains:

| Grid | Budget | Consumed | Remaining | Status     |
| ---- | -----: | -------: | --------: | ---------- |
| G01  |    100 |       25 |        75 | Optimal    |
| G02  |    100 |       65 |        35 | Caution    |
| G03  |    100 |       95 |         5 | Near Limit |
| G04  |    100 |      100 |         0 | Blocked    |

When the mobile/sprayer enters each grid:

### G01

```text
Remaining: 75
Decision: CONTINUE
```

### G02

```text
Remaining: 35
Decision: REDUCE
Application Rate: 60%
```

### G03

```text
Remaining: 5
Decision: STOP
```

### G04

```text
Remaining: 0
Decision: STOP
Reason:
Grid budget exhausted
```

These are demonstration values and are not universal agronomic limits.

---

# 🌧️ Environmental Intelligence

SOIL IQ does not ask only:

> “Is there fertilizer budget remaining?”

It also asks:

> **“Is this an appropriate time to apply?”**

Environmental inputs include:

* rainfall probability
* expected rainfall
* soil moisture
* temperature
* wind
* humidity
* forecast
* crop stage

Example:

```text
Nutrient Budget:
Available

Prescription:
Active

Rain Probability:
87%

Expected Rainfall:
31 mm

Soil Moisture:
81%

Environmental Risk:
HIGH

Final Decision:
DEFER
```

The system can therefore prevent application based on environmental conditions even when the nutrient budget has not been exhausted.

---

# ⚙️ Control Engine

The control engine uses deterministic rules.

Priority:

```text
EMERGENCY STOP
      ↓
MANUAL OVERRIDE
      ↓
INVALID POSITION
      ↓
MACHINE FAULT
      ↓
ENVIRONMENTAL BLOCK
      ↓
NO ACTIVE PRESCRIPTION
      ↓
NUTRIENT BUDGET EXCEEDED
      ↓
LOW TANK
      ↓
RATE CONTROL
      ↓
CONTINUE
```

Possible decisions:

```text
CONTINUE
REDUCE
DEFER
STOP
MANUAL_OVERRIDE
EMERGENCY_STOP
```

Every decision stores:

* reason
* evidence
* timestamp
* grid
* sprayer
* prescription
* environmental state
* nutrient state

---

# 🧠 AI and Explainability

AI is deliberately **not responsible for safety-critical machine control**.

AI is used for:

* explanations
* anomaly detection
* trend analysis
* scenario interpretation
* summaries
* What-If analysis
* natural-language assistance

Example:

> **Why did SOIL IQ stop the sprayer?**

The system can explain:

1. Sprayer entered G047.
2. G047 had an active prescription.
3. Remaining application budget was low.
4. Environmental risk increased.
5. Heavy rainfall was forecast.
6. Final control decision became DEFER.

This explanation is generated from the actual system event chain.

---

# 🔍 Anomaly Detection

SOIL IQ can detect:

* sudden soil-moisture changes
* sensor spikes
* sensor flatlines
* abnormal application rates
* unexpected flow behavior
* machine anomalies
* repeated over-application
* environmental anomalies

Supported prototype approaches:

* threshold detection
* moving averages
* rate-of-change
* z-score
* flatline detection
* spike detection

---

# 🔮 What-If Simulation

SOIL IQ allows users to compare scenarios.

Example:

### Baseline

```text
40 kg/ha
Apply now
```

### Scenario

```text
30 kg/ha
Wait 24 hours
```

Compare:

* fertilizer quantity
* nutrient contribution
* budget utilization
* environmental risk
* estimated cost
* projected soil-health trajectory
* application outcome

All scenario results are explicitly classified as:

**PROJECTED / SIMULATED**

unless based on actual data.

---

# 🌱 Soil Health Intelligence

SOIL IQ can generate a prototype composite soil-health index based on configurable dimensions such as:

* nutrient balance
* pH condition
* EC
* organic carbon
* moisture stability
* fertilizer application history
* data quality

Example:

```text
SOIL HEALTH INDEX

78 / 100

Nutrient Balance      82
pH                    88
Organic Carbon        64
EC                    79
Application History   72
```

This is a **prototype composite indicator**, not an official scientific soil-health standard.

---

# 📈 Impact Measurement

SOIL IQ focuses on measurable outcomes.

### Primary metrics

* fertilizer applied
* fertilizer avoided
* application accuracy
* excess application events prevented
* estimated cost impact
* environmental deferrals

### Secondary metrics

* nutrient-use efficiency
* soil-health trend
* sensor coverage
* data quality
* machine utilization

Every metric is classified as:

### MEASURED

Directly recorded.

### ESTIMATED

Calculated from measured data.

### PROJECTED

Future/model result.

### SIMULATED

Hackathon-generated result.

---

# 🧾 Soil Data Management

SOIL IQ supports soil-test records in addition to continuous sensor data.

Users can import:

* CSV
* soil-test records
* laboratory measurements
* historical data

Nutrients may include:

* N
* P
* K
* S
* Zn
* Fe
* Mn
* B

Data is validated and versioned.

The system maintains:

```text
Soil Report
    ↓
Soil Sample
    ↓
Measurement
    ↓
Validated Baseline
    ↓
Grid State
    ↓
Prescription
```

This gives every major agronomic value a traceable source.

---

# 🔐 Data Lineage

For every important value, SOIL IQ can answer:

> **Where did this value come from?**

Example:

```text
Grid:
G047

P:
44 kg/ha

Source:
Lab Report SR-2026-014

Sample:
S-047

Collected:
2026-08-28

Validated:
2026-08-30

Baseline:
BL-002 v2
```

---

# 🏢 SaaS Architecture

SOIL IQ is designed as a multi-tenant SaaS platform.

Hierarchy:

```text
Organization
    ↓
Farm
    ↓
Field
    ↓
Grid
```

Users are assigned roles.

Supported roles:

* OWNER
* ADMIN
* FARM_MANAGER
* OPERATOR
* AGRONOMIST
* VIEWER

Every resource is organization-scoped.

---

# 👥 User Workflows

## Farmer / Operator

```text
Login
→ View farm
→ View current grid
→ See prescription
→ Monitor sprayer
→ Receive alert
→ Add field note
→ Complete task
```

## Agronomist

```text
Login
→ Review soil data
→ Validate baseline
→ Review low-confidence prescription
→ Approve/reject
→ Add expert note
```

## Administrator

```text
Login
→ Manage organization
→ Manage users
→ Manage devices
→ Configure policies
→ Review analytics
→ Manage pilots
```

---

# 📱 PWA / Mobile Experience

SOIL IQ also supports a mobile-first operator experience.

Mobile features include:

* farm map
* current grid
* prescription
* sensor state
* machine status
* alerts
* tasks
* field notes
* photo evidence
* offline field mode

The mobile application uses the same backend and domain model as the desktop SaaS platform.

---

# 📡 Offline Architecture

The platform is designed for agricultural environments where connectivity may be unreliable.

The intended architecture is:

```text
CLOUD
   ↕
EDGE CONTROLLER
   ↕
MACHINE / SENSORS
```

The edge layer can cache:

* active prescription
* grid map
* control policy
* recent environmental state

Telemetry can synchronize after connectivity is restored.

The current prototype simulates this architecture.

---

# 🧰 Hardware-Ready Architecture

SOIL IQ is designed so simulation can eventually be replaced with real devices.

### Soil

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

### Sprayer

```text
RTK-GNSS
Flow Meter
Tank Sensor
Speed
↓
Edge Controller
↓
MQTT / HTTPS
↓
SOIL IQ
```

### Control

```text
SOIL IQ Decision Engine
↓
Edge Controller
↓
Valve / Pump Controller
```

The current project does not claim certified autonomous machinery control.

---

# 🧱 System Architecture

```text
                    SOIL IQ
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      SOIL           MACHINE      ENVIRONMENT
        │              │              │
        ↓              ↓              ↓
 Sensors /         RTK / Flow      Weather /
 Soil Tests        / Tank           Environment
        │              │              │
        └──────────────┼──────────────┘
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
               APPLICATION EVENTS
                       ↓
               NUTRIENT LEDGER
                       ↓
               IMPACT ANALYTICS
                       ↓
                AI / INSIGHTS
```

---

# 🛠️ Technology Stack

## Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* Mapbox GL JS
* Recharts

## Backend

* Next.js server-side APIs
* Server Actions
* Domain/service architecture
* Zod validation

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* Auth.js

## IoT

* MQTT
* MQTT over WebSockets
* LoRa/LoRaWAN-ready architecture
* Device abstraction layer
* Telemetry ingestion

## Realtime

* Event-driven architecture
* WebSocket-compatible realtime layer

## Simulation

* Soil sensor simulator
* Weather simulator
* Smart sprayer simulator
* RTK simulation
* Flow-meter simulation
* Tank simulation

## Intelligence

* deterministic rule engine
* statistical prediction
* anomaly detection
* optional LLM explanation provider

---

# 📁 Project Structure

A typical SOIL IQ structure:

```text
soil-iq/
│
├── app/
│   ├── dashboard/
│   ├── farms/
│   ├── fields/
│   ├── grids/
│   ├── prescriptions/
│   ├── monitoring/
│   ├── sprayers/
│   ├── sensors/
│   ├── analytics/
│   ├── alerts/
│   ├── simulations/
│   ├── pilots/
│   ├── validation/
│   ├── settings/
│   ├── judge/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── maps/
│   ├── charts/
│   ├── grid/
│   ├── sprayer/
│   ├── sensors/
│   ├── alerts/
│   └── dashboard/
│
├── services/
│   ├── farmService
│   ├── fieldService
│   ├── gridService
│   ├── prescriptionService
│   ├── nutrientBudgetService
│   ├── telemetryService
│   ├── sprayerService
│   ├── environmentalDecisionService
│   ├── controlService
│   ├── impactService
│   └── intelligenceService
│
├── domain/
│   ├── grid/
│   ├── prescription/
│   ├── nutrients/
│   ├── sensors/
│   ├── sprayer/
│   ├── environment/
│   └── intelligence/
│
├── lib/
│   ├── auth/
│   ├── mqtt/
│   ├── map/
│   ├── validation/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│
├── tests/
│
├── .env.example
├── ARCHITECTURE.md
├── SECURITY.md
├── DATA_MODEL.md
├── AGRO_DATA.md
├── package.json
└── README.md
```

The exact structure may vary depending on implementation.

---

# ⚙️ Getting Started

## Prerequisites

Install:

* Node.js 20+
* npm / pnpm / yarn
* PostgreSQL
* Git

Optional:

* MQTT broker
* Mapbox account
* LLM provider API key
* Weather API key

---

# 📥 Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd soil-iq
```

Install dependencies:

```bash
npm install
```

or:

```bash
pnpm install
```

---

# 🔐 Environment Variables

Create:

```text
.env.local
```

Example:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/soil_iq"

# Authentication
AUTH_SECRET="replace-with-a-secure-secret"
AUTH_URL="http://localhost:3000"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"

# MQTT
MQTT_BROKER_URL="wss://your-broker-url"
MQTT_USERNAME="your-mqtt-username"
MQTT_PASSWORD="your-mqtt-password"

# Optional LLM
LLM_API_KEY=""

# Optional weather provider
WEATHER_API_KEY=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

Never commit:

```text
.env
.env.local
.env.production
```

to GitHub.

Use `.env.example` instead.

---

# 🗄️ Database Setup

Run Prisma generation:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed development/demo data:

```bash
npm run db:seed
```

or:

```bash
npx prisma db seed
```

Inspect the database:

```bash
npx prisma studio
```

---

# ▶️ Running Locally

Start the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Demo Mode

SOIL IQ contains a deterministic demonstration environment.

Demo mode can simulate:

* farms
* grids
* soil nodes
* sensor telemetry
* sprayer movement
* RTK position
* fertilizer flow
* tank level
* environmental events
* control decisions
* alerts
* impact calculations

Use:

```text
/judge
```

or the application's dedicated demo entry point.

---

# 🚜 Recommended Demo Scenario

Start with:

```text
Green Valley Farm
10 acres
5 fields
```

Configure several grids:

```text
G01 → Optimal
G02 → Caution
G03 → Near Limit
G04 → Blocked
```

Start the smart sprayer simulation.

The machine should:

```text
G01
↓
CONTINUE

G02
↓
REDUCE

G03
↓
STOP

G04
↓
BLOCKED
```

Then trigger a weather event:

```text
Heavy rain forecast
+
high soil moisture
↓
Environmental risk HIGH
↓
DEFER
```

Finally open:

* alert
* control explanation
* impact analytics
* What-If simulator

---

# 📱 MQTT Mobile Demo

For the hackathon, a mobile phone can simulate the smart sprayer.

Open the SOIL IQ mobile simulator on a phone.

The mobile publishes MQTT telemetry such as:

```json
{
  "deviceId": "SPRAYER-01",
  "latitude": 17.12345,
  "longitude": 80.54321,
  "speed": 4.2,
  "heading": 90,
  "flowRate": 12.5,
  "tankLevel": 72
}
```

MQTT sends this through the broker.

SOIL IQ then:

```text
MQTT
↓
Telemetry Ingestion
↓
Grid Resolution
↓
Prescription Lookup
↓
Control Engine
↓
Laptop Dashboard
```

This demonstrates location tracking and real-time communication without requiring physical agricultural machinery.

---

# 📡 MQTT Topics

Example:

### Sprayer telemetry

```text
soil-iq/demo/sprayer/SPRAYER-01/telemetry
```

### Sprayer status

```text
soil-iq/demo/sprayer/SPRAYER-01/status
```

### Sprayer commands

```text
soil-iq/demo/sprayer/SPRAYER-01/command
```

### Soil telemetry

```text
soil-iq/demo/soil/G047/telemetry
```

### Acknowledgements

```text
soil-iq/demo/sprayer/SPRAYER-01/ack
```

Actual topic conventions may vary by deployment.

---

# 📍 Mobile Location Simulation

Two modes are supported conceptually.

## Simulated Route

The phone follows a predefined virtual route:

```text
G01
 ↓
G02
 ↓
G03
 ↓
G04
```

This is the recommended hackathon mode because it is deterministic.

## Real Phone GPS

The phone can optionally use browser/device location.

The location is converted into:

```text
latitude
longitude
↓
field
↓
grid
```

Real GPS accuracy may vary, so this mode should be considered optional for demonstrations.

---

# 🔌 Hardware Integration

SOIL IQ is hardware-ready but the hackathon implementation is primarily simulated.

Potential future integration:

## Soil Sensors

```text
Sensor
↓
LoRa/LoRaWAN
↓
Gateway
↓
MQTT
↓
SOIL IQ
```

## Sprayer

```text
RTK-GNSS
+
Flow Meter
+
Tank Sensor
+
Speed
↓
Edge Controller
↓
MQTT
↓
SOIL IQ
```

## Control

```text
SOIL IQ
↓
Edge Control Decision
↓
Valve / Pump Controller
```

---

# 🧠 Why Edge Computing?

Critical physical control should not depend entirely on the cloud.

The intended production architecture is:

```text
Cloud
  ↕
Edge Controller
  ↕
Machine
```

The edge controller can cache:

* active prescriptions
* field/grid map
* control policy
* recent environmental state

The cloud handles:

* analytics
* storage
* historical data
* reporting
* user management
* model updates

The current project simulates this architecture.

---

# 🧪 Testing

Run lint:

```bash
npm run lint
```

Run type checking:

```bash
npm run typecheck
```

Run unit tests:

```bash
npm test
```

Run production build:

```bash
npm run build
```

If available:

```bash
npm run test:e2e
```

---

# ✅ Recommended Test Scenarios

The system should be tested against:

### Normal application

```text
Prescription active
+
Budget available
+
Environment safe
→ CONTINUE
```

### Near threshold

```text
Budget approaching maximum
→ REDUCE
```

### Budget exhausted

```text
Remaining budget = 0
→ STOP
```

### Heavy rain

```text
High rainfall risk
→ DEFER
```

### No prescription

```text
No active prescription
→ STOP
```

### Invalid GPS

```text
Position unavailable
→ SAFE STOP
```

### Tank empty

```text
Tank = 0
→ STOP
```

### Emergency stop

```text
Emergency stop
→ machine state STOPPED
```

### Realtime failure

```text
MQTT/realtime disconnected
→ show degraded/offline state
```

---

# 🔒 Security

SOIL IQ implements a multi-tenant architecture.

Each organization's resources are isolated.

Protected resources include:

* farms
* fields
* grids
* sensors
* sprayers
* telemetry
* prescriptions
* alerts
* analytics
* pilots
* reports

Server-side authorization is required.

Device communication is designed around device identity and authenticated telemetry.

Physical machine control is protected behind explicit safety gates.

---

# ⚠️ Important Scientific Guardrails

SOIL IQ intentionally separates:

### Measured

Direct sensor/device/lab data.

### Estimated

Values calculated from available data.

### Projected

Future/model-based outputs.

### Simulated

Hackathon demonstration data.

This distinction is critical.

SOIL IQ does **not** claim that:

* a universal fertilizer safe limit exists
* every soil sensor can directly measure all nutrients
* AI can replace agronomists
* fertilizer reduction automatically increases yield
* simulated savings represent field-tested results
* the prototype is certified autonomous agricultural machinery

Actual deployment requires:

* agronomic validation
* field testing
* hardware testing
* safety engineering
* regulatory compliance
* operator training

---

# 🌾 Real-World Validation Roadmap

## Phase 1 — Software Prototype

Current stage:

```text
Simulated soil nodes
+
simulated sprayer
+
MQTT
+
grid engine
+
control engine
```

## Phase 2 — Hardware Bench Test

Connect:

* real sensor
* real flow meter
* real RTK device
* edge controller

without controlling a real agricultural machine.

## Phase 3 — Controlled Field Pilot

Compare:

```text
Control Area
vs
SOIL IQ Area
```

Measure:

* fertilizer use
* application accuracy
* input cost
* nutrient balance
* soil indicators
* crop output
* environmental events

## Phase 4 — Machine Integration

Integrate with compatible agricultural equipment.

## Phase 5 — Multi-Farm SaaS

Scale to:

* multiple organizations
* farms
* devices
* machines
* crops
* regions

---

# 🌍 Sustainability Alignment

## SDG 2 — Zero Hunger

Supports more sustainable and efficient agricultural production.

## SDG 12 — Responsible Consumption and Production

Targets unnecessary agricultural input use and improves application efficiency.

## SDG 13 — Climate Action

Supports environmentally conscious fertilizer timing and application management.

## SDG 15 — Life on Land

Supports long-term soil and land management.

SOIL IQ does not claim to single-handedly achieve these SDGs.

It provides a technology platform aligned with relevant sustainability objectives.

---

# 🏆 Why SOIL IQ?

Traditional:

```text
General Recommendation
        ↓
Uniform Application
        ↓
Limited Verification
```

SOIL IQ:

```text
SOIL DATA
   ↓
GRID
   ↓
FIELD-SPECIFIC PRESCRIPTION
   ↓
MACHINE LOCATION
   ↓
ACTUAL APPLICATION
   ↓
ENVIRONMENT
   ↓
CONTROL
   ↓
IMPACT
```

### The product differentiation is the closed loop.

> **SOIL IQ doesn't just recommend fertilizer. It connects the recommendation to the machine and verifies what actually happens in the field.**

---

# 🔮 Future Roadmap

Potential future enhancements:

* real LoRaWAN deployments
* agricultural machinery integrations
* RTK hardware
* real flow meters
* real-time fertilizer control
* satellite imagery
* drone imagery
* advanced spatial interpolation
* crop-health monitoring
* yield forecasting
* advanced machine learning
* multi-season soil models
* regional agronomic models
* government/agriculture data integrations
* commercial APIs

All future agronomic models should undergo appropriate validation.

---

# 🚧 Current Limitations

The hackathon prototype currently relies heavily on:

* simulated sensor data
* simulated machine telemetry
* prototype agronomic rules
* simulated environmental scenarios
* configurable demo fertilizer values

Therefore:

**SOIL IQ should be considered a technology prototype and decision-support architecture, not a validated agricultural prescription system.**

Field deployment should only occur after proper agronomic, hardware, safety, and regulatory validation.

---

# 📌 Demo Architecture

For the SustainX hackathon:

```text
📱 MOBILE
Smart Sprayer Simulator
        │
        │ MQTT
        ▼
☁️ MQTT BROKER
        │
        ▼
🧠 SOIL IQ BACKEND
        │
        ├── Grid Engine
        ├── Prescription Engine
        ├── Nutrient Ledger
        ├── Environmental Engine
        ├── Control Engine
        └── Intelligence
        │
        ▼
💻 LAPTOP
SOIL IQ SaaS Dashboard
```

Optional simulated soil nodes:

```text
Virtual Soil Nodes
      ↓
     MQTT
      ↓
SOIL IQ
```

No physical agricultural hardware is required to demonstrate the core architecture.

---

# 🎤 Hackathon Demo Story

### Step 1


Show the virtual farm.

> “We divided this farm into spatial intelligence grids.”

### Step 2

Select a grid.

> “Every grid has its own soil state and nutrient budget.”

### Step 3

Show prescription.

> “SOIL IQ generates a field-specific application recommendation.”

### Step 4

Open mobile.

> “This phone is our simulated smart sprayer, publishing its location and application telemetry through MQTT.”

### Step 5

Start movement.

The laptop receives:

```text
SPRAYER-01
→ G01
```

### Step 6

Move to another grid.

```text
G02
→ REDUCE
```

### Step 7

Move to a saturated grid.

```text
G03
→ STOP
```

### Step 8

Trigger rainfall.

```text
Environmental Risk:
HIGH

Decision:
DEFER
```

### Step 9

Show impact.

> “Now we can quantify what was actually applied, where it was applied, and how much unnecessary application was prevented in the simulation.”

---

# 🧩 Project Philosophy

SOIL IQ is built around five principles:

### 1. Spatial

Every decision is tied to a location.

### 2. Measurable

Actual application is tracked.

### 3. Explainable

Every major decision has a reason.

### 4. Safe

Uncertainty should lead to conservative system behavior.

### 5. Validatable

The system distinguishes prototype assumptions from measured reality.

---

# 👥 Team

**Project:** SOIL IQ

**Hackathon:** SustainX

**Focus:** Sustainable Agriculture / Precision Fertilizer Management

Team members:

* Member 1 — Nabiha Tabassum
* Member 2 — Rajdeep Dutta

---

# 📄 License

Choose and add the appropriate license before public deployment.

For example:

```text
MIT License
```

See `LICENSE` for details.

---

# ⭐ Final Statement

> **SOIL IQ: Every grid gets a prescription. Every application gets measured. Every decision gets explained.**

Built as a technology prototype for sustainable, precision-driven fertilizer management.

````

