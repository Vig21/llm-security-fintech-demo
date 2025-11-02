import React, { useState } from "react";
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const SecurityDemo = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const processQuery = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationId: "security-demo-" + Date.now(),
        }),
      });

      const data = await response.json();

      if (data.status === "blocked") {
        setResponse({
          status: "blocked",
          reason: data.reason,
          severity: data.severity,
          piiDetected: data.piiDetected || [],
        });
      } else if (data.status === "success") {
        setResponse({
          status: "success",
          original: input,
          redacted:
            data.metadata.piiRedacted.length > 0
              ? "Message redacted before processing"
              : input,
          piiDetected: data.metadata.piiRedacted.map((type) => ({ type })),
          finalResponse: data.response,
          metadata: data.metadata,
        });
      } else {
        setResponse({
          status: "error",
          reason: data.message || "An error occurred",
        });
      }
    } catch (error) {
      console.error("Error processing query:", error);
      setResponse({
        status: "error",
        reason: "Failed to connect to security services",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Security Demo</h1>
        </div>
        <p className="text-cyan-200 text-sm">
          Test PII detection, prompt injection protection, and AI response
          processing
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter test query..."
          className="w-full p-4 bg-slate-800/50 text-white rounded-lg border border-cyan-500/30 min-h-32 mb-4"
        />
        <button
          onClick={processQuery}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Process Query"}
        </button>
      </div>

      {response && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div
            className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
              response.status === "blocked"
                ? "bg-red-500/20 border border-red-500/50"
                : "bg-green-500/20 border border-green-500/50"
            }`}
          >
            {response.status === "blocked" ? (
              <>
                <XCircle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-red-200 font-semibold">Query Blocked</p>
                  <p className="text-red-300 text-sm">{response.reason}</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-green-200 font-semibold">
                    Processed Securely
                  </p>
                  <p className="text-green-300 text-sm">
                    PII detected: {response.piiDetected.length}
                  </p>
                </div>
              </>
            )}
          </div>

          {response.status === "error" && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-red-200 font-semibold">Error</p>
                  <p className="text-red-300 text-sm">{response.reason}</p>
                </div>
              </div>
            </div>
          )}

          {response.status === "success" && (
            <>
              {response.piiDetected.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <h3 className="text-yellow-200 font-semibold mb-2">
                    PII Detected & Redacted:
                  </h3>
                  {response.piiDetected.map((pii, idx) => (
                    <div
                      key={idx}
                      className="text-yellow-300 text-sm font-mono"
                    >
                      {pii.type}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <h3 className="text-blue-200 font-semibold mb-2">
                  AI Response:
                </h3>
                <p className="text-blue-300 text-sm">
                  {response.finalResponse}
                </p>
              </div>

              {response.metadata && (
                <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-4">
                  <h3 className="text-slate-200 font-semibold mb-2">
                    Security Metadata:
                  </h3>
                  <div className="text-slate-300 text-sm space-y-1">
                    <div>PII Detected: {response.metadata.piiDetected}</div>
                    <div>
                      Injection Check: {response.metadata.injectionCheck}
                    </div>
                    <div>
                      Privacy Applied:{" "}
                      {response.metadata.privacyApplied ? "Yes" : "No"}
                    </div>
                    <div>
                      Response PII Check: {response.metadata.responsePIICheck}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SecurityDemo;
