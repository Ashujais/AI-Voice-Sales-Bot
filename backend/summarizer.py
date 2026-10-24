import re
from typing import List, Dict, Any

VALID_STATUSES = [
    "Converted",
    "Interested",
    "Follow-up Required",
    "Not Interested",
    "Demo Requested",
    "No Response"
]

class ConversationSummarizer:
    def __init__(self):
        pass

    def summarize(self, transcript: List[Dict[str, str]], product_name: str, language: str = "en-US") -> Dict[str, Any]:
        """
        Analyzes the conversation transcript and extracts:
        - short summary
        - customer requirements
        - objections
        - next steps
        - sales status (Converted, Interested, Follow-up Required, Not Interested, Demo Requested, No Response)
        """
        customer_msgs = [m.get("text", "").strip() for m in transcript if m.get("speaker") == "customer" and m.get("text", "").strip()]
        bot_msgs = [m.get("text", "").strip() for m in transcript if m.get("speaker") == "bot"]

        # Case 1: No customer response at all
        if not customer_msgs or len(customer_msgs) == 0:
            return {
                "sales_status": "No Response",
                "summary": f"The call with the customer regarding {product_name} concluded without any customer engagement or speech detected.",
                "customer_requirements": "None identified - customer did not respond during the call.",
                "objections": "None recorded.",
                "next_steps": "Re-attempt outbound contact at a different time of day or send an automated introductory email sequence.",
                "confidence_score": 0.98,
                "status_reason": "No audible customer speech or responses were detected during the session."
            }

        full_cust_text = " ".join(customer_msgs).lower()
        full_text = " ".join([m.get("text", "") for m in transcript]).lower()

        # Check for status classifications
        is_converted = bool(re.search(r"\b(buy|purchase|sign up|sign me up|start trial|trial now|subscribe|deal done|take my money|checkout|bill me|send the contract|lets do it|let's do it|ఖచ్చితంగా|हाँ ट्रायल शुरू करें)\b", full_cust_text))
        is_demo_requested = bool(re.search(r"\b(demo|demonstration|show me|walkthrough|book a call|schedule|calendar|tomorrow at|slot|డెమో|डेमो)\b", full_cust_text))
        is_not_interested = bool(re.search(r"\b(not interested|don't want|dont want|stop calling|remove me|no thanks|never call|not looking|don't need|व्याज नहीं|ఆసక్తి లేదు)\b", full_cust_text))
        is_follow_up = bool(re.search(r"\b(call me later|call tomorrow|call next week|busy|in a meeting|email me first|send me details|discuss with my team|check with my boss|check with partner|بعد में|తరువాత)\b", full_cust_text))
        
        # Determine status
        status = "Interested"
        reason = "Customer actively engaged in conversation, asked questions about the product, and explored potential fit."
        confidence = 0.88

        if is_converted:
            status = "Converted"
            reason = "Customer gave an explicit buying signal, agreed to start a trial or requested immediate onboarding/subscription."
            confidence = 0.96
        elif is_demo_requested:
            status = "Demo Requested"
            reason = "Customer requested a live product demonstration or agreed to schedule a walkthrough call."
            confidence = 0.94
        elif is_not_interested:
            status = "Not Interested"
            reason = "Customer explicitly stated they are not interested or requested no further outreach."
            confidence = 0.95
        elif is_follow_up:
            status = "Follow-up Required"
            reason = "Customer indicated they were busy, needed internal team discussion, or requested follow-up at a later date/time."
            confidence = 0.91
        elif len(customer_msgs) == 1 and len(customer_msgs[0].split()) <= 2:
            # Very short single utterance
            status = "Follow-up Required"
            reason = "Call disconnected early after only minimal initial greeting from the customer."
            confidence = 0.82

        # Extract requirements
        requirements_list = []
        if re.search(r"\b(integrate|integration|slack|salesforce|hubspot|crm|api|webhook)\b", full_cust_text):
            requirements_list.append("Seamless integration with existing sales & CRM tooling (e.g., Salesforce/HubSpot/Slack)")
        if re.search(r"\b(team|reps|seats|users|agents|employees)\b", full_cust_text):
            requirements_list.append("Multi-seat collaborative workspace for sales team members")
        if re.search(r"\b(automate|automation|save time|hours|manual)\b", full_cust_text):
            requirements_list.append("Workflow automation to reduce manual data entry and repetitive admin work")
        if re.search(r"\b(price|pricing|cost|budget|cheap|affordable)\b", full_cust_text):
            requirements_list.append("Transparent, predictable pricing model with strong return on investment (ROI)")
        if re.search(r"\b(fast|speed|quick|easy to setup)\b", full_cust_text):
            requirements_list.append("Rapid deployment with minimal onboarding friction or learning curve")
        
        if not requirements_list:
            requirements_list.append(f"Seeking to evaluate {product_name} for optimizing team operations and lead conversion.")

        customer_requirements = "; ".join(requirements_list)

        # Extract objections
        objections_list = []
        if re.search(r"\b(already use|already have|competitor|salesforce|hubspot|zoho|other tool)\b", full_cust_text):
            objections_list.append("Incumbent software in place: Explained how product acts as an intelligent overlay rather than rip-and-replace.")
        if re.search(r"\b(expensive|budget|cost|price|money|dollars)\b", full_cust_text):
            objections_list.append("Pricing & budget considerations: Highlighted entry-level pricing tiers, rapid ROI payback, and 14-day free trial.")
        if re.search(r"\b(busy|no time|complicated|setup|learning)\b", full_cust_text):
            objections_list.append("Time constraint & onboarding complexity: Clarified 1-click cloud sync and zero manual engineering setup.")
        
        if not objections_list:
            objections = "No significant objections raised. Customer was receptive to product capabilities."
        else:
            objections = " | ".join(objections_list)

        # Next Steps
        if status == "Converted":
            next_steps = f"1. Send immediate onboarding welcome kit and account provisioning link for {product_name}.\n2. Assign dedicated customer success specialist for initial 30-day kickoff."
        elif status == "Demo Requested":
            next_steps = f"1. Send calendar invitation with product specialist for live {product_name} demonstration.\n2. Prepare custom demo environment pre-configured for customer's industry."
        elif status == "Follow-up Required":
            next_steps = "1. Send executive 1-page summary PDF and pricing overview via email.\n2. Schedule automated CRM reminder to reconnect next week."
        elif status == "Not Interested":
            next_steps = "1. Mark lead status as 'Nurture / Closed Lost' in CRM.\n2. Suppress cold outreach for 90 days; maintain on quarterly newsletter."
        else:
            next_steps = f"1. Share product feature deck and case study.\n2. Follow up in 48 hours to gauge interest in a 14-day trial."

        # Summary text
        summary = (
            f"Conducted an interactive voice sales call regarding {product_name}. "
            f"Customer engaged over {len(customer_msgs)} speech exchanges. "
            f"Key discussion centered around product value and fit for their workflow. "
            f"Overall sentiment resulted in '{status}' status."
        )

        return {
            "sales_status": status,
            "summary": summary,
            "customer_requirements": customer_requirements,
            "objections": objections,
            "next_steps": next_steps,
            "confidence_score": confidence,
            "status_reason": reason
        }
