const db = require('../utils/db');
const TutorService = require('./tutorService');
const {
  mapPanelUser,
  mapPanelTutor,
  paginationMeta,
} = require('../utils/panelMappers');

const TZ_OFFSETS = {
  'Europe/Istanbul': '+03:00',
  UTC: '+00:00',
};

function getTimezone() {
  return process.env.PANEL_TIMEZONE || 'Europe/Istanbul';
}

function getDailyDays() {
  return Number(process.env.PANEL_DAILY_DAYS || 14);
}

async function safeQuery(sql, params = [], fallback = []) {
  try {
    return await db.query(sql, params);
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') return fallback;
    throw error;
  }
}

function userSelectSql() {
  return `
    SELECT
      u.*,
      (SELECT MAX(ut.created_at) FROM user_tokens ut WHERE ut.user_id = u.id) AS last_token_at,
      (SELECT COUNT(*) FROM conversations c WHERE c.user_id = u.id) AS conversation_count,
      (SELECT COUNT(*) FROM conversation_messages cm
        INNER JOIN conversations c2 ON c2.id = cm.conversation_id
        WHERE c2.user_id = u.id) AS message_count,
      uls.streak_days,
      uls.total_practice_minutes,
      CASE WHEN sub.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_premium,
      sub.plan_code AS premium_plan,
      sub.expires_at AS premium_expires_at
    FROM users u
    LEFT JOIN user_learning_stats uls ON uls.user_id = u.id
    LEFT JOIN (
      SELECT s1.user_id, s1.plan_code, s1.expires_at
      FROM subscriptions s1
      INNER JOIN (
        SELECT user_id, MAX(started_at) AS max_started
        FROM subscriptions
        WHERE status IN ('active', 'trial')
        GROUP BY user_id
      ) latest ON latest.user_id = s1.user_id AND latest.max_started = s1.started_at
      WHERE s1.status IN ('active', 'trial')
    ) sub ON sub.user_id = u.id
  `;
}

async function getAnalyse() {
  const tz = getTimezone();
  const offset = TZ_OFFSETS[tz] || '+00:00';
  const days = getDailyDays();

  const userTotals = (
    await db.query(
      `SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN DATE(CONVERT_TZ(u.account_created_date, '+00:00', ?)) = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', ?)) THEN 1 ELSE 0 END) AS newUsersToday,
        (SELECT COUNT(DISTINCT ut.user_id) FROM user_tokens ut
          WHERE DATE(CONVERT_TZ(ut.created_at, '+00:00', ?)) = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', ?))) AS loginsToday
      FROM users u`,
      [offset, offset, offset, offset]
    )
  )[0];

  const tutorTotals = (
    await safeQuery(
      `SELECT
        COUNT(*) AS totalTutors,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activeTutors
      FROM tutors`,
      [],
      [{ totalTutors: 0, activeTutors: 0 }]
    )
  )[0];

  const convToday = (
    await safeQuery(
      `SELECT COUNT(*) AS conversationsToday
       FROM conversations
       WHERE DATE(CONVERT_TZ(created_at, '+00:00', ?)) = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', ?))`,
      [offset, offset],
      [{ conversationsToday: 0 }]
    )
  )[0];

  const premiumTotals = (
    await safeQuery(
      `SELECT COUNT(DISTINCT user_id) AS premiumUsers
       FROM subscriptions
       WHERE status IN ('active', 'trial')`,
      [],
      [{ premiumUsers: 0 }]
    )
  )[0];

  const dailyUsers = await db.query(
    `SELECT
      DATE_FORMAT(CONVERT_TZ(u.account_created_date, '+00:00', ?), '%Y-%m-%d') AS date,
      COUNT(*) AS newUsers
    FROM users u
    WHERE u.account_created_date >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
    GROUP BY date
    ORDER BY date DESC`,
    [offset, days]
  );

  const dailyLogins = await safeQuery(
    `SELECT
      DATE_FORMAT(CONVERT_TZ(ut.created_at, '+00:00', ?), '%Y-%m-%d') AS date,
      COUNT(DISTINCT ut.user_id) AS logins
    FROM user_tokens ut
    WHERE ut.created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
    GROUP BY date
    ORDER BY date DESC`,
    [offset, days],
    []
  );

  const dailyConversations = await safeQuery(
    `SELECT
      DATE_FORMAT(CONVERT_TZ(c.created_at, '+00:00', ?), '%Y-%m-%d') AS date,
      COUNT(*) AS conversations
    FROM conversations c
    WHERE c.created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
    GROUP BY date
    ORDER BY date DESC`,
    [offset, days],
    []
  );

  const byDate = new Map();
  const addRow = (date, patch) => {
    if (!date) return;
    const row = byDate.get(date) || {
      date,
      logins: 0,
      newUsers: 0,
      conversations: 0,
    };
    Object.assign(row, patch);
    byDate.set(date, row);
  };

  dailyUsers.forEach((r) => addRow(r.date, { newUsers: Number(r.newUsers || 0) }));
  dailyLogins.forEach((r) => addRow(r.date, { logins: Number(r.logins || 0) }));
  dailyConversations.forEach((r) =>
    addRow(r.date, { conversations: Number(r.conversations || 0) })
  );

  const daily = [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));

  const topTutors = await safeQuery(
    `SELECT
      t.id AS tutorId,
      t.name AS title,
      COUNT(c.id) AS conversations
    FROM tutors t
    LEFT JOIN conversations c ON c.tutor_id = t.id
    GROUP BY t.id, t.name
    ORDER BY conversations DESC
    LIMIT 8`,
    [],
    []
  );

  const learnLangRows = await db.query(
    `SELECT learn_language_code AS code, COUNT(*) AS count
     FROM users
     WHERE learn_language_code IS NOT NULL AND learn_language_code != ''
     GROUP BY learn_language_code
     ORDER BY count DESC
     LIMIT 12`
  );

  const proficiencyRows = await db.query(
    `SELECT proficiency AS code, COUNT(*) AS count
     FROM users
     WHERE proficiency IS NOT NULL AND proficiency != ''
     GROUP BY proficiency
     ORDER BY count DESC
     LIMIT 12`
  );

  const totalLearn = learnLangRows.reduce((s, r) => s + Number(r.count || 0), 0);
  const totalProf = proficiencyRows.reduce((s, r) => s + Number(r.count || 0), 0);

  return {
    summary: {
      totalUsers: Number(userTotals?.totalUsers || 0),
      loginsToday: Number(userTotals?.loginsToday || 0),
      newUsersToday: Number(userTotals?.newUsersToday || 0),
      totalTutors: Number(tutorTotals?.totalTutors || 0),
      activeTutors: Number(tutorTotals?.activeTutors || 0),
      conversationsToday: Number(convToday?.conversationsToday || 0),
      premiumUsers: Number(premiumTotals?.premiumUsers || 0),
    },
    daily,
    audienceInsights: {
      totals: {
        usersWithLearnLanguage: totalLearn,
        usersWithProficiency: totalProf,
        premiumUsers: Number(premiumTotals?.premiumUsers || 0),
      },
      learnLanguages: learnLangRows.map((r) => ({
        code: r.code,
        label: r.code,
        count: Number(r.count),
        percent: totalLearn ? Math.round((Number(r.count) / totalLearn) * 1000) / 10 : 0,
      })),
      proficiencyLevels: proficiencyRows.map((r) => ({
        code: r.code,
        label: r.code,
        count: Number(r.count),
        percent: totalProf ? Math.round((Number(r.count) / totalProf) * 1000) / 10 : 0,
      })),
    },
    tutorsSummary: topTutors.length
      ? {
          topTutorsByConversations: topTutors.map((r) => ({
            tutorId: String(r.tutorId),
            title: r.title,
            conversations: Number(r.conversations),
          })),
        }
      : undefined,
  };
}

async function listUsers({ page, limit, search, premium }) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (premium) {
    where += ` AND u.id IN (
      SELECT user_id FROM subscriptions WHERE status IN ('active', 'trial')
    )`;
  }

  if (search) {
    where += ' AND (CAST(u.id AS CHAR) LIKE ? OR u.username LIKE ? OR u.credential LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  const countRows = await db.query(
    `SELECT COUNT(*) AS total FROM users u ${where}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const rows = await safeQuery(
    `${userSelectSql()}
    ${where}
    ORDER BY u.account_created_date DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset],
    []
  );

  return {
    data: rows.map(mapPanelUser),
    pagination: paginationMeta(page, limit, Number(total)),
  };
}

async function getUserById(id) {
  const rows = await safeQuery(`${userSelectSql()} WHERE u.id = ?`, [id], []);
  if (!rows.length) return null;
  return mapPanelUser(rows[0]);
}

async function patchUser(id, body) {
  const existing = await db.query('SELECT id FROM users WHERE id = ?', [id]);
  if (!existing.length) return null;

  const updates = [];
  const values = [];

  if (body.displayName !== undefined) {
    updates.push('username = ?');
    values.push(body.displayName);
  }

  const extras = body.extras || {};
  if (extras.nativeLang !== undefined) {
    updates.push('native_lang = ?');
    values.push(extras.nativeLang);
  }
  if (extras.learnLanguageCode !== undefined) {
    updates.push('learn_language_code = ?');
    values.push(extras.learnLanguageCode);
  }
  if (extras.proficiency !== undefined) {
    updates.push('proficiency = ?');
    values.push(extras.proficiency);
  }
  if (extras.dailyGoal !== undefined) {
    updates.push('daily_goal = ?');
    values.push(extras.dailyGoal);
  }

  if (updates.length) {
    values.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  return getUserById(id);
}

async function listPremiumUserIds() {
  const rows = await safeQuery(
    `SELECT DISTINCT user_id AS id
     FROM subscriptions
     WHERE status IN ('active', 'trial')
     ORDER BY user_id ASC`,
    [],
    []
  );
  return rows.map((r) => String(r.id));
}

async function listTutors({ page, limit, search, status }) {
  const items = await TutorService.listAllForPanel();
  let mapped = items.map(({ tutor, translations }) =>
    mapPanelTutor(
      tutor.toJSON({ includeInactive: true }),
      translations.map((t) => ({
        locale: t.locale,
        displayName: t.display_name,
        description: t.description,
        tagline: t.tagline,
      }))
    )
  );

  if (search) {
    const q = search.toLowerCase();
    mapped = mapped.filter((t) => {
      const hay = [t.id, t.title, t.description, t.extras?.voiceId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  if (status === 'published') mapped = mapped.filter((t) => t.status === 'published');
  if (status === 'archived') mapped = mapped.filter((t) => t.status === 'archived');

  mapped.sort((a, b) => {
    const ao = Number(a.extras?.sortOrder || 0);
    const bo = Number(b.extras?.sortOrder || 0);
    if (ao !== bo) return ao - bo;
    return String(a.title || '').localeCompare(String(b.title || ''), 'tr');
  });

  const total = mapped.length;
  const offset = (page - 1) * limit;
  const data = mapped.slice(offset, offset + limit);

  return {
    data,
    pagination: paginationMeta(page, limit, total),
    supportedLocales: TutorService.supportedLocales(),
  };
}

async function getTutorById(id) {
  const item = await TutorService.getForPanel(id);
  if (!item) return null;
  return mapPanelTutor(
    item.tutor.toJSON({ includeInactive: true }),
    item.translations.map((t) => ({
      locale: t.locale,
      displayName: t.display_name,
      description: t.description,
      tagline: t.tagline,
    }))
  );
}

function panelBodyToTutorPayload(body) {
  const titles = body.extras?.localizedTitles || {};
  const descriptions = body.extras?.localizedDescriptions || {};
  const taglines = body.extras?.localizedTaglines || {};
  const translations = { ...(body.extras?.translations || {}) };

  Object.keys(titles).forEach((locale) => {
    translations[locale] = {
      ...(translations[locale] || {}),
      displayName: titles[locale],
      description: descriptions[locale] ?? translations[locale]?.description,
      tagline: taglines[locale] ?? translations[locale]?.tagline,
    };
  });

  return {
    id: body.id,
    name: body.title || body.name,
    description: body.description,
    gender: body.category || body.gender,
    voiceId: body.extras?.voiceId,
    nativeLang: body.extras?.nativeLang,
    tagline: body.extras?.tagline,
    sortOrder: body.extras?.sortOrder,
    isActive: body.status !== 'archived',
    photoUrl: body.coverImageUrl || body.extras?.photoUrl,
    rivUrl: body.extras?.rivUrl,
    translations,
  };
}

async function createTutor(body) {
  const item = await TutorService.createFromPanel(panelBodyToTutorPayload(body));
  return getTutorById(item.tutor.id);
}

async function updateTutor(id, body) {
  await TutorService.updateFromPanel(id, panelBodyToTutorPayload(body));
  return getTutorById(id);
}

async function deleteTutor(id) {
  const item = await TutorService.deactivate(id);
  return item ? getTutorById(id) : null;
}

async function uploadTutorAsset(id, buffer, originalName, type) {
  const item = await TutorService.uploadAsset(id, buffer, originalName, type);
  return getTutorById(item.tutor.id);
}

module.exports = {
  getTimezone,
  getDailyDays,
  getAnalyse,
  listUsers,
  getUserById,
  patchUser,
  listPremiumUserIds,
  listTutors,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor,
  uploadTutorAsset,
};
