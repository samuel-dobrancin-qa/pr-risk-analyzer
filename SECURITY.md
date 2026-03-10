# Security Policy

## 🔒 Secret Scrubbing
PR Risk Analyzer automatically redacts sensitive information **before any data leaves the browser**.  
All scrubbing happens locally on the client side.

The following data types are removed or masked:

- API keys and tokens (AWS, GitHub, Bearer tokens)
- Passwords and connection strings
- Email addresses
- Internal IP addresses
- Common secret patterns (e.g., `sk-`, `ghp_`, JWTs)

This ensures that no sensitive information is ever sent to the AI API.

---

## 🪟 Data Transparency
Before sending any request to the AI API, the app displays a **Transparency Panel** showing:

- The exact text that will be sent  
- Any redactions applied  
- A clear explanation of what the model will receive  

This gives users full visibility and control over their data.

---

## 🛡️ Why This Matters
Including a SECURITY.md demonstrates:

- Security‑first thinking  
- Awareness of data handling risks  
- Professionalism in building AI‑assisted tools  
- Alignment with industry expectations for responsible AI usage  

This file is part of the project’s commitment to safe, transparent, and ethical tooling.


