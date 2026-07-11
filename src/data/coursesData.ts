import type { CourseSubject, QuizQuestion } from '../services/learning'

export const courseCatalog: Record<string, CourseSubject[]> = {
  'Class 8': [
    {
      id: 'class-8-science',
      name: 'Science',
      chapters: [
        {
          id: 'c8-sci-ch1',
          title: 'Chapter 1: Synthetic Fibres and Plastics',
          videoTitle: 'Introduction to Synthetic Fibres',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+science+synthetic+fibres+and+plastics',
          pdfTitle: 'Chapter 1 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hesc1=1-18',
        },
        {
          id: 'c8-sci-ch2',
          title: 'Chapter 2: Combustion and Flame',
          videoTitle: 'Understanding Combustion',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+science+combustion+and+flame',
          pdfTitle: 'Chapter 2 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hesc1=2-18',
        },
        {
          id: 'c8-sci-ch3',
          title: 'Chapter 3: Force and Pressure',
          videoTitle: 'Forces and Frictional Effects',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+science+force+and+pressure',
          pdfTitle: 'Chapter 3 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hesc1=3-18',
        },
        {
          id: 'c8-sci-ch4',
          title: 'Chapter 4: Friction',
          videoTitle: 'Frictional Forces in Daily Life',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+science+friction',
          pdfTitle: 'Chapter 4 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hesc1=4-18',
        },
        {
          id: 'c8-sci-ch5',
          title: 'Chapter 5: Sound',
          videoTitle: 'Sound Waves and Vibrations',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+science+sound',
          pdfTitle: 'Chapter 5 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hesc1=5-18',
        },
        {
          id: 'c8-sci-ch6',
          title: 'Chapter 6: Light',
          videoTitle: 'Reflection and Kaleidoscope Symmetrical Patterns',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+science+light',
          pdfTitle: 'Chapter 6 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hesc1=6-18',
        },
      ],
      tests: [
        { id: 'c8-sci-test-1', title: 'Test 1', chapterRange: 'Chapters 1-2', chapterIds: ['c8-sci-ch1', 'c8-sci-ch2'] },
        { id: 'c8-sci-test-2', title: 'Test 2', chapterRange: 'Chapters 3-4', chapterIds: ['c8-sci-ch3', 'c8-sci-ch4'] },
        { id: 'c8-sci-test-3', title: 'Test 3', chapterRange: 'Chapters 5-6', chapterIds: ['c8-sci-ch5', 'c8-sci-ch6'] },
      ],
    },
    {
      id: 'class-8-mathematics',
      name: 'Mathematics',
      chapters: [
        {
          id: 'c8-math-ch2',
          title: 'Chapter 2: Linear Equations in One Variable',
          videoTitle: 'Solving Equations using Algebra Tiles',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+maths+linear+equations+in+one+variable',
          pdfTitle: 'Chapter 2 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hemh1=2-16',
        },
        {
          id: 'c8-math-ch3',
          title: 'Chapter 3: Understanding Quadrilaterals',
          videoTitle: 'Angle Sum Property',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+maths+understanding+quadrilaterals',
          pdfTitle: 'Chapter 3 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hemh1=3-16',
        },
        {
          id: 'c8-math-ch4',
          title: 'Chapter 4: Data Handling',
          videoTitle: 'Probability and Data Representation',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+maths+data+handling',
          pdfTitle: 'Chapter 4 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hemh1=4-16',
        },
        {
          id: 'c8-math-ch8',
          title: 'Chapter 8: Algebraic Expressions and Identities',
          videoTitle: 'Algebraic Identities and Tiles Visualization',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+maths+algebraic+expressions+and+identities',
          pdfTitle: 'Chapter 8 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hemh1=8-16',
        },
        {
          id: 'c8-math-ch9',
          title: 'Chapter 9: Mensuration',
          videoTitle: 'Surface Area Nets Visualization',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+maths+mensuration',
          pdfTitle: 'Chapter 9 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hemh1=9-16',
        },
        {
          id: 'c8-math-ch12',
          title: 'Chapter 12: Factorization',
          videoTitle: 'Dividing Polynomials using Exploding Dots',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+maths+factorization',
          pdfTitle: 'Chapter 12 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hemh1=12-16',
        },
        {
          id: 'c8-math-ch13',
          title: 'Chapter 13: Introduction to Graphs',
          videoTitle: 'Plotting Points and Linear Relations',
          videoUrl: 'https://www.youtube.com/results?search_query=class+8+maths+introduction+to+graphs',
          pdfTitle: 'Chapter 13 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?hemh1=13-16',
        },
      ],
      tests: [
        { id: 'c8-math-test-1', title: 'Test 1', chapterRange: 'Chapters 2-3', chapterIds: ['c8-math-ch2', 'c8-math-ch3'] },
        { id: 'c8-math-test-2', title: 'Test 2', chapterRange: 'Chapters 4-8', chapterIds: ['c8-math-ch4', 'c8-math-ch8'] },
        { id: 'c8-math-test-3', title: 'Test 3', chapterRange: 'Chapters 9-13', chapterIds: ['c8-math-ch9', 'c8-math-ch12', 'c8-math-ch13'] },
      ],
    },
  ],
  'Class 9': [
    {
      id: 'class-9-science',
      name: 'Science',
      chapters: [
        {
          id: 'c9-sci-ch1',
          title: 'Chapter 1: Matter in Our Surroundings',
          videoTitle: 'States of Matter and Sublimation',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+matter+in+our+surroundings',
          pdfTitle: 'Chapter 1 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=1-12',
        },
        {
          id: 'c9-sci-ch2',
          title: 'Chapter 2: Is Matter Around Us Pure',
          videoTitle: 'Mixtures, Solutions and Tyndall Effect',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+is+matter+around+us+pure',
          pdfTitle: 'Chapter 2 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=2-12',
        },
        {
          id: 'c9-sci-ch3',
          title: 'Chapter 3: Atoms and Molecules',
          videoTitle: 'Molecular Formulas and bonding',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+atoms+and+molecules',
          pdfTitle: 'Chapter 3 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=3-12',
        },
        {
          id: 'c9-sci-ch4',
          title: 'Chapter 4: Structure of the Atom',
          videoTitle: 'Valence Electrons and Shell Arrangements',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+structure+of+atom',
          pdfTitle: 'Chapter 4 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=4-12',
        },
        {
          id: 'c9-sci-ch5',
          title: 'Chapter 5: The Fundamental Unit of Life',
          videoTitle: 'Cells and Osmosis processes',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+fundamental+unit+of+life',
          pdfTitle: 'Chapter 5 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=5-12',
        },
        {
          id: 'c9-sci-ch6',
          title: 'Chapter 6: Tissues',
          videoTitle: 'Parenchyma and Sclerenchyma cells',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+tissues',
          pdfTitle: 'Chapter 6 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=6-12',
        },
        {
          id: 'c9-sci-ch7',
          title: 'Chapter 7: Motion',
          videoTitle: 'Centripetal Force and Acceleration',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+motion',
          pdfTitle: 'Chapter 7 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=7-12',
        },
        {
          id: 'c9-sci-ch8',
          title: 'Chapter 8: Force and Laws of Motion',
          videoTitle: 'Newton\'s three Laws of Motion',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+force+and+laws+of+motion',
          pdfTitle: 'Chapter 8 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=8-12',
        },
        {
          id: 'c9-sci-ch9',
          title: 'Chapter 9: Gravitation',
          videoTitle: 'Gravity Acceleration and Free Fall',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+gravitation',
          pdfTitle: 'Chapter 9 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=9-12',
        },
        {
          id: 'c9-sci-ch10',
          title: 'Chapter 10: Work and Energy',
          videoTitle: 'Kinetic and Potential Energy Conservation',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+work+and+energy',
          pdfTitle: 'Chapter 10 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=10-12',
        },
        {
          id: 'c9-sci-ch11',
          title: 'Chapter 11: Sound',
          videoTitle: 'Vibrations, Echoes and Wave propagation',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+sound',
          pdfTitle: 'Chapter 11 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=11-12',
        },
      ],
      tests: [
        { id: 'c9-sci-test-1', title: 'Test 1', chapterRange: 'Chapters 1-4', chapterIds: ['c9-sci-ch1', 'c9-sci-ch2', 'c9-sci-ch3', 'c9-sci-ch4'] },
        { id: 'c9-sci-test-2', title: 'Test 2', chapterRange: 'Chapters 5-8', chapterIds: ['c9-sci-ch5', 'c9-sci-ch6', 'c9-sci-ch7', 'c9-sci-ch8'] },
        { id: 'c9-sci-test-3', title: 'Test 3', chapterRange: 'Chapters 9-11', chapterIds: ['c9-sci-ch9', 'c9-sci-ch10', 'c9-sci-ch11'] },
      ],
    },
    {
      id: 'class-9-mathematics',
      name: 'Mathematics',
      chapters: [
        {
          id: 'c9-math-ch2',
          title: 'Chapter 2: Polynomials',
          videoTitle: 'Polynomial Identites using Algebra Tiles',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+polynomials',
          pdfTitle: 'Chapter 2 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=2-12',
        },
        {
          id: 'c9-math-ch3',
          title: 'Chapter 3: Coordinate Geometry',
          videoTitle: 'Plotting Coordinate Points',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+coordinate+geometry',
          pdfTitle: 'Chapter 3 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=3-12',
        },
        {
          id: 'c9-math-ch6',
          title: 'Chapter 6: Lines and Angles',
          videoTitle: 'Angles Sum Theorem (180 degrees)',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+lines+and+angles',
          pdfTitle: 'Chapter 6 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=6-12',
        },
        {
          id: 'c9-math-ch8',
          title: 'Chapter 8: Quadrilaterals',
          videoTitle: 'Angle Sum of Quadrilaterals (360 degrees)',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+quadrilaterals',
          pdfTitle: 'Chapter 8 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=8-12',
        },
        {
          id: 'c9-math-ch11',
          title: 'Chapter 11: Surface Areas and Volumes',
          videoTitle: 'Surface Area Nets and Volume Formulas',
          videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+surface+areas+and+volumes',
          pdfTitle: 'Chapter 11 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=11-12',
        },
      ],
      tests: [
        { id: 'c9-math-test-1', title: 'Test 1', chapterRange: 'Chapter 2', chapterIds: ['c9-math-ch2'] },
        { id: 'c9-math-test-2', title: 'Test 2', chapterRange: 'Chapters 3-6', chapterIds: ['c9-math-ch3', 'c9-math-ch6'] },
        { id: 'c9-math-test-3', title: 'Test 3', chapterRange: 'Chapters 8-11', chapterIds: ['c9-math-ch8', 'c9-math-ch11'] },
      ],
    },
  ],
  'Class 10': [
    {
      id: 'class-10-science',
      name: 'Science',
      chapters: [
        {
          id: 'c10-sci-ch1',
          title: 'Chapter 1: Chemical Reactions and Equations',
          videoTitle: 'Chemical Indicators and Oxidation',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+chemical+reactions+and+equations',
          pdfTitle: 'Chapter 1 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=1-13',
        },
        {
          id: 'c10-sci-ch2',
          title: 'Chapter 2: Acids, Bases, and Salts',
          videoTitle: 'pH scale, Neutralization and Salts',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+acids+bases+and+salts',
          pdfTitle: 'Chapter 2 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=2-13',
        },
        {
          id: 'c10-sci-ch3',
          title: 'Chapter 3: Metals and Non-Metals',
          videoTitle: 'Reactivity Series and Conductivity',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+metals+and+non+metals',
          pdfTitle: 'Chapter 3 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=3-13',
        },
        {
          id: 'c10-sci-ch4',
          title: 'Chapter 4: Carbon and Its Compounds',
          videoTitle: 'Saponification and Emulsification',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+carbon+and+its+compounds',
          pdfTitle: 'Chapter 4 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=4-13',
        },
        {
          id: 'c10-sci-ch5',
          title: 'Chapter 5: Life Processes',
          videoTitle: 'Human Respiration and Stomata opening',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+life+processes',
          pdfTitle: 'Chapter 5 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=5-13',
        },
        {
          id: 'c10-sci-ch6',
          title: 'Chapter 6: Control and Coordination',
          videoTitle: 'Neurons and Nerve impulses',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+control+and+coordination',
          pdfTitle: 'Chapter 6 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=6-13',
        },
        {
          id: 'c10-sci-ch7',
          title: 'Chapter 7: How Organisms Reproduce',
          videoTitle: 'Flower reproductive parts and Pollination',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+how+organisms+reproduce',
          pdfTitle: 'Chapter 7 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=7-13',
        },
        {
          id: 'c10-sci-ch8',
          title: 'Chapter 8: Heredity and Evolution',
          videoTitle: 'Mendelian Crosses and Homologous organs',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+heredity+and+evolution',
          pdfTitle: 'Chapter 8 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=8-13',
        },
        {
          id: 'c10-sci-ch9',
          title: 'Chapter 9: Light - Reflection and Refraction',
          videoTitle: 'Snell\'s Law and prism refraction',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+light+reflection+and+refraction',
          pdfTitle: 'Chapter 9 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=9-13',
        },
        {
          id: 'c10-sci-ch10',
          title: 'Chapter 10: Electricity',
          videoTitle: 'Resistors, power formulas and current',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+electricity',
          pdfTitle: 'Chapter 10 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=10-13',
        },
        {
          id: 'c10-sci-ch11',
          title: 'Chapter 11: Magnetic Effects of electric current',
          videoTitle: 'Circular Coils, magnetic lines and Electromagnets',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+science+magnetic+effects+of+electric+current',
          pdfTitle: 'Chapter 11 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jesc1=11-13',
        },
      ],
      tests: [
        { id: 'c10-sci-test-1', title: 'Test 1', chapterRange: 'Chapters 1-4', chapterIds: ['c10-sci-ch1', 'c10-sci-ch2', 'c10-sci-ch3', 'c10-sci-ch4'] },
        { id: 'c10-sci-test-2', title: 'Test 2', chapterRange: 'Chapters 5-8', chapterIds: ['c10-sci-ch5', 'c10-sci-ch6', 'c10-sci-ch7', 'c10-sci-ch8'] },
        { id: 'c10-sci-test-3', title: 'Test 3', chapterRange: 'Chapters 9-11', chapterIds: ['c10-sci-ch9', 'c10-sci-ch10', 'c10-sci-ch11'] },
      ],
    },
    {
      id: 'class-10-mathematics',
      name: 'Mathematics',
      chapters: [
        {
          id: 'c10-math-ch4',
          title: 'Chapter 4: Quadratic Equations',
          videoTitle: 'Completing the Square with Algebra Tiles',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+quadratic+equations',
          pdfTitle: 'Chapter 4 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=4-15',
        },
        {
          id: 'c10-math-ch5',
          title: 'Chapter 5: Arithmetic Progressions',
          videoTitle: 'Sum of first n terms formulas',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+arithmetic+progressions',
          pdfTitle: 'Chapter 5 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=5-15',
        },
        {
          id: 'c10-math-ch6',
          title: 'Chapter 6: Triangles',
          videoTitle: 'Basic Proportionality Theorem',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+triangles',
          pdfTitle: 'Chapter 6 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=6-15',
        },
        {
          id: 'c10-math-ch7',
          title: 'Chapter 7: Coordinate Geometry',
          videoTitle: 'Distance Formula derivations',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+coordinate+geometry',
          pdfTitle: 'Chapter 7 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=7-15',
        },
        {
          id: 'c10-math-ch8',
          title: 'Chapter 8: Introduction to Trigonometry',
          videoTitle: 'Sines and Cosines ratios',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+introduction+to+trigonometry',
          pdfTitle: 'Chapter 8 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=8-15',
        },
        {
          id: 'c10-math-ch9',
          title: 'Chapter 9: Some Applications of Trigonometry',
          videoTitle: 'Heights and distances clinometer',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+some+applications+of+trigonometry',
          pdfTitle: 'Chapter 9 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=9-15',
        },
        {
          id: 'c10-math-ch10',
          title: 'Chapter 10: Circles',
          videoTitle: 'Area of circle calculations',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+circles',
          pdfTitle: 'Chapter 10 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=10-15',
        },
        {
          id: 'c10-math-ch14',
          title: 'Chapter 14: Probability',
          videoTitle: 'Law of Large Numbers and Probability',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+probability',
          pdfTitle: 'Chapter 14 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=13-15',
        },
        {
          id: 'c10-math-ch15',
          title: 'Chapter 15: Constructions',
          videoTitle: 'Line segment divisions',
          videoUrl: 'https://www.youtube.com/results?search_query=class+10+maths+constructions',
          pdfTitle: 'Chapter 15 Notes',
          pdfUrl: 'https://ncert.nic.in/textbook.php?jemh2=11-15',
        },
      ],
      tests: [
        { id: 'c10-math-test-1', title: 'Test 1', chapterRange: 'Chapters 4-6', chapterIds: ['c10-math-ch4', 'c10-math-ch5', 'c10-math-ch6'] },
        { id: 'c10-math-test-2', title: 'Test 2', chapterRange: 'Chapters 7-9', chapterIds: ['c10-math-ch7', 'c10-math-ch8', 'c10-math-ch9'] },
        { id: 'c10-math-test-3', title: 'Test 3', chapterRange: 'Chapters 10-15', chapterIds: ['c10-math-ch10', 'c10-math-ch14', 'c10-math-ch15'] },
      ],
    },
  ],
}

// Generate exactly 50 unique questions per test to fulfill the 50-100 MCQ requirement per test.
const generateQuestionPoolForTest = (testId: string): Omit<QuizQuestion, 'id'>[] => {
  const pool: Omit<QuizQuestion, 'id'>[] = []

  if (testId === 'c8-sci-test-1') {
    // Chapters 1-2 Synthetic Fibres & Combustion
    for (let index = 1; index <= 50; index += 1) {
      if (index % 2 === 1) {
        pool.push({
          prompt: `[ fibres-plastics-q${index} ] Synthetic fibres dry faster than cotton because they:`,
          options: ['Absorb less water', 'Are natural materials', 'Have thick fibers', 'Store more water'],
          answer: 'Absorb less water',
        })
      } else {
        pool.push({
          prompt: `[ combustion-flame-q${index} ] Magnesium burns in air with a bright white flame to form:`,
          options: ['Magnesium Oxide', 'Magnesium Carbonate', 'Carbon Monoxide', 'Magnesium Chloride'],
          answer: 'Magnesium Oxide',
        })
      }
    }
  } else if (testId === 'c8-sci-test-2') {
    // Chapters 3-4 Force & Friction
    for (let index = 1; index <= 50; index += 1) {
      if (index % 2 === 1) {
        pool.push({
          prompt: `[ force-pressure-q${index} ] What happens to water pressure as the depth increases?`,
          options: ['Pressure increases', 'Pressure decreases', 'Pressure remains constant', 'Flow rate drops to zero'],
          answer: 'Pressure increases',
        })
      } else {
        pool.push({
          prompt: `[ friction-q${index} ] What mechanical components are used in machines to reduce rotating friction?`,
          options: ['Ball bearings', 'Sandpaper sheets', 'Heavy weights', 'Plastic nets'],
          answer: 'Ball bearings',
        })
      }
    }
  } else if (testId === 'c8-sci-test-3') {
    // Chapters 5-6 Sound & Light
    for (let index = 1; index <= 50; index += 1) {
      if (index % 2 === 1) {
        pool.push({
          prompt: `[ sound-q${index} ] Striking a tuning fork causes the prongs to vibrate, which produces:`,
          options: ['Sound waves', 'Electromagnetic waves', 'Light reflection', 'Frictional resistance'],
          answer: 'Sound waves',
        })
      } else {
        pool.push({
          prompt: `[ light-q${index} ] An optical toy that creates symmetrical patterns using multiple reflections is a:`,
          options: ['Kaleidoscope', 'Clinometer', 'Electroscope', 'Geoboard'],
          answer: 'Kaleidoscope',
        })
      }
    }
  } else if (testId === 'c8-math-test-1') {
    // Chapters 2-3 Linear Equations & Quadrilaterals
    for (let index = 1; index <= 50; index += 1) {
      if (index % 2 === 1) {
        pool.push({
          prompt: `[ linear-eq-q${index} ] To solve a linear equation, what must be done to keep both sides balanced?`,
          options: ['Add or subtract equal amounts on both sides', 'Multiply only the left side', 'Set x to zero', 'Add different numbers to each side'],
          answer: 'Add or subtract equal amounts on both sides',
        })
      } else {
        pool.push({
          prompt: `[ quadrilaterals-q${index} ] The sum of interior angles in any quadrilateral is:`,
          options: ['360 degrees', '180 degrees', '90 degrees', '540 degrees'],
          answer: '360 degrees',
        })
      }
    }
  } else if (testId === 'c8-math-test-2') {
    // Chapters 4-8 Data Handling & Algebraic Expressions
    for (let index = 1; index <= 50; index += 1) {
      if (index % 2 === 1) {
        pool.push({
          prompt: `[ data-handling-q${index} ] A probability distribution shows the likelihood of:`,
          options: ['Independent outcomes', 'Fixed single values', 'Incorrect equations', 'None of the above'],
          answer: 'Independent outcomes',
        })
      } else {
        pool.push({
          prompt: `[ algebraic-q${index} ] Which identity represents the difference of squares formula?`,
          options: ['a² - b² = (a + b)(a - b)', '(a + b)² = a² + 2ab + b²', '(a - b)² = a² - 2ab + b²', 'a² + b² = (a + b)²'],
          answer: 'a² - b² = (a + b)(a - b)',
        })
      }
    }
  } else if (testId === 'c8-math-test-3') {
    // Chapters 9-13 Mensuration, Factorization & Graphs
    for (let index = 1; index <= 50; index += 1) {
      if (index % 3 === 1) {
        pool.push({
          prompt: `[ mensuration-q${index} ] What represent flat 2D layouts that can fold to form 3D solids?`,
          options: ['Nets', 'Graphs', 'Algebra tiles', 'Clinometers'],
          answer: 'Nets',
        })
      } else if (index % 3 === 2) {
        pool.push({
          prompt: `[ factorization-q${index} ] What technique can be used to divide polynomials visually?`,
          options: ['Algebra tiles and Exploding dots', 'Rulers and compasses', 'Prisms and mirrors', 'None of the above'],
          answer: 'Algebra tiles and Exploding dots',
        })
      } else {
        pool.push({
          prompt: `[ graphs-q${index} ] To plot points representing linear relationships, we use:`,
          options: ['Coordinate geometry grids', 'Venn diagrams', 'Pie charts', 'Bar graphs only'],
          answer: 'Coordinate geometry grids',
        })
      }
    }
  } else if (testId === 'c9-sci-test-1') {
    // Chapters 1-4 Matter, Solutions, Atoms, Atom Structure
    for (let index = 1; index <= 50; index += 1) {
      if (index % 4 === 1) {
        pool.push({
          prompt: `[ matter-q${index} ] Sublimation refers to the direct transition of a substance from:`,
          options: ['Solid to gas', 'Liquid to gas', 'Solid to liquid', 'Gas to liquid'],
          answer: 'Solid to gas',
        })
      } else if (index % 4 === 2) {
        pool.push({
          prompt: `[ pure-matter-q${index} ] Colloidal solutions scatter light because of the:`,
          options: ['Tyndall effect', 'Sublimation rate', 'Density gradient', 'Free electron transfer'],
          answer: 'Tyndall effect',
        })
      } else if (index % 4 === 3) {
        pool.push({
          prompt: `[ atoms-q${index} ] What is the molecular formula of methane?`,
          options: ['CH4', 'H2O', 'CO2', 'NaCl'],
          answer: 'CH4',
        })
      } else {
        pool.push({
          prompt: `[ atom-struct-q${index} ] What determine an atom's chemical properties?`,
          options: ['Valence electrons', 'Total mass number', 'Inner shell electrons', 'Neutrons in the nucleus'],
          answer: 'Valence electrons',
        })
      }
    }
  } else if (testId === 'c9-sci-test-2') {
    // Chapters 5-8 Unit of Life, Tissues, Motion, Laws of Motion
    for (let index = 1; index <= 50; index += 1) {
      if (index % 4 === 1) {
        pool.push({
          prompt: `[ unit-of-life-q${index} ] Osmosis is the movement of water through a membrane due to a:`,
          options: ['Concentration gradient', 'Electric potential', 'Temperature variance', 'None of the above'],
          answer: 'Concentration gradient',
        })
      } else if (index % 4 === 2) {
        pool.push({
          prompt: `[ tissues-q${index} ] What cells have thin walls and large vacuoles for storage in plants?`,
          options: ['Parenchyma cells', 'Sclerenchyma cells', 'Striated fibers', 'Nerve cells'],
          answer: 'Parenchyma cells',
        })
      } else if (index % 4 === 3) {
        pool.push({
          prompt: `[ motion-q${index} ] What force pulls a ball towards the center of a circular path?`,
          options: ['Centripetal force', 'Centrifugal force', 'Gravitational pull', 'Frictional force'],
          answer: 'Centripetal force',
        })
      } else {
        pool.push({
          prompt: `[ force-laws-q${index} ] Newton's Second Law of Motion is represented by the formula:`,
          options: ['F = ma', 'F = mg', 'W = Fd', 'p = mv'],
          answer: 'F = ma',
        })
      }
    }
  } else if (testId === 'c9-sci-test-3') {
    // Chapters 9-11 Gravitation, Work & Energy, Sound
    for (let index = 1; index <= 50; index += 1) {
      if (index % 3 === 1) {
        pool.push({
          prompt: `[ gravitation-q${index} ] While heavier objects experience greater gravitational force, they also have:`,
          options: ['More inertia', 'Less density', 'Free valence electrons', 'Less friction'],
          answer: 'More inertia',
        })
      } else if (index % 3 === 2) {
        pool.push({
          prompt: `[ work-energy-q${index} ] The Law of Conservation of Energy states that energy can:`,
          options: ['Only be converted from one form to another', 'Be created from nothing', 'Be completely destroyed', 'Never transform into kinetic form'],
          answer: 'Only be converted from one form to another',
        })
      } else {
        pool.push({
          prompt: `[ sound-waves-q${index} ] Sound waves cannot travel through:`,
          options: ['A vacuum', 'Solids', 'Liquids', 'Gases'],
          answer: 'A vacuum',
        })
      }
    }
  } else if (testId === 'c9-math-test-1') {
    // Chapter 2 Polynomials
    for (let index = 1; index <= 50; index += 1) {
      pool.push({
        prompt: `[ polynomials-q${index} ] Visualizing the identity (x + y + z)² = x² + y² + z² + 2xy + 2yz + 2xz is done using:`,
        options: ['Algebra tiles and area grids', 'Clinometers', 'Rulers and compasses', 'Normal bell curves'],
        answer: 'Algebra tiles and area grids',
      })
    }
  } else if (testId === 'c9-math-test-2') {
    // Chapters 3-6 Coordinate Geometry & Lines/Angles
    for (let index = 1; index <= 50; index += 1) {
      if (index % 2 === 1) {
        pool.push({
          prompt: `[ coordinate-q${index} ] Plotting points on coordinate grids is used to visualize:`,
          options: ['Linear relationships', 'Probability distributions', 'Symmetrical reflections', 'None of the above'],
          answer: 'Linear relationships',
        })
      } else {
        pool.push({
          prompt: `[ lines-angles-q${index} ] The sum of angles in any triangle is always:`,
          options: ['180 degrees', '90 degrees', '360 degrees', '270 degrees'],
          answer: '180 degrees',
        })
      }
    }
  } else if (testId === 'c9-math-test-3') {
    // Chapters 8-11 Quadrilaterals & Surface Areas/Volumes
    for (let index = 1; index <= 50; index += 1) {
      if (index % 2 === 1) {
        pool.push({
          prompt: `[ quadrilaterals-sum-q${index} ] The sum of interior angles in any quadrilateral is:`,
          options: ['360 degrees', '180 degrees', '540 degrees', '720 degrees'],
          answer: '360 degrees',
        })
      } else {
        pool.push({
          prompt: `[ volume-ratio-q${index} ] The volume of a cylinder with the same base and height is:`,
          options: ['Three times the volume of the cone', 'One-third of the cone volume', 'Equal to the cone volume', 'Double the cone volume'],
          answer: 'Three times the volume of the cone',
        })
      }
    }
  } else if (testId === 'c10-sci-test-1') {
    // Chapters 1-4 Reactions, Acids, Metals, Carbon
    for (let index = 1; index <= 50; index += 1) {
      if (index % 4 === 1) {
        pool.push({
          prompt: `[ reaction-indicators-q${index} ] Which of the following indicates that a chemical reaction has occurred?`,
          options: ['Precipitate formation or gas evolution', 'Physical mixing without new substances', 'Pure water evaporating', 'None of the above'],
          answer: 'Precipitate formation or gas evolution',
        })
      } else if (index % 4 === 2) {
        pool.push({
          prompt: `[ acids-bases-q${index} ] What gas is released when baking soda reacts with acids?`,
          options: ['Carbon dioxide', 'Hydrogen gas', 'Chlorine gas', 'Nitrogen gas'],
          answer: 'Carbon dioxide',
        })
      } else if (index % 4 === 3) {
        pool.push({
          prompt: `[ metals-conductivity-q${index} ] Metals conduct electricity due to the presence of:`,
          options: ['Free electrons', 'Colloidal molecules', 'Precipitates', 'Neutral atoms'],
          answer: 'Free electrons',
        })
      } else {
        pool.push({
          prompt: `[ saponification-q${index} ] The reaction between oil and a base to form soap is called:`,
          options: ['Saponification', 'Neutralization', 'Precipitation', 'Sublimation'],
          answer: 'Saponification',
        })
      }
    }
  } else if (testId === 'c10-sci-test-2') {
    // Chapters 5-8 Life Processes, Control, Reproduction, Heredity
    for (let index = 1; index <= 50; index += 1) {
      if (index % 4 === 1) {
        pool.push({
          prompt: `[ respiration-q${index} ] Lime water turns milky when reacting with carbon dioxide, forming:`,
          options: ['Calcium carbonate', 'Sodium chloride', 'Magnesium oxide', 'Lead iodide'],
          answer: 'Calcium carbonate',
        })
      } else if (index % 4 === 2) {
        pool.push({
          prompt: `[ control-coord-q${index} ] What cells transmit electrical signals in the nervous system?`,
          options: ['Neurons', 'Guard cells', 'Parenchyma cells', 'Sclerenchyma cells'],
          answer: 'Neurons',
        })
      } else if (index % 4 === 3) {
        pool.push({
          prompt: `[ reproduction-flower-q${index} ] Flowers contain male (stamen) and female reproductive organs, named:`,
          options: ['Pistil', 'Cochlea', 'Axon', 'Prism'],
          answer: 'Pistil',
        })
      } else {
        pool.push({
          prompt: `[ heredity-ratio-q${index} ] The phenotypic ratio observed in a Mendelian monohybrid cross is:`,
          options: ['3:1', '9:3:3:1', '1:1', '1:2:1'],
          answer: '3:1',
        })
      }
    }
  } else if (testId === 'c10-sci-test-3') {
    // Chapters 9-11 Light, Electricity, Magnetic Effects
    for (let index = 1; index <= 50; index += 1) {
      if (index % 3 === 1) {
        pool.push({
          prompt: `[ light-laws-q${index} ] According to the Second Law of Reflection, the angle of incidence is:`,
          options: ['Equal to the angle of reflection', 'Double the angle of reflection', 'Half the angle of reflection', 'Always 90 degrees'],
          answer: 'Equal to the angle of reflection',
        })
      } else if (index % 3 === 2) {
        pool.push({
          prompt: `[ electricity-resistor-q${index} ] What material has higher resistance than copper?`,
          options: ['Nichrome wire', 'Silver foil', 'Gold plate', 'Aluminum sheet'],
          answer: 'Nichrome wire',
        })
      } else {
        pool.push({
          prompt: `[ magnetic-electromagnet-q${index} ] Electromagnets behave as magnets:`,
          options: ['Only when electric current flows through the coil', 'Permanently without current', 'When submerged in water', 'Only at absolute zero'],
          answer: 'Only when electric current flows through the coil',
        })
      }
    }
  } else if (testId === 'c10-math-test-1') {
    // Chapters 4-6 Quadratic, AP, Triangles
    for (let index = 1; index <= 50; index += 1) {
      if (index % 3 === 1) {
        pool.push({
          prompt: `[ quadratic-tiles-q${index} ] What can be used to complete the square visually?`,
          options: ['Algebra tiles', 'Clinometers', 'Geoboards', 'Exploding dots'],
          answer: 'Algebra tiles',
        })
      } else if (index % 3 === 2) {
        pool.push({
          prompt: `[ ap-formula-q${index} ] The sum of the first (n) natural numbers is given by:`,
          options: ['[n(n+1)]/2', 'n(n+1)', 'n²', '2n + 1'],
          answer: '[n(n+1)]/2',
        })
      } else {
        pool.push({
          prompt: `[ triangles-proportion-q${index} ] A line parallel to one side of a triangle divides other two sides in:`,
          options: ['Equal proportion', 'Different ratios', 'A ratio of 1:2', 'Perpendicular lines'],
          answer: 'Equal proportion',
        })
      }
    }
  } else if (testId === 'c10-math-test-2') {
    // Chapters 7-9 Coordinate Geometry, Intro to Trig, Trig Applications
    for (let index = 1; index <= 50; index += 1) {
      if (index % 3 === 1) {
        pool.push({
          prompt: `[ coordinate-dist-q${index} ] What hands-on tools derive the distance formula?`,
          options: ['Geoboard and rubber bands', 'Prisms and mirrors', 'Clinometers', 'Algebra tiles'],
          answer: 'Geoboard and rubber bands',
        })
      } else if (index % 3 === 2) {
        pool.push({
          prompt: `[ trig-complementary-q${index} ] The sine of an angle is equal to the cosine of its:`,
          options: ['Complementary angle', 'Supplementary angle', 'Opposite angle', 'Double angle'],
          answer: 'Complementary angle',
        })
      } else {
        pool.push({
          prompt: `[ trig-clinometer-q${index} ] What device helps measure heights using trigonometry?`,
          options: ['Clinometer', 'Geoboard', 'Kaleidoscope', 'Electroscope'],
          answer: 'Clinometer',
        })
      }
    }
  } else if (testId === 'c10-math-test-3') {
    // Chapters 10-15 Circles, Probability, Constructions
    for (let index = 1; index <= 50; index += 1) {
      if (index % 3 === 1) {
        pool.push({
          prompt: `[ circle-area-q${index} ] The area of a circle is calculated as:`,
          options: ['πr²', '2πr', 'πr', '2πr²'],
          answer: 'πr²',
        })
      } else if (index % 3 === 2) {
        pool.push({
          prompt: `[ probability-lln-q${index} ] According to the Law of Large Numbers, experimental probability:`,
          options: ['Approaches theoretical probability', 'Becomes zero', 'Always matches exactly', 'Differs with more trials'],
          answer: 'Approaches theoretical probability',
        })
      } else {
        pool.push({
          prompt: `[ constructions-division-q${index} ] Division of a line segment is performed using:`,
          options: ['Similar triangles', 'Prisms', 'Symmetrical reflections', 'Exploding dots'],
          answer: 'Similar triangles',
        })
      }
    }
  }

  return pool
}

// Populate the global question bank registry.
export const questionBank: Record<string, Omit<QuizQuestion, 'id'>[]> = {}

const testIds = [
  'c8-sci-test-1', 'c8-sci-test-2', 'c8-sci-test-3',
  'c8-math-test-1', 'c8-math-test-2', 'c8-math-test-3',
  'c9-sci-test-1', 'c9-sci-test-2', 'c9-sci-test-3',
  'c9-math-test-1', 'c9-math-test-2', 'c9-math-test-3',
  'c10-sci-test-1', 'c10-sci-test-2', 'c10-sci-test-3',
  'c10-math-test-1', 'c10-math-test-2', 'c10-math-test-3',
]

testIds.forEach((id) => {
  questionBank[id] = generateQuestionPoolForTest(id)
})
