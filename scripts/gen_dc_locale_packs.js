#!/usr/bin/env node
/**
 * dc_locale_packs.json üretir — satır sırası ENGLISH_DAILY_CONVERSATIONS ile aynı.
 * Çalıştır: node scripts/gen_dc_locale_packs.js
 */
const fs = require('fs');
const path = require('path');
const { ENGLISH_DAILY_CONVERSATIONS } = require('../data/english_daily_conversations');

/** title|subtitle — 60 satır, konu sırası dc_a1_01 … dc_c2_12 */
const LINES = {
  de: `Morgengruß|Tag starten
Wie war dein Tag?|Täglicher Check-in
Mittagsplausch|Mittagspause
Lieblingsgetränk|Café-Smalltalk
Gerade jetzt|Im Moment
Wochenendpläne|Einfache Zukunft
Danke & Tschüss|Höflicher Abschluss
Wettergespräch|Smalltalk
Was gibt's Neues?|Freundesupdate
Nach der Arbeit|Abendentspannung
Einkaufsgeschichte|Alltagsbesorgungen
Kochen heute Abend|Küchengespräch
Reiseerinnerung|Frühere Reise
Musik & Stimmung|Playlist
Nachbarschaftsgespräch|Lokales Leben
Handygewohnheiten|Technik im Alltag
Kaffeepausendebatte|Leichte Meinungen
Work-Life-Balance|Volle Woche
Soziale Pläne|Planung
Englisch lernen|Motivation
Gesunde Gewohnheiten|Wellness
Filmabend|Empfehlungen
Stadtleben|Urbanes Gespräch
Stress & Ruhe|Gefühle
Traumreise|Zukunftschat
Tagesnachrichten|Aktuelles
Remote vs. Büro|Arbeitskultur
Beziehungen|Privatleben
Geld-Mindset|Finanzgespräch
Kultur & Bräuche|Interkulturell
Karrierewechsel|Berufsweg
Podcasts & Bücher|Medienkonsum
Ethische Entscheidungen|Werte
Mentoring|Begleitung
Kreativitätsblock|Produktivität
Zukunft der KI|Tech-Gesellschaft
Identität & Zugehörigkeit|Tiefgreifend persönlich
Überzeugung im Leben|Einfluss
Humor über Kulturen|Komische Nuancen
Führungsmomente|Einfluss
Privatsphäre & Vertrauen|Digitales Leben
Klimagespräche|Großes Thema
Kunst, die bewegte|Ästhetik
Verhandlungsgeschichte|Deal-making
Mentoring-Erfahrung|Wachstum
Sprache & Denken|Sprachwissenschaft
Risiko & Reue|Lebensentscheidungen
Gemeinschaft aufbauen|Soziales Gefüge
Philosophie beim Kaffee|Große Fragen
Rhetorik in den Medien|Diskurs
Macht & Ethik|Institutionen
Kreativität & KI|Zukunft des Handwerks
Globales Englisch|Weltsprache
Erinnerung & Geschichte|Erzählung
Wirtschaft & Leben|Makro–Mikro
Gerechtigkeitsdebatte|Moralsysteme
Wissenschaft & Gesellschaft|Öffentliches Verständnis
Improvisationsmeisterkurs|Ohne Vorbereitung
Register-Spiel|Stilwechsel
Offene Lounge|Freier Chat`,

  fr: `Bonjour du matin|Commencer la journée
Comment s'est passée ta journée ?|Check-in quotidien
Pause déjeuner|Pause de midi
Boisson préférée|Small talk au café
En ce moment|Instant présent
Plans du week-end|Futur simple
Merci et au revoir|Clôture polie
Météo|Small talk
Se retrouver|Mise à jour entre amis
Après le travail|Détente du soir
Histoire de courses|Courses du quotidien
Cuisine ce soir|Discussion cuisine
Souvenir de voyage|Voyage passé
Musique et humeur|Playlist
Discussion de quartier|Vie locale
Habitudes téléphone|Tech quotidienne
Débat pause café|Opinions légères
Équilibre vie pro–perso|Semaine chargée
Plans sociaux|Organisation
Apprendre l'anglais|Motivation
Habitudes saines|Bien-être
Soirée cinéma|Recommandations
Vie en ville|Discussion urbaine
Stress et calme|Émotions
Voyage de rêve|Discussion future
Actualités du jour|Événements actuels
Télétravail ou bureau|Culture du travail
Relations|Vie personnelle
Rapport à l'argent|Discussion finance
Culture et coutumes|Interculturel
Reconversion|Parcours professionnel
Podcasts et livres|Diète média
Choix éthiques|Valeurs
Mentorat|Accompagnement
Blocage créatif|Productivité
Avenir de l'IA|Société tech
Identité et appartenance|Personnel profond
Persuasion au quotidien|Influence
Humour interculturel|Nuances comiques
Moments de leadership|Influence
Vie privée et confiance|Vie numérique
Conversations climat|Grand sujet
Art qui t'a touché|Esthétique
Histoire de négociation|Conclusion d'accord
Expérience de mentorat|Croissance
Langue et pensée|Linguistique
Risque et regret|Choix de vie
Construire une communauté|Tissu social
Philosophie autour d'un café|Grandes questions
Rhétorique dans les médias|Discours
Pouvoir et éthique|Institutions
Créativité et IA|Artisanat futur
Anglais mondial|Langue mondiale
Mémoire et récit|Narration
Économie et vie|Macro–micro
Débat sur la justice|Systèmes moraux
Science et société|Compréhension publique
Masterclass d'impro|Sans préparation
Jeu de registres|Changement de style
Salon libre|Discussion libre`,

  it: `Saluto del mattino|Iniziare la giornata
Com'è andata la giornata?|Check-in quotidiano
Chiacchierata a pranzo|Pausa di mezzogiorno
Bevanda preferita|Small talk al bar
Proprio ora|Momento presente
Piani del weekend|Futuro semplice
Grazie e arrivederci|Chiusura educata
Chiacchierata sul tempo|Small talk
Aggiornamento tra amici|Novità
Dopo il lavoro|Relax serale
Storia di spesa|Commissioni
Cucina stasera|Chiacchiera in cucina
Ricordo di viaggio|Viaggio passato
Musica e umore|Playlist
Chiacchiera di quartiere|Vita locale
Abitudini col telefono|Tech quotidiana
Dibattito pausa caffè|Opinioni leggere
Equilibrio lavoro–vita|Settimana intensa
Piani sociali|Organizzazione
Imparare l'inglese|Motivazione
Abitudini sane|Benessere
Serata film|Consigli
Vita in città|Chiacchiera urbana
Stress e calma|Emozioni
Viaggio dei sogni|Chiacchiera futura
Notizie del giorno|Attualità
Smart working o ufficio|Cultura del lavoro
Relazioni|Vita personale
Mentalità sul denaro|Finanza
Cultura e usanze|Interculturale
Cambio di carriera|Percorso professionale
Podcast e libri|Dieta media
Scelte etiche|Valori
Mentoring|Guida
Blocco creativo|Produttività
Futuro dell'IA|Società tech
Identità e appartenenza|Personale profondo
Persuasione nella vita|Influenza
Umorismo tra culture|Sfumature comiche
Momenti di leadership|Influenza
Privacy e fiducia|Vita digitale
Conversazioni sul clima|Grande tema
Arte che ti ha colpito|Estetica
Storia di negoziazione|Accordo
Esperienza di mentoring|Crescita
Lingua e pensiero|Linguistica
Rischio e rimpianto|Scelte di vita
Costruire comunità|Tessuto sociale
Filosofia al caffè|Grandi domande
Retorica nei media|Discorso
Potere ed etica|Istituzioni
Creatività e IA|Mestiere futuro
Inglese globale|Lingua mondiale
Memoria e storia|Narrazione
Economia e vita|Macro–micro
Dibattito sulla giustizia|Sistemi morali
Scienza e società|Comprensione pubblica
Masterclass improvvisata|Senza preparazione
Gioco di registro|Cambio stile
Lounge aperta|Chat libera`,

  es: `Saludo matutino|Empezar el día
¿Qué tal tu día?|Check-in diario
Charla del almuerzo|Pausa del mediodía
Bebida favorita|Charla de café
Ahora mismo|Momento presente
Planes de fin de semana|Futuro simple
Gracias y adiós|Cierre educado
Charla del tiempo|Small talk
Ponerse al día|Actualización entre amigos
Después del trabajo|Relax nocturno
Historia de compras|Recados
Cocinar esta noche|Charla de cocina
Recuerdo de viaje|Viaje pasado
Música y ánimo|Playlist
Charla con vecinos|Vida local
Hábitos del móvil|Tecnología diaria
Debate en la pausa del café|Opiniones ligeras
Equilibrio trabajo–vida|Semana ocupada
Planes sociales|Organización
Aprender inglés|Motivación
Hábitos saludables|Bienestar
Noche de película|Recomendaciones
Vida en la ciudad|Charla urbana
Estrés y calma|Emociones
Viaje soñado|Charla futura
Noticias del día|Actualidad
¿Remoto u oficina?|Cultura laboral
Relaciones|Vida personal
Mentalidad del dinero|Finanzas
Cultura y costumbres|Intercultural
Cambio de carrera|Trayectoria profesional
Podcasts y libros|Dieta mediática
Decisiones éticas|Valores
Mentoría|Orientación
Bloqueo creativo|Productividad
Futuro de la IA|Sociedad tech
Identidad y pertenencia|Personal profundo
Persuasión en la vida|Influencia
Humor entre culturas|Matices cómicos
Momentos de liderazgo|Influencia
Privacidad y confianza|Vida digital
Conversaciones climáticas|Gran tema
Arte que te marcó|Estética
Historia de negociación|Acuerdo
Experiencia de mentoría|Crecimiento
Lengua y pensamiento|Lingüística
Riesgo y arrepentimiento|Decisiones vitales
Construir comunidad|Tejido social
Filosofía con café|Grandes preguntas
Retórica en medios|Discurso
Poder y ética|Instituciones
Creatividad e IA|Oficio futuro
Inglés global|Lengua mundial
Memoria e historia|Narrativa
Economía y vida|Macro–micro
Debate sobre justicia|Sistemas morales
Ciencia y sociedad|Comprensión pública
Clase magistral improvisada|Sin preparación
Juego de registro|Cambio de estilo
Salón abierto|Charla libre`,

  pt: `Saudação matinal|Começar o dia
Como foi o seu dia?|Check-in diário
Conversa do almoço|Pausa do meio-dia
Bebida favorita|Conversa de café
Agora mesmo|Momento presente
Planos de fim de semana|Futuro simples
Obrigado e tchau|Encerramento educado
Conversa sobre o tempo|Small talk
Colocar o papo em dia|Atualização entre amigos
Depois do trabalho|Relaxar à noite
História de compras|Recados
Cozinhar hoje à noite|Conversa na cozinha
Memória de viagem|Viagem passada
Música e humor|Playlist
Conversa com vizinhos|Vida local
Hábitos do celular|Tecnologia diária
Debate na pausa do café|Opiniões leves
Equilíbrio trabalho–vida|Semana cheia
Planos sociais|Organização
Aprender inglês|Motivação
Hábitos saudáveis|Bem-estar
Noite de filme|Recomendações
Vida na cidade|Conversa urbana
Estresse e calma|Emoções
Viagem dos sonhos|Conversa futura
Notícias do dia|Atualidades
Remoto ou escritório?|Cultura de trabalho
Relacionamentos|Vida pessoal
Mentalidade financeira|Finanças
Cultura e costumes|Intercultural
Mudança de carreira|Trajetória profissional
Podcasts e livros|Dieta de mídia
Escolhas éticas|Valores
Mentoria|Orientação
Bloqueio criativo|Produtividade
Futuro da IA|Sociedade tech
Identidade e pertencimento|Pessoal profundo
Persuasão na vida|Influência
Humor entre culturas|Nuances cômicas
Momentos de liderança|Influência
Privacidade e confiança|Vida digital
Conversas sobre clima|Grande tema
Arte que te marcou|Estética
História de negociação|Acordo
Experiência de mentoria|Crescimento
Língua e pensamento|Linguística
Risco e arrependimento|Escolhas de vida
Construir comunidade|Tecido social
Filosofia no café|Grandes perguntas
Retórica na mídia|Discurso
Poder e ética|Instituições
Criatividade e IA|Ofício do futuro
Inglês global|Língua mundial
Memória e história|Narrativa
Economia e vida|Macro–micro
Debate sobre justiça|Sistemas morais
Ciência e sociedade|Compreensão pública
Aula improvisada|Sem preparação
Jogo de registro|Mudança de estilo
Lounge aberta|Conversa livre`,

  ja: `朝のあいさつ|一日の始まり
今日はどうだった？|毎日のチェックイン
ランチタイムの雑談|昼休み
好きな飲み物|カフェの雑談
今この瞬間|いまの話題
週末の予定|シンプルな未来
お礼とさようなら|丁寧な締め
天気の話|雑談
近況トーク|友だちアップデート
仕事のあと|夜のリラックス
買い物エピソード|日常の用事
今夜の料理|キッチントーク
旅行の思い出|過去の旅
音楽と気分|プレイリスト
近所の話|地域の生活
スマホの習慣|日常のテック
コーヒーブレイク討論|軽い意見
ワークライフバランス|忙しい一週間
社交の予定|計画づくり
英語学習|モチベーション
健康的な習慣|ウェルネス
映画の夜|おすすめ
都市生活|都会の話
ストレスと落ち着き|感情
夢の旅|未来の話
今日のニュース|時事
リモートかオフィスか|仕事文化
人間関係|私生活
お金の考え方|お金の話
文化と習慣|異文化
キャリア転換|職業の道
ポッドキャストと本|メディア
倫理の選択|価値観
メンタリング|ガイダンス
創造の行き詰まり|生産性
AIの未来|テック社会
アイデンティティと所属|深い個人的話
説得の瞬間|影響力
文化を越えるユーモア|コメディのニュアンス
リーダーシップの瞬間|影響力
プライバシーと信頼|デジタル生活
気候の会話|大きなテーマ
心を動かした芸術|美学
交渉の話|合意づくり
メンター体験|成長
言語と思考|言語学
リスクと後悔|人生の選択
コミュニティづくり|社会的つながり
コーヒーと哲学|大きな問い
メディアのレトリック|言説
権力と倫理|制度
創造性とAI|未来の職
グローバル英語|世界語
記憶と物語|ナラティブ
経済と生活|マクロとミクロ
正義の議論|道徳体系
科学と社会|公共理解
即興マスタークラス|準備なし
レジスター遊び|スタイル転換
オープンラウンジ|自由な会話`,

  ko: `아침 인사|하루 시작
오늘 하루 어땠어요?|일일 체크인
점심 수다|점심 휴식
좋아하는 음료|카페 스몰토크
지금 이 순간|현재 이야기
주말 계획|간단한 미래
감사와 작별|정중한 마무리
날씨 이야기|스몰토크
근황 톡|친구 업데이트
퇴근 후|저녁 휴식
쇼핑 이야기|일상 심부름
오늘 저녁 요리|주방 대화
여행 추억|지난 여행
음악과 기분|플레이리스트
이웃 이야기|동네 생활
폰 습관|일상 테크
커피 브레이크 토론|가벼운 의견
일과 삶의 균형|바쁜 한 주
모임 계획|계획 세우기
영어 배우기|동기
건강한 습관|웰니스
영화의 밤|추천
도시 생활|도시 대화
스트레스와 평온|감정
꿈의 여행|미래 대화
오늘의 뉴스|시사
재택 vs 사무실|직장 문화
관계|개인 생활
돈 마인드셋|재정 대화
문화와 관습|문화 간
커리어 전환|직업 경로
팟캐스트와 책|미디어
윤리적 선택|가치
멘토링|안내
창의성 막힘|생산성
AI의 미래|테크 사회
정체성과 소속|깊은 개인
설득의 순간|영향력
문화 간 유머|코믹 뉘앙스
리더십 순간|영향력
프라이버시와 신뢰|디지털 생활
기후 대화|큰 주제
마음을 움직인 예술|미학
협상 이야기|합의
멘토 경험|성장
언어와 사고|언어학
위험과 후회|인생 선택
커뮤니티 만들기|사회적 연결
커피와 철학|큰 질문
미디어의 수사|담론
권력과 윤리|제도
창의성과 AI|미래 직업
글로벌 영어|세계어
기억과 이야기|서사
경제와 삶|거시–미시
정의 토론|도덕 체계
과학과 사회|공공 이해
즉흥 마스터클래스|준비 없음
어조 놀이|스타일 전환
오픈 라운지|자유 대화`,

  zh: `早晨问候|开始一天
今天过得怎么样？|每日问候
午餐闲聊|午间休息
最爱的饮品|咖啡馆闲聊
此刻|当下话题
周末计划|简单未来
感谢与告别|礼貌收尾
天气闲聊|寒暄
近况聊聊|朋友近况
下班后|晚间放松
购物故事|日常琐事
今晚做饭|厨房话题
旅行回忆|过往旅程
音乐与心情|歌单
邻里闲聊|社区生活
手机习惯|日常科技
咖啡休息辩论|轻松观点
工作生活平衡|忙碌一周
社交计划|做计划
学英语|动力
健康习惯|身心健康
电影之夜|推荐
城市生活|都市话题
压力与平静|情绪
梦想之旅|未来话题
每日新闻|时事
远程还是办公室|工作文化
人际关系|私人生活
金钱观念|理财话题
文化与习俗|跨文化
职业转型|职业路径
播客与书籍|媒体摄入
伦理选择|价值观
导师经历|指导
创意瓶颈|生产力
AI的未来|科技社会
身份与归属|深层个人
说服时刻|影响力
跨文化幽默|喜剧细微
领导力时刻|影响力
隐私与信任|数字生活
气候对话|大话题
触动你的艺术|美学
谈判故事|达成协议
导师体验|成长
语言与思维|语言学
风险与遗憾|人生选择
建设社区|社会纽带
咖啡哲学|大问题
媒体修辞|话语
权力与伦理|制度
创意与AI|未来技艺
全球英语|世界语言
记忆与故事|叙事
经济与生活|宏观微观
正义辩论|道德体系
科学与社会|公众理解
即兴大师课|无准备
语域游戏|风格切换
开放沙龙|自由聊天`,

  hi: `सुबह का अभिवादन|दिन की शुरुआत
आपका दिन कैसा रहा?|दैनिक चेक-इन
लंच की बातचीत|दोपहर का ब्रेक
पसंदीदा पेय|कैफ़े की हल्की बात
अभी इस वक्त|वर्तमान पल
वीकेंड की योजना|साधारण भविष्य
धन्यवाद और विदा|विनम्र समापन
मौसम की बात|छोटी बातचीत
कैच-अप|दोस्तों का अपडेट
काम के बाद|शाम की आराम
खरीदारी की कहानी|रोज़ के काम
आज रात खाना|रसोई की बात
यात्रा की याद|पिछली यात्रा
संगीत और मूड|प्लेलिस्ट
पड़ोस की बात|स्थानीय जीवन
फ़ोन की आदतें|रोज़ की टेक
कॉफ़ी ब्रेक बहस|हल्की राय
काम–जीवन संतुलन|व्यस्त सप्ताह
सामाजिक योजनाएँ|योजना बनाना
अंग्रेज़ी सीखना|प्रेरणा
स्वस्थ आदतें|कल्याण
फ़िल्म की रात|सिफ़ारिशें
शहर का जीवन|शहरी बात
तनाव और शांति|भावनाएँ
सपनों की यात्रा|भविष्य की बात
दैनिक समाचार|चर्चा का विषय
रिमोट या ऑफिस|काम की संस्कृति
रिश्ते|निजी जीवन
पैसे की सोच|वित्त की बात
संस्कृति और रीति|अंतर-सांस्कृतिक
करियर बदलाव|पेशेवर रास्ता
पॉडकास्ट और किताबें|मीडिया
नैतिक चुनाव|मूल्य
मेंटरिंग|मार्गदर्शन
रचनात्मक अवरोध|उत्पादकता
AI का भविष्य|टेक समाज
पहचान और अपनापन|गहन व्यक्तिगत
प्रेरणा का क्षण|प्रभाव
संस्कृतियों में हास्य|हास्य के सूक्ष्म
नेतृत्व के पल|प्रभाव
गोपनीयता और विश्वास|डिजिटल जीवन
जलवायु बातचीत|बड़ा विषय
कला जो छू गई|सौंदर्य
बातचीत की कहानी|सौदा
मेंटर अनुभव|विकास
भाषा और विचार|भाषाविज्ञान
जोखिम और पछतावा|जीवन के चुनाव
समुदाय बनाना|सामाजिक ताना
कॉफ़ी पर दर्शन|बड़े सवाल
मीडिया में अलंकार|प्रवचन
शक्ति और नैतिकता|संस्थाएँ
रचनात्मकता और AI|भविष्य का हुनर
वैश्विक अंग्रेज़ी|विश्व भाषा
स्मृति और कथा|कथा
अर्थव्यवस्था और जीवन|मैक्रो–माइक्रो
न्याय की बहस|नैतिक प्रणाली
विज्ञान और समाज|सार्वजनिक समझ
इम्प्रो मास्टरक्लास|बिना तैयारी
शैली का खेल|शैली बदलना
खुला लाउंज|मुक्त बातचीत`,

  ru: `Утреннее приветствие|Начало дня
Как прошёл день?|Ежедневный чек-ин
Обеденный разговор|Обеденный перерыв
Любимый напиток|Разговор в кафе
Прямо сейчас|Настоящий момент
Планы на выходные|Простое будущее
Спасибо и до свидания|Вежливое завершение
Разговор о погоде|Светская беседа
Как дела?|Новости друга
После работы|Вечерний отдых
История покупок|Бытовые дела
Ужин сегодня|Кухонный разговор
Воспоминание о поездке|Прошлое путешествие
Музыка и настроение|Плейлист
Разговор с соседями|Местная жизнь
Привычки с телефоном|Повседневные технологии
Дебаты на кофе-брейке|Лёгкие мнения
Баланс работы и жизни|Напряжённая неделя
Социальные планы|Планирование
Изучение английского|Мотивация
Здоровые привычки|Благополучие
Киновечер|Рекомендации
Городская жизнь|Городской разговор
Стресс и спокойствие|Чувства
Путешествие мечты|Разговор о будущем
Новости дня|Текущие события
Удалёнка или офис|Рабочая культура
Отношения|Личная жизнь
Отношение к деньгам|Финансовый разговор
Культура и обычаи|Межкультурное
Смена карьеры|Профессиональный путь
Подкасты и книги|Медиадиета
Этические выборы|Ценности
Наставничество|Руководство
Творческий тупик|Продуктивность
Будущее ИИ|Технообщество
Идентичность и принадлежность|Глубоко личное
Убеждение в жизни|Влияние
Юмор между культурами|Комические нюансы
Моменты лидерства|Влияние
Приватность и доверие|Цифровая жизнь
Разговоры о климате|Большая тема
Искусство, что тронуло|Эстетика
История переговоров|Сделка
Опыт наставника|Рост
Язык и мышление|Лингвистика
Риск и сожаление|Жизненные выборы
Создание сообщества|Социальная ткань
Философия за кофе|Большие вопросы
Риторика в медиа|Дискурс
Власть и этика|Институты
Творчество и ИИ|Ремесло будущего
Глобальный английский|Мировой язык
Память и история|Повествование
Экономика и жизнь|Макро–микро
Дебаты о справедливости|Моральные системы
Наука и общество|Общественное понимание
Мастер-класс импровизации|Без подготовки
Игра регистров|Смена стиля
Открытая гостиная|Свободный чат`,
};

function buildPack(locale) {
  const raw = LINES[locale];
  if (!raw) throw new Error(`Missing LINES for ${locale}`);
  const lines = raw.trim().split('\n');
  if (lines.length !== ENGLISH_DAILY_CONVERSATIONS.length) {
    throw new Error(
      `${locale}: expected ${ENGLISH_DAILY_CONVERSATIONS.length} lines, got ${lines.length}`,
    );
  }
  const pack = {};
  for (let i = 0; i < ENGLISH_DAILY_CONVERSATIONS.length; i++) {
    const id = ENGLISH_DAILY_CONVERSATIONS[i].id;
    const parts = lines[i].split('|');
    if (parts.length !== 2) {
      throw new Error(`${locale} line ${i + 1}: bad format "${lines[i]}"`);
    }
    pack[id] = [parts[0].trim(), parts[1].trim()];
  }
  return pack;
}

const out = {};
for (const locale of Object.keys(LINES)) {
  out[locale] = buildPack(locale);
}

const outPath = path.join(__dirname, '../data/dc_locales/dc_locale_packs.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log('[DC] wrote', outPath, 'locales:', Object.keys(out).join(', '));
