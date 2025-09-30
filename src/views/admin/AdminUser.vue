<template>
  <div> <div v-if="!hasPermission" class="text-center text-red-600 text-lg py-10">
    이 페이지에 접근할 권한이 없습니다.
  </div>

    <div v-else class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">유저 관리</h1>
      </div>

      <Tabs v-model:value="activeTab">
        <TabList>
          <Tab value="customer">사용자</Tab>
          <Tab value="hotel_owner">숙소 오너</Tab>
          <Tab value="admin">관리자</Tab>
          <Tab value="owner_request">오너 요청</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="customer">
            <DataTable :value="filteredUsers('customer')" responsiveLayout="scroll" class="mt-4 cursor-pointer" rowHover @row-click="goToDetail">
              <Column field="id" header="아이디" style="min-width: 80px" />
              <Column header="이메일" style="min-width: 200px">
                <template #body="slotProps"><span>{{ slotProps.data.email }}</span></template>
              </Column>
              <Column field="name" header="이름" style="min-width: 150px" />
              <Column field="role" header="권한" style="min-width: 120px">
                <template #body="slotProps">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getRoleClass(slotProps.data.role)">
                    {{ translateRole(slotProps.data.role) }}
                  </span>
                </template>
              </Column>
              <Column field="status" header="상태" style="min-width: 200px">
                <template #body="slotProps">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getStatusClass(slotProps.data.status)">
                    {{ translateStatus(slotProps.data.status) }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </TabPanel>

          <TabPanel value="hotel_owner">
            <DataTable :value="filteredUsers('hotel_owner')" responsiveLayout="scroll" class="mt-4 cursor-pointer" rowHover @row-click="goToDetail">
              <Column field="id" header="아이디" style="min-width: 80px" />
              <Column field="email" header="이메일" style="min-width: 200px" />
              <Column field="name" header="이름" style="min-width: 150px" />
              <Column field="role" header="권한" style="min-width: 120px">
                <template #body="slotProps">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getRoleClass(slotProps.data.role)">
                    {{ translateRole(slotProps.data.role) }}
                  </span>
                </template>
              </Column>
              <Column field="status" header="상태" style="min-width: 200px">
                <template #body="slotProps">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getStatusClass(slotProps.data.status)">
                    {{ translateStatus(slotProps.data.status) }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </TabPanel>

          <TabPanel value="admin">
            <DataTable :value="filteredUsers('admin')" responsiveLayout="scroll" class="mt-4 cursor-pointer" rowHover @row-click="goToDetail">
              <Column field="id" header="아이디" style="min-width: 80px" />
              <Column header="이메일 / ID" style="min-width: 200px">
                <template #body="slotProps">
                  <span>{{ slotProps.data.role === 'admin' ? slotProps.data.userId : slotProps.data.email }}</span>
                </template>
              </Column>
              <Column field="name" header="이름" style="min-width: 150px" />
              <Column field="role" header="권한" style="min-width: 120px">
                <template #body="slotProps">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getRoleClass(slotProps.data.role)">
                    {{ translateRole(slotProps.data.role) }}
                  </span>
                </template>
              </Column>
              <Column field="status" header="상태" style="min-width: 200px">
                <template #body="slotProps">
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getStatusClass(slotProps.data.status)">
                      {{ translateStatus(slotProps.data.status) }}
                    </span>
                    <template v-if="userRole === 'admin' && ['place_admin', 'user_admin'].includes(slotProps.data.role) && slotProps.data.status === 'inactive'">
                      <button class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200" @click.stop="allowUser(slotProps.data.id)">허용</button>
                      <button class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200" @click.stop="cancelUser(slotProps.data.id)">취소</button>
                    </template>
                  </div>
                </template>
              </Column>
            </DataTable>
          </TabPanel>

          <TabPanel value="owner_request">
            <DataTable :value="ownerRequests" responsiveLayout="scroll" class="mt-4 cursor-pointer" rowHover @row-click="handleOwnerRequestClick">
              <Column field="id" header="아이디" style="min-width: 80px" />
              <Column field="email" header="이메일" style="min-width: 200px" />
              <Column field="name" header="이름" style="min-width: 150px" />
              <Column field="businessNumber" header="사업자번호" style="min-width: 150px" />
              <Column field="ownerRequestStatus" header="요청 상태" style="min-width: 120px">
                <template #body="slotProps">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getOwnerRequestStatusClass(slotProps.data.ownerRequestStatus)">
                    {{ translateOwnerRequestStatus(slotProps.data.ownerRequestStatus) }}
                  </span>
                </template>
              </Column>
              <Column field="rejectionReason" header="관리자 답변" style="min-width: 150px">
                <template #body="slotProps">
                  <span>{{ slotProps.data.rejectionReason || '없음' }}</span>
                </template>
              </Column>
              <Column header="첨부파일" style="min-width: 100px">
                <template #body="slotProps">
                  <span>{{ slotProps.data.ownerRequestFiles.length }}개</span>
                </template>
              </Column>
            </DataTable>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <PrimeDialog v-model:visible="isModalVisible" modal header="오너십 요청 검토" :style="{ width: '40vw' }">
      <div v-if="selectedRequest" class="flex flex-col gap-4">
        <div>
          <h3 class="font-semibold text-lg mb-2">요청자 정보</h3>
          <div class="text-sm space-y-1">
            <p><strong>이름:</strong> {{ selectedRequest.name }}</p>
            <p><strong>이메일:</strong> {{ selectedRequest.email }}</p>
            <p><strong>연락처:</strong> {{ selectedRequest.phone }}</p>
            <p><strong>사업자번호:</strong> {{ selectedRequest.businessNumber }}</p>
          </div>
        </div>
        <div v-if="selectedRequest.ownerRequestFiles.length > 0">
          <h3 class="font-semibold text-lg mb-2">첨부 파일</h3>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="file in selectedRequest.ownerRequestFiles" :key="file">
              <a :href="file" target="_blank" class="text-blue-600 hover:underline">{{ file.split('/').pop() }}</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-lg mb-2">관리자 답변 (거절 시 필수)</h3>
          <PrimeTextarea v-model="rejectionReasonInput" rows="3" class="w-full" placeholder="요청 거절 시 사유를 입력해주세요." />
        </div>
      </div>
      <template #footer>
        <PrimeButton label="요청 거절" icon="pi pi-times" severity="danger" @click="rejectOwnerRequest" :disabled="!rejectionReasonInput.trim()" />
        <PrimeButton label="요청 승인" icon="pi pi-check" severity="success" @click="approveOwnerRequest" autofocus />
      </template>
    </PrimeDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from "@/utils/axiosClient";

// PrimeVue 컴포넌트 임포트
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import PrimeDialog from 'primevue/dialog';
import PrimeTextarea from 'primevue/textarea';
import PrimeButton from 'primevue/button';

const router = useRouter();

// --- 권한 확인 로직 ---
const authStore = useAuthStore();
const token = authStore.accessToken;

const userRole = computed(() => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // 'sub' 클레임이 JSON 문자열일 경우 한 번 더 파싱
    const sub = JSON.parse(payload.sub);
    return sub.role;
  } catch (e) {
    console.error("JWT 파싱 실패:", e);
    return null;
  }
});

const userStatus = computed(() => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const sub = JSON.parse(payload.sub);
    return sub.status;
  } catch {
    return null;
  }
});

const hasPermission = computed(() => {
  return (
    userRole.value &&
    ['admin', 'user_admin'].includes(userRole.value) &&
    userStatus.value === 'active'
  );
});
// --- 타입 정의 ---
interface UserResponse {
  id: number;
  userId: string;
  email: string;
  name: string;
  role: string;
  status: string;
}
interface OwnerRequestResponse {
  id: number;
  ownerRequestId: number;
  userId: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  ownerRequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  businessNumber: string;
  ownerRequestFiles: string[];
}

// --- 상태 변수 ---
const users = ref<UserResponse[]>([]);
const ownerRequests = ref<OwnerRequestResponse[]>([]);
const activeTab = ref("customer");
const isModalVisible = ref(false);
const selectedRequest = ref<OwnerRequestResponse | null>(null);
const rejectionReasonInput = ref('');

// --- 데이터 필터링 ---
const filteredUsers = (role: string) => {
  if (role === "admin") {
    return users.value.filter((u) => ["admin", "place_admin", "user_admin"].includes(u.role));
  }
  return users.value.filter((u) => u.role === role);
};

// --- 이벤트 핸들러 ---
const handleOwnerRequestClick = (event: any) => {
  const requestData = event.data as OwnerRequestResponse;
  if (requestData.ownerRequestStatus === 'PENDING') {
    selectedRequest.value = requestData;
    rejectionReasonInput.value = '';
    isModalVisible.value = true;
  } else {
    goToDetail(event);
  }
};

const goToDetail = (event: any) => {
  router.push({ name: "admin-user-detail", params: { id: event.data.id } });
};

const allowUser = async (userId: number) => {
  await apiClient.patch(`/v1/admin/users/${userId}/allow`);
  await fetchUsers();
};

const cancelUser = async (userId: number) => {
  await apiClient.patch(`/v1/admin/users/${userId}/cancel`);
  await fetchUsers();
};

const approveOwnerRequest = async () => {
  if (!selectedRequest.value) return;
  try {
    await apiClient.patch(`/v1/admin/users/owner-requests/${selectedRequest.value.ownerRequestId}/approve`);
    alert('요청이 승인되었습니다.');
  } catch (err) {
    console.error('오너 요청 승인 실패:', err);
    alert('처리 중 오류가 발생했습니다.');
  } finally {
    isModalVisible.value = false;
    await Promise.all([fetchOwnerRequests(), fetchUsers()]);
  }
};

const rejectOwnerRequest = async () => {
  if (!selectedRequest.value || !rejectionReasonInput.value.trim()) {
    alert('거절 사유를 입력해야 합니다.');
    return;
  }
  try {
    await apiClient.patch(`/v1/admin/users/owner-requests/${selectedRequest.value.ownerRequestId}/reject`, {
      reason: rejectionReasonInput.value
    });
    alert('요청이 거절되었습니다.');
  } catch (err) {
    console.error('오너 요청 거절 실패:', err);
    alert('처리 중 오류가 발생했습니다.');
  } finally {
    isModalVisible.value = false;
    await fetchOwnerRequests();
  }
};

// --- API 호출 ---
const fetchUsers = async () => {
  try {
    const res = await apiClient.get("/v1/admin/users", { params: { start: 0, size: 20 } });
    users.value = res.data.data.content;
  } catch(e) { console.error("유저 목록 조회 실패:", e); }
};

const fetchOwnerRequests = async () => {
  try {
    const res = await apiClient.get("/v1/admin/users/owner-requests");
    ownerRequests.value = res.data.data;
  } catch(e) { console.error("오너 요청 목록 조회 실패:", e); }
};

// --- 생명 주기 ---
onMounted(async () => {
  if (hasPermission.value) {
    await Promise.all([ fetchUsers(), fetchOwnerRequests() ]);
  }
});

// --- Helper 함수 (스타일 & 번역) ---
const getRoleClass = (role: string) => {
  const map: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800",
    place_admin: "bg-purple-100 text-purple-800",
    user_admin: "bg-purple-100 text-purple-800",
    hotel_owner: "bg-blue-100 text-blue-800",
    customer: "bg-green-100 text-green-800",
  };
  return map[role] || "bg-gray-100 text-gray-800";
};

const translateRole = (role: string) => {
  const map: Record<string, string> = {
    admin: "관리자",
    place_admin: "전체 숙소 관리자",
    user_admin: "전체 유저 관리자",
    hotel_owner: "숙소 오너",
    customer: "사용자",
  };
  return map[role] || role;
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-yellow-100 text-yellow-800",
    banned: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    active: "활성",
    inactive: "비활성",
    banned: "정지",
  };
  return map[status] || status;
};

const getOwnerRequestStatusClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const translateOwnerRequestStatus = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "승인 대기",
    APPROVED: "승인 완료",
    REJECTED: "승인 거절",
  };
  return map[status] || status;
};
</script>
