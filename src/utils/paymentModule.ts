import { loadTossPayments,ANONYMOUS } from "@tosspayments/tosspayments-sdk"
export const tossPayments = await loadTossPayments("test_ck_GjLJoQ1aVZPv6JLbkjxw8w6KYe2R");
// export const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
