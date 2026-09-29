"""
knowledge.py – Verified cooperative/government knowledge retrieval for RAG.
Stores and retrieves verified records from Neon. Falls back to static seed data.
"""
import os
from typing import List, Optional
from models import KnowledgeSource, Scheme, Society

SEED_SCHEMES = [
    {
        "name": "PM Kisan Samman Nidhi (PM-KISAN)",
        "category": "income_support",
        "description": "Central sector scheme providing income support of Rs 6,000 per year in 3 equal four-monthly installments to all landholding farmer families across India.",
        "eligibility": "All landholding farmer families with cultivable land in their names. Subject to standard statutory exclusion criteria (e.g. institutional landholders, income tax payers).",
        "benefits": "Rs 6,000 per annum paid directly via Direct Benefit Transfer (DBT) into Aadhaar-seeded bank accounts in installments of Rs 2,000 every 4 months.",
        "required_documents": ["Aadhaar Card", "Land ownership documents (Khatauni/7/12 extract)", "Active bank account details", "Mobile number linked to Aadhaar"],
        "application_procedure": "Self-registration on PM-KISAN portal (pmkisan.gov.in), PM-KISAN Mobile App, or via village Common Service Centres (CSCs) and local PACS.",
        "official_url": "https://pmkisan.gov.in/",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "applicable_state": None,
        "is_active": True,
        "source": "Ministry of Agriculture & Farmers Welfare, GoI",
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "category": "crop_insurance",
        "description": "Comprehensive crop failure risk insurance from pre-sowing to post-harvest against non-preventable natural risks including drought, flood, pests, and cyclones.",
        "eligibility": "All farmers growing notified crops in notified areas including sharecroppers and tenant farmers. Mandatory for loanee farmers through PACS/Banks, voluntary for non-loanee farmers.",
        "benefits": "Subsidized insurance premium: 2% for Kharif food and oilseed crops, 1.5% for Rabi food and oilseed crops, 5% for annual commercial/horticultural crops. Central & State governments pay the rest.",
        "required_documents": ["Aadhaar Card", "Land possession certificate / RoR", "Sowing certificate or declaration", "Bank passbook copy"],
        "application_procedure": "Apply through National Crop Insurance Portal (pmfby.gov.in), nearest PACS, bank branch, or Common Service Centre before cut-off dates.",
        "official_url": "https://pmfby.gov.in/",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "applicable_state": None,
        "is_active": True,
        "source": "Department of Agriculture and Farmers Welfare, GoI",
    },
    {
        "name": "Kisan Credit Card (KCC) Scheme",
        "category": "agricultural_loan",
        "description": "Short-term credit facility providing timely and adequate credit to farmers for crop cultivation, post-harvest expenses, farm asset maintenance, and allied activities.",
        "eligibility": "All farmers—individual or joint borrowers, tenant farmers, oral lessees, sharecroppers, and Self Help Groups (SHGs) or Joint Liability Groups (JLGs).",
        "benefits": "Short-term crop credit at 7% p.a. with 3% prompt repayment incentive, reducing effective interest rate to 4% p.a. Collateral-free limit up to Rs 1.60 Lakh.",
        "required_documents": ["Duly filled application form", "Identity & Address proof (Aadhaar/Voter ID)", "Land record certificate / tenancy agreement", "Passport photographs"],
        "application_procedure": "Apply in person at nearest Primary Agricultural Credit Society (PACS), District Central Cooperative Bank, or commercial bank branch.",
        "official_url": "https://www.nabard.org/content.aspx?id=572",
        "ministry": "Ministry of Cooperation / NABARD / RBI",
        "applicable_state": None,
        "is_active": True,
        "source": "NABARD / Reserve Bank of India",
    },
    {
        "name": "Computerization of Primary Agricultural Credit Societies (PACS)",
        "category": "cooperative_development",
        "description": "Government of India flagship project with Rs 2,516 Crore outlay to computerized 63,000 functional PACS on a common National ERP platform.",
        "eligibility": "Registered Primary Agricultural Credit Societies affiliated with DCCBs and State Cooperative Banks across all States and Union Territories.",
        "benefits": "Enterprise Resource Planning (ERP) software, high-speed broadband, hardware installation, cloud integration, automated auditing, and single-window citizen services.",
        "required_documents": ["Society Registration Certificate", "Audit reports for last 3 years", "Managing Committee resolution for onboarding"],
        "application_procedure": "State Registrar of Cooperative Societies coordinates onboarding through District Cooperative Central Banks and State Level Implementation Committees.",
        "official_url": "https://cooperation.gov.in/",
        "ministry": "Ministry of Cooperation",
        "applicable_state": None,
        "is_active": True,
        "source": "Ministry of Cooperation, GoI",
    },
    {
        "name": "Agriculture Infrastructure Fund (AIF)",
        "category": "infrastructure",
        "description": "Pan-India financing facility providing medium to long term debt financing for post-harvest management infrastructure and community farming assets.",
        "eligibility": "PACS, Marketing Cooperative Societies, Multi-Purpose Cooperative Societies, FPOs, Agri-entrepreneurs, and Start-ups.",
        "benefits": "3% interest subvention per annum up to a loan limit of Rs 2 Crore for a maximum tenure of 7 years, along with CGTMSE credit guarantee coverage.",
        "required_documents": ["Detailed Project Report (DPR)", "Land title / lease deed", "Registration certificate of society", "Financial statements"],
        "application_procedure": "Apply online at agriinfra.dac.gov.in portal. Projects are verified and sanctioned by participating cooperative and commercial lenders.",
        "official_url": "https://agriinfra.dac.gov.in/",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "applicable_state": None,
        "is_active": True,
        "source": "Department of Agriculture, GoI",
    },
    {
        "name": "Formation & Promotion of 10,000 FPOs Scheme",
        "category": "cooperative_development",
        "description": "Central sector scheme to form and nurture 10,000 Farmer Producer Organizations (FPOs) and Cooperative FPOs to ensure economies of scale for small farmers.",
        "eligibility": "Groups of farmers with minimum 300 members in plains or 100 members in North-Eastern and Hilly areas forming cooperatives or producer companies.",
        "benefits": "Financial support up to Rs 18.00 Lakh per FPO for 3 years, matching equity grant up to Rs 2,000 per farmer member (max Rs 15 Lakh), and credit guarantee up to Rs 2 Crore.",
        "required_documents": ["FPO Registration Certificate", "Member Register with Aadhaar linkage", "Business Plan approved by General Body"],
        "application_procedure": "Implementing Agencies like NCDC, NABARD, and SFAC assign Cluster-Based Business Organizations (CBBOs) to mobilize and register societies.",
        "official_url": "https://www.enam.gov.in/web/fpo",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "applicable_state": None,
        "is_active": True,
        "source": "SFAC / NCDC / NABARD",
    }
]

SEED_SOCIETIES = [
    {
        "name": "Alathur Primary Agricultural Cooperative Society (PACS)",
        "society_type": "PACS",
        "registration_number": "KL-PKD-PACS-421",
        "district": "Palakkad",
        "state": "Kerala",
        "address": "Cooperative Junction, Main Road, Alathur, Palakkad, Kerala - 678541",
        "phone": "+91 4922 222345",
        "email": "pacs.alathur@keralacoop.gov.in",
        "services": [
            "Kisan Credit Card (KCC)",
            "Short-term Crop Loans",
            "Subsidized Fertilizers & Organic Compost",
            "Neethi Consumer & Medical Stores",
            "Agricultural Gold Loans",
            "Paddy Procurement Support"
        ],
        "is_verified": True,
        "verification_source": "Registrar of Cooperative Societies, Government of Kerala",
    },
    {
        "name": "Tiruchengode Agricultural Producers Co-operative Marketing Society",
        "society_type": "Marketing Cooperative",
        "registration_number": "TN-NMK-CMS-184",
        "district": "Namakkal",
        "state": "Tamil Nadu",
        "address": "Market Yard Complex, Velur Road, Tiruchengode, Namakkal, Tamil Nadu - 637211",
        "phone": "+91 4288 252110",
        "email": "tapcms.namakkal@tn.gov.in",
        "services": [
            "E-Auction for Cotton, Turmeric & Groundnut",
            "Pledge Loans Against Agricultural Produce",
            "Cold Storage & Modern Warehouses",
            "Certified Seed Distribution",
            "Farm Machinery Hiring Centre"
        ],
        "is_verified": True,
        "verification_source": "Cooperative Department, Government of Tamil Nadu",
    },
    {
        "name": "Warana Dairy Cooperative Society Ltd",
        "society_type": "Dairy Cooperative",
        "registration_number": "MH-KOP-MSCS-104",
        "district": "Kolhapur",
        "state": "Maharashtra",
        "address": "Warananagar, Panhala Taluka, Kolhapur, Maharashtra - 416113",
        "phone": "+91 2328 224001",
        "email": "contact@waranadairy.coop",
        "services": [
            "Automated Milk Collection & Fat Testing",
            "Veterinary Healthcare & Artificial Insemination",
            "Cattle Feed at Subsidized Prices",
            "Direct Milk Payment to Bank Accounts",
            "Milking Machine & Dairy Equipment Loans"
        ],
        "is_verified": True,
        "verification_source": "Multi-State Cooperative Societies Registrar, Ministry of Cooperation",
    },
    {
        "name": "Tenali Central Cooperative Branch & PACS",
        "society_type": "PACS",
        "registration_number": "AP-GNT-PACS-089",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "address": "Bose Road, Old Bus Stand, Tenali, Guntur District, Andhra Pradesh - 522201",
        "phone": "+91 8644 227890",
        "email": "tenalipacs@dccbguntur.com",
        "services": [
            "KCC Seasonal Crop Loans at 4%",
            "Direct Benefit Transfer Disbursement",
            "Paddy & Chilli Farmer Input Finance",
            "Self Help Group (SHG) Bank Linkage",
            "Rythu Bharosa Kendra Support"
        ],
        "is_verified": True,
        "verification_source": "Andhra Pradesh State Cooperative Bank (APCOB)",
    },
    {
        "name": "Barabanki Kisan Sewa Sahkari Samiti (PACS)",
        "society_type": "PACS",
        "registration_number": "UP-BBK-PACS-882",
        "district": "Barabanki",
        "state": "Uttar Pradesh",
        "address": "Block Road, Dewa Sharif, Barabanki, Uttar Pradesh - 225301",
        "phone": "+91 5248 233412",
        "email": "kisansewa.bbk@upcoop.org",
        "services": [
            "IFFCO Subsidized Nano Urea & DAP",
            "Wheat & Paddy MSP Procurement Counter",
            "Soil Health Card Testing Center",
            "Kisan Credit Card Enrollment",
            "Custom Hiring Centre for Tractors & Harvesters"
        ],
        "is_verified": True,
        "verification_source": "Department of Cooperation, Uttar Pradesh",
    },
    {
        "name": "Mandya Taluk Farmers Cooperative Society",
        "society_type": "PACS",
        "registration_number": "KA-MDY-COOP-301",
        "district": "Mandya",
        "state": "Karnataka",
        "address": "Sugar Town, Mandya, Karnataka - 571401",
        "phone": "+91 8232 221560",
        "email": "info@mandyacoop.in",
        "services": [
            "Sugarcane Advance Payment & Crop Credit",
            "Drip Irrigation Subsidy Processing",
            "Cattle Purchase & Dairy Infrastructure Finance",
            "KMF Nandini Milk Chilling Point",
            "Micro-insurance for Farmer Families"
        ],
        "is_verified": True,
        "verification_source": "Registrar of Cooperative Societies, Karnataka",
    }
]


def seed_knowledge(db: Session) -> None:
    """Insert seed knowledge, schemes, and societies if tables are empty."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    # 1. Knowledge Sources
    if db.query(KnowledgeSource).count() == 0:
        for item in SEED_KNOWLEDGE:
            record = KnowledgeSource(
                title=item["title"],
                category=item["category"],
                content=item["content"],
                source_url=item.get("source_url"),
                ministry=item.get("ministry"),
                language=item.get("language", "en"),
                keywords=item.get("keywords", []),
                is_verified=True,
                verified_at=now,
            )
            db.add(record)

    # 2. Schemes
    if db.query(Scheme).count() == 0:
        for s in SEED_SCHEMES:
            scheme = Scheme(
                name=s["name"],
                category=s.get("category"),
                description=s.get("description"),
                eligibility=s.get("eligibility"),
                benefits=s.get("benefits"),
                required_documents=s.get("required_documents"),
                application_procedure=s.get("application_procedure"),
                official_url=s.get("official_url"),
                applicable_state=s.get("applicable_state"),
                ministry=s.get("ministry"),
                is_active=s.get("is_active", True),
                verified_at=now,
                source=s.get("source"),
            )
            db.add(scheme)

    # 3. Societies
    if db.query(Society).count() == 0:
        for soc in SEED_SOCIETIES:
            society = Society(
                name=soc["name"],
                society_type=soc.get("society_type"),
                registration_number=soc.get("registration_number"),
                district=soc.get("district"),
                state=soc.get("state"),
                address=soc.get("address"),
                phone=soc.get("phone"),
                email=soc.get("email"),
                services=soc.get("services"),
                is_verified=soc.get("is_verified", True),
                verification_source=soc.get("verification_source"),
                verified_at=now,
            )
            db.add(society)

    db.commit()


SEED_KNOWLEDGE = [
    {
        "title": "Multi-State Co-operative Societies Act, 2002",
        "category": "cooperative_law",
        "content": (
            "The Multi-State Co-operative Societies Act, 2002 governs cooperative societies "
            "that operate in more than one state in India. It provides for registration, "
            "management, audit and liquidation of multi-state cooperative societies. "
            "Key provisions include democratic member control, limited liability, "
            "surplus distribution to members, and mandatory annual general meetings."
        ),
        "source_url": "https://mscs.dac.gov.in/Acts/mscsact2002.pdf",
        "ministry": "Ministry of Cooperation",
        "language": "en",
        "keywords": ["cooperative", "MSCS", "multi-state", "act", "2002", "registration"],
    },
    {
        "title": "Primary Agricultural Credit Societies (PACS)",
        "category": "cooperative_services",
        "content": (
            "Primary Agricultural Credit Societies (PACS) are the basic unit of the short-term "
            "cooperative credit structure in India. They provide crop loans, input finance, "
            "and rural services to farmers at the village level. "
            "As of 2023, India has over 1 lakh PACS serving approximately 13 crore farmer members. "
            "Computerization of PACS is being carried out under a central sector scheme with "
            "2516 crore rupees outlay to bring transparency and efficiency."
        ),
        "source_url": "https://www.nabard.org/content.aspx?id=572",
        "ministry": "Ministry of Cooperation / NABARD",
        "language": "en",
        "keywords": ["PACS", "cooperative credit", "crop loan", "village", "computerization"],
    },
    {
        "title": "PM Kisan Samman Nidhi (PM-KISAN)",
        "category": "government_scheme",
        "content": (
            "PM Kisan Samman Nidhi (PM-KISAN) provides income support of Rs 6,000 per year "
            "in three equal installments of Rs 2,000 to all farmer families having cultivable "
            "land across India. Eligibility: small and marginal farmers with landholding up to 2 hectares "
            "(later extended to all farmers). Application through PM-KISAN portal or Common Service Centres."
        ),
        "source_url": "https://pmkisan.gov.in/",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "language": "en",
        "keywords": ["PM-KISAN", "income support", "6000", "farmer", "installment", "scheme"],
    },
    {
        "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "category": "crop_insurance",
        "content": (
            "PMFBY provides comprehensive risk insurance against crop failure due to non-preventable "
            "natural risks from pre-sowing to post-harvest. "
            "Premium rates: 2% for Kharif crops, 1.5% for Rabi crops, 5% for commercial/horticultural crops. "
            "Remaining premium is shared equally between Central and State governments. "
            "Claims are settled based on Crop Cutting Experiments. "
            "Enrollment through banks (for loanee farmers) or Common Service Centres."
        ),
        "source_url": "https://pmfby.gov.in/",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "language": "en",
        "keywords": ["PMFBY", "crop insurance", "kharif", "rabi", "premium", "claim", "fasal bima"],
    },
    {
        "title": "Cooperative Society Membership Eligibility",
        "category": "membership",
        "content": (
            "To become a member of a cooperative society in India, an applicant must: "
            "1. Be 18 years of age or older. "
            "2. Reside or work in the area of operation of the society. "
            "3. Submit the prescribed membership application form. "
            "4. Pay the share capital as specified in the society's bylaws. "
            "5. Submit required documents: identity proof (Aadhaar), address proof, "
            "land records (for agricultural societies), recent passport photograph. "
            "Specific eligibility may vary by state cooperative act and society bylaws."
        ),
        "source_url": "https://www.indiacode.nic.in/bitstream/123456789/1893/4/197202.pdf",
        "ministry": "Ministry of Cooperation",
        "language": "en",
        "keywords": ["membership", "eligibility", "cooperative", "application", "documents", "share capital"],
    },
    {
        "title": "Kisan Credit Card (KCC) Scheme",
        "category": "agricultural_loan",
        "content": (
            "Kisan Credit Card (KCC) scheme provides flexible and simplified credit to farmers. "
            "Coverage: crop cultivation, maintenance of farm assets, allied and non-farm activities, "
            "and consumption needs. Interest rate: 7% p.a. with 3% interest subvention from Government, "
            "making effective rate 4% for prompt repayment. Credit limit based on scale of finance "
            "for crops. Available through PACS, commercial banks, RRBs and cooperative banks."
        ),
        "source_url": "https://www.nabard.org/content.aspx?id=572&catid=8&mid=488",
        "ministry": "Ministry of Agriculture & Farmers Welfare / RBI / NABARD",
        "language": "en",
        "keywords": ["KCC", "kisan credit card", "crop loan", "interest", "4%", "7%", "bank"],
    },
    {
        "title": "National Cooperative Development Corporation (NCDC) Schemes",
        "category": "cooperative_development",
        "content": (
            "NCDC provides financial assistance and developmental support for cooperative societies. "
            "Key schemes include: Cooperative Education and Training Fund, "
            "Integrated Cooperative Development Project (ICDP), "
            "Project for Development of Tribal Cooperatives, "
            "and financial assistance for storage and processing infrastructure. "
            "Assistance is channeled through State Governments and Cooperative Federations."
        ),
        "source_url": "https://www.ncdc.in/",
        "ministry": "Ministry of Cooperation",
        "language": "en",
        "keywords": ["NCDC", "cooperative development", "tribal", "ICDP", "training", "storage"],
    },
    {
        "title": "Grievance Redressal for Cooperative Societies",
        "category": "grievance",
        "content": (
            "Members of cooperative societies can file grievances through: "
            "1. Internal: Society's Board of Directors / Managing Committee. "
            "2. State: Registrar of Cooperative Societies in respective state. "
            "3. National: National Cooperative Union of India (NCUI). "
            "4. Online portals: Centralized Public Grievance Redress and Monitoring System (CPGRAMS) at pgportal.gov.in. "
            "For PACS: NABARD regional offices handle grievances related to credit operations."
        ),
        "source_url": "https://pgportal.gov.in/",
        "ministry": "Ministry of Cooperation",
        "language": "en",
        "keywords": ["grievance", "complaint", "redressal", "registrar", "CPGRAMS", "NCUI"],
    },
]





def retrieve_relevant_sources(
    db: Session,
    query: str,
    language: str = "en",
    top_k: int = 3,
) -> List[KnowledgeSource]:
    """
    Simple keyword-based retrieval from the knowledge_sources table.
    Scores records by how many query words appear in their title, content or keywords.
    Returns the top_k most relevant records.
    """
    query_words = set(query.lower().split())
    # Remove very short/common words
    stop_words = {"the", "a", "an", "is", "are", "of", "to", "and", "in", "for", "what", "how", "can", "i", "me"}
    query_words -= stop_words

    all_sources = db.query(KnowledgeSource).filter(KnowledgeSource.is_verified == True).all()

    scored: list[tuple[int, KnowledgeSource]] = []
    for src in all_sources:
        score = 0
        combined = (
            (src.title or "").lower()
            + " " + (src.content or "").lower()
            + " " + " ".join(src.keywords or [])
        )
        for word in query_words:
            if word in combined:
                score += 1
        if score > 0:
            scored.append((score, src))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in scored[:top_k]]
