package com.tracker.expenses.money.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class Response<T,V> implements Serializable {

    private transient T header;

    private transient V methodBody;

    public Response(T header) {
        this.header = header;
    }

    public Response(T header, V methodBody) {
        this.header = header;
        this.methodBody = methodBody;
    }
}
