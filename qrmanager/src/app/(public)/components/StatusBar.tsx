"use client";
import { useState, useEffect } from "react";

export default function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleDateString("es-BO", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="status-bar">
      <div className="status-inner">
        <span className="status-dot" />
        <span className="status-text">Sistema en línea — Verificación en tiempo real</span>
        <span className="status-divider" />
        <span className="status-time">{time}</span>
      </div>
    </div>
  );
}
