import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "sales_bot.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Create calls table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS calls (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        language TEXT NOT NULL,
        product_name TEXT NOT NULL,
        recording_filename TEXT,
        recording_consent INTEGER NOT NULL DEFAULT 1,
        sales_status TEXT NOT NULL,
        summary TEXT NOT NULL,
        customer_requirements TEXT,
        objections TEXT,
        next_steps TEXT,
        confidence_score REAL DEFAULT 0.9,
        status_reason TEXT,
        transcript_json TEXT NOT NULL
    );
    """)

    # Create products table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tagline TEXT NOT NULL,
        description TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        pricing_tiers TEXT NOT NULL,
        key_features TEXT NOT NULL,
        common_objections TEXT NOT NULL,
        default_greeting TEXT NOT NULL
    );
    """)

    # Seed initial SaaS products if table is empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        seed_products = [
            {
                "id": "flowpulse-crm",
                "name": "FlowPulse AI CRM",
                "tagline": "Autonomous AI-Powered CRM & Pipeline Acceleration",
                "description": "FlowPulse automatically captures leads, scores them with predictive AI, enriches contact details, drafts outreach emails, and logs voice call summaries directly into your deals pipeline.",
                "target_audience": "B2B SaaS companies, sales teams, agency owners, and growing startups (teams of 5 to 200).",
                "pricing_tiers": json.dumps([
                    {"tier": "Starter", "price": "$29/user/month", "details": "Up to 3 users, AI lead scoring, email tracking, basic call transcripts"},
                    {"tier": "Growth", "price": "$79/user/month", "details": "Unlimited users, automated voice sales agent, workflow automations, CRM sync"},
                    {"tier": "Enterprise", "price": "$199/user/month", "details": "Custom AI voice training, dedicated account manager, SLA, custom integrations"}
                ]),
                "key_features": json.dumps([
                    "Automated real-time voice call summaries and CRM auto-entry",
                    "AI predictive lead qualification that triples close rates",
                    "Instant 2-way sync with HubSpot, Salesforce, Gmail, and Slack",
                    "Voice-activated workflow triggers and smart follow-up reminders"
                ]),
                "common_objections": json.dumps([
                    {"objection": "We already use Salesforce or HubSpot", "counter": "FlowPulse isn't here to replace your existing CRM; it sits right on top as an intelligent AI copilot that cuts manual data entry by 80%."},
                    {"objection": "It seems expensive / no budget", "counter": "Most of our customers recoup the cost in the very first week by saving 15 hours of rep admin time and preventing lost leads."},
                    {"objection": "We don't have time for a complex setup", "counter": "FlowPulse connects with a 1-click OAuth integration. You'll be up and running in under 5 minutes with zero technical setup."}
                ]),
                "default_greeting": "Hi there! This is Alex from FlowPulse AI CRM. I noticed your team is scaling fast. How are you currently managing your inbound leads and follow-ups?"
            },
            {
                "id": "cloudshield-sec",
                "name": "CloudShield Security",
                "tagline": "Next-Gen Autonomous Cloud Threat Detection & Compliance",
                "description": "CloudShield continuously scans AWS, GCP, and Azure workloads for misconfigurations, zero-day vulnerabilities, and compliance gaps with automated 1-click remediation.",
                "target_audience": "CTOs, DevOps engineers, and security leads at tech-forward companies.",
                "pricing_tiers": json.dumps([
                    {"tier": "Standard", "price": "$199/month", "details": "Up to 50 cloud assets, SOC2/ISO compliance scans"},
                    {"tier": "Professional", "price": "$499/month", "details": "Unlimited assets, real-time threat response, Slack alerts"},
                    {"tier": "Enterprise", "price": "Custom", "details": "Multi-cloud architecture, 24/7 dedicated SOC team"}
                ]),
                "key_features": json.dumps([
                    "Agentless deployment across AWS, Azure, and GCP in 3 minutes",
                    "Automated SOC 2, HIPAA, and ISO 27001 readiness reports",
                    "AI anomaly detection stopping unauthorized access in real time"
                ]),
                "common_objections": json.dumps([
                    {"objection": "We already have AWS GuardDuty", "counter": "GuardDuty alerts you after an incident. CloudShield proactively fixes misconfigurations and automates audit compliance before threats strike."},
                    {"objection": "Too complex to maintain", "counter": "It is completely agentless — no sidecars, no CPU overhead, zero maintenance."}
                ]),
                "default_greeting": "Hello! This is Jordan from CloudShield Security. We help engineering teams achieve continuous cloud compliance without the manual audit headache. Are you currently preparing for SOC2 or cloud audits?"
            },
            {
                "id": "datasprint-bi",
                "name": "DataSprint AI",
                "tagline": "Conversational Business Intelligence & Instant Data Warehousing",
                "description": "Ask plain-English questions to your database and get immediate dashboards, SQL queries, and predictive revenue forecasts in seconds.",
                "target_audience": "Founders, product managers, and growth analysts who want data without waiting for data engineers.",
                "pricing_tiers": json.dumps([
                    {"tier": "Starter", "price": "$49/month", "details": "Up to 5 team members, 20 data source connectors"},
                    {"tier": "Team", "price": "$149/month", "details": "Unlimited users, automated scheduled Slack reports, predictive modeling"}
                ]),
                "key_features": json.dumps([
                    "Natural language to SQL with 99.4% accuracy",
                    "Direct connectors to Postgres, Snowflake, BigQuery, and Stripe",
                    "Auto-generated executive dashboards in 30 seconds"
                ]),
                "common_objections": json.dumps([
                    {"objection": "We use Metabase / Tableau", "counter": "Tableau requires trained SQL analysts. DataSprint lets non-technical stakeholders answer their own questions instantly without bothering your engineering team."}
                ]),
                "default_greeting": "Hi! This is Taylor from DataSprint AI. We help teams turn raw data into executive insights in plain English. How does your team currently build ad-hoc dashboards?"
            }
        ]

        for p in seed_products:
            cursor.execute("""
            INSERT INTO products (id, name, tagline, description, target_audience, pricing_tiers, key_features, common_objections, default_greeting)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["name"], p["tagline"], p["description"], p["target_audience"],
                p["pricing_tiers"], p["key_features"], p["common_objections"], p["default_greeting"]
            ))

    conn.commit()
    conn.close()

def save_call(call_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO calls (
        id, created_at, duration_seconds, language, product_name,
        recording_filename, recording_consent, sales_status, summary,
        customer_requirements, objections, next_steps, confidence_score,
        status_reason, transcript_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        call_data["id"],
        call_data["created_at"],
        call_data["duration_seconds"],
        call_data["language"],
        call_data["product_name"],
        call_data.get("recording_filename"),
        1 if call_data.get("recording_consent", True) else 0,
        call_data["sales_status"],
        call_data["summary"],
        call_data.get("customer_requirements", ""),
        call_data.get("objections", ""),
        call_data.get("next_steps", ""),
        call_data.get("confidence_score", 0.9),
        call_data.get("status_reason", ""),
        json.dumps(call_data["transcript"]) if isinstance(call_data["transcript"], list) else call_data["transcript"]
    ))
    conn.commit()
    conn.close()
    return call_data["id"]

def get_calls() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM calls ORDER BY created_at DESC")
    rows = cursor.fetchall()
    results = []
    for row in rows:
        item = dict(row)
        try:
            item["transcript"] = json.loads(item["transcript_json"])
        except Exception:
            item["transcript"] = []
        item["recording_consent"] = bool(item["recording_consent"])
        results.append(item)
    conn.close()
    return results

def get_call_by_id(call_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM calls WHERE id = ?", (call_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    item = dict(row)
    try:
        item["transcript"] = json.loads(item["transcript_json"])
    except Exception:
        item["transcript"] = []
    item["recording_consent"] = bool(item["recording_consent"])
    conn.close()
    return item

def delete_call(call_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM calls WHERE id = ?", (call_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def get_products() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        item = dict(r)
        try:
            item["pricing_tiers"] = json.loads(item["pricing_tiers"])
            item["key_features"] = json.loads(item["key_features"])
            item["common_objections"] = json.loads(item["common_objections"])
        except Exception:
            pass
        results.append(item)
    conn.close()
    return results

def get_product_by_id(prod_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    item = dict(row)
    try:
        item["pricing_tiers"] = json.loads(item["pricing_tiers"])
        item["key_features"] = json.loads(item["key_features"])
        item["common_objections"] = json.loads(item["common_objections"])
    except Exception:
        pass
    conn.close()
    return item
