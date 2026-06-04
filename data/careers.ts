/** Open roles. Compensation is in USD. Applications go to the contact email. */
export interface Role {
  id: string;
  title: string;
  comp: string;
  location: string;
}

export const roles: Role[] = [
  {
    id: "senior-fde",
    title: "Senior FDE",
    comp: "$70,000 to $100,000 a year",
    location: "UAE",
  },
  {
    id: "ml-ops",
    title: "ML Ops Engineer",
    comp: "$70,000 a year",
    location: "San Francisco, USA",
  },
  {
    id: "ai-native",
    title: "AI Native Engineer (Inference, C/C++)",
    comp: "$40,000 a year",
    location: "India",
  },
];
