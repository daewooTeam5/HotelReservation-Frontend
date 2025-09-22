<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">문의 관리</h1>

    <!-- 검색/필터/정렬 바 -->
    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <!-- 검색 -->
      <div>
        <label class="block text-sm font-medium mb-1">검색</label>
        <InputText v-model="searchQuery" placeholder="고객명 / 제목" />
      </div>

      <!-- 상태 필터 -->
      <div>
        <label class="block text-sm font-medium mb-1">상태</label>
        <Dropdown v-model="statusFilter" :options="statusOptions" placeholder="전체" />
      </div>

      <!-- 정렬 -->
      <div>
        <label class="block text-sm font-medium mb-1">정렬</label>
        <Dropdown v-model="sortOption" :options="sortOptions" placeholder="선택" />
      </div>
    </div>

    <!-- 문의 목록 테이블 -->
    <div class="bg-white rounded shadow p-4">
      <h2 class="text-lg font-semibold mb-4">문의 목록</h2>
      <table class="w-full border-collapse">
        <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border">문의 ID</th>
          <th class="p-2 border">고객명</th>
          <th class="p-2 border">제목</th>
          <th class="p-2 border">상태</th>
          <th class="p-2 border">등록일</th>
          <th class="p-2 border text-center">액션</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="inquiry in filteredInquiries" :key="inquiry.id">
          <td class="p-2 border">{{ inquiry.id }}</td>
          <td class="p-2 border">{{ inquiry.customer }}</td>
          <td class="p-2 border">{{ inquiry.title }}</td>
          <td class="p-2 border">
              <span
                :class="inquiry.status === '답변 대기' ? 'text-red-500' : 'text-green-600'"
              >
                {{ inquiry.status }}
              </span>
          </td>
          <td class="p-2 border">{{ inquiry.date }}</td>
          <td class="p-2 border text-center space-x-2">
            <Button
              label="상태 변경"
              icon="pi pi-refresh"
              class="p-button-text p-button-sm"
              @click="toggleStatus(inquiry)"
            />
            <Button
              label="채팅"
              icon="pi pi-comments"
              class="p-button-text p-button-sm"
              @click="startChat(inquiry.customer)"
            />
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 채팅 모달 -->
    <Dialog
      v-model:visible="isChatOpen"
      modal
      header="고객과 채팅"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-col h-64">
        <div class="flex-1 overflow-y-auto border p-2 bg-gray-50 mb-2">
          <div v-for="(msg, i) in chatMessages" :key="i" class="mb-2">
            <span class="font-bold">{{ msg.sender }}:</span>
            <span class="ml-2">{{ msg.text }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <InputText v-model="chatInput" class="flex-1" placeholder="메시지를 입력하세요" />
          <Button label="전송" icon="pi pi-send" class="p-button-primary" @click="sendMessage" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Dialog from "primevue/dialog";

// 상태
const searchQuery = ref("");
const statusFilter = ref("");
const sortOption = ref("");

// 더미 데이터
const inquiries = ref([
  {
    id: "Q-001",
    customer: "홍길동",
    title: "체크인 시간 문의",
    status: "답변 대기",
    date: "2025-09-16",
  },
  {
    id: "Q-002",
    customer: "김철수",
    title: "주차 가능 여부",
    status: "답변 완료",
    date: "2025-09-15",
  },
  {
    id: "Q-003",
    customer: "이영희",
    title: "추가 요금 문의",
    status: "답변 대기",
    date: "2025-09-14",
  },
]);

// 필터 + 검색 + 정렬
const filteredInquiries = computed(() => {
  let result = [...inquiries.value];

  // 검색
  if (searchQuery.value) {
    result = result.filter(
      (i) =>
        i.customer.includes(searchQuery.value) ||
        i.title.includes(searchQuery.value)
    );
  }

  // 상태 필터
  if (statusFilter.value) {
    result = result.filter((i) => i.status === statusFilter.value);
  }

  // 정렬
  if (sortOption.value === "등록일") {
    result.sort((a, b) => b.date.localeCompare(a.date));
  } else if (sortOption.value === "상태") {
    result.sort((a, b) => a.status.localeCompare(b.status));
  }

  return result;
});

// 옵션
const statusOptions = ["답변 대기", "답변 완료"];
const sortOptions = ["등록일", "상태"];

// 상태 변경
const toggleStatus = (inquiry: any) => {
  inquiry.status = inquiry.status === "답변 대기" ? "답변 완료" : "답변 대기";
};

// 채팅 상태
const isChatOpen = ref(false);
const chatWith = ref("");
const chatMessages = ref<{ sender: string; text: string }[]>([]);
const chatInput = ref("");

// 채팅 시작
const startChat = (customer: string) => {
  chatWith.value = customer;
  isChatOpen.value = true;
  chatMessages.value = [
    { sender: customer, text: "안녕하세요, 문의드립니다." },
    { sender: "관리자", text: "네, 무엇을 도와드릴까요?" },
  ];
};

// 메시지 전송
const sendMessage = () => {
  if (chatInput.value.trim()) {
    chatMessages.value.push({ sender: "관리자", text: chatInput.value });
    chatInput.value = "";
  }
};
</script>
