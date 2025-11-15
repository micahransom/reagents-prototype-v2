// Centralized item database for the prototype

export type ItemCategory = 
  | "buffer" 
  | "enzyme" 
  | "oligonucleotide" 
  | "preservatives" 
  | "primer-probe-pair" 
  | "protocol" 
  | "salt" 
  | "stabilizers" 
  | "target" 
  | "thermocycler";

export interface BaseItem {
  id: string;
  name: string;
  lastEdited: string;
}

export interface Buffer extends BaseItem {
  concentration: string;
  ph: string;
  storage: string;
}

export interface Enzyme extends BaseItem {
  activity: string;
  storage: string;
  supplier: string;
}

export interface Oligonucleotide extends BaseItem {
  type: string;
  sequence: string;
  tm: string;
  length: string;
}

export interface Preservative extends BaseItem {
  concentration: string;
  purpose: string;
  storage: string;
}

export interface PrimerProbePair extends BaseItem {
  primer1: string;
  primer2: string;
  probe: string;
}

export interface Protocol extends BaseItem {
  type: string;
  duration: string;
  temperature: string;
}

export interface Salt extends BaseItem {
  concentration: string;
  formula: string;
  mw: string;
}

export interface Stabilizer extends BaseItem {
  concentration: string;
  purpose: string;
  storage: string;
}

export interface Target extends BaseItem {
  type: string;
  gene: string;
  organism: string;
}

export interface Thermocycler extends BaseItem {
  serial: string;
  location: string;
  status: string;
}

// ============================================================================
// BUFFER DATA
// ============================================================================
export const buffers: Buffer[] = [
  { id: "1", name: "Tris-HCl pH 8.0", concentration: "100 mM", ph: "8.0", storage: "Room Temperature", lastEdited: "August 29, 2025" },
  { id: "2", name: "PBS pH 7.4", concentration: "1X", ph: "7.4", storage: "4°C", lastEdited: "August 28, 2025" },
  { id: "3", name: "TE Buffer", concentration: "10 mM Tris, 1 mM EDTA", ph: "8.0", storage: "Room Temperature", lastEdited: "August 27, 2025" },
  { id: "4", name: "TAE Buffer", concentration: "50X Stock", ph: "8.3", storage: "Room Temperature", lastEdited: "August 26, 2025" },
  { id: "5", name: "TBE Buffer", concentration: "10X Stock", ph: "8.3", storage: "Room Temperature", lastEdited: "August 25, 2025" },
  { id: "6", name: "Lysis Buffer", concentration: "1X", ph: "8.0", storage: "4°C", lastEdited: "August 24, 2025" },
  { id: "7", name: "Wash Buffer", concentration: "1X", ph: "7.5", storage: "4°C", lastEdited: "August 23, 2025" },
  { id: "8", name: "Elution Buffer", concentration: "1X", ph: "8.5", storage: "Room Temperature", lastEdited: "August 22, 2025" },
];

// ============================================================================
// ENZYME DATA
// ============================================================================
export const enzymes: Enzyme[] = [
  { id: "1", name: "Taq DNA Polymerase", activity: "5 U/μL", storage: "-20°C", supplier: "NEB", lastEdited: "August 29, 2025" },
  { id: "2", name: "Q5 High-Fidelity DNA Polymerase", activity: "2 U/μL", storage: "-20°C", supplier: "NEB", lastEdited: "August 28, 2025" },
  { id: "3", name: "Phusion DNA Polymerase", activity: "2 U/μL", storage: "-20°C", supplier: "Thermo Fisher", lastEdited: "August 27, 2025" },
  { id: "4", name: "M-MLV Reverse Transcriptase", activity: "200 U/μL", storage: "-20°C", supplier: "Promega", lastEdited: "August 26, 2025" },
  { id: "5", name: "SuperScript III Reverse Transcriptase", activity: "200 U/μL", storage: "-20°C", supplier: "Invitrogen", lastEdited: "August 25, 2025" },
  { id: "6", name: "RNase H", activity: "5 U/μL", storage: "-20°C", supplier: "NEB", lastEdited: "August 24, 2025" },
  { id: "7", name: "DNase I", activity: "10 U/μL", storage: "-20°C", supplier: "Thermo Fisher", lastEdited: "August 23, 2025" },
  { id: "8", name: "Proteinase K", activity: "20 mg/mL", storage: "-20°C", supplier: "Qiagen", lastEdited: "August 22, 2025" },
  { id: "9", name: "Bst DNA Polymerase", activity: "8 U/μL", storage: "-20°C", supplier: "NEB", lastEdited: "August 21, 2025" },
  { id: "10", name: "T4 DNA Ligase", activity: "400 U/μL", storage: "-20°C", supplier: "NEB", lastEdited: "August 20, 2025" },
];

// ============================================================================
// OLIGONUCLEOTIDE DATA
// ============================================================================
export const oligonucleotides: Oligonucleotide[] = [
  { id: "1", name: "TV_F1", type: "Forward Primer", sequence: "AGCTGACCTGAAGGCT", tm: "58°C", length: "16 nt", lastEdited: "August 29, 2025" },
  { id: "2", name: "TV_R1", type: "Reverse Primer", sequence: "TTGCCTAGGCTAACGG", tm: "57°C", length: "16 nt", lastEdited: "August 28, 2025" },
  { id: "3", name: "TV_P1", type: "Probe", sequence: "FAM-AGCCTTGAC-BHQ1", tm: "62°C", length: "9 nt", lastEdited: "August 27, 2025" },
  { id: "4", name: "RSV_F", type: "Forward Primer", sequence: "ATGCTACCTTCAAGCTG", tm: "56°C", length: "17 nt", lastEdited: "August 26, 2025" },
  { id: "5", name: "RSV_R", type: "Reverse Primer", sequence: "CTAAGGCTTATCCGAA", tm: "55°C", length: "16 nt", lastEdited: "August 25, 2025" },
  { id: "6", name: "FluA_F", type: "Forward Primer", sequence: "GACCRATCCTGTCACCTCTGA", tm: "60°C", length: "21 nt", lastEdited: "August 24, 2025" },
  { id: "7", name: "FluA_R", type: "Reverse Primer", sequence: "AGGGCATTYTGGACAAAKCGTCTA", tm: "59°C", length: "24 nt", lastEdited: "August 23, 2025" },
  { id: "8", name: "FluA_P", type: "Probe", sequence: "FAM-TGCAGTCCTCGCTCACTGGGCACG-BHQ1", tm: "68°C", length: "24 nt", lastEdited: "August 22, 2025" },
  { id: "9", name: "FluB_F", type: "Forward Primer", sequence: "AAATACGGTGGATTAAATAAAAGCAA", tm: "57°C", length: "26 nt", lastEdited: "August 21, 2025" },
  { id: "10", name: "FluB_R", type: "Reverse Primer", sequence: "CCAGCAATAGCTCCGAAGAAA", tm: "58°C", length: "21 nt", lastEdited: "August 20, 2025" },
  { id: "11", name: "TV_F2", type: "Forward Primer", sequence: "GCTTGACCTGAAGGCT", tm: "59°C", length: "16 nt", lastEdited: "August 19, 2025" },
  { id: "12", name: "TV_R2", type: "Reverse Primer", sequence: "ATGCCTAGGCTAACGG", tm: "58°C", length: "16 nt", lastEdited: "August 18, 2025" },
  { id: "13", name: "TV_P2", type: "Probe", sequence: "FAM-TGCCTTGAC-BHQ1", tm: "63°C", length: "9 nt", lastEdited: "August 17, 2025" },
  { id: "14", name: "TV_F3", type: "Forward Primer", sequence: "AGCTCACCTGAAGGCT", tm: "57°C", length: "16 nt", lastEdited: "August 16, 2025" },
  { id: "15", name: "TV_R3", type: "Reverse Primer", sequence: "TTGCGTAGGCTAACGG", tm: "56°C", length: "16 nt", lastEdited: "August 15, 2025" },
  { id: "16", name: "TV_P3", type: "Probe", sequence: "FAM-AGCGTTGAC-BHQ1", tm: "61°C", length: "9 nt", lastEdited: "August 14, 2025" },
  { id: "17", name: "StrepA_F", type: "Forward Primer", sequence: "TTCTTAGAGTTGGACGACGG", tm: "59°C", length: "20 nt", lastEdited: "August 13, 2025" },
  { id: "18", name: "StrepA_R", type: "Reverse Primer", sequence: "GCTTAGGGTTGCCTTGTG", tm: "58°C", length: "18 nt", lastEdited: "August 12, 2025" },
  { id: "19", name: "StrepA_P", type: "Probe", sequence: "FAM-CGACGGTTGACT-BHQ1", tm: "64°C", length: "12 nt", lastEdited: "August 11, 2025" },
  { id: "20", name: "CoV2_F", type: "Forward Primer", sequence: "GACCCCAAAATCAGCGAAAT", tm: "58°C", length: "20 nt", lastEdited: "August 10, 2025" },
  { id: "21", name: "CoV2_R", type: "Reverse Primer", sequence: "TCTGGTTACTGCCAGTTGAATCTG", tm: "60°C", length: "24 nt", lastEdited: "August 9, 2025" },
  { id: "22", name: "CoV2_P", type: "Probe", sequence: "FAM-ACCCCGCATTACGTTTGGTGGACC-BHQ1", tm: "69°C", length: "24 nt", lastEdited: "August 8, 2025" },
  { id: "23", name: "RNaseP_F", type: "Forward Primer", sequence: "AGATTTGGACCTGCGAGCG", tm: "61°C", length: "19 nt", lastEdited: "August 7, 2025" },
  { id: "24", name: "RNaseP_R", type: "Reverse Primer", sequence: "GAGCGGCTGTCTCCACAAGT", tm: "62°C", length: "20 nt", lastEdited: "August 6, 2025" },
  { id: "25", name: "RNaseP_P", type: "Probe", sequence: "FAM-TTCTGACCTGAAGGCTCTGCGCG-BHQ1", tm: "70°C", length: "23 nt", lastEdited: "August 5, 2025" },
  { id: "26", name: "TV_F4", type: "Forward Primer", sequence: "AGCTGACCTCAAGGCT", tm: "58°C", length: "16 nt", lastEdited: "August 4, 2025" },
  { id: "27", name: "TV_R4", type: "Reverse Primer", sequence: "TTGCCGAGGCTAACGG", tm: "57°C", length: "16 nt", lastEdited: "August 3, 2025" },
  { id: "28", name: "TV_P4", type: "Probe", sequence: "FAM-AGCCGTGAC-BHQ1", tm: "62°C", length: "9 nt", lastEdited: "August 2, 2025" },
  { id: "29", name: "TV_F5", type: "Forward Primer", sequence: "AGCTGACGTGAAGGCT", tm: "59°C", length: "16 nt", lastEdited: "August 1, 2025" },
  { id: "30", name: "TV_R5", type: "Reverse Primer", sequence: "TTGCCCAGGCTAACGG", tm: "58°C", length: "16 nt", lastEdited: "July 31, 2025" },
  { id: "31", name: "TV_P5", type: "Probe", sequence: "FAM-AGCCATGAC-BHQ1", tm: "63°C", length: "9 nt", lastEdited: "July 30, 2025" },
  { id: "32", name: "TV_F6", type: "Forward Primer", sequence: "TGCTGACCTGAAGGCT", tm: "57°C", length: "16 nt", lastEdited: "July 29, 2025" },
  { id: "33", name: "TV_R6", type: "Reverse Primer", sequence: "ATGCCTAGGCTAACGG", tm: "56°C", length: "16 nt", lastEdited: "July 28, 2025" },
];

// ============================================================================
// PRESERVATIVE DATA
// ============================================================================
export const preservatives: Preservative[] = [
  { id: "1", name: "Proclin 950", concentration: "0.02%", purpose: "Antimicrobial", storage: "Room Temperature", lastEdited: "August 29, 2025" },
  { id: "2", name: "Sodium Azide", concentration: "0.1%", purpose: "Bacteriostatic", storage: "Room Temperature", lastEdited: "August 28, 2025" },
  { id: "3", name: "EDTA", concentration: "1 mM", purpose: "Chelating agent", storage: "Room Temperature", lastEdited: "August 27, 2025" },
  { id: "4", name: "Kathon CG", concentration: "0.015%", purpose: "Antimicrobial", storage: "Room Temperature", lastEdited: "August 26, 2025" },
  { id: "5", name: "Bronopol", concentration: "0.05%", purpose: "Antimicrobial", storage: "4°C", lastEdited: "August 25, 2025" },
  { id: "6", name: "Thimerosal", concentration: "0.01%", purpose: "Antifungal/Antibacterial", storage: "Room Temperature", lastEdited: "August 24, 2025" },
];

// ============================================================================
// PRIMER PROBE PAIR DATA
// ============================================================================
export const primerProbePairs: PrimerProbePair[] = [
  { id: "1", name: "Primer Probe Pair 1", primer1: "TV_F1", primer2: "TV_R1", probe: "TV_P1", lastEdited: "August 29, 2025" },
  { id: "2", name: "Primer Probe Pair 2", primer1: "TV_F2", primer2: "TV_R2", probe: "TV_P2", lastEdited: "August 29, 2025" },
  { id: "3", name: "Primer Probe Pair 3", primer1: "TV_F3", primer2: "TV_R3", probe: "TV_P3", lastEdited: "August 29, 2025" },
  { id: "4", name: "Primer Probe Pair 4", primer1: "TV_F4", primer2: "TV_R4", probe: "TV_P4", lastEdited: "August 29, 2025" },
  { id: "5", name: "Primer Probe Pair 5", primer1: "TV_F5", primer2: "TV_R5", probe: "TV_P5", lastEdited: "August 29, 2025" },
  { id: "6", name: "Primer Probe Pair 6", primer1: "TV_F6", primer2: "TV_R6", probe: "TV_P6", lastEdited: "August 29, 2025" },
  { id: "7", name: "Primer Probe Pair 7", primer1: "TV_F7", primer2: "TV_R7", probe: "TV_P7", lastEdited: "August 29, 2025" },
  { id: "8", name: "Primer Probe Pair 8", primer1: "TV_F8", primer2: "TV_R8", probe: "TV_P8", lastEdited: "August 29, 2025" },
  { id: "9", name: "Primer Probe Pair 9", primer1: "TV_F9", primer2: "TV_R9", probe: "TV_P9", lastEdited: "August 29, 2025" },
  { id: "10", name: "Primer Probe Pair 10", primer1: "TV_F10", primer2: "TV_R10", probe: "TV_P10", lastEdited: "August 29, 2025" },
];

// ============================================================================
// PROTOCOL DATA
// ============================================================================
export const protocols: Protocol[] = [
  { id: "1", name: "Standard RT-PCR", type: "RNA Extraction", duration: "30 min", temperature: "Room Temp", lastEdited: "August 29, 2025" },
  { id: "2", name: "DNA Extraction (Swab)", type: "DNA Extraction", duration: "20 min", temperature: "Room Temp", lastEdited: "August 28, 2025" },
  { id: "3", name: "One-Step RT-qPCR", type: "Amplification", duration: "90 min", temperature: "50°C/95°C Cycling", lastEdited: "August 27, 2025" },
  { id: "4", name: "Two-Step RT-qPCR", type: "Amplification", duration: "120 min", temperature: "42°C/95°C Cycling", lastEdited: "August 26, 2025" },
  { id: "5", name: "Viral RNA Extraction", type: "RNA Extraction", duration: "25 min", temperature: "Room Temp", lastEdited: "August 25, 2025" },
  { id: "6", name: "LAMP Assay", type: "Amplification", duration: "60 min", temperature: "65°C Isothermal", lastEdited: "August 24, 2025" },
  { id: "7", name: "Multiplex PCR", type: "Amplification", duration: "90 min", temperature: "60°C/95°C Cycling", lastEdited: "August 23, 2025" },
  { id: "8", name: "Sample Lysis", type: "Sample Prep", duration: "10 min", temperature: "56°C", lastEdited: "August 22, 2025" },
];

// ============================================================================
// SALT DATA
// ============================================================================
export const salts: Salt[] = [
  { id: "1", name: "MgCl2", concentration: "25 mM", formula: "MgCl₂", mw: "95.21 g/mol", lastEdited: "August 29, 2025" },
  { id: "2", name: "KCl", concentration: "50 mM", formula: "KCl", mw: "74.55 g/mol", lastEdited: "August 28, 2025" },
  { id: "3", name: "NaCl", concentration: "150 mM", formula: "NaCl", mw: "58.44 g/mol", lastEdited: "August 27, 2025" },
  { id: "4", name: "MgSO4", concentration: "10 mM", formula: "MgSO₄", mw: "120.37 g/mol", lastEdited: "August 26, 2025" },
  { id: "5", name: "CaCl2", concentration: "2 mM", formula: "CaCl₂", mw: "110.98 g/mol", lastEdited: "August 25, 2025" },
  { id: "6", name: "NH4Cl", concentration: "10 mM", formula: "NH₄Cl", mw: "53.49 g/mol", lastEdited: "August 24, 2025" },
  { id: "7", name: "(NH4)2SO4", concentration: "20 mM", formula: "(NH₄)₂SO₄", mw: "132.14 g/mol", lastEdited: "August 23, 2025" },
  { id: "8", name: "K2SO4", concentration: "15 mM", formula: "K₂SO₄", mw: "174.26 g/mol", lastEdited: "August 22, 2025" },
];

// ============================================================================
// STABILIZER DATA
// ============================================================================
export const stabilizers: Stabilizer[] = [
  { id: "1", name: "BSA (Bovine Serum Albumin)", concentration: "0.1 mg/mL", purpose: "Protein stabilizer", storage: "-20°C", lastEdited: "August 29, 2025" },
  { id: "2", name: "Glycerol", concentration: "50%", purpose: "Cryoprotectant", storage: "Room Temperature", lastEdited: "August 28, 2025" },
  { id: "3", name: "Trehalose", concentration: "5%", purpose: "Lyoprotectant", storage: "Room Temperature", lastEdited: "August 27, 2025" },
  { id: "4", name: "Dextran", concentration: "2%", purpose: "Viscosity enhancer", storage: "Room Temperature", lastEdited: "August 26, 2025" },
  { id: "5", name: "PEG 8000", concentration: "10%", purpose: "Protein precipitant", storage: "Room Temperature", lastEdited: "August 25, 2025" },
  { id: "6", name: "Sucrose", concentration: "0.5 M", purpose: "Cryoprotectant", storage: "Room Temperature", lastEdited: "August 24, 2025" },
  { id: "7", name: "Tween-20", concentration: "0.05%", purpose: "Surfactant", storage: "4°C", lastEdited: "August 23, 2025" },
  { id: "8", name: "DTT (Dithiothreitol)", concentration: "1 mM", purpose: "Reducing agent", storage: "-20°C", lastEdited: "August 22, 2025" },
  { id: "9", name: "Brij-58", concentration: "0.05%", purpose: "Surfactant", storage: "Room Temperature", lastEdited: "August 21, 2025" },
];

// ============================================================================
// TARGET DATA
// ============================================================================
export const targets: Target[] = [
  { id: "1", name: "Influenza A H1N1", type: "Viral RNA", gene: "M gene", organism: "Influenza A virus", lastEdited: "August 29, 2025" },
  { id: "2", name: "Influenza A H3N2", type: "Viral RNA", gene: "M gene", organism: "Influenza A virus", lastEdited: "August 28, 2025" },
  { id: "3", name: "Influenza B", type: "Viral RNA", gene: "M gene", organism: "Influenza B virus", lastEdited: "August 27, 2025" },
  { id: "4", name: "RSV A", type: "Viral RNA", gene: "N gene", organism: "Respiratory syncytial virus A", lastEdited: "August 26, 2025" },
  { id: "5", name: "RSV B", type: "Viral RNA", gene: "N gene", organism: "Respiratory syncytial virus B", lastEdited: "August 25, 2025" },
  { id: "6", name: "Strep A", type: "Bacterial DNA", gene: "speB gene", organism: "Streptococcus pyogenes", lastEdited: "August 24, 2025" },
  { id: "7", name: "SARS-CoV-2", type: "Viral RNA", gene: "N gene", organism: "SARS-CoV-2", lastEdited: "August 23, 2025" },
  { id: "8", name: "E. coli", type: "Bacterial DNA", gene: "16S rRNA", organism: "Escherichia coli", lastEdited: "August 22, 2025" },
  { id: "9", name: "Staph aureus", type: "Bacterial DNA", gene: "nuc gene", organism: "Staphylococcus aureus", lastEdited: "August 21, 2025" },
  { id: "10", name: "Human RNase P", type: "Control", gene: "RPPH1", organism: "Homo sapiens", lastEdited: "August 20, 2025" },
];

// ============================================================================
// THERMOCYCLER DATA
// ============================================================================
export const thermocyclers: Thermocycler[] = [
  { id: "1", name: "Oscar", serial: "15894", location: "Lab A", status: "Active", lastEdited: "August 29, 2025" },
  { id: "2", name: "Oscar", serial: "15896", location: "Lab A", status: "Active", lastEdited: "August 28, 2025" },
  { id: "3", name: "Oscar", serial: "15892", location: "Lab B", status: "Active", lastEdited: "August 27, 2025" },
  { id: "4", name: "Oscar", serial: "15891", location: "Lab B", status: "Active", lastEdited: "August 26, 2025" },
  { id: "5", name: "Oscar", serial: "15898", location: "Lab C", status: "Active", lastEdited: "August 25, 2025" },
  { id: "6", name: "Bio-Rad CFX96", serial: "BR-001", location: "Lab D", status: "Active", lastEdited: "August 24, 2025" },
  { id: "7", name: "Applied Biosystems QuantStudio 3", serial: "AB-QS3-01", location: "Lab E", status: "Maintenance", lastEdited: "August 23, 2025" },
  { id: "8", name: "Roche LightCycler 480", serial: "LC480-05", location: "Lab F", status: "Active", lastEdited: "August 22, 2025" },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert name to URL-safe slug
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get all items by category
 */
export function getItemsByCategory(category: ItemCategory) {
  switch (category) {
    case "buffer":
      return buffers;
    case "enzyme":
      return enzymes;
    case "oligonucleotide":
      return oligonucleotides;
    case "preservatives":
      return preservatives;
    case "primer-probe-pair":
      return primerProbePairs;
    case "protocol":
      return protocols;
    case "salt":
      return salts;
    case "stabilizers":
      return stabilizers;
    case "target":
      return targets;
    case "thermocycler":
      return thermocyclers;
    default:
      return [];
  }
}

/**
 * Get item by category and ID
 */
export function getItemById(category: ItemCategory, id: string) {
  const items = getItemsByCategory(category);
  return items.find((item) => item.id === id);
}

/**
 * Get item by category and name slug
 */
export function getItemBySlug(category: ItemCategory, slug: string) {
  const items = getItemsByCategory(category);
  
  // Special handling for thermocyclers (includes serial in slug)
  if (category === "thermocycler") {
    return thermocyclers.find((item) => {
      const itemSlug = `${nameToSlug(item.name)}-${item.serial.toLowerCase()}`;
      return itemSlug === slug;
    });
  }
  
  return items.find((item) => nameToSlug(item.name) === slug);
}

/**
 * Get item names for dropdown options
 */
export function getItemNames(category: ItemCategory): string[] {
  const items = getItemsByCategory(category);
  return items.map((item) => item.name);
}

/**
 * Get item options for dropdown (id + name pairs)
 */
export function getItemOptions(category: ItemCategory): Array<{ id: string; name: string }> {
  const items = getItemsByCategory(category);
  return items.map((item) => ({ id: item.id, name: item.name }));
}

/**
 * Search items by name across category
 */
export function searchItems(category: ItemCategory, searchTerm: string) {
  const items = getItemsByCategory(category);
  const lowerSearch = searchTerm.toLowerCase();
  return items.filter((item) => 
    item.name.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Get all oligonucleotides by type (for specific filtering)
 */
export function getOligonucleotidesByType(type: "Forward Primer" | "Reverse Primer" | "Probe") {
  return oligonucleotides.filter((oligo) => oligo.type === type);
}

/**
 * Get all thermocyclers by status
 */
export function getThermocyclersByStatus(status: "Active" | "Maintenance") {
  return thermocyclers.filter((tc) => tc.status === status);
}

