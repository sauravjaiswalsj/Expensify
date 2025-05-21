package com.tracker.expenses.money.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Response<T,V> implements Serializable {

    private T header;

    private V methodBody;
}
