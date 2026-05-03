package com.phonestore.config;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

public class ResponseWrapper extends HttpServletResponseWrapper {

    private final ByteArrayOutputStream capture;
    private TeeServletOutputStream teeStream;
    private PrintWriter writer;
    private boolean writerUsed = false;

    public ResponseWrapper(HttpServletResponse response) {
        super(response);
        this.capture = new ByteArrayOutputStream();
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        if (writerUsed) {
            throw new IllegalStateException("getWriter() has already been called on this response.");
        }

        if (teeStream == null) {
            teeStream = new TeeServletOutputStream(super.getOutputStream(), capture);
        }

        return teeStream;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        if (teeStream != null) {
            throw new IllegalStateException("getOutputStream() has already been called on this response.");
        }

        if (writer == null) {
            writerUsed = true;
            OutputStreamWriter osw = new OutputStreamWriter(capture, StandardCharsets.UTF_8);
            writer = new PrintWriter(osw, true);
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

    // Inner class to tee output to both capture and original stream
    private static class TeeServletOutputStream extends ServletOutputStream {
        private final ServletOutputStream original;
        private final ByteArrayOutputStream capture;

        TeeServletOutputStream(ServletOutputStream original, ByteArrayOutputStream capture) {
            this.original = original;
            this.capture = capture;
        }

        @Override
        public boolean isReady() {
            return original.isReady();
        }

        @Override
        public void setWriteListener(WriteListener writeListener) {
            original.setWriteListener(writeListener);
        }

        @Override
        public void write(int b) throws IOException {
            original.write(b);
            capture.write(b);
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException {
            original.write(b, off, len);
            capture.write(b, off, len);
        }
    }
}
