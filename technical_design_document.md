### Technical Design Document (TDD): tsink (v1.1)

## 1. App Overview

**tsink** is a mobile-first Progressive Web App (PWA) for independent service providers (hairdressers, masseurs, personal trainers, cleaners, etc.). It synchronizes Google Calendar events with a Google Spreadsheet "database" to track work hours, income, and expenses without a dedicated backend. Hostable on GitHub Pages.

## 2. Tech Stack

* **Core:** React 19 (Vite), TypeScript.
* **Styling:** Tailwind CSS v4 (Dark/Light/System theme support via class-based `dark:` variant).
* **State & Data:**
  * `TanStack Query` (Async sync with Google APIs).
  * `Zustand` (Global UI state, persisted settings in localStorage).
* **Visuals:** `Recharts` (Line charts for trends), `Lucide React` (Icons).
* **APIs:** Google Calendar API, Google Sheets API v4 (direct REST fetch, no gapi).
* **Auth:** OAuth2 via Google Identity Services (GIS) token client.
* **Localization:** `i18next` (English/Hungarian).
* **PWA:** `vite-plugin-pwa` with service worker and Google API runtime caching.

## 3. Data Schema (Google Sheets)

### Sheet: `income`

| Field | Type | Note |
| --- | --- | --- |
| `ical_uid` | String (PK) | Unique ID from Google Calendar. |
| `date` | ISO String | Date for filtering. |
| `amount` | Number | User-entered value. |
| `category` | String | User-selected category OR free-typed note. |
| `is_unrelevant` | Boolean | Flag to ignore in totals. |

### Sheet: `expenses`

| Field | Type | Note |
| --- | --- | --- |
| `id` | UUID | Unique entry ID. |
| `name` | String | Description. |
| `date` | ISO String | Date of the expense (YYYY-MM-DD). |
| `amount` | Number | Cost. |
| `is_recurring` | Boolean | Monthly fixed cost flag. |

### Sheet: `config`

| Key | Value |
| --- | --- |
| `categories` | JSON string of user categories. |

## 4. Feature Specifications

### Work Hours Tab
* Daily view with left/right arrow navigation AND a native date picker (click on date text to open).
* Cards display Calendar events with:
  * Event name, start/end time, duration.
  * Amount input field (debounced save).
  * Category combo-input: select from predefined categories OR free-type a custom note. Inline "add new category" option in the dropdown.
  * Toggle to mark event as irrelevant.

### Expenses Tab
* **Inline add form card** at the top with name, date, amount, and recurring toggle.
* Below the form: list of existing expenses with edit/delete.
* Separate section for fixed recurring costs.

### Summary Tab
* Displays **all months** (from data) as scrollable cards, newest first.
* Each month card shows: Hours worked, Days worked, Total Income, Profit (income minus expenses).
* **Current month does NOT display profit** (incomplete data).
* Each month card has an expandable section showing days with missing data (missing amount AND not marked irrelevant).
* Incomplete days expand to show the actual events inline with amount/category inputs, editable in-place.

### Settings Tab
* Account: user info, login/logout.
* Spreadsheet: display current ID, option to **change to a different spreadsheet** (paste URL or create new).
* Calendar ID input.
* Appearance: Theme toggle (Light/Dark/System), Language toggle (EN/HU).
* Data: Currency input, Category management (add/delete), Export/Import JSON.

## 5. Deployment

* GitHub Pages compatible: Vite `base` config for repo sub-path.
* README includes a quick-start guide for setting up the Google Cloud project (OAuth consent screen, API keys, Calendar & Sheets API enablement).
