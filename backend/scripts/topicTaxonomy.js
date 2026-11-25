// Keyword taxonomy for JMI/AMU entrance papers. Each topic lists regex
// patterns with a weight (4 = decisive, 3 = nearly decisive, 2 = strong hint, 1 = weak hint).
// A pattern counts once per question however often it matches.
//
// `subject` on a stored Topic is the family name below (e.g. "Mathematics").

const p = (source, weight) => ({ re: new RegExp(source, 'i'), weight });

export const TAXONOMY = {
  Mathematics: {
    Algebra: [
      p('quadratic', 3), p('polynomial', 3), p('roots? of the equation', 3), p('progression|\\ba\\.p\\.|\\bg\\.p\\.', 3),
      p('binomial', 3), p('logarithm', 2), p('\\blog\\b', 1), p('inequalit', 2), p('linear equation', 3),
      p('complex number|\\biota\\b', 3), p('permutation|combination|\\bnpr\\b|\\bncr\\b', 2), p('value of x\\b|solve for x', 1),
      p('x\\^2|x²|\\bx2\\b', 1),
    ],
    Trigonometry: [
      p('\\b(sin|cos|tan|cot|sec|cosec)\\b', 3), p('trigonometr', 3), p('angle of (elevation|depression)', 3),
      p('radian', 2), p('heights? and distances?', 3),
    ],
    Calculus: [
      // Weight 4: "the derivative of sin x" is calculus even though it names a trig function
      p('derivative|differentiat', 4), p('integra(l|te|tion)|∫', 4), p('\\blim\\b|\\blimit\\b', 2), p('dy\\s*/\\s*dx', 3),
      p('maxima|minima|maximum value|minimum value', 2), p('continuous|continuity', 2), p('differential equation', 3),
      p('rate of change', 2), p('area under', 2),
    ],
    'Coordinate Geometry': [
      p('straight line', 3), p('\\bslope\\b', 2), p('parabola|ellipse|hyperbola', 3), p('coordinates?\\b', 3),
      p('[xy]-axis', 2), p('mid-?point|distance between the points', 3), p('\\blocus\\b', 3), p('equation of (the )?(line|circle)', 3),
      p('intercept', 2),
    ],
    'Probability & Statistics': [
      p('probabilit', 3), p('\\bmedian\\b', 3), p('\\bmean\\b', 2), p('\\bmode\\b', 1), p('standard deviation|variance', 3),
      p('\\b(dice|die|coins?|pack of cards|deck)\\b', 2), p('at random|randomly', 2),
    ],
    'Sets & Relations': [
      p('subset', 3), p('power set', 3), p('\\bunion\\b|\\bintersection\\b', 2), p('[∪∩∈]', 3), p('\\brelations?\\b', 2),
      p('reflexive|symmetric|transitive|equivalence relation', 3), p('one-one|onto|bijective|injective|surjective', 3),
      p('\\bdomain\\b|\\brange\\b', 1),
    ],
    'Matrices & Determinants': [
      p('matri(x|ces)', 3), p('determinant', 3), p('adjoint', 3), p('transpose', 3), p('rank of', 2), p('eigen', 3),
    ],
    'Number System': [
      p('\\bprimes?\\b|prime number', 2), p('divisib', 3), p('\\b(hcf|lcm|gcd|h\\.c\\.f|l\\.c\\.m)\\b', 3), p('remainder', 2),
      p('natural numbers?|whole numbers?|integers?|irrational|rational number', 2), p('unit(s)? digit', 3), p('\\bfactors?\\b', 1),
    ],
    Mensuration: [
      p('\\barea of\\b', 2), p('\\bvolume\\b', 3), p('surface area', 3), p('perimeter|circumference', 3),
      p('cylinder|cone|sphere|hemisphere|cuboid|\\bcube\\b', 3), p('radius|diameter', 2), p('triangle|rectangle|square|rhombus|trapezium', 1),
    ],
  },

  'Computer Science': {
    'Programming in C': [
      p('printf|scanf', 3), p('#include', 3), p('\\bint\\s+main', 3), p('pointer', 2), p('\\bc (language|program)|in c\\b', 3),
      p('\\b(for|while|do-while) loop|\\bloop\\b', 2), p('\\bstruct\\b|\\bunion\\b', 1), p('malloc|calloc|free\\(', 3),
      p('output of the following', 2), p('\\barray\\b', 1), p('compiler|syntax', 1),
    ],
    'Data Structures': [
      p('\\bstack\\b', 3), p('\\bqueue\\b', 3), p('linked list', 3), p('binary (search )?tree|\\btree\\b', 2), p('\\b(bfs|dfs)\\b|traversal', 3),
      p('(bubble|quick|merge|heap|insertion|selection) sort|sorting', 3), p('hash(ing| table)', 3), p('time complexity|big[- ]o|o\\(n', 3),
      p('binary search', 3), p('infix|postfix|prefix', 3), p('data structure', 3),
    ],
    DBMS: [
      p('\\bsql\\b', 3), p('database|dbms', 3), p('normal form|normali[sz]ation|\\b(1nf|2nf|3nf|bcnf)\\b', 3),
      p('primary key|foreign key|candidate key', 3), p('relational', 2), p('\\bquery\\b', 2), p('\\btuples?\\b', 2),
      p('\\ber diagram|\\bentit(y|ies)\\b', 2), p('select .* from', 3),
    ],
    'Operating Systems': [
      p('operating system', 3), p('\\bprocess(es)?\\b|\\bthreads?\\b', 2), p('deadlock', 3), p('scheduling|round robin|\\bfcfs\\b|\\bsjf\\b', 3),
      p('paging|page fault|virtual memory|segmentation', 3), p('semaphore|mutex|critical section', 3), p('\\bkernel\\b', 3),
    ],
    'Computer Networks': [
      p('\\bosi\\b|\\btcp\\b|\\budp\\b|ip address', 3), p('protocol', 2), p('\\bnetwork', 2), p('router|\\bswitch\\b|\\bhub\\b|gateway', 2),
      p('\\b(lan|wan|man)\\b', 2), p('\\b(http|ftp|smtp|dns)\\b', 3), p('bandwidth', 2), p('topology', 3), p('ethernet', 3),
    ],
    'Digital Logic': [
      p('boolean', 3), p('logic gate|\\bnand\\b|\\bnor\\b|\\bxor\\b|and gate|or gate', 3), p('flip[- ]flop', 3),
      p('multiplexer|decoder|encoder', 3), p('binary|octal|hexadecimal', 3), p('k-map|karnaugh', 3), p("[12]'s complement", 3),
    ],
    'Computer Fundamentals': [
      p('\\bcomputers?\\b', 1), p('\\b(ram|rom)\\b', 3), p('\\bmemory\\b', 1), p('input device|output device', 3), p('\\b(cpu|alu)\\b', 2),
      p('\\b(bit|byte|kilobyte|megabyte|gigabyte|terabyte)s?\\b', 2), p('software|hardware', 2), p('keyboard|mouse|printer|monitor', 2),
      p('ms[- ]?(word|excel|powerpoint)|spreadsheet', 3), p('internet|e-?mail|\\bwww\\b|web browser', 2), p('shortcut key|\\bctrl\\b', 3),
    ],
  },

  English: {
    Grammar: [
      p('\\btenses?\\b', 3), p('preposition', 3), p('\\barticles?\\b', 2), p('(active|passive) voice', 3),
      p('(direct|indirect|reported) speech|narration', 3), p('spot the error|error in|incorrect part', 2),
      p('conjunction|adverb|adjective|pronoun|\\bnoun\\b|\\bverb\\b', 2), p('grammatical', 3), p('fill in the blank', 1),
    ],
    Vocabulary: [
      p('synonym', 3), p('antonym', 3), p('(opposite|similar|same) (in )?meaning', 3), p('\\bidiom|phrase', 3),
      p('one[- ]word substitut', 3), p('meaning of the word', 3), p('correctly spelt|spelling', 3),
    ],
    Comprehension: [
      p('passage', 3), p('according to the (author|passage|writer)', 3), p('read the following', 3), p('\\bthe (author|writer)\\b', 2),
      p('tone of', 2), p('title (for|of) the passage', 3),
    ],
  },

  Reasoning: {
    Series: [p('next (term|number|letter)', 3), p('\\bseries\\b', 3), p('missing (number|term|letter)', 3), p('\\bsequence\\b', 2)],
    Analogy: [p('analog', 3), p('::', 3), p('\\bis to\\b', 2), p('is related to', 1)],
    'Coding-Decoding': [p('coded as|is written as|code language|in a certain code', 3), p('\\bcoded?\\b', 1)],
    'Blood Relations': [
      p('how is .* related', 3), p('blood relation', 3),
      p("\\b(father|mother|brother|sister|son|daughter|uncle|aunt|grandfather|grandmother|nephew|niece|husband|wife)('s)?\\b", 1),
    ],
    'Direction Sense': [
      p('\\b(north|south|east|west)\\b', 2), p('turn(s|ed)? (left|right)|(left|right) turn', 3), p('\\bdirection\\b', 2), p('\\bfacing\\b', 2),
    ],
    Syllogism: [p('syllogism', 3), p('\\b(all|some|no) \\w+ (are|is)\\b', 2), p('conclusions?', 2), p('\\bfollows?\\b', 1), p('statements?', 1)],
  },

  'General Awareness': {
    History: [
      p('mughal|british rule|east india company|dynasty|empire', 3), p('\\b(war|battle|revolt|mutiny)\\b', 2), p('independence|freedom (struggle|fighter)', 2),
      p('gandhi|nehru|subhas|bhagat singh|tilak', 2), p('harappa|indus valley|maurya|gupta|akbar|ashoka|babur|aurangzeb|chola', 3),
      p('ancient|medieval', 2),
    ],
    Geography: [
      p('\\brivers?\\b', 2), p('mountain|peak|hills?\\b', 2), p('\\bcapital of\\b', 2), p('ocean|continent|desert|plateau|peninsula', 2),
      p('climate|monsoon|\\bsoil', 2), p('latitude|longitude|tropic of', 3), p('national park|wildlife sanctuary', 3),
    ],
    Polity: [
      p('constitution', 3), p('\\barticle \\d+', 3), p('parliament|lok sabha|rajya sabha', 3), p('president|prime minister|governor|chief minister', 2),
      p('amendment', 3), p('fundamental (right|dut)', 3), p('supreme court|high court', 2), p('election commission|directive principle', 3),
    ],
    Economy: [
      p('\\bgdp\\b|inflation|recession', 3), p('\\brbi\\b|reserve bank', 3), p('\\bbanks?\\b|banking', 2), p('budget|\\btax\\b|\\bgst\\b', 2),
      p('fiscal|monetary', 3), p('econom', 2), p('five[- ]year plan|niti aayog|planning commission', 3), p('stock exchange|sensex|nifty', 3),
    ],
    'Current Affairs': [
      p('\\brecently\\b', 3), p('\\bin 20[12]\\d\\b', 2), p('\\b(award|awarded|prize)\\b', 2), p('olympic|world cup|commonwealth games', 3),
      p('summit|appointed|launched|inaugurated', 2),
    ],
    'Islamic Studies & Jamia': [
      p('jamia|millia', 3), p('zakir husain|hakim ajmal khan|mohammad ali jauhar|maulana|mukhtar ahmad ansari', 3),
      p('aligarh|sir syed', 3), p("qur'?an|prophet|hijri|islam|mosque|hajj|ramadan|caliph", 3), p('\\bamu\\b', 2),
    ],
  },

  Science: {
    Physics: [
      p('velocity|acceleration|momentum|\\bforce\\b|newton', 2), p('gravit', 2), p('\\benergy\\b|work done|\\bpower\\b', 1),
      p('electric current|voltage|resistance|\\bohm', 3), p('magnet', 2), p('\\blens\\b|mirror|refraction|reflection', 3),
      p('\\bwaves?\\b|frequency|\\bsound\\b', 2), p('\\bheat\\b|temperature|pressure', 1),
    ],
    Chemistry: [
      p('\\batoms?\\b|molecule|\\belement\\b|compound', 2), p('\\bacids?\\b|\\bbases?\\b|\\bsalts?\\b|\\bph\\b', 2), p('chemical|reaction', 2),
      p('oxidation|reduction|valency|periodic table', 3), p('electron|proton|neutron', 2), p('\\bmoles?\\b|molar', 2), p('organic|hydrocarbon', 3),
    ],
    Biology: [
      p('\\bcells?\\b|tissue|\\borgans?\\b', 2), p('photosynthesis|chlorophyll', 3), p('\\bblood\\b|\\bheart\\b|kidney|liver', 2),
      p('enzyme|vitamin|protein|hormone', 3), p('\\bdna\\b|\\bgenes?\\b|chromosome', 3), p('bacteria|\\bvirus|disease|infection', 2),
      p('digestion|respiration|excretion', 3), p('\\bplants?\\b|\\banimals?\\b', 1),
    ],
  },

  'Teaching Aptitude': {
    'Teaching & Pedagogy': [
      p('\\bteach(er|ing)\\b', 2), p('pedagog', 3), p('classroom', 2), p('learners?\\b', 2), p('curriculum', 3), p('lesson plan', 3),
      p('\\b(evaluation|assessment)\\b|\\bcce\\b', 2),
    ],
    'Educational Psychology': [
      p('piaget|vygotsky|skinner|pavlov|thorndike|bruner|maslow|erikson|kohlberg|freud', 3), p('learning theor|conditioning', 3),
      p('motivation|intelligence|personality', 2), p('child development|cognitive', 2),
    ],
    'Educational Policy': [
      p('\\bnep\\b|national education policy', 3), p('kothari|mudaliar|education commission', 3), p('right to education|\\brte\\b', 3),
      p('\\b(ncert|ncte|ugc|scert)\\b', 3),
    ],
  },

  'Legal Aptitude': {
    'Legal Reasoning': [
      p('\\bprinciples?:|\\bfacts?:', 3), p('plaintiff|defendant|accused', 3), p('liab(le|ility)|negligen|damages', 3),
      p('\\btort\\b|trespass|nuisance', 3), p('contract|offer|acceptance|consideration', 2), p('\\bcrim(e|inal)\\b', 2),
    ],
    'Constitutional Law': [
      p('constitution', 2), p('writ|habeas corpus|mandamus|certiorari|quo warranto', 3), p('judicial review|preamble', 3),
      p('fundamental rights', 2), p('\\barticle \\d+', 2),
    ],
    'Legal Terms & Maxims': [
      p('\\bmaxim\\b|latin', 3),
      p('res judicata|ab initio|bona fide|ultra vires|suo motu|de facto|de jure|ipso facto|mens rea|actus reus|amicus curiae|sub judice|caveat', 3),
      p('affidavit|legal term', 3),
    ],
  },
};

// The paper a question comes from makes some families more likely.
export const FAMILY_BOOSTS = [
  { re: /\b(mca|bca|computer|b\.?\s?tech|m\.?\s?tech|polytechnic|diploma|engineering)\b/i, families: { Mathematics: 1.3, 'Computer Science': 1.3 } },
  { re: /\b(b\.?\s?ed|m\.?\s?ed)\b/i, families: { 'Teaching Aptitude': 1.5 } },
  { re: /\b(llb|ll\.b|law)\b/i, families: { 'Legal Aptitude': 1.5 } },
  { re: /\b(class\s*\d+|school)\b/i, families: { Mathematics: 1.2, Science: 1.2, English: 1.2 } },
  { re: /\b(mba|bba|b\.?\s?com|commerce)\b/i, families: { Reasoning: 1.2, 'General Awareness': 1.2, English: 1.1 } },
];
