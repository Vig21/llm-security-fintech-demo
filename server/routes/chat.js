import express from 'express';
import { detectPII, redactPII } from '../services/piiDetection.js';
import { detectInjection } from '../services/injectionDetection.ts';
import { processWithLLM } from '../services/llmService.js';
import { applyDifferentialPrivacy } from '../services/privacyService.js';

const router = express.Router();

router.post('/message', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    console.log(`\n📨 Processing message from conversation: ${conversationId}`);

    // Step 1: PII Detection
    const piiResult = await detectPII(message);
    if (piiResult.detected.length > 0) {
      console.log(`⚠️  PII Detected: ${piiResult.detected.length} items`);
      piiResult.detected.forEach(pii => {
        console.log(`   - ${pii.type}: ${pii.value.substring(0, 4)}...`);
      });
    }

    // Step 2: Prompt Injection Check
    const injectionCheck = await detectInjection(message);
    if (injectionCheck.isInjection) {
      console.log(`🚫 Injection attempt blocked! Severity: ${injectionCheck.severity}`);
      return res.status(403).json({
        status: 'blocked',
        reason: injectionCheck.description,
        severity: injectionCheck.severity,
        piiDetected: piiResult.detected
      });
    }

    // Step 3: Redact PII
    const redactedMessage = redactPII(message, piiResult.detected);
    console.log(`🔒 Message redacted and ready for LLM`);

    // Step 4: Process with LLM
    const llmResponse = await processWithLLM(redactedMessage, conversationId);
    console.log(`🤖 LLM response generated`);

    // Step 5: Apply Differential Privacy
    const privateResponse = applyDifferentialPrivacy(llmResponse);

    // Step 6: Check response for PII leakage
    const responsePII = await detectPII(privateResponse);
    const finalResponse = responsePII.detected.length > 0 
      ? redactPII(privateResponse, responsePII.detected)
      : privateResponse;

    console.log(`✅ Response secured and sent\n`);

    res.json({
      status: 'success',
      response: finalResponse,
      metadata: {
        piiDetected: piiResult.detected.length,
        piiRedacted: piiResult.detected.map(p => p.type),
        injectionCheck: 'passed',
        privacyApplied: true,
        responsePIICheck: responsePII.detected.length === 0 ? 'clean' : 'redacted'
      }
    });

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred processing your request'
    });
  }
});

export default router;
