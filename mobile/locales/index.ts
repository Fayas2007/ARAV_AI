// locales/index.ts – Multilingual strings for ARAV AI
export type LocaleKey = 'en' | 'hi' | 'ta' | 'te';

export interface Translations {
  // Common
  appName: string;
  tagline: string;
  getStarted: string;
  login: string;
  register: string;
  logout: string;
  save: string;
  cancel: string;
  submit: string;
  back: string;
  retry: string;
  loading: string;
  error: string;
  success: string;
  noData: string;

  // Onboarding
  onboarding: {
    title: string;
    subtitle: string;
    selectLanguage: string;
  };

  // Auth
  auth: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
    state: string;
    district: string;
    language: string;
    society: string;
    registerTitle: string;
    loginTitle: string;
    haveAccount: string;
    noAccount: string;
  };

  // Home
  home: {
    greeting: string;
    searchPlaceholder: string;
    membershipServices: string;
    schemesAndBenefits: string;
    loansFinancial: string;
    documents: string;
    societyInfo: string;
    grievanceSupport: string;
  };

  // Chat
  chat: {
    title: string;
    placeholder: string;
    disclaimer: string;
    suggested: string[];
    noConversations: string;
  };

  // Navigation
  nav: {
    home: string;
    history: string;
    notifications: string;
    profile: string;
  };
}

const en: Translations = {
  appName: 'ARAV AI',
  tagline: 'Cooperative Governance Assistant',
  getStarted: 'Get Started',
  login: 'Login',
  register: 'Register',
  logout: 'Logout',
  save: 'Save',
  cancel: 'Cancel',
  submit: 'Submit',
  back: 'Back',
  retry: 'Retry',
  loading: 'Loading...',
  error: 'Something went wrong',
  success: 'Success',
  noData: 'No data available',

  onboarding: {
    title: 'Welcome to ARAV AI',
    subtitle: 'Your multilingual cooperative governance and legal assistance companion for Indian farmers and rural stakeholders.',
    selectLanguage: 'Select your preferred language',
  },

  auth: {
    fullName: 'Full Name',
    mobile: 'Mobile Number',
    email: 'Email (Optional)',
    password: 'Password',
    state: 'State',
    district: 'District',
    language: 'Preferred Language',
    society: 'Cooperative Society (Optional)',
    registerTitle: 'Create Account',
    loginTitle: 'Welcome Back',
    haveAccount: 'Already have an account? Login',
    noAccount: "Don't have an account? Register",
  },

  home: {
    greeting: 'Hello',
    searchPlaceholder: 'Ask a Question...',
    membershipServices: 'Membership Services',
    schemesAndBenefits: 'Schemes & Benefits',
    loansFinancial: 'Loans & Financial',
    documents: 'Documents',
    societyInfo: 'Society Info',
    grievanceSupport: 'Grievance Support',
  },

  chat: {
    title: 'ARAV AI Chat',
    placeholder: 'Type your question...',
    disclaimer: 'ARAV AI provides informational guidance only and does not replace authorized government officials or qualified legal professionals.',
    suggested: [
      'How do I become a member of a cooperative?',
      'What is PMFBY crop insurance?',
      'How to apply for Kisan Credit Card?',
      'What are PACS services?',
      'How to file a cooperative grievance?',
    ],
    noConversations: 'No conversations yet. Start chatting!',
  },

  nav: {
    home: 'Home',
    history: 'History',
    notifications: 'Notifications',
    profile: 'Profile',
  },
};

const hi: Translations = {
  appName: 'ARAV AI',
  tagline: 'सहकारी शासन सहायक',
  getStarted: 'शुरू करें',
  login: 'लॉग इन',
  register: 'पंजीकरण',
  logout: 'लॉग आउट',
  save: 'सहेजें',
  cancel: 'रद्द करें',
  submit: 'जमा करें',
  back: 'वापस',
  retry: 'पुनः प्रयास',
  loading: 'लोड हो रहा है...',
  error: 'कुछ गलत हुआ',
  success: 'सफलता',
  noData: 'कोई डेटा उपलब्ध नहीं',

  onboarding: {
    title: 'ARAV AI में आपका स्वागत है',
    subtitle: 'भारतीय किसानों और ग्रामीण हितधारकों के लिए बहुभाषी सहकारी शासन सहायक।',
    selectLanguage: 'अपनी पसंदीदा भाषा चुनें',
  },

  auth: {
    fullName: 'पूरा नाम',
    mobile: 'मोबाइल नंबर',
    email: 'ईमेल (वैकल्पिक)',
    password: 'पासवर्ड',
    state: 'राज्य',
    district: 'जिला',
    language: 'पसंदीदा भाषा',
    society: 'सहकारी समिति (वैकल्पिक)',
    registerTitle: 'खाता बनाएं',
    loginTitle: 'वापस स्वागत है',
    haveAccount: 'पहले से खाता है? लॉग इन करें',
    noAccount: 'खाता नहीं है? पंजीकरण करें',
  },

  home: {
    greeting: 'नमस्ते',
    searchPlaceholder: 'प्रश्न पूछें...',
    membershipServices: 'सदस्यता सेवाएं',
    schemesAndBenefits: 'योजनाएं और लाभ',
    loansFinancial: 'ऋण और वित्त',
    documents: 'दस्तावेज़',
    societyInfo: 'समिति जानकारी',
    grievanceSupport: 'शिकायत सहायता',
  },

  chat: {
    title: 'ARAV AI चैट',
    placeholder: 'अपना प्रश्न टाइप करें...',
    disclaimer: 'ARAV AI केवल सूचनात्मक मार्गदर्शन प्रदान करता है।',
    suggested: [
      'सहकारी समिति का सदस्य कैसे बनें?',
      'PMFBY फसल बीमा क्या है?',
      'किसान क्रेडिट कार्ड के लिए आवेदन कैसे करें?',
      'PACS सेवाएं क्या हैं?',
      'शिकायत कैसे दर्ज करें?',
    ],
    noConversations: 'अभी तक कोई बातचीत नहीं। चैट शुरू करें!',
  },

  nav: {
    home: 'होम',
    history: 'इतिहास',
    notifications: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
  },
};

const ta: Translations = {
  appName: 'ARAV AI',
  tagline: 'கூட்டுறவு நிர்வாக உதவியாளர்',
  getStarted: 'தொடங்கு',
  login: 'உள்நுழைய',
  register: 'பதிவு',
  logout: 'வெளியேறு',
  save: 'சேமி',
  cancel: 'ரத்து',
  submit: 'சமர்ப்பி',
  back: 'திரும்பு',
  retry: 'மீண்டும் முயற்சி',
  loading: 'ஏற்றுகிறது...',
  error: 'பிழை ஏற்பட்டது',
  success: 'வெற்றி',
  noData: 'தரவு இல்லை',

  onboarding: {
    title: 'ARAV AI-க்கு வரவேற்கிறோம்',
    subtitle: 'இந்திய விவசாயிகளுக்கான பன்மொழி கூட்டுறவு நிர்வாக உதவியாளர்.',
    selectLanguage: 'உங்கள் விருப்பமான மொழியை தேர்வு செய்யுங்கள்',
  },

  auth: {
    fullName: 'முழு பெயர்',
    mobile: 'கைபேசி எண்',
    email: 'மின்னஞ்சல் (விருப்பம்)',
    password: 'கடவுச்சொல்',
    state: 'மாநிலம்',
    district: 'மாவட்டம்',
    language: 'விருப்பமான மொழி',
    society: 'கூட்டுறவு சங்கம் (விருப்பம்)',
    registerTitle: 'கணக்கு உருவாக்கு',
    loginTitle: 'மீண்டும் வரவேற்கிறோம்',
    haveAccount: 'கணக்கு உள்ளதா? உள்நுழைய',
    noAccount: 'கணக்கு இல்லையா? பதிவு செய்க',
  },

  home: {
    greeting: 'வணக்கம்',
    searchPlaceholder: 'கேள்வி கேளுங்கள்...',
    membershipServices: 'உறுப்பினர் சேவைகள்',
    schemesAndBenefits: 'திட்டங்கள் & நலன்கள்',
    loansFinancial: 'கடன் & நிதி',
    documents: 'ஆவணங்கள்',
    societyInfo: 'சங்க தகவல்',
    grievanceSupport: 'புகார் ஆதரவு',
  },

  chat: {
    title: 'ARAV AI அரட்டை',
    placeholder: 'உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்...',
    disclaimer: 'ARAV AI தகவல் வழிகாட்டுதல் மட்டுமே வழங்குகிறது.',
    suggested: [
      'கூட்டுறவு உறுப்பினர் எப்படி ஆவது?',
      'PMFBY பயிர் காப்பீடு என்ன?',
      'கிசான் கிரெடிட் கார்டு விண்ணப்பிக்க எப்படி?',
      'PACS சேவைகள் என்ன?',
      'புகார் எப்படி அளிப்பது?',
    ],
    noConversations: 'இன்னும் உரையாடல் இல்லை. தொடங்குங்கள்!',
  },

  nav: {
    home: 'முகப்பு',
    history: 'வரலாறு',
    notifications: 'அறிவிப்புகள்',
    profile: 'சுயவிவரம்',
  },
};

const te: Translations = {
  appName: 'ARAV AI',
  tagline: 'సహకార పాలన సహాయకుడు',
  getStarted: 'ప్రారంభించండి',
  login: 'లాగిన్',
  register: 'నమోదు',
  logout: 'లాగ్ అవుట్',
  save: 'సేవ్ చేయండి',
  cancel: 'రద్దు',
  submit: 'సమర్పించండి',
  back: 'వెనక్కి',
  retry: 'మళ్ళీ ప్రయత్నించండి',
  loading: 'లోడవుతోంది...',
  error: 'లోపం జరిగింది',
  success: 'విజయం',
  noData: 'డేటా లేదు',

  onboarding: {
    title: 'ARAV AI కి స్వాగతం',
    subtitle: 'భారతీయ రైతులకు బహుభాషా సహకార పాలన సహాయకుడు.',
    selectLanguage: 'మీకు నచ్చిన భాషను ఎంచుకోండి',
  },

  auth: {
    fullName: 'పూర్తి పేరు',
    mobile: 'మొబైల్ నంబర్',
    email: 'ఇమెయిల్ (ఐచ్ఛికం)',
    password: 'పాస్‌వర్డ్',
    state: 'రాష్ట్రం',
    district: 'జిల్లా',
    language: 'ఇష్టమైన భాష',
    society: 'సహకార సంఘం (ఐచ్ఛికం)',
    registerTitle: 'ఖాతా సృష్టించండి',
    loginTitle: 'తిరిగి స్వాగతం',
    haveAccount: 'ఖాతా ఉందా? లాగిన్',
    noAccount: 'ఖాతా లేదా? నమోదు',
  },

  home: {
    greeting: 'నమస్కారం',
    searchPlaceholder: 'ప్రశ్న అడగండి...',
    membershipServices: 'సభ్యత్వ సేవలు',
    schemesAndBenefits: 'పథకాలు & ప్రయోజనాలు',
    loansFinancial: 'రుణాలు & ఆర్థికం',
    documents: 'పత్రాలు',
    societyInfo: 'సంఘం సమాచారం',
    grievanceSupport: 'ఫిర్యాదు మద్దతు',
  },

  chat: {
    title: 'ARAV AI చాట్',
    placeholder: 'మీ ప్రశ్న టైప్ చేయండి...',
    disclaimer: 'ARAV AI సమాచార మార్గదర్శకత్వం మాత్రమే అందిస్తుంది.',
    suggested: [
      'సహకార సభ్యుడు ఎలా కావాలి?',
      'PMFBY పంట భీమా అంటే ఏమిటి?',
      'కిసాన్ క్రెడిట్ కార్డు ఎలా దరఖాస్తు చేయాలి?',
      'PACS సేవలు ఏమిటి?',
      'ఫిర్యాదు ఎలా దాఖలు చేయాలి?',
    ],
    noConversations: 'ఇంకా సంభాషణ లేదు. ప్రారంభించండి!',
  },

  nav: {
    home: 'హోమ్',
    history: 'చరిత్ర',
    notifications: 'నోటిఫికేషన్లు',
    profile: 'ప్రొఫైల్',
  },
};

export const locales: Record<LocaleKey, Translations> = { en, hi, ta, te };

export function t(lang: LocaleKey, key: string): string {
  const keys = key.split('.');
  let val: any = locales[lang] || locales.en;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) {
      // fallback to English
      let fallback: any = locales.en;
      for (const fk of keys) fallback = fallback?.[fk];
      return typeof fallback === 'string' ? fallback : key;
    }
  }
  return typeof val === 'string' ? val : key;
}
