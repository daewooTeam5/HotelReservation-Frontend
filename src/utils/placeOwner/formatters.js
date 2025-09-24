// src/utils/formatters.js
export const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatCurrency = (value) => {
  if (value == null) return "";
  return `${Number(value).toLocaleString("ko-KR")}원`;
};

export const translateStatus = (status) => {
  const map = {
    pending: "대기",
    confirmed: "확정",
    cancelled: "취소",
    checked_in: "체크인",
    checked_out: "체크아웃",
  };
  return map[status] || status;
};

export const translatePaymentStatus = (status) => {
  const map = {
    unpaid: "미결제",
    paid: "결제완료",
    refunded: "환불"
  };
  return map[status] || status;
};
