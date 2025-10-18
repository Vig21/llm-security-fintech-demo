import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const SecurityDemo = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);

  const piiPatterns = {
    ssn: { regex: /\b\d{3}-\d{2}-\d{4}\b/g, label: 'SSN' },
    email: { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: 'Email' },
    phone: { regex: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, label: 'Phone' },
    creditCard: { regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, label: 'CreditCard' },
    accountNum: { regex: /\b[Aa]ccount\s*#?\s*:?\s*\d{8,12}\b/g, label: 'AccountNumber' }
  };

  const injectionPatterns = [
    { pattern: /ignore\s+(previous|above|all)\s+(instructions|prompts|rules)/i, severity: 'high' },
    { pattern: /system\s*:\s*you\s+are/i, severity: 'high' },
    { pattern: /reveal\s+(your|the)\s+(prompt|instructions)/i, severity: 'medium' }
  ];

  const detectPII = (text) => {
    const detected = [];
    let redactedText = text;
    Object.entries(piiPatterns).forEach(([type, { regex, label }]) => {
      const matches = text.match(regex);
      if (matches) {
        matches.forEach(match => {
          detected.push({ type: label, value: match });
          redactedText = redactedText.replace(match, `[${label}_REDACTED]`);
        });
      }
    });
    return { detected, redactedText };
  };

  const detectInjection = (text) => {
    for (const { pattern, severity } of injectionPatterns) {
      if (pattern.test(text)) {
        return { detected: true, severity };
      }
    }
    return { detected: false };
  };

  const processQuery = () => {
    const { detected: piiDetected, redactedText } = detectPII(input);
    const injectionCheck = detectInjection(input);

    if (injectionCheck.detected) {
      setResponse({
        status: 'blocked',
        reason: 'Prompt injection detected',
        severity: injectionCheck.severity,
        piiDetected
      });
      return;
    }

    setResponse({
      status: 'success',
      original: input,
      redacted: redactedText,
      piiDetected,
      finalResponse: 'Query processed securely. Your banking information is protected.'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Security Demo (Hardcoded)</h1>
        </div>
        <p className="text-cyan-200 text-sm">Test PII detection and prompt injection protection</p>
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
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg"
        >
          Process Query
        </button>
      </div>

      {response && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
            response.status === 'blocked' 
              ? 'bg-red-500/20 border border-red-500/50' 
              : 'bg-green-500/20 border border-green-500/50'
          }`}>
            {response.status === 'blocked' ? (
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
                  <p className="text-green-200 font-semibold">Processed Securely</p>
                  <p className="text-green-300 text-sm">PII detected: {response.piiDetected.length}</p>
                </div>
              </>
            )}
          </div>

          {response.status === 'success' && response.piiDetected.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <h3 className="text-yellow-200 font-semibold mb-2">PII Redacted:</h3>
              {response.piiDetected.map((pii, idx) => (
                <div key={idx} className="text-yellow-300 text-sm font-mono">
                  {pii.type}: {pii.value}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecurityDemo;
