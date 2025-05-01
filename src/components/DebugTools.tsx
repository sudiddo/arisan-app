"use client";

import { useEffect, useState } from "react";

export default function DebugTools() {
  const [debugInfo, setDebugInfo] = useState({
    cookies: "",
    localStorage: [] as string[],
    url: "",
    redirectHistory: [] as string[],
  });

  // Track page loads to detect redirect loops
  useEffect(() => {
    // Get all cookies
    const cookies = document.cookie;

    // Get all localStorage
    const localStorageItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageItems.push(`${key}: ${localStorage.getItem(key)}`);
      }
    }

    // Get current URL
    const url = window.location.href;

    // Update redirect history
    const redirectHistory = JSON.parse(
      localStorage.getItem("redirectHistory") || "[]"
    );
    if (redirectHistory.length > 20) {
      redirectHistory.shift(); // Keep history limited to last 20 entries
    }
    redirectHistory.push(url);
    localStorage.setItem("redirectHistory", JSON.stringify(redirectHistory));

    setDebugInfo({
      cookies,
      localStorage: localStorageItems,
      url,
      redirectHistory,
    });

    // Log debug info to console for easier access
    console.log("=== AUTH DEBUG INFO ===");
    console.log("URL:", url);
    console.log("Cookies:", cookies);
    console.log("Redirect History:", redirectHistory);

    return () => {
      // Clean up enormous histories
      if (redirectHistory.length > 50) {
        localStorage.setItem("redirectHistory", JSON.stringify([]));
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded-lg z-50 max-w-xs overflow-auto text-xs">
      <div className="font-bold">REDIRECT LOOP DETECTED!</div>
      <div className="mt-2">
        <div>Current URL: {debugInfo.url}</div>
        <div className="mt-2">
          <div className="font-semibold">Auth Cookies:</div>
          <div className="bg-black/50 p-2 rounded">
            {debugInfo.cookies || "No cookies"}
          </div>
        </div>
        <div className="mt-2">
          <div className="font-semibold">Recent Redirects:</div>
          <div className="bg-black/50 p-2 rounded h-20 overflow-y-auto">
            {debugInfo.redirectHistory.slice(-5).map((url, i) => (
              <div key={i}>{url}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
