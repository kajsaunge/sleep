// Skapar en kalenderfil (.ics) med en daglig påminnelse om att öppna Sleep.
// Anrop: /api/ics?t=20:45  (tid i användarens egen tidszon)
// Tiden skrivs som "lokal tid" i filen, så kalendern lägger den i den tidszon mobilen har.
module.exports = (req, res) => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(req.query.t || ''));
  if (!m) {
    res.status(400).send('Ange en tid som t=HH:MM');
    return;
  }
  const [hh, mm] = [m[1], m[2]];
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//kajsaunge//Sleep//SV',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:sleep-${hh}${mm}-${ymd}@sleep.kajsaunge.se`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${ymd}T${hh}${mm}00`,
    'DURATION:PT15M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Sleep – dags att varva ner',
    'DESCRIPTION:Andas in 4\\, håll 4\\, andas ut 8.\\nhttps://sleep.kajsaunge.se',
    'URL:https://sleep.kajsaunge.se',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Dags att varva ner',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="sleep-paminnelse.ics"');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(ics);
};
