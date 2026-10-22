"""
Generates Gaurav_Job_Tracker.xlsx — a job application spreadsheet
tailored to Gaurav Hira's resume profile:
  Full-Stack & Agentic AI Engineer | TypeScript | Python | Next.js | AWS
  2.5+ yrs experience | Based in Bengaluru, India
"""

import openpyxl
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side, GradientFill
)
from openpyxl.utils import get_column_letter

# ── Colour palette ──────────────────────────────────────────────────────────
CLR = {
    "header_bg":   "1A1A2E",   # dark navy
    "header_fg":   "FFFFFF",
    "section_est": "16213E",   # established companies
    "section_ai":  "0F3460",   # ai-native
    "section_st":  "533483",   # startups
    "match_hi":    "C8F7C5",   # high match (green tint)
    "match_med":   "FFF5CC",   # medium match (yellow tint)
    "match_lo":    "FFE5E5",   # low match (red tint)
    "row_alt":     "F8F9FA",
    "row_white":   "FFFFFF",
}

HEADERS = [
    "Company",
    "Type",
    "Role Category",
    "Career Page URL",
    "Key Skills Needed",
    "Interview Focus Areas",
    "Skill Match",         # High / Medium / Low
    "Resume to Use",       # GauravHira (established) or Gaurav_Hira (startup)
    "Application Status",  # user fills this
    "Applied Date",        # user fills this
    "Notes / JD Link",     # user fills this
]

STATUS_VALIDATION = ["Not Applied", "Applied", "Screening", "Interview", "Offer", "Rejected", "Saved for Later"]

# ── Company data ─────────────────────────────────────────────────────────────
# Columns: Company, Type, Role Category, Career URL,
#          Key Skills, Interview Focus, Match, Resume
COMPANIES = [
    # ── ESTABLISHED / HIGH-GROWTH TECH ──────────────────────────────────────
    (
        "Razorpay", "Established", "Full-Stack / Backend",
        "https://razorpay.com/jobs/",
        "TypeScript, Node.js, React/Next.js, REST APIs, PostgreSQL, Redis, System Design",
        "DSA (LeetCode-medium), System Design (payments infra), TypeScript/Node.js deep-dive, Product thinking",
        "High", "GauravHira_Resume",
    ),
    (
        "CRED", "Established", "Full-Stack / Product Eng",
        "https://careers.cred.club/",
        "React, TypeScript, Node.js, GraphQL, PostgreSQL, Redis, Microservices",
        "DSA, System Design, TypeScript, React internals, mobile (bonus)",
        "High", "GauravHira_Resume",
    ),
    (
        "Groww", "Established", "Full-Stack / SDE-2",
        "https://groww.in/open-positions",
        "React, Next.js, Node.js, TypeScript, PostgreSQL, Redis, Kafka, AWS",
        "DSA (arrays/graphs), System Design, React/Next.js, backend APIs, fintech domain knowledge",
        "High", "GauravHira_Resume",
    ),
    (
        "PhonePe", "Established", "Backend / Full-Stack",
        "https://careers.phonepe.com/",
        "Java/Node.js, REST APIs, MySQL/PostgreSQL, Redis, Kafka, Docker, AWS/GCP",
        "DSA (strong), Low-level System Design, High-availability systems, payments",
        "Medium", "GauravHira_Resume",
    ),
    (
        "Zepto", "Established", "Full-Stack / SDE",
        "https://jobs.zepto.in/",
        "React, Node.js, TypeScript, MongoDB, PostgreSQL, Redis, real-time systems",
        "DSA, System Design, React, Node.js, real-time data, rapid shipping culture",
        "High", "GauravHira_Resume",
    ),
    (
        "Swiggy", "Established", "Full-Stack / SDE-2",
        "https://careers.swiggy.com/",
        "React/Next.js, Node.js, TypeScript, PostgreSQL, Redis, Kafka, AWS, Docker",
        "DSA, High-scale System Design, Node.js, microservices, CI/CD",
        "High", "GauravHira_Resume",
    ),
    (
        "Zomato / Blinkit", "Established", "Full-Stack / SDE",
        "https://www.zomato.com/careers",
        "React, Node.js/Go, TypeScript, PostgreSQL, Redis, Kafka, AWS",
        "DSA, System Design (food-delivery scale), React, backend APIs, product sense",
        "High", "GauravHira_Resume",
    ),
    (
        "Meesho", "Established", "Full-Stack / SDE",
        "https://meesho.io/careers/",
        "React, Node.js, TypeScript, PostgreSQL, Redis, microservices, AWS",
        "DSA, System Design, React, Node.js, e-commerce domain",
        "High", "GauravHira_Resume",
    ),
    (
        "Urban Company", "Established", "Full-Stack / SDE",
        "https://www.urbancompany.com/careers",
        "React Native, React, Node.js, PostgreSQL, Redis, AWS, mobile",
        "DSA, System Design, React Native, Node.js APIs, location services",
        "High", "GauravHira_Resume",
    ),
    (
        "Ola (ANI Technologies)", "Established", "Full-Stack / SDE",
        "https://www.ola.com/careers",
        "React Native, Node.js, TypeScript, PostgreSQL, Redis, Kafka, AWS",
        "DSA, System Design (ride-hailing), React Native, real-time location, backend APIs",
        "High", "GauravHira_Resume",
    ),
    (
        "Freshworks", "Established", "Full-Stack / SDE",
        "https://careers.freshworks.com/",
        "React, Node.js, TypeScript, Ruby/Python, PostgreSQL, Redis, Elasticsearch, AWS",
        "DSA, System Design, React, REST APIs, SaaS multi-tenancy patterns",
        "High", "GauravHira_Resume",
    ),
    (
        "Postman", "Established", "Full-Stack / SDE",
        "https://www.postman.com/company/careers/",
        "React, Node.js, TypeScript, Electron, MongoDB, PostgreSQL, AWS",
        "DSA, React internals, Node.js, API design, developer tooling experience is a big plus",
        "High", "GauravHira_Resume",
    ),
    (
        "BrowserStack", "Established", "Full-Stack / SDE",
        "https://www.browserstack.com/careers",
        "React, Node.js, TypeScript, Ruby/Python, PostgreSQL, Redis, AWS, DevOps",
        "DSA, System Design, React, Node.js, CI/CD, developer tooling",
        "High", "GauravHira_Resume",
    ),
    (
        "Atlassian (Bengaluru)", "Established", "Full-Stack / SDE",
        "https://www.atlassian.com/company/careers",
        "React, TypeScript, Java/Kotlin, PostgreSQL, Kafka, AWS, microservices",
        "DSA (strong), System Design, React, distributed systems, collaborative tools",
        "Medium", "GauravHira_Resume",
    ),
    (
        "InMobi", "Established", "Full-Stack / SDE",
        "https://www.inmobi.com/company/careers/",
        "React, Node.js, TypeScript, Python, PostgreSQL, Redis, Kafka, AWS",
        "DSA, System Design (adtech scale), real-time bidding concepts, React, APIs",
        "Medium", "GauravHira_Resume",
    ),
    (
        "Flipkart", "Established", "SDE / Full-Stack",
        "https://www.flipkartcareers.com/",
        "React, Java/Node.js, TypeScript, MySQL/PostgreSQL, Redis, Kafka, AWS",
        "DSA (strong), High-scale System Design, Java (preferred), distributed systems",
        "Medium", "GauravHira_Resume",
    ),
    (
        "Amazon (India)", "Established", "SDE-1 / SDE-2",
        "https://www.amazon.jobs/en/locations/india",
        "TypeScript/JavaScript, Java, React, DynamoDB, S3, Lambda, SQS, system design",
        "DSA (LeetCode hard), LP (Leadership Principles), System Design, AWS deep-dive",
        "High", "GauravHira_Resume",
    ),
    (
        "Microsoft (India)", "Established", "SDE / Full-Stack",
        "https://careers.microsoft.com/v2/global/en/locations/india.html",
        "TypeScript, React, C#, .NET, Azure, SQL Server, REST APIs",
        "DSA, System Design, TypeScript/C#, Azure, OOP fundamentals",
        "High", "GauravHira_Resume",
    ),
    (
        "Google (India)", "Established", "SWE L3/L4",
        "https://careers.google.com/locations/india/",
        "Python, TypeScript/JavaScript, React, distributed systems, SQL, GCP",
        "DSA (LeetCode hard), Large-scale System Design, coding fluency, ML awareness",
        "Medium", "GauravHira_Resume",
    ),
    (
        "Setu (by Pine Labs)", "Established", "Full-Stack / SDE",
        "https://setu.co/careers",
        "Node.js, TypeScript, React, PostgreSQL, Redis, AWS, fintech APIs",
        "DSA, System Design, Node.js, API product thinking, fintech/payments domain",
        "High", "GauravHira_Resume",
    ),
    (
        "MakeMyTrip / ibibo", "Established", "Full-Stack / SDE",
        "https://careers.makemytrip.com/",
        "React, Node.js, TypeScript, Java, PostgreSQL, Redis, Kafka, AWS",
        "DSA, System Design, React, Node.js, booking systems, real-time pricing",
        "Medium", "GauravHira_Resume",
    ),

    # ── AI-NATIVE / LLM-FOCUSED ──────────────────────────────────────────────
    (
        "Sarvam AI", "AI-Native", "AI Engineer / Full-Stack",
        "https://www.sarvam.ai/careers",
        "Python, TypeScript, LLM APIs, RAG, Next.js, FastAPI, PostgreSQL, AWS/GCP",
        "LLM system design, prompt engineering, agentic pipelines, Python coding, product thinking",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Krutrim (Ola AI)", "AI-Native", "AI / Full-Stack Engineer",
        "https://olakrutrim.com/careers",
        "Python, TypeScript, LLM inference, RAG, FastAPI, Next.js, PostgreSQL, AWS",
        "LLM fundamentals, inference optimisation, agentic AI, Python, system design",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Yellow.ai", "AI-Native", "AI / Full-Stack Engineer",
        "https://yellow.ai/company/careers/",
        "Node.js, TypeScript, Python, NLP/LLM, React, PostgreSQL, MongoDB, AWS",
        "Conversational AI, LLM integration, Node.js, React, system design",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Observe.AI", "AI-Native", "Full-Stack / AI Engineer",
        "https://www.observe.ai/careers",
        "React, Node.js, TypeScript, Python, LLM/NLP, AWS, PostgreSQL, real-time streaming",
        "LLM pipelines, React, Node.js, real-time audio processing, system design",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Haptik (Jio Platforms)", "AI-Native", "AI / Full-Stack Engineer",
        "https://haptik.ai/careers/",
        "Python, Node.js, TypeScript, NLP, React, PostgreSQL, MongoDB, AWS",
        "LLM/chatbot systems, Python, Node.js, REST APIs, NLP pipeline design",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Arya.ai", "AI-Native", "AI Engineer / Backend",
        "https://arya.ai/careers",
        "Python, Node.js, LLM APIs, RAG, FastAPI, PostgreSQL, Docker, AWS",
        "ML system design, Python, LLM output validation, API design, fintech domain",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Leena AI (WorkLM)", "AI-Native", "Full-Stack / AI Engineer",
        "https://leena.ai/careers/",
        "Node.js, TypeScript, React, Python, LLM/NLP, PostgreSQL, AWS, multi-tenancy",
        "LLM integrations, Node.js, React, enterprise SaaS patterns, HR domain",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Lightspeed AI (Mihup)", "AI-Native", "AI / NLP Engineer",
        "https://www.mihup.ai/careers",
        "Python, Node.js, LLM, ASR/NLP, FastAPI, PostgreSQL, AWS",
        "LLM pipelines, Python, speech/NLP, system design, API product thinking",
        "Medium", "Gaurav_Hira_Resume",
    ),
    (
        "Anthropic (Remote / US-India)", "AI-Native", "Software Engineer / AI",
        "https://www.anthropic.com/careers",
        "Python, TypeScript, distributed systems, LLM safety, RLHF, AWS, scalable infra",
        "Strong CS fundamentals, distributed systems, LLM internals, safety mindset, Python",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Vercel (Remote)", "AI-Native / Global", "Full-Stack / AI SDK Engineer",
        "https://vercel.com/careers",
        "TypeScript, Next.js, React, Node.js, Edge Runtime, AI SDK, PostgreSQL, serverless",
        "TypeScript/Next.js deep-dive, edge computing, open-source contributions, developer tooling",
        "High", "GauravHira_Resume",
    ),
    (
        "Supabase (Remote)", "AI-Native / Global", "Full-Stack / Devtools Engineer",
        "https://supabase.com/careers",
        "TypeScript, Next.js, PostgreSQL, pgvector, Deno/Node.js, Docker, open-source",
        "PostgreSQL internals, TypeScript, Next.js, API design, OSS track record",
        "High", "GauravHira_Resume",
    ),
    (
        "Cloudflare (Bengaluru)", "Established / Global", "Full-Stack / SDE",
        "https://www.cloudflare.com/careers/",
        "TypeScript, Node.js, React, Rust/Go, PostgreSQL, Cloudflare Workers, distributed systems",
        "DSA, System Design, TypeScript, distributed systems, edge computing",
        "Medium", "GauravHira_Resume",
    ),
    (
        "Stripe (Remote-India eligible)", "Established / Global", "Full-Stack / SDE",
        "https://stripe.com/jobs",
        "TypeScript, Node.js, React, Ruby, PostgreSQL, distributed systems, payments",
        "DSA, System Design (payments), TypeScript/Ruby, API design, product thinking",
        "High", "GauravHira_Resume",
    ),

    # ── STARTUPS ─────────────────────────────────────────────────────────────
    (
        "Hasura", "Startup", "Full-Stack / Developer Evangelist",
        "https://hasura.io/careers/",
        "TypeScript, Node.js, React, GraphQL, PostgreSQL, Docker, AWS, open-source",
        "GraphQL, PostgreSQL, TypeScript, system design, OSS culture, developer empathy",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Darwinbox", "Startup", "Full-Stack / SDE",
        "https://darwinbox.com/careers/",
        "React, Node.js, TypeScript, Python, PostgreSQL, Redis, AWS, microservices",
        "DSA, React, Node.js, HR-tech domain, SaaS architecture, multi-tenancy",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Chargebee", "Startup", "Full-Stack / SDE",
        "https://www.chargebee.com/careers/",
        "React, Node.js, TypeScript, Java, PostgreSQL, Redis, AWS, billing systems",
        "DSA, System Design, React, Node.js, subscription/billing domain, SaaS",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Exotel", "Startup", "Full-Stack / SDE",
        "https://exotel.com/careers/",
        "Node.js, TypeScript, React, Python, PostgreSQL, Redis, Kafka, AWS, VoIP",
        "DSA, Node.js, React, real-time communications, system design",
        "Medium", "Gaurav_Hira_Resume",
    ),
    (
        "Clevertap", "Startup", "Full-Stack / SDE",
        "https://clevertap.com/company/careers/",
        "React, Node.js, TypeScript, Python, PostgreSQL, Kafka, ClickHouse, AWS",
        "DSA, System Design (analytics at scale), React, Node.js, real-time data pipelines",
        "Medium", "Gaurav_Hira_Resume",
    ),
    (
        "Open Financial Technologies", "Startup", "Full-Stack / Fintech SDE",
        "https://open.money/careers",
        "React, Node.js, TypeScript, PostgreSQL, Redis, fintech APIs, AWS, security",
        "DSA, fintech/payments domain, Node.js, React, API design, security practices",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Dukaan", "Startup", "Full-Stack / SDE",
        "https://mydukaan.io/careers",
        "React Native, React, Node.js, TypeScript, MongoDB, PostgreSQL, AWS",
        "DSA, React Native, Node.js, e-commerce, rapid product shipping",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Slice (North East Small Finance Bank)", "Startup", "Full-Stack / SDE",
        "https://www.sliceit.com/careers",
        "React, Node.js, TypeScript, Python, PostgreSQL, Redis, AWS, fintech",
        "DSA, System Design, React, Node.js, fintech/lending domain, mobile",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Freo (MoneyTap)", "Startup", "Full-Stack / SDE",
        "https://freo.money/careers",
        "React Native, React, Node.js, TypeScript, PostgreSQL, MongoDB, AWS",
        "DSA, React Native, Node.js, lending/credit domain, mobile apps",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Paperflite", "Startup", "Full-Stack / SDE",
        "https://www.paperflite.com/careers",
        "React, Node.js, TypeScript, PostgreSQL, Elasticsearch, AWS, content tech",
        "DSA, React, Node.js, SaaS, content intelligence, product thinking",
        "Medium", "Gaurav_Hira_Resume",
    ),
    (
        "Rupeek", "Startup", "Full-Stack / SDE",
        "https://www.rupeek.com/careers",
        "React, Node.js, TypeScript, MongoDB, PostgreSQL, Redis, AWS",
        "DSA, React, Node.js, fintech/gold-loan domain, rapid engineering",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Bespoke Labs (AI / Data)", "Startup / AI-Native", "Full-Stack AI Engineer",
        "https://www.bespokelabs.ai/careers",
        "Python, TypeScript, Next.js, PostgreSQL, Elasticsearch, Docker, AWS",
        "Python backend, Next.js, data pipelines, LLM tooling, system design",
        "High", "Gaurav_Hira_Resume",
    ),
    (
        "Fractal Analytics", "Startup / AI", "AI / Full-Stack Engineer",
        "https://fractal.ai/careers/",
        "Python, TypeScript, React, LLM/ML, PostgreSQL, Spark, Azure/AWS",
        "ML system design, Python, TypeScript, LLM integration, data engineering",
        "Medium", "Gaurav_Hira_Resume",
    ),
    (
        "Sprinklr (India)", "Established", "Full-Stack / SDE",
        "https://www.sprinklr.com/careers/",
        "React, Node.js, TypeScript, Java, PostgreSQL, Kafka, Elasticsearch, AWS",
        "DSA, System Design, React, Node.js, enterprise SaaS, real-time data",
        "Medium", "GauravHira_Resume",
    ),
]


def skill_match_fill(match: str):
    colors = {"High": CLR["match_hi"], "Medium": CLR["match_med"], "Low": CLR["match_lo"]}
    return PatternFill("solid", fgColor=colors.get(match, "FFFFFF"))


def type_fill(company_type: str):
    colors = {
        "Established": "E8F4F8",
        "AI-Native": "EEF2FF",
        "AI-Native / Global": "EEF2FF",
        "Established / Global": "E8F4F8",
        "Startup": "FFF0F5",
        "Startup / AI-Native": "FFF0F5",
        "Startup / AI": "FFF0F5",
    }
    return PatternFill("solid", fgColor=colors.get(company_type, "FFFFFF"))


def make_border(style="thin"):
    s = Side(style=style, color="D0D0D0")
    return Border(left=s, right=s, top=s, bottom=s)


def build_workbook():
    wb = openpyxl.Workbook()

    # ── Sheet 1: Job Tracker ────────────────────────────────────────────────
    ws = wb.active
    ws.title = "Job Tracker"

    # header row
    for col, h in enumerate(HEADERS, start=1):
        cell = ws.cell(row=1, column=col, value=h)
        cell.font = Font(bold=True, color=CLR["header_fg"], size=11)
        cell.fill = PatternFill("solid", fgColor=CLR["header_bg"])
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = make_border()

    ws.row_dimensions[1].height = 32

    # data rows
    for row_idx, company in enumerate(COMPANIES, start=2):
        (name, ctype, role, url, skills, interview, match, resume) = company
        row_data = [
            name, ctype, role, url, skills, interview, match, resume,
            "Not Applied", "", ""  # Application Status, Applied Date, Notes
        ]
        alt = row_idx % 2 == 0
        for col_idx, value in enumerate(row_data, start=1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            cell.border = make_border()
            cell.alignment = Alignment(vertical="top", wrap_text=True)

            if col_idx == 1:  # Company — bold
                cell.font = Font(bold=True, size=10)
                cell.fill = type_fill(ctype)
            elif col_idx == 2:  # Type
                cell.fill = type_fill(ctype)
                cell.font = Font(italic=True, size=9)
            elif col_idx == 4:  # URL — hyperlink
                cell.hyperlink = url
                cell.font = Font(color="0563C1", underline="single", size=9)
                cell.fill = PatternFill("solid", fgColor=CLR["row_alt"] if alt else CLR["row_white"])
            elif col_idx == 7:  # Skill Match
                cell.fill = skill_match_fill(match)
                cell.font = Font(bold=True, size=10)
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx == 8:  # Resume
                cell.font = Font(size=9, italic=True, color="444444")
                cell.fill = PatternFill("solid", fgColor=CLR["row_alt"] if alt else CLR["row_white"])
            elif col_idx == 9:  # Application Status — dropdown
                cell.font = Font(size=10)
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.fill = PatternFill("solid", fgColor="FFF9E6")
            elif col_idx in (10, 11):
                cell.fill = PatternFill("solid", fgColor=CLR["row_alt"] if alt else CLR["row_white"])
                cell.font = Font(size=10)
            else:
                cell.fill = PatternFill("solid", fgColor=CLR["row_alt"] if alt else CLR["row_white"])
                cell.font = Font(size=9)

        ws.row_dimensions[row_idx].height = 68

    # data validation for Application Status
    from openpyxl.worksheet.datavalidation import DataValidation
    dv_formula = '"' + ",".join(STATUS_VALIDATION) + '"'
    dv = DataValidation(type="list", formula1=dv_formula, allow_blank=True, showDropDown=False)
    dv.error = "Please choose from the dropdown"
    dv.errorTitle = "Invalid Status"
    status_col = get_column_letter(9)
    dv.sqref = f"{status_col}2:{status_col}{len(COMPANIES)+1}"
    ws.add_data_validation(dv)

    # column widths
    col_widths = [22, 16, 20, 36, 52, 52, 10, 22, 16, 14, 32]
    for i, w in enumerate(col_widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w

    ws.freeze_panes = "A2"
    ws.sheet_view.showGridLines = False
    ws.auto_filter.ref = f"A1:{get_column_letter(len(HEADERS))}{len(COMPANIES)+1}"

    # ── Sheet 2: Skills Legend ──────────────────────────────────────────────
    ws2 = wb.create_sheet("Skills Profile")
    ws2.sheet_view.showGridLines = False
    ws2.column_dimensions["A"].width = 26
    ws2.column_dimensions["B"].width = 70

    legend = [
        ("GAURAV'S SKILL PROFILE", ""),
        ("Languages", "TypeScript, JavaScript, Python, C#, C, SQL"),
        ("Agentic AI", "Multi-agent systems, LLM orchestration, model routing, AWS Bedrock, Claude API, MCP, n8n, prompt engineering, LLM output validation"),
        ("Frontend & Mobile", "React, Next.js, React Native (Expo), Vue.js, Tailwind CSS"),
        ("Backend & Data", "Node.js, Express, REST APIs, WebSockets, Redis, PostgreSQL, Supabase, MongoDB"),
        ("Cloud & DevOps", "Docker, AWS (Lambda, EC2, S3, SQS, RDS, Bedrock, CDK, IAM, SSM), GitHub Actions, Nginx, PM2, Linux"),
        ("Practices", "System design, event-driven architecture, pytest, CI/CD, Agile/Scrum"),
        ("", ""),
        ("RESUME GUIDE", ""),
        ("GauravHira_Resume", "Use for Established companies, Global tech companies. Titles: Lead Engineer."),
        ("Gaurav_Hira_Resume", "Use for AI-Native startups, Founder-friendly orgs. Titles: Founder & Lead Engineer."),
        ("", ""),
        ("SKILL MATCH LEGEND", ""),
        ("High", "Strong overlap — apply immediately"),
        ("Medium", "Good overlap — minor skill gap to bridge"),
        ("Low", "Partial match — prep extra before applying"),
    ]

    for r_idx, (label, value) in enumerate(legend, start=1):
        a = ws2.cell(row=r_idx, column=1, value=label)
        b = ws2.cell(row=r_idx, column=2, value=value)
        b.alignment = Alignment(wrap_text=True)

        if label in ("GAURAV'S SKILL PROFILE", "RESUME GUIDE", "SKILL MATCH LEGEND"):
            for c in (a, b):
                c.font = Font(bold=True, color="FFFFFF", size=11)
                c.fill = PatternFill("solid", fgColor=CLR["header_bg"])
        elif label in ("High", "Medium", "Low"):
            a.font = Font(bold=True)
            a.fill = skill_match_fill(label)
            b.fill = skill_match_fill(label)
        elif label:
            a.font = Font(bold=True, size=10)
            ws2.row_dimensions[r_idx].height = 38

    # ── Sheet 3: Interview Prep Quick Ref ───────────────────────────────────
    ws3 = wb.create_sheet("Interview Prep")
    ws3.sheet_view.showGridLines = False
    ws3.column_dimensions["A"].width = 28
    ws3.column_dimensions["B"].width = 72

    prep_data = [
        ("INTERVIEW PREP — GAURAV HIRA", ""),
        ("DSA Topics (most companies)", "Arrays, Strings, Hashing, Binary Search, Sliding Window, Two Pointers, Trees (BFS/DFS), Graphs (BFS/DFS/Dijkstra), DP (1D/2D), Heap/Priority Queue, Recursion/Backtracking"),
        ("System Design (all mid-level)", "URL Shortener, Chat App (WebSockets), Food Delivery, Notification Service, Event-Driven Architecture (SQS/Kafka), API Rate Limiter, Distributed Cache (Redis), CDN Design"),
        ("Your AWS Strengths", "Lambda, Bedrock, SQS, RDS, EC2, CDK, IAM, SSM, S3 — always tie to real ClearCycle/GigaFit examples"),
        ("Agentic AI talking points", "Multi-agent pipeline architecture, LLM routing/cost optimisation, hallucination guardrails, ICD-10 validation, n8n workflow automation"),
        ("React / Next.js", "Hooks internals, SSR vs SSG vs ISR, App Router, Server Components, state management, hydration, performance"),
        ("Node.js / TypeScript", "Event loop, async patterns, TypeScript generics/utility types, Express middleware, REST best practices"),
        ("Behavioural (Founder angle)", "Why ClearCycle? How did you hire/lead? Revenue numbers? Metrics? Failures? What would you do differently?"),
        ("GitHub to highlight", "razorpay-mcp (npm + MCP registry), ClearCycle architecture, GigaFit full-stack"),
        ("Mock interview platforms", "Pramp, interviewing.io, NeetCode.io, Exponent (system design)"),
    ]

    for r_idx, (label, value) in enumerate(prep_data, start=1):
        a = ws3.cell(row=r_idx, column=1, value=label)
        b = ws3.cell(row=r_idx, column=2, value=value)
        b.alignment = Alignment(wrap_text=True)

        if label == "INTERVIEW PREP — GAURAV HIRA":
            for c in (a, b):
                c.font = Font(bold=True, color="FFFFFF", size=12)
                c.fill = PatternFill("solid", fgColor=CLR["header_bg"])
        else:
            a.font = Font(bold=True, size=10)
            a.fill = PatternFill("solid", fgColor="EEF2FF")
            ws3.row_dimensions[r_idx].height = 52

    out_path = "Gaurav_Job_Tracker.xlsx"
    wb.save(out_path)
    print(f"Saved: {out_path}")
    return out_path


if __name__ == "__main__":
    build_workbook()
