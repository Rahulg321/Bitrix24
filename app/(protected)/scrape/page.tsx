"use client"

import { auth } from "@/auth";
import { addScraperResultsToDatabase } from "@/app/actions/add-scraper-database";
import axios from "axios";
import React, { useEffect, useState, useTransition, use } from "react";

const Page = ({ params, searchParams }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState([]);

  //const userSession = await auth();

  const url = use(searchParams).url;
  const firmName = use(searchParams).firmName;

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = () => {
      console.log("Connected to server");
      newSocket.send(JSON.stringify({ type: "register", userId: 42 }));
    };

    newSocket.onmessage = (event) => {
      const result = JSON.parse(event.data);
      console.log("Results", result);

      if (result.type === "registered") {
        alert("Registered to the server");
      }

      if (result.type === "problem_done") {
        console.log("Problem done", result);

        addScraperResultsToDatabase(result);
      }
    };

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleScrapeClick = async (targetUrl: String, targetFirmName: String) => {
    startTransition(async () => {
      console.log("Scraping:", targetFirmName, "at", targetUrl);
      const response = await axios.post("/api/scrape", {
        url: targetUrl,
        firmName: targetFirmName,
        userId: 42,
      });
      console.log(response.data);
    });
  };

  if (!socket) {
    return (
      <div>
        <h1>Connecting to server...</h1>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
    <h1>Product List</h1>
    {notifications.map((notification) => (
      <div key={notification.id}>{notification.message}</div>
    ))}
    <button
    onClick={() => handleScrapeClick(url, firmName)}
    style={{
      padding: "10px 20px",
      fontSize: "16px",
      cursor: "pointer",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
    }}
    disabled={isPending || !socket}
    >
    {isPending ? "Screening..." : "Screen All"}
    </button>
    </div>
  );
};

export default Page;
