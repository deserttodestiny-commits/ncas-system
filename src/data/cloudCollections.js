import { supabase } from '../lib/supabase'

const TABLES = {
  members: 'ncas_system_members',
  income: 'ncas_system_income',
  expenses: 'ncas_system_expenses',
  notifications: 'ncas_system_member_notifications',
  opportunities: 'ncas_system_opportunities',
}

function memberFromRow(row) {
  return {
    id: row.id,
    membershipId: row.membership_id,
    fullName: row.full_name,
    gender: row.gender || '',
    dob: row.dob || '',
    citizenshipNo: row.citizenship_no || '',
    phone: row.phone,
    email: row.email || '',
    district: row.district || '',
    municipality: row.municipality || '',
    wardNo: row.ward_no || '',
    artFields: row.art_fields || [],
    experienceYears: row.experience_years ?? '',
    employmentStatus: row.employment_status || '',
    organizationName: row.organization_name || '',
    membershipType: row.membership_type || '',
    joinDate: row.join_date,
    paidThroughFiscalYear: row.paid_through_fiscal_year ?? '',
    monthlyFee: Number(row.monthly_fee) || 0,
    notes: row.notes || '',
    photo: row.photo_path || '',
  }
}

function memberToRow(item) {
  return {
    membership_id: item.membershipId,
    full_name: item.fullName,
    gender: item.gender || null,
    dob: item.dob || null,
    citizenship_no: item.citizenshipNo || null,
    phone: item.phone,
    email: item.email || null,
    district: item.district || null,
    municipality: item.municipality || null,
    ward_no: item.wardNo || null,
    art_fields: item.artFields || [],
    experience_years: item.experienceYears === '' ? null : Number(item.experienceYears),
    employment_status: item.employmentStatus || null,
    organization_name: item.organizationName || null,
    membership_type: item.membershipType || null,
    join_date: item.joinDate,
    paid_through_fiscal_year: item.paidThroughFiscalYear === '' ? null : Number(item.paidThroughFiscalYear),
    monthly_fee: Number(item.monthlyFee) || 0,
    notes: item.notes || null,
    photo_path: item.photo || null,
  }
}

export function fromRow(key, row) {
  if (key === 'members') return memberFromRow(row)
  if (key === 'income') return {
    id: row.id, date: row.date, category: row.category, amount: Number(row.amount),
    description: row.description || '', receivedFrom: row.received_from || '',
    memberId: row.member_id, fiscalYear: row.fiscal_year, bsKey: row.bs_key,
  }
  if (key === 'expenses') return {
    id: row.id, date: row.date, category: row.category, amount: Number(row.amount),
    description: row.description || '', paidTo: row.paid_to || '', bsKey: row.bs_key,
  }
  if (key === 'notifications') return {
    id: row.id, title: row.title, message: row.message,
    target: row.target_district || 'All', date: row.published_on,
  }
  return {
    id: row.id, title: row.title, description: row.description || '',
    location: row.location || '', deadline: row.deadline || '', contact: row.contact || '',
  }
}

export function toRow(key, item) {
  if (key === 'members') return memberToRow(item)
  if (key === 'income') return {
    date: item.date, category: item.category, amount: Number(item.amount),
    description: item.description || null, received_from: item.receivedFrom || null,
    member_id: item.memberId || null, fiscal_year: item.fiscalYear || null,
    bs_key: item.bsKey || null,
  }
  if (key === 'expenses') return {
    date: item.date, category: item.category, amount: Number(item.amount),
    description: item.description || null, paid_to: item.paidTo || null,
    bs_key: item.bsKey || null,
  }
  if (key === 'notifications') return {
    title: item.title, message: item.message,
    target_district: item.target === 'All' ? null : item.target,
    published_on: item.date || new Date().toISOString().slice(0, 10),
  }
  return {
    title: item.title, description: item.description || null,
    location: item.location || null, deadline: item.deadline || null,
    contact: item.contact || null,
  }
}

export async function listCloudItems(key) {
  const { data, error } = await supabase.from(TABLES[key]).select('*')
  if (error) throw error
  return data.map((row) => fromRow(key, row))
}

export async function addCloudItem(key, item) {
  const { data, error } = await supabase.from(TABLES[key]).insert(toRow(key, item)).select('*').single()
  if (error) throw error
  return fromRow(key, data)
}

export async function updateCloudItem(key, id, patch, current) {
  const payload = key === 'members' ? memberToRow({ ...current, ...patch }) : toRow(key, { ...current, ...patch })
  const { data, error } = await supabase.from(TABLES[key]).update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return fromRow(key, data)
}
