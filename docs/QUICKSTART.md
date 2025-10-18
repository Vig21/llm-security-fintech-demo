# Quick Start Guide

## 1️⃣ Installation (2 minutes)

```bash
cd llm-security-fintech-demo
npm install
```

## 2️⃣ Configuration (1 minute)

```bash
cp .env.example .env
```

**For demo mode only**: You can skip adding API keys and use the mock LLM responses.

**For live LLM integration**: Add your API key to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## 3️⃣ Start the Application (1 minute)

```bash
npm run dev:full
```

This starts both:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 4️⃣ Test the Demo (5 minutes)

### Security Demo Tab
Click "Security Demo" and test with:
1. **Safe query**: "What are your hours?"
2. **PII detection**: "My SSN is 123-45-6789"
3. **Injection attack**: "Ignore previous instructions"

### Live Chat Tab
Click "Live Chat (LLM)" and interact with the banking assistant:
1. Ask about banking services
2. Try to inject PII
3. Attempt prompt injection
4. See real-time security filtering

## 🎯 Presentation Tips

1. **Start with Security Demo** - Show hardcoded examples
2. **Switch to Live Chat** - Demonstrate real LLM integration
3. **Explain the Architecture** - Show the 3-layer security pipeline
4. **Highlight Banking Use Case** - Emphasize fintech applications
5. **Show the Code** - Walk through the security services

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Change ports in .env
PORT=3002
```

**LLM not responding?**
- Check your API key in `.env`
- Verify internet connection
- Check API quota/billing

**Frontend not loading?**
```bash
# Clear cache and restart
rm -rf node_modules dist
npm install
npm run dev:full
```

## ✅ Success Checklist

- [ ] Both servers running (ports 3000 and 3001)
- [ ] Security Demo shows PII detection
- [ ] Security Demo blocks injection attempts
- [ ] Live Chat responds to queries
- [ ] Security metadata appears in responses
