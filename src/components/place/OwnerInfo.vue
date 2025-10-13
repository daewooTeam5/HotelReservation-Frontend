<template>
  <div class="pt-6 border-t mt-6">
    <h3 class="text-lg font-semibold mb-4">판매자 정보</h3>

    <div v-if="isLoading" class="flex justify-center py-8">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <div v-else-if="isError" class="text-red-500 text-sm">
      판매자 정보를 불러오는데 실패했습니다.
    </div>

    <div v-else-if="ownerData" class="space-y-4">
      <div class="flex items-start gap-4 bg-white rounded-lg p-4">
        <div class="flex-shrink-0">
          <div v-if="ownerData.profileUrl" class="w-16 h-16 rounded-full overflow-hidden ">
            <img
              :src="ownerData.profileUrl"
              :alt="ownerData.name"
              class="w-full h-full object-cover"
            />
          </div>
          <Gravatar
            v-else-if="ownerData.email"
            :email="ownerData.email as `${string}@${string}.${string}`"
            :size="80"
            default="identicon"
            class="rounded-full "
          />
          <div v-else class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center ">
            <i class="pi pi-user text-2xl text-emerald-600"></i>
          </div>
        </div>

        <div class="flex-1">
          <div class="flex items-center gap-2 mb-3">
            <h4 class="font-bold text-xl text-gray-800">{{ ownerData.name }}</h4>
            <Tag v-if="ownerData.status === 'APPROVED'" value="인증됨" severity="success" rounded class="text-xs" />
          </div>

          <div class="space-y-2 text-sm">
            <div v-if="ownerData.email" class="flex items-center gap-2 text-gray-600">
              <div class="w-6 h-6  rounded-full flex items-center justify-center">
                <i class="pi pi-envelope text-emerald-600 text-xs"></i>
              </div>
              <span>{{ ownerData.email }}</span>
            </div>

            <div v-if="ownerData.phone" class="flex items-center gap-2 text-gray-600">
              <div class="w-6 h-6  rounded-full flex items-center justify-center">
                <i class="pi pi-phone text-emerald-600 text-xs"></i>
              </div>
              <span>{{ ownerData.phone }}</span>
            </div>

            <div v-if="ownerData.businessNumber" class="flex items-center gap-2 text-gray-600">
              <div class="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                <i class="pi pi-building text-emerald-600 text-xs"></i>
              </div>
              <span>사업자번호: {{ ownerData.businessNumber }}</span>
            </div>

            <div v-if="ownerData.businessName" class="flex items-center gap-2 text-gray-600">
              <div class="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                <i class="pi pi-briefcase text-emerald-600 text-xs"></i>
              </div>
              <span>{{ ownerData.businessName }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="ownerData.description" class="text-sm text-gray-700 p-4 bg-white rounded-lg border-l-4 border-emerald-400">
        <div class="flex items-start gap-2">
          <i class="pi pi-comment text-emerald-600 mt-0.5"></i>
          <p class="whitespace-pre-wrap flex-1">{{ ownerData.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';
import { Gravatar } from '@sauromates/vue-gravatar';

interface OwnerInfo {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  businessNumber?: string;
  businessName?: string;
  status?: string;
  description?: string;
  profileUrl?: string;
}

const props = defineProps<{
  placeId: string | number;
}>();

const { isLoading, isError, data } = useQuery<ApiResult<OwnerInfo>>({
  queryKey: computed(() => ['v1', 'places', props.placeId, 'owner']),
  queryFn: httpFetcher,
  enabled: computed(() => !!props.placeId),
});

const ownerData = computed(() => data.value?.data ?? null);
</script>

<style scoped>
</style>
