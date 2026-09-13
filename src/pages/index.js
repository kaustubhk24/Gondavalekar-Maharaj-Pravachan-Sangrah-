import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PwaInstallButton from '../components/PwaInstallButton';
import availableDatesHi from '../data/availableDates-hi.json';
import styles from './index.module.css';

const languages = [
  { id: 'hi', label: 'हिंदी' },
  { id: 'mr', label: 'मराठी', isNew: true },
  { id: 'en', label: 'English' },
];

const LANGUAGE_STORAGE_KEY = 'pravachan-selected-language';
const NEW_LANGUAGE_NOTICE_KEY = 'pravachan-new-language-notice';

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'hi';

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return languages.some((language) => language.id === storedLanguage) ? storedLanguage : 'hi';
  } catch (error) {
    return 'hi';
  }
};

const getUnseenNewLanguage = () => {
  if (typeof window === 'undefined') return null;

  try {
    const notifiedLanguages = JSON.parse(window.localStorage.getItem(NEW_LANGUAGE_NOTICE_KEY) || '[]');
    return languages.find((language) => language.isNew && !notifiedLanguages.includes(language.id)) || null;
  } catch (error) {
    return languages.find((language) => language.isNew) || null;
  }
};

const buildPravachanUrl = (date, lang) => `/pravachans/${lang}/${date}.md`;
const DATE_REFERENCE_YEAR = 2024;

const getLocalizedText = (selectedLang) => {
  if (selectedLang === 'en') {
    return {
      loading: 'Loading...',
      noDate: 'No available date found.',
      unavailable: 'Pravachan is not available for this date. Please try another language or date.',
      emptyState: 'Coming soon',
      splash: 'Loading pravachan collection...',
      dateLabel: 'Date',
      languageLabel: 'Language',
      monthLabel: 'Month',
      calendarSubtitle: 'Choose an available day',
      prevButton: '← Previous',
      nextButton: 'Next →',
      heroTitle: 'Pravachan collection',
      heroDescription: 'Choose a date and language to read the pravachan.',
      newLanguageNotice: (language) => `${language} is now available.`,
      dismiss: 'Dismiss',
    };
  }

  if (selectedLang === 'mr') {
    return {
      loading: 'लोड होत आहे...',
      noDate: 'उपलब्ध तारीख सापडली नाही.',
      unavailable: 'या तारखेसाठी प्रवचन उपलब्ध नाही. कृपया दुसरी भाषा किंवा तारीख निवडा.',
      emptyState: 'लवकरच उपलब्ध होईल',
      splash: 'प्रवचन संग्रह लोड होत आहे...',
      dateLabel: 'तारीख',
      languageLabel: 'भाषा',
      monthLabel: 'महिना',
      calendarSubtitle: 'उपलब्ध दिवस निवडा',
      prevButton: '← मागील',
      nextButton: 'पुढील →',
      heroTitle: 'प्रवचन संग्रह',
      heroDescription: 'प्रवचन वाचण्यासाठी तारीख आणि भाषा निवडा.',
      newLanguageNotice: (language) => `${language} आता उपलब्ध आहे.`,
      dismiss: 'बंद करा',
    };
  }

  return {
    loading: 'लोड हो रहा है...',
    noDate: 'कोई उपलब्ध दिनांक नहीं मिला।',
    unavailable: 'इस तारीख के लिए प्रवचन उपलब्ध नहीं है। कृपया कोई दूसरी भाषा या तारीख चुनें।',
    emptyState: 'जल्द आ रहा है',
    splash: 'प्रवचन संग्रह लोड हो रहा है...',
    dateLabel: 'तारीख',
    languageLabel: 'भाषा',
    monthLabel: 'माह',
    calendarSubtitle: 'उपलब्ध दिन चुनें',
    prevButton: '← पिछला',
    nextButton: 'अगला →',
    heroTitle: 'प्रवचन संग्रह',
    heroDescription: 'तारीख और भाषा चुनें। वर्तमान तारीख के लिए प्रवचन पहले दिखाया जाएगा।',
    newLanguageNotice: (language) => `${language} अब उपलब्ध है।`,
    dismiss: 'बंद करें',
  };
};

const parseDateParts = (dateKey) => {
  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateKey);
  if (isoMatch) {
    return { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) };
  }

  const shortMatch = /^([0-9]{2})-([0-9]{2})$/.exec(dateKey);
  if (shortMatch) {
    return { year: DATE_REFERENCE_YEAR, month: Number(shortMatch[1]), day: Number(shortMatch[2]) };
  }

  return null;
};

const compareDateKeys = (left, right) => {
  const leftParts = parseDateParts(left);
  const rightParts = parseDateParts(right);

  if (!leftParts || !rightParts) {
    return 0;
  }

  const leftTime = Date.UTC(DATE_REFERENCE_YEAR, leftParts.month - 1, leftParts.day);
  const rightTime = Date.UTC(DATE_REFERENCE_YEAR, rightParts.month - 1, rightParts.day);
  return leftTime - rightTime;
};

const formatDateLabel = (dateKey, locale = 'hi-IN') => {
  const parts = parseDateParts(dateKey);
  if (!parts) {
    return dateKey;
  }

  const safeDate = new Date(DATE_REFERENCE_YEAR, parts.month - 1, parts.day);
  return safeDate.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
  });
};

const getTodayKey = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${month}-${day}`;
};

const availableDates = Array.isArray(availableDatesHi)
  ? [...availableDatesHi].sort(compareDateKeys)
  : [];
const defaultDate = (() => {
  const todayKey = getTodayKey();
  return availableDates.includes(todayKey) ? todayKey : availableDates[0] || todayKey;
})();

const fetchPravachan = async (date, lang) => {
  const url = buildPravachanUrl(date, lang);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Pravachan not available');
  }
  return response.text();
};

const formatDate = (dateString, locale = 'hi-IN') => {
  return formatDateLabel(dateString, locale);
};

const formatDateOption = (dateString, locale = 'hi-IN') => {
  return formatDateLabel(dateString, locale);
};

const getLocale = (selectedLang) => {
  if (selectedLang === 'en') return 'en-IN';
  if (selectedLang === 'mr') return 'mr-IN';
  return 'hi-IN';
};

const getMonthLabels = (selectedLang) => Array.from({ length: 12 }, (_, index) =>
  new Date(2024, index, 1).toLocaleDateString(getLocale(selectedLang), { month: 'long' }),
);

const weekDaysByLanguage = {
  hi: ['रवि', 'सोम', 'मंग', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const availableDatesByMonth = availableDates.reduce((acc, key) => {
  const parts = parseDateParts(key);
  if (!parts) return acc;
  if (!acc[parts.month]) {
    acc[parts.month] = [];
  }
  acc[parts.month].push(parts.day);
  return acc;
}, {});

const availableMonths = Object.keys(availableDatesByMonth)
  .map(Number)
  .sort((a, b) => a - b);

const availableSet = new Set(availableDates);

const getDateKeyFromDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const getAdjacentAvailableDate = (dateKey, direction) => {
  const parts = parseDateParts(dateKey);
  if (!parts) {
    return null;
  }

  let cursor = new Date(DATE_REFERENCE_YEAR, parts.month - 1, parts.day);
  const step = direction === 'next' ? 1 : -1;

  for (let index = 0; index < 400; index += 1) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + step);
    const candidate = getDateKeyFromDate(cursor);
    if (availableSet.has(candidate)) {
      return candidate;
    }
  }

  return null;
};

const getMonthDays = (month) => new Date(2024, month, 0).getDate();
const getFirstDayIndex = (month) => new Date(2024, month - 1, 1).getDay();

const defaultSelectedMonth = parseDateParts(defaultDate)?.month || availableMonths[0] || 1;

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedLang, setSelectedLang] = useState('hi');
  const [selectedMonth, setSelectedMonth] = useState(defaultSelectedMonth);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [newLanguage, setNewLanguage] = useState(null);

  useEffect(() => {
    setSelectedLang(getStoredLanguage());
  }, []);

  useEffect(() => {
    setNewLanguage(getUnseenNewLanguage());
  }, []);

  const dismissNewLanguageNotice = () => {
    if (!newLanguage) return;

    try {
      const notifiedLanguages = JSON.parse(window.localStorage.getItem(NEW_LANGUAGE_NOTICE_KEY) || '[]');
      if (!notifiedLanguages.includes(newLanguage.id)) {
        window.localStorage.setItem(
          NEW_LANGUAGE_NOTICE_KEY,
          JSON.stringify([...notifiedLanguages, newLanguage.id]),
        );
      }
    } catch (error) {
    }
    setNewLanguage(null);
  };

  const handleLanguageChange = (event) => {
    const language = event.target.value;
    setSelectedLang(language);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (!showSplash) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => setShowSplash(false), 1000);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [showSplash]);

  useEffect(() => {
    const loadPravachan = async () => {
      if (!selectedDate) {
+        setError(getLocalizedText(selectedLang).noDate);
        return;
      }

      setLoading(true);
      setError('');
      setContent('');
      try {
        const text = await fetchPravachan(selectedDate, selectedLang);
        setContent(text);
      } catch (err) {
        setError(getLocalizedText(selectedLang).unavailable);
      } finally {
        setLoading(false);
      }
    };
    loadPravachan();
  }, [selectedDate, selectedLang]);

  useEffect(() => {
    const parts = parseDateParts(selectedDate);
    if (parts) {
      setSelectedMonth(parts.month);
    }
  }, [selectedDate]);

  const nextDate = getAdjacentAvailableDate(selectedDate, 'next');
  const prevDate = getAdjacentAvailableDate(selectedDate, 'prev');
  const hasPrev = Boolean(prevDate);
  const hasNext = Boolean(nextDate);

  const monthDays = getMonthDays(selectedMonth);
  const firstDayIndex = getFirstDayIndex(selectedMonth);
  const monthAvailableDays = new Set(availableDatesByMonth[selectedMonth] || []);
  const locale = getLocale(selectedLang);
  const monthLabels = getMonthLabels(selectedLang);
  const weekDays = weekDaysByLanguage[selectedLang] || weekDaysByLanguage.hi;

  const localizedText = getLocalizedText(selectedLang);

  return (
    <Layout title={localizedText.heroTitle} description={selectedLang === 'en' ? 'Choose a date and language to read the pravachan.' : 'दिनांक व भाषा निवडा आणि प्रवचन वाचा.'}>
      {showSplash && (
        <div className={styles.splashScreen} role="dialog" aria-label={localizedText.splash}>
          <img src="/img/maharaj.jpg" alt="Maharaj" className={styles.splashImage} />
          <div className={styles.splashText}>{localizedText.splash}</div>
        </div>
      )}
      <main className={styles.page}>
        <PwaInstallButton />

        <section className={styles.hero}>
          <div>
            <h1>{localizedText.heroTitle}</h1>
            <p>{localizedText.heroDescription}</p>
          </div>
        </section>

        {newLanguage && (
          <div className={styles.languageNotice} role="status">
            <span>{localizedText.newLanguageNotice(newLanguage.label)}</span>
            <button type="button" onClick={dismissNewLanguageNotice}>
              {localizedText.dismiss}
            </button>
          </div>
        )}

        <section className={styles.controls}>
          <div className={styles.datePickerWrapper}>
            <div className={styles.controlGroup}>
              <label htmlFor="date-picker">{localizedText.dateLabel}</label>
              <button
                type="button"
                id="date-picker"
                className={styles.datePickerButton}
                onClick={() => setCalendarOpen((open) => !open)}
              >
                {formatDate(selectedDate, locale)}
                <span className={styles.calendarIcon}>▾</span>
              </button>
            </div>

            {calendarOpen && (
              <>
                <div className={styles.calendarOverlay} onClick={() => setCalendarOpen(false)} />
                <div className={styles.calendarPopup}>
                <div className={styles.calendarPopupHeader}>
                  <div>
                    <div className={styles.calendarTitle}>{monthLabels[selectedMonth - 1]}</div>
                    <div className={styles.calendarSubtitle}>{localizedText.calendarSubtitle}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.calendarCloseButton}
                    onClick={() => setCalendarOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <div className={styles.popupRow}>
                  <label htmlFor="popup-month-select" className={styles.popupLabel}>
                    {localizedText.monthLabel}
                  </label>
                  <select
                    id="popup-month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className={styles.input}
                  >
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        {monthLabels[month - 1]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.weekDays}>
                  {weekDays.map((day) => (
                    <div key={day} className={styles.weekDay}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className={styles.dayCells}>
                  {Array.from({ length: firstDayIndex }).map((_, index) => (
                    <div key={`blank-${index}`} className={styles.dayCellBlank} />
                  ))}
                  {Array.from({ length: monthDays }).map((_, dayIndex) => {
                    const day = dayIndex + 1;
                    const dateKey = `${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isAvailable = monthAvailableDays.has(day);
                    const isSelected = selectedDate === dateKey;
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        className={
                          `${styles.dayCell} ${isAvailable ? styles.dayAvailable : styles.dayUnavailable} ${isSelected ? styles.daySelected : ''}`
                        }
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedDate(dateKey);
                            setCalendarOpen(false);
                          }
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
            )}
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="lang-select">{localizedText.languageLabel}</label>
            <select
              id="lang-select"
              value={selectedLang}
              onChange={handleLanguageChange}
              className={styles.input}
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.contentHeader}>
            <h2>{formatDate(selectedDate, locale)}</h2>
            <span className={styles.languageBadge}>{languages.find((lang) => lang.id === selectedLang)?.label}</span>
          </div>

          {loading && <div className={styles.message}>{localizedText.loading}</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && !content.trim() && (
            <div className={styles.emptyState}>{localizedText.emptyState}</div>
          )}
          {!loading && !error && content.trim() && (
            <article className={styles.markdown}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          )}
        </section>

        <section className={styles.navButtonsSection}>
          <div className={styles.navButtons}>
            <button
              className={styles.navButton}
              onClick={() => hasPrev && setSelectedDate(prevDate)}
              disabled={!hasPrev}
            >
              {localizedText.prevButton}
            </button>
            <button
              className={styles.navButton}
              onClick={() => hasNext && setSelectedDate(nextDate)}
              disabled={!hasNext}
            >
              {localizedText.nextButton}
            </button>
          </div>
        </section>
      </main>
    </Layout>
  );
}
