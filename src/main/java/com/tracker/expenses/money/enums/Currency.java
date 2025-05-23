package com.tracker.expenses.money.enums;

public enum Currency {
    INR("Indian Rupee"),
    USD("United States Dollar"),
    EUR("Euro"),
    JPY("Japanese Yen"),
    GBP("British Pound Sterling"),
    AUD("Australian Dollar"),
    CAD("Canadian Dollar"),
    CHF("Swiss Franc"),
    CNY("Chinese Yuan Renminbi"),
    SEK("Swedish Krona"),
    NZD("New Zealand Dollar");
    
    private final String description;

    /****
     * Initializes a currency enum constant with its full name description.
     *
     * @param description the full name of the currency
     */
    Currency(String description) {
        this.description = description;
    }

    /**
     * Returns the full name of the currency represented by this enum constant.
     *
     * @return the currency's description
     */
    public String getDescription() {
        return description;
    }
}
