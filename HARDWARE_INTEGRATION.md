# SOIL IQ — Hardware Integration & Machine Deployment Guide

This document outlines the technical wiring, communication protocols, and payload schemas required to connect physical agricultural machinery and field sensors to SOIL IQ.

---

## 1. Physical Hardware Connection Blueprint

```
+--------------------------+       LoRaWAN (868/915 MHz)       +--------------------------+
| In-Situ Soil Probe Node  | --------------------------------> | Solar Field Gateway      |
| (Moisture, Temp, EC)     |                                   | (IP67, RAKwireless/Dragino)
+--------------------------+                                   +--------------------------+
                                                                             |
                                                                        MQTT / HTTPS
                                                                             |
                                                                             v
+--------------------------+                                   +--------------------------+
| Tractor Sprayer Boom     |                                   | SOIL IQ Cloud Platform   |
| * Dual RTK-GNSS (RS-232) |                                   | * Ingestion Broker       |
| * Pulse Flow Meter       | -- ISOBUS / CAN-bus (250 kbps) -> | * Spatial Grid Engine    |
| * 4-20mA Tank Sensor     |                                   | * Control Decision Engine|
| * Solenoid Boom Valves   |                                   +--------------------------+
+--------------------------+                                                 |
             ^                                                               |
             |                     Machine Telemetry & Controls              |
             +------------------- (EdgeGateway Controller) <-----------------+
```

---

## 2. RTK-GNSS Receiver Configuration

- **Protocol**: NMEA 0183 or UBX binary protocol over RS-232 / UART (115200 baud).
- **Update Rate**: 5 Hz minimum (recommended 10 Hz for spraying speeds up to 15 km/h).
- **Required NMEA Sentences**:
  - `$GNGGA`: Latitude, longitude, altitude, fix status (`4 = RTK Fixed`, `5 = RTK Float`), number of satellites, horizontal dilution of precision (HDOP).
  - `$GNVTG`: Ground speed (km/h) and true heading (degrees).
- **Position Quality Policy**:
  - `RTK FIXED` (&le;5 cm): Automated variable rate enabled.
  - `RTK FLOAT` (10&ndash;50 cm): Conservative throttle enabled.
  - `NO_FIX`: Immediate automated valve shutdown (`STOP`).

---

## 3. Flow Meter & Totalizer Integration

- **Sensor Type**: Electromagnetic or turbine pulse flow meter installed on main chemical boom intake line.
- **Signal**: Hall-effect 5V/12V square-wave pulses calibrated in pulses per liter ($K$-factor).
- **Edge Totalization**: Edge controller measures pulses per discrete 100ms interval:
  $$\text{Flow Rate (L/min)} = \frac{\text{Pulses in } \Delta t}{K \times (\Delta t / 60)}$$
  $$\Delta V = \text{Flow Rate} \times \frac{\Delta t}{60}$$
- **Totalizer Guarantee**: Every discrete slice is assigned a monotonic `eventId` to prevent double-counting upon retransmissions.

---

## 4. MQTT Topic & Message Envelope Standard

All device telemetry, commands, and acknowledgements follow this strict topic hierarchy:

| Direction | Channel | Topic Convention |
| :--- | :--- | :--- |
| Device &rarr; Cloud | Telemetry | `soil-iq/{orgId}/devices/{deviceId}/telemetry` |
| Device &rarr; Cloud | Status / Heartbeat | `soil-iq/{orgId}/devices/{deviceId}/status` |
| Cloud &rarr; Device | Machine Command | `soil-iq/{orgId}/devices/{deviceId}/command` |
| Device &rarr; Cloud | Acknowledgement | `soil-iq/{orgId}/devices/{deviceId}/ack` |

### Example Telemetry Packet (JSON envelope):
```json
{
  "version": "1.0",
  "messageId": "msg_cuid12345",
  "deviceId": "FLOW-01",
  "organizationId": "green-valley",
  "timestamp": "2026-09-12T12:30:00.000Z",
  "type": "TELEMETRY",
  "payload": {
    "latitude": 17.1234,
    "longitude": 80.4567,
    "speedKmh": 8.5,
    "headingDeg": 92.4,
    "flowRateLpm": 12.4,
    "tankLevelLiters": 408.0,
    "tankLevelPct": 68.0,
    "applicationRateLpha": 41.6,
    "gnssFixStatus": "RTK_FIXED",
    "horizontalAccuracyM": 0.021,
    "satellites": 18
  }
}
```
