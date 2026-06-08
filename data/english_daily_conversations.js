/**
 * Daily conversation topics — CEFR A1–C2 (casual chat, not structured lessons).
 * IDs: dc_a1_01 … (same counts per level as lessons).
 */

function buildDailyConversation(
  cefrLevel,
  sortOrder,
  title,
  emoji,
  subtitle,
  scenario,
  goals,
  greetingOpener
) {
  const id = `dc_${cefrLevel.toLowerCase()}_${String(sortOrder).padStart(2, '0')}`;
  const goalsJson = JSON.stringify(goals);
  const tutorPrompt =
    `DAILY ENGLISH CONVERSATION (${cefrLevel}): "${title}"\n` +
    `Chat theme: ${scenario}\n` +
    `Talk goals: ${goals.join('; ')}\n\n` +
    `RULES:\n` +
    `- Friendly English tutor on a casual call. Speak ONLY in English.\n` +
    `- This is free daily small talk, NOT a formal lesson. No drills or long grammar lectures.\n` +
    `- Match CEFR ${cefrLevel}: simpler questions and shorter turns for A1–A2; richer chat for B2–C2.\n` +
    `- Keep the vibe natural: react, ask follow-ups, share a brief opinion, use light humor when appropriate.\n` +
    `- Gently correct 1–2 important mistakes per turn; prioritize fluency and confidence.\n` +
    `- Encourage the learner to speak most of the time. Stay on everyday life topics related to this chat theme.`;

  return {
    id,
    cefr_level: cefrLevel,
    sort_order: sortOrder,
    title,
    scenario_emoji: emoji,
    subtitle,
    description: scenario,
    conversation_goals: goalsJson,
    greeting_opener: greetingOpener,
    tutor_prompt: tutorPrompt,
  };
}

const A1 = [
  ['Morning Hello', '🌅', 'Start the day', 'Quick friendly hello and how you slept.', ['Say good morning', 'Ask how someone is', 'Answer with one feeling word'], 'Good morning! How did you sleep last night?'],
  ['How Was Your Day?', '🙂', 'Daily check-in', 'Simple chat about today so far.', ['Say one good thing today', 'Ask about my day', 'Use past simple for one event'], 'Hey! How has your day been so far?'],
  ['Lunch Chat', '🥪', 'Midday break', 'Talk about food and lunch habits.', ['Say what you ate or will eat', 'Ask what I recommend', 'Say if you are hungry'], 'Hi! What are you having for lunch today?'],
  ['Favorite Drink', '☕', 'Café small talk', 'Order or describe a drink casually.', ['Name a favorite drink', 'Say hot or cold', 'Ask my favorite'], 'Hey! What\'s your go-to drink — coffee, tea, or something else?'],
  ['Right Now', '⏱️', 'Present moment', 'What you are doing at this minute.', ['Use present continuous', 'Ask what I am doing', 'Mention a place'], 'Hi! What are you doing right now?'],
  ['Weekend Plans', '📅', 'Simple future', 'Light plans for Saturday or Sunday.', ['Say one weekend plan', 'Ask about my plans', 'Use going to'], 'Hey! Any fun plans for this weekend?'],
  ['Thanks & Goodbye', '👋', 'Polite closing', 'End a chat warmly and politely.', ['Thank someone for help', 'Say goodbye two ways', 'Say see you later'], 'Nice talking! How do you usually say goodbye to friends in English?'],
  ['Weather Chat', '🌤️', 'Small talk', 'Classic weather conversation.', ['Describe weather today', 'Say if you like this weather', 'Ask about my city'], 'Hi! What\'s the weather like where you are today?'],
];

const A2 = [
  ['Catching Up', '💬', 'Friend update', 'Share news since you last spoke.', ['Mention two updates', 'Ask a follow-up question', 'React with interest'], 'Hey! It\'s been a while — what\'s new with you?'],
  ['After Work', '🏢', 'Evening unwind', 'How you relax after a busy day.', ['Describe your evening routine', 'Say how tired you feel', 'Ask for a tip'], 'Hi! How do you usually unwind after work?'],
  ['Shopping Story', '🛒', 'Errands chat', 'Something you bought or returned recently.', ['Describe a recent purchase', 'Say if it was worth it', 'Ask what I bought lately'], 'Hey! Buy anything interesting this week?'],
  ['Cooking Tonight', '🍳', 'Kitchen talk', 'What you might cook and why.', ['Describe a simple dish', 'Ask for an easy recipe', 'Say what you dislike cooking'], 'Hi! Are you cooking tonight or ordering in?'],
  ['Travel Memory', '✈️', 'Past trip', 'A place you visited and liked.', ['Describe one trip', 'Say what surprised you', 'Ask where I have been'], 'Hey! Tell me about a trip you still think about.'],
  ['Music & Mood', '🎵', 'Playlist chat', 'Songs that match your mood today.', ['Name a song or artist', 'Explain why it fits your mood', 'Ask what I am listening to'], 'Hi! What are you listening to these days?'],
  ['Neighbor Chat', '🏘️', 'Local life', 'Your neighborhood and nearby places.', ['Describe your area', 'Mention one nearby place', 'Ask about my neighborhood'], 'Hey! Do you like living where you are? What\'s nearby?'],
  ['Phone Habits', '📱', 'Daily tech', 'How you use your phone during the day.', ['Say how often you check messages', 'Mention one useful app', 'Ask about my habits'], 'Hi! How much time do you spend on your phone each day?'],
];

const B1 = [
  ['Coffee Break Debate', '☕', 'Light opinions', 'Prefer coffee shop or home — why?', ['Give an opinion with reasons', 'Agree or disagree politely', 'Ask for my view'], 'Hey! Do you prefer working from a café or from home? Why?'],
  ['Work-Life Balance', '⚖️', 'Busy week', 'How you balance job and personal life.', ['Describe your typical week', 'Mention one challenge', 'Suggest a small improvement'], 'Hi! How do you keep work from taking over your evenings?'],
  ['Social Plans', '🎉', 'Making plans', 'Organize something with friends this week.', ['Suggest a plan with details', 'Handle a scheduling conflict', 'Confirm a time and place'], 'Hey! You want to meet friends this week — what would you suggest?'],
  ['Learning English', '📚', 'Motivation talk', 'Why and how you practice English daily.', ['Explain your main reason', 'Share one study habit', 'Ask for advice'], 'Hi! Why did you start learning English, and what keeps you going?'],
  ['Healthy Habits', '🥗', 'Wellness chat', 'Small habits that help your energy.', ['Describe two habits', 'Compare past vs now', 'Ask what works for me'], 'Hey! What small habit actually makes your day better?'],
  ['Movie Night', '🎬', 'Recommendations', 'Recommend something to watch and why.', ['Recommend a film or series', 'Avoid spoilers', 'Ask what I would pick'], 'Hi! What should I watch tonight — anything you\'d recommend?'],
  ['City Life', '🏙️', 'Urban talk', 'Pros and cons of living in your city.', ['Name two pros and one con', 'Compare with another city', 'Ask about my city'], 'Hey! What do you love and hate about your city?'],
  ['Stress & Calm', '🧘', 'Feelings talk', 'What stresses you and how you calm down.', ['Describe a stress trigger', 'Share a coping strategy', 'Give supportive feedback'], 'Hi! What helps you calm down after a stressful day?'],
  ['Dream Trip', '🗺️', 'Future chat', 'A trip you would love to take someday.', ['Describe the destination', 'Say what you would do there', 'Ask about my dream trip'], 'Hey! If you could fly anywhere next month, where would you go?'],
  ['Daily News', '📰', 'Current events', 'React to a headline you saw recently.', ['Summarize a story briefly', 'Share your reaction', 'Ask what I think'], 'Hi! Heard any interesting news lately? Tell me in your own words.'],
];

const B2 = [
  ['Remote vs Office', '🏠', 'Work culture', 'Discuss hybrid work with nuance.', ['Compare two setups', 'Use hedging language', 'Invite my perspective'], 'Hey! Would you rather be fully remote or in-office — honestly?'],
  ['Relationships', '❤️', 'Personal life', 'Friendship or family dynamics (appropriate).', ['Describe a close relationship', 'Use anecdote', 'Ask thoughtful follow-ups'], 'Hi! Who do you talk to when you need honest advice?'],
  ['Money Mindset', '💳', 'Finance chat', 'Saving, spending, and priorities (general).', ['Discuss a spending habit', 'Mention a financial goal', 'Stay respectful'], 'Hey! Are you more of a saver or a spender — and has that changed?'],
  ['Culture & Customs', '🌏', 'Cross-cultural', 'A custom from your culture explained simply.', ['Explain a tradition', 'Compare with another culture', 'Ask about misunderstandings'], 'Hi! Share a custom from your country that visitors might not know.'],
  ['Career Pivot', '🔄', 'Professional path', 'A change you would consider in your career.', ['Describe a possible pivot', 'List pros and risks', 'Ask for my take'], 'Hey! If you could switch roles tomorrow, what would you try?'],
  ['Podcast & Books', '🎧', 'Media diet', 'What you consume to learn or relax.', ['Recommend one podcast or book', 'Explain who it is for', 'Ask what I am into'], 'Hi! What podcast or book changed how you think about something?'],
  ['Ethical Choices', '⚖️', 'Values talk', 'A small ethical dilemma from daily life.', ['Present two options', 'Justify your choice', 'Acknowledge trade-offs'], 'Hey! Would you return extra change a cashier gave by mistake? Discuss.'],
  ['Parenting / Mentoring', '👶', 'Guidance chat', 'Advice you give or received (general).', ['Share one piece of advice', 'Tell a short story', 'Ask about my experience'], 'Hi! What\'s the best advice someone gave you when you were younger?'],
  ['Creativity Block', '🎨', 'Maker talk', 'When you feel stuck creatively.', ['Describe the block', 'Share what usually helps', 'Brainstorm one idea together'], 'Hey! Ever feel stuck on a creative project? What do you do?'],
  ['Future of AI', '🤖', 'Tech society', 'How AI might change daily life.', ['State a balanced view', 'Give a concrete example', 'Ask a probing question'], 'Hi! How do you think AI will change everyday work in five years?'],
];

const C1 = [
  ['Identity & Belonging', '🪞', 'Deep personal', 'Where you feel you belong and why.', ['Explore nuance', 'Use abstract vocabulary carefully', 'Listen and paraphrase'], 'Hey! Where do you feel most like yourself — city, community, or online?'],
  ['Persuasion in Life', '🎯', 'Influence', 'A time you had to persuade someone.', ['Structure situation–action–result', 'Reflect on what worked', 'Debate gently'], 'Hi! Tell me about a time you had to change someone\'s mind.'],
  ['Humor Across Cultures', '😄', 'Comedy nuance', 'Jokes that translate or do not.', ['Analyze one example', 'Discuss risk of misunderstanding', 'Stay respectful'], 'Hey! Can humor ever be "lost in translation"? Give an example.'],
  ['Leadership Moments', '👔', 'Influence', 'When you led without a title.', ['Narrate with detail', 'Evaluate outcome', 'Ask for counter-story'], 'Hi! Describe a moment you stepped up informally. What happened?'],
  ['Privacy & Trust', '🔐', 'Digital life', 'What you share online and why.', ['Argue a position', 'Consider counterpoints', 'Use precise vocabulary'], 'Hey! How much of your real life do you share on social media? Why?'],
  ['Climate Conversations', '🌍', 'Big topic', 'Discuss climate action at personal level.', ['Link individual action to systems', 'Avoid preaching', 'Invite dialogue'], 'Hi! What\'s one realistic change people in your city could make?'],
  ['Art That Moved You', '🎭', 'Aesthetic talk', 'A work that changed your perspective.', ['Analyze theme and reaction', 'Use metaphor sparingly', 'Ask interpretive questions'], 'Hey! Describe art — any medium — that still stays with you. Why?'],
  ['Negotiation Story', '🤝', 'Deal-making', 'A negotiation you remember.', ['Explain interests vs positions', 'Share outcome', 'Extract a lesson'], 'Hi! Walk me through a negotiation — business or personal — that taught you something.'],
  ['Mentorship', '🧭', 'Growth', 'Mentor or mentee experience.', ['Compare giving vs receiving advice', 'Reflect on growth', 'Offer wisdom'], 'Hey! Have you mentored someone — or been mentored? What mattered most?'],
  ['Language & Thought', '🗣️', 'Linguistics lite', 'Does language shape how we think?', ['Present a thesis', 'Use examples', 'Question assumptions'], 'Hi! Do you think thinking differently in English vs your native language?'],
  ['Risk & Regret', '🎲', 'Life choices', 'A risk you took and what you learned.', ['Balance emotion and analysis', 'Discuss alternative paths', 'Show empathy'], 'Hey! Tell me about a risk you\'re glad you took — or one you avoid now.'],
  ['Community Building', '🏘️', 'Social fabric', 'How communities stay strong or fracture.', ['Observe a local example', 'Propose one improvement', 'Debate trade-offs'], 'Hi! What makes a neighborhood feel like a real community to you?'],
];

const C2 = [
  ['Philosophy Over Coffee', '☕', 'Big questions', 'Free-ranging thoughtful chat.', ['Sustain extended turns', 'Define terms when needed', 'Tolerate ambiguity'], 'Hey! Pick a big question — happiness, freedom, luck — and let\'s explore it.'],
  ['Rhetoric in Media', '📺', 'Discourse', 'How messages persuade masses.', ['Analyze a rhetorical move', 'Compare two framings', 'Self-critique your argument'], 'Hi! How do headlines shape what people believe without lying?'],
  ['Power & Ethics', '⚖️', 'Institutions', 'Power, responsibility, and accountability.', ['Argue with evidence', 'Acknowledge complexity', 'Invite dissent'], 'Hey! When is it right to break a rule for a greater good?'],
  ['Creativity & AI', '🤖', 'Future craft', 'Human creativity if machines generate art.', ['Take a nuanced stance', 'Use precise terms', 'Speculate carefully'], 'Hi! Can AI be "creative," or only imitate? Discuss.'],
  ['Global English', '🌐', 'World language', 'English as lingua franca — benefits and costs.', ['Weigh cultural impacts', 'Share personal experience', 'Avoid stereotypes'], 'Hey! What are hidden costs of everyone learning English?'],
  ['Memory & Story', '📖', 'Narrative', 'How stories shape personal identity.', ['Tell a formative story', 'Analyze narrative choices', 'Link to identity'], 'Hi! What story do you tell about yourself when you meet new people?'],
  ['Economics & Life', '📈', 'Macro micro', 'Connect big trends to daily prices and jobs.', ['Explain a trend clearly', 'Challenge a simplification', 'Use analogy'], 'Hey! How do global events show up in your grocery bill or rent?'],
  ['Justice Debate', '🏛️', 'Moral systems', 'Compare ideas of fairness.', ['Compare two frameworks', 'Apply to a case', 'Concede a strong point'], 'Hi! Is fairness the same as equality? Give a real-life example.'],
  ['Science & Society', '🔬', 'Public understanding', 'Trust in science and experts today.', ['Discuss trust builders', 'Mention misinformation', 'Propose dialogue'], 'Hey! Why do some people trust experts and others do not?'],
  ['Impromptu Masterclass', '⚡', 'No prep', 'Two-minute unscripted talk on random topic.', ['Speak coherently under pressure', 'Recover smoothly', 'Self-evaluate at end'], 'Hi! Topic: "What makes a conversation memorable?" — start now.'],
  ['Register Play', '🔄', 'Style shift', 'Same idea in three registers.', ['Shift formal to casual', 'Explain pragmatics', 'Notice audience'], 'Hey! Explain "I need more time" to a boss, friend, and child.'],
  ['Open Lounge', '🛋️', 'Free chat', 'Open C2 conversation with light coaching.', ['Drive topic choice', 'Sustain depth', 'Set a micro-goal'], 'Hello! Your lounge — choose any topic; I\'ll chat and coach lightly.'],
];

function pack(level, rows) {
  return rows.map((r, i) =>
    buildDailyConversation(level, i + 1, r[0], r[1], r[2], r[3], r[4], r[5])
  );
}

const ENGLISH_DAILY_CONVERSATIONS = [
  ...pack('A1', A1),
  ...pack('A2', A2),
  ...pack('B1', B1),
  ...pack('B2', B2),
  ...pack('C1', C1),
  ...pack('C2', C2),
];

module.exports = { ENGLISH_DAILY_CONVERSATIONS, buildDailyConversation };
