package com.tracker.expenses.money.common;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class GetCurrentTime {
    /**
     * Returns the current date and time as a {@link Date} object using the system default time zone.
     *
     * @return the current date and time as a {@code java.util.Date}
     */
    public static Date convertLocalDateTimeToDate() {
        return Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
    }
}
