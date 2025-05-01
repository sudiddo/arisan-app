"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SessionDebug() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState<string>("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setCookies(document.cookie);
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-xs overflow-auto text-xs">
      <div className="font-bold mb-2 flex justify-between items-center">
        <span>Session Debug</span>
        <button
          onClick={toggleExpanded}
          className="text-xs px-2 py-1 bg-gray-700 rounded"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div>
        Status:{" "}
        <span
          className={
            status === "authenticated" ? "text-green-500" : "text-yellow-500"
          }
        >
          {status}
        </span>
      </div>

      {expanded && (
        <>
          <div className="mt-2">
            <div className="font-semibold mb-1">Cookies:</div>
            <div className="bg-gray-800 p-2 rounded whitespace-pre-wrap break-all">
              {cookies || "No cookies found"}
            </div>
          </div>
          <div className="mt-2">
            <div className="font-semibold mb-1">Session Data:</div>
            <pre className="bg-gray-800 p-2 rounded whitespace-pre-wrap break-all">
              {JSON.stringify(session, null, 2) || "No session data"}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
