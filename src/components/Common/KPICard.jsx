import React from "react";

const KPICard = ({ icon, value, label, trend, trendUp }) => {
  return (
    <div
      className="kpi-card"
      style={{ "--kpi-color": "var(--accent)", "--kpi-rgb": "37,99,235" }}
    >
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
        <span className={`kpi-trend ${trendUp ? "up" : "down"}`}>{trend}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
};

export default KPICard;
