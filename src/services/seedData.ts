import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db, firebaseReady } from "./firebase";
import type { Career, College } from "../shared/types/types";
import parsedColleges from "./collegesData.json";

export const careerSeeds: Career[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "STEM",
    salaryRange: "₹8L - ₹25L",
    growthOutlook: "High",
    educationLevel: "Bachelor's in Computer Science or related field",
    skills: ["Programming", "Systems thinking", "Debugging", "Collaboration"],
    relatedMajors: ["Computer Science", "Software Engineering", "Data Science"],
    description: "Designs, builds, and improves software products used by people and organizations.",
    projectedDemand: "25% growth over the next 10 years (Much faster than average)",
    dayInLife: "Starts with a stand-up meeting to align on sprint goals, followed by deep focus coding blocks, debugging issues, and peer code reviews. Collaborates with UX designers and product managers to map feature specs.",
    salaryProgression: [
      { level: "Entry Level", salary: "₹6L - ₹10L" },
      { level: "Mid Level", salary: "₹10L - ₹18L" },
      { level: "Senior Engineer", salary: "₹18L - ₹32L" },
      { level: "Lead / Principal", salary: "₹32L - ₹55L" }
    ],
    careerRoadmap: [
      "Obtain a Bachelor's in CS, Software Engineering, or build equivalent coding competency.",
      "Build a portfolio of personal projects on GitHub, showcasing clean code and database logic.",
      "Complete an internship to learn industry practices like Git workflows and agile processes.",
      "Apply for junior software developer roles, focus on learning systems architecture."
    ],
    matchExplanation: "Strong match due to your interest in Coding, VP role in Robotics club, and high STEM preference."
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    category: "Arts",
    salaryRange: "₹6L - ₹18L",
    growthOutlook: "High",
    educationLevel: "Bachelor's in Design, HCI, or Psychology",
    skills: ["Research", "Prototyping", "Visual design", "Empathy"],
    relatedMajors: ["Human-Computer Interaction", "Graphic Design", "Psychology"],
    description: "Creates intuitive digital experiences through research, prototyping, and usability testing.",
    projectedDemand: "16% growth over the next 10 years",
    dayInLife: "Conducts user interviews, translates findings into wireframes and interactive prototypes, coordinates with engineers to review design feasibility, and refines visuals for accessibility.",
    salaryProgression: [
      { level: "Junior Designer", salary: "₹4L - ₹8L" },
      { level: "Mid UX Designer", salary: "₹8L - ₹14L" },
      { level: "Senior UX/Product", salary: "₹14L - ₹25L" },
      { level: "Design Director", salary: "₹25L - ₹45L" }
    ],
    careerRoadmap: [
      "Learn fundamental UX principles: typography, information architecture, and user research.",
      "Master industry design software such as Figma and Adobe Creative Suite.",
      "Work on case studies explaining your design process from problem statement to final prototype.",
      "Create a digital portfolio website and apply for design roles or freelance opportunities."
    ],
    matchExplanation: "Matches your academic interests in design and machine learning, combining visuals with technical flows."
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "STEM",
    salaryRange: "₹10L - ₹28L",
    growthOutlook: "High",
    educationLevel: "Bachelor's or Master's in Statistics, CS, or Math",
    skills: ["Statistics", "Python", "Machine learning", "Storytelling"],
    relatedMajors: ["Data Science", "Statistics", "Mathematics"],
    description: "Turns complex data into predictions, insights, and decisions.",
    projectedDemand: "35% growth over the next 10 years (Extremely high demand)",
    dayInLife: "Cleans raw database logs, designs statistical models to forecast user trends, presents visual analytics dashboards to executives, and writes Python pipelines to train machine learning models.",
    salaryProgression: [
      { level: "Associate Analyst", salary: "₹7L - ₹12L" },
      { level: "Data Scientist", salary: "₹12L - ₹22L" },
      { level: "Senior Data Scientist", salary: "₹22L - ₹38L" },
      { level: "Chief Data Officer", salary: "₹38L - ₹70L" }
    ],
    careerRoadmap: [
      "Acquire solid grounding in linear algebra, multivariable calculus, and probability.",
      "Learn SQL for querying databases and Python/R for data analysis libraries (Pandas, Scikit-learn).",
      "Participate in Kaggle competitions to practice solving real-world dataset problems.",
      "Learn data visualization tools like Tableau or PowerBI to present findings effectively."
    ],
    matchExplanation: "Recommended because of your coding experience, high math GPA, and machine learning interest."
  },
  {
    id: "mechanical-engineer",
    title: "Mechanical Engineer",
    category: "STEM",
    salaryRange: "₹5L - ₹15L",
    growthOutlook: "Medium",
    educationLevel: "Bachelor's in Mechanical Engineering",
    skills: ["CAD", "Physics", "Testing", "Manufacturing"],
    relatedMajors: ["Mechanical Engineering", "Physics", "Robotics"],
    description: "Develops machines, products, and mechanical systems from concept through production.",
    projectedDemand: "10% growth over the next 10 years",
    dayInLife: "Works with CAD tools to detail physical brackets and gears, runs thermodynamic stress analysis simulations, reviews mechanical prototypes in the manufacturing lab, and coordinates with vendors.",
    salaryProgression: [
      { level: "Graduate Engineer", salary: "₹4L - ₹7L" },
      { level: "Mechanical Engineer", salary: "₹7L - ₹12L" },
      { level: "Senior Design Engineer", salary: "₹12L - ₹20L" },
      { level: "Engineering Director", salary: "₹20L - ₹35L" }
    ],
    careerRoadmap: [
      "Earn a degree in Mechanical Engineering, focusing on physics and thermal design.",
      "Get certified in standard CAD software (SolidWorks, AutoCAD, or CATIA).",
      "Work on hands-on physical projects (Formula Student teams, robotics chassis building).",
      "Apply for structural, thermal, or automotive engineer training positions."
    ],
    matchExplanation: "Matches your involvement in the Robotics Club and core physics interest."
  },
  {
    id: "nurse-practitioner",
    title: "Nurse Practitioner",
    category: "Healthcare",
    salaryRange: "₹4L - ₹12L",
    growthOutlook: "High",
    educationLevel: "Master's in Nursing",
    skills: ["Patient care", "Diagnosis", "Communication", "Clinical judgment"],
    relatedMajors: ["Nursing", "Biology", "Public Health"],
    description: "Provides advanced patient care, diagnoses conditions, and manages treatment plans.",
    projectedDemand: "38% growth over the next 10 years",
    dayInLife: "Examines patients, orders and interprets diagnostic tests, prescribes medications, and counsels individuals on long-term wellness plans in a clinical environment.",
    salaryProgression: [
      { level: "Registered Nurse", salary: "₹3L - ₹5L" },
      { level: "Nurse Practitioner", salary: "₹5L - ₹9L" },
      { level: "Senior NP", salary: "₹9L - ₹15L" },
      { level: "Clinical Director", salary: "₹15L - ₹24L" }
    ],
    careerRoadmap: [
      "Earn a Bachelor of Science in Nursing (BSN) and pass licensing exams.",
      "Work as a Registered Nurse in clinical or emergency rooms to build patient care skills.",
      "Complete a Master of Science in Nursing (MSN) or Doctor of Nursing Practice (DNP) degree.",
      "Pass national nurse practitioner certification exams to practice independently."
    ],
    matchExplanation: "Suitable if you pivot to biology and clinical sciences, demonstrating strong empathy and care skills."
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    category: "Business",
    salaryRange: "₹6L - ₹20L",
    growthOutlook: "Medium",
    educationLevel: "Bachelor's in Marketing or Business",
    skills: ["Strategy", "Analytics", "Branding", "Campaigns"],
    relatedMajors: ["Marketing", "Business Administration", "Communications"],
    description: "Plans campaigns and market strategies that help organizations grow.",
    projectedDemand: "8% growth over the next 10 years",
    dayInLife: "Conducts market research, drafts email and social campaign briefs, coordinates with graphic designers for creative assets, monitors conversion analytics, and adjusts ad spend budgets.",
    salaryProgression: [
      { level: "Marketing Associate", salary: "₹4L - ₹7L" },
      { level: "Marketing Manager", salary: "₹7L - ₹15L" },
      { level: "Senior Manager", salary: "₹15L - ₹25L" },
      { level: "CMO", salary: "₹25L - ₹50L" }
    ],
    careerRoadmap: [
      "Acquire a degree in marketing, business management, or media communications.",
      "Obtain certifications in SEO, Google Ads, and analytics software.",
      "Assist in writing marketing content or launching digital student initiatives.",
      "Work as a digital analyst or content marketer to step up to campaign planning."
    ],
    matchExplanation: "Matches your business interest category and communication competencies."
  },
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    category: "Business",
    salaryRange: "₹6L - ₹18L",
    growthOutlook: "Medium",
    educationLevel: "Bachelor's in Finance, Economics, or Accounting",
    skills: ["Modeling", "Excel", "Risk analysis", "Research"],
    relatedMajors: ["Finance", "Economics", "Accounting"],
    description: "Evaluates investments, budgets, and business performance to guide financial choices.",
    projectedDemand: "9% growth over the next 10 years",
    dayInLife: "Builds financial forecasts in Excel, analyzes historical performance metrics, drafts advisory briefs on market trends, and evaluates risk profiles for capital investments.",
    salaryProgression: [
      { level: "Junior Analyst", salary: "₹5L - ₹8L" },
      { level: "Senior Analyst", salary: "₹8L - ₹15L" },
      { level: "Finance Manager", salary: "₹15L - ₹24L" },
      { level: "VP of Finance", salary: "₹24L - ₹45L" }
    ],
    careerRoadmap: [
      "Earn a degree in Finance or Economics, building excellent mathematical modeling skills.",
      "Master advanced spreadsheets, financial statements analysis, and valuation methodologies.",
      "Prepare for certifications like Chartered Financial Analyst (CFA) or equivalent.",
      "Apply for analyst programs at investment banking, consulting, or corporate finance firms."
    ],
    matchExplanation: "Aligns with your analytics profile, interest in statistics, and finance preferences."
  },
  {
    id: "lawyer",
    title: "Lawyer",
    category: "Law",
    salaryRange: "₹8L - ₹30L",
    growthOutlook: "Medium",
    educationLevel: "Bachelor's degree plus JD",
    skills: ["Argumentation", "Research", "Writing", "Negotiation"],
    relatedMajors: ["Political Science", "Pre-Law", "History"],
    description: "Advises clients, researches legal issues, and represents cases or agreements.",
    projectedDemand: "12% growth over the next 10 years",
    dayInLife: "Researches case precedents, drafts commercial contracts or litigation pleadings, counsels clients on liability, negotiates settlement structures, and presents arguments in court.",
    salaryProgression: [
      { level: "Associate Lawyer", salary: "₹6L - ₹12L" },
      { level: "Senior Associate", salary: "₹12L - ₹22L" },
      { level: "Partner", salary: "₹22L - ₹50L" },
      { level: "Senior Partner", salary: "₹50L - ₹1Cr+" }
    ],
    careerRoadmap: [
      "Complete a Bachelor's degree in any field (humanities or social sciences is common).",
      "Prepare for and pass entrance exams for law schools (CLAT or LSAT).",
      "Earn a Bachelor of Laws (LLB) or JD equivalent and complete clinical moot courts.",
      "Pass licensing bar exams and serve as an apprentice junior advocate."
    ],
    matchExplanation: "Corresponds to your high verbal test scores, debate/humanities interests, and logical reasoning profile."
  }
];

const rawCollegeSeeds: College[] = [
  {
    id: "iit-bombay",
    name: "IIT Bombay",
    city: "Mumbai",
    state: "Maharashtra",
    type: "Public",
    tuition: 220000,
    acceptanceRate: 1,
    enrollment: 12000,
    majors: ["Computer Science", "Mechanical Engineering", "Data Science", "Physics"],
    description: "A premier engineering and research institution located in Powai, Mumbai, known globally for its academic excellence.",
    averageSalary: 2180000,
    placementRate: 96,
    csRanking: 1,
    scholarships: "MHRD merit-cum-means scholarship covers 100% tuition for weaker income groups.",
    campusSize: "Large (550 acres)",
    studentFacultyRatio: "9:1",
    applicationDeadline: "June 25",
    admissionsGpaMedian: 3.98,
    admissionsSatMedian: 1540,
    whyRecommended: "Strong fit because your GPA (3.92) is close to their median admitted profile, you demonstrate deep coding interest, and your robotics background matches their specialized lab programs."
  },
  {
    id: "iit-delhi",
    name: "IIT Delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "Public",
    tuition: 225000,
    acceptanceRate: 1,
    enrollment: 11000,
    majors: ["Computer Science", "Mechanical Engineering", "Civil Engineering", "Robotics"],
    description: "Located in the capital city, a leading public engineering college focused on research, innovation, and industry collaborations.",
    averageSalary: 2050000,
    placementRate: 94,
    csRanking: 2,
    scholarships: "IITD alumni scholarships cover partial to full costs based on scholastic performance.",
    campusSize: "Medium (320 acres)",
    studentFacultyRatio: "10:1",
    applicationDeadline: "June 20",
    admissionsGpaMedian: 3.96,
    admissionsSatMedian: 1520,
    whyRecommended: "Highly recommended because you live in Delhi, meet their competitive academic metrics, and your hackathon leadership matches their active entrepreneurial center."
  },
  {
    id: "iit-madras",
    name: "IIT Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "Public",
    tuition: 215000,
    acceptanceRate: 1,
    enrollment: 10500,
    majors: ["Computer Science", "Civil Engineering", "Data Science", "Physics"],
    description: "Consistently ranked as the top engineering institution in India by the NIRF, set in a lush green campus in Chennai.",
    averageSalary: 2100000,
    placementRate: 95,
    csRanking: 3,
    scholarships: "Institute scholarships cover academic tuition fees for eligible category students.",
    campusSize: "Large (610 acres)",
    studentFacultyRatio: "9:1",
    applicationDeadline: "June 22",
    admissionsGpaMedian: 3.97,
    admissionsSatMedian: 1530,
    whyRecommended: "Matches your top preference for STEM majors, offers premium Data Science tracks, and aligns with your varsity sports discipline."
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani",
    city: "Pilani",
    state: "Rajasthan",
    type: "Private",
    tuition: 570000,
    acceptanceRate: 5,
    enrollment: 16000,
    majors: ["Computer Science", "Mechanical Engineering", "Mathematics", "Physics"],
    description: "A highly selective private university known for its merit-based admissions and strong entrepreneurial culture.",
    averageSalary: 1560000,
    placementRate: 92,
    csRanking: 5,
    scholarships: "BITS offers generous merit-cum-need scholarships covering 25% to 80% tuition fees.",
    campusSize: "Large (328 acres)",
    studentFacultyRatio: "12:1",
    applicationDeadline: "June 10",
    admissionsGpaMedian: 3.85,
    admissionsSatMedian: 1450,
    whyRecommended: "An excellent target school; your GPA (3.92) is above their median target, and their flexible curriculum accommodates your interests in coding and machine learning."
  },
  {
    id: "vit-vellore",
    name: "VIT Vellore",
    city: "Vellore",
    state: "Tamil Nadu",
    type: "Private",
    tuition: 198000,
    acceptanceRate: 15,
    enrollment: 35000,
    majors: ["Computer Science", "Mechanical Engineering", "Biology"],
    description: "A prominent private university offering extensive academic paths, modern infrastructure, and strong placement records.",
    averageSalary: 820000,
    placementRate: 88,
    csRanking: 12,
    scholarships: "VIT STARS program offers full fee waiver for top district rank holders.",
    campusSize: "Large (370 acres)",
    studentFacultyRatio: "15:1",
    applicationDeadline: "May 15",
    admissionsGpaMedian: 3.50,
    admissionsSatMedian: 1280,
    whyRecommended: "Safe matching school where your GPA and test scores comfortably place you in the top tier of applicants, offering high probability of admission."
  },
  {
    id: "delhi-university",
    name: "Delhi University",
    city: "Delhi",
    state: "Delhi",
    type: "Public",
    tuition: 15000,
    acceptanceRate: 8,
    enrollment: 80000,
    majors: ["Economics", "Mathematics", "Statistics", "English", "History"],
    description: "A flagship central university offering a diverse range of undergraduate courses in humanities, commerce, and science.",
    averageSalary: 680000,
    placementRate: 80,
    csRanking: 15,
    scholarships: "DU offers fee waivers for outstanding sports students and financial aid for needy students.",
    campusSize: "Large (Distributed)",
    studentFacultyRatio: "18:1",
    applicationDeadline: "July 10",
    admissionsGpaMedian: 3.75,
    admissionsSatMedian: 1350,
    whyRecommended: "Matches your localized Delhi preference and represents an affordable public alternative with strong statistics/mathematics pathways."
  },
  {
    id: "srcc-delhi",
    name: "SRCC Delhi",
    city: "Delhi",
    state: "Delhi",
    type: "Public",
    tuition: 30000,
    acceptanceRate: 2,
    enrollment: 3000,
    majors: ["Finance", "Economics", "Accounting"],
    description: "Shri Ram College of Commerce is the premier institute for business and economics education in India.",
    averageSalary: 980000,
    placementRate: 91,
    csRanking: 20,
    scholarships: "College scholarships and merit prizes cover academic tuition costs.",
    campusSize: "Small (17 acres)",
    studentFacultyRatio: "14:1",
    applicationDeadline: "July 05",
    admissionsGpaMedian: 3.92,
    admissionsSatMedian: 1480,
    whyRecommended: "Great fit if you seek management fields; your stats match their strict profile, and they are located directly within Delhi."
  },
  {
    id: "aiims-delhi",
    name: "AIIMS Delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "Public",
    tuition: 1628,
    acceptanceRate: 0.1,
    enrollment: 3000,
    majors: ["Nursing", "Biology"],
    description: "The premier medical research university and hospital in India, offering highly subsidized world-class medical education.",
    averageSalary: 1600000,
    placementRate: 99,
    csRanking: 40,
    scholarships: "Fully subsidized education by Central Government.",
    campusSize: "Medium (115 acres)",
    studentFacultyRatio: "4:1",
    applicationDeadline: "June 01",
    admissionsGpaMedian: 3.99,
    admissionsSatMedian: 1560,
    whyRecommended: "Highly selective; suitable if you pursue medicine/biology pathways. Extremely competitive match."
  },
  {
    id: "nit-trichy",
    name: "NIT Trichy",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    type: "Public",
    tuition: 145000,
    acceptanceRate: 2,
    enrollment: 6500,
    majors: ["Computer Science", "Mechanical Engineering", "Civil Engineering"],
    description: "The top-ranked National Institute of Technology, offering excellent engineering and technical education.",
    averageSalary: 1280000,
    placementRate: 93,
    csRanking: 8,
    scholarships: "MHRD scholarships available based on family income limits.",
    campusSize: "Large (800 acres)",
    studentFacultyRatio: "12:1",
    applicationDeadline: "June 18",
    admissionsGpaMedian: 3.88,
    admissionsSatMedian: 1460,
    whyRecommended: "Strong engineering alternative with competitive match score; fits your sports credentials and coding background."
  }
];

export const collegeSeeds: College[] = [
  ...rawCollegeSeeds,
  ...(parsedColleges as College[]).filter(
    pc => !rawCollegeSeeds.some(c => c.id === pc.id || c.name.toLowerCase() === pc.name.toLowerCase())
  )
];

export async function seedDataIfNeeded() {
  if (!firebaseReady) return;
  const [careerSnap, collegeSnap] = await Promise.all([
    getDocs(collection(db, "careers")),
    getDocs(collection(db, "colleges"))
  ]);
  const batch = writeBatch(db);
  if (careerSnap.empty) {
    careerSeeds.forEach((career) => batch.set(doc(db, "careers", career.id), career));
  }
  if (collegeSnap.empty) {
    collegeSeeds.forEach((college) => batch.set(doc(db, "colleges", college.id), college));
  }
  if (careerSnap.empty || collegeSnap.empty) await batch.commit();
}
