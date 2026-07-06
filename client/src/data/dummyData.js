// ─── Dummy Contract Metadata ────────────────────────────────────────────────
export const dummyContract = {
  id: 'CTR-2024-0047',
  title: 'Acme Corp — Master Vendor Agreement',
  fileName: 'Acme_Corp_Vendor_Agreement_v3.pdf',
  fileSize: '284 KB',
  uploadedAt: '2024-06-12T09:14:00Z',
  contractType: 'Master Vendor Agreement',
  parties: ['GlobalTech Enterprises Ltd.', 'Acme Corp Solutions Inc.'],
  effectiveDate: '2024-07-01',
  expiryDate: '2026-06-30',
  contractValue: '$1,250,000',
  status: 'analysed',
};

// ─── Dummy Executive Summary ─────────────────────────────────────────────────
export const dummyExecutiveSummary = `This Master Vendor Agreement between GlobalTech Enterprises Ltd. and Acme Corp Solutions Inc. has been reviewed against the enterprise Standard Vendor Agreement template. The analysis identified 6 clause deviations, of which 2 are classified as High Risk and require immediate legal review prior to execution.

Key areas of concern include the limitation of liability cap, which is set significantly below the enterprise-mandated threshold, and an indemnification clause that omits standard mutual obligations. The intellectual property ownership provisions are acceptable with minor modifications recommended.

Payment terms (Net-45) deviate from the approved Net-30 standard and should be renegotiated. The governing law clause specifies Delaware jurisdiction, which aligns with enterprise policy. The termination-for-convenience clause requires a 60-day notice period versus the approved 30-day standard.

Overall Risk Score: 72 / 100 — HIGH RISK. Executive review and legal sign-off are strongly recommended before contract execution.`;

// ─── Dummy Risk Assessment ───────────────────────────────────────────────────
export const dummyRiskAssessment = {
  overallScore: 72,
  level: 'high',
  breakdown: [
    { category: 'Liability Exposure', score: 88, level: 'critical' },
    { category: 'Indemnification', score: 76, level: 'high' },
    { category: 'Payment Terms', score: 55, level: 'medium' },
    { category: 'IP Ownership', score: 40, level: 'medium' },
    { category: 'Termination Rights', score: 62, level: 'medium' },
    { category: 'Confidentiality', score: 18, level: 'low' },
    { category: 'Governing Law', score: 12, level: 'low' },
    { category: 'Data Privacy', score: 33, level: 'low' },
  ],
};

// ─── Dummy Clause Deviations ─────────────────────────────────────────────────
export const dummyDeviations = [
  {
    id: 1,
    clauseTitle: 'Limitation of Liability',
    section: 'Section 8.2',
    severity: 'critical',
    templateText:
      'The aggregate liability of either party under this Agreement shall not exceed the total fees paid or payable in the twelve (12) months immediately preceding the event giving rise to the claim.',
    contractText:
      'The aggregate liability of either party under this Agreement shall not exceed USD $50,000 regardless of the nature of the claim.',
    deviation:
      'Fixed cap of $50,000 replaces the rolling 12-month fee-based cap. At a contract value of $1.25M, this cap provides inadequate protection and is 96% below the enterprise standard.',
    recommendation:
      'Replace fixed cap with rolling 12-month fee-based calculation. Escalate to Legal for immediate review before execution.',
    impact: 'Financial exposure up to $1,200,000 beyond approved threshold.',
  },
  {
    id: 2,
    clauseTitle: 'Indemnification',
    section: 'Section 9.1',
    severity: 'high',
    templateText:
      'Each party shall indemnify, defend, and hold harmless the other party from and against any claims arising out of the indemnifying party\'s negligence, willful misconduct, or breach of this Agreement.',
    contractText:
      'Vendor shall indemnify GlobalTech Enterprises from any third-party claims arising from Vendor\'s provision of services under this Agreement.',
    deviation:
      'Indemnification is one-directional (Vendor → Client only). Mutual indemnification is missing. Standard template requires bilateral obligations.',
    recommendation:
      'Revise to include mutual indemnification language covering both parties. Insert standard enterprise mutual indemnification clause.',
    impact: 'GlobalTech has no indemnification obligation, creating asymmetric legal exposure.',
  },
  {
    id: 3,
    clauseTitle: 'Payment Terms',
    section: 'Section 4.3',
    severity: 'medium',
    templateText:
      'Payment shall be due within thirty (30) days of receipt of a valid invoice (Net-30).',
    contractText:
      'Payment shall be due within forty-five (45) days of receipt of a valid invoice (Net-45).',
    deviation:
      'Payment terms are Net-45 versus the enterprise-approved Net-30 standard. Extends payment cycle by 15 days.',
    recommendation:
      'Negotiate payment terms back to Net-30. If Net-45 is accepted, require written CFO approval as per Procurement Policy PP-2024-03.',
    impact: 'Cash flow impact estimated at $15,000–$20,000 per invoice cycle.',
  },
  {
    id: 4,
    clauseTitle: 'Intellectual Property Ownership',
    section: 'Section 11.1',
    severity: 'medium',
    templateText:
      'All work product, inventions, and deliverables created by Vendor specifically for Client under this Agreement shall be the exclusive property of Client upon full payment.',
    contractText:
      'Vendor retains ownership of all proprietary tools, methodologies, and background IP. Work product created exclusively for Client shall be assigned to Client upon receipt of full payment, excluding any Vendor background IP incorporated therein.',
    deviation:
      'Vendor has introduced background IP carve-out language not present in the standard template. Scope of "background IP" is undefined.',
    recommendation:
      'Define "background IP" with a precise list in Schedule A. Ensure carve-out does not cover deliverables essential to Client\'s operations.',
    impact: 'Risk of Vendor retaining rights to critical deliverable components.',
  },
  {
    id: 5,
    clauseTitle: 'Termination for Convenience',
    section: 'Section 14.2',
    severity: 'medium',
    templateText:
      'Either party may terminate this Agreement for convenience upon thirty (30) days written notice to the other party.',
    contractText:
      'Either party may terminate this Agreement for convenience upon sixty (60) days written notice to the other party.',
    deviation:
      'Notice period extended from 30 days to 60 days. Reduces enterprise flexibility to exit underperforming vendor relationships.',
    recommendation:
      'Negotiate back to 30-day notice period. If 60 days is accepted, add a performance-based termination right with a 10-day notice period.',
    impact: 'Extended vendor lock-in by 30 additional days per termination event.',
  },
  {
    id: 6,
    clauseTitle: 'Data Privacy and Security',
    section: 'Section 12.4',
    severity: 'low',
    templateText:
      'Vendor shall implement and maintain commercially reasonable technical and organizational security measures in accordance with ISO 27001 or equivalent standards.',
    contractText:
      'Vendor shall implement reasonable security measures to protect Client data from unauthorized access.',
    deviation:
      'Specific security standard reference (ISO 27001) has been removed. "Reasonable measures" is vague and may be insufficient for compliance.',
    recommendation:
      'Reinstate explicit ISO 27001 reference or acceptable equivalent (SOC 2 Type II). Align with enterprise Information Security Policy ISP-2024.',
    impact: 'Potential compliance gap with enterprise data security requirements.',
  },
];

// ─── Dummy Recommendations ───────────────────────────────────────────────────
export const dummyRecommendations = [
  {
    priority: 1,
    action: 'Escalate Limitation of Liability clause to General Counsel immediately.',
    owner: 'Legal Team',
    deadline: 'Before execution',
    status: 'urgent',
  },
  {
    priority: 2,
    action: 'Revise indemnification to include mutual obligations per enterprise standard.',
    owner: 'Legal Team',
    deadline: 'Before execution',
    status: 'urgent',
  },
  {
    priority: 3,
    action: 'Renegotiate payment terms from Net-45 to Net-30 or obtain CFO approval.',
    owner: 'Procurement',
    deadline: '5 business days',
    status: 'required',
  },
  {
    priority: 4,
    action: 'Define background IP scope in Schedule A and attach to agreement.',
    owner: 'Legal Team',
    deadline: '5 business days',
    status: 'required',
  },
  {
    priority: 5,
    action: 'Negotiate termination notice period from 60 days back to 30 days.',
    owner: 'Procurement',
    deadline: '10 business days',
    status: 'recommended',
  },
  {
    priority: 6,
    action: 'Reinstate ISO 27001 security standard reference in data privacy clause.',
    owner: 'IT / Security',
    deadline: '10 business days',
    status: 'recommended',
  },
];

// ─── Dummy Recent Contracts (for Home dashboard) ─────────────────────────────
export const dummyRecentContracts = [
  {
    id: 'CTR-2024-0047',
    title: 'Acme Corp — Master Vendor Agreement',
    type: 'Master Vendor Agreement',
    uploadedAt: '2024-06-12',
    riskLevel: 'high',
    riskScore: 72,
    status: 'analysed',
    deviations: 6,
  },
  {
    id: 'CTR-2024-0046',
    title: 'Nexus Logistics — Service Level Agreement',
    type: 'Service Level Agreement',
    uploadedAt: '2024-06-10',
    riskLevel: 'medium',
    riskScore: 44,
    status: 'analysed',
    deviations: 3,
  },
  {
    id: 'CTR-2024-0045',
    title: 'BrightPath IT — Software License Agreement',
    type: 'Software License Agreement',
    uploadedAt: '2024-06-08',
    riskLevel: 'low',
    riskScore: 21,
    status: 'analysed',
    deviations: 1,
  },
  {
    id: 'CTR-2024-0044',
    title: 'Meridian Consulting — Statement of Work',
    type: 'Statement of Work',
    uploadedAt: '2024-06-05',
    riskLevel: 'critical',
    riskScore: 88,
    status: 'flagged',
    deviations: 9,
  },
  {
    id: 'CTR-2024-0043',
    title: 'Skyline Properties — Office Lease Renewal',
    type: 'Lease Agreement',
    uploadedAt: '2024-06-03',
    riskLevel: 'low',
    riskScore: 15,
    status: 'analysed',
    deviations: 1,
  },
];

// ─── Dummy Dashboard Stats ───────────────────────────────────────────────────
export const dummyStats = {
  totalAnalysed: 47,
  highRiskContracts: 8,
  avgRiskScore: 41,
  deviationsDetected: 134,
  contractsThisMonth: 12,
  savedInNegotiation: '$2.4M',
};

// ─── Dummy Report History ────────────────────────────────────────────────────
export const dummyReports = [
  {
    id: 'RPT-2024-0047',
    contractId: 'CTR-2024-0047',
    contractTitle: 'Acme Corp — Master Vendor Agreement',
    generatedAt: '2024-06-12T11:30:00Z',
    riskLevel: 'high',
    riskScore: 72,
    deviations: 6,
    fileName: 'ContractIQ_Report_CTR-2024-0047.xlsx',
  },
  {
    id: 'RPT-2024-0046',
    contractId: 'CTR-2024-0046',
    contractTitle: 'Nexus Logistics — Service Level Agreement',
    generatedAt: '2024-06-10T14:22:00Z',
    riskLevel: 'medium',
    riskScore: 44,
    deviations: 3,
    fileName: 'ContractIQ_Report_CTR-2024-0046.xlsx',
  },
  {
    id: 'RPT-2024-0045',
    contractId: 'CTR-2024-0045',
    contractTitle: 'BrightPath IT — Software License Agreement',
    generatedAt: '2024-06-08T09:05:00Z',
    riskLevel: 'low',
    riskScore: 21,
    deviations: 1,
    fileName: 'ContractIQ_Report_CTR-2024-0045.xlsx',
  },
  {
    id: 'RPT-2024-0044',
    contractId: 'CTR-2024-0044',
    contractTitle: 'Meridian Consulting — Statement of Work',
    generatedAt: '2024-06-05T16:47:00Z',
    riskLevel: 'critical',
    riskScore: 88,
    deviations: 9,
    fileName: 'ContractIQ_Report_CTR-2024-0044.xlsx',
  },
];
