package com.phonestore.config;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class ResponseWrapper extends HttpServletResponseWrapper {

    private final ByteArrayOutputStream capture;
    private ServletOutputStream outputStream;
    private PrintWriter writer;

    public ResponseWrapper(HttpServletResponse response) {
        super(response);
        this.capture = new ByteArrayOutputStream();
    }

    @Override
    public ServletOutputStream getOutputStream() {
        if (writer != null) {
            throw new IllegalStateException("getWriter() has already been called on this response.");
        }

        if (outputStream == null) {
            outputStream = new ServletOutputStream() {
                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setWriteListener(WriteListener writeListener) {
                    throw new UnsupportedOperationException();
                }

                @Override
                public void write(int b) throws IOException {
                    capture.write(b);
                    ResponseWrapper.super.getOutputStream().write(b);
                }
            };
        }

        return outputStream;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        if (outputStream != null) {
            throw new IllegalStateException("getOutputStream() has already been called on this response.");
        }

        if (writer == null) {
            writer = new PrintWriter(new OutputStreamWriter(capture, StandardCharsets.UTF_8)) {
                @Override
                public void flush() {
                    try {
                        ResponseWrapper.super.getWriter().write(capture.toString(StandardCharsets.UTF_8.name()));
                        ResponseWrapper.super.getWriter().flush();
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    super.flush();
                }

                @Override
                public void close() {
                    flush();
                    super.close();
                }
            };
        }

        return writer;
    }

    public String getBody() {
        if (writer != null) {
            writer.flush();
        }
        return capture.toString(StandardCharsets.UTF_8);
    }

    public byte[] getBodyAsBytes() {
        return capture.toByteArray();
    }
}
