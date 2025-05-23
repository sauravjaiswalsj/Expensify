package com.tracker.expenses.money.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class Response<T,V> implements Serializable {

    private transient T header;

    private transient V methodBody;

    /**
     * Creates a Response with the specified header.
     *
     * @param header the header data for the response
     */
    public Response(T header) {
        this.header = header;
    }

    /**
     * Creates a new Response with the specified header and method body.
     *
     * @param header the header data for the response
     * @param methodBody the body content of the response
     */
    public Response(T header, V methodBody) {
        this.header = header;
        this.methodBody = methodBody;
    }
}
