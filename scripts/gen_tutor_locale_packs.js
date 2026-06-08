#!/usr/bin/env node
/**
 * 16 tutor × 12 locale çeviri paketi üretir.
 * Çalıştır: node scripts/gen_tutor_locale_packs.js
 */
const fs = require('fs');
const path = require('path');

const TUTOR_ORDER = [
  'annie', 'clara', 'frank', 'james', 'jhon', 'lee', 'lin', 'nina',
  'seraphine', 'sophie', 'aria', 'brian', 'elara', 'lyra', 'max', 'mira',
];

/** displayName|tagline|description — sıra TUTOR_ORDER ile aynı */
const PACK_LINES = {
  en: `Annie|Speaking confidence|Provides a supportive space to build speaking confidence without fear of making mistakes.
Clara|Daily dialogue|Makes conversation easier with practical phrases for cafés, shopping, and travel.
Frank|Listening|Offers listening practice with varied accents and note-taking strategies.
James|Pronunciation & rhythm|A patient practice partner focused on natural pronunciation and fluent sentences.
Jhon|Pronunciation|Helps you speak clearly by working through difficult sounds step by step.
Lee|Grammar|Reinforces rules through conversation so you can build natural, correct sentences.
Lin|Vocabulary|Expands your word bank by teaching new words in real conversational context.
Nina|Quick practice|Ideal for fast-paced progress with short sessions, repetition, and feedback.
Seraphine|Fluency|Focuses on speaking without hesitation and expressing your thoughts smoothly.
Sophie|Cultural journey|Sophie turns every lesson into a cultural journey, teaching English from around the world each season.
Aria|Daily chat|A warm, supportive space to express yourself comfortably in everyday conversations.
Brian|Listening|Builds comprehension step by step through listening practice at different accents and speeds.
Elara|Vocabulary|Helps you grow your vocabulary naturally by learning new words in context.
Lyra|Fluency|Focuses on speaking without pauses and expressing your ideas fluently.
Max|Pronunciation & rhythm|A patient partner focused on natural pronunciation and sentence rhythm.
Mira|Quick practice|Supports your progress with short, intensive sessions, repetition, and feedback.`,

  tr: `Annie|Konuşma güveni|Hata yapmaktan çekinmeden konuşma özgüvenini artırmak için destekleyici bir ortam sağlar.
Clara|Günlük diyalog|Kafede, alışverişte ve seyahatte kullanacağın pratik ifadelerle konuşmayı kolaylaştırır.
Frank|Dinleme|Farklı aksanlardan metinlerle dinleme pratiği ve not alma stratejileri sunar.
James|Telaffuz & ritim|Doğal telaffuz ve akıcı cümle kurma üzerine odaklanan, sabırlı bir pratik partneri.
Jhon|Telaffuz|Zor sesleri adım adım çalışarak net ve anlaşılır konuşmana yardımcı olur.
Lee|Dil bilgisi|Kuralları konuşma içinde pekiştirerek doğal ve doğru cümle kurmana yardımcı olur.
Lin|Kelime haznesi|Bağlam içinde yeni kelimeler öğrenerek kelime dağarcığını genişletmene yardım eder.
Nina|Hızlı pratik|Kısa seanslarla yoğun tempoda tekrar ve geri bildirimle ilerlemen için idealdir.
Seraphine|Akıcılık|Duraksamadan konuşma ve düşünceyi ifade etme becerini geliştirmene odaklanır.
Sophie|Kültürel yolculuk|Her mevsim dünyanın farklı bir köşesinden İngilizce öğreten Sophie, her dersi kültürel bir yolculuğa dönüştürür.
Aria|Günlük sohbet|Günlük sohbetlerde kendini rahat ifade etmen için sıcak ve destekleyici bir pratik ortamı sunar.
Brian|Dinleme|Farklı aksan ve hızlarda dinleme pratiğiyle anlama becerini adım adım geliştirir.
Elara|Kelime haznesi|Bağlam içinde yeni kelimeler öğreterek kelime dağarcığını doğal şekilde genişletmene yardım eder.
Lyra|Akıcılık|Duraksamadan konuşma ve düşünceni akıcı şekilde ifade etme becerine odaklanır.
Max|Telaffuz & ritim|Doğal telaffuz ve cümle ritmi üzerine odaklanan sabırlı bir pratik partneridir.
Mira|Hızlı pratik|Kısa ve yoğun seanslarla hızlı tekrar ve geri bildirimle ilerlemeni destekler.`,

  de: `Annie|Sprechvertrauen|Schafft einen unterstützenden Raum, um Sprechvertrauen ohne Angst vor Fehlern aufzubauen.
Clara|Alltagsdialog|Erleichtert Gespräche mit praktischen Ausdrücken für Café, Einkauf und Reisen.
Frank|Hörverständnis|Bietet Hörübungen mit verschiedenen Akzenten und Strategien zum Mitschreiben.
James|Aussprache & Rhythmus|Ein geduldiger Partner für natürliche Aussprache und flüssige Sätze.
Jhon|Aussprache|Hilft dir, klar zu sprechen, indem schwierige Laute Schritt für Schritt geübt werden.
Lee|Grammatik|Festigt Regeln im Gespräch, damit du natürliche und korrekte Sätze bildest.
Lin|Wortschatz|Erweitert deinen Wortschatz, indem neue Wörter im Gesprächskontext gelernt werden.
Nina|Schnelles Training|Ideal für schnellen Fortschritt mit kurzen Einheiten, Wiederholung und Feedback.
Seraphine|Flüssigkeit|Konzentriert sich darauf, ohne Zögern zu sprechen und Gedanken flüssig auszudrücken.
Sophie|Kulturelle Reise|Sophie verwandelt jede Lektion in eine kulturelle Reise und bringt dir Englisch aus aller Welt bei.
Aria|Tägliches Gespräch|Ein warmer, unterstützender Raum, um dich im Alltagsgespräch wohlzufühlen.
Brian|Hörverständnis|Verbessert dein Verstehen Schritt für Schritt durch Übungen mit verschiedenen Akzenten und Tempi.
Elara|Wortschatz|Hilft dir, deinen Wortschatz natürlich zu erweitern, indem neue Wörter im Kontext gelernt werden.
Lyra|Flüssigkeit|Fokussiert auf flüssiges Sprechen ohne Pausen und klare Ideenäußerung.
Max|Aussprache & Rhythmus|Ein geduldiger Partner für natürliche Aussprache und Satzrhythmus.
Mira|Schnelles Training|Unterstützt deinen Fortschritt mit kurzen, intensiven Einheiten, Wiederholung und Feedback.`,

  fr: `Annie|Confiance à l'oral|Offre un cadre bienveillant pour gagner en confiance à l'oral sans craindre les erreurs.
Clara|Dialogue du quotidien|Facilite la conversation avec des expressions pratiques pour le café, les courses et les voyages.
Frank|Écoute|Propose des exercices d'écoute avec différents accents et des stratégies de prise de notes.
James|Prononciation & rythme|Un partenaire patient axé sur une prononciation naturelle et des phrases fluides.
Jhon|Prononciation|Vous aide à parler clairement en travaillant les sons difficiles pas à pas.
Lee|Grammaire|Renforce les règles dans la conversation pour construire des phrases naturelles et correctes.
Lin|Vocabulaire|Élargit votre vocabulaire en apprenant de nouveaux mots dans un contexte conversationnel.
Nina|Pratique rapide|Idéal pour progresser vite avec des sessions courtes, de la répétition et des retours.
Seraphine|Fluidité|Se concentre sur l'expression fluide des idées sans hésitation.
Sophie|Voyage culturel|Sophie transforme chaque leçon en voyage culturel, enseignant l'anglais du monde entier chaque saison.
Aria|Discussion quotidienne|Un espace chaleureux et bienveillant pour vous exprimer aisément au quotidien.
Brian|Écoute|Développe la compréhension pas à pas grâce à l'écoute à différents accents et vitesses.
Elara|Vocabulaire|Aide à enrichir naturellement le vocabulaire en apprenant de nouveaux mots en contexte.
Lyra|Fluidité|Se concentre sur une expression fluide sans pauses et des idées claires.
Max|Prononciation & rythme|Un partenaire patient axé sur la prononciation naturelle et le rythme des phrases.
Mira|Pratique rapide|Soutient votre progression avec des sessions courtes et intenses, répétition et retours.`,

  it: `Annie|Fiducia nel parlare|Offre un ambiente di supporto per aumentare la fiducia nel parlare senza paura degli errori.
Clara|Dialogo quotidiano|Rende più facile conversare con frasi pratiche per bar, shopping e viaggi.
Frank|Ascolto|Offre pratica d'ascolto con accenti diversi e strategie per prendere appunti.
James|Pronuncia e ritmo|Un partner paziente focalizzato su pronuncia naturale e frasi fluide.
Jhon|Pronuncia|Ti aiuta a parlare chiaramente lavorando sui suoni difficili passo dopo passo.
Lee|Grammatica|Consolida le regole nella conversazione per costruire frasi naturali e corrette.
Lin|Vocabolario|Espande il vocabolario insegnando nuove parole nel contesto della conversazione.
Nina|Pratica rapida|Ideale per progressi veloci con sessioni brevi, ripetizione e feedback.
Seraphine|Fluidità|Si concentra sul parlare senza esitazione e sull'espressione fluida dei pensieri.
Sophie|Viaggio culturale|Sophie trasforma ogni lezione in un viaggio culturale, insegnando inglese da tutto il mondo ogni stagione.
Aria|Chat quotidiana|Uno spazio caldo e di supporto per esprimerti comodamente nelle conversazioni di tutti i giorni.
Brian|Ascolto|Sviluppa la comprensione passo dopo passo con pratica d'ascolto a accenti e velocità diverse.
Elara|Vocabolario|Aiuta ad ampliare il vocabolario in modo naturale imparando nuove parole nel contesto.
Lyra|Fluidità|Si concentra sul parlare senza pause e sull'espressione fluente delle idee.
Max|Pronuncia e ritmo|Un partner paziente focalizzato su pronuncia naturale e ritmo delle frasi.
Mira|Pratica rapida|Sostiene i tuoi progressi con sessioni brevi e intense, ripetizione e feedback.`,

  es: `Annie|Confianza al hablar|Ofrece un espacio de apoyo para ganar confianza al hablar sin miedo a equivocarse.
Clara|Diálogo diario|Facilita la conversación con frases prácticas para cafés, compras y viajes.
Frank|Escucha|Ofrece práctica de escucha con distintos acentos y estrategias para tomar notas.
James|Pronunciación y ritmo|Un compañero paciente centrado en la pronunciación natural y frases fluidas.
Jhon|Pronunciación|Te ayuda a hablar con claridad trabajando los sonidos difíciles paso a paso.
Lee|Gramática|Refuerza las reglas en la conversación para construir frases naturales y correctas.
Lin|Vocabulario|Amplía tu vocabulario enseñando palabras nuevas en contexto conversacional.
Nina|Práctica rápida|Ideal para avanzar rápido con sesiones cortas, repetición y retroalimentación.
Seraphine|Fluidez|Se centra en hablar sin dudar y expresar tus ideas con fluidez.
Sophie|Viaje cultural|Sophie convierte cada lección en un viaje cultural, enseñando inglés de todo el mundo cada temporada.
Aria|Charla diaria|Un espacio cálido y de apoyo para expresarte con comodidad en conversaciones cotidianas.
Brian|Escucha|Desarrolla la comprensión paso a paso con práctica de escucha en distintos acentos y velocidades.
Elara|Vocabulario|Ayuda a ampliar el vocabulario de forma natural aprendiendo palabras nuevas en contexto.
Lyra|Fluidez|Se centra en hablar sin pausas y expresar ideas con fluidez.
Max|Pronunciación y ritmo|Un compañero paciente centrado en la pronunciación natural y el ritmo de las frases.
Mira|Práctica rápida|Apoya tu progreso con sesiones cortas e intensas, repetición y retroalimentación.`,

  ja: `Annie|話す自信|間違いを恐れずに話す自信を育てる、支えになる練習環境を提供します。
Clara|日常会話|カフェ、買い物、旅行で使える実用的な表現で会話を楽にします。
Frank|リスニング|さまざまなアクセントの教材とメモの取り方でリスニング練習を提供します。
James|発音とリズム|自然な発音と流暢な文作りに焦点を当てた、忍耐強い練習パートナーです。
Jhon|発音|難しい音を段階的に練習し、はっきり伝わる話し方をサポートします。
Lee|文法|会話の中で文法を定着させ、自然で正確な文を作れるよう助けます。
Lin|語彙|会話の文脈の中で新しい単語を学び、語彙力を広げます。
Nina|クイック練習|短いセッションと反復、フィードバックで素早く上達したい人に最適です。
Seraphine|流暢さ|ためらわずに話し、考えをスムーズに伝える力に焦点を当てます。
Sophie|文化の旅|ソフィーは毎シーズン世界各地から英語を教え、レッスンを文化の旅に変えます。
Aria|日常チャット|日常会話で自分らしく話せる、温かく支えになる練習空間です。
Brian|リスニング|さまざまなアクセントと速度で、段階的に理解力を高めるリスニング練習を行います。
Elara|語彙|文脈の中で新しい単語を学び、自然に語彙を広げる手助けをします。
Lyra|流暢さ|間を置かずに話し、アイデアを流暢に伝える力に焦点を当てます。
Max|発音とリズム|自然な発音と文のリズムに焦点を当てた、忍耐強い練習パートナーです。
Mira|クイック練習|短く集中的なセッションと反復、フィードバックで上達をサポートします。`,

  ru: `Annie|Уверенность в речи|Создаёт поддерживающую среду, чтобы говорить уверенно, не боясь ошибок.
Clara|Бытовой диалог|Облегчает разговор практичными фразами для кафе, покупок и путешествий.
Frank|Аудирование|Предлагает практику слушания с разными акцентами и стратегиями конспектирования.
James|Произношение и ритм|Терпеливый партнёр, сосредоточенный на естественном произношении и плавных фразах.
Jhon|Произношение|Помогает говорить чётко, отрабатывая сложные звуки шаг за шагом.
Lee|Грамматика|Закрепляет правила в разговоре, чтобы строить естественные и правильные предложения.
Lin|Словарный запас|Расширяет словарь, обучая новым словам в контексте живого общения.
Nina|Быстрая практика|Идеально для быстрого прогресса: короткие сессии, повторение и обратная связь.
Seraphine|Беглость|Фокус на речи без пауз и плавном выражении мыслей.
Sophie|Культурное путешествие|Софи превращает каждый урок в культурное путешествие, обучая английскому со всего мира.
Aria|Ежедневный чат|Тёплая поддерживающая среда, чтобы свободно выражаться в повседневных беседах.
Brian|Аудирование|Пошагово развивает понимание через практику слушания с разными акцентами и темпами.
Elara|Словарный запас|Помогает естественно расширять словарь, изучая новые слова в контексте.
Lyra|Беглость|Сосредоточена на речи без пауз и плавном выражении идей.
Max|Произношение и ритм|Терпеливый партнёр, сосредоточенный на естественном произношении и ритме фраз.
Mira|Быстрая практика|Поддерживает прогресс короткими интенсивными сессиями, повторением и обратной связью.`,

  ko: `Annie|말하기 자신감|실수를 두려워하지 않고 말하기 자신감을 키울 수 있는 지원 환경을 제공합니다.
Clara|일상 대화|카페, 쇼핑, 여행에 쓰는 실용 표현으로 대화를 쉽게 만듭니다.
Frank|듣기|다양한 억양의 자료와 메모 전략으로 듣기 연습을 제공합니다.
James|발음과 리듬|자연스러운 발음과 유창한 문장에 집중하는 인내심 있는 연습 파트너입니다.
Jhon|발음|어려운 소리를 단계별로 연습해 또렷하게 말하도록 돕습니다.
Lee|문법|대화 속에서 문법을 다져 자연스럽고 정확한 문장을 만들도록 돕습니다.
Lin|어휘|대화 맥락에서 새 단어를 배워 어휘력을 넓힙니다.
Nina|빠른 연습|짧은 세션, 반복, 피드백으로 빠르게 성장하기에 이상적입니다.
Seraphine|유창성|망설임 없이 말하고 생각을 매끄럽게 표현하는 데 집중합니다.
Sophie|문화 여행|소피는 매 시즌 세계 각지의 영어를 가르치며 수업을 문화 여행으로 바꿉니다.
Aria|일상 채팅|일상 대화에서 편안하게 자신을 표현할 수 있는 따뜻한 연습 공간입니다.
Brian|듣기|다양한 억양과 속도로 단계별 이해력을 키우는 듣기 연습을 합니다.
Elara|어휘|맥락 속 새 단어를 배워 자연스럽게 어휘를 늘리도록 돕습니다.
Lyra|유창성|쉬지 않고 말하고 아이디어를 유창하게 표현하는 데 집중합니다.
Max|발음과 리듬|자연스러운 발음과 문장 리듬에 집중하는 인내심 있는 파트너입니다.
Mira|빠른 연습|짧고 집중적인 세션, 반복, 피드백으로 성장을 지원합니다.`,

  hi: `Annie|बोलने का आत्मविश्वास|गलतियों से डरे बिना बोलने का आत्मविश्वास बढ़ाने के लिए सहायक माहौल प्रदान करता है।
Clara|दैनिक संवाद|कैफ़े, खरीदारी और यात्रा के लिए व्यावहारिक वाक्यों से बातचीत आसान बनाता है।
Frank|सुनना|विभिन्न उच्चारणों और नोट लेने की रणनीतियों के साथ सुनने का अभ्यास देता है।
James|उच्चारण और लय|प्राकृतिक उच्चारण और धाराप्रवाह वाक्यों पर केंद्रित धैर्यवान अभ्यास साथी।
Jhon|उच्चारण|कठिन ध्वनियों को क्रम से अभ्यास कर स्पष्ट बोलने में मदद करता है।
Lee|व्याकरण|बातचीत में नियमों को मजबूत कर प्राकृतिक और सही वाक्य बनाने में सहायता करता है।
Lin|शब्द भंडार|संवाद के संदर्भ में नए शब्द सिखाकर शब्द भंडार बढ़ाता है।
Nina|त्वरित अभ्यास|छोटे सत्र, दोहराव और फीडबैक के साथ तेज़ प्रगति के लिए आदर्श।
Seraphine|धाराप्रवाहता|हिचकिचाहट के बिना बोलने और विचारों को सहजता से व्यक्त करने पर ध्यान देता है।
Sophie|सांस्कृतिक यात्रा|सोफी हर सीज़न दुनिया भर से अंग्रेज़ी सिखाकर हर पाठ को सांस्कृतिक यात्रा बनाती है।
Aria|दैनिक चैट|रोज़मर्रा की बातचीत में आराम से खुद को व्यक्त करने के लिए गर्मजोशी भरा अभ्यास स्थान।
Brian|सुनना|विभिन्न उच्चारण और गति से क्रमशः समझ विकसित करने वाला सुनने का अभ्यास।
Elara|शब्द भंडार|संदर्भ में नए शब्द सीखकर प्राकृतिक रूप से शब्द भंडार बढ़ाने में मदद करता है।
Lyra|धाराप्रवाहता|रुके बिना बोलने और विचारों को धाराप्रवाह व्यक्त करने पर केंद्रित।
Max|उच्चारण और लय|प्राकृतिक उच्चारण और वाक्य लय पर केंद्रित धैर्यवान साथी।
Mira|त्वरित अभ्यास|छोटे, गहन सत्र, दोहराव और फीडबैक से प्रगति का समर्थन करता है।`,

  pt: `Annie|Confiança ao falar|Oferece um ambiente de apoio para ganhar confiança ao falar sem medo de errar.
Clara|Diálogo diário|Facilita a conversa com frases práticas para café, compras e viagens.
Frank|Escuta|Oferece prática de escuta com sotaques variados e estratégias de anotação.
James|Pronúncia e ritmo|Um parceiro paciente focado em pronúncia natural e frases fluentes.
Jhon|Pronúncia|Ajuda você a falar com clareza trabalhando sons difíceis passo a passo.
Lee|Gramática|Reforça regras na conversa para construir frases naturais e corretas.
Lin|Vocabulário|Expande o vocabulário ensinando palavras novas no contexto da conversa.
Nina|Prática rápida|Ideal para progresso rápido com sessões curtas, repetição e feedback.
Seraphine|Fluência|Foca em falar sem hesitar e expressar pensamentos com fluidez.
Sophie|Jornada cultural|Sophie transforma cada lição em uma jornada cultural, ensinando inglês do mundo todo a cada temporada.
Aria|Chat diário|Um espaço acolhedor e de apoio para se expressar com conforto no dia a dia.
Brian|Escuta|Desenvolve a compreensão passo a passo com prática de escuta em diferentes sotaques e velocidades.
Elara|Vocabulário|Ajuda a ampliar o vocabulário naturalmente aprendendo palavras novas em contexto.
Lyra|Fluência|Foca em falar sem pausas e expressar ideias com fluidez.
Max|Pronúncia e ritmo|Um parceiro paciente focado em pronúncia natural e ritmo das frases.
Mira|Prática rápida|Apoia seu progresso com sessões curtas e intensas, repetição e feedback.`,

  zh: `Annie|口语自信|提供支持性环境，让你在不怕犯错的情况下建立口语自信。
Clara|日常对话|用咖啡馆、购物和旅行中的实用表达让对话更轻松。
Frank|听力|通过不同口音的材料和笔记策略提供听力练习。
James|发音与节奏|专注自然发音和流利句子的耐心练习伙伴。
Jhon|发音|逐步练习难音，帮助你清晰表达。
Lee|语法|在对话中巩固语法规则，帮助你构建自然正确的句子。
Lin|词汇|在对话语境中学习新词，扩展词汇量。
Nina|快速练习|适合通过短课时、重复和反馈快速进步。
Seraphine|流利度|专注于不假思索地说话并流畅表达想法。
Sophie|文化之旅|Sophie 每个季节教授来自世界各地的英语，把每节课变成文化之旅。
Aria|日常聊天|温暖支持的环境，让你在日常对话中自在表达。
Brian|听力|通过不同口音和语速的听力练习逐步提升理解力。
Elara|词汇|在语境中学习新词，自然扩展词汇量。
Lyra|流利度|专注于不停顿地说话并流畅表达观点。
Max|发音与节奏|专注自然发音和句子节奏的耐心伙伴。
Mira|快速练习|通过简短高强度课程、重复和反馈支持你的进步。`,
};

function buildPacks() {
  const packs = {};
  for (const [locale, block] of Object.entries(PACK_LINES)) {
    const lines = block.trim().split('\n');
    if (lines.length !== TUTOR_ORDER.length) {
      throw new Error(
        `Locale ${locale}: expected ${TUTOR_ORDER.length} lines, got ${lines.length}`
      );
    }
    lines.forEach((line, i) => {
      const id = TUTOR_ORDER[i];
      const parts = line.split('|');
      if (parts.length < 3) {
        throw new Error(`Invalid line for ${locale}/${id}: ${line}`);
      }
      const displayName = parts[0].trim();
      const tagline = parts[1].trim();
      const description = parts.slice(2).join('|').trim();
      if (!packs[id]) packs[id] = {};
      packs[id][locale] = { displayName, tagline, description };
    });
  }
  return packs;
}

const packs = buildPacks();
const outPath = path.join(__dirname, '../data/tutor_locale_packs.json');
fs.writeFileSync(outPath, JSON.stringify(packs, null, 2), 'utf8');
console.log(`✅ ${outPath} — ${TUTOR_ORDER.length} tutors × ${Object.keys(PACK_LINES).length} locales`);
