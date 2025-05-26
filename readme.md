# To Better Me – Frontend

**A self-improvement web app to log daily sleep and personal summaries, and visualize sleep trends over time. Built with React and Recharts.**

---

## ⚙️ Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, React Router
* **Charts:** Recharts
* **Forms & State:** React Hooks, Fetch API

---

## 🚀 Getting Started – Frontend

### 1. 📦 Install dependencies

```bash
npm install
```

### 2. 🧑‍💻 Run the development server

```bash
npm run dev
```

### 3. 🔗 Proxy Setup (Optional)

If your backend runs on a different port (e.g. `64000`), set up `vite.config.ts` or use a proxy in your `.env` or development config to avoid CORS issues.

---

## 🧭 Pages & Features

### 🔐 Auth Pages

* **`/sign_up`** – Create a new user account
* **`/sign_in`** – Sign into existing account

### 📝 Daily Entry Page (`/entry`)

* Select date (Today / Yesterday)
* Add multiple sleep sessions with:

  * Start/End time (JS `Date` format)
  * `isExtra` flag
* Enter a written summary of the day
* Submits to `POST /api/user/daily_entry`

### 👤 Profile Page (`/profile`)

* Displays user info from `GET /api/user/get_current`
* Bar chart of sleep hours over the past 30 days using **Recharts**

  * Green bars = 7–8 hrs of sleep
  * Red bars = outside that range
  * Click a bar to view the day’s summary

---

## 🔗 Backend API Integration

This frontend connects to the following backend routes:

### 🔐 Auth

| Endpoint        | Description             |
| --------------- | ----------------------- |
| `POST /sign_up` | Create new user         |
| `POST /sign_in` | Sign in & receive token |

### 👤 User Actions (Requires Auth Token)

| Endpoint                   | Description                           |
| -------------------------- | ------------------------------------- |
| `GET /get_current`         | Returns current user & deletes others |
| `POST /daily_entry`        | Submit sleep + summary data           |
| `GET /get_all_entries`     | Get all past entries                  |
| `DELETE /delete_entry/:id` | Remove specific day’s entry           |

---

## 📊 Chart Logic (Recharts)

* **Bar chart** displays total sleep hours per day
* Calculated dynamically from multiple sleep intervals
* Color-coded:

  * ✅ **Green** if between 7–8 hours
  * ❌ **Red** otherwise
* Clicking a bar shows the full **daily summary**

---

## 📌 Current Features

* [x] Signup / Signin UI
* [x] Input multiple sleep intervals
* [x] Mark sleep as extra or not
* [x] Daily summary notes
* [x] Auto-reset form after submission
* [x] Sleep graph (color-coded)
* [x] Click-to-view summary

---

## 🛠 Planned Improvements

* [ ] Summary generation using OpenAI (backend)
* [ ] Weekly & monthly analytics
* [ ] Editable entries
* [ ] Offline support

---

## 🛡️ License

This project is licensed under the MIT License.

---

## 🤝 Contributing

PRs welcome! Fork the repo, make your improvements, and submit a pull request.

---