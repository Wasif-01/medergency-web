export const doctors = [
  {
    id: 1,
    name: "Dr. Ananya Sharma",
    qualification: "MBBS, MD",
    specialty: "General Physician",
    experience: 8,
    rating: 4.8,
    fee: 299,
    availability: "Available Now",
    initials: "AS",
    color: "blue",
    languages: "English, Hindi",
    types: ["Video", "Audio"],
    about:
      "A thoughtful approach to everyday health. Dr. Ananya focuses on listening to your concerns and making the next steps easy to understand.",
    expertise: ["Fever & cold", "General wellness", "Everyday health concerns"],
  },
  {
    id: 2,
    name: "Dr. Priya Mehta",
    qualification: "MBBS, MS",
    specialty: "Gynecologist",
    experience: 10,
    rating: 4.9,
    fee: 499,
    availability: "Available Today",
    initials: "PM",
    color: "rose",
    languages: "English, Hindi, Gujarati",
    types: ["Video", "Audio"],
    about:
      "Compassionate support for women through every stage of life, with space to ask questions and talk openly.",
    expertise: ["Women’s health", "Menstrual concerns", "Reproductive health"],
  },
  {
    id: 3,
    name: "Dr. Arjun Kapoor",
    qualification: "MBBS, MD",
    specialty: "Psychiatrist",
    experience: 7,
    rating: 4.8,
    fee: 399,
    availability: "Available Now",
    initials: "AK",
    color: "violet",
    languages: "English, Hindi",
    types: ["Video", "Audio"],
    about:
      "A calm, judgement-free space to talk about mental wellbeing and understand your options.",
    expertise: ["Stress", "Anxiety concerns", "Mental wellbeing"],
  },
  {
    id: 4,
    name: "Dr. Rahul Verma",
    qualification: "MBBS, MD",
    specialty: "General Physician",
    experience: 12,
    rating: 4.7,
    fee: 399,
    availability: "Available Today",
    initials: "RV",
    color: "mint",
    languages: "English, Hindi, Bengali",
    types: ["Video", "Audio"],
    about:
      "Patient-centred care for common health concerns, with a clear and practical approach to follow-up.",
    expertise: ["General medicine", "Everyday health", "Preventive care"],
  },
];
export const findDoctor = (id) =>
  doctors.find((d) => d.id === Number(id)) || doctors[0];
export const slots = [
  "10:00 AM",
  "10:30 AM",
  "11:15 AM",
  "12:00 PM",
  "01:30 PM",
  "04:00 PM",
  "06:30 PM",
  "07:00 PM",
];
export const faqs = [
  [
    "How does an online consultation work?",
    "Choose a doctor, select video or audio, and pick a time that works for you. Your appointment is saved on this device. Live doctor connections are not available yet.",
  ],
  [
    "How do I choose a doctor?",
    "Choose a specialty, then compare experience, languages, fees and available times. Read the profile to find the right fit.",
  ],
  [
    "Can I choose video or audio consultation?",
    "Yes. Select your preferred consultation type before choosing a date and time.",
  ],
  [
    "How will I receive my prescription?",
    "Your consultation records are available in My Prescriptions. A prescription is valid only after an authorised doctor reviews and signs it.",
  ],
  [
    "Can I view old prescriptions?",
    "Yes. Use My Prescriptions to search your records by doctor, date or specialty on this browser.",
  ],
  [
    "How do payments work?",
    "The payment screen includes UPI, cards and bank options. Payment collection is not connected yet, so confirming an appointment does not charge you.",
  ],
  [
    "Can I reschedule my appointment?",
    "Open an upcoming appointment in My Consultations and choose Reschedule. Pick a new available date and time, then confirm the change.",
  ],
  [
    "Is Medergency available on mobile?",
    "Yes. Access Medergency from your mobile, tablet or desktop browser.",
  ],
  [
    "Which languages will be supported?",
    "English is available now. More Indian languages are planned and listed in your language settings.",
  ],
];
