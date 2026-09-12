package com.library.dto;

public class DTOs {

    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String phone;

        public RegisterRequest() {}
        public RegisterRequest(String name, String email, String password, String phone) {
            this.name = name;
            this.email = email;
            this.password = password;
            this.phone = phone;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class IssueRequest {
        private String userId;
        private String bookId;
        private Integer loanDays;

        public IssueRequest() {}
        public IssueRequest(String userId, String bookId, Integer loanDays) {
            this.userId = userId;
            this.bookId = bookId;
            this.loanDays = loanDays;
        }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getBookId() { return bookId; }
        public void setBookId(String bookId) { this.bookId = bookId; }

        public Integer getLoanDays() { return loanDays; }
        public void setLoanDays(Integer loanDays) { this.loanDays = loanDays; }
    }

    public static class QueryReplyRequest {
        private String reply;

        public QueryReplyRequest() {}
        public QueryReplyRequest(String reply) {
            this.reply = reply;
        }

        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
    }

    public static class StatusUpdateRequest {
        private String status;

        public StatusUpdateRequest() {}
        public StatusUpdateRequest(String status) {
            this.status = status;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
