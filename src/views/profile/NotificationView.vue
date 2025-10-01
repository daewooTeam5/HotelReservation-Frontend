<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { Page } from '@/types/Page.ts';
import type { Notification } from '@/types/notification.ts';
import type { ApiResult } from '@/types/ApiResult.ts';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import { apiClient } from '@/utils/axiosClient.ts';

const { isLoading, data, isError, error } = useQuery<ApiResult<Page<Notification>>>({
  queryKey: ['v1', 'notification', 'my'],
  queryFn: httpFetcher
});

// 알림 목록
const notifications = computed(() => data.value?.data?.content || []);

onMounted(async ()=>{
  const data  = await apiClient.post("/v1/notification/my/read")
  console.log(data);

})
// 알림 타입별 스타일 정의
const getNotificationStyle = (type: string) => {
  const styles = {
    'RESERVATION': {
      chipClass: 'bg-blue-100 text-blue-800 border-blue-200',
      iconClass: 'pi pi-calendar text-blue-600',
      bgClass: 'bg-blue-50 border-l-4 border-blue-500'
    },
    'CHECKIN': {
      chipClass: 'bg-green-100 text-green-800 border-green-200',
      iconClass: 'pi pi-sign-in text-green-600',
      bgClass: 'bg-green-50 border-l-4 border-green-500'
    },
    'CHECKOUT': {
      chipClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      iconClass: 'pi pi-sign-out text-yellow-600',
      bgClass: 'bg-yellow-50 border-l-4 border-yellow-500'
    },
    'COMMON': {
      chipClass: 'bg-gray-100 text-gray-800 border-gray-200',
      iconClass: 'pi pi-info-circle text-gray-600',
      bgClass: 'bg-gray-50 border-l-4 border-gray-500'
    },
    'AD': {
      chipClass: 'bg-purple-100 text-purple-800 border-purple-200',
      iconClass: 'pi pi-gift text-purple-600',
      bgClass: 'bg-purple-50 border-l-4 border-purple-500'
    },
    'ADMIN': {
      chipClass: 'bg-red-100 text-red-800 border-red-200',
      iconClass: 'pi pi-cog text-red-600',
      bgClass: 'bg-red-50 border-l-4 border-red-500'
    }
  };

  return styles[type as keyof typeof styles] || styles.COMMON;
};

// 알림 타입 한글명
const getNotificationTypeName = (type: string) => {
  const typeNames = {
    'RESERVATION': '예약',
    'CHECKIN': '체크인',
    'CHECKOUT': '체크아웃',
    'COMMON': '일반',
    'AD': '광고',
    'ADMIN': '관리자'
  };

  return typeNames[type as keyof typeof typeNames] || type;
};

// 시간 포맷팅
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? '방금 전' : `${minutes}분 전`;
    }
    return `${hours}시간 전`;
  } else if (days === 1) {
    return '어제';
  } else if (days < 7) {
    return `${days}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">알림</h1>
        <p class="text-gray-600">받은 알림을 확인하세요</p>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <ProgressSpinner />
        <span class="ml-3 text-gray-600">알림을 불러오는 중...</span>
      </div>

      <Message v-else-if="isError" severity="error" class="mb-4">
        알림을 불러오는데 실패했습니다. 다시 시도해주세요.
      </Message>

      <div v-else-if="notifications.length > 0" class="space-y-4">
        <Card
          v-for="notification in notifications"
          :key="notification.id"
          class="hover:shadow-lg transition-shadow duration-200 cursor-pointer mb-2!"
          :class="getNotificationStyle(notification.notificationType).bgClass"
        >
          <template #content>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <i :class="getNotificationStyle(notification.notificationType).iconClass"></i>
                    </div>
                  </div>

                  <Chip
                    :label="getNotificationTypeName(notification.notificationType)"
                    :class="getNotificationStyle(notification.notificationType).chipClass"
                    class="text-xs font-medium border"
                  />
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ notification.title }}
                </h3>

                <p class="text-gray-700 leading-relaxed mb-3">
                  {{ notification.content }}
                </p>

                <div class="flex items-center text-sm text-gray-500">
                  <i class="pi pi-clock mr-2"></i>
                  {{ formatDate(notification.createdAt) }}
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div v-else class="text-center py-12 text-gray-400">
        <i class="pi pi-bell-slash text-6xl mb-4"></i>
        <p>알림이 없습니다.</p>
      </div>
    </div>
  </div>
</template>
