package com.tracker.expenses.money.common;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class GetCurrentTime {
    /****
     * Returns the current date and time as a {@link java.util.Date} object.
     *
     * This method obtains the current local date and time using the system default time zone,
     * and converts it to a legacy {@code Date} instance.
     *
     * @return the current date and time as a {@code Date}
     */
    public static Date convertLocalDateTimeToDate() {
        return Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
    }
}
