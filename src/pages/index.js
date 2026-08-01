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

const parseDateParts = (dateKey) => {
  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateKey);
  if (isoMatch) {
    return { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) };
  }

  const shortMatch = /^([0-9]{2})-([0-9]{2})$/.exec(dateKey);
  if (shortMatch) {
    return { year: new Date().getFullYear(), month: Number(shortMatch[1]), day: Number(shortMatch[2]) };
  }

  return null;
};

const formatDateLabel = (dateKey, locale = 'hi-IN') => {
  const parts = parseDateParts(dateKey);
  if (!parts) {
    return dateKey;
  }
  return new Date(parts.year, parts.month - 1, parts.day).toLocaleDateString(locale, {
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

const availableDates = Array.isArray(availableDatesHi) ? availableDatesHi : [];
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

  useEffect(() => {
    const loadPravachan = async () => {
      if (!selectedDate) {
        setError('कोणताही उपलब्ध दिनांक सापडला नाही.');
        return;
      }

      setLoading(true);
      setError('');
      setContent('');
      try {
        const text = await fetchPravachan(selectedDate, selectedLang);
        setContent(text);
      } catch (err) {
        setError('प्रवचन उपलब्ध नाही. कृपया दुसरी भाषा किंवा इतर दिनांक निवडा.');
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

  const currentIndex = availableDates.indexOf(selectedDate);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < availableDates.length - 1;

  const monthDays = getMonthDays(selectedMonth);
  const firstDayIndex = getFirstDayIndex(selectedMonth);
  const monthAvailableDays = new Set(availableDatesByMonth[selectedMonth] || []);

  return (
    <Layout title="प्रवचन संग्रह" description="दिनांक व भाषा निवडा आणि प्रवचन वाचा.">
      <main className={styles.page}>
        <PwaInstallButton />

        <section className={styles.hero}>
          <div>
            <h1>प्रवचन संग्रह</h1>
            <p>दिनांक व भाषा निवडा. वर्तमान दिनांकासाठी प्रवचन सर्वप्रथम दर्शवा.</p>
          </div>
        </section>

        <section className={styles.controls}>
          <div className={styles.datePickerWrapper}>
            <div className={styles.controlGroup}>
              <label htmlFor="date-picker">दिनांक</label>
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
                    <div className={styles.calendarSubtitle}>उपलब्ध दिवस निवडा</div>
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
                    महिना
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
            <label htmlFor="lang-select">भाषा</label>
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

          {loading && <div className={styles.message}>लोड करत आहे...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && (
            <article className={styles.markdown}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          )}
        </section>

        <section className={styles.navButtonsSection}>
          <div className={styles.navButtons}>
            <button
              className={styles.navButton}
              onClick={() => hasPrev && setSelectedDate(availableDates[currentIndex - 1])}
              disabled={!hasPrev}
            >
              ← मागील
            </button>
            <button
              className={styles.navButton}
              onClick={() => hasNext && setSelectedDate(availableDates[currentIndex + 1])}
              disabled={!hasNext}
            >
              पुढील →
            </button>
          </div>
        </section>
      </main>
    </Layout>
  );
}
