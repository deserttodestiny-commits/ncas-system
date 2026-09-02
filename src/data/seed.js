import { KEYS, save, load } from './storage'

const SAMPLE_MEMBERS = [
  {
    id: 'm1',
    membershipId: 'NCAS-2026-0001',
    fullName: 'यम चन्द्र सुब्बा',
    gender: 'पुरुष',
    dob: '1985-03-12',
    citizenshipNo: '12-01-70-00123',
    phone: '9800000001',
    email: 'yam.subba@example.com',
    district: 'काठमाडौं',
    municipality: 'काठमाडौं महानगरपालिका',
    wardNo: '10',
    artFields: ['होर्डिङ बोर्ड/ब्यानर', 'क्यालिग्राफी'],
    experienceYears: 15,
    employmentStatus: 'स्वरोजगार',
    organizationName: 'सुब्बा आर्ट स्टुडियो',
    membershipType: 'संस्थापक सदस्य',
    joinDate: '2023-01-15',
    paymentStatus: 'Paid',
    paymentExpiryDate: '2026-12-31',
    monthlyFee: 100,
    notes: '',
  },
  {
    id: 'm2',
    membershipId: 'NCAS-2026-0002',
    fullName: 'सीता गुरुङ',
    gender: 'महिला',
    dob: '1990-07-22',
    citizenshipNo: '30-01-71-00456',
    phone: '9800000002',
    email: 'sita.gurung@example.com',
    district: 'कास्की',
    municipality: 'पोखरा महानगरपालिका',
    wardNo: '5',
    artFields: ['डिजिटल डिजाइन/ग्राफिक्स', 'चित्रकला/पेन्टिङ'],
    experienceYears: 8,
    employmentStatus: 'फ्रिल्यान्सर',
    organizationName: '',
    membershipType: 'साधारण सदस्य',
    joinDate: '2024-05-10',
    paymentStatus: 'Pending',
    paymentExpiryDate: '2026-09-15',
    monthlyFee: 100,
    notes: '',
  },
  {
    id: 'm3',
    membershipId: 'NCAS-2026-0003',
    fullName: 'राम बहादुर थापा',
    gender: 'पुरुष',
    dob: '1978-11-02',
    citizenshipNo: '05-01-65-00789',
    phone: '9800000003',
    email: 'ram.thapa@example.com',
    district: 'दोलखा',
    municipality: 'चरिकोट नगरपालिका',
    wardNo: '2',
    artFields: ['साइनबोर्ड/नेमप्लेट', 'फ्लेक्स प्रिन्ट डिजाइन'],
    experienceYears: 20,
    employmentStatus: 'कार्यरत',
    organizationName: 'थापा साइन वर्क्स',
    membershipType: 'आजीवन सदस्य',
    joinDate: '2022-08-20',
    paymentStatus: 'Overdue',
    paymentExpiryDate: '2026-06-01',
    monthlyFee: 100,
    notes: '',
  },
  {
    id: 'm4',
    membershipId: 'NCAS-2026-0004',
    fullName: 'गीता श्रेष्ठ',
    gender: 'महिला',
    dob: '1995-02-18',
    citizenshipNo: '27-01-72-00234',
    phone: '9800000004',
    email: 'gita.shrestha@example.com',
    district: 'ललितपुर',
    municipality: 'ललितपुर महानगरपालिका',
    wardNo: '14',
    artFields: ['मूर्तिकला/थ्रीडी', 'चित्रकला/पेन्टिङ'],
    experienceYears: 6,
    employmentStatus: 'विद्यार्थी',
    organizationName: '',
    membershipType: 'साधारण सदस्य',
    joinDate: '2024-11-01',
    paymentStatus: 'Paid',
    paymentExpiryDate: '2027-01-31',
    monthlyFee: 100,
    notes: '',
  },
  {
    id: 'm5',
    membershipId: 'NCAS-2026-0005',
    fullName: 'हरि प्रसाद अधिकारी',
    gender: 'पुरुष',
    dob: '1988-09-30',
    citizenshipNo: '10-01-68-00567',
    phone: '9800000005',
    email: 'hari.adhikari@example.com',
    district: 'चितवन',
    municipality: 'भरतपुर महानगरपालिका',
    wardNo: '7',
    artFields: ['स्क्रिन प्रिन्टिङ', 'भिडियो/मल्टिमिडिया'],
    experienceYears: 10,
    employmentStatus: 'स्वरोजगार',
    organizationName: 'अधिकारी प्रिन्ट हाउस',
    membershipType: 'साधारण सदस्य',
    joinDate: '2023-06-05',
    paymentStatus: 'Pending',
    paymentExpiryDate: '2026-10-10',
    monthlyFee: 100,
    notes: '',
  },
]

const SAMPLE_INCOME = [
  { id: 'i1', date: '2026-06-05', category: 'व्यवसाय दर्ता तथा नवीकरण', amount: 5000, description: 'नयाँ सदस्यता दर्ता शुल्क', receivedFrom: 'सीता गुरुङ' },
  { id: 'i2', date: '2026-07-10', category: 'दान/सहयोग', amount: 25000, description: 'वार्षिक साधारण सभाको लागि सहयोग', receivedFrom: 'शुभेच्छुक' },
  { id: 'i3', date: '2026-08-01', category: 'परिचयपत्र मुद्रण', amount: 3000, description: 'परिचयपत्र मुद्रण शुल्क', receivedFrom: 'विभिन्न सदस्यहरू' },
]

const SAMPLE_EXPENSES = [
  { id: 'e1', date: '2026-07-12', category: 'कार्यक्रम खर्च', amount: 18000, description: 'प्रथम जिल्ला अधिवेशन, दोलखा', paidTo: 'कार्यक्रम व्यवस्थापन समिति' },
  { id: 'e2', date: '2026-08-08', category: 'भाडा/बिजुली/संचार', amount: 6500, description: 'कार्यालय भाडा र बिजुली महसुल', paidTo: 'भवन धनी' },
]

const SAMPLE_NOTIFICATIONS = [
  { id: 'n1', date: '2026-08-01', title: 'दोस्रो वार्षिक साधारण सभा', message: 'सम्पूर्ण सदस्यहरूलाई दोस्रो वार्षिक साधारण सभामा उपस्थित हुन अनुरोध छ।', target: 'All' },
  { id: 'n2', date: '2026-08-10', title: 'सदस्यता नवीकरण सम्बन्धी सूचना', message: 'कृपया आफ्नो सदस्यता नवीकरण समयमै गर्नुहोस्।', target: 'All' },
]

const SAMPLE_OPPORTUNITIES = [
  { id: 'o1', title: 'साइनबोर्ड डिजाइनर आवश्यक', description: 'एक अनुभवी साइनबोर्ड डिजाइनर आवश्यक परेको छ।', location: 'काठमाडौं', deadline: '2026-09-30', contact: '9801234567' },
  { id: 'o2', title: 'भित्तिचित्र कलाकार खोजिएको', description: 'सामुदायिक भवनको भित्तिचित्रको लागि कलाकार खोजिएको छ।', location: 'पोखरा, कास्की', deadline: '2026-10-15', contact: '9807654321' },
]

export function ensureSeeded() {
  if (load('seeded', false)) return
  save('members', SAMPLE_MEMBERS)
  save('income', SAMPLE_INCOME)
  save('expenses', SAMPLE_EXPENSES)
  save('notifications', SAMPLE_NOTIFICATIONS)
  save('opportunities', SAMPLE_OPPORTUNITIES)
  save('seeded', true)
}
