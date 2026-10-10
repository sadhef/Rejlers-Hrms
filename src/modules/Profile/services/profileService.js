import axios, { API_ORIGIN } from '../../../config/axios.js';

/** Odoo many2one fields arrive as `{ name }`; selection fields as `{ label }`. Both flatten to a plain string. */
const rel = (value) => value?.name ?? value?.label ?? null;

/** Fetches the signed-in employee's full HR record and flattens Odoo's nested field groups into one object. */
export const getProfile = async () => {
  const data = await axios.get('/employee/profile');
  const e = data.employee || {};
  const contact = data.private_contact || {};
  const emergency = data.emergency_contact || {};
  const citizenship = data.citizenship || {};
  const family = data.family || {};
  const personal = data.personal_information || {};
  const visa = data.visa_work_permit || {};
  const location = data.location || {};
  const address = location.private_address || {};
  const education = data.education || {};

  return {
    id: e.id,
    name: e.name,
    employeeCode: e.employee_code,
    employeeType: rel(e.employee_type),
    jobTitle: e.job_title,
    workEmail: e.work_email,
    workPhone: e.work_phone,
    mobilePhone: e.mobile_phone,
    department: rel(e.department),
    manager: rel(e.manager),
    company: rel(e.company),
    workLocation: rel(e.work_location),
    // Odoo returns image_url as an already-absolute URL; prepending API_ORIGIN again produced
    // "https://host.comhttps://host.com/..." and a broken image.
    imageUrl: e.image_url ? (e.image_url.startsWith('http') ? e.image_url : `${API_ORIGIN}${e.image_url}`) : null,

    coach: rel(e.coach),

    personalEmail: contact.email,
    personalPhone: contact.phone,
    bankAccounts: (contact.bank_accounts || []).map((b) => ({
      id: b.id,
      bankName: b.bank_name,
      accNumber: b.acc_number,
      accNumberLast4: b.acc_number_last4,
      holderName: b.holder_name,
    })),

    emergencyContact: emergency.contact,
    emergencyPhone: emergency.phone,

    nationality: rel(citizenship.nationality_country),
    identificationNo: citizenship.identification_no,
    ssnNo: citizenship.ssn_no,
    passportNo: citizenship.passport_no,

    maritalStatus: rel(family.marital_status),
    spouseLegalName: family.spouse_legal_name,
    spouseBirthdate: family.spouse_birthdate,
    dependentChildren: family.dependent_children,

    legalName: personal.legal_name,
    birthday: personal.birthday,
    placeOfBirth: personal.place_of_birth,
    countryOfBirth: rel(personal.country_of_birth),
    gender: rel(personal.gender),

    visaNo: visa.visa_no,
    visaExpirationDate: visa.visa_expiration_date,
    workPermitNo: visa.work_permit_no,
    workPermitExpirationDate: visa.work_permit_expiration_date,
    workPermitDocumentUploaded: visa.work_permit_document_uploaded,
    workPermitDocumentName: visa.work_permit_document_name,

    address: [address.street, address.street2, address.city, rel(address.country)].filter(Boolean).join(', '),
    homeWorkDistance: location.home_work_distance,
    homeWorkDistanceUnit: rel(location.home_work_distance_unit),

    certificateLevel: rel(education.certificate_level),
    fieldOfStudy: education.field_of_study,
    school: education.school,
  };
};
