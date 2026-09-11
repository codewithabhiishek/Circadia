import { SleepEntry } from './types';
import {
  getNightSleepDuration,
  getTotalNapDuration,
  getTotalSleepDuration,
  formatDuration,
  formatTime,
  formatDate,
  getHoursAndMinutes,
} from './utils';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function getApiKey(): Promise<string | null> {
  return localStorage.getItem('grok-api-key');
}

export async function setApiKey(key: string): Promise<void> {
  localStorage.setItem('grok-api-key', key);
}

export async function clearApiKey(): Promise<void> {
  localStorage.removeItem('grok-api-key');
}

export async function analyzeSleepData(entries: SleepEntry[]): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return 'Please add your Grok API key in Settings to enable AI insights.';
  }

  if (entries.length === 0) {
    return 'No sleep data to analyze yet. Start logging your sleep!';
  }

  // Prepare data for analysis
  const analysisData = prepareAnalysisData(entries);
  
  // Create intelligent prompt
  const prompt = createAnalysisPrompt(analysisData);

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `You are a friendly, insightful sleep analyst with a casual, conversational tone. Analyze the user's sleep data and provide personalized observations.

YOUR STYLE:
- Be direct and casual, like a friend who notices things
- Reference specific numbers and dates from their data
- Point out patterns they might not notice themselves
- Be honest about what you see (good or bad)
- Keep it concise but insightful (3-6 sentences)

EXAMPLES OF GOOD RESPONSES:
"Whoa, you've been sleeping way more lately! Your last 7 days averaged 9h 30m compared to your overall average of 7h 45m - that's 22% more sleep. Also, you took 5 naps in the last week, which is pretty frequent. Your bedtime has been all over the place though, ranging from 11 PM to 3 AM."

"Your sleep has been pretty consistent lately, hovering around 8 hours. But I noticed you haven't taken any naps in the last 5 days, which is unusual for you - you normally nap about 60% of the time. Your wake times have been steady around 9-10 AM though."

"Interesting pattern here - you've been going to bed earlier and earlier over the last week, shifting from 2 AM to 11:30 PM. But your total sleep hasn't changed much because you're also waking up earlier. Your naps have been shorter too, averaging 30 minutes instead of your usual 1h 15m."

DO NOT:
- Give medical advice or diagnoses
- Tell them what they "should" do
- Be overly clinical or formal
- Make judgments about whether their sleep is "good" or "bad"

Just observe and report what you see in their data.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Grok API error:', error);
      return 'Unable to analyze data. Please check your API key and try again.';
    }

    const data: GrokResponse = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate insights.';
  } catch (error) {
    console.error('Error calling Grok API:', error);
    return 'Error connecting to AI service. Please try again later.';
  }
}

interface AnalysisData {
  totalEntries: number;
  dateRange: string;
  recentEntries: Array<{
    date: string;
    nightSleep: string;
    naps: string;
    totalSleep: string;
    bedtime: string;
    waketime: string;
  }>;
  averages: {
    nightSleep: string;
    naps: string;
    totalSleep: string;
  };
  recent7Days: {
    nightSleep: string;
    naps: string;
    totalSleep: string;
  };
  patterns: {
    bedtimeVariation: string;
    waketimeVariation: string;
    napFrequency: string;
  };
}

function prepareAnalysisData(entries: SleepEntry[]): AnalysisData {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  // Calculate averages
  const totalNight = sorted.reduce((sum, e) => sum + getNightSleepDuration(e.sleepStart, e.sleepEnd), 0);
  const totalNaps = sorted.reduce((sum, e) => sum + getTotalNapDuration(e.naps), 0);
  const totalSleep = sorted.reduce((sum, e) => sum + getTotalSleepDuration(e.sleepStart, e.sleepEnd, e.naps), 0);
  
  const avgNight = totalNight / sorted.length;
  const avgNaps = totalNaps / sorted.length;
  const avgTotal = totalSleep / sorted.length;

  // Recent 7 days
  const recent7 = sorted.slice(-7);
  const recent7Night = recent7.reduce((sum, e) => sum + getNightSleepDuration(e.sleepStart, e.sleepEnd), 0) / recent7.length;
  const recent7Naps = recent7.reduce((sum, e) => sum + getTotalNapDuration(e.naps), 0) / recent7.length;
  const recent7Total = recent7.reduce((sum, e) => sum + getTotalSleepDuration(e.sleepStart, e.sleepEnd, e.naps), 0) / recent7.length;

  // Bedtime and wake time variation
  const bedtimes = sorted.map(e => {
    const hm = getHoursAndMinutes(e.sleepStart);
    return hm.hours + hm.minutes / 60;
  });
  const waketimes = sorted.map(e => {
    const hm = getHoursAndMinutes(e.sleepEnd);
    return hm.hours + hm.minutes / 60;
  });
  
  const bedtimeVariation = Math.max(...bedtimes) - Math.min(...bedtimes);
  const waketimeVariation = Math.max(...waketimes) - Math.min(...waketimes);

  // Nap frequency
  const daysWithNaps = sorted.filter(e => e.naps.length > 0).length;
  const napFrequency = (daysWithNaps / sorted.length) * 100;

  // Recent entries detail
  const recentEntries = sorted.slice(-10).map(e => ({
    date: formatDate(e.date),
    nightSleep: formatDuration(getNightSleepDuration(e.sleepStart, e.sleepEnd)),
    naps: formatDuration(getTotalNapDuration(e.naps)),
    totalSleep: formatDuration(getTotalSleepDuration(e.sleepStart, e.sleepEnd, e.naps)),
    bedtime: formatTime(e.sleepStart),
    waketime: formatTime(e.sleepEnd),
  }));

  return {
    totalEntries: sorted.length,
    dateRange: `${formatDate(sorted[0].date)} to ${formatDate(sorted[sorted.length - 1].date)}`,
    recentEntries,
    averages: {
      nightSleep: formatDuration(Math.round(avgNight)),
      naps: formatDuration(Math.round(avgNaps)),
      totalSleep: formatDuration(Math.round(avgTotal)),
    },
    recent7Days: {
      nightSleep: formatDuration(Math.round(recent7Night)),
      naps: formatDuration(Math.round(recent7Naps)),
      totalSleep: formatDuration(Math.round(recent7Total)),
    },
    patterns: {
      bedtimeVariation: formatDuration(Math.round(bedtimeVariation * 60)),
      waketimeVariation: formatDuration(Math.round(waketimeVariation * 60)),
      napFrequency: `${Math.round(napFrequency)}% of days`,
    },
  };
}

function createAnalysisPrompt(data: AnalysisData): string {
  // Calculate if recent sleep is significantly different from average
  const recentTotalMinutes = parseDuration(data.recent7Days.totalSleep);
  const avgTotalMinutes = parseDuration(data.averages.totalSleep);
  const diffMinutes = recentTotalMinutes - avgTotalMinutes;
  const diffPercent = avgTotalMinutes > 0 ? Math.round((diffMinutes / avgTotalMinutes) * 100) : 0;

  let comparisonNote = '';
  if (Math.abs(diffPercent) > 10) {
    comparisonNote = `\n\nIMPORTANT: My recent sleep (${data.recent7Days.totalSleep}) is ${Math.abs(diffPercent)}% ${diffPercent > 0 ? 'MORE' : 'LESS'} than my overall average (${data.averages.totalSleep}). Please highlight this.`;
  }

  return `Here's my sleep data:

OVERVIEW:
- Total entries: ${data.totalEntries} days
- Date range: ${data.dateRange}

MY AVERAGES:
- Night sleep: ${data.averages.nightSleep}
- Naps: ${data.averages.naps}
- Total sleep: ${data.averages.totalSleep}

LAST 7 DAYS AVERAGE:
- Night sleep: ${data.recent7Days.nightSleep}
- Naps: ${data.recent7Days.naps}
- Total sleep: ${data.recent7Days.totalSleep}

PATTERNS:
- Bedtime variation: ${data.patterns.bedtimeVariation}
- Wake time variation: ${data.patterns.waketimeVariation}
- Nap frequency: ${data.patterns.napFrequency}

RECENT ENTRIES (last 10 days):
${data.recentEntries.map(e => `- ${e.date}: Night ${e.nightSleep}, Naps ${e.naps}, Total ${e.totalSleep} (Bed: ${e.bedtime}, Wake: ${e.waketime})`).join('\n')}${comparisonNote}

Please analyze this data and tell me what you notice. Be conversational and specific. Reference actual numbers and dates. Compare my recent sleep to my historical average. Point out:
- If I've been sleeping more or less than usual recently
- Any interesting patterns in my naps (too many? too long? not enough?)
- Whether my bedtime/wake time is consistent or all over the place
- Any unusual days that stand out
- General observations about my sleep patterns

Be direct and casual. Say things like "You slept way more yesterday" or "Your naps have been crazy lately" rather than clinical language.`;
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}
