#!/usr/bin/env python3
"""
tailor_resume.py — Resume tailoring assistant for Gaurav Hira.

Usage:
  python tailor_resume.py                      # interactive: paste JD, then Ctrl-D / Ctrl-Z
  python tailor_resume.py --jd "path/to/jd.txt"
  python tailor_resume.py --jd "path/to/jd.txt" --api-key sk-ant-...

Without an API key the script runs in LOCAL mode:
  - Keyword extraction and scoring happen offline using Python only.
  - Outputs a structured tailoring brief you can act on manually.

With an Anthropic API key it runs in AI mode:
  - Calls claude-opus-4-5 to produce a fully rewritten tailored resume section.
"""

import argparse
import json
import re
import sys
from collections import Counter
from typing import Optional

# ─── Gaurav's full skill/keyword inventory ───────────────────────────────────
GAURAV_SKILLS = {
    "languages":    ["typescript", "javascript", "python", "c#", "c", "sql"],
    "ai_agentic":   [
        "multi-agent", "agentic", "llm", "llm orchestration", "model routing",
        "aws bedrock", "anthropic", "claude", "claude api", "mcp",
        "prompt engineering", "llm output validation", "n8n", "rag", "langchain",
        "openai", "generative ai", "genai", "ai agent", "agent", "workflow automation",
        "hallucination", "vector", "embedding",
    ],
    "frontend":     [
        "react", "next.js", "nextjs", "react native", "expo", "vue", "vue.js",
        "tailwind", "html", "css", "svelte",
    ],
    "backend":      [
        "node.js", "nodejs", "express", "rest api", "rest apis", "graphql",
        "websockets", "websocket", "fastapi", "flask", "django", "grpc",
    ],
    "databases":    [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "supabase",
        "dynamodb", "sqlite", "elasticsearch", "clickhouse",
    ],
    "cloud_devops": [
        "aws", "lambda", "ec2", "s3", "sqs", "rds", "bedrock", "cdk", "iam",
        "ssm", "docker", "kubernetes", "k8s", "github actions", "nginx", "pm2",
        "linux", "ci/cd", "cicd", "azure", "gcp", "terraform",
    ],
    "practices":    [
        "system design", "event-driven", "microservices", "agile", "scrum",
        "tdd", "pytest", "unit test", "integration test", "ci", "cd",
        "api design", "distributed systems",
    ],
}

# Flattened for matching
ALL_GAURAV_SKILLS = {
    skill.lower()
    for category in GAURAV_SKILLS.values()
    for skill in category
}

# Resume bullet points indexed by skill cluster — used to suggest priorities
BULLET_MAP = {
    "llm":            "ClearCycle: cost-aware LLM router on AWS Bedrock (Llama 3 8B → Claude escalation at 0.82 confidence)",
    "multi-agent":    "ClearCycle: event-driven multi-agent pipeline (5 SQS queues) for ICD-10/CPT coding",
    "aws":            "ClearCycle: 4 AWS CDK stacks (network/storage/agents/API), Lambda, RDS over VPC, OIDC-based CI",
    "bedrock":        "ClearCycle: AWS Bedrock LLM router with cost-aware model selection",
    "next.js":        "GigaFit: full-stack Next.js platform + outlet dashboards (50 subscribers/month, ₹1L+ MRR)",
    "react native":   "GigaFit: cross-platform React Native (Expo) apps for Android & iOS with OTP, PayU, live tracking",
    "node.js":        "GigaFit: Node.js/Express backend with MongoDB, n8n automation, zero-touch daily ops",
    "postgresql":     "ClearCycle: 71,704 ICD-10 + 10,836 CPT codes in PostgreSQL with auto-correction & confidence scoring",
    "docker":         "ClearCycle: API containerised in Docker on AWS Lambda; CDK-provisioned infra",
    "github actions": "ClearCycle: GitHub Actions + AWS SSM via OIDC (no long-lived keys, no open port 22)",
    "ci/cd":          "ClearCycle: GitHub Actions CI enforcing ruff linting + pytest suites",
    "n8n":            "GigaFit: cron-triggered n8n workflows for zero-touch daily operations SOP",
    "mcp":            "Razorpay MCP Server (@indiamcp/razorpay-mcp) — published to npm + official MCP registry",
    "supabase":       "EscapeSaaS: Next.js + TypeScript + Supabase community directory with realtime rankings",
    "c#":             "ReVx BMS Studio: .NET MAUI enterprise desktop app on Microsoft Store; 99.5% latency reduction",
    "system design":  "Architected event-driven multi-agent pipeline + microservice API for ClearCycle at scale",
    "prompt engineering": "ClearCycle self-learning policy engine: DB-stored coding rules compose specialty system prompts at runtime",
    "rag":            "ClearCycle: ICD-10/CPT code validation as structured RAG grounding layer",
    "event-driven":   "ClearCycle: 5-queue SQS event-driven pipeline (S3 ingestion → extraction → coding → claim → report)",
}

SUMMARY_ESTABLISHED = (
    "Full-stack engineer with 2.5+ years of experience independently building and shipping "
    "production systems end-to-end, specialising in agentic AI. Architected and deployed ClearCycle, "
    "a multi-agent claims-automation platform for Indian hospitals on AWS (Lambda, Bedrock, SQS, RDS, CDK) "
    "with a cost-aware LLM router and hallucination guardrails. Previously built the complete stack of a "
    "D2C subscription business whose daily operations ran with zero manual touchpoints. Takes products from "
    "idea to live deployment without hand-offs: mobile, web, backend, cloud infrastructure, CI/CD, and LLM orchestration."
)

SUMMARY_STARTUP = (
    "Founder-engineer with 2.5+ years building and shipping full-stack production systems end-to-end. "
    "Founded Black Loom Labs (AI studio) and GigaFit Meals (D2C food-tech). Architected ClearCycle, "
    "a multi-agent claims-automation platform on AWS Bedrock/CDK, and ran GigaFit's entire software stack "
    "from mobile apps to zero-touch automated kitchen operations (₹1L+/month revenue). Ships across mobile, "
    "web, backend, cloud infrastructure, CI/CD, and LLM orchestration — alone and with small teams."
)


def tokenise(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\.\+\-\#/\s]", " ", text)
    return text.split()


def extract_jd_keywords(jd: str) -> dict:
    tokens = set(tokenise(jd))
    bigrams = set()
    tok_list = list(tokenise(jd))
    for i in range(len(tok_list) - 1):
        bigrams.add(f"{tok_list[i]} {tok_list[i+1]}")

    matched = {}
    for category, skills in GAURAV_SKILLS.items():
        hits = []
        for skill in skills:
            skill_lower = skill.lower()
            if skill_lower in tokens or skill_lower in bigrams or skill_lower in jd.lower():
                hits.append(skill)
        if hits:
            matched[category] = hits

    # keywords in JD not in Gaurav's skills — potential gaps
    jd_tech_words = {
        t for t in (tokens | bigrams)
        if len(t) > 3
        and not t.isdigit()
        and t not in {
            "with", "and", "the", "for", "will", "have", "that", "this",
            "from", "your", "you", "our", "are", "not", "all", "any",
            "work", "build", "team", "role", "join", "using", "including",
            "experience", "years", "strong", "good", "plus", "knowledge",
            "skills", "ability", "understand",
        }
    }
    gaps = jd_tech_words - ALL_GAURAV_SKILLS
    return {"matched": matched, "gaps": sorted(gaps)}


def score_match(matched: dict) -> tuple[int, str]:
    total = sum(len(v) for v in matched.values())
    if total >= 10:
        return total, "HIGH"
    elif total >= 5:
        return total, "MEDIUM"
    else:
        return total, "LOW"


def detect_resume_type(jd: str) -> str:
    founder_signals = [
        "founder", "startup", "early stage", "early-stage", "0 to 1",
        "zero to one", "scrappy", "generalist", "small team", "pre-seed",
        "seed stage", "series a",
    ]
    return "Gaurav_Hira_Resume" if any(s in jd.lower() for s in founder_signals) else "GauravHira_Resume"


def bullet_recommendations(matched: dict) -> list[str]:
    recs = []
    for category, hits in matched.items():
        for hit in hits:
            key = hit.lower()
            if key in BULLET_MAP:
                recs.append(BULLET_MAP[key])
    seen = set()
    return [r for r in recs if not (r in seen or seen.add(r))]


def local_tailor(jd: str, company: str = "", role: str = "") -> None:
    print("\n" + "=" * 70)
    print("  RESUME TAILORING BRIEF — Gaurav Hira")
    if company:
        print(f"  Company : {company}")
    if role:
        print(f"  Role    : {role}")
    print("=" * 70)

    result = extract_jd_keywords(jd)
    matched = result["matched"]
    gaps = result["gaps"]
    score, level = score_match(matched)

    print(f"\n[ SKILL MATCH ] {level} ({score} keywords found)\n")

    print("MATCHED SKILLS BY CATEGORY:")
    for cat, skills in matched.items():
        print(f"  {cat.replace('_', ' ').upper()}: {', '.join(skills)}")

    if gaps:
        print(f"\nPOTENTIAL GAPS (in JD but not in your core skills):")
        interesting_gaps = [g for g in gaps if len(g) > 4][:15]
        print("  " + ", ".join(interesting_gaps))
        print("  → Skim docs and add 1-2 lines in Skills if you have exposure.")

    resume_rec = detect_resume_type(jd)
    print(f"\nRESUME TO USE: {resume_rec}")
    if resume_rec == "Gaurav_Hira_Resume":
        print("  → Startup: lead with Founder titles; emphasise 0→1 ownership and revenue metrics.")
        print(f"  TAILORED SUMMARY:\n  {SUMMARY_STARTUP}")
    else:
        print("  → Established: lead with Lead Engineer titles; emphasise scale, system design, team.")
        print(f"  TAILORED SUMMARY:\n  {SUMMARY_ESTABLISHED}")

    bullets = bullet_recommendations(matched)
    if bullets:
        print("\nHIGH-PRIORITY BULLETS TO LEAD WITH:")
        for i, b in enumerate(bullets[:6], 1):
            print(f"  {i}. {b}")

    print("\nACTION CHECKLIST:")
    print("  [ ] Copy the tailored summary above into your resume header")
    print("  [ ] Reorder experience bullets to front-load matched skills")
    print("  [ ] Add JD keywords verbatim to your Skills section (ATS)")
    print("  [ ] If role is AI-focused: move ClearCycle bullets to top")
    print("  [ ] If role is mobile: move React Native / GigaFit bullets to top")
    print("  [ ] Quantify: revenue (₹1L+/MRR), latency (99.5%), cost (13x cheaper), scale (71K codes)")
    print("=" * 70 + "\n")


def ai_tailor(jd: str, api_key: str, company: str = "", role: str = "") -> None:
    try:
        import anthropic
    except ImportError:
        print("[ERROR] anthropic package not installed. Run: pip install anthropic")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    system = (
        "You are a senior technical recruiter and resume coach. "
        "You tailor resumes for software engineers without fabricating experience. "
        "Be specific, concise, and ATS-aware."
    )

    prompt = f"""Job Description:
---
{jd}
---

Candidate: Gaurav Hira
Profile: Full-Stack & Agentic AI Engineer, 2.5+ years, Bengaluru
Skills: TypeScript, JavaScript, Python, C#, C, SQL
Agentic AI: multi-agent systems, LLM orchestration, AWS Bedrock, Claude API, MCP, n8n, prompt engineering
Frontend/Mobile: React, Next.js, React Native (Expo), Vue.js, Tailwind CSS
Backend: Node.js, Express, REST APIs, WebSockets, Redis, PostgreSQL, Supabase, MongoDB
Cloud/DevOps: Docker, AWS (Lambda, EC2, S3, SQS, RDS, Bedrock, CDK, IAM, SSM), GitHub Actions, CI/CD
Projects: ClearCycle (healthcare AI claims automation), GigaFit Meals (D2C food-tech), razorpay-mcp (npm)

Company: {company or 'Unknown'}
Role: {role or 'Software Engineer'}

Please produce:
1. TAILORED PROFESSIONAL SUMMARY (3 sentences, use exact keywords from the JD)
2. TOP 5 RESUME BULLETS to highlight (pick from Gaurav's experience, reworded to match JD language)
3. SKILLS SECTION reordered to match JD priorities
4. COVER LETTER HOOK (2 sentences to open a cover letter)
5. ONE THING TO ADD or study before applying (if there is a genuine gap)

Do not invent experience. Only use what is in the profile above."""

    print("\n[ AI MODE ] Calling Claude API...\n")
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
        system=system,
    )
    print(message.content[0].text)


def main():
    parser = argparse.ArgumentParser(description="Tailor Gaurav's resume to a job description.")
    parser.add_argument("--jd", type=str, default=None, help="Path to a .txt file with the job description")
    parser.add_argument("--company", type=str, default="", help="Company name")
    parser.add_argument("--role", type=str, default="", help="Role title")
    parser.add_argument("--api-key", type=str, default=None, help="Anthropic API key (enables AI mode)")
    args = parser.parse_args()

    if args.jd:
        with open(args.jd, "r", encoding="utf-8") as f:
            jd = f.read()
    else:
        print("Paste the job description below. Press Ctrl-D (Mac/Linux) or Ctrl-Z+Enter (Windows) when done:")
        jd = sys.stdin.read()

    if not jd.strip():
        print("[ERROR] Job description is empty.")
        sys.exit(1)

    if args.api_key:
        ai_tailor(jd, args.api_key, company=args.company, role=args.role)
    else:
        local_tailor(jd, company=args.company, role=args.role)


if __name__ == "__main__":
    main()
