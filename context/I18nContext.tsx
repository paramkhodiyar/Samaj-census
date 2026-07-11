'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'gu';

const translations = {
  en: {
    // Navigation
    home: 'Home',
    family: 'Family',
    requests: 'Requests',
    stats: 'Statistics',
    profile: 'Profile',
    logout: 'Logout',
    language: 'Language',
    role: 'Role',

    // Common Buttons / Actions
    edit: 'Edit',
    delete: 'Delete',
    submit: 'Submit',
    cancel: 'Cancel',
    next: 'Next',
    back: 'Back',
    save: 'Save',
    verify: 'Verify',
    reject: 'Reject',
    approve: 'Approve',
    requestCorrection: 'Request Correction',
    close: 'Close',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    viewDetails: 'View Details',

    // Statuses
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CORRECTION_REQUIRED: 'Correction Required',

    // Splash / Welcome Screen
    samajTitle: 'Shri Kutch Gurjar Kshatriya Samaj',
    portalVision: 'Digital Family Record Portal',
    enterPortal: 'Enter Portal',
    footerCredits: 'Developed & Maintained by Param Khodiyar | Version 1.0',
    comingSoon: 'Coming Soon',
    residentsPortalTitle: 'Residents of India',
    residentsPortalDesc: 'Access the Census Portal for community members residing inside India. Setup is in progress.',
    locked: 'Under Development',
    active: 'Active',
    nriPortalTitle: 'NRI Members',
    nriPortalDesc: 'Access the Census Portal for community members residing outside India (Non-Resident Indians).',

    // Login Screen
    loginTitle: 'Sign In to Portal',
    loginSubtitle: 'Manage your family records & census data',
    mobileNumber: 'Mobile Number',
    password: 'Password',
    loginBtn: 'Sign In',
    otpLoginBtn: 'Login with OTP',
    pwdLoginBtn: 'Login with Password',
    sendOtp: 'Send OTP',
    enterOtp: 'Enter OTP Code',
    dontHaveAccount: "Don't have an account?",
    registerNow: 'Register Now',

    // Register Screen
    registerTitle: 'Family Registration',
    registerSubtitle: 'Register against the existing Samaj census database',
    familyId: 'Family ID',
    confirmPassword: 'Confirm Password',
    registerBtn: 'Register',
    alreadyHaveAccount: 'Already have an account?',
    signInNow: 'Sign In Now',

    // Home / Dashboard
    welcome: 'Welcome',
    familyOverview: 'Family Overview',
    membersCount: 'Members',
    pendingReqCount: 'Pending Requests',
    lastUpdated: 'Last Updated',
    quickActions: 'Quick Actions',
    updateDetails: 'Update Details',
    addMember: 'Add Member',
    removeMember: 'Remove Member',
    transferMember: 'Transfer Member',
    otherCorrections: 'Other Corrections',
    ghatakAdminPortal: 'Ghatak Admin Portal',
    pradeshikAdminPortal: 'Pradeshik Admin Portal',
    superAdminPortal: 'Super Admin Portal',
    pendingVerificationQueue: 'Pending Verification Queue',
    censusOverview: 'Census Overview',
    recentActivity: 'Recent Audit Logs',

    // Family Details
    familyInfo: 'Family Information',
    headName: 'Head Name',
    pradeshik: 'Pradeshik',
    ghatak: 'Ghatak',
    nativeVillage: 'Native Village',
    address: 'Current Address',
    membersList: 'Family Members',
    relation: 'Relation',
    age: 'Age',
    occupation: 'Occupation',
    education: 'Education',
    bloodGroup: 'Blood Group',
    gender: 'Gender',
    maritalStatus: 'Marital Status',
    aliveStatus: 'Status',
    alive: 'Alive',
    deceased: 'Deceased',
    photo: 'Photo',

    // Multi-Step Wizard
    wizardTitle: 'Update Family Record Wizard',
    step1: 'Family Information',
    step2: 'Add Member',
    step3: 'Remove Member',
    step4: 'Transfer Member',
    step5: 'Other Corrections',
    step6: 'Photos & Documents',
    step7: 'Review & Submit',
    reasonForRemoval: 'Reason for Removal',
    targetFamilyId: 'Target Family ID',
    reasonForTransfer: 'Reason for Transfer',
    describeCorrections: 'Describe required corrections in detail',
    docName: 'Document Name (e.g. Aadhaar Card, Marriage Certificate)',
    docUrl: 'Document File URL / Link',
    noChanges: 'No changes specified in this step.',
    addAnotherMember: 'Add Another Member',
    reviewHeading: 'Please review your changes before submitting',
    confirmSubmit: 'Review and Submit Request',

    // Stats Screen
    communityFamilies: 'Community Families',
    communityMembers: 'Community Members',
    genderRatio: 'Gender Distribution',
    educationLevels: 'Education Levels',
    occupationDistribution: 'Occupation Distribution',
    male: 'Male',
    female: 'Female',
    other: 'Other',

    // Profile Screen
    accountSettings: 'Account Settings',
    changePassword: 'Change Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePasswordBtn: 'Update Password',
    aboutApp: 'About Portal',
    auditLogs: 'Audit Logs',
    date: 'Date',
    action: 'Action',
    details: 'Details',
    user: 'User',
  },
  hi: {
    // Navigation
    home: 'होम',
    family: 'परिवार',
    requests: 'अनुरोध',
    stats: 'सांख्यिकी',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉगआउट',
    language: 'भाषा',
    role: 'भूमिका',

    // Common Buttons / Actions
    edit: 'संपादित करें',
    delete: 'हटाएं',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    next: 'आगे',
    back: 'पीछे',
    save: 'सहेजें',
    verify: 'सत्यापित करें',
    reject: 'अस्वीकार करें',
    approve: 'स्वीकार करें',
    requestCorrection: 'सुधार का अनुरोध',
    close: 'बंद करें',
    loading: 'लोड हो रहा है...',
    success: 'सफलता',
    error: 'त्रुटि',
    viewDetails: 'विवरण देखें',

    // Statuses
    PENDING: 'लंबित',
    APPROVED: 'स्वीकृत',
    REJECTED: 'अस्वीकृत',
    CORRECTION_REQUIRED: 'सुधार की आवश्यकता',

    // Splash / Welcome Screen
    samajTitle: 'श्री कच्छ गुर्जर क्षत्रिय समाज',
    portalVision: 'डिजिटल पारिवारिक रिकॉर्ड पोर्टल',
    enterPortal: 'पोर्टल में प्रवेश करें',
    footerCredits: 'विकास और रखरखाव परम खोडियार द्वारा | संस्करण 1.0',
    comingSoon: 'शीघ्र आ रहा है',
    residentsPortalTitle: 'भारत के निवासी',
    residentsPortalDesc: 'भारत में रहने वाले समुदाय के सदस्यों के लिए जनगणना पोर्टल। सेटअप प्रगति पर है।',
    locked: 'विकास के अधीन',
    active: 'सक्रिय',
    nriPortalTitle: 'एनआरआई सदस्य',
    nriPortalDesc: 'भारत से बाहर (अनिवासी भारतीयों) रहने वाले समुदाय के सदस्यों के लिए जनगणना पोर्टल।',

    // Login Screen
    loginTitle: 'पोर्टल में साइन इन करें',
    loginSubtitle: 'अपने पारिवारिक रिकॉर्ड और जनगणना डेटा प्रबंधित करें',
    mobileNumber: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    loginBtn: 'साइन इन करें',
    otpLoginBtn: 'ओटीपी के साथ लॉगिन करें',
    pwdLoginBtn: 'पासवर्ड के साथ लॉगिन करें',
    sendOtp: 'ओटीपी भेजें',
    enterOtp: 'ओटीपी कोड दर्ज करें',
    dontHaveAccount: 'खाता नहीं है?',
    registerNow: 'अभी पंजीकरण करें',

    // Register Screen
    registerTitle: 'पारिवारिक पंजीकरण',
    registerSubtitle: 'मौजूदा समाज जनगणना डेटाबेस के साथ पंजीकरण करें',
    familyId: 'पारिवारिक आईडी (Family ID)',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    registerBtn: 'पंजीकरण करें',
    alreadyHaveAccount: 'पहले से ही एक खाता है?',
    signInNow: 'अभी साइन इन करें',

    // Home / Dashboard
    welcome: 'स्वागत हे',
    familyOverview: 'पारिवारिक विवरण',
    membersCount: 'सदस्य',
    pendingReqCount: 'लंबित अनुरोध',
    lastUpdated: 'अंतिम अपडेट',
    quickActions: 'त्वरित कार्रवाई',
    updateDetails: 'विवरण अपडेट करें',
    addMember: 'सदस्य जोड़ें',
    removeMember: 'सदस्य हटाएं',
    transferMember: 'सदस्य स्थानांतरित करें',
    otherCorrections: 'अन्य सुधार',
    ghatakAdminPortal: 'घटक एडमिन पोर्टल',
    pradeshikAdminPortal: 'प्रादेशिक एडमिन पोर्टल',
    superAdminPortal: 'सुपर एडमिन पोर्टल',
    pendingVerificationQueue: 'लंबित सत्यापन कतार',
    censusOverview: 'जनगणना अवलोकन',
    recentActivity: 'हालिया ऑडिट लॉग',

    // Family Details
    familyInfo: 'पारिवारिक जानकारी',
    headName: 'मुखिया का नाम',
    pradeshik: 'प्रादेशिक',
    ghatak: 'घटक',
    nativeVillage: 'मूल गाँव',
    address: 'वर्तमान पता',
    membersList: 'परिवार के सदस्य',
    relation: 'संबंध',
    age: 'आयु',
    occupation: 'व्यवसाय',
    education: 'शिक्षा',
    bloodGroup: 'रक्त समूह',
    gender: 'लिंग',
    maritalStatus: 'वैवाहिक स्थिति',
    aliveStatus: 'स्थिति',
    alive: 'जीवित',
    deceased: 'दिवंगत',
    photo: 'तस्वीर',

    // Multi-Step Wizard
    wizardTitle: 'पारिवारिक रिकॉर्ड अपडेट विज़ार्ड',
    step1: 'पारिवारिक जानकारी',
    step2: 'सदस्य जोड़ें',
    step3: 'सदस्य हटाएं',
    step4: 'सदस्य स्थानांतरित करें',
    step5: 'अन्य सुधार',
    step6: 'तस्वीरें और दस्तावेज',
    step7: 'समीक्षा करें और जमा करें',
    reasonForRemoval: 'हटाने का कारण',
    targetFamilyId: 'लक्ष्य पारिवारिक आईडी',
    reasonForTransfer: 'स्थानांतरण का कारण',
    describeCorrections: 'आवश्यक सुधारों का विस्तार से वर्णन करें',
    docName: 'दस्तावेज़ का नाम (जैसे आधार कार्ड, विवाह प्रमाण पत्र)',
    docUrl: 'दस्तावेज़ फ़ाइल यूआरएल / लिंक',
    noChanges: 'इस चरण में कोई बदलाव निर्दिष्ट नहीं है।',
    addAnotherMember: 'एक और सदस्य जोड़ें',
    reviewHeading: 'कृपया सबमिट करने से पहले अपने बदलावों की समीक्षा करें',
    confirmSubmit: 'समीक्षा करें और सबमिट करें',

    // Stats Screen
    communityFamilies: 'कुल परिवार',
    communityMembers: 'कुल सदस्य',
    genderRatio: 'लिंग वितरण',
    educationLevels: 'शिक्षा का स्तर',
    occupationDistribution: 'व्यवसाय वितरण',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',

    // Profile Screen
    accountSettings: 'खाता सेटिंग्स',
    changePassword: 'पासवर्ड बदलें',
    newPassword: 'नया पासवर्ड',
    confirmNewPassword: 'नए पासवर्ड की पुष्टि करें',
    updatePasswordBtn: 'पासवर्ड अपडेट करें',
    aboutApp: 'पोर्टल के बारे में',
    auditLogs: 'ऑडिट लॉग',
    date: 'तारीख',
    action: 'कार्रवाई',
    details: 'विवरण',
    user: 'उपयोगकर्ता',
  },
  gu: {
    // Navigation
    home: 'હોમ',
    family: 'પરિવાર',
    requests: 'વિનંતીઓ',
    stats: 'આંકડા',
    profile: 'પ્રોફાઇલ',
    logout: 'લૉગઆઉટ',
    language: 'ભાષા',
    role: 'ભૂમિકા',

    // Common Buttons / Actions
    edit: 'ફેરફાર કરો',
    delete: 'કાઢી નાખો',
    submit: 'સબમિટ કરો',
    cancel: 'રદ કરો',
    next: 'આગળ',
    back: 'પાછળ',
    save: 'સાચવો',
    verify: 'સત્યાપિત કરો',
    reject: 'અસ્વીકાર કરો',
    approve: 'મંજૂર કરો',
    requestCorrection: 'સુધારાની વિનંતી',
    close: 'બંધ કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    success: 'સફળતા',
    error: 'ભૂલ',
    viewDetails: 'વિગત જુઓ',

    // Statuses
    PENDING: 'બાકી',
    APPROVED: 'મંજૂર',
    REJECTED: 'અસ્વીકૃત',
    CORRECTION_REQUIRED: 'સુધારણા જરૂરી',

    // Splash / Welcome Screen
    samajTitle: 'શ્રી કચ્છ ગુર્જર ક્ષત્રિય સમાજ',
    portalVision: 'ડિજિટલ કૌટુંબિક રેકોર્ડ પોર્ટલ',
    enterPortal: 'પોર્ટલમાં પ્રવેશ કરો',
    footerCredits: 'વિકાસ અને જાળવણી પરમ ખોડિયાર દ્વારા | આવૃત્તિ ૧.૦',
    comingSoon: 'ટૂંક સમયમાં આવી રહ્યું છે',
    residentsPortalTitle: 'ભારતના રહેવાસીઓ',
    residentsPortalDesc: 'ભારતમાં રહેતા સમુદાયના સભ્યો માટે વસ્તી ગણતરી પોર્ટલ. સેટઅપ પ્રગતિમાં છે.',
    locked: 'વિકાસ હેઠળ છે',
    active: 'સક્રિય',
    nriPortalTitle: 'એનઆરઆઈ સભ્યો',
    nriPortalDesc: 'ભારતની બહાર રહેતા (બિન-રહેવાસી ભારતીય) સમુદાયના સભ્યો માટે વસ્તી ગણતરી પોર્ટલ.',

    // Login Screen
    loginTitle: 'પોર્ટલમાં સાઇન ઇન કરો',
    loginSubtitle: 'તમારા પારિવારિક રેકોર્ડ અને વસ્તી ગણતરી ડેટા મેનેજ કરો',
    mobileNumber: 'મોબાઇલ નંબર',
    password: 'પાસવર્ડ',
    loginBtn: 'સાઇન ઇન કરો',
    otpLoginBtn: 'ઓટીપી સાથે લોગિન કરો',
    pwdLoginBtn: 'પાસવર્ડ સાથે લોગિન કરો',
    sendOtp: 'ઓટીપી મોકલો',
    enterOtp: 'ઓટીપી કોડ દાખલ કરો',
    dontHaveAccount: 'ખાતું નથી?',
    registerNow: 'હમણાં નોંધણી કરો',

    // Register Screen
    registerTitle: 'કૌટુંબિક નોંધણી',
    registerSubtitle: 'હાલની સમાજ વસ્તી ગણતરી ડેટાબેઝ સામે નોંધણી કરો',
    familyId: 'ફેમિલી આઈડી (Family ID)',
    confirmPassword: 'પાસવર્ડની પુષ્ટિ કરો',
    registerBtn: 'નોંધણી કરો',
    alreadyHaveAccount: 'પહેલેથી જ એકાઉન્ટ છે?',
    signInNow: 'હમણાં સાઇન ઇન કરો',

    // Home / Dashboard
    welcome: 'સ્વાગત છે',
    familyOverview: 'કૌટુંબિક વિહંગાવલોકન',
    membersCount: 'સભ્યો',
    pendingReqCount: 'બાકી વિનંતીઓ',
    lastUpdated: 'છેલ્લે અપડેટ કરેલ',
    quickActions: 'ઝડપી પગલાં',
    updateDetails: 'વિગતો અપડેટ કરો',
    addMember: 'સભ્ય ઉમેરો',
    removeMember: 'સભ્ય દૂર કરો',
    transferMember: 'સભ્ય ટ્રાન્સફર કરો',
    otherCorrections: 'અન્ય સુધારાઓ',
    ghatakAdminPortal: 'ઘટક એડમિન પોર્ટલ',
    pradeshikAdminPortal: 'પ્રાદેશિક એડમિન પોર્ટલ',
    superAdminPortal: 'સુપર એડમિન પોર્ટલ',
    pendingVerificationQueue: 'બાકી વેરિફિકેશન કતાર',
    censusOverview: 'વસ્તી ગણતરી માહિતી',
    recentActivity: 'તાજેતરના ઓડિટ લોગ',

    // Family Details
    familyInfo: 'કૌટુંબિક માહિતી',
    headName: 'મોભીનું નામ',
    pradeshik: 'પ્રાદેશિક',
    ghatak: 'ઘટક',
    nativeVillage: 'વતન',
    address: 'હાલનું સરનામું',
    membersList: 'પરિવારના સભ્યો',
    relation: 'સંબંધ',
    age: 'ઉંમર',
    occupation: 'વ્યવસાય',
    education: 'અભ્યાસ',
    bloodGroup: 'બ્લડ ગ્રુપ',
    gender: 'લિંગ',
    maritalStatus: 'વૈવાહિક સ્થિતિ',
    aliveStatus: 'સ્થિતિ',
    alive: 'હયાત',
    deceased: 'સ્વર્ગસ્થ',
    photo: 'ફોટો',

    // Multi-Step Wizard
    wizardTitle: 'પારિવારિક રેકોર્ડ અપડેટ વિઝાર્ડ',
    step1: 'કૌટુંબિક માહિતી',
    step2: 'સભ્ય ઉમેરો',
    step3: 'સભ્ય દૂર કરો',
    step4: 'સભ્ય ટ્રાન્સફર કરો',
    step5: 'અન્ય સુધારાઓ',
    step6: 'ફોટા અને દસ્તાવેજો',
    step7: 'સમીક્ષા અને સબમિટ',
    reasonForRemoval: 'દૂર કરવાનું કારણ',
    targetFamilyId: 'ટાર્ગેટ ફેમિલી આઈડી',
    reasonForTransfer: 'ટ્રાન્સફર કરવાનું કારણ',
    describeCorrections: 'જરૂરી સુધારાઓ વિગતવાર સમજાવો',
    docName: 'દસ્તાવેજનું નામ (દા.ત. આધાર કાર્ડ, લગ્ન પ્રમાણપત્ર)',
    docUrl: 'દસ્તાવેજ ફાઇલ URL / લિંક',
    noChanges: 'આ તબક્કામાં કોઈ ફેરફાર કરેલ નથી.',
    addAnotherMember: 'બીજા સભ્ય ઉમેરો',
    reviewHeading: 'કૃપા કરીને સબમિટ કરતા પહેલા ફેરફારો તપાસો',
    confirmSubmit: 'સમીક્ષા કરો અને સબમિટ કરો',

    // Stats Screen
    communityFamilies: 'કુલ પરિવારો',
    communityMembers: 'કુલ સભ્યો',
    genderRatio: 'લિંગ પ્રમાણ',
    educationLevels: 'શિક્ષણનું સ્તર',
    occupationDistribution: 'વ્યવસાય વિતરણ',
    male: 'પુરુષ',
    female: 'સ્ત્રી',
    other: 'અન્ય',

    // Profile Screen
    accountSettings: 'એકાઉન્ટ સેટિંગ્સ',
    changePassword: 'પાસવર્ડ બદલો',
    newPassword: 'નવો પાસવર્ડ',
    confirmNewPassword: 'નવા પાસવર્ડની પુષ્ટિ કરો',
    updatePasswordBtn: 'પાસવર્ડ અપડેટ કરો',
    aboutApp: 'પોર્ટલ વિશે',
    auditLogs: 'ઓડિટ લોગ',
    date: 'તારીખ',
    action: 'પગલું',
    details: 'વિગતો',
    user: 'વપરાશકર્તા',
  },
};

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('samaj-lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'gu')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('samaj-lang', lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language] as Record<string, string>;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English if translation is missing
    const engDict = translations['en'] as Record<string, string>;
    return engDict[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
