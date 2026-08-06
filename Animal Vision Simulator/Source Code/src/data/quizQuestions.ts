export interface Question {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'Photoreceptors' | 'Spectrum & UV' | 'Night Vision' | 'Anatomy & Optics' | 'Thermal & Motion';
  question: string;
  image?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  animalContext?: string;
}

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'q1',
    difficulty: 'easy',
    category: 'Photoreceptors',
    question: 'How many color receptor cones do dogs have in their retinas?',
    options: ['1 (Monochromat)', '2 (Dichromat)', '3 (Trichromat)', '4 (Tetrachromat)'],
    correctIndex: 1,
    explanation: 'Dogs are dichromats possessing 2 types of color cones peak-sensitive to blue (~429nm) and yellow (~555nm). They cannot distinguish red from green!',
    animalContext: 'Dog',
  },
  {
    id: 'q2',
    difficulty: 'easy',
    category: 'Night Vision',
    question: 'What is the reflective layer behind a cat’s retina that glows in the dark called?',
    options: ['Corneal Tapetum', 'Tapetum Lucidum', 'Fovea Centralis', 'Iris Sphincter'],
    correctIndex: 1,
    explanation: 'The Tapetum Lucidum acts as a biological mirror reflecting unabsorbed photons back through the photoreceptors, boosting night sensitivity by up to 6 times!',
    animalContext: 'Domestic Cat',
  },
  {
    id: 'q3',
    difficulty: 'hard',
    category: 'Spectrum & UV',
    question: 'Which extraordinary creature holds the record with 16 distinct photoreceptor channels including UV and circular polarization?',
    options: ['Golden Eagle', 'Peacock Mantis Shrimp', 'Honeybee', 'Cuttlefish'],
    correctIndex: 1,
    explanation: 'The Peacock Mantis Shrimp has 12 color photoreceptor channels plus 4 polarized light filters, allowing it to perceive ultraviolet light and circular polarization!',
    animalContext: 'Peacock Mantis Shrimp',
  },
  {
    id: 'q4',
    difficulty: 'medium',
    category: 'Thermal & Motion',
    question: 'How do Pit Vipers detect warm-blooded prey in total darkness?',
    options: ['Ultrasound echolocation', 'Pit organs detecting 5-30µm infrared radiation', 'Magnetic field sensing', 'Pheromone trail tracking'],
    correctIndex: 1,
    explanation: 'Pit vipers possess specialized pit organs between their eyes and nostrils lined with TRPA1 thermal ion channels that convert far-infrared radiation into a 3D thermal spatial map!',
    animalContext: 'Pit Viper',
  },
  {
    id: 'q5',
    difficulty: 'easy',
    category: 'Anatomy & Optics',
    question: 'Why do honeybees see flowers in vibrant bullseye patterns invisible to humans?',
    options: ['They detect infrared heat from nectar', 'They perceive Ultraviolet (UV) wavelengths reflected by petals', 'They use sound resonance', 'They only see black and white'],
    correctIndex: 1,
    explanation: 'Flowers have evolved UV-absorbing "nectar guides" on their petals. Bees possess UV-sensitive cones (~344nm), making these hidden landing pads stand out clearly!',
    animalContext: 'Honeybee',
  },
  {
    id: 'q6',
    difficulty: 'medium',
    category: 'Anatomy & Optics',
    question: 'Eagles have dual foveae (deep pit & shallow pit) in each eye. What capability does this grant them?',
    options: ['360-degree rear view without moving head', 'Integrated 4K telephoto zoom in center vision + wide-angle peripheral awareness', 'Thermal heat vision at night', 'X-ray bone vision'],
    correctIndex: 1,
    explanation: 'The deep fovea acts like a telephoto lens with high cone density providing 20/5 acuity, while the shallow fovea maintains wide-angle panoramic awareness!',
    animalContext: 'Golden Eagle',
  },
  {
    id: 'q7',
    difficulty: 'medium',
    category: 'Photoreceptors',
    question: 'What is unique about human vision compared to most placental mammals?',
    options: ['Humans are trichromats while most non-primate mammals are dichromats', 'Humans can see infrared heat', 'Humans have compound ommatidia', 'Humans see ultraviolet light'],
    correctIndex: 0,
    explanation: 'Primate ancestors re-evolved trichromacy (3 cones: Red, Green, Blue) to spot ripe fruit against green foliage, whereas most non-primate mammals remain dichromats.',
    animalContext: 'Human',
  },
  {
    id: 'q8',
    difficulty: 'hard',
    category: 'Anatomy & Optics',
    question: 'Insects see through thousands of microscopic optical units. What are these individual lenses called?',
    options: ['Ommatidia', 'Rhabdoms', 'Ciliary bodies', 'Corneal facets'],
    correctIndex: 0,
    explanation: 'Insects have compound eyes made of up to 30,000 hexagonal ommatidia. Each ommatidium acts as a mini lens focusing light onto its own set of photoreceptors!',
    animalContext: 'Honeybee',
  },
  {
    id: 'q9',
    difficulty: 'easy',
    category: 'Night Vision',
    question: 'Which photoreceptor cell type in the retina is responsible for black-and-white night vision and motion tracking?',
    options: ['Cones', 'Rods', 'Ganglion cells', 'Amacrine cells'],
    correctIndex: 1,
    explanation: 'Rods are highly sensitive to low light levels and motion, but cannot distinguish color. Nocturnal animals like owls and cats haveretinas packed with up to 99% rods!',
    animalContext: 'Owl',
  },
  {
    id: 'q10',
    difficulty: 'hard',
    category: 'Spectrum & UV',
    question: 'Chameleons can move their eyes completely independently. What visual feature allows them precise rangefinding for strike accuracy?',
    options: ['Infrared laser guidance', 'Monocular depth perception through rapid corneal lens focus adjustments', 'Echolocation', 'UV polarized light orientation'],
    correctIndex: 1,
    explanation: 'Chameleons use monocular accommodation—adjusting the focal length of each eye independently—to measure distance to prey with incredible precision!',
    animalContext: 'Chameleon',
  },
  {
    id: 'q11',
    difficulty: 'medium',
    category: 'Photoreceptors',
    question: 'Horses have horizontal slit pupils and laterally placed eyes. What is their primary field of view (FOV)?',
    options: ['120 degrees', '180 degrees', '350 degrees panoramic FOV with blind spots directly behind and in front of nose', '360 degrees spherical FOV'],
    correctIndex: 2,
    explanation: 'As prey animals, horses possess a massive ~350° field of view to scan for predators, with narrow blind spots right behind their tail and right under their nose!',
    animalContext: 'Horse',
  },
  {
    id: 'q12',
    difficulty: 'hard',
    category: 'Anatomy & Optics',
    question: 'Cuttlefish have "W-shaped" pupils. What optical problem does this shape resolve?',
    options: ['Reduces chromatic aberration in high-contrast underwater depths', 'Filters out salt water glare', 'Enables X-ray vision through sand', 'Magnifies microscopic plankton'],
    correctIndex: 0,
    explanation: 'The W-shaped pupil mitigates chromatic aberration (color fringing) in sea water, allowing colorblind cuttlefish to perceive color indirectly through focal light dispersion!',
    animalContext: 'Cuttlefish',
  }
];

export interface MatchCard {
  id: string;
  pairId: string;
  type: 'animal' | 'trait';
  content: string;
  subtext: string;
  icon?: string;
  image?: string;
}

export const MATCH_PAIRS = [
  {
    pairId: 'p1',
    animalName: 'Domestic Dog',
    animalIcon: '🐶',
    animalImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
    traitName: 'Dichromat (Blue & Yellow)',
    traitDesc: '2 Cones • Cannot distinguish Red vs Green',
  },
  {
    pairId: 'p2',
    animalName: 'Pit Viper',
    animalIcon: '🐍',
    animalImg: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=300&q=80',
    traitName: 'Infrared Thermal Vision',
    traitDesc: 'Pit organs detect 5-30µm heat signatures',
  },
  {
    pairId: 'p3',
    animalName: 'Peacock Mantis Shrimp',
    animalIcon: '🦐',
    animalImg: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80',
    traitName: '16 Photoreceptors + UV',
    traitDesc: 'Circular polarization & 12 color channels',
  },
  {
    pairId: 'p4',
    animalName: 'Golden Eagle',
    animalIcon: '🦅',
    animalImg: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=300&q=80',
    traitName: 'Dual Fovea 4K Telephoto',
    traitDesc: '20/5 Snellen Acuity • 5x magnification',
  },
  {
    pairId: 'p5',
    animalName: 'Honeybee',
    animalIcon: '🐝',
    animalImg: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=300&q=80',
    traitName: 'Hexagonal Ommatidia UV',
    traitDesc: 'Compound eye • Sees nectar flower guides',
  },
  {
    pairId: 'p6',
    animalName: 'Domestic Cat',
    animalIcon: '🐱',
    animalImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
    traitName: 'Tapetum Lucidum Mirror',
    traitDesc: '6x lower light threshold • 200° FOV',
  },
  {
    pairId: 'p7',
    animalName: 'Great Horned Owl',
    animalIcon: '🦉',
    animalImg: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e0c?auto=format&fit=crop&w=300&q=80',
    traitName: 'Tubular Eyes & Rod Dominance',
    traitDesc: 'Fixed binocular gaze • 99% rod retinas',
  },
  {
    pairId: 'p8',
    animalName: 'Chameleon',
    animalIcon: '🦎',
    animalImg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=300&q=80',
    traitName: 'Independent 360° Monocular',
    traitDesc: 'Dual turret eyes • Rangefinder focus',
  },
];
