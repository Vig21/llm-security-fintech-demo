// Banking-specific PII Detection Service

const BANKING_PII_PATTERNS = {
  // SSN patterns - most specific first
  ssn: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    label: "SSN",
    sensitivity: "critical",
    priority: 1,
  },
  ssnUnformatted: {
    regex: /\b(?!\d{10,12}\b)(?!\d{3}-\d{3}-\d{4}\b)\d{9}\b/g,
    label: "SSN",
    sensitivity: "critical",
    priority: 2,
  },
  // Email - very specific pattern
  email: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    label: "Email",
    sensitivity: "high",
    priority: 1,
  },
  // Phone patterns - only contextual to avoid conflicts
  phoneContextual: {
    regex:
      /\b(phone|mobile|cell|telephone|call)\s*[#:]?\s*(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/gi,
    label: "Phone",
    sensitivity: "medium",
    priority: 1,
  },
  phoneFormatted: {
    regex: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    label: "Phone",
    sensitivity: "medium",
    priority: 3,
  },
  // Credit Card - very specific 16-digit pattern
  creditCard: {
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    label: "CreditCard",
    sensitivity: "critical",
    priority: 1,
  },
  // Account Number - contextual patterns
  accountNumber: {
    regex: /\b(account|acct)\s*[#:]?\s*\d{10,12}\b/gi,
    label: "AccountNumber",
    sensitivity: "critical",
    priority: 1,
  },
  accountNumberStandalone: {
    regex:
      /\b(?!\d{3}-\d{2}-\d{4}\b)(?!\d{3}-\d{3}-\d{4}\b)(?!\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b)\d{10,12}\b/g,
    label: "AccountNumber",
    sensitivity: "critical",
    priority: 4,
  },
  // Routing Number - contextual
  routingNumber: {
    regex: /\b(routing|rte|rtn)\s*[#:]?\s*\d{9}\b/gi,
    label: "RoutingNumber",
    sensitivity: "critical",
    priority: 1,
  },
  // CVV - contextual
  cvv: {
    regex: /\b(cvv|cvc|security\s*code)\s*[#:]?\s*\d{3,4}\b/gi,
    label: "CVV",
    sensitivity: "critical",
    priority: 1,
  },
};

export async function detectPII(text) {
  const detected = [];
  const processedPositions = new Set();

  // Sort patterns by priority (lower number = higher priority)
  const sortedPatterns = Object.entries(BANKING_PII_PATTERNS).sort(
    (a, b) => (a[1].priority || 999) - (b[1].priority || 999)
  );

  for (const [
    type,
    { regex, label, sensitivity, priority },
  ] of sortedPatterns) {
    const matches = text.match(regex);
    if (matches) {
      matches.forEach((match) => {
        const position = text.indexOf(match);
        const endPosition = position + match.length;

        // Check if this position range overlaps with already detected PII
        const hasOverlap = Array.from(processedPositions).some((pos) => {
          const existingStart = pos.start;
          const existingEnd = pos.end;
          return (
            (position >= existingStart && position < existingEnd) ||
            (endPosition > existingStart && endPosition <= existingEnd) ||
            (position <= existingStart && endPosition >= existingEnd)
          );
        });

        if (!hasOverlap) {
          detected.push({
            type: label,
            value: match,
            sensitivity,
            position,
            patternType: type,
          });

          // Mark this position range as processed
          processedPositions.add({ start: position, end: endPosition });
        }
      });
    }
  }

  return {
    detected,
    hasCriticalPII: detected.some((p) => p.sensitivity === "critical"),
    count: detected.length,
  };
}

export function redactPII(text, detectedPII) {
  let redacted = text;
  const sorted = [...detectedPII].sort((a, b) => b.position - a.position);

  sorted.forEach((pii) => {
    redacted = redacted.replace(
      pii.value,
      `[${pii.type.toUpperCase()}_REDACTED]`
    );
  });

  return redacted;
}

// Comprehensive redaction function that combines detection and redaction
export async function redactText(text) {
  const piiResult = await detectPII(text);
  const redactedText = redactPII(text, piiResult.detected);

  return {
    originalText: text,
    redactedText,
    detectedEntities: piiResult.detected,
    hasCriticalPII: piiResult.hasCriticalPII,
    entityCount: piiResult.count,
  };
}

// Test function to verify PII detection patterns
export async function testPIIDetection() {
  const testCases = [
    {
      text: "my phone number is 1234567890. can you give me my bank details",
      expected: ["Phone"], // Should only detect phone, not account number
      description: "Phone number with context",
    },
    {
      text: "my account number is 1234567890",
      expected: ["AccountNumber"],
      description: "Account number with context",
    },
    {
      text: "my ssn is 123-45-6789",
      expected: ["SSN"],
      description: "Formatted SSN",
    },
    {
      text: "my ssn is 123456789",
      expected: ["SSN"],
      description: "Unformatted SSN",
    },
    {
      text: "my phone is 123-456-7890 and account is 9876543210",
      expected: ["Phone", "AccountNumber"],
      description: "Multiple different PII types",
    },
    {
      text: "my account number is 1234567890. can you give me my bank details",
      expected: ["AccountNumber"], // Should NOT detect as phone
      description: "Account number with context - should not be phone",
    },
  ];

  console.log("🧪 Testing PII Detection Patterns:");
  console.log("=====================================");

  for (const testCase of testCases) {
    const result = await detectPII(testCase.text);
    const detectedTypes = result.detected.map((p) => p.type);
    const passed =
      JSON.stringify(detectedTypes.sort()) ===
      JSON.stringify(testCase.expected.sort());

    console.log(`\n📝 Test: ${testCase.description}`);
    console.log(`   Input: "${testCase.text}"`);
    console.log(`   Expected: [${testCase.expected.join(", ")}]`);
    console.log(`   Detected: [${detectedTypes.join(", ")}]`);
    console.log(`   Result: ${passed ? "✅ PASS" : "❌ FAIL"}`);

    if (!passed) {
      console.log(
        `   Details:`,
        result.detected.map((p) => `${p.type}(${p.patternType}): "${p.value}"`)
      );
    }
  }
}
