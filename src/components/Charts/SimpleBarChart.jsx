import React from "react";

const SimpleBarChart = ({
  data,
  colors = ["var(--danger)", "var(--warning)"],
}) => {
  if (!data || data.length === 0)
    return <div className="empty-chart">لا توجد بيانات</div>;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);

  return (
    <div className="chart-bars">
      {data.map((item, idx) => (
        <div
          key={idx}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: colors[idx % colors.length],
            }}
          >
            {item.value}
          </div>
          <div
            className="chart-bar"
            style={{
              backgroundColor: colors[idx % colors.length],
              height: `${Math.round((item.value / maxValue) * 70) + 10}px`,
              width: "100%",
            }}
          />
          <div className="chart-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default SimpleBarChart;
