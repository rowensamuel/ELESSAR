# India Airfare Intelligence & CPI Augmentation API
## Frontend Integration Specification & Complete API Reference

> **Base URL:** `http://localhost:5000`  
> **API Mount Path:** `/api`  
> **Content-Type:** `application/json`  
> **CORS Policy:** Permissive for `http://localhost:*` and configured `FRONTEND_URL` (default: `http://localhost:3000`), `credentials: true`.  
> **Interactive Tester:** [http://localhost:5000/api-tester](http://localhost:5000/api-tester)  

---

## Table of Contents

1. [Standard Response Envelope](#1-standard-response-envelope)
2. [Quick Route Directory](#2-quick-route-directory)
3. [System & Health Endpoints](#3-system--health-endpoints)
   - [GET /api/health](#get-apihealth)
   - [POST /api/refresh](#post-apirefresh)
4. [Airfare Index Endpoints](#4-airfare-index-endpoints)
   - [GET /api/index](#get-apiindex)
   - [GET /api/index/history](#get-apiindexhistory)
5. [Dashboard Summary Endpoint](#5-dashboard-summary-endpoint)
   - [GET /api/dashboard](#get-apidashboard)
6. [Route Intelligence Endpoints](#6-route-intelligence-endpoints)
   - [GET /api/routes](#get-apiroutes)
   - [GET /api/routes/:route](#get-apiroutesroute)
   - [GET /api/routes/:route/history](#get-apiroutesroutehistory)
7. [Search & On-Demand Scraping Endpoint](#7-search--on-demand-scraping-endpoint)
   - [GET /api/search](#get-apisearch)
8. [Data Stream & Quality Endpoints](#8-data-stream--quality-endpoints)
   - [GET /api/data/status](#get-apidatastatus)
   - [GET /api/data/quality](#get-apidataquality)
9. [CPI Augmentation & Macro-Inflation Endpoints](#9-cpi-augmentation--macro-inflation-endpoints)
   - [GET /api/cpi (or /api/cpi/summary)](#get-apicpi-or-get-apicpisummary)
   - [GET /api/cpi/comparison](#get-apicpicomparison)
   - [GET /api/cpi/decomposition (or /api/cpi/routes)](#get-apicpidecomposition-or-get-apicpiroutes)
   - [GET /api/cpi/simulate](#get-apicpisimulate)
10. [Scraper Management Endpoints](#10-scraper-management-endpoints)
    - [POST /api/scraper/run](#post-apiscraperrun)
    - [GET /api/scraper/status](#get-apiscraperstatus)
    - [GET /api/scraper/jobs](#get-apiscraperjobs)
    - [POST /api/scraper/jobs](#post-apiscraperjobs)
    - [PATCH /api/scraper/jobs/:id](#patch-apiscraperjobsid)
    - [DELETE /api/scraper/jobs/:id](#delete-apiscraperjobsid)
11. [Ready-to-Use TypeScript Interfaces](#11-ready-to-use-typescript-interfaces)
12. [Frontend Integration Helper (Axios / Fetch)](#12-frontend-integration-helper)

---

## 1. Standard Response Envelope

All API endpoints return JSON conforming to consistent envelopes.

### Success Response Envelope
```json
{
  "success": true,
  "data": { ... }
}
```
*(Note: Some search/refresh endpoints may also provide top-level metadata like `"query": "..."` or `"message": "..."`)*.

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_IDENTIFIER_CODE",
    "message": "Human readable explanation of the error."
  }
}
```

### Common HTTP Status Codes
| HTTP Status | Meaning | Typical Error Code |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | N/A |
| `201 Created` | New resource created (e.g. ScrapeJob) | N/A |
| `400 Bad Request` | Invalid query or body parameters | `INVALID_JOB_PARAMS` |
| `404 Not Found` | Route or resource not found | `ROUTE_NOT_FOUND`, `JOB_NOT_FOUND`, `HISTORY_NOT_AVAILABLE`, `ENDPOINT_NOT_FOUND` |
| `500 Internal Server Error` | Server computation or DB error | `INTERNAL_SERVER_ERROR`, `SEARCH_FAILED`, `REFRESH_FAILED` |
| `503 Service Unavailable` | Operation requires MongoDB but DB is disconnected | `DB_DISCONNECTED` |

---

## 2. Quick Route Directory

| # | Method | Endpoint | Category | Description |
|---|:---|:---|:---|:---|
| 1 | `GET` | `/api/health` | System | Health check & uptime status |
| 2 | `POST` | `/api/refresh` | System | Flush cache & recalculate master index |
| 3 | `GET` | `/api/index` | Index | Current headline India Airfare Index value |
| 4 | `GET` | `/api/index/history` | Index | Historical time-series points of index |
| 5 | `GET` | `/api/dashboard` | Dashboard | Main aggregated dashboard overview payload |
| 6 | `GET` | `/api/routes` | Routes | List all tracked routes with sorting & filter |
| 7 | `GET` | `/api/routes/:route` | Routes | Detailed inspection for a specific route pair |
| 8 | `GET` | `/api/routes/:route/history`| Routes | Timestamped fare history for a specific route |
| 9 | `GET` | `/api/search` | Search | MongoDB lookup + automated on-demand scraping |
| 10 | `GET` | `/api/data/status` | Data | Pipeline status & MongoDB stats |
| 11 | `GET` | `/api/data/quality` | Data | Quality metrics, warnings & missing datasets |
| 12 | `GET` | `/api/cpi` | CPI | CPI augmentation summary & headline impacts |
| 13 | `GET` | `/api/cpi/comparison` | CPI | Real-time nowcasts vs official MOSPI CPI series |
| 14 | `GET` | `/api/cpi/decomposition`| CPI | Route-level contribution to CPI Transport basket |
| 15 | `GET` | `/api/cpi/simulate` | CPI | Inflation shock simulator for airfares |
| 16 | `POST` | `/api/scraper/run` | Scraper | Trigger manual scraping (all, single job, or route) |
| 17 | `GET` | `/api/scraper/status` | Scraper | Real-time scraper runtime state & metrics |
| 18 | `GET` | `/api/scraper/jobs` | Scraper | List all configured scrape jobs |
| 19 | `POST` | `/api/scraper/jobs` | Scraper | Create a new scrape job target |
| 20 | `PATCH`| `/api/scraper/jobs/:id` | Scraper | Update priority, schedule, or toggle job |
| 21 | `DELETE`| `/api/scraper/jobs/:id`| Scraper | Delete a scrape job |

---

## 3. System & Health Endpoints

### `GET /api/health`
Checks backend service availability and database connectivity.

- **Frontend Use Case:** App initialization, connectivity badge, navbar status indicator.
- **Request Parameters:** None.
- **Response Headers:** `Content-Type: application/json`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "status": "ok",
  "service": "india-airfare-index-api",
  "database": "connected",
  "timestamp": "2026-08-30T17:00:00.000Z"
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | `boolean` | `true` if server is responding |
| `status` | `string` | `"ok"` |
| `service` | `string` | Identifier `"india-airfare-index-api"` |
| `database` | `string` | `"connected"` when MongoDB is active, else `"standalone"` |
| `timestamp` | `string` (ISO 8601) | Current server UTC time |

---

### `POST /api/refresh`
Flushes memory cache and re-computes the master index using latest MongoDB observations and files.

- **Frontend Use Case:** "Refresh Index" or "Recalculate" admin buttons.
- **Request Parameters:** None.
- **Request Body:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Index data refreshed"
}
```

#### Error Response (`500 Internal Server Error`)
```json
{
  "success": false,
  "error": {
    "code": "REFRESH_FAILED",
    "message": "Error details"
  }
}
```

---

## 4. Airfare Index Endpoints

### `GET /api/index`
Retrieves the current headline India Airfare Price Index value and metadata.

- **Frontend Use Case:** Top metric card displaying current index value and base reference period.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "value": 116.84,
    "baseValue": 100,
    "change24h": null,
    "change7d": null,
    "change30d": null,
    "referenceYear": 2026,
    "basePeriod": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "calculatedAt": "2026-08-30T17:00:00.000Z"
  }
}
```

| Response Parameter | Type | Description |
| :--- | :--- | :--- |
| `data.value` | `number` | Current composite India Airfare Index (Laspeyres base: 100) |
| `data.baseValue` | `number` | Baseline constant (`100`) |
| `data.change24h` | `number \| null` | 24-hour percentage change if snapshot available |
| `data.change7d` | `number \| null` | 7-day percentage change if snapshot available |
| `data.change30d` | `number \| null` | 30-day percentage change if snapshot available |
| `data.referenceYear` | `number` | Passenger traffic reference year (e.g. `2026`) |
| `data.basePeriod.start` | `string` | Base period start date (`"YYYY-MM-DD"`) |
| `data.basePeriod.end` | `string` | Base period end date (`"YYYY-MM-DD"`) |
| `data.calculatedAt` | `string` (ISO 8601) | Timestamp of calculation |

---

### `GET /api/index/history`
Returns historical index snapshots from MongoDB for trend charting.

- **Frontend Use Case:** Hero index movement chart (Line chart).
- **Query Parameters:**

| Parameter | Type | Required | Default | Description / Accepted Values |
| :--- | :--- | :--- | :--- | :--- |
| `period` | `string` | No | `"30d"` | `"24h"`, `"7d"`, `"30d"`, `"3m"`, `"1y"`, `"all"` |
| `granularity` | `string` | No | `"daily"` | `"daily"`, `"weekly"`, `"monthly"` |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "granularity": "daily",
    "points": [
      {
        "timestamp": "2026-08-01T00:00:00.000Z",
        "value": 114.52
      },
      {
        "timestamp": "2026-08-02T00:00:00.000Z",
        "value": 115.10
      }
    ]
  }
}
```

#### Error Response (`404 Not Found`)
Returned if no snapshots have been persisted to MongoDB yet.
```json
{
  "success": false,
  "error": {
    "code": "HISTORY_NOT_AVAILABLE",
    "message": "Historical index snapshots are not available."
  }
}
```

---

## 5. Dashboard Summary Endpoint

### `GET /api/dashboard`
Aggregated master payload powering the dashboard home view.

- **Frontend Use Case:** Loads all top-level stats, top moving routes, data stream health, and alerts in a single call.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "summary": {
      "indiaAirfareIndex": 116.84,
      "baseIndex": 100,
      "change24h": 0.45,
      "change7d": 1.20,
      "change30d": null,
      "routesTracked": 42,
      "fareObservations": 1280,
      "dataSources": {
        "active": 2,
        "total": 2
      },
      "lastUpdated": "2026-08-30T17:00:00.000Z"
    },
    "trend": [],
    "topRoutes": [
      {
        "route": "BOM-DEL",
        "origin": "BOM",
        "destination": "DEL",
        "routeName": "Mumbai (BOM) ↔ Delhi (DEL)",
        "currentFare": 6450,
        "baseFare": 5800,
        "index": 111.21,
        "weight": 0.1425,
        "passengerVolume": 2450000,
        "contribution": 15.85,
        "observations": 84,
        "change24h": 0.8,
        "change7d": 2.1
      }
    ],
    "dataStream": {
      "status": "LIVE",
      "lastCollection": "2026-08-30T17:00:00.000Z",
      "observations": 1280,
      "activeSources": 2,
      "totalSources": 2
    },
    "warnings": []
  }
}
```

| Response Section | Field | Type | Description |
| :--- | :--- | :--- | :--- |
| `summary` | `indiaAirfareIndex` | `number` | Headline national price index value |
| `summary` | `baseIndex` | `number` | Base index benchmark (`100`) |
| `summary` | `change24h` / `change7d` | `number \| null` | Aggregate movement percentage |
| `summary` | `routesTracked` | `number` | Total domestic corridors in active basket |
| `summary` | `fareObservations` | `number` | Total valid fare data points ingested |
| `summary` | `dataSources` | `object` | `{ active: number, total: number }` airlines scraped |
| `topRoutes[]` | `route` | `string` | Canonical pair ID (e.g. `"BOM-DEL"`) |
| `topRoutes[]` | `routeName` | `string` | Formatted name (`"Mumbai (BOM) ↔ Delhi (DEL)"`) |
| `topRoutes[]` | `currentFare` | `number` | Median representative fare in INR (₹) |
| `topRoutes[]` | `baseFare` | `number` | Base period representative fare in INR (₹) |
| `topRoutes[]` | `index` | `number` | Route price index `(currentFare / baseFare) * 100` |
| `topRoutes[]` | `weight` | `number` | DGCA passenger traffic volume share (sums to 1.0) |
| `topRoutes[]` | `contribution` | `number` | Point contribution to master index `(index * weight)` |
| `topRoutes[]` | `passengerVolume`| `number` | Annual passengers carried on this corridor |
| `topRoutes[]` | `observations` | `number` | Number of distinct fare samples collected |
| `dataStream` | `status` | `string` | `"LIVE"` or `"MOCK"` (mock when synthetic data used) |
| `warnings[]` | Array of objects | `array` | Excluded routes and reasons (e.g. missing DGCA/Base) |

---

## 6. Route Intelligence Endpoints

### `GET /api/routes`
Lists all tracked domestic routes with sorting, pagination, and search filtering.

- **Frontend Use Case:** Routes table/grid view with search bar, pagination, and column sorting.
- **Query Parameters:**

| Parameter | Type | Required | Default | Description / Accepted Values |
| :--- | :--- | :--- | :--- | :--- |
| `search` | `string` | No | `""` | Filters by route ID, IATA code, or city name (e.g. `"DEL"`, `"Mumbai"`) |
| `sort` | `string` | No | `"passengerVolume"` | `"passengerVolume"`, `"index"`, `"currentFare"`, `"weight"`, `"change24h"`, `"change7d"` |
| `limit` | `number` | No | All | Maximum number of routes to return (e.g. `10`, `25`, `50`) |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "total": 42,
    "routes": [
      {
        "route": "BOM-DEL",
        "origin": "BOM",
        "destination": "DEL",
        "routeName": "Mumbai (BOM) ↔ Delhi (DEL)",
        "currentFare": 6450,
        "baseFare": 5800,
        "index": 111.21,
        "weight": 0.1425,
        "passengerVolume": 2450000,
        "contribution": 15.85,
        "observations": 84,
        "change24h": 0.8,
        "change7d": 2.1
      }
    ]
  }
}
```

---

### `GET /api/routes/:route`
Detailed inspection of a specific flight corridor.

- **Frontend Use Case:** Route Detail Page / Modal (displays airport info, base fare, index, current observations, and historical points).
- **Path Parameters:**

| Parameter | Type | Required | Example | Description |
| :--- | :--- | :--- | :--- | :--- |
| `route` | `string` | Yes | `BOM-DEL` | Canonical route pair or reverse pair (case-insensitive) |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "route": "BOM-DEL",
    "origin": {
      "code": "BOM",
      "city": "Mumbai"
    },
    "destination": {
      "code": "DEL",
      "city": "Delhi"
    },
    "currentFare": 6450,
    "baseFare": 5800,
    "routeIndex": 111.21,
    "weight": 0.1425,
    "contribution": 15.85,
    "passengerVolume": 2450000,
    "observations": 84,
    "change24h": 0.8,
    "change7d": 2.1,
    "fareObservations": [
      {
        "source": "Air India",
        "airline": "Air India",
        "flightNo": "AI-805",
        "origin": "BOM",
        "destination": "DEL",
        "route": "BOM-DEL",
        "departureDate": "2026-09-15T00:00:00.000Z",
        "departureTime": "07:00",
        "arrivalTime": "09:15",
        "duration": "2h 15m",
        "totalFare": 6450,
        "currency": "INR",
        "scrapedAt": "2026-08-30T17:00:00.000Z"
      }
    ],
    "historicalFare": [
      {
        "date": "2026-01-15",
        "fare": 5800
      }
    ]
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Route BOM-DEL was not found."
  }
}
```

---

### `GET /api/routes/:route/history`
Historical fare observations for charting price trends of a specific corridor over time.

- **Frontend Use Case:** Historical price trajectory line chart on Route Detail page.
- **Path Parameters:**
  - `route` (`string`, required): e.g. `BOM-DEL`
- **Query Parameters:**
  - `period` (`string`, optional, default: `"30d"`): e.g. `"7d"`, `"30d"`, `"90d"`, `"1y"`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "route": "BOM-DEL",
    "period": "30d",
    "points": [
      {
        "timestamp": "2026-01-05",
        "fare": 5600
      },
      {
        "timestamp": "2026-01-15",
        "fare": 5800
      }
    ]
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "ROUTE_HISTORY_NOT_AVAILABLE",
    "message": "Historical fare observations for route BOM-DEL are not available."
  }
}
```

---

## 7. Search & On-Demand Scraping Endpoint

### `GET /api/search`
Smart database-first search with automated on-demand scraping for stale or missing corridors.

- **Frontend Use Case:** Search Bar, Route Planner, Live Fare Checker with multi-airline price comparison.
- **Query Parameters:**

| Parameter | Type | Required | Default | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `q` or `query` | `string` | Conditional* | `""` | Query text: `"DEL-BOM"`, `"Mumbai to Delhi"`, `"BOM DEL"`, `"SpiceJet BOM-DEL"`, `"DEL"` |
| `origin` | `string` | Conditional* | `""` | Direct 3-letter IATA code (e.g. `"DEL"`) |
| `destination` | `string` | Conditional* | `""` | Direct 3-letter IATA code (e.g. `"BOM"`) |
| `departureDate`| `string` | No | Today | Departure date in `YYYY-MM-DD` or ISO string |
| `days` | `number` | No | `30` | Horizon in days for forward calendar scraping |
| `source` | `string` | No | `"Air India"` | Provider filter: `"Air India"`, `"SpiceJet"`, `"all"`, `"both"` |

*\*Note: Either `q` OR both `origin` and `destination` must be supplied.*

#### Execution Lifecycle:
1. **Cache & DB Check:** Looks for existing fare records in MongoDB newer than 60 minutes.
2. **Fresh Data Found:** Returns immediately with `state: "DATABASE_FRESH"`, `scraped: false`.
3. **Missing or Stale Data:** Runs Puppeteer scrapers on-demand, stores observations in DB, recalculates index metrics via the calculation engine, and returns `state: "SCRAPED"`, `scraped: true`.

#### Success Response (`200 OK` - Route Search with Price Comparison & Engine Metrics)
```json
{
  "success": true,
  "query": "DEL-BOM",
  "data": {
    "source": "database",
    "scraped": false,
    "state": "DATABASE_FRESH",
    "route": "BOM-DEL",
    "observationsCount": 48,
    "latestScrapedAt": "2026-08-30T17:00:00.000Z",
    "priceComparison": {
      "providers": {
        "Air India": {
          "status": "ok",
          "observationsCount": 24,
          "minFare": 5800,
          "maxFare": 9200,
          "medianFare": 6450,
          "meanFare": 6780.50
        },
        "SpiceJet": {
          "status": "ok",
          "observationsCount": 24,
          "minFare": 5400,
          "maxFare": 8800,
          "medianFare": 6100,
          "meanFare": 6350.00
        }
      },
      "cheapest": "SpiceJet",
      "comparedAt": "2026-08-30T17:00:00.000Z"
    },
    "routeIndexEngine": {
      "engineStatus": "COMPUTED_VIA_INDEX_ENGINE",
      "methodology": "CPI-Augmented Airfare Index (Laspeyres formula with median representative fare)",
      "route": "BOM-DEL",
      "routeIndex": 111.21,
      "currentRepresentativeFare": 6450.00,
      "baseRepresentativeFare": 5800.00,
      "baseSource": "HISTORICAL_COLLECTION",
      "isBaselineEstablished": true,
      "weight": 0.142500,
      "contribution": 15.8474,
      "passengerVolume": 2450000,
      "nationalIndex": 116.84,
      "basePeriod": {
        "start": "2026-01-01",
        "end": "2026-01-31"
      },
      "fareStats": {
        "observationsCount": 48,
        "validObservationsCount": 48,
        "medianFare": 6450.00,
        "meanFare": 6565.25,
        "minFare": 5400,
        "maxFare": 9200
      }
    },
    "results": [
      {
        "type": "route",
        "route": "BOM-DEL",
        "origin": "BOM",
        "destination": "DEL",
        "routeName": "Mumbai (BOM) ↔ Delhi (DEL)",
        "currentFare": 6450,
        "index": 111.21
      }
    ],
    "observations": [
      {
        "_id": "66d123456789...",
        "source": "Air India",
        "airline": "Air India",
        "flightNo": "AI-805",
        "origin": "BOM",
        "destination": "DEL",
        "route": "BOM-DEL",
        "departureDate": "2026-09-15T00:00:00.000Z",
        "departureTime": "07:00",
        "arrivalTime": "09:15",
        "duration": "2h 15m",
        "totalFare": 6450,
        "currency": "INR",
        "scrapedAt": "2026-08-30T17:00:00.000Z"
      }
    ]
  }
}
```

---

## 8. Data Stream & Quality Endpoints

### `GET /api/data/status`
Returns live collection statistics, active sources, and MongoDB metrics.

- **Frontend Use Case:** System health footer, data collection status badges.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "status": "LIVE",
    "lastCollection": "2026-08-30T17:00:00.000Z",
    "observations": 1280,
    "activeSources": 2,
    "totalSources": 2,
    "dataQuality": {
      "valid": 1280,
      "invalid": 12
    },
    "database": "connected",
    "totalFareObservations": 1280,
    "observationsToday": 142,
    "routesTracked": 42,
    "activeScrapeJobs": 6
  }
}
```

---

### `GET /api/data/quality`
Detailed data pipeline quality audit, data hygiene warnings, and missing components.

- **Frontend Use Case:** Admin audit screen, data integrity banner.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "totalFareObservations": 1292,
    "validFareObservations": 1280,
    "invalidFareObservations": 12,
    "routesTracked": 42,
    "routesMissingHistoricalData": [
      "DEL-DED"
    ],
    "routesMissingDGCAData": [],
    "unknownAirportMappings": [],
    "warnings": [
      {
        "route": "DEL-DED",
        "reason": "Missing Historical Base Fare"
      }
    ]
  }
}
```

---

## 9. CPI Augmentation & Macro-Inflation Endpoints

Implements official Ministry of Statistics & Programme Implementation (**MOSPI Base: 2012 = 100**) macroeconomic calculations and CPI nowcasting.

### `GET /api/cpi` (or `GET /api/cpi/summary`)
Returns macroeconomic inflation metrics, headline CPI basis point impacts, and lead-time advantage.

- **Frontend Use Case:** "CPI Augmentation & Macro-Intelligence" tab / widget.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "summary": {
      "indiaAirfareIndex": 116.84,
      "baseIndex": 100,
      "airfareInflationRate": 16.84,
      "transportCpiImpactPercentagePoints": 0.7073,
      "headlineCpiImpactBasisPoints": 6.08,
      "urbanImpactBasisPoints": 6.83,
      "ruralImpactBasisPoints": 1.62,
      "nowcastGeneralCpi": 195.86,
      "effectiveWeightInCpi": 0.3608,
      "weights": {
        "transportGroupInCpi": 8.59,
        "airTransportInGroup": 4.20,
        "effectiveTotalWeight": 0.3608
      },
      "publicationAdvantage": {
        "leadTimeDays": 45,
        "frequency": "Real-Time (Continuous / Daily)",
        "officialReleaseFrequency": "Monthly (45-day lag)"
      },
      "calculatedAt": "2026-08-30T17:00:00.000Z"
    },
    "topCorridorContributors": [
      {
        "route": "BOM-DEL",
        "routeName": "Mumbai (BOM) ↔ Delhi (DEL)",
        "origin": "BOM",
        "destination": "DEL",
        "currentFare": 6450,
        "baseFare": 5800,
        "routeIndex": 111.21,
        "routeWeightInBasket": 0.1425,
        "airIndexContribution": 15.85,
        "transportGroupContributionPct": 0.0671,
        "headlineCpiContributionBps": 0.58,
        "passengerVolume": 2450000
      }
    ],
    "recentComparison": [
      {
        "month": "2025-12",
        "generalCpi": 194.5,
        "transportCpi": 171.8,
        "airfareCpiOfficial": 162.4,
        "realTimeNowcast": 161.8,
        "lagDays": 45
      },
      {
        "month": "2026-01",
        "generalCpi": 195.1,
        "transportCpi": 172.0,
        "airfareCpiOfficial": 153.2,
        "realTimeNowcast": 154.0,
        "lagDays": 45
      },
      {
        "month": "2026-02",
        "generalCpi": 195.8,
        "transportCpi": 172.6,
        "airfareCpiOfficial": 155.6,
        "realTimeNowcast": 156.1,
        "lagDays": 45
      },
      {
        "month": "2026-03",
        "generalCpi": 195.86,
        "transportCpi": 173.31,
        "airfareCpiOfficial": null,
        "realTimeNowcast": 116.8,
        "lagDays": 0,
        "isNowcast": true
      }
    ],
    "meta": {
      "methodology": "Laspeyres Price Index with DGCA Passenger Volume Weighting",
      "basePeriod": {
        "start": "2026-01-01",
        "end": "2026-01-31"
      },
      "referenceYear": 2026,
      "sourcesTracked": [
        "Air India",
        "SpiceJet"
      ]
    }
  }
}
```

| Metric | Meaning / Formula |
| :--- | :--- |
| `airfareInflationRate` | Percentage change in airfares relative to base period: `((Index - 100) / 100) * 100` |
| `transportCpiImpactPercentagePoints` | Shift in Transport & Communication Sub-group CPI (8.59% weight) |
| `headlineCpiImpactBasisPoints` | Overall impact on India All-Items CPI in basis points (100 bps = 1.00%) |
| `nowcastGeneralCpi` | Real-time estimated general CPI level 45 days prior to official publication |
| `leadTimeDays` | Publication lead-time advantage (`45` days ahead of official MOSPI bulletin) |

---

### `GET /api/cpi/comparison`
Returns historical monthly time-series comparing Real-Time Airfare Nowcasts against official MOSPI publications.

- **Frontend Use Case:** Dual-line comparison chart (Official CPI vs Real-Time Continuous Nowcast).
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "series": [
      {
        "month": "2025-09",
        "generalCpi": 191.2,
        "transportCpi": 168.4,
        "airfareCpiOfficial": 142.1,
        "realTimeNowcast": 140.8,
        "lagDays": 45
      },
      {
        "month": "2026-03",
        "generalCpi": 195.86,
        "transportCpi": 173.31,
        "airfareCpiOfficial": null,
        "realTimeNowcast": 116.8,
        "lagDays": 0,
        "isNowcast": true
      }
    ],
    "leadTimeAdvantageDays": 45,
    "frequency": "Daily Continuous Nowcast vs Monthly Official Release"
  }
}
```

---

### `GET /api/cpi/decomposition` (or `GET /api/cpi/routes`)
Corridor-by-corridor breakdown of CPI weights and headline basis point contributions.

- **Frontend Use Case:** CPI Contribution Tree/Table, sorting corridors by impact on national inflation.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "totalRoutesTracked": 42,
    "routes": [
      {
        "route": "BOM-DEL",
        "routeName": "Mumbai (BOM) ↔ Delhi (DEL)",
        "origin": "BOM",
        "destination": "DEL",
        "currentFare": 6450,
        "baseFare": 5800,
        "routeIndex": 111.21,
        "routeWeightInBasket": 0.1425,
        "airIndexContribution": 15.85,
        "transportGroupContributionPct": 0.0671,
        "headlineCpiContributionBps": 0.58,
        "passengerVolume": 2450000
      }
    ]
  }
}
```

---

### `GET /api/cpi/simulate`
Simulates the impact of hypothetical airfare price shocks on the All-India Headline CPI.

- **Frontend Use Case:** Interactive Policy Shock Slider / Scenario Analysis Chart.
- **Query Parameters:**

| Parameter | Type | Required | Default | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `shocks` | `string` | No | `"-30,-20,-10,-5,0,5,10,20,30"` | Comma-separated list of percentage shocks |
| `shock` | `number` | No | N/A | Single percentage shock value (e.g. `?shock=15`) |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "currentAirfareIndex": 116.84,
    "baselineBaseYear": 2012,
    "shocks": [
      {
        "shockPercentage": -20,
        "simulatedAirfareIndex": 93.47,
        "headlineCpiImpactBasisPoints": -2.36,
        "transportCpiImpactPercentagePoints": -0.2743,
        "impliedNationalInflationDelta": -0.0236
      },
      {
        "shockPercentage": 0,
        "simulatedAirfareIndex": 116.84,
        "headlineCpiImpactBasisPoints": 6.08,
        "transportCpiImpactPercentagePoints": 0.7073,
        "impliedNationalInflationDelta": 0.0608
      },
      {
        "shockPercentage": 20,
        "simulatedAirfareIndex": 140.21,
        "headlineCpiImpactBasisPoints": 14.51,
        "transportCpiImpactPercentagePoints": 1.6888,
        "impliedNationalInflationDelta": 0.1451
      }
    ]
  }
}
```

---

## 10. Scraper Management Endpoints

### `POST /api/scraper/run`
Manually triggers a scraping cycle. Can trigger all enabled jobs, a specific configured job, or an ad-hoc route.

- **Frontend Use Case:** "Trigger Scrape Now" button.
- **Headers:** `Content-Type: application/json`
- **Request Body Options:**

#### Option A: Run All Enabled Scrape Jobs
```json
{}
```

#### Option B: Run Specific Scrape Job by ID
```json
{
  "jobId": "66d123456789...",
  "days": 30
}
```

#### Option C: Run Ad-Hoc Route Scrape
```json
{
  "origin": "DEL",
  "destination": "GOI",
  "departureDate": "2026-09-15",
  "days": 30,
  "source": "Air India"
}
```

#### Success Response (`200 OK` - Option C Example)
```json
{
  "success": true,
  "data": {
    "message": "Route scrape executed successfully for 30 days",
    "job": "Air India DEL → GOI",
    "days": 30,
    "observationsCollected": 30
  }
}
```

---

### `GET /api/scraper/status`
Returns real-time scraping service runtime metrics and concurrency locking state.

- **Frontend Use Case:** Live scraping indicator pulse, last run timestamp, count of collected samples.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "running": false,
    "currentJob": null,
    "lastStartedAt": "2026-08-30T16:45:00.000Z",
    "lastCompletedAt": "2026-08-30T16:47:30.000Z",
    "lastSuccessAt": "2026-08-30T16:47:30.000Z",
    "lastErrorAt": null,
    "observationsCollected": 1280,
    "observationsSaved": 1280,
    "lastChange24h": 0.45,
    "lastChange7d": 1.20,
    "activeInFlightScrapes": 0
  }
}
```

---

### `GET /api/scraper/jobs`
Fetches all configured scraping job targets from MongoDB.

- **Frontend Use Case:** Scraper Configuration & Job Schedule Management Table.
- **Request Parameters:** None.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "66d123456789...",
      "source": "Air India",
      "origin": "BOM",
      "destination": "DEL",
      "departureDate": "2026-09-01T00:00:00.000Z",
      "days": 30,
      "enabled": true,
      "priority": 1,
      "lastRunAt": "2026-08-30T16:45:00.000Z",
      "lastSuccessAt": "2026-08-30T16:47:30.000Z",
      "lastErrorAt": null,
      "lastError": null,
      "lastFare": 6450,
      "lastChange24h": 0.8,
      "lastChange7d": 2.1,
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-30T16:47:30.000Z"
    }
  ]
}
```

---

### `POST /api/scraper/jobs`
Creates a new route scraping job in MongoDB.

- **Frontend Use Case:** "Add Scrape Job" Modal / Form.
- **Headers:** `Content-Type: application/json`
- **Request Body:**

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `origin` | `string` | Yes | N/A | Origin 3-letter IATA code (e.g. `"DEL"`) |
| `destination` | `string` | Yes | N/A | Destination 3-letter IATA code (e.g. `"BOM"`) |
| `source` | `string` | No | `"Air India"` | Scraper source (`"Air India"`, `"SpiceJet"`) |
| `departureDate`| `string` | No | Today | Forward start date (`"YYYY-MM-DD"`) |
| `days` | `number` | No | `30` | Forward scraping horizon in days |
| `enabled` | `boolean` | No | `true` | Enable automated cron execution |
| `priority` | `number` | No | `1` | Priority order (1 = highest) |

#### Example Request Body
```json
{
  "source": "Air India",
  "origin": "DEL",
  "destination": "BOM",
  "departureDate": "2026-09-15",
  "days": 30,
  "enabled": true,
  "priority": 1
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "66d987654321...",
    "source": "Air India",
    "origin": "DEL",
    "destination": "BOM",
    "departureDate": "2026-09-15T00:00:00.000Z",
    "days": 30,
    "enabled": true,
    "priority": 1,
    "createdAt": "2026-08-30T17:00:00.000Z",
    "updatedAt": "2026-08-30T17:00:00.000Z"
  }
}
```

#### Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_JOB_PARAMS",
    "message": "Origin and destination airport codes are required."
  }
}
```

---

### `PATCH /api/scraper/jobs/:id`
Updates an existing scrape job (enable/disable, change frequency, date, or priority).

- **Frontend Use Case:** Toggle switch to pause/resume job, inline edit priority.
- **Path Parameters:**
  - `id` (`string`, required): MongoDB ObjectId of the job
- **Headers:** `Content-Type: application/json`
- **Request Body:** Partial job object (any fields to modify):
```json
{
  "enabled": false,
  "priority": 2,
  "days": 45
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "66d123456789...",
    "source": "Air India",
    "origin": "BOM",
    "destination": "DEL",
    "enabled": false,
    "priority": 2,
    "days": 45,
    "updatedAt": "2026-08-30T17:05:00.000Z"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "Scrape job 66d123456789... not found."
  }
}
```

---

### `DELETE /api/scraper/jobs/:id`
Permanently deletes a configured scrape job.

- **Frontend Use Case:** "Delete Job" action button with confirmation dialog.
- **Path Parameters:**
  - `id` (`string`, required): MongoDB ObjectId of the job

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "message": "Scrape job deleted",
    "id": "66d123456789..."
  }
}
```

---

## 11. Ready-to-Use TypeScript Interfaces

Copy and paste these type definitions directly into your frontend codebase (`src/types/api.ts`):

```typescript
// =========================================================================
//  Standard API Response Wrappers
// =========================================================================
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  [key: string]: any;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =========================================================================
//  Airfare Index & Health
// =========================================================================
export interface HealthStatus {
  status: string;
  service: string;
  database: "connected" | "standalone";
  timestamp: string;
}

export interface AirfareIndexSummary {
  value: number;
  baseValue: number;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  referenceYear: number;
  basePeriod: {
    start: string;
    end: string;
  };
  calculatedAt: string;
}

export interface IndexHistoryPoint {
  timestamp: string;
  value: number;
}

export interface IndexHistoryData {
  period: string;
  granularity: string;
  points: IndexHistoryPoint[];
}

// =========================================================================
//  Route & Dashboard Models
// =========================================================================
export interface RouteSummaryItem {
  route: string;
  origin: string;
  destination: string;
  routeName: string;
  currentFare: number;
  baseFare: number;
  index: number;
  weight: number;
  passengerVolume: number;
  contribution: number;
  observations: number;
  change24h: number | null;
  change7d: number | null;
}

export interface DashboardData {
  summary: {
    indiaAirfareIndex: number;
    baseIndex: number;
    change24h: number | null;
    change7d: number | null;
    change30d: number | null;
    routesTracked: number;
    fareObservations: number;
    dataSources: {
      active: number;
      total: number;
    };
    lastUpdated: string;
  };
  trend: IndexHistoryPoint[];
  topRoutes: RouteSummaryItem[];
  dataStream: {
    status: "LIVE" | "MOCK";
    lastCollection: string;
    observations: number;
    activeSources: number;
    totalSources: number;
  };
  warnings: Array<{ route: string; reason: string }>;
}

export interface RouteDetail {
  route: string;
  origin: { code: string; city: string };
  destination: { code: string; city: string };
  currentFare: number;
  baseFare: number;
  routeIndex: number;
  weight: number;
  contribution: number;
  passengerVolume: number;
  observations: number;
  change24h: number | null;
  change7d: number | null;
  fareObservations: FareObservation[];
  historicalFare: Array<{ date: string; fare: number }>;
}

export interface FareObservation {
  _id?: string;
  source: string;
  airline: string;
  flightNo?: string;
  origin: string;
  destination: string;
  route: string;
  departureDate: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  totalFare: number;
  currency: string;
  scrapedAt: string;
}

// =========================================================================
//  Search Models
// =========================================================================
export interface ProviderComparison {
  status: string;
  observationsCount: number;
  minFare: number | null;
  maxFare: number | null;
  medianFare: number | null;
  meanFare: number | null;
}

export interface SearchResultData {
  source: "database" | "fresh_scrape" | "multi_provider_scrape";
  scraped: boolean;
  state: "DATABASE_FRESH" | "SCRAPED" | "DATABASE_STALE" | "NO_DATA" | "SCRAPE_FAILED";
  route?: string;
  observationsCount: number;
  latestScrapedAt?: string;
  priceComparison?: {
    providers: Record<string, ProviderComparison>;
    cheapest: string | null;
    comparedAt: string;
  };
  routeIndexEngine?: {
    engineStatus: string;
    methodology: string;
    route: string;
    routeIndex: number;
    currentRepresentativeFare: number | null;
    baseRepresentativeFare: number | null;
    baseSource: string;
    isBaselineEstablished: boolean;
    weight: number;
    contribution: number;
    passengerVolume: number;
    nationalIndex: number;
    basePeriod: { start: string; end: string };
    fareStats: {
      observationsCount: number;
      validObservationsCount: number;
      medianFare: number | null;
      meanFare: number | null;
      minFare: number | null;
      maxFare: number | null;
    };
  };
  results: any[];
  observations: FareObservation[];
}

// =========================================================================
//  CPI Augmentation Models
// =========================================================================
export interface CpiSummaryData {
  summary: {
    indiaAirfareIndex: number;
    baseIndex: number;
    airfareInflationRate: number;
    transportCpiImpactPercentagePoints: number;
    headlineCpiImpactBasisPoints: number;
    urbanImpactBasisPoints: number;
    ruralImpactBasisPoints: number;
    nowcastGeneralCpi: number;
    effectiveWeightInCpi: number;
    weights: {
      transportGroupInCpi: number;
      airTransportInGroup: number;
      effectiveTotalWeight: number;
    };
    publicationAdvantage: {
      leadTimeDays: number;
      frequency: string;
      officialReleaseFrequency: string;
    };
    calculatedAt: string;
  };
  topCorridorContributors: RouteCpiContribution[];
  recentComparison: CpiComparisonPoint[];
  meta: {
    methodology: string;
    basePeriod: { start: string; end: string };
    referenceYear: number;
    sourcesTracked: string[];
  };
}

export interface RouteCpiContribution {
  route: string;
  routeName: string;
  origin: string;
  destination: string;
  currentFare: number;
  baseFare: number;
  routeIndex: number;
  routeWeightInBasket: number;
  airIndexContribution: number;
  transportGroupContributionPct: number;
  headlineCpiContributionBps: number;
  passengerVolume: number;
}

export interface CpiComparisonPoint {
  month: string;
  generalCpi: number | null;
  transportCpi: number | null;
  airfareCpiOfficial: number | null;
  realTimeNowcast: number | null;
  lagDays: number;
  isNowcast?: boolean;
}

export interface CpiShockSimulation {
  shockPercentage: number;
  simulatedAirfareIndex: number;
  headlineCpiImpactBasisPoints: number;
  transportCpiImpactPercentagePoints: number;
  impliedNationalInflationDelta: number;
}

// =========================================================================
//  Scraper Models
// =========================================================================
export interface ScraperStatus {
  running: boolean;
  currentJob: string | null;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  observationsCollected: number;
  observationsSaved: number;
  lastChange24h: number;
  lastChange7d: number;
  activeInFlightScrapes: number;
}

export interface ScrapeJob {
  _id: string;
  source: string;
  origin: string;
  destination: string;
  departureDate: string;
  days: number;
  enabled: boolean;
  priority: number;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  lastError?: string;
  lastFare?: number;
  lastChange24h?: number;
  lastChange7d?: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 12. Frontend Integration Helper

A drop-in client library using native `fetch` with typed responses (`src/api/client.ts`):

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    const message = json.error?.message || `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // System
  getHealth: () => apiRequest<any>("/api/health"),
  refreshIndex: () => apiRequest<{ message: string }>("/api/refresh", { method: "POST" }),

  // Dashboard & Master Index
  getDashboard: () => apiRequest<any>("/api/dashboard"),
  getIndex: () => apiRequest<any>("/api/index"),
  getIndexHistory: (period = "30d", granularity = "daily") =>
    apiRequest<any>(`/api/index/history?period=${period}&granularity=${granularity}`),

  // Routes
  getRoutes: (params?: { search?: string; sort?: string; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<any>(`/api/routes${query ? `?${query}` : ""}`);
  },
  getRouteDetail: (route: string) => apiRequest<any>(`/api/routes/${encodeURIComponent(route)}`),
  getRouteHistory: (route: string, period = "30d") =>
    apiRequest<any>(`/api/routes/${encodeURIComponent(route)}/history?period=${period}`),

  // Search & Live Scrape
  search: (query: string, options?: { departureDate?: string; days?: number; source?: string }) => {
    const params = new URLSearchParams({ q: query, ...(options as any) }).toString();
    return apiRequest<any>(`/api/search?${params}`);
  },

  // Data Pipeline & Quality
  getDataStatus: () => apiRequest<any>("/api/data/status"),
  getDataQuality: () => apiRequest<any>("/api/data/quality"),

  // CPI Augmentation & Macro-Inflation
  getCpiSummary: () => apiRequest<any>("/api/cpi/summary"),
  getCpiComparison: () => apiRequest<any>("/api/cpi/comparison"),
  getCpiDecomposition: () => apiRequest<any>("/api/cpi/decomposition"),
  simulateCpiShocks: (shocks?: string | number) => {
    const query = shocks !== undefined ? `?shocks=${shocks}` : "";
    return apiRequest<any>(`/api/cpi/simulate${query}`);
  },

  // Scraper Management
  getScraperStatus: () => apiRequest<any>("/api/scraper/status"),
  runScraper: (body: any) =>
    apiRequest<any>("/api/scraper/run", { method: "POST", body: JSON.stringify(body) }),
  getScrapeJobs: () => apiRequest<any[]>("/api/scraper/jobs"),
  createScrapeJob: (job: any) =>
    apiRequest<any>("/api/scraper/jobs", { method: "POST", body: JSON.stringify(job) }),
  updateScrapeJob: (id: string, updates: any) =>
    apiRequest<any>(`/api/scraper/jobs/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
  deleteScrapeJob: (id: string) =>
    apiRequest<any>(`/api/scraper/jobs/${id}`, { method: "DELETE" }),
};
```
