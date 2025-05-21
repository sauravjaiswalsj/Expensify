package com.tracker.expenses.money.dto;

import io.netty.handler.codec.http.HttpResponseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.io.Serializable;

@Data
@AllArgsConstructor
public class ResponseHeader implements Serializable {
    private HttpStatus httpResponseStatus;
    private String responseMessage;
}
