import { useCurrentMember } from '../../data/useCurrentMember'

export default function IdCard() {
  const { member } = useCurrentMember()
  if (!member) return null

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold text-ncas-dark no-print">परिचयपत्र</h1>

      <div className="rounded-2xl shadow-lg overflow-hidden border border-gray-200 bg-white">
        <div className="bg-ncas-dark text-white px-5 py-4 text-center">
          <div className="text-xs tracking-wide text-blue-200">नेपाल कमर्शियल आर्टिष्ट संघ</div>
          <div className="font-bold text-lg">NCAS</div>
        </div>

        <div className="p-5 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-ncas-gold flex items-center justify-center text-3xl text-gray-400 mb-3">
            👤
          </div>
          <div className="text-lg font-bold text-gray-900">{member.fullName}</div>
          <div className="text-sm font-mono text-ncas-blue mt-1">{member.membershipId}</div>

          <div className="w-full mt-4 grid grid-cols-2 gap-y-2 text-left text-xs">
            <div className="text-gray-400">सदस्यता प्रकार</div>
            <div className="text-gray-800 font-medium text-right">{member.membershipType}</div>
            <div className="text-gray-400">जिल्ला</div>
            <div className="text-gray-800 font-medium text-right">{member.district}</div>
            <div className="text-gray-400">कला क्षेत्र</div>
            <div className="text-gray-800 font-medium text-right">{member.artFields?.join(', ') || '-'}</div>
            <div className="text-gray-400">सामेल मिति</div>
            <div className="text-gray-800 font-medium text-right">{member.joinDate}</div>
            <div className="text-gray-400">म्याद सकिने</div>
            <div className="text-gray-800 font-medium text-right">{member.paymentExpiryDate}</div>
          </div>

          <div className="w-20 h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[10px] text-gray-400 mt-4">
            QR Code
          </div>
          <div className="text-xs text-gray-400 mt-3">www.ncas.org.np</div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="no-print px-5 py-2.5 rounded-lg bg-ncas-dark text-white font-medium hover:opacity-90"
      >
        🖨️ Print / Download
      </button>
    </div>
  )
}
