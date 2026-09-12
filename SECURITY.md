# SOIL IQ — Security, Tenant Isolation & Safety Controls

## 1. Multi-Tenant Isolation

Every database query and telemetry ingestion route strictly enforces tenancy isolation:
- All domain records (`Farm`, `Field`, `Grid`, `Sprayer`, `Device`, `Alert`, `ApplicationSession`) are keyed to `organizationId`.
- No cross-organization data leakage: users can only view and operate equipment registered under their assigned organization.
- RBAC roles (`OWNER`, `ADMIN`, `FARM_MANAGER`, `OPERATOR`, `VIEWER`) govern privileges. Read-only users (`VIEWER`) cannot actuate equipment or approve prescriptions.

---

## 2. Hardware Identity & Secret Cryptography

- **One-Time Plaintext Exposure**: Device secrets generated during provisioning (`/settings/devices/provision`) are presented exactly once.
- **SHA-256 Hashing**: Secrets are hashed with SHA-256 before storage in SQLite/PostgreSQL. Plaintext tokens are never stored, logged, or retrievable.
- **Constant-Time Verification**: Incoming MQTT tokens are verified using `crypto.timingSafeEqual` to eliminate timing attacks.
- **Credential Rotation & Revocation**: Revoking a compromised device credential immediately closes its MQTT connection and drops packets without destroying historical application ledgers.

---

## 3. Hardware Safety Gate (`PHYSICAL_CONTROL_ENABLED`)

- **Default Safety Lock**: `PHYSICAL_CONTROL_ENABLED` is `false` by default.
- In prototype mode, all physical machine actuation commands remain safely simulated.
- Unlocking physical machine control requires an explicit administrative 14-point safety checklist, including hydraulic pressure checks and manual E-stop verification.
- Casually clicking from a browser interface cannot actuate physical machinery without explicit verification.

---

## 4. Command Idempotency & Safe Failure Hierarchy

- Every device command requires an `idempotencyKey`. Retransmitted duplicate requests return existing execution receipts rather than double-actuating valves.
- **Command Timeout Monitor**: If a physical sprayer fails to acknowledge a rate change within 5000ms, the system transitions the command to `TIMEOUT`, triggers a `CRITICAL` alert, and instructs the edge controller to enter `SAFE_STOP_SIMULATION`.
