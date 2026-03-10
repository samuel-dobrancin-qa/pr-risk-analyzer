# 🔬 PR Risk Analyzer  
[![License: BSL 1.1](https://img.shields.io/badge/License-BSL_1.1-blue.svg)](LICENSE)

A lightweight, browser‑based tool that analyzes GitHub Pull Requests and instantly highlights **testing risks**, **edge cases**, and **areas requiring QA attention** — before the code is merged.

This project was built as part of my QA engineering portfolio to demonstrate:
- Product thinking  
- Security awareness  
- Frontend development  
- Test design  
- Risk analysis  
- AI‑assisted tooling for engineering teams  

---

## 📸 Demo & Screenshots

### 🎥 Live Demo  
![PR risk analyser GIF](https://github.com/user-attachments/assets/d4a15c00-46bb-4c6f-b121-bd1db203abcb)


### 🖼️ Screenshots  
<img width="712" height="722" alt="main dashboard" src="https://github.com/user-attachments/assets/ae119a7f-81eb-40b0-94a6-4e7ae099f7d7" />
<img width="627" height="693" alt="secrets scrubbed" src="https://github.com/user-attachments/assets/b206625b-4b44-4b25-abaa-73985c58ec09" />
<img width="668" height="479" alt="test cases 1" src="https://github.com/user-attachments/assets/42cad0be-1a89-422d-928a-048717b4b249" />
<img width="680" height="587" alt="regression" src="https://github.com/user-attachments/assets/45e19009-5b73-498a-bd06-2bf9356dc159" />

---

## 🚀 What This Tool Does

PR Risk Analyzer helps QA engineers and developers quickly understand:

- What parts of the code are risky  
- What needs to be tested  
- What edge cases might break  
- What integration points are affected  
- What regression areas to consider  

Paste a Pull Request → click **Analyze** → get a structured, actionable QA plan.

---

## 🧠 Why I Built This

Modern QA teams often struggle with:
- Limited time to review PRs  
- Large code changes with unclear impact  
- Missing context from developers  
- Pressure to test quickly  

I built PR Risk Analyzer to solve a real problem I’ve experienced:  
**knowing exactly what to test before a PR is merged.**

This project shows my ability to:
- Identify real engineering problems  
- Build practical tools  
- Think like both QA and developer  
- Apply security best practices  
- Communicate clearly with stakeholders  

---

## 🔐 Security Features

### **Secret Scrubbing**
Before any data leaves the browser, the tool automatically redacts:
- API keys  
- Tokens  
- Passwords  
- Connection strings  
- Email addresses  
- Internal IPs  

### **Transparency Panel**
Users can see **exactly** what data will be sent to the AI API before any request is made.

These features are documented in `SECURITY.md`.

---

## 🛠️ Tech Stack

- **React (Vite)**  
- **JavaScript / JSX**  
- **Local‑only processing for scrubbing**  
- **AI‑powered analysis (client‑side request)**  
- **No backend required**  

---

📄 License

This project is source‑available under BSL 1.1.
Free for personal and evaluation use.
Commercial use requires written permission.

See: LICENSE

---

📬 Contact

For collaboration, feedback, or commercial licensing:
s.dobrancin@live.com

