const extractScheduleData = (calendarData: {
  items: any[];
}): Record<string, { className: string; location: string; time: string }[]> => {
  const scheduleData: Record<string, { className: string; location: string; time: string }[]> = {};

  calendarData.items.forEach((event) => {
    const date = event.start.dateTime.split('T')[0]; // Extract date part
    const startTime = new Date(event.start.dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    const endTime = new Date(event.end.dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const formattedEvent = {
      className: event.summary,
      location: event.location || 'Unknown Location',
      time: `${startTime} - ${endTime}`,
    };

    if (!scheduleData[date]) {
      scheduleData[date] = [];
    }

    scheduleData[date].push(formattedEvent);
  });

  return scheduleData;
};
