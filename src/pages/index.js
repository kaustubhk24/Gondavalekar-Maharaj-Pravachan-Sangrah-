import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PwaInstallButton from '../components/PwaInstallButton';
import availableDatesHi from '../data/availableDates-hi.json';
import styles from './index.module.css';

const languages = [
  { id: 'hi', label: 'हिंदी' },
  { id: 'en', label: 'English' },
];

const buildPravachanUrl = (date, lang) => `/pravachans/${lang}/${date}.md`;
const DATE_REFERENCE_YEAR = 2024;

const getLocalizedText = (selectedLang) => ({
  loading: selectedLang === 'en' ? 'Loading...' : 'लोड हो रहा है...',
  noDate: selectedLang === 'en' ? 'No available date found.' : 'कोई उपलब्ध दिनांक नहीं मिला।',
  unavailable: selectedLang === 'en'
    ? 'Pravachan is not available for this date. Please try another language or date.'
    : 'इस तारीख के लिए प्रवचन उपलब्ध नहीं है। कृपया कोई दूसरी भाषा या तारीख चुनें।',
  emptyState: selectedLang === 'en' ? 'Coming soon' : 'जल्द आ रहा है',
  splash: selectedLang === 'en' ? 'Loading pravachan collection...' : 'प्रवचन संग्रह लोड हो रहा है...',
  dateLabel: selectedLang === 'en' ? 'Date' : 'तारीख',
  languageLabel: selectedLang === 'en' ? 'Language' : 'भाषा',
  monthLabel: selectedLang === 'en' ? 'Month' : 'माह',
  calendarSubtitle: selectedLang === 'en' ? 'Choose an available day' : 'उपलब्ध दिन चुनें',
  prevButton: selectedLang === 'en' ? '← Previous' : '← पिछला',
  nextButton: selectedLang === 'en' ? 'Next →' : 'अगला →',
  heroTitle: selectedLang === 'en' ? 'Pravachan collection' : 'प्रवचन संग्रह',
  heroDescription: selectedLang === 'en'
    ? 'Choose a date and language to read the pravachan.'
    : 'तारीख और भाषा चुनें। वर्तमान तारीख के लिए प्रवचन पहले दिखाया जाएगा।',
});

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

const monthLabels = Array.from({ length: 12 }, (_, index) =>
  new Date(2024, index, 1).toLocaleDateString('hi-IN', { month: 'long' }),
);

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
                {formatDate(selectedDate)}
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
                  {['रवि', 'सोम', 'मंग', 'बुध', 'गुरु', 'शुक्र', 'शनि'].map((day) => (
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
              onChange={(e) => setSelectedLang(e.target.value)}
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
            <h2>{formatDate(selectedDate)}</h2>
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
