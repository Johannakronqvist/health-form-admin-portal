import type {
  BankQuestion,
  Company,
  CompanyFormLink,
  FormRecord,
  FormType,
  QuestionArea,
  StaffUser,
} from '../types.js';

export const currentUser: StaffUser = {
  id: 'staff-1',
  name: 'Eva Holm',
  title: 'Företagssköterska',
};

export const companies: Company[] = [
  { id: 'org-1', name: 'Nordbygg AB', orgNumber: '556123-4567', industry: 'Bygg', employeeCount: 240 },
  { id: 'org-2', name: 'Kodkraft Consulting AB', orgNumber: '559876-5432', industry: 'IT', employeeCount: 85 },
  { id: 'org-3', name: 'Västkustens Åkeri AB', orgNumber: '556555-1212', industry: 'Transport', employeeCount: 130 },
  { id: 'org-4', name: 'Lindqvist Omsorg AB', orgNumber: '556777-8899', industry: 'Vård och omsorg', employeeCount: 310 },
  { id: 'org-5', name: 'Saltsjö Bageri AB', orgNumber: '556888-3344', industry: 'Livsmedel', employeeCount: 45 },
];

export const questionAreas: QuestionArea[] = [
  { id: 'general-health', label: 'Allmän hälsa' },
  { id: 'medication', label: 'Läkemedel' },
  { id: 'lifestyle', label: 'Livsstil' },
  { id: 'physical-work-environment', label: 'Fysisk arbetsmiljö' },
  { id: 'psychosocial-work-environment', label: 'Psykosocial arbetsmiljö' },
];

type SeedQuestion = Omit<BankQuestion, 'updatedAt'>;

/** When the standard questions were last changed. */
const BANK_UPDATED_AT = '2026-09-12T09:00:00.000Z';

/** "När ska frågan användas?" for each standard question, shown in the question details. */
const guidance: Record<string, { text: string; tip?: string }> = {
  'q-general-health': {
    text: 'Passar alla formulär som en första, öppen bild av hur medarbetaren mår. Ett lågt svar är en signal att ta upp i samtalet.',
  },
  'q-work-ability': {
    text: 'Använd frågan när arbetsförmågan är i fokus, till exempel vid funktionsanalys eller efter en sjukskrivning.',
    tip: 'Följ gärna upp över tid för att se förändringar.',
  },
  'q-long-term-illness': {
    text: 'Använd frågan när det behövs en bild av kroniska besvär som kan påverka arbetet eller kräva anpassningar.',
  },
  'q-other': {
    text: 'Ger medarbetaren plats att ta upp det som inte fångas av de andra frågorna. Passar sist i formuläret.',
  },
  'q-medication': {
    text: 'Använd frågan inför undersökningar där läkemedel kan påverka resultat eller arbetets säkerhet.',
    tip: 'Vill du veta vilka? Kombinera med frågan om vilka läkemedel medarbetaren tar.',
  },
  'q-medication-list': {
    text: 'Använd frågan när läkemedlen behöver gås igenom, till exempel inför en hälsoundersökning.',
  },
  'q-drug-allergy': {
    text: 'Använd frågan inför undersökningar där vaccin eller läkemedel kan bli aktuella.',
  },
  'q-tobacco': {
    text: 'Passar formulär med livsstilsfokus. Ett ja är en möjlighet att erbjuda stöd för att sluta.',
  },
  'q-alcohol': {
    text: 'Passar formulär med livsstilsfokus. Ställ frågan neutralt och följ upp i samtalet vid behov.',
  },
  'q-exercise': {
    text: 'Använd frågan för att få en bild av den fysiska aktiviteten, som grund för råd i hälsosamtalet.',
  },
  'q-sleep': {
    text: 'Använd frågan när återhämtning, skiftarbete eller stress är aktuellt.',
    tip: 'Kombinera gärna med frågan om skiftarbete.',
  },
  'q-diet': {
    text: 'Passar formulär med livsstilsfokus, som grund för kostråd i hälsosamtalet.',
  },
  'q-recovery': {
    text: 'Använd frågan när du vill fånga tidiga tecken på bristande återhämtning.',
  },
  'q-heavy-lifting': {
    text: 'Använd frågan för yrken där man regelbundet lyfter eller bär gods, material eller personer, till exempel lager, bygg, vård och omsorg. Ett ja är en signal att följa upp besvär i rygg och axlar och vid behov boka en ergonomisk genomgång på arbetsplatsen.',
    tip: 'Vill du veta hur ofta? Kombinera med frågan om obekväma arbetsställningar.',
  },
  'q-noise': {
    text: 'Använd frågan för miljöer med maskiner, verktyg eller trafik. Ett ja kan leda till en hörselkontroll.',
  },
  'q-awkward-postures': {
    text: 'Använd frågan för fysiskt arbete där kroppen belastas i böjda eller vridna ställningar.',
  },
  'q-vibrations': {
    text: 'Använd frågan för arbete med handhållna maskiner eller fordon. Ett ja kan leda till en vibrationskontroll.',
  },
  'q-screen-time': {
    text: 'Passar kontorsarbete. Många timmar vid skärm är en anledning att se över ergonomi och synkontroll.',
  },
  'q-protective-equipment': {
    text: 'Använd frågan där skyddsutrustning krävs, för att se att den finns och används.',
  },
  'q-chemicals': {
    text: 'Använd frågan för arbete med rengöringsmedel, lösningsmedel eller andra kemiska ämnen.',
  },
  'q-shift-work': {
    text: 'Använd frågan i verksamheter med dygnet-runt-arbete, till exempel vård, transport och industri.',
    tip: 'Kombinera gärna med frågan om sömn.',
  },
  'q-workload': {
    text: 'Passar formulär om psykosocial arbetsmiljö. Svaren ger en bild på gruppnivå att ta upp med chefen.',
  },
  'q-stress': {
    text: 'Använd frågan för att fånga tidiga tecken på stress hos medarbetaren.',
  },
  'q-influence': {
    text: 'Passar formulär om psykosocial arbetsmiljö. Lågt inflytande är en känd riskfaktor för ohälsa.',
  },
  'q-manager-support': {
    text: 'Passar formulär om psykosocial arbetsmiljö, som underlag för samtal om ledarskap.',
  },
  'q-colleague-support': {
    text: 'Passar formulär om psykosocial arbetsmiljö, som underlag för samtal om arbetsgruppen.',
  },
  'q-work-life-balance': {
    text: 'Använd frågan när du vill fånga om arbetet tar för mycket energi från fritiden.',
  },
  'q-harassment': {
    text: 'Använd frågan i formulär om psykosocial arbetsmiljö. Ett ja ska alltid följas upp.',
  },
};

const scale = (id: string, area: SeedQuestion['area'], label: string, low: string, high: string): SeedQuestion => ({
  id,
  area,
  type: 'scale',
  label,
  helpText: `1 = ${low}, 5 = ${high}`,
  min: 1,
  max: 5,
});

const yesNo = (id: string, area: SeedQuestion['area'], label: string): SeedQuestion => ({
  id,
  area,
  type: 'boolean',
  label,
});

const standardBank: SeedQuestion[] = [
  // General health ("Allmän hälsa")
  scale('q-general-health', 'general-health', 'Hur bedömer du din allmänna hälsa just nu?', 'mycket dålig', 'mycket bra'),
  {
    id: 'q-work-ability',
    area: 'general-health',
    type: 'scale',
    label: 'Hur bedömer du din arbetsförmåga just nu, jämfört med när den var som bäst?',
    helpText: '0 = kan inte arbeta alls, 10 = som bäst',
    min: 0,
    max: 10,
  },
  yesNo('q-long-term-illness', 'general-health', 'Har du någon långvarig sjukdom eller långvariga besvär?'),
  {
    id: 'q-other',
    area: 'general-health',
    type: 'textarea',
    label: 'Finns det något mer du vill att vi ska veta inför besöket?',
  },

  // Medication ("Läkemedel")
  yesNo('q-medication', 'medication', 'Tar du några läkemedel regelbundet?'),
  {
    id: 'q-medication-list',
    area: 'medication',
    type: 'textarea',
    label: 'Vilka läkemedel tar du, och hur ofta?',
  },
  yesNo('q-drug-allergy', 'medication', 'Är du allergisk mot något läkemedel?'),

  // Lifestyle ("Livsstil")
  {
    id: 'q-tobacco',
    area: 'lifestyle',
    type: 'single-choice',
    label: 'Använder du tobak eller nikotin?',
    options: [
      { value: 'no', label: 'Nej' },
      { value: 'sometimes', label: 'Ibland' },
      { value: 'daily', label: 'Dagligen' },
    ],
  },
  {
    id: 'q-alcohol',
    area: 'lifestyle',
    type: 'single-choice',
    label: 'Hur ofta dricker du alkohol?',
    options: [
      { value: 'never', label: 'Aldrig' },
      { value: 'monthly', label: 'En gång i månaden eller mer sällan' },
      { value: 'weekly', label: 'Varje vecka' },
      { value: 'daily', label: 'Dagligen' },
    ],
  },
  {
    id: 'q-exercise',
    area: 'lifestyle',
    type: 'number',
    label: 'Hur många timmar per vecka är du fysiskt aktiv?',
    min: 0,
    max: 40,
  },
  scale('q-sleep', 'lifestyle', 'Hur väl sover du?', 'mycket dåligt', 'mycket bra'),
  scale('q-diet', 'lifestyle', 'Hur bedömer du dina matvanor?', 'mycket dåliga', 'mycket bra'),
  scale('q-recovery', 'lifestyle', 'Hur ofta känner du dig utvilad när du vaknar?', 'aldrig', 'alltid'),

  // Physical work environment ("Fysisk arbetsmiljö")
  yesNo('q-heavy-lifting', 'physical-work-environment', 'Lyfter du tungt i ditt arbete?'),
  yesNo('q-noise', 'physical-work-environment', 'Utsätts du för buller i ditt arbete?'),
  scale(
    'q-awkward-postures',
    'physical-work-environment',
    'Arbetar du i obekväma arbetsställningar?',
    'aldrig',
    'hela tiden',
  ),
  yesNo('q-vibrations', 'physical-work-environment', 'Utsätts du för vibrationer?'),
  {
    id: 'q-screen-time',
    area: 'physical-work-environment',
    type: 'number',
    label: 'Hur många timmar per dag arbetar du vid skärm?',
    min: 0,
    max: 24,
  },
  {
    id: 'q-protective-equipment',
    area: 'physical-work-environment',
    type: 'text',
    label: 'Vilken skyddsutrustning använder du?',
  },
  yesNo('q-chemicals', 'physical-work-environment', 'Hanterar du kemikalier i ditt arbete?'),
  {
    id: 'q-shift-work',
    area: 'physical-work-environment',
    type: 'single-choice',
    label: 'Arbetar du natt eller skift?',
    options: [
      { value: 'no', label: 'Nej' },
      { value: 'shift', label: 'Ja, skift' },
      { value: 'night', label: 'Ja, natt' },
      { value: 'both', label: 'Ja, både skift och natt' },
    ],
  },

  // Psychosocial work environment ("Psykosocial arbetsmiljö")
  scale(
    'q-workload',
    'psychosocial-work-environment',
    'Hur upplever du din arbetsbelastning?',
    'alldeles för låg',
    'alldeles för hög',
  ),
  scale(
    'q-stress',
    'psychosocial-work-environment',
    'Hur ofta har du känt dig stressad den senaste månaden?',
    'aldrig',
    'hela tiden',
  ),
  scale('q-influence', 'psychosocial-work-environment', 'Kan du påverka hur ditt arbete utförs?', 'aldrig', 'alltid'),
  scale(
    'q-manager-support',
    'psychosocial-work-environment',
    'Får du stöd av din chef när du behöver det?',
    'aldrig',
    'alltid',
  ),
  scale(
    'q-colleague-support',
    'psychosocial-work-environment',
    'Får du hjälp och stöd av dina kollegor när du behöver det?',
    'aldrig',
    'alltid',
  ),
  scale(
    'q-work-life-balance',
    'psychosocial-work-environment',
    'Tar arbetet så mycket energi att det påverkar ditt privatliv?',
    'aldrig',
    'alltid',
  ),
  yesNo(
    'q-harassment',
    'psychosocial-work-environment',
    'Har du utsatts för kränkande särbehandling på arbetet de senaste 12 månaderna?',
  ),
];

export function seedQuestionBank(): BankQuestion[] {
  return structuredClone(standardBank).map((question) => ({
    ...question,
    guidance: guidance[question.id]?.text,
    guidanceTip: guidance[question.id]?.tip,
    updatedAt: BANK_UPDATED_AT,
  }));
}

export const formTypes: FormType[] = [
  {
    id: 'health-profile',
    name: 'Hälsoprofil',
    description: 'Livsstil, hälsa och välbefinnande, följs av ett hälsosamtal.',
    standardQuestionIds: ['q-general-health', 'q-medication', 'q-exercise'],
  },
  {
    id: 'health-screening',
    name: 'Hälsoscreening',
    description: 'Kortare kontroll av hälsa och riskfaktorer.',
    standardQuestionIds: ['q-general-health', 'q-medication'],
  },
  {
    id: 'occupational-health-exam',
    name: 'Hälsoundersökning i arbetslivet',
    description: 'Bred undersökning av hälsa och arbetsförmåga.',
    standardQuestionIds: ['q-general-health', 'q-medication', 'q-work-ability'],
  },
  {
    id: 'workplace-profile',
    name: 'Arbetsplatsprofil',
    description: 'Medarbetarnas bild av sin arbetsmiljö.',
    standardQuestionIds: ['q-workload', 'q-influence'],
  },
  {
    id: 'functional-analysis',
    name: 'Funktionsanalys',
    description: 'Arbetsförmåga i förhållande till arbetets krav.',
    standardQuestionIds: ['q-work-ability', 'q-long-term-illness'],
  },
  {
    id: 'health-profile-workplace',
    name: 'Hälsoprofil med Arbetsplatsprofil',
    description: 'Hälsoprofil och arbetsmiljö i samma formulär.',
    standardQuestionIds: ['q-general-health', 'q-medication'],
  },
  {
    id: 'health-screening-workplace',
    name: 'Hälsoscreening med Arbetsplatsprofil',
    description: 'Screening och arbetsmiljö i samma formulär.',
    standardQuestionIds: ['q-general-health', 'q-medication', 'q-workload'],
  },
  {
    id: 'new-employee',
    name: 'Nyanställningsundersökning',
    description: 'Inför eller i början av en anställning.',
    standardQuestionIds: ['q-general-health', 'q-medication', 'q-long-term-illness'],
  },
  {
    id: 'osa-copsoq',
    name: 'OSA-kartläggning (COPSOQ III)',
    description: 'Organisatorisk och social arbetsmiljö, validerad enkät.',
    standardQuestionIds: ['q-workload', 'q-influence', 'q-manager-support', 'q-colleague-support', 'q-harassment'],
  },
];

const DAY = 86_400_000;
const daysAgo = (now: Date, days: number) => new Date(now.getTime() - days * DAY).toISOString();

/** Standard questions are required; `optional` lists the other questions that are not. */
function questions(ids: string[], optional: string[] = []): FormRecord['questions'] {
  return ids.map((questionId) => ({ questionId, required: !optional.includes(questionId) }));
}

export function seedForms(now: Date): FormRecord[] {
  return [
    {
      id: 'form-1',
      name: 'Hälsoprofil med Arbetsplatsprofil - Bygg',
      formTypeId: 'health-profile-workplace',
      status: 'saved',
      version: 4,
      contentVersion: 4,
      pendingEdit: null,
      questions: questions(
        [
          'q-general-health',
          'q-medication',
          'q-heavy-lifting',
          'q-noise',
          'q-protective-equipment',
          'q-shift-work',
          'q-tobacco',
        ],
        ['q-protective-equipment', 'q-tobacco'],
      ),
      wizardStep: 3,
      createdAt: daysAgo(now, 60),
      updatedAt: daysAgo(now, 6),
      updatedBy: 'Eva Holm',
    },
    {
      id: 'form-2',
      name: 'Nyanställning - standard',
      formTypeId: 'new-employee',
      status: 'saved',
      version: 7,
      contentVersion: 7,
      pendingEdit: null,
      questions: questions(
        [
          'q-general-health',
          'q-medication',
          'q-long-term-illness',
          'q-medication-list',
          'q-drug-allergy',
          'q-heavy-lifting',
          'q-other',
        ],
        ['q-medication-list', 'q-heavy-lifting', 'q-other'],
      ),
      wizardStep: 3,
      createdAt: daysAgo(now, 200),
      updatedAt: daysAgo(now, 13),
      updatedBy: 'Eva Holm',
    },
    {
      id: 'form-3',
      name: 'OSA 2026',
      formTypeId: 'osa-copsoq',
      status: 'saved',
      version: 2,
      contentVersion: 2,
      pendingEdit: null,
      questions: questions([
        'q-workload',
        'q-influence',
        'q-manager-support',
        'q-colleague-support',
        'q-harassment',
        'q-stress',
        'q-work-life-balance',
      ]),
      wizardStep: 3,
      createdAt: daysAgo(now, 20),
      updatedAt: daysAgo(now, 15),
      updatedBy: 'Eva Holm',
    },
    {
      id: 'form-4',
      name: 'Hälsoscreening - transport',
      formTypeId: 'health-screening',
      status: 'saved',
      version: 3,
      contentVersion: 3,
      pendingEdit: null,
      questions: questions(
        ['q-general-health', 'q-medication', 'q-shift-work', 'q-vibrations', 'q-sleep'],
        ['q-sleep'],
      ),
      wizardStep: 3,
      createdAt: daysAgo(now, 45),
      updatedAt: daysAgo(now, 32),
      updatedBy: 'Eva Holm',
    },
    {
      id: 'form-5',
      name: 'Hälsoprofil - IT',
      formTypeId: 'health-profile',
      status: 'draft',
      version: 1,
      contentVersion: 1,
      pendingEdit: null,
      questions: questions(['q-general-health', 'q-medication', 'q-exercise', 'q-screen-time']),
      wizardStep: 2,
      createdAt: daysAgo(now, 40),
      updatedAt: daysAgo(now, 40),
      updatedBy: 'Jonas Eriksson',
    },
  ];
}

export function seedLinks(now: Date): CompanyFormLink[] {
  const published = (
    companyId: string,
    formId: string,
    publishedVersion: number,
    responseCount: number,
    days: number,
  ): CompanyFormLink => ({
    companyId,
    formId,
    status: 'published',
    publishedVersion,
    publishedAt: daysAgo(now, days),
    responseCount,
    linkedAt: daysAgo(now, days + 1),
  });
  const draft = (companyId: string, formId: string, days: number): CompanyFormLink => ({
    companyId,
    formId,
    status: 'draft',
    publishedVersion: null,
    publishedAt: null,
    responseCount: 0,
    linkedAt: daysAgo(now, days),
  });

  return [
    published('org-1', 'form-1', 4, 0, 6),
    // Published at an older version: the form has been edited since ("hasUnpublishedChanges")
    published('org-3', 'form-1', 3, 18, 30),
    published('org-1', 'form-2', 7, 12, 13),
    published('org-2', 'form-2', 7, 4, 13),
    published('org-3', 'form-2', 7, 9, 13),
    published('org-4', 'form-2', 7, 21, 13),
    published('org-5', 'form-2', 7, 2, 13),
    draft('org-1', 'form-3', 14),
    draft('org-3', 'form-4', 31),
  ];
}
