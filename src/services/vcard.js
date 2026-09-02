/**
 * vCard generator targeting iOS & Android compatibility (RFC 6350 / vCard 3.0).
 * Text values are escaped per spec: backslash, newline, semicolon, comma.
 */

function escapeText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function generateVCardString(member) {
  const nameParts = member.name ? member.name.trim().split(/\s+/) : ['Member'];
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstName = nameParts.join(' ');

  const org = [member.company, member.department].filter(Boolean).map(escapeText).join(';');
  const officeAddr = member.officeAddress || member.address || '';

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeText(lastName)};${escapeText(firstName)};;;`,
    `FN:${escapeText(member.name)}`,
    `ORG:${org}`,
    `TITLE:${escapeText(member.title || '')}`,
    `EMAIL;TYPE=WORK:${member.email || ''}`
  ];

  if (member.phone) {
    vcard.push(`TEL;TYPE=CELL:${member.phone.replace(/[^0-9+]/g, '')}`);
  }

  if (member.whatsapp) {
    vcard.push(`TEL;TYPE=WORK:${member.whatsapp.replace(/[^0-9+]/g, '')}`);
  }

  if (member.website) {
    vcard.push(`URL:${member.website}`);
  }

  if (officeAddr) {
    vcard.push(`ADR;TYPE=WORK:;;${escapeText(officeAddr)};;;;`);
  }

  if (member.bio) {
    vcard.push(`NOTE:${escapeText(member.bio)}`);
  }

  if (member.linkedin) {
    vcard.push(`X-SOCIALPROFILE;TYPE=linkedin:${member.linkedin}`);
  }

  if (member.instagram) {
    vcard.push(`X-SOCIALPROFILE;TYPE=instagram:${member.instagram}`);
  }

  if (member.youtube) {
    vcard.push(`X-SOCIALPROFILE;TYPE=youtube:${member.youtube}`);
  }

  vcard.push('END:VCARD');
  return vcard.join('\r\n');
}

/**
 * Trigger download of a .vcf file for saving to iOS or Android Contacts.
 */
export function downloadVCard(member) {
  const vcardContent = generateVCardString(member);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const fileName = `${member.name.trim().replace(/\s+/g, '_')}_Contact.vcf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
