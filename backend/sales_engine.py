import re
import json
from typing import List, Dict, Any

class SalesEngine:
    def __init__(self):
        pass

    def generate_response(self, customer_message: str, history: List[Dict[str, str]], product: Dict[str, Any], language: str = "en-US") -> Dict[str, Any]:
        """
        Generates a contextual, persuasive sales response based on customer speech,
        conversation stage, product details, and chosen language.
        """
        msg = customer_message.strip().lower()
        lang = language.lower()

        # Turn count
        user_turns = [m for m in history if m.get("speaker") == "customer"]
        turn_number = len(user_turns) + 1

        # Check for language switch cues
        if "hindi" in msg or "हिंदी" in msg:
            lang = "hi-in"
        elif "telugu" in msg or "తెలుగు" in msg:
            lang = "te-in"

        prod_name = product.get("name", "FlowPulse AI CRM")
        tagline = product.get("tagline", "Autonomous Sales Automation")

        # Intent detection
        is_greeting = bool(re.search(r"\b(hi|hello|hey|namaste|vanakkam|good morning|good afternoon|good evening)\b", msg))
        is_pricing = bool(re.search(r"\b(price|pricing|cost|how much|fee|expensive|cheap|charge|rate|subscription|dollars|rupees)\b", msg))
        is_demo_request = bool(re.search(r"\b(demo|demonstration|show me|walkthrough|presentation|schedule a call|book a slot|calendar)\b", msg))
        is_closing_signal = bool(re.search(r"\b(buy|purchase|sign up|sign me up|start trial|subscribe|deal|i want this|go ahead|checkout|get started)\b", msg))
        is_rejection = bool(re.search(r"\b(not interested|don't want|dont want|stop|no thanks|never call|remove me|no need|bye)\b", msg))
        is_followup = bool(re.search(r"\b(call me later|call tomorrow|next week|busy right now|email me|send details|discuss with team|boss|manager|partner)\b", msg))
        is_features = bool(re.search(r"\b(features|what does it do|how does it work|capabilities|specs|integrate|integration|slack|salesforce|hubspot|whatsapp)\b", msg))
        is_objection_time = bool(re.search(r"\b(no time|too busy|takes too long|hard to setup|complicated)\b", msg))
        is_objection_competitor = bool(re.search(r"\b(already use|already have|competitor|salesforce|hubspot|zoho|pipedrive|spreadsheet|excel)\b", msg))

        # English responses
        if "hi" in lang:
            # Hindi responses
            return self._generate_hindi_response(
                msg, prod_name, is_greeting, is_pricing, is_demo_request,
                is_closing_signal, is_rejection, is_followup, is_features, turn_number
            )
        elif "te" in lang:
            # Telugu responses
            return self._generate_telugu_response(
                msg, prod_name, is_greeting, is_pricing, is_demo_request,
                is_closing_signal, is_rejection, is_followup, is_features, turn_number
            )
        else:
            # English responses
            return self._generate_english_response(
                msg, product, is_greeting, is_pricing, is_demo_request,
                is_closing_signal, is_rejection, is_followup, is_features,
                is_objection_time, is_objection_competitor, turn_number
            )

    def _generate_english_response(self, msg, product, is_greeting, is_pricing, is_demo_request,
                                  is_closing_signal, is_rejection, is_followup, is_features,
                                  is_objection_time, is_objection_competitor, turn_number):
        prod_name = product.get("name", "FlowPulse AI CRM")
        
        # 1. Closing / Buy signal
        if is_closing_signal:
            return {
                "text": f"Fantastic! We're thrilled to welcome you to {prod_name}. I can activate your 14-day zero-risk trial right now with full premium features unlocked. Shall I send the instant onboarding link directly to your email, or would you prefer a quick 5-minute setup call with me?",
                "intent": "closing",
                "suggested_status": "Converted"
            }

        # 2. Demo Request
        if is_demo_request:
            return {
                "text": f"I would love to give you a personalized live demo of {prod_name}! We have open slots tomorrow at 11 AM or 3 PM. Which time works best for you and your team?",
                "intent": "demo_booking",
                "suggested_status": "Demo Requested"
            }

        # 3. Explicit Rejection
        if is_rejection:
            return {
                "text": "I completely understand and respect your time. If you ever need to automate your pipeline and eliminate manual admin work down the road, please feel free to check out our website. Thank you so much for your time today, and have a wonderful week!",
                "intent": "rejection_handled",
                "suggested_status": "Not Interested"
            }

        # 4. Follow-up / Busy
        if is_followup:
            return {
                "text": "Totally understand! I know you're running a busy schedule. I will send a quick 1-page overview to your inbox right now. Would it be better if I follow up with you early next week on Tuesday or Wednesday afternoon?",
                "intent": "follow_up",
                "suggested_status": "Follow-up Required"
            }

        # 5. Competitor Objection
        if is_objection_competitor:
            return {
                "text": f"That makes total sense! Many of our best customers actually continue using Salesforce or HubSpot. {prod_name} works as an intelligent overlay that eliminates all manual note-taking, scores leads instantly, and updates your CRM automatically so your reps don't have to spend hours on data entry. Would saving 10 hours a week per rep be helpful for your team?",
                "intent": "objection_competitor",
                "suggested_status": "Interested"
            }

        # 6. Pricing Inquiry
        if is_pricing:
            tiers = product.get("pricing_tiers", [])
            tier_info = "our Starter tier begins at just $29 per user per month, and Growth is $79 per month with full AI automation included."
            if isinstance(tiers, list) and len(tiers) > 0:
                tier_info = f"our Starter plan is {tiers[0].get('price', '$29/mo')} and our most popular Growth tier is {tiers[1].get('price', '$79/mo') if len(tiers) > 1 else '$79/mo'}."
            return {
                "text": f"Great question! We keep our pricing super transparent: {tier_info} Every tier includes a 14-day free trial, no credit card required, and full data migration. How many seats or team members would you be looking to set up?",
                "intent": "pricing_explained",
                "suggested_status": "Interested"
            }

        # 7. Time / Complexity Objection
        if is_objection_time:
            return {
                "text": f"I completely hear you! Nobody has weeks to learn a new tool. That's why {prod_name} takes literally 3 minutes to activate with 1-click cloud sync. There is zero manual training needed because the AI does the heavy lifting for you. Would you like me to walk you through a quick 2-minute visual preview?",
                "intent": "objection_complexity",
                "suggested_status": "Interested"
            }

        # 8. Features & How it works
        if is_features:
            features = product.get("key_features", [])
            feature_summary = "automatic lead capture, real-time AI scoring, and instant sync with your existing tools like Gmail and Slack."
            if isinstance(features, list) and len(features) >= 2:
                feature_summary = f"{features[0]}, and {features[1]}."
            return {
                "text": f"At its core, {prod_name} delivers {feature_summary} The biggest benefit is that it frees up your team from repetitive tasks so you can focus 100% on closing deals. What is the single biggest bottleneck your team faces right now in sales?",
                "intent": "features_explained",
                "suggested_status": "Interested"
            }

        # 9. Greeting / Conversation Opening
        if is_greeting and turn_number <= 2:
            return {
                "text": f"Hello! Great to connect with you. I'm Alex from {prod_name}. We help modern teams scale revenue by automating their routine workflows and closing deals faster. Could you tell me a little bit about what your company is currently focused on this quarter?",
                "intent": "discovery_open",
                "suggested_status": "Interested"
            }

        # 10. General conversational progression based on turn count
        if turn_number == 1:
            return {
                "text": f"Hi there! Thank you for taking my call. I'm with {prod_name}. We've built an AI sales acceleration engine that cuts lead response time to under 60 seconds. Could I ask how many reps or team members you currently have?",
                "intent": "qualification",
                "suggested_status": "Interested"
            }
        elif turn_number == 2:
            return {
                "text": "That's very helpful context! What we typically see is that teams lose up to 30% of potential pipeline simply due to delayed follow-ups and manual admin work. If we could automate your lead qualification and give your reps their time back, is that something you'd be open to exploring?",
                "intent": "value_hook",
                "suggested_status": "Interested"
            }
        elif turn_number == 3:
            return {
                "text": f"Exactly! That's where {prod_name} shines. We can set up a tailored 15-minute demo with our product specialist to show you how it works with your exact workflow. Would tomorrow afternoon or Thursday morning suit you better?",
                "intent": "closing_demo",
                "suggested_status": "Demo Requested"
            }
        else:
            return {
                "text": f"I appreciate you sharing that! Based on our conversation, {prod_name} is an ideal fit to solve that exact issue. I can set you up with our VIP 14-day trial or book a brief 10-minute demo with our engineering team. Which one would you prefer to start with?",
                "intent": "call_to_action",
                "suggested_status": "Interested"
            }

    def _generate_hindi_response(self, msg, prod_name, is_greeting, is_pricing, is_demo_request,
                                is_closing_signal, is_rejection, is_followup, is_features, turn_number):
        if is_closing_signal:
            return {
                "text": f"बहुत बढ़िया! {prod_name} में आपका स्वागत है। मैं आपका 14 दिनों का फ्री ट्रायल अभी एक्टिवेट कर देता हूँ। क्या मैं एक्टिवेशन लिंक आपके ईमेल पर भेज दूँ?",
                "intent": "closing",
                "suggested_status": "Converted"
            }
        if is_demo_request:
            return {
                "text": f"ज़रूर! हम आपके लिए {prod_name} का एक लाइव डेमो आयोजित कर सकते हैं। क्या कल दोपहर 12 बजे या शाम 4 बजे आपके लिए सुविधाजनक रहेगा?",
                "intent": "demo_booking",
                "suggested_status": "Demo Requested"
            }
        if is_rejection:
            return {
                "text": "मैं आपकी बात समझता हूँ। समय देने के लिए बहुत-बहुत धन्यवाद! यदि भविष्य में आपको अपने सेल्स वर्कफ़्लो को ऑटोमेट करने की आवश्यकता हो, तो हमारी वेबसाइट अवश्य देखें। आपका दिन शुभ हो!",
                "intent": "rejection_handled",
                "suggested_status": "Not Interested"
            }
        if is_followup:
            return {
                "text": "बिल्कुल, मैं समझता हूँ कि आप व्यस्त हैं। मैं आपको एक संक्षिप्त जानकारी ईमेल पर भेज देता हूँ। क्या मैं अगले हफ़्ते मंगलवार को दोबारा बात कर सकता हूँ?",
                "intent": "follow_up",
                "suggested_status": "Follow-up Required"
            }
        if is_pricing:
            return {
                "text": f"{prod_name} का शुरुआती प्लान केवल ₹2,400 प्रति यूज़र प्रति माह से शुरू होता है और इसमें 14 दिनों का फ़्री ट्रायल शामिल है, जिसमें क्रेडिट कार्ड की भी ज़रूरत नहीं है। आपकी टीम में कितने सदस्य हैं?",
                "intent": "pricing_explained",
                "suggested_status": "Interested"
            }
        if is_features:
            return {
                "text": f"{prod_name} आपके लीड्स को स्वचालित रूप से कैप्चर करता है, AI द्वारा स्कोर करता है और बिना किसी मैन्युअल काम के तुरंत फॉलो-अप मैसेज भेजता है। क्या आप इसका 2 मिनट का प्रीव्यू देखना चाहेंगे?",
                "intent": "features_explained",
                "suggested_status": "Interested"
            }
        if is_greeting:
            return {
                "text": f"नमस्ते! मैं {prod_name} से बात कर रहा हूँ। हम कंपनियों को उनके सेल्स और कस्टमर मैनेजमेंट को AI की मदद से तेज़ करने में सहायता करते हैं। क्या आप अभी इसके बारे में 2 मिनट बात कर सकते हैं?",
                "intent": "greeting",
                "suggested_status": "Interested"
            }
        return {
            "text": f"बहुत खूब! {prod_name} आपकी टीम का बहुत सारा समय बचा सकता है और सेल्स को दोगुना कर सकता है। क्या आप कल इसका एक त्वरित लाइव डेमो देखना चाहेंगे?",
            "intent": "general_sales",
            "suggested_status": "Interested"
        }

    def _generate_telugu_response(self, msg, prod_name, is_greeting, is_pricing, is_demo_request,
                                 is_closing_signal, is_rejection, is_followup, is_features, turn_number):
        if is_closing_signal:
            return {
                "text": f"చాలా సంతోషం! {prod_name} కు స్వాగతం. నేను మీ 14 రోజుల ఉచిత ట్రయల్‌ని ఇప్పుడే యాక్టివేట్ చేస్తాను. లింక్‌ని మీ ఈమెయిల్‌కి పంపమంటారా?",
                "intent": "closing",
                "suggested_status": "Converted"
            }
        if is_demo_request:
            return {
                "text": f"ఖచ్చితంగా! మేము మీకు {prod_name} లైవ్ డెమోని చూపించాలనుకుంటున్నాము. రేపు ఉదయం 11 గంటలకు లేదా సాయంత్రం 4 గంటలకు మీకు ఏ సమయం అనుకూలంగా ఉంటుంది?",
                "intent": "demo_booking",
                "suggested_status": "Demo Requested"
            }
        if is_rejection:
            return {
                "text": "మీ సమయాన్ని నేను గౌరవిస్తాను. మాట్లాడినందుకు చాలా ధన్యవాదాలు! భవిష్యత్తులో మీకు సహాయం కావాలంటే మా వెబ్‌సైట్‌ను చూడండి. శుభదినం!",
                "intent": "rejection_handled",
                "suggested_status": "Not Interested"
            }
        if is_followup:
            return {
                "text": "అర్థమైంది, మీరు బిజీగా ఉన్నారు. నేను వివరాలను మీ ఈమెయిల్‌కు పంపుతాను. వచ్చే వారం మంగళవారం నేను మళ్లీ కాల్ చేయవచ్చా?",
                "intent": "follow_up",
                "suggested_status": "Follow-up Required"
            }
        if is_pricing:
            return {
                "text": f"{prod_name} ప్లాన్స్ నెలకు యూజర్‌కి కేవలం ₹2,400 నుండి ప్రారంభమవుతాయి మరియు 14 రోజుల ఉచిత ట్రయల్ కూడా ఉంది. మీ టీమ్‌లో ఎంతమంది సభ్యులు ఉన్నారు?",
                "intent": "pricing_explained",
                "suggested_status": "Interested"
            }
        if is_features:
            return {
                "text": f"{prod_name} మీ సేల్స్ లీడ్స్‌ని ఆటోమేటిక్‌గా ట్రాక్ చేస్తుంది మరియు AI ద్వారా ఫాలో-అప్‌లను సులభతరం చేస్తుంది. మీరు దీని లైవ్ డెమో చూడాలనుకుంటున్నారా?",
                "intent": "features_explained",
                "suggested_status": "Interested"
            }
        if is_greeting:
            return {
                "text": f"నమస్కారం! నేను {prod_name} నుండి మాట్లాడుతున్నాను. మేము కంపెనీల సేల్స్ మరియు కస్టమర్ ప్రాసెస్‌ను AI తో వేగవంతం చేయడంలో సహాయం చేస్తాము. మీరు 2 నిమిషాలు మాట్లాడగలరా?",
                "intent": "greeting",
                "suggested_status": "Interested"
            }
        return {
            "text": f"{prod_name} మీ సమయాన్ని చాలా ఆదా చేస్తుంది మరియు వ్యాపారాన్ని పెంచుతుంది. మీరు రేపు ఒక చిన్న లైవ్ డెమో చూసేందుకు ఆసక్తిగా ఉన్నారా?",
            "intent": "general_sales",
            "suggested_status": "Interested"
        }
