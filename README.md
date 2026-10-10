# Inventory React

A React-based inventory management dashboard for managing users, products, purchasing, orders, and refunds. The dashboard includes sales summaries and charts, and comes with sample data so you can explore the interface locally.



## Features

- Dashboard with sales metrics, sales trends, top-selling products, and recent orders
- User and product management
- Purchasing, order, and refund screens
- Demo sign-in with Admin, User, and Viewer roles
- Browser-based persistence using `localStorage`
- Responsive interface built with Tailwind CSS

## Getting started

### Requirements

- Node.js and npm

### Install and run

```bash
npm install
npm start
```

The development server runs at [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@gmail.com` | `admin123` |
| User | `user@gmail.com` | `user123` |


These credentials are for local demonstration only. They are included in the client-side source and must not be treated as secure credentials.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the webpack development server |
| `npm run build` | Create a production build in `dist/` |

## Tech stack

- React
- React Router
- Tailwind CSS
- Recharts
- Lucide React
- Webpack
