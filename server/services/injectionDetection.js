// Prompt Injection Detection Service

const INJECTION_PATTERNS = [
  {
    pattern: /ignore\s+(previous|above|all|prior)\s+(instructions?|prompts?|rules?|commands?)/i,
    severity: 'critical',
    description: 'Instruction override attempt'
  },
  {
    pattern: /system\s*[:=]\s*you\s+(are|act|behave)/i,
    severity: 'critical',
    description: 'System role manipulation'
  },
  {
    pattern: /forget\s+(everything|all|your\s+instructions?)/i,
    severity: 'high',
    description: 'Memory wipe attempt'
  },
  {
    pattern: /reveal\s+(your|the|system)\s+(prompt|instructions?|rules?)/i,
    severity: 'high',
    description: 'Prompt extraction attempt'
  },
  {
    pattern: /(act|pretend|roleplay)\s+as\s+(a\s+)?(different|new|another|jailbroken)/i,
    severity: 'medium',
    description: 'Role hijacking attempt'
  },
  {
    pattern: /\[SYSTEM\]|\[INST\]|\<\|system\|\>|\<\|im_start\|\>/i,
    severity: 'critical',
    description: 'System token injection'
  },
  {
    pattern: /disable\s+(safety|security|filtering|guardrails)/i,
    severity: 'critical',
    description: 'Security bypass attempt'
  }
];

export async function detectInjection(text) {
  for (const { pattern, severity, description } of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isInjection: true,
        severity,
        description,
        matchedPattern: pattern.source
      };
    }
  }
  
  return {
    isInjection: false,
    severity: null,
    description: 'No injection detected'
  };
}
