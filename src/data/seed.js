import { save, load } from './storage'
import { bsMonthKeyForAdDate, getCurrentFiscalYear } from './bsCalendar'

const SCHEMA_VERSION = 2

function daysAgoIso(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
}

function buildSeed() {
  const currentFy = getCurrentFiscalYear()
  const thisFyEnd = currentFy.endYear
  const nextFyEnd = currentFy.endYear + 1
  const lastFyEnd = currentFy.endYear - 1

  const members = [
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
      joinDate: daysAgoIso(950),
      paidThroughFiscalYear: nextFyEnd,
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
      joinDate: daysAgoIso(480),
      paidThroughFiscalYear: thisFyEnd,
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
      joinDate: daysAgoIso(1300),
      paidThroughFiscalYear: lastFyEnd,
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
      joinDate: daysAgoIso(280),
      paidThroughFiscalYear: nextFyEnd,
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
      joinDate: daysAgoIso(720),
      paidThroughFiscalYear: thisFyEnd,
      monthlyFee: 100,
      notes: '',
    },
  ]

  function feePayment(id, memberId, fiscalYear, date, extra = {}) {
    return {
      id,
      memberId,
      date,
      bsKey: bsMonthKeyForAdDate(date),
      fiscalYear,
      category: 'व्यवसाय दर्ता तथा नवीकरण',
      amount: 100,
      description: `सदस्यता नवीकरण शुल्क (आ.व. ${fiscalYear - 1}/${String(fiscalYear).slice(-2)})`,
      receivedFrom: members.find((m) => m.id === memberId)?.fullName || '',
      ...extra,
    }
  }

  const income = [
    feePayment('i1', 'm1', thisFyEnd, daysAgoIso(370)),
    feePayment('i2', 'm1', nextFyEnd, daysAgoIso(20)),
    feePayment('i3', 'm2', thisFyEnd, daysAgoIso(40)),
    feePayment('i4', 'm3', lastFyEnd, daysAgoIso(400)),
    feePayment('i5', 'm4', thisFyEnd, daysAgoIso(200)),
    feePayment('i6', 'm4', nextFyEnd, daysAgoIso(15)),
    feePayment('i7', 'm5', thisFyEnd, daysAgoIso(60)),
    {
      id: 'i8',
      memberId: null,
      date: daysAgoIso(50),
      bsKey: bsMonthKeyForAdDate(daysAgoIso(50)),
      fiscalYear: thisFyEnd,
      category: 'दान/सहयोग',
      amount: 25000,
      description: 'वार्षिक साधारण सभाको लागि सहयोग',
      receivedFrom: 'शुभेच्छुक',
    },
    {
      id: 'i9',
      memberId: null,
      date: daysAgoIso(30),
      bsKey: bsMonthKeyForAdDate(daysAgoIso(30)),
      fiscalYear: thisFyEnd,
      category: 'परिचयपत्र मुद्रण',
      amount: 3000,
      description: 'परिचयपत्र मुद्रण शुल्क',
      receivedFrom: 'विभिन्न सदस्यहरू',
    },
  ]

  const expenses = [
    {
      id: 'e1', date: daysAgoIso(48),
      bsKey: bsMonthKeyForAdDate(daysAgoIso(48)),
      category: 'कार्यक्रम खर्च', amount: 18000,
      description: 'प्रथम जिल्ला अधिवेशन, दोलखा', paidTo: 'कार्यक्रम व्यवस्थापन समिति',
    },
    {
      id: 'e2', date: daysAgoIso(22),
      bsKey: bsMonthKeyForAdDate(daysAgoIso(22)),
      category: 'भाडा/बिजुली/संचार', amount: 6500,
      description: 'कार्यालय भाडा र बिजुली महसुल', paidTo: 'भवन धनी',
    },
  ]

  const notifications = [
    { id: 'n1', date: daysAgoIso(29), title: 'दोस्रो वार्षिक साधारण सभा', message: 'सम्पूर्ण सदस्यहरूलाई दोस्रो वार्षिक साधारण सभामा उपस्थित हुन अनुरोध छ।', target: 'All' },
    { id: 'n2', date: daysAgoIso(20), title: 'सदस्यता नवीकरण सम्बन्धी सूचना', message: 'कृपया आफ्नो सदस्यता आषाढ़ मसान्तभित्र नवीकरण गर्नुहोस्।', target: 'All' },
  ]

  const opportunities = [
    { id: 'o1', title: 'साइनबोर्ड डिजाइनर आवश्यक', description: 'एक अनुभवी साइनबोर्ड डिजाइनर आवश्यक परेको छ।', location: 'काठमाडौं', deadline: daysAgoIso(-30), contact: '9801234567' },
    { id: 'o2', title: 'भित्तिचित्र कलाकार खोजिएको', description: 'सामुदायिक भवनको भित्तिचित्रको लागि कलाकार खोजिएको छ।', location: 'पोखरा, कास्की', deadline: daysAgoIso(-45), contact: '9807654321' },
  ]

  return { members, income, expenses, notifications, opportunities }
}

export function ensureSeeded() {
  if (load('schemaVersion', 0) === SCHEMA_VERSION) return
  const { members, income, expenses, notifications, opportunities } = buildSeed()
  save('members', members)
  save('income', income)
  save('expenses', expenses)
  save('notifications', notifications)
  save('opportunities', opportunities)
  save('schemaVersion', SCHEMA_VERSION)
}
