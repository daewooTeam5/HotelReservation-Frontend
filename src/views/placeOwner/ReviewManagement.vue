<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">리뷰 관리</h1>

    <!-- 검색/필터/정렬 바 -->
    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <!-- 검색 -->
      <div>
        <label class="block text-sm font-medium mb-1">검색</label>
        <InputText v-model="searchQuery" placeholder="고객명 / 리뷰 내용" />
      </div>

      <!-- 평점 필터 -->
      <div>
        <label class="block text-sm font-medium mb-1">평점 필터</label>
        <Dropdown v-model="ratingFilter" :options="ratingOptions" placeholder="전체" />
      </div>

      <!-- 정렬 -->
      <div>
        <label class="block text-sm font-medium mb-1">정렬</label>
        <Dropdown v-model="sortOption" :options="sortOptions" placeholder="선택" />
      </div>
    </div>

    <!-- 리뷰 목록 테이블 -->
    <div class="bg-white rounded shadow p-4">
      <h2 class="text-lg font-semibold mb-4">리뷰 목록</h2>
      <table class="w-full border-collapse">
        <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border">리뷰 ID</th>
          <th class="p-2 border">고객명</th>
          <th class="p-2 border">객실</th>
          <th class="p-2 border">평점</th>
          <th class="p-2 border">내용</th>
          <th class="p-2 border">작성일</th>
          <th class="p-2 border text-center">액션</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="review in filteredReviews" :key="review.id">
          <td class="p-2 border">{{ review.id }}</td>
          <td class="p-2 border">{{ review.customer }}</td>
          <td class="p-2 border">{{ review.room }}</td>
          <td class="p-2 border">{{ "★".repeat(review.rating) }}</td>
          <td class="p-2 border">{{ review.content }}</td>
          <td class="p-2 border">{{ review.date }}</td>
          <td class="p-2 border text-center space-x-2">
            <Button
              icon="pi pi-comment"
              class="p-button-text p-button-sm"
              @click="openReplyDialog(review)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              @click="deleteReview(review.id)"
            />
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 답글 다이얼로그 -->
    <Dialog
      v-model:visible="isReplyDialogOpen"
      modal
      header="리뷰 답글"
      :style="{ width: '500px' }"
    >
      <div>
        <p class="mb-2 text-gray-600">고객: {{ currentReview?.customer }}</p>
        <p class="mb-4 text-gray-600">리뷰: "{{ currentReview?.content }}"</p>
        <Textarea v-model="replyText" rows="4" class="w-full" placeholder="답글을 입력하세요..." />
      </div>

      <template #footer>
        <Button label="취소" class="p-button-text" @click="isReplyDialogOpen = false" />
        <Button label="저장" icon="pi pi-check" class="p-button-primary" @click="saveReply" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";

// 상태
const searchQuery = ref("");
const ratingFilter = ref("");
const sortOption = ref("");

// 더미 리뷰 데이터
const reviews = ref([
  {
    id: "RV-001",
    customer: "홍길동",
    room: "101",
    rating: 5,
    content: "아주 만족스러운 숙박이었습니다.",
    date: "2025-09-16",
  },
  {
    id: "RV-002",
    customer: "김철수",
    room: "202",
    rating: 3,
    content: "시설은 좋았지만 소음이 있었습니다.",
    date: "2025-09-15",
  },
  {
    id: "RV-003",
    customer: "이영희",
    room: "301",
    rating: 4,
    content: "서비스가 친절했어요.",
    date: "2025-09-14",
  },
]);

// 필터 + 검색 + 정렬
const filteredReviews = computed(() => {
  let result = [...reviews.value];

  // 검색
  if (searchQuery.value) {
    result = result.filter(
      (r) =>
        r.customer.includes(searchQuery.value) ||
        r.content.includes(searchQuery.value)
    );
  }

  // 평점 필터
  if (ratingFilter.value === "5점") {
    result = result.filter((r) => r.rating === 5);
  } else if (ratingFilter.value === "4점 이상") {
    result = result.filter((r) => r.rating >= 4);
  } else if (ratingFilter.value === "3점 이하") {
    result = result.filter((r) => r.rating <= 3);
  }

  // 정렬
  if (sortOption.value === "평점↑") {
    result.sort((a, b) => a.rating - b.rating);
  } else if (sortOption.value === "평점↓") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortOption.value === "작성일") {
    result.sort((a, b) => b.date.localeCompare(a.date));
  }

  return result;
});

// 옵션
const ratingOptions = ["5점", "4점 이상", "3점 이하"];
const sortOptions = ["평점↑", "평점↓", "작성일"];

// 답글 상태
const isReplyDialogOpen = ref(false);
const currentReview = ref<any>(null);
const replyText = ref("");

// 답글 열기
const openReplyDialog = (review: any) => {
  currentReview.value = review;
  replyText.value = "";
  isReplyDialogOpen.value = true;
};

// 답글 저장
const saveReply = () => {
  alert(`답글 저장됨: ${replyText.value}`);
  isReplyDialogOpen.value = false;
};

// 리뷰 삭제
const deleteReview = (id: string) => {
  if (confirm("정말 이 리뷰를 삭제 요청하시겠습니까?")) {
    reviews.value = reviews.value.filter((r) => r.id !== id);
  }
};
</script>
