// Banking-specific PII Detection Service

const BANKING_PII_PATTERNS = {
  ssn: {
    regex: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
    label: 'SSN',
    sensitivity: 'critical'
  },
  email: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    label: 'Email',
    sensitivity: 'high'
  },
  phone: {
    regex: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    label: 'Phone',
    sensitivity: 'medium'
  },
  creditCard: {
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    label: 'CreditCard',
    sensitivity: 'critical'
  },
  accountNumber: {
    regex: /\b[Aa]ccount\s*#?\s*:?\s*\d{8,17}\b/g,
    label: 'AccountNumber',
    sensitivity: 'critical'
  },
  routingNumber: {
    regex: /\b[Rr]outing\s*#?\s*:?\s*\d{9}\b/g,
    label: 'RoutingNumber',
    sensitivity: 'critical'
  },
  cvv: {
    regex: /\b[Cc][Vv][Vv]\s*:?\s*\d{3,4}\b/g,
    label: 'CVV',
    sensitivity: 'critical'
  }
};

export async function detectPII(text) {
  const detected = [];
  
  for (const [type, { regex, label, sensitivity }] of Object.entries(BANKING_PII_PATTERNS)) {
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => {
        detected.push({
          type: label,
          value: match,
          sensitivity,
          position: text.indexOf(match)
        });
      });
    }
  }

  return {
    detected,
    hasCriticalPII: detected.some(p => p.sensitivity === 'critical'),
    count: detected.length
  };
}

export function redactPII(text, detectedPII) {
  let redacted = text;
  const sorted = [...detectedPII].sort((a, b) => b.position - a.position);
  
  sorted.forEach(pii => {
    redacted = redacted.replace(pii.value, `[${pii.type.toUpperCase()}_REDACTED]`);
  });
  
  return redacted;
}
