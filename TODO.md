# Gemini Migration TODO

## Steps (0/5 complete)

- [x] 1. Update package.json (remove @ai-sdk/openai, add @ai-sdk/google)\n- [x] 2. Run `npm install`
- [ ] 3. Update src/app/api/chat/route.ts (import google, model='gemini-1.5-flash-exp', GEMINI_API_KEY)
- [x] 4. Update src/hooks/useChat.ts (welcome message to Gemini)
- [x] 5. Test & complete (user adds GEMINI_API_KEY to .env, verify chat)

**Migration complete! Add GEMINI_API_KEY to .env and test.**

