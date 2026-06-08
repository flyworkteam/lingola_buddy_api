/**
 * English curriculum — CEFR A1–C2 (teach English only).
 * Counts: A1/A2 ×8, B1/B2 ×10, C1/C2 ×12.
 */

function buildLesson(cefrLevel, sortOrder, title, emoji, subtitle, scenario, goals, greetingOpener) {
  const id = `${cefrLevel.toLowerCase()}_${String(sortOrder).padStart(2, '0')}`;
  const goalsJson = JSON.stringify(goals);
  const tutorPrompt =
    `ACTIVE ENGLISH LESSON (${cefrLevel}): "${title}"\n` +
    `Scenario: ${scenario}\n` +
    `Learning goals: ${goals.join('; ')}\n\n` +
    `RULES:\n` +
    `- You are an English tutor on a live call. Speak ONLY in English.\n` +
    `- Keep language at CEFR ${cefrLevel} — short, clear sentences for lower levels; richer vocabulary for higher levels.\n` +
    `- Stay inside this lesson scenario. Gently redirect off-topic chat back to the lesson.\n` +
    `- Use role-play, questions, and micro-corrections. Praise effort; correct 1–2 key mistakes per turn, not every error.\n` +
    `- Encourage the learner to speak more than you. Ask follow-up questions.\n` +
    `- Do not lecture at length; keep turns conversational (2–4 sentences unless C1/C2).\n` +
    `- You ALREADY know the learner's name from their profile — NEVER ask for it.`;

  return {
    id,
    cefr_level: cefrLevel,
    sort_order: sortOrder,
    title,
    scenario_emoji: emoji,
    subtitle,
    description: scenario,
    learning_goals: goalsJson,
    greeting_opener: greetingOpener,
    tutor_prompt: tutorPrompt,
  };
}

const A1 = [
  ['Hello & Introductions', '👋', 'First contact', 'Introduce yourself and ask simple questions.', ['Say your name and country', 'Ask "How are you?"', 'Use please/thank you'], 'Hi! I\'m your English coach. Let\'s practice introductions — tell me where you\'re from.'],
  ['Numbers & Time', '🔢', 'Counting & clocks', 'Numbers 1–100, time, days of the week.', ['Tell the time', 'Say dates and prices', 'Ask "What day is it?"'], 'Hello! Today we\'ll practice numbers and time. What time is it for you right now?'],
  ['At a Café', '☕', 'Ordering drinks', 'Order food and drinks politely.', ['Order a drink and snack', 'Ask for the bill', 'React to prices'], 'Hey! Imagine we\'re in a café. What would you like to order today?'],
  ['Family & Friends', '👨‍👩‍👧', 'People you know', 'Describe family members and relationships.', ['Describe 3 family members', 'Use possessives my/your', 'Ask about someone\'s family'], 'Hi there! Let\'s talk about family. Who lives with you?'],
  ['Around Town', '🗺️', 'Directions', 'Ask for and give simple directions.', ['Ask where something is', 'Use left/right/straight', 'Thank someone for help'], 'Hello! You\'re new in town. Ask me how to get to the train station.'],
  ['Shopping Basics', '🛍️', 'In a shop', 'Sizes, colors, prices, paying.', ['Ask for a size or color', 'Say if something is expensive', 'Buy two items'], 'Hi! You\'re in a clothes shop. Tell me what you want to buy.'],
  ['Daily Routine', '⏰', 'Everyday habits', 'Present simple for daily activities.', ['Describe your morning', 'Say what you do on weekdays', 'Ask about my routine'], 'Good to see you! Walk me through your typical morning, step by step.'],
  ['Weather & Feelings', '🌤️', 'How you feel', 'Weather words and basic emotions.', ['Describe today\'s weather', 'Say how you feel', 'Ask how I feel'], 'Hi! How\'s the weather where you are — and how are you feeling today?'],
];

const A2 = [
  ['Past Weekend', '📅', 'Simple past', 'Talk about what you did last weekend.', ['Use past tense verbs', 'Give 3 activities', 'Ask me about my weekend'], 'Hey! Tell me what you did last weekend — anything fun?'],
  ['At the Doctor', '🏥', 'Health visit', 'Describe symptoms and understand advice.', ['Explain a symptom', 'Answer how long it hurts', 'Understand simple advice'], 'Hello. You don\'t feel well today — tell me what\'s wrong.'],
  ['Job Interview Basics', '💼', 'First interview', 'Answer common interview questions.', ['Talk about strengths', 'Describe past experience', 'Ask one question to the interviewer'], 'Hi! I\'m the interviewer. Tell me a little about yourself.'],
  ['Travel Plans', '✈️', 'Planning a trip', 'Future plans, transport, accommodation.', ['Say where you want to go', 'Compare fly vs train', 'Ask for travel tips'], 'Hey! You\'re planning a trip. Where do you want to go and why?'],
  ['Hobbies & Interests', '🎸', 'Free time', 'Talk about hobbies and frequency.', ['Describe two hobbies', 'Use often/sometimes/never', 'Invite me to try something'], 'Hi! What do you love doing in your free time?'],
  ['Restaurant Dining', '🍽️', 'Eating out', 'Book a table, order, complain politely.', ['Order a main course', 'Ask about ingredients', 'Send food back politely'], 'Welcome! You\'re at a restaurant tonight — what would you like to eat?'],
  ['Phone & Messages', '📱', 'Remote chat', 'Leave a message, clarify a misunderstanding.', ['Leave a short voicemail', 'Reschedule a meeting', 'Confirm an address'], 'Hi, you just missed my call. Leave me a quick message.'],
  ['Home & Chores', '🏠', 'Household', 'Rooms, furniture, household tasks.', ['Describe your home', 'Say who does which chore', 'Ask for a favor at home'], 'Hey! Describe your home — how many rooms and who does the cooking?'],
];

const B1 = [
  ['Opinions: Social Media', '📱', 'Give opinions', 'Agree/disagree with reasons.', ['State an opinion with because', 'Respond to a counter-argument', 'Ask for my view'], 'Hi! Do you think social media helps people learn English? Why?'],
  ['Problem at Work', '💼', 'Workplace issue', 'Explain a problem and suggest solutions.', ['Describe the problem clearly', 'Propose two solutions', 'Ask for feedback'], 'Hey — you have a small problem at work. Tell me what happened.'],
  ['Environment', '🌍', 'Green habits', 'Discuss habits and environmental impact.', ['Talk about recycling', 'Compare two habits', 'Suggest one change'], 'Hello! What does your city do well or badly for the environment?'],
  ['Culture Shock', '🌏', 'Living abroad', 'Compare customs and adapt.', ['Describe a cultural difference', 'Say how you adapted', 'Ask about my experience'], 'Hi! Have you ever felt culture shock? Tell me about it.'],
  ['Health & Fitness', '🏃', 'Healthy life', 'Goals, habits, advice.', ['Describe your fitness routine', 'Give advice to a friend', 'Discuss work–life balance'], 'Hey! How do you stay healthy during a busy week?'],
  ['Education Choices', '🎓', 'Learning path', 'Compare options, explain decisions.', ['Compare two study options', 'Explain why you chose English', 'Ask for guidance'], 'Hello! Why are you learning English now — work, travel, or something else?'],
  ['Technology in Life', '💻', 'Tech habits', 'Pros/cons of apps and devices.', ['Describe a useful app', 'Mention one downside', 'Predict a future change'], 'Hi! Which app could you not live without for one day?'],
  ['Describing a Film', '🎬', 'Story summary', 'Plot, characters, recommendation.', ['Summarize without spoilers', 'Recommend to a friend', 'Ask what I watched'], 'Hey! Tell me about a film you liked recently — what happened?'],
  ['Negotiating', '🤝', 'A fair deal', 'Persuade and compromise.', ['Make an offer', 'Counter politely', 'Close a simple deal'], 'Hello! You want a better price on a used bike — negotiate with me.'],
  ['Future Goals', '🎯', 'Plans ahead', 'Ambitions, steps, obstacles.', ['Describe a 2-year goal', 'List three steps', 'Say what might block you'], 'Hi! Where do you want your English to be in one year?'],
];

const B2 = [
  ['Debate: Remote Work', '🏠', 'Structured debate', 'Argue for/against with evidence.', ['Give two arguments for', 'Respond to my point', 'Conclude clearly'], 'Hi! Argue FOR remote work — I\'ll push back a little.'],
  ['News Summary', '📰', 'Current topic', 'Summarize and react to news.', ['Summarize a story in 4 sentences', 'Share your reaction', 'Ask clarifying questions'], 'Hey! Pick a recent news story and summarize it for me.'],
  ['Hypotheticals', '🎲', 'What if…', 'Second conditional, imagined situations.', ['Use if I were/would', 'Describe a consequence', 'Ask a hypothetical'], 'Hello! If you could live anywhere for a year, where and why?'],
  ['Formal Email Tone', '✉️', 'Professional writing', 'Polite requests, complaints, follow-ups.', ['Write a polite complaint', 'Request information formally', 'Close professionally'], 'Hi! You need to email a manager about a delay — what would you write?'],
  ['Leadership Styles', '👔', 'Managing people', 'Compare styles and experiences.', ['Describe a good leader', 'Compare two styles', 'Give an example from life'], 'Hey! Describe a leader you admired — what did they do well?'],
  ['Economic Trends', '📈', 'Big picture', 'Discuss trends in simple economic terms.', ['Explain a trend you\'ve noticed', 'Link cause and effect', 'Ask for my perspective'], 'Hello! How has the cost of living changed where you are?'],
  ['Art & Creativity', '🎨', 'Expressive talk', 'Describe art, creativity, inspiration.', ['Describe a piece of art', 'Say what it communicates', 'Debate if AI is creative'], 'Hi! Tell me about a song, book, or painting that moved you.'],
  ['Science in Daily Life', '🔬', 'Science talk', 'Explain a phenomenon clearly.', ['Explain how something works', 'Use an analogy', 'Handle one follow-up'], 'Hey! Explain how smartphones connect to the internet — simply.'],
  ['Ethics Dilemma', '⚖️', 'Moral choice', 'Weigh options, justify decisions.', ['Present two sides', 'State your choice and why', 'Respect disagreement'], 'Hello! Would you report a colleague\'s small mistake? Discuss.'],
  ['Presentation Skills', '🎤', 'Mini talk', 'Structure intro–body–conclusion.', ['Give a 1-minute mini presentation', 'Use signposting phrases', 'Handle a question at the end'], 'Hi! You have 60 seconds — pitch your city to tourists.'],
];

const C1 = [
  ['Idioms in Context', '💬', 'Natural phrases', 'Use idioms appropriately, not literally.', ['Use 2 idioms correctly', 'Explain meaning to a learner', 'Avoid overuse'], 'Hey! Tell me about a time things got out of hand — use an idiom.'],
  ['Academic Essay', '📝', 'Argument structure', 'Thesis, evidence, counterargument.', ['State a clear thesis', 'Give evidence and example', 'Address one counterpoint'], 'Hi! Should universities be free? Build a short argument.'],
  ['Sarcasm & Irony', '😏', 'Subtle tone', 'Detect and use light irony carefully.', ['Explain a sarcastic line', 'Use mild irony in context', 'Check understanding'], 'Hello! Sometimes people say "Great weather!" when it rains — discuss tone.'],
  ['Diplomatic Language', '🕊️', 'Softening', 'Hedging, polite disagreement.', ['Disagree without offending', 'Propose a compromise', 'Summarize both views'], 'Hey! You must reject a proposal politely — how would you phrase it?'],
  ['Literary Analysis', '📚', 'Text talk', 'Theme, character, narrator voice.', ['Analyze a character\'s motive', 'Discuss theme in one paragraph', 'Compare two interpretations'], 'Hi! Pick a book or film — what theme stands out and why?'],
  ['Policy Discussion', '🏛️', 'Public issues', 'Nuanced views on policy trade-offs.', ['Outline pros and cons', 'Take a nuanced position', 'Invite dialogue'], 'Hello! Should cities ban cars downtown? Discuss trade-offs.'],
  ['Professional Networking', '🤝', 'Career chat', 'Elevator pitch, small talk, follow-up.', ['Deliver a 30-second pitch', 'Ask insightful questions', 'Follow up after meeting'], 'Hey! You meet me at a conference — introduce yourself professionally.'],
  ['Cross-cultural Communication', '🌐', 'Global teams', 'Avoid misunderstanding across cultures.', ['Describe a misunderstanding', 'Suggest how to repair it', 'Generalize carefully'], 'Hi! Tell me about a time culture affected communication at work.'],
  ['Abstract Concepts', '🧠', 'Big ideas', 'Discuss justice, success, happiness.', ['Define an abstract term your way', 'Give examples and limits', 'Question assumptions'], 'Hello! What does "success" mean to you personally?'],
  ['Media Literacy', '📺', 'Critical viewing', 'Bias, sources, fact vs opinion.', ['Spot bias in a headline', 'Suggest verification steps', 'Discuss echo chambers'], 'Hey! How do you check if online news is trustworthy?'],
  ['Advanced Negotiation', '💼', 'High stakes', 'BATNA, interests vs positions.', ['State interests not positions', 'Propose creative options', 'Close with clear next steps'], 'Hi! Negotiate a contract renewal — I\'m the client.'],
  ['TED-style Talk', '🎙️', 'Persuasive speech', 'Hook, story, data, call to action.', ['Open with a hook', 'Use one story and one stat', 'End with a call to action'], 'Hello! Give a 90-second talk on why learning English matters.'],
];

const C2 = [
  ['Rhetoric & Persuasion', '🏛️', 'Masterful argument', 'Ethos, pathos, logos in speech.', ['Identify rhetorical devices', 'Persuade on a tough topic', 'Critique your own argument'], 'Hi! Convince me to learn a language I don\'t need — go.'],
  ['Legal Language Intro', '⚖️', 'Formal contracts', 'Understand tone of terms & clauses.', ['Paraphrase a clause simply', 'Ask clarifying questions', 'Spot ambiguous wording'], 'Hey! I\'ll read a short contract line — explain it in plain English.'],
  ['Satire & Humor', '😂', 'Comic nuance', 'Satire, understatement, comic timing.', ['Explain a satirical joke', 'Use understatement', 'Discuss risk of offense'], 'Hello! Why do some jokes work in one culture but not another?'],
  ['Philosophy Debate', '🤔', 'Deep questions', 'Thought experiments, definitions.', ['Define a key term', 'Respond to a thought experiment', 'Acknowledge limits of knowledge'], 'Hi! If you could know one truth about the future, what and why?'],
  ['Scientific Paper', '🧪', 'Research talk', 'Summarize methods, findings, limits.', ['Summarize an imaginary study', 'State limitations', 'Suggest next research'], 'Hey! Summarize a study linking sleep and memory — invent details OK.'],
  ['Native-like Fluency', '🎯', 'Fine-tuning', 'Collocations, register, rhythm.', ['Self-correct mid-sentence', 'Use precise collocations', 'Mimic natural fillers sparingly'], 'Hello! Tell a story — focus on sounding natural, not perfect grammar.'],
  ['Subtext in Literature', '📖', 'Reading between lines', 'Implication, unreliable narrator.', ['Infer unstated meaning', 'Discuss narrator bias', 'Compare two readings'], 'Hi! When does a narrator hide more than they tell? Give an example.'],
  ['Global Economics', '🌏', 'Macro talk', 'Trade, inflation, inequality at C2.', ['Explain a macro trend', 'Link micro example to macro', 'Challenge a simplification'], 'Hey! Is inflation always bad for ordinary people? Discuss.'],
  ['Mentoring in English', '👨‍🏫', 'Teach others', 'Explain grammar to a beginner.', ['Teach one rule simply', 'Give a mini exercise', 'Give encouraging feedback'], 'Hello! Teach me the difference between present perfect and past simple.'],
  ['Impromptu Speech', '⚡', 'No prep', 'Speak 2 minutes on a random topic.', ['Speak 2 minutes coherently', 'Recover from a slip', 'Conclude strongly'], 'Hi! Topic: "The role of luck in life" — start now, no prep.'],
  ['Register Shifting', '🔄', 'Style control', 'Formal ↔ informal on demand.', ['Same message in formal & casual', 'Explain when each fits', 'Avoid mixed register'], 'Hey! Explain a delay to a friend, then to your CEO.'],
  ['Mastery Review', '🏆', 'Free practice', 'Open conversation at C2 with feedback.', ['Sustain extended dialogue', 'Self-assess one weakness', 'Set a micro-goal'], 'Hello! Free conversation — pick any topic; I\'ll coach you lightly.'],
];

function pack(level, rows) {
  return rows.map((r, i) =>
    buildLesson(level, i + 1, r[0], r[1], r[2], r[3], r[4], r[5])
  );
}

const ENGLISH_LESSONS = [
  ...pack('A1', A1),
  ...pack('A2', A2),
  ...pack('B1', B1),
  ...pack('B2', B2),
  ...pack('C1', C1),
  ...pack('C2', C2),
];

const LESSON_COUNTS = { A1: 8, A2: 8, B1: 10, B2: 10, C1: 12, C2: 12 };

module.exports = { ENGLISH_LESSONS, LESSON_COUNTS, buildLesson };
