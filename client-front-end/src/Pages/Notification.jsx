// src/Pages/Notification.jsx
import React from "react";
import "./Notification.css";
import CustomerNotifications from "./PagesCustomer/CustomerNotifications";

export default function Notification() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || "customer";

  if (role === "seller") {
    const SellerNotifications = require("./PagesAdmin/SellerNotifications").default;
    return <SellerNotifications />;
  }
  return <CustomerNotifications />;
}
