using NodaTime.TimeZones;
using NodaTime;

namespace WatchersWorld.Server.Services
{
    public interface ITimeZoneConverterService
    {
        DateTime? ConvertUtcToTimeZone(DateTime? utcDateTime, string timeZoneId);
    }

    public class TimeZoneConverterService : ITimeZoneConverterService
    {
        public DateTime? ConvertUtcToTimeZone(DateTime? utcDateTime, string timeZoneId)
        {
            if(utcDateTime == null) return null;

            var dateTimeZoneProvider = DateTimeZoneProviders.Tzdb;

            if (!dateTimeZoneProvider.Ids.Contains(timeZoneId) &&
                TzdbDateTimeZoneSource.Default.WindowsMapping.MapZones.Any(m => m.TzdbIds.Contains(timeZoneId)))
            {
                var mapZone = TzdbDateTimeZoneSource.Default.WindowsMapping.MapZones.FirstOrDefault(m => m.TzdbIds.Contains(timeZoneId));
                timeZoneId = mapZone?.WindowsId ?? timeZoneId;
            }

            var dateTimeZone = dateTimeZoneProvider[timeZoneId];

            DateTime utcDateTimeAfter = DateTime.SpecifyKind(utcDateTime.Value, DateTimeKind.Utc);
            var instant = Instant.FromDateTimeUtc(utcDateTimeAfter);
            var zonedDateTime = instant.InZone(dateTimeZone);
            return zonedDateTime.ToDateTimeUnspecified();
        }
    }
}
