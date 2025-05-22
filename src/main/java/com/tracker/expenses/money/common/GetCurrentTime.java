package com.tracker.expenses.money.common;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class GetCurrentTime {
    public static Date convertLocalDateTimeToDate() {
        return Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
    }
}
