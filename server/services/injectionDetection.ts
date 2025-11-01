import { injectionGuard } from '@presidio-dev/hai-guardrails'

const heuristicInjectionGuard = injectionGuard(
	{
		roles: ['user'],
	},
	{
		mode: 'pattern',
		threshold: 0.8,
	}
)

export async function detectInjection(text: string) {
    const results = await heuristicInjectionGuard([
     { role: 'user', content: text }
    ])

    if (!results[0].passed) {
      return {
        isInjection: true,
        severity: 'high',
        description: 'Potential Injection Detected'
      };
    }
    
    return {
      isInjection: false,
      severity: null,
      description: 'No injection detected',
      details: {
        aiGuardScore: results[0]
      }
    };
}